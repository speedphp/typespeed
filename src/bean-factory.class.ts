
export default class BeanFactory {
    private static beanMapper: Map<string, any> = new Map<string, any>();
    private static beanFunctionMapper: Map<string, any> = new Map<string, any>();
    public static putBean(mappingClass: Function, beanClass: any): any {
        this.beanMapper.set(mappingClass.name, beanClass);
        console.log(this.beanMapper);
    }
    public static getBean(mappingClass: Function): any {
        return this.beanMapper.get(mappingClass.name);
    }
    public static getBeanFunction(mappingFunction: Function): Function {
        return this.beanFunctionMapper.get(mappingFunction.name);
    }
    public static putBeanFunction(mappingFunction: Function, beanFunction: Function): void {
        this.beanFunctionMapper.set(mappingFunction.name, beanFunction);
    }
}
