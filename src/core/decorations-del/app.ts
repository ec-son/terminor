import { Command } from "commander";
import { appInfo } from "../helpers";

export function App(context?: {
  commands?: Array<any>;
  options?: Array<any>;
  version?: string;
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
        throw new Error(`Command class is expected but got ${typeof program}`);

      const appName = context?.commandName || appInfo("name");
      const version = context?.version || appInfo("version");
      const description = context?.description || appInfo("description");

      if (appName) program.name(appName);
      if (version) program.version(version);
      if (description) program.description(description);

      const commands = context?.commands || [];
      const commandInstances = [];

      commands.forEach((command) => {
        const commandInstance = new Command();

        program.addCommand(commandInstance);
      });

      originalInitFunction.call(this);
    };
  };
}
