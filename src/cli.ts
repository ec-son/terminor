import { program } from "commander";

export class Cli {
  constructor(appComponent: any) {
    appComponent.init(program);
  }

  run() {
    program.parse();
  }
}
