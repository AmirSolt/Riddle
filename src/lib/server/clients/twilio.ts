import TwilioSDK from 'twilio';
import * as dotenv from 'dotenv'
dotenv.config()


if(process.env.TWILIO_ACCOUNT_SID == null){
    throw new Error('missing TWILIO_ACCOUNT_SID');
}
if(process.env.TWILIO_AUTH_TOKEN == null){
    throw new Error('missing TWILIO_AUTH_TOKEN');
}
if(process.env.TWILIO_PHONE_NUMBER == null){
    throw new Error('missing TWILIO_PHONE_NUMBER');
}
if(process.env.ADMIN_NUMBER == null){
    throw new Error('missing ADMIN_NUMBER');
}


export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
export const ADMIN_NUMBER = process.env.ADMIN_NUMBER

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
export const client = new TwilioSDK.Twilio(accountSid, authToken);



