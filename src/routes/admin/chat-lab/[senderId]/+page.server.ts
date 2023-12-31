import { getChatResponse } from '$lib/server/services/chat.js';
import { createProfile, deleteProfile, getLastMessages, getProfile } from '$lib/server/services/db.js';
import type { Message, Profile } from '@prisma/client';
import { error } from '@sveltejs/kit';

export const load = async ({locals, params}) => {
    const config = locals.config
    let senderId = params.senderId
    if(senderId)senderId = senderId.trim()

    let profile:Profile|null=null
    let messages:Message[]|null=null

    if(senderId){
        profile = await getProfile(config, senderId)

        if(profile)
            messages = await getLastMessages(config, profile, 10)
    }

    return {
        profile,
        messages,
        senderIdLoad:senderId
    }

};


export const actions = {
    chat:async (event)=>{

        const data = await event.request.formData();
		const senderId = data.get('senderId') as string|null
        const content = data.get('content') as string|null

        if(senderId==null || content==null){
            throw error(500, `/chat format input error: senderId:${senderId} content:${content}`)
        }

        await getChatResponse(event, senderId as string, content as string)
    },
    deleteProfile:async (event)=>{
        const data = await event.request.formData();
		const profileId = data.get('profileId') as string|null

        if(profileId==null){
            throw error(500, `/deleteProfile format input error: profileId:${profileId}`)
        }

        await deleteProfile(event.locals.config, profileId)
    }
};