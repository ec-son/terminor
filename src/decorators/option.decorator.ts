import { KsError } from "../exceptions/ks-error";
import { choiceVerifing } from "../utils/choice-verification";
import { commandContainer } from "../utils/command-container";
import { OptionType, OptionValueType } from "../types/option.type";
import { formatOptionFlag } from "../utils/format-option-flag";
import { MetaDataType } from "../types/metadata.type";
import { isEqual } from "../utils/is-equal";
import { ValidType } from "../types/valid.type";

export function Option(
  _opt?: Omit<OptionType, "type" | "optionName"> &
    Partial<Pick<OptionType, "type" | "optionName">>
) {
  return function (target: any, propertyKey: string) {
    const originalInitFunction: Function = target.__init__ || function () {};
    target.__init__ = function () {
      const option = { ..._opt, propertyName: propertyKey };
      option.optionName = option.optionName || option.propertyName;

      const { flag, alias } = formatOptionFlag(
        option.flag || option.optionName,
        option.alias
      );

      if (!option.type) {
        if (
          (["boolean", "date", "number", "string"] as ValidType[]).includes(
            typeof this[propertyKey] as ValidType
          )
        )
          option.type = typeof this[propertyKey] as ValidType;
        else option.type = "boolean";
      }

      if (option.type === "date") {
        const dateDesc =
          option.type === "date" ? " (e.g. YYYY-MM-DD = 2015-03-31)" : "";
        option.description = (option.description || "") + dateDesc;
      }
      option.description = option.description?.trim();
      option.alias = alias;
      option.flag = flag;

      const commandInfo = commandContainer.getCommand(this);

      choiceVerifing(
        option.type,
        option.choices || [],
        "choice",
        commandInfo?.name
      );

      if (!option.default && this[propertyKey] !== undefined)
        option.default = this[propertyKey];

      if (option.default) {
        if (
          option?.choices &&
          option?.choices?.length > 0 &&
          !option.choices.find((el) => isEqual(el, option.default))
        ) {
          throw new KsError(
            `The default value provided is not valid according to the available choices. Valid choices are: ${option.choices
              .map((el) => JSON.stringify(el))
              .join(", ")}`,
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
      }

      (this[commandInfo!.index] as MetaDataType).options.push(
        option as unknown as OptionValueType
      );
      originalInitFunction.call(this);
    };
  };
}
