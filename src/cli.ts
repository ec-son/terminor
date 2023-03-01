import { program } from "commander";
// import t from "/package.json";

export class Cli {
  constructor(appComponent: any) {
    appComponent.init(program);

    // program.action(appComponent.handler);
    // appComponent.handler();

    // if (appComponent.description) program.description(appComponent.description);
    // if (appComponent.appName) program.description(appComponent.name);
  }

  run() {
    program.parse();
  }
}
