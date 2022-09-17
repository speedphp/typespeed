import { onClass, bean, autoware, inject } from "./speed";

@onClass
export default class LogDefault {
    constructor() {
        console.log('LogDefault constructor');
    }

    @autoware
    private testAutoware: string;

    @inject()
    private testInject: string;

    @bean
    public log(): string {
        console.log('LogDefault log method');
        return "return from method log";
    }
}