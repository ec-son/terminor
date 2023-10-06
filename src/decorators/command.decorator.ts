import { CommandType } from "../types/command.type";
import { commandInit } from "../utils/command-init";

export function Command(context: CommandType) {
  return function (target: Function) {
    const originalInitFunction: Function =
      target.prototype.__init__ || function () {};

    target.prototype.__init__ = function (config?: {
      globalRequiredArgsFirst?: boolean;
    }) {
      context.requiredArgsFirst ??= config?.globalRequiredArgsFirst;

      const { metadata, index } = commandInit(target.name, context);
      this[index as any] = metadata;

      originalInitFunction.call(this);
      if ("__init__parameter__" in this) this.__init__parameter__();
    };
  };
}
