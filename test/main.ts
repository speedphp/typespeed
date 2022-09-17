import LogDefault from '../src/log-default.class';

const className = "../src/log-default.class";
import(className);

const logObject = new LogDefault();
logObject.log();

console.log("Main file running...");