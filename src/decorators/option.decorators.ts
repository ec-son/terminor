import { Command, Option as _O } from "commander";
import { KsError } from "../exceptions/ks-error";
import { argumentValidator } from "../utils/argument-validator";
import { choiceVerifing } from "../utils/choice-verification";
import { commandContainer } from "../utils/command-container";
import { OptionType } from "../types/option.type";
import { ValidType } from "../types/utilities.type";

export function Option(_opt: OptionType) {
  return function (target, propertyName: string) {
    const originalInitFunction: Function = target.init || function () {};
    target.init = function (program: Command) {
      const option = { ..._opt, propertyName };

      const optionName = option.alias
        ? `${option.alias.replace(/^-{0,}/, "-")}, ${option.optionName.replace(
            /^-{0,}/,
            "--"
          )}`
        : option.optionName.replace(/^-{0,}/, "--");

      const dateDesc =
        option.type === Date ? "  (e.g. YYYY-MM-DD = 2015-03-31)" : "";
      const newOption = new _O(
        optionName,
        (option.description || "") + dateDesc
      );

      const commandInfo = commandContainer.getCommand(this);

      choiceVerifing(
        option.type,
        option.choices || [],
        "choice",
        commandInfo?.name
      );
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
              commandName: commandInfo?.name,
            }
          );
        }
        choiceVerifing(
          option.type,
          [option.default],
          "default",
          commandInfo?.name
        );
        // newOption.default(option.default);
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

      this[commandInfo!.optionIndex].push(option);

      originalInitFunction.call(this, program);
    };
  };
}
