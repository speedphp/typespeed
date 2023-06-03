import { bean } from "../core.decorator";
import LogFactory from "../factory/log-factory.class";

export default class LogDefault extends LogFactory {
    @bean
    createLog(): LogFactory {
        return new LogDefault();
    }
}