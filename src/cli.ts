import { commandContainer } from "./utils/command-container";
import { program } from "commander";

export class Cli {
  constructor(AppComponent: any) {
    const app = new AppComponent();
    const appInfo = {
      commandInstance: program,
      controllerInstance: app,
      name: AppComponent.name,
      subCommandIndex: Symbol(),
      commandNameIndex: Symbol(),
      optionIndex: Symbol(),
    };
    // commandContainer.setCommand(appInfo);

    app.__init__(program);

    commandContainer.forEach((commandInfo) => {
      if (commandInfo.name === AppComponent.name) {
        return;
      }
      commandInfo.commandInstance["__init__"](commandInfo.commandInstance);
    });

    commandContainer.forEach((commandInfo) => {
      if (commandInfo.name !== AppComponent.name) {
        commandInfo.commandInstance["initSubCommand"](commandInfo);
      }
    });

    app.initSubCommand(appInfo);
  }

  run() {
    program.parse();
  }
}
