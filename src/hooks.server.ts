import type { Handle, HandleServerError } from '@sveltejs/kit'
import { createConfig, getConfig } from '$lib/server/services/db'

export const handle: Handle = async ({ event, resolve }) => {

    let config = await getConfig()

    if(config==null){
        config = await createConfig()
    }
    
    event.locals.config = config

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
          return name === 'content-range'
        },
      })
}

// export const handleError: HandleServerError = async ({ error, event }) => {
// 	console.log("hooks.server.ts:handleError -> ",event.url, error)

//     const config = event.locals.config

//     const text = await event.request.text();
//     const params = Object.fromEntries(new URLSearchParams(text));
//     const { Body, From } = params

//     let profile = await getProfileByTwilioId(config, From)
//     if (profile == null) {
//         console.log("hooks.server.ts: Could not find profile within error handling")
//         return {message:"hooks.server.ts: Could not find profile within error handling"}
//     }

//     await submitMessage(
//         config,
//         profile,
//         MessageRole.ASSISTANT,
//         MessageDir.OUTBOUND,
//         `Error: Server encountered an error. If the error is severe, you can notify the developer like so "report ...".`,
//     );
//     return {message:"Sent Error message to sender"}
// }

