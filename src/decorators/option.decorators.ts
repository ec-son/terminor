import { Command, Option as _O } from "commander";
import { KsError } from "../exceptions/ks-error";
import { OptionType, ValidType } from "../types";
import { argumentValidator } from "../utils/argument-validator";
import { choiceVerifing } from "../utils/choice-verification";
import { commandContainer } from "../utils/command-container";

export function Option(_opt: OptionType) {
  return function (target, propertyName: string) {
    const originalInitFunction: Function = target.init || function () {};
    target.init = function (program: Command) {
      const option = { ..._opt, propertyName };
      const newOption = new _O(option.name, option.description);

      if (option.long) newOption.long = option.long;
      if (option.short) newOption.short = option.short;

      const commandName = commandContainer.getCommand(this)?.name;

      choiceVerifing(option.type, option.choices || [], "choice", commandName);
      if (option.default) {
        if (
          option?.choices &&
          option?.choices?.length > 0 &&
          !option.choices.includes(option.default)
        ) {
          throw new KsError(
            `The default value provided is not valid according to the available choices. Valid choices are: ${option.choices.join(
              ", "
            )}`,
            {
              type: "error",
              errorType: "InvalidDefaultValueError",
              commandName,
            }
          );
        }
        choiceVerifing(option.type, [option.default], "default", commandName);
        newOption.default(option.default);
      }

      if (
        option?.type &&
        ([Number, String, Date] as Array<ValidType>).includes(option?.type)
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
