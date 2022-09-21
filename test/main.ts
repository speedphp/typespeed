import app from "../src/app.decorator";
import start from "../src/start.decorator";


@start
class Main {

    @app
    public main(){
        console.log("start")
    }
}