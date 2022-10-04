import { createConnection, createPool } from "mysql2";
import DataSourceFactory from "../factory/data-source-factory.class";
import { bean, config } from "../core.decorator";

export default class ReadWriteDb extends DataSourceFactory {
    private readonly readSession;
    private readonly writeSession;

    @bean
    public getDataSource(): DataSourceFactory {
        if (!config("mysql")) {
            return null;
        }
        return new ReadWriteDb();
    }

    constructor() {
        super();
        const dbConfig = config("mysql");
        if (dbConfig["master"] && dbConfig["slave"]) {
            this.writeSession = this.getConnectionByConfig(dbConfig["master"]);
            if (Array.isArray(dbConfig["slave"])) {
                this.readSession = dbConfig["slave"].map(config => this.getConnectionByConfig(config));
            } else {
                this.readSession = [this.getConnectionByConfig(dbConfig["slave"])];
            }
        } else {
            this.writeSession = this.getConnectionByConfig(dbConfig);
            this.readSession = [this.writeSession];
        }
    }

    private getConnectionByConfig(config: object) {
        if (config["PoolOptions"] !== undefined) {
            // we need pool
            if (Object.keys(config["PoolOptions"]).length !== 0) {
                config = Object.assign(config, config["PoolOptions"]);
            }
            return createPool(config).promise();
        } else {
            // only connection
            return createConnection(config).promise();
        }
    }

    public readConnection() {
        return this.readSession[Math.floor(Math.random() * this.readSession.length)];
    }

    public writeConnection() {
        return this.writeSession;
    }
}