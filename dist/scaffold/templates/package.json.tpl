{
    "name": "###appName###",
    "version": "1.0.0",
    "scripts": {
        "watch": "nodemon",
        "test": "ts-node src/main.ts",
        "start": "ts-node --transpile-only src/main.ts",
        "build": "tsc -p ."
    },
    "dependencies": {
        "@types/node": "^18.0.6",
        "tracer": "^1.1.6",
        "typespeed": "latest"
    }
}