import * as walkSync from "walk-sync";
import { log } from "../src/speed";

export default function start<T extends { new (...args: any[]): {} }>(constructor: T){

    
    const srcDir = process.cwd() + "/src";
    const srcPaths = walkSync(srcDir, { globs: ['**/*.ts'] });
    for(let p of srcPaths) {
        import(srcDir + "/" + p);
    }
    
    const testDir = process.cwd() + "/test";
    const testPaths = walkSync(testDir, { globs: ['**/*.ts'] });
    for(let p of testPaths) {
        import(testDir + "/" + p);
    }
    
    log("Start Decorator running...");

    const appNow = new constructor();
    appNow["start"]();

}