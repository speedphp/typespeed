import AuthenticationFactory from "../factory/authentication-factory.class";
import { bean } from "../core.decorator";

export default class DefaultAuthentication extends AuthenticationFactory{
    @bean
    public getAuthentication(): AuthenticationFactory {
        return new DefaultAuthentication();
    }
}

