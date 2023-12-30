import { NODE_ENV } from "$env/static/private";
import { error } from "@sveltejs/kit";


export const load = async () => {

    if(NODE_ENV!=="development"){
        throw error(403)
    }

};