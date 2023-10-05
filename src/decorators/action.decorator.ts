import { EventType } from "../types/config-cli.type";
import { MetaDataType } from "../types/metadata.type";
import { commandContainer } from "../utils/command-container";

function actionDecorator(context: {
  on: "handler" | "post_action" | "pre_action" | "on_option" | "on_argument";
  trigger?: string | string[];
}) {
  return function (
    target: any,
    methodKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalInitFunction: Function = target.__init__ || function () {};
    target.__init__ = function () {
      const metadata = commandContainer.getCommand(this, true) as MetaDataType;
      const handler: {
        methodKey: string | symbol;
        on: EventType;
        trigger?: string | string[];
        parameters: Array<any>;
      } = {
        methodKey,
        parameters: [],
        ...context,
      };

      if (
        context.on === "handler" &&
        metadata.handlers[0].methodKey === "handler"
      )
        metadata.handlers.shift();

      metadata.handlers.push(handler);

      originalInitFunction.call(this);
    };
  };
}

export function Handler() {
  return actionDecorator({ on: "handler" });
}

export function PostAction(trigger: string | string[]) {
  return actionDecorator({ on: "post_action", trigger });
}

export function PreAction(trigger: string | string[]) {
  return actionDecorator({ on: "post_action", trigger });
}
