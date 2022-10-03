import { bean, config } from "../speed";
import IoRedis from "ioredis";

export default class Redis extends IoRedis{

    @bean
    public getRedis() : Redis {
        return new Redis(config("redis"));
    }

    
}