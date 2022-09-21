import * as walkSync from "walk-sync";
import { log } from "../src/speed";

export default function app(target: any, propertyName: string, descriptor: PropertyDescriptor) {


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
    
    log("App Decorator running...");

}