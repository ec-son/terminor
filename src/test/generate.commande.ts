import { TextFileCommand } from "./text-file.command";
import { ServiceCommand } from "./service.commande";
import { Command, Option } from "../decorators";

@Command({
  commandName: "generate",
  alias: "g",
  arguments: [
    {
      name: "filename",
      type: "string",
      description: "Filename to generate",
    },
  ],
  commands: [TextFileCommand],
})
export class GenerateCommand {
  @Option({
    name: "-g, --gen",
    type: "number",
    default: 1,
  })
  gen: boolean;

  handler(obj) {
    console.log("==================================");
    console.log(
      "🚀 ~ file: app.comand.ts:18 ~ AppComponent ~ handler ~ obj:",
      obj
    );

    console.log("======================");

    console.log("handler: ", this.gen);
  }
}
