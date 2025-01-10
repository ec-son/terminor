import { parameterInit } from "../utils/parameter_init";

export function OptionData(optionName?: string | string[]) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    parameterInit("options", target, propertyKey, parameterIndex, optionName);
  };
}

export function UnknownOptionData() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    parameterInit("unknown_option", target, propertyKey, parameterIndex);
  };
}
