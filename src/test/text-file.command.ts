import { Command, Option } from "../decorators";

@Command({
  commandName: "text-file",
  alias: "t",
  arguments: [
    {
      name: "name",
      type: Number,
      // choices: ["red", "blue", "green", "yellow", "orange"],
      choices: [12, 34, 5, 6],
      default: 12,
      description: "name of text file",
    },
  ],
  subCommands: ["generate", "service"],
})
export class TextFileCommand {
  @Option({
    name: "-g, --gen",
    type: Number,
    choices: [0, 5],
    default: 5,
    // required: true,
  })
  gen: boolean;

  handler(obj) {
    console.log("==================================");
    console.log("I'am at Text-File Command");
    console.log(obj);
    console.log(this.gen);
  }
}
