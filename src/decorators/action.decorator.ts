import { KsError } from "../exceptions/ks-error";
import { ArgumentValueType } from "../types/argument.type";
import { EventType } from "../types/config-cli.type";
import { MetaDataType } from "../types/metadata.type";
import { OptionValueType } from "../types/option.type";
import { commandContainer } from "../utils/command-container";

function actionDecorator(context: {
  on: "handler" | "post_action" | "pre_action" | "option" | "argument";
  trigger?: string | string[];
  type?: "option" | "argument";
}) {
  return function (
    target: any,
    methodKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalInitFunction: Function = target.__init__ || function () {};
    target.__init__ = function () {
      const metadata = commandContainer.getCommand(this, true) as MetaDataType;

      if (context.trigger) {
        const originalInitFunction__init__parameter__: Function =
          this["__init__parameter__"] || function () {};

        this["__init__parameter__"] = function () {
          if (!Array.isArray(context.trigger))
            context.trigger = [context.trigger!];

          for (const trigger of context.trigger) {
            const flag = context.type === "argument" ? "args" : "options";

            let argOpt: OptionValueType | ArgumentValueType | undefined =
              metadata[flag].find((el) => {
                const _name = el["argumentName"]
                  ? el["argumentName"]
                  : el["optionName"];

                return _name === trigger;
              });

            metadata.handlers.push({
              methodKey,
              parameters: [
                {
                  flag,
                  index: 0,
                  argOpt,
                },
              ],
              on: context.on,
              trigger,
            });
          }

          originalInitFunction__init__parameter__.call(this);
        };
      } else {
        const handler: {
          methodKey: string | symbol;
          on: EventType;
          trigger?: string | string[];
          parameters: Array<{
            argOpt?: OptionValueType | ArgumentValueType;
            index: number;
            flag: "args" | "options";
          }>;
        } = {
          methodKey,
          parameters: [],
          on: context.on,
          trigger: context.trigger,
        };

        if (
          context.on === "handler" &&
          metadata.handlers[0].methodKey === "handler"
        )
          metadata.handlers.shift();
        metadata.handlers.push(handler);
      }

      originalInitFunction.call(this);
    };
  };
}

export function Handler();
export function Handler(
  trigger?: string | string[],
  type?: "option" | "argument"
);
export function Handler(
  trigger?: string | string[],
  type?: "option" | "argument"
) {
  if (trigger && !type)
    throw new KsError(
      "Sunt voluptate labore veniam culpa exercitation sint veniam.",
      {}
    ); //todo faire ca

  return actionDecorator(
    trigger ? { on: type!, trigger, type } : { on: "handler" }
  );
}

export function PreAction() {
  return actionDecorator({ on: "pre_action" });
}

export function PostAction() {
  return actionDecorator({ on: "post_action" });
}
