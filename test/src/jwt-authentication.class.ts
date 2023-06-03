

export default class JwtAuthentication extends AuthenticationFactory {
    const jwtMiddleware = expressjwt({ secret: "shhhhhhared-secret", algorithms: ["HS256"] });
    jwtMiddleware(req, res, (err) => {  
        if (err) {
            return "jwt error";
        } else {
            return "jwt success";
        }
    });
}