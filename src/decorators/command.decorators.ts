import { Command as _C } from "commander";
import { KsError } from "../exceptions/ks-error";
import { processArgument, processCommand, processHandler } from "../helpers";
import { CommandType } from "../interfaces";

export function Command(context: CommandType) {
  return function (target: Function) {
    const originalInitFunction: Function =
      target.prototype.init || function () {};
    target.prototype.init = function (program: _C) {
      if (program instanceof _C == false)
        throw new KsError(
          `Command class is expected but got ${typeof program}`,
          { type: "error" }
        );

      program.name(context.commandName);
      if (context.description) program.description(context.description);
      if (context.usage) program.usage(context.usage);

      const args = processArgument(context?.arguments, program);
      program.action((...arg: any) => processHandler(args, program, this));
      processCommand(context?.commands, program);

      if (!this._opts || Array.isArray(this._opts)) this._opts = [];
      originalInitFunction.call(this, program);
    };
  };
}
