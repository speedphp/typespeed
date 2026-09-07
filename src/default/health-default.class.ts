import { bean } from "../core.decorator";
import HealthFactory from "../factory/health-factory.class";

/**
 * 健康检查默认实现：恒为就绪。
 * 应用继承 HealthFactory 并用 @bean 注册自定义实现，即可覆盖默认行为（如接入数据库/Redis 连通性检查）。
 */
export default class HealthDefault extends HealthFactory {
    @bean
    createHealth(): HealthFactory {
        return new HealthDefault();
    }

    ready(): boolean {
        return true;
    }
}
