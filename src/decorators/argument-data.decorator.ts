import { parameterInit } from "../utils/parameter_init";

export function ArgumentData(argumentName?: string | string[]) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    parameterInit("args", target, propertyKey, parameterIndex, argumentName);
  };
}

export function ExcessArgumentData() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    parameterInit("excess_argument", target, propertyKey, parameterIndex);
  };
}
