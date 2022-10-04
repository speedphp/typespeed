import DataSourceFactory from "../factory/data-source-factory.class";
export default class ReadWriteDb extends DataSourceFactory {
    private readonly readSession;
    private readonly writeSession;
    getDataSource(): DataSourceFactory;
    constructor();
    private getConnectionByConfig;
    readConnection(): any;
    writeConnection(): any;
}
