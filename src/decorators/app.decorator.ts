import { Command } from "commander";
import {
  appInfo,
  processArgument,
  processCommand,
  processHandler,
} from "../helpers";
import { ArgumentType } from "../interfaces";
import { KsError } from "../exceptions/ks-error";

export function App(context?: {
  commands?: Array<any>;
  arguments?: Array<ArgumentType>;
  version?: string;
  usage?: string;
  description?: string;
  commandName?: string;
  helpOption?: {
    name?: string;
    alias?: string;
  };
  versionOption?: {
    name?: string;
    alias?: string;
  };
}) {
  return function (target: Function) {
    const originalInitFunction: Function =
      target.prototype.init || function () {};

    target.prototype.init = function (program: Command) {
      if (program instanceof Command == false)
        throw new KsError(
          `Command class is expected but got ${typeof program}`,
          { type: "error" }
        );

      const appName = context?.commandName || appInfo("name");
      const version = context?.version || appInfo("version");
      const description = context?.description || appInfo("description");

      if (appName) program.name(appName);
      if (version) program.version(version);
      if (description) program.description(description);
      if (context?.usage) program.usage(context?.usage);

      const args = processArgument(context?.arguments, program);
      program.action((...arg: any) => processHandler(args, program, this));
      processCommand(context?.commands, program);

      if (!this._opts || Array.isArray(this._opts)) this._opts = [];
      originalInitFunction.call(this, program);
    };
  };
}
