import { ArgumentType } from "./../../src/types/argument.type";
import { Argument } from "commander";

jest.mock("commander", () => {
  return {
    ...jest.requireActual("commander"),
    Argument: function (arg: string, description?: string | undefined) {
      this.required = true;
      this.argParser = function (fn: (value: string, previous: any) => any) {
        fn("value", "previous");
      };
    },
  };
});

// const command = new (function () {
//   this.addArgument = function (arg) {
//     this.arguments.push(arg);
//   };
// })();

describe("process arguments", () => {
  it("", () => {
    const args: Array<ArgumentType> | undefined = [
      {
        argumentName: "foo",
        type: Number,
      },
      {
        argumentName: "bar",
        type: String,
        default: "text",
      },
    ];
  });
});
