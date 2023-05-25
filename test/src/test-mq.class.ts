import { component, getMapping } from "../../";
import { connect } from "amqplib";


@component
export default class TestMq {

    @getMapping("/mq/sendByQueue")
    async sendMq() {
        const queue = 'myqueues';
        const text = "hello world, by queue";
        const connection = await connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.checkQueue(queue);
        channel.sendToQueue(queue, Buffer.from(text));
        console.log(" [x] Sent by queue '%s'", text);
        await channel.close();
        return "sent by queue";
    }

    @getMapping("/mq/sendByExchange")
    async sendMq2() {
        const exchange = 'myexchanges';
        const text = "hello world, by exchange";
        const connection = await connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.checkExchange(exchange);
        channel.publish(exchange, '', Buffer.from(text));
        console.log(" [x] Publish by exchange '%s'", text);
        await channel.close();
        return "sent by exchange";
    }

    @getMapping("/mq/listen")
    async testMq() {
        const connection = await connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'myqueues';
        await channel.checkQueue(queue);
        await channel.consume(queue, (message) => {
            console.log(" [x] Received '%s'", message.content.toString());
        }, { noAck: true });
        return "ok";
    }
}