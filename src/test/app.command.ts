import { GenerateCommand } from "./generate.commande";
import { ServiceCommand } from "./service.commande";
import { TextFileCommand } from "./text-file.command";
import { App, Command } from "../decorators";

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
      default: 7,
    },
    {
      name: "file",
      description: "The name of the command",
      // required: true,
      type: "string",
    },
  ],
  subCommands: ["generate", "text-file", "service"],
  commands: [
    TextFileCommand,
    ServiceCommand,
    GenerateCommand,
    // ServiceCommand,
    // ServiceCommand,
    // TextFileCommand,
  ],
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
    console.log("I'am at App Command");
    console.log(obj);
  }
  init() {
    // console.log("init");
  }
}
