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
    };
    commandContainer.setCommand(appInfo);

    app.init(program);

    commandContainer.forEach((commandInfo) => {
      if (commandInfo.name === AppComponent.name) {
        return;
      }
      commandInfo.controllerInstance["init"](commandInfo.commandInstance);
    });

    // commandContainer.forEach((commandInfo) => {
    //   if (commandInfo.name !== AppComponent.name) {
    //     // commandInfo.controllerInstance["initSubCommand"](commandInfo);
    //     commandInfo.commandInstance.addCommand(commandInfo.commandInstance);
    //   }
    //   // commandInfo.commandInstance.addCommand(commandInfo.commandInstance);
    // });

    commandContainer.forEach((commandInfo) => {
      if (commandInfo.name !== AppComponent.name) {
        commandInfo.controllerInstance["initSubCommand"](commandInfo);
      }
    });

    app.initSubCommand(appInfo);

    // commandContainer.forEach((value) => {
    //   console.log("===================================");
    //   console.log(value.name);
    //   console.log(value.controllerInstance[value.subCommandIndex]);
    // });
  }

  run() {
    program.parse();
  }
}
