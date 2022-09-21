import app from "../src/app.decorator";
import start from "../src/start.decorator";


@start
class Main {

    public start(){
        console.log('start application');
    }
}