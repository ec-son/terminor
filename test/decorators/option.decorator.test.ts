import { Option } from "../../src/decorators/option.decorator";
import { commandContainer } from "../../src/utils/command-container";
import { MetaDataType } from "../../src/types/metadata.type";
import { choiceVerifing } from "../../src/utils/choice-verification";
import { KsError } from "../../src/exceptions/ks-error";

jest.mock("../../src/utils/command-container");
jest.mock("../../src/utils/choice-verification");
jest.mock("../../src/utils/format-option-flag", () => ({
  formatOptionFlag: (flag: string, alias?: string) => ({
    flag: `--${flag}`,
    alias: alias ? `-${alias}` : undefined,
  }),
}));

describe("Option decorator", () => {
  let mockMetadata: MetaDataType;
  const metaIndex = Symbol("idx");

  beforeEach(() => {
    mockMetadata = {
      commandName: "test",
      args: [],
      options: [],
      subCommandNames: [],
      handlers: [
        {
          methodKey: "handler",
          on: "handler",
          parameters: [],
          isFirstHandler: true,
        },
      ],
      unknownOptions: [],
      excessArguments: [],
      help: { flag: "--help", disabled: true },
    } as any;

    (commandContainer as unknown as { getCommand: jest.Mock }).getCommand =
      jest.fn((inst: any) => {
        // Attach metadata to the instance at the metaIndex
        (inst as any)[metaIndex as any] = mockMetadata;
        return {
          index: metaIndex,
          name: "testCmd",
        };
      });
  });

  it("should add option to metadata.options", () => {
    class TestCmd {
      @((Option as any)({ flag: "verbose", alias: "v", type: "boolean" }))
      verbose: boolean = false;

      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    expect(mockMetadata.options.length).toBeGreaterThan(0);
    expect(mockMetadata.options[0].optionName).toBe("verbose");
    expect(mockMetadata.options[0].flag).toBe("--verbose");
    expect(choiceVerifing).toHaveBeenCalled();
  });

  it("should infer type from property value", () => {
    class TestCmd {
      @((Option as any)({ flag: "count" }))
      count: number = 5;

      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    expect(mockMetadata.options[0].type).toBe("number");
  });

  it("should default to boolean type", () => {
    class TestCmd {
      @((Option as any)({ flag: "flag" }))
      flag: any;

      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    expect(mockMetadata.options[0].type).toBe("boolean");
  });

  it("should use optionName or fall back to propertyKey", () => {
    class TestCmd {
      @((Option as any)({ flag: "test-flag" }))
      myProperty: boolean = false;

      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    expect(mockMetadata.options[0].optionName).toBe("myProperty");
  });

  it("should set default from property value if not provided", () => {
    class TestCmd {
      @((Option as any)({ flag: "config" }))
      config: string = "default.json";

      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    expect(mockMetadata.options[0].default).toBe("default.json");
  });

  it("should add date description suffix", () => {
    class TestCmd {
      @((Option as any)({
        flag: "date",
        type: "date",
        description: " Select a date",
      }))
      date!: Date;

      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }
    }

    const inst = new TestCmd();
    (inst as any).__init__();

    expect(mockMetadata.options[0].description).toEqual(
      "Select a date (e.g. YYYY-MM-DD = 2015-03-31)"
    );
  });

  it("should throw an error when default value do not egal to one of the value's array choice ", () => {
    class TestCmd {
      @((Option as any)({
        choices: [10, 20, 30],
      }))
      age: number = 15;

      __init__() {
        (this as any)[metaIndex as any] = mockMetadata;
      }
    }

    const inst = new TestCmd();

    expect(() => (inst as any).__init__()).toThrow(KsError);
  });
});
