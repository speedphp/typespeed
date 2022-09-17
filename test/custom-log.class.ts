import { onClass } from "../src/speed";


@onClass
export default class CustomLog {
    constructor() {
        console.log('CustomLog constructor');
    }

}