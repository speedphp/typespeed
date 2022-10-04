import LogFactory from "../factory/log-factory.class";
export default class LogDefault extends LogFactory {
    createLog(): LogFactory;
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
}
