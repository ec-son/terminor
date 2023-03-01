import { Command, Option as _O } from "commander";
import { argumentValidator } from "../helpers";
import { OptionType } from "../interfaces";

export function Option(_opt: OptionType) {
  return function (target, propertyName: string) {
    const originalInitFunction: Function = target.init || function () {};
    target.init = function (program: Command) {
      const option = { ..._opt, propertyName };
      const newOption = new _O(option.name, option.description);
      if (
        option?.type &&
        ["string", "number", "float", "date"].includes(option.type)
      ) {
        option.required
          ? (newOption.required = true)
          : (newOption.optional = true);
      }
      newOption.argParser((value: any) => argumentValidator(value, option));
      program.addOption(newOption);
      this.opts && Array.isArray(this.opts)
        ? this.opts.push(option)
        : (this.opts = [option]);

      originalInitFunction.call(this, program);
    };
  };
}
