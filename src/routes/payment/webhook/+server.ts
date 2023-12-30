import type { Stripe } from 'stripe'
import { stripe } from '$lib/server/clients/stripe'
import { PRIVATE_WEBHOOK_SECRET } from '$env/static/private';


function toBuffer(ab: ArrayBuffer): Buffer {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; i++) {
        buf[i] = view[i];
    }
    return buf;
}

export const POST = async ({ request }) => {
    let data: Stripe.Event.Data | null = null;
    let eventType: string | null = null;

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
        case 'checkout.session.async_payment_failed':
          const checkoutSessionAsyncPaymentFailed = data.object;
          console.log(JSON.stringify(data.object))
          // Then define and call a function to handle the event checkout.session.async_payment_failed
          break;
        case 'checkout.session.async_payment_succeeded':
          const checkoutSessionAsyncPaymentSucceeded = data.object;
          console.log(JSON.stringify(data.object))
          // Then define and call a function to handle the event checkout.session.async_payment_succeeded
          break;
        case 'checkout.session.completed':
          const checkoutSessionCompleted = data.object;
          console.log(JSON.stringify(data.object))
          // Then define and call a function to handle the event checkout.session.completed
          break;
        case 'checkout.session.expired':
          const checkoutSessionExpired = data.object;
          console.log(JSON.stringify(data.object))
          // Then define and call a function to handle the event checkout.session.expired
          break;
        // ... handle other event types
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
