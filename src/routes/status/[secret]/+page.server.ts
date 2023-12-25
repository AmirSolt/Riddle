import { error } from '@sveltejs/kit';
import { ADMIN_SECRET } from '$env/static/private'

export const load = async ({params}) => {
    if(params.secret!==ADMIN_SECRET){
        throw error(403)
    }


    
};