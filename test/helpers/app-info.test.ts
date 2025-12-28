import { readFileSync, statSync, existsSync } from "fs";
import { appInfo } from "../../src/helpers/index";

jest.mock("fs", () => {
  return {
    ...jest.requireActual("fs"),
    readFileSync: jest.fn(),
    statSync: jest.fn(),
    existsSync: jest.fn(),
  };
});

describe("app info", () => {
  const data = {
    name: "terminor",
    version: "1.0.0",
    description: "A CLI to translate between languages in the terminal",
  };
  it("should return an undefinded when package.json doesn't exist", () => {
    (existsSync as jest.Mock).mockReturnValue(false);
  });

  it("should return an undefinded when package.json isn't a file", () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    (statSync as jest.Mock).mockImplementationOnce(() => ({
      isFile: () => false,
    }));
    expect(appInfo("name")).toBeUndefined();
  });

  const tab = ["", "{}"];
  it.each(tab)(
    "should return an undefinded when property doesn't exist or an invalid json file",
    (d) => {
      (existsSync as jest.Mock).mockReturnValue(true);
      (statSync as jest.Mock).mockImplementationOnce(() => ({
        isFile: () => true,
      }));

      (readFileSync as jest.Mock).mockImplementationOnce(() => ({
        toString: () => d,
      }));
      expect(appInfo("name")).toBeUndefined();
    }
  );

  it("should return an undefinded when property doesn't exist or an invalid json file", () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    (statSync as jest.Mock).mockImplementationOnce(() => ({
      isFile: () => true,
    }));

    (readFileSync as jest.Mock).mockImplementationOnce(() => ({
      toString: () => JSON.stringify(data),
    }));
    expect(appInfo("name")).toBeDefined();
  });
});
