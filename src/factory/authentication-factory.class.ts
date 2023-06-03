import * as express from 'express';
export default abstract class AuthenticationFactory {
    public preHandle(req: express.Request, res: express.Response, next: express.NextFunction): void{
        next();
    }
    public afterCompletion(req: express.Request, res: express.Response, next: express.NextFunction): void{
        next();
    }
}