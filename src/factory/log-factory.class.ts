export default abstract class LogFactory {
    abstract log(message?: any, ...optionalParams: any[]) : void;
}
