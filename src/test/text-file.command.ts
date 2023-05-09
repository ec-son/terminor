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
  subCommands: ["generate", "service"],
})
export class TextFileCommand {
  @Option({
    name: "-g, --gen",
    type: "string",
    default: 1,
  })
  gen: boolean;

  handler(obj) {
    console.log("==================================");
    console.log("I'am at Text-File Command");
    console.log(obj);
    console.log(this.gen);
  }
}
