import { bean, config, log } from "../core.decorator";
import IoRedis from "ioredis";

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