import { commandContainer } from "./tools/command-container";
import { program } from "commander";

export class Cli {
  constructor(AppComponent: any) {
    const app = new AppComponent();
    commandContainer.setCommand({
      commandInstance: program,
      controllerInstance: app,
      name: AppComponent.name,
    });

    app.init(program);
  }

  run() {
    program.parse();
  }
}
