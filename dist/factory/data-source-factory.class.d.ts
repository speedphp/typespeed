export default abstract class DataSourceFactory {
    abstract readConnection(): any;
    abstract writeConnection(): any;
}
