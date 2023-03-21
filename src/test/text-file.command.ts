import { ServiceCommand } from "./service.commande";
import { GenerateCommand } from "./generate.commande";
import { Command, Option } from "../decorators";

@Command({
  commandName: "text-file",
  alias: "t",
  arguments: [
    {
      name: "name",
      type: "string",
      description: "name of text file",
    },
  ],
  // commands: [GenerateCommand],
})
export class TextFileCommand {
  @Option({
    name: "-g, --gen",
    type: "number",
    default: 1,
  })
  gen: boolean;

  handler(obj) {
    console.log(
      "🚀 ~ file: text-file.command.ts:24 ~ TextFileCommand ~ handler ~ obj:",
      obj
    );
    console.log("==================================");

    console.log("======================");

    console.log("handler: ", this.gen);
  }
}
