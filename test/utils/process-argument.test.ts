import { processArgument } from "../../src/utils/process-argument";
import { KsError } from "../../src/exceptions/ks-error";

/**
 * processArgument
 */

describe("processArgument", () => {
  it("should return an empty array if args is undefined", () => {
    const result = processArgument(undefined, "commandName");
    expect(result).toEqual([]);
  });

  it('should set argument.type to "string" if it is not defined', () => {
    const args: any[] = [{ type: undefined, argumentName: "text" }];
    const result = processArgument(args, "commandName");
    expect(result[0].type).toEqual("string");
  });

  it('should add date description if argument type is "date"', () => {
    const args: any[] = [
      { type: "date", description: "", argumentName: "text" },
    ];
    const result = processArgument(args, "commandName");
    expect(result[0].description).toContain("(e.g. YYYY-MM-DD = 2015-03-31)");
  });

  it("should set argument.required to true for required arguments", () => {
    const args: any[] = [{ argumentName: "<required>", required: false }];
    const result = processArgument(args, "commandName");
    expect(result[0].required).toBe(true);
    expect(result[0].argumentName).toEqual("required");
  });

  it("should set argument.required to false for optional arguments", () => {
    const args: any[] = [{ argumentName: "[optional]", required: true }];
    const result = processArgument(args, "commandName");
    expect(result[0].required).toBe(false);
    expect(result[0].argumentName).toEqual("optional");
  });

  it("should set argument.variadic to true for variadic arguments", () => {
    const args: any[] = [{ argumentName: "variadic...", variadic: false }];
    const result = processArgument(args, "commandName");
    expect(result[0].variadic).toBe(true);
    expect(result[0].argumentName).toEqual("variadic");
  });

  it("should throw an InvalidDefaultValueError if default value is not valid", () => {
    const args: any[] = [
      {
        default: "invalid",
        choices: ["valid", "also valid"],
        argumentName: "argument",
      },
    ];

    expect(() => {
      processArgument(args, "commandName");
    }).toThrow(KsError);
  });

  it("should set the default value if it is valid according to the choices", () => {
    const args: any[] = [
      {
        argumentName: "argument",
        default: "valid",
        choices: ["valid", "also valid"],
      },
    ]

    const result = processArgument(args, "commandName");
    expect(result[0].default).toBe("valid");
  });
});
