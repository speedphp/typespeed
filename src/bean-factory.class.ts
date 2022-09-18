
export default class BeanFactory {
    private static beanMapper: Map<string, any> = new Map<string, any>();
    private static beanFunctionMapper: Map<string, any> = new Map<string, any>();
    // public static putBean(mappingClass: Function, beanClass: any): any {
    //     this.beanMapper.set(mappingClass.name, beanClass);
    // }
    // public static getBean(mappingClass: Function): any {
    //     return this.beanMapper.get(mappingClass.name);
    // }

    public static putBean(mappingClass: string, beanClass: any): any {
        this.beanMapper.set(mappingClass, beanClass);
    }
    public static getBean(mappingClass: string): any {
        return this.beanMapper.get(mappingClass);
    }
    public static getBeanFunction(mappingFunction: Function): Function {
        return this.beanFunctionMapper.get(mappingFunction.name);
    }
    public static putBeanFunction(mappingFunction: Function, beanFunction: Function): void {
        this.beanFunctionMapper.set(mappingFunction.name, beanFunction);
    }
}