import { bean, getComponent  } from "../core.decorator";
import { config } from "../typespeed";
import { connect } from "amqplib";
import { isStd, getStdArgs } from "../decorator-utils";
let rabbitConnection = null;

class RabbitMQ {
    
    @bean
    public getRabbitMQ(): RabbitMQ {
        if (!config("rabbitmq")) {
            return null;
        }
        return new RabbitMQ();
    }

    public async publishMessageToExchange(exchange: string, routingKey: string, message: string): Promise<void> {
        const channel = await getChannel();
        await channel.assertExchange(exchange);
        channel.publish(exchange, routingKey, Buffer.from(message));
        await channel.close();
    }

    public async sendMessageToQueue(queue: string, message: string): Promise<void> {
        const channel = await getChannel();
        await channel.accertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(message));
        await channel.close();
    }

    public async publish(exchange: string, routingKey: string, message: string): Promise<void> {
        await this.publishMessageToExchange(exchange, routingKey, message);
    }

    public async send(queue: string, message: string):  Promise<void> {
        await this.sendMessageToQueue(queue, message);
    }
}

async function getChannel() {
    if (rabbitConnection === null) {
        rabbitConnection = await connect(config("rabbitmq"));
        process.once('SIGINT', async () => { 
            await rabbitConnection.close();
        });
    }
    const channel = await rabbitConnection.createChannel();
    return channel;
}

function rabbitListener(queue: string) {
    return (...args: any[]): any => {
        if (isStd(args)) {
            const [, ctx] = getStdArgs(args);
            ctx.addInitializer(function (this: any) {
                const targetConstructor = this.constructor;
                const methodName = String(ctx.name);
                (async function () {
                    const channel = await getChannel();
                    await channel.assertQueue(queue);
                    const targetBean = getComponent(targetConstructor);
                    await channel.consume(queue, targetBean[methodName], { noAck: true });
                }());
            });
            return;
        }
        const target = args[0];
        const propertyKey = args[1] as string;
        (async function () {
            const channel = await getChannel();
            await channel.assertQueue(queue);
            const targetBean = getComponent(target.constructor);
            await channel.consume(queue, targetBean[propertyKey], { noAck: true });
        }());
    }
}

export { RabbitMQ, rabbitListener };