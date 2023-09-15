import { ArgumentType } from "./../../src/types/argument.type";

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

describe("process arguments", () => {
  it("", () => {
    const args: Array<ArgumentType> | undefined = [
      {
        argumentName: "foo",
        type: "number",
      },
      {
        argumentName: "bar",
        type: "string",
        default: "text",
      },
    ];
  });
});
