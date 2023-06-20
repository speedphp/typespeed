import { bean } from "../core.decorator";
import IoRedis from "ioredis";
import { config } from "../typespeed";
export default class Redis extends IoRedis {

    @bean
    public getRedis(): Redis {
        if (!config("redis")) {
            return null;
        }
        return new Redis(config("redis"));
    }

    constructor(config: any) {
        super(config);
    }

}