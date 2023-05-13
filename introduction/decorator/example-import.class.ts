@app
export default class ExampleImport {}

function app(target: any) {
    console.log("import 载入 ExampleImport 类的 @app 类装饰器。");
}