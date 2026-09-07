/**
 * 健康检查工厂（抽象）。
 * 实现 ready() 自定义「就绪检查」（readiness）——如检查数据库/Redis/MQ 连通性。
 * 应用继承此类并用 @bean 注册自定义实现；默认实现见 HealthDefault（恒就绪）。
 */
export default abstract class HealthFactory {
    public abstract ready(): boolean;
}
