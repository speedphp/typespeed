import { bean } from "../core.decorator";
import IoRedis from "ioredis";
import { config } from "../typespeed";

class Redis extends IoRedis {

    private static redisObj: Redis = null;

    @bean
    public getRedis(): Redis {
        return Redis.getInstanceOfRedis();
    }

    constructor(config: any) {
        super(config);
    }

    static getInstanceOfRedis() {
        if (!config("redis")) {
            return null;
        }
        if (this.redisObj === null) {
            this.redisObj = new Redis(config("redis"));
        }
        return this.redisObj;
    }
}

process.once('SIGINT', () => { 
    Redis.getInstanceOfRedis() || Redis.getInstanceOfRedis().disconnect();
});
const redisSubscribers = {};

function redisSubscriber(channel: string) {
    if (!config("redis")) return;
    Redis.getInstanceOfRedis().subscribe(channel, function (err, count) {
        if (err) {
            console.error(err);
        }
    });
    return function (target: any, propertyKey: string) {
        redisSubscribers[channel] = target[propertyKey];
    };
}

if (config("redis")) {
    Redis.getInstanceOfRedis().on("message", function (channel, message) {
        console.log("Message '" + message + "' on channel '" + channel + "' arrived!");
        redisSubscribers[channel](message);
    });
}
export { Redis, redisSubscriber };