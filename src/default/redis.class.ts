import { bean } from "../core.decorator";
import { default as IoRedis, RedisKey} from "ioredis";
import { config } from "../typespeed";
const redisSubscribers = {};

class Redis extends IoRedis {
    private static pubObj: Redis = null;
    private static subObj: Redis = null;

    @bean
    public getRedis(): Redis {
        return Redis.getInstanceOfRedis("pub");
    }

    public async zrevranking(key: RedisKey, start: number | string, stop: number | string): Promise<Map<string, number>> {
        const list = await this.zrevrange(key, start, stop, "WITHSCORES");
        const map = new Map<string, number>();
        for (let i = 0; i < list.length; i = i + 2) {
            map.set(list[i], Number(list[i + 1]));
        }
        return map;
    }

    public async zranking(key: RedisKey, start: number | string, stop: number | string): Promise<Map<string, number>> {
        const list = await this.zrange(key, start, stop, "WITHSCORES");
        const map = new Map<string, number>();
        for (let i = 0; i < list.length; i = i + 2) {
            map.set(list[i], Number(list[i + 1]));
        }
        return map;
    }

    static getInstanceOfRedis(mode: "sub" | "pub") {
        if (!config("redis")) {
            return null;
        }
        if (mode === "sub") {
            this.pubObj = this.pubObj || new Redis(config("redis"));
            return this.pubObj;
        } else {
            this.subObj = this.subObj || new Redis(config("redis"));
            return this.subObj;
        }
    }
}

function redisSubscriber(channel: string) {
    if (!config("redis")) return function(){
        throw new Error("redis not configured");
    };
    Redis.getInstanceOfRedis("sub").subscribe(channel, function (err, count) {
        if (err) {
            console.error(err);
        }
    });
    return function (target: any, propertyKey: string) {
        redisSubscribers[channel] = target[propertyKey];
    };
}

if (config("redis")) {
    Redis.getInstanceOfRedis("sub").on("message", function (channel, message) {
        redisSubscribers[channel](message);
    });
}

process.once('SIGINT', () => { 
    Redis.getInstanceOfRedis("sub") || Redis.getInstanceOfRedis("sub").disconnect();
    Redis.getInstanceOfRedis("pub") || Redis.getInstanceOfRedis("pub").disconnect();
});

export { Redis, redisSubscriber };