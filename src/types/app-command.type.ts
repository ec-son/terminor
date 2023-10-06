export interface AppCommandType<T = any> extends Function {
  new (...args: any[]): T;
}
