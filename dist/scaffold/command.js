"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = require("fs");
commander_1.program.command('new [appName]')
    .description('Create a new app.')
    .action((appName) => {
    const currentDir = process.cwd();
    fs.mkdirSync(currentDir + "/" + appName);
    mkFile("nodemon.json", currentDir + "/" + appName, appName);
    mkFile("package.json", currentDir + "/" + appName, appName);
    mkFile("tsconfig.json", currentDir + "/" + appName, appName);
    fs.mkdirSync(currentDir + "/" + appName + "/src");
    mkFile("main.ts", currentDir + "/" + appName + "/src", appName);
    mkFile("front-page.class.ts", currentDir + "/" + appName + "/src", appName);
    console.log('');
    console.log('  Create app success!');
    console.log('');
    console.log('  Please run `npm install` in the app directory.');
    console.log('');
});
commander_1.program.on('--help', () => {
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    $ speed new blog');
});
commander_1.program.parse(process.argv);
function mkFile(fileName, targetPath, appName) {
    const tplPath = __dirname + "/templates";
    const fileContents = fs.readFileSync(tplPath + "/" + fileName + ".tpl", "utf-8");
    fs.writeFileSync(targetPath + "/" + fileName, fileContents.replace("###appName###", appName));
}
//# sourceMappingURL=command.js.map