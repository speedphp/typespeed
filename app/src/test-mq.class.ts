import { component, getMapping, autoware, log, RabbitMQ, rabbitListener } from "../../src/typespeed";
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
        return "Sent by MQClass";
    }
}