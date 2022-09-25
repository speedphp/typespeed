export default abstract class LogFactory {
    abstract log(message?: any, ...optionalParams: any[]) : void;
    abstract error(message?: any, ...optionalParams: any[]) : void;
}
