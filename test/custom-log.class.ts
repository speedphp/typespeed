import { bean, log } from "../src/speed";
import * as tracer from "tracer";
import LogFactory from "../src/log-factory.class";

export default class CustomLog extends LogFactory {
    private logger = tracer.console({
        format: "[{{title}}] {{timestamp}} {{file}}:{{line}} ({{method}}) {{message}}",
        dateformat: "yyyy-mm-dd HH:MM:ss",
        stackIndex: 2,
        preprocess: function (data) {
            data.title = data.title.toUpperCase();
        }
    });

    @bean
    public createLog(): LogFactory {
        return new CustomLog();
    }

    public log(message?: any, ...optionalParams: any[]) : void{
        this.logger.log(message, ...optionalParams);
    }
}