import { bean, config } from "../core.decorator";
import { connect } from "amqplib";
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
        await channel.checkExchange(exchange);
        channel.publish(exchange, routingKey, Buffer.from(message));
        await channel.close();
    }

    public async sendMessageToQueue(queue: string, message: string): Promise<void> {
        const channel = await getChannel();
        await channel.checkQueue(queue);
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
    }
    return await rabbitConnection.createChannel();
}

function rabbitListener(queue: string) {
    console.log('rabbitListener outer');
    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<void>>) => {
        descriptor.value = async function() {
            console.log('rabbitListener inner');
            const channel = await getChannel();
            await channel.checkQueue(queue);
            await channel.consume(queue, target[propertyKey], { noAck: true });
        }
    }
}

export { RabbitMQ, rabbitListener };