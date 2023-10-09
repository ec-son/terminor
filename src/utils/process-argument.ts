import { KsError } from "../exceptions/ks-error";
import { choiceVerifing } from "./choice-verification";
import { ArgumentType } from "../types/argument.type";
import { isEqual } from "./is-equal";

export const processArgument = (
  args: Array<ArgumentType> | undefined,
  commandName: string
): Array<ArgumentType> => {
  if (!args?.length) args = [];
  for (const argument of args) {
    if (!argument.type) argument.type = "string";

    choiceVerifing(
      argument.type,
      argument.choices || [],
      "choice",
      commandName
    );

    if (argument.type === "date") {
      const dateDesc =
        argument.type === "date" ? " (e.g. YYYY-MM-DD = 2015-03-31)" : "";
      argument.description = (argument.description || "") + dateDesc;
    }

    argument.description = argument.description?.trim();

    if (argument.default) {
      if (
        argument?.choices &&
        argument?.choices?.length > 0 &&
        !argument.choices.find((el) => isEqual(el, argument.default))
      ) {
        throw new KsError(
          `The default value provided is not valid according to the available choices. Valid choices are: ${argument.choices
            .map((el) => JSON.stringify(el))
            .join(", ")}`,
          {
            type: "error",
            errorType: "InvalidDefaultValueError",
            commandName,
          }
        );
      }
      choiceVerifing(argument.type, [argument.default], "default", commandName);
    }

    switch (argument.argumentName[0]) {
      case "<": // e.g. <required>
        argument.required = true;
        argument.argumentName = argument.argumentName.slice(1, -1);
        break;
      case "[": // e.g. [optional]
        argument.required = false;
        argument.argumentName = argument.argumentName.slice(1, -1);
        break;
    }

    if (
      argument.argumentName.length > 3 &&
      argument.argumentName.endsWith("...")
    ) {
      argument.variadic = true;
      argument.argumentName = argument.argumentName.slice(0, -3);
    }
  }

  return args;
};
