import { log } from "../src/speed";
import * as walkSync from "walk-sync";

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

log("Main file running...");