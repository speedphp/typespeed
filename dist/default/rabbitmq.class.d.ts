declare class RabbitMQ {
    getRabbitMQ(): RabbitMQ;
    publishMessageToExchange(exchange: string, routingKey: string, message: string): Promise<void>;
    sendMessageToQueue(queue: string, message: string): Promise<void>;
    publish(exchange: string, routingKey: string, message: string): Promise<void>;
    send(queue: string, message: string): Promise<void>;
}
declare function rabbitListener(queue: string): (target: any, propertyKey: string) => void;
export { RabbitMQ, rabbitListener };
