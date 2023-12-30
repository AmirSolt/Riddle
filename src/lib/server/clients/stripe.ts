import {PRIVATE_STRIPE_KEY} from '$env/static/private';
import Stripe from 'stripe';

if(process.env.PRIVATE_STRIPE_KEY == null){
    throw new Error('missing PRIVATE_STRIPE_KEY');
}
if(process.env.PRIVATE_WEBHOOK_SECRET == null){
    throw new Error('missing PRIVATE_WEBHOOK_SECRET');
}


export const stripe = new Stripe(PRIVATE_STRIPE_KEY, {
    apiVersion: '2023-08-16',
});
