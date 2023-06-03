export default abstract class LogFactory {
    public log(message?: any, ...optionalParams: any[]) : void {
        console.log(message, ...optionalParams);
    }
    public error(message?: any, ...optionalParams: any[]) : void {
        console.error(message, ...optionalParams);
    }
    public debug(message?: any, ...optionalParams: any[]) : void {
        console.debug(message, ...optionalParams);
    }
}
