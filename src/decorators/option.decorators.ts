import { Command, Option as _O } from "commander";
import { OptionType } from "../types";
import { argumentValidator } from "../utils/argument-validator";

export function Option(_opt: OptionType) {
  return function (target, propertyName: string) {
    const originalInitFunction: Function = target.init || function () {};
    target.init = function (program: Command) {
      const option = { ..._opt, propertyName };
      const newOption = new _O(option.name, option.description);

      if (option.long) newOption.long = option.long;
      if (option.short) newOption.short = option.short;
      if (option.default && typeof option.default === option.type)
        newOption.default(option.default);
      else if (option.default) {
        delete option.default;
      }
      if (option.choices) newOption.choices(option.choices);

      if (
        option?.type &&
        ["string", "number", "float", "date"].includes(option.type)
      ) {
        option.required
          ? (newOption.required = true)
          : (newOption.optional = true);
      }
      newOption.argParser((value: any) =>
        argumentValidator(value, option, "opt")
      );
      program.addOption(newOption);
      this._opts && Array.isArray(this._opts)
        ? this._opts.push(option)
        : (this._opts = [option]);

      originalInitFunction.call(this, program);
    };
  };
}
