export default abstract class DataSourceFactory {
    public abstract readConnection();
    public abstract writeConnection();
}