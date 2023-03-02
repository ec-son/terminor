import { App, Option } from "..";
import { GenerateCommand } from "./generate.commande";

@App({
  description: "New command cli",
  commandName: "new-cli",
  arguments: [
    {
      name: "name",
      description: "The name of the command",
      // required: true,
      type: "number",
      choices: ["asd", "cfd", "bds"],
      defeault: 7,
    },
    {
      name: "file",
      description: "The name of the command",
      // required: true,
      type: "string",
    },
  ],
  commands: [GenerateCommand],
})
export class AppCommand {
  // @Option({
  //   name: "-n, --name",
  //   description: "The name of the command",
  //   type: "number",
  //   required: true,
  //   choices: [1, 2, 3, 4],
  //   defeault: 3,
  // })
  private name;
  handler(obj) {
    console.log("==================================");
    console.log(
      "🚀 ~ file: app.comand.ts:18 ~ AppComponent ~ handler ~ obj:",
      obj
    );
    console.log("name option: ", this.name);
    console.log("======================");

    // console.log("handler: ", this.name1);
  }
  init() {
    // console.log("init");
  }
}
