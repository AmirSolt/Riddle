import { getPurchaseSession } from '$lib/server/services/db.js';
import {PUBLIC_STRIPE_KEY} from '$env/static/public';


export const load = async ({url}) => {
    const purchaseSessionCode = url.searchParams.get('psc');
    const purchaseSession = getPurchaseSession(purchaseSessionCode)
    return {
        purchaseSession,
        publishableKey:PUBLIC_STRIPE_KEY
    }
};