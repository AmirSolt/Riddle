import type { Stripe } from 'stripe'
import { stripe } from '$lib/server/clients/stripe'
import { PRIVATE_WEBHOOK_SECRET } from '$env/static/private';
import { createCreditTransferAndUpdateProfile, getProfileById, getProfileByTwilioId } from '$lib/server/services/db.js';
import { CreditTransferReason, MessageDir, MessageType } from '@prisma/client';
import { sendSMS } from '$lib/server/services/chat.js';


function toBuffer(ab: ArrayBuffer): Buffer {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; i++) {
        buf[i] = view[i];
    }
    return buf;
}

export const POST = async ({ locals, request }) => {
    let data: Stripe.Event.Data | null = null;
    let eventType: string | null = null;
    const config = locals.config

    const _rawBody = await request.arrayBuffer();
    const payload = toBuffer(_rawBody);


    if(PRIVATE_WEBHOOK_SECRET==null){
        return new Response(JSON.stringify({
            error: "PRIVATE_WEBHOOK_SECRET is null or undefined"
        }),
            {
                status: 500,
                headers: {},

            })
    }

    const signature: string | null = request.headers.get('stripe-signature');
    if(signature==null){
        return new Response(JSON.stringify({
            error: "signature is null or undefined"
        }),
            {
                status: 500,
                headers: {},

            })
    }

    try {
        const event = stripe.webhooks.constructEvent(payload, signature, PRIVATE_WEBHOOK_SECRET);
        data = event.data;
        eventType = event.type;
    } catch (err) {
        return new Response(JSON.stringify({
            error: err
        }),
            {
                status: 500,
                headers: {},

            })
    }


    if (data == null || eventType == null) {
        return new Response(JSON.stringify({
            error: `No data or eventType was found. data: ${data} ||||| eventType: ${eventType}`
        }),
            {
                status: 500,
                headers: {},
        })
    }


    switch (eventType) {
        // case 'checkout.session.async_payment_failed':
        //   const checkoutSessionAsyncPaymentFailed = data.object;
        //   console.log(JSON.stringify(data.object))
        //   // Then define and call a function to handle the event checkout.session.async_payment_failed
        //   break;
        // case 'checkout.session.async_payment_succeeded':
        //   const checkoutSessionAsyncPaymentSucceeded = data.object;
        //   console.log(JSON.stringify(data.object))
        //   // Then define and call a function to handle the event checkout.session.async_payment_succeeded
        //   break;
        case 'checkout.session.completed':
          const session:any = data.object;
          const profileId = session.client_reference_id
          const profile = await getProfileById(config, profileId)

          if(profile==null){
            return new Response(JSON.stringify({
                error: `Profile was not found. data: profileId: ${profileId}`
            }),
                {
                    status: 500,
                    headers: {},
            })
          }

          const { line_items } = await stripe.checkout.sessions.retrieve(
            session.id,
            {
              expand: ["line_items"],
            }
          );

          console.log("line_items",JSON.stringify(line_items, undefined, 2))
          line_items?.data.forEach(item=>{

            const numbersStr = item.description.match(/\d+/g)
            if(numbersStr){
                const purchasedCredits = parseInt(numbersStr[0])
                createCreditTransferAndUpdateProfile(config, profile, purchasedCredits, CreditTransferReason.PURCHASE)
                sendSMS(
                    config,
                    profile,
                    MessageDir.OUTBOUND,
                    `Success!\n${purchasedCredits} credits was added to your account.`,
                    false,
                    MessageType.NOTIF,
                )
            }
          })
          

          // Then define and call a function to handle the event checkout.session.completed
          break;
        // case 'checkout.session.expired':
        //   const checkoutSessionExpired = data.object;
        //   console.log(JSON.stringify(data.object))
        //   // Then define and call a function to handle the event checkout.session.expired
        //   break;
        default:
          console.log(`Unhandled event type ${eventType}`);
      }

    return new Response(JSON.stringify({
        message: 'Success'
    }),
        {
            status: 200,
            headers: {},

        })
};
