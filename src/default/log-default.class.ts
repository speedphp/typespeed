import { bean } from "../core.decorator";
import LogFactory from "../factory/log-factory.class";

export default class LogDefault extends LogFactory {

    @bean
    createLog(): LogFactory {
        return new LogDefault();
    }

    public log(message?: any, ...optionalParams: any[]): void {
        console.log(message, ...optionalParams);
    }

    public error(message?: any, ...optionalParams: any[]) : void{
        console.error(message, ...optionalParams);
    }

}