import { bean } from "../src/speed";
import {LogFactory} from "./log-factory.interface";
import * as tracer from "tracer";

export default class LogDefault implements LogFactory {

    @bean
    createLog(): LogFactory {
        return new LogDefault;
    }

    log(...args): any {
        return tracer.console({
            format: "[{{title}}] {{timestamp}} {{file}}:{{line}} ({{method}}) {{message}}",
            dateformat: "yyyy-mm-dd HH:MM:ss",
            preprocess: function (data) {
                data.title = data.title.toUpperCase();
            }
        });
    }

}