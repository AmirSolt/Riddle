import Redis from 'ioredis';
import * as dotenv from 'dotenv'
dotenv.config()



if(process.env.REDIS_URL == null){
    throw new Error('missing REDIS_URL');
}


export const redis = new Redis(process.env.REDIS_URL);

