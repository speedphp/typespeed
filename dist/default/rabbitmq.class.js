"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitListener = exports.RabbitMQ = void 0;
const core_decorator_1 = require("../core.decorator");
const amqplib_1 = require("amqplib");
let rabbitConnection = null;
class RabbitMQ {
    getRabbitMQ() {
        if (!(0, core_decorator_1.config)("rabbitmq")) {
            return null;
        }
        return new RabbitMQ();
    }
    async publishMessageToExchange(exchange, routingKey, message) {
        const channel = await getChannel();
        await channel.checkExchange(exchange);
        channel.publish(exchange, routingKey, Buffer.from(message));
        await channel.close();
    }
    async sendMessageToQueue(queue, message) {
        const channel = await getChannel();
        await channel.checkQueue(queue);
        channel.sendToQueue(queue, Buffer.from(message));
        await channel.close();
    }
    async publish(exchange, routingKey, message) {
        await this.publishMessageToExchange(exchange, routingKey, message);
    }
    async send(queue, message) {
        await this.sendMessageToQueue(queue, message);
    }
}
__decorate([
    core_decorator_1.bean,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", RabbitMQ)
], RabbitMQ.prototype, "getRabbitMQ", null);
exports.RabbitMQ = RabbitMQ;
async function getChannel() {
    if (rabbitConnection === null) {
        rabbitConnection = await (0, amqplib_1.connect)((0, core_decorator_1.config)("rabbitmq"));
        process.once('SIGINT', async () => {
            await rabbitConnection.close();
        });
    }
    const channel = await rabbitConnection.createChannel();
    return channel;
}
function rabbitListener(queue) {
    return (target, propertyKey) => {
        (async function () {
            const channel = await getChannel();
            await channel.checkQueue(queue);
            await channel.consume(queue, target[propertyKey], { noAck: true });
        }());
    };
}
exports.rabbitListener = rabbitListener;
