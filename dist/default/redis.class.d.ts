import IoRedis from "ioredis";
export default class Redis extends IoRedis {
    getRedis(): Redis;
    constructor(config: any);
}
