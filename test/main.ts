import * as walkSync from "walk-sync";


const srcDir = process.cwd()
const paths = walkSync(srcDir, { globs: ['**/*.ts'] });


for(let p of paths) {
    import(srcDir + "/" + p);
}

console.log("Main file running...");