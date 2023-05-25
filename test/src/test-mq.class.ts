import { component, getMapping, autoware, log } from "../../";
import { RabbitMQ, rabbitListener } from "../../src/default/rabbitmq.class";
import { connect } from "amqplib";


@component
export default class TestMq {

    @autoware
    private rabbitMQ: RabbitMQ;

    @rabbitListener("myqueues")
    public async listen(message) {
        log(" Received by Decorator '%s'", message.content.toString());
    }

    @getMapping("/mq/sendByMQClass")
    async sendByMQClass() {
        this.rabbitMQ.send("myqueues", "hello world, by MQClass");
    }

    @getMapping("/mq/sendByQueue")
    async sendMq() {
        const queue = 'myqueues';
        const text = "hello world, by queue";
        const connection = await connect({
            protocol: 'amqp',
            hostname: 'localhost',
            port: 5672,
            username: 'guest',
            password: 'guest'
        });
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
        const queue2 = 'myqueues2';
        await channel.checkQueue(queue);
        await channel.checkQueue(queue2);
        await channel.consume(queue, (message) => {
            console.log(" [x] Received '%s'", message.content.toString());
        }, { noAck: true });
        await channel.consume(queue2, (message) => {
            console.log(" [x] Received queue2 '%s'", message.content.toString());
        }, { noAck: true });
        return "ok";
    }
}