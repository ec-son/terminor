import { Command } from "commander";
import { commandContainer } from "../../src/utils/command-container";

/**
 * length
 * setCommand
 * getCommand
 * getCommandByCommandName
 * forEach
 */
describe("command container", () => {
  commandContainer.setCommand({
    commandInstance: new Command("text1"),
    controllerInstance: "text1",
    commandNameIndex: Symbol(),
    name: "text1",
    optionIndex: Symbol(),
    subCommandIndex: Symbol(),
  });

  const mockFunction = jest.fn();

  const command1 = {
    commandInstance: new Command("text2"),
    controllerInstance: "text2",
    commandNameIndex: Symbol(),
    name: "text2",
    optionIndex: Symbol(),
    subCommandIndex: Symbol(),
  };

  const command2 = {
    commandInstance: new Command("text3"),
    controllerInstance: mockFunction,
    commandNameIndex: Symbol(),
    name: "text3",
    optionIndex: Symbol(),
    subCommandIndex: Symbol(),
  };
  commandContainer.setCommand(command1);
  commandContainer.setCommand(command2);
  mockFunction[command2.commandNameIndex] = "text_3";

  it("should return length of command array", () => {
    expect(commandContainer.length).toBe(3);
  });

  const table1 = [
    { ...command1, controllerInstance: "text22" },
    { ...command2, name: "text33" },
  ];
  it.each(table1)(
    "should throw error if duplicate command is found",
    (command) => {
      expect(() => commandContainer.setCommand(command)).toThrow();
    }
  );

  const table2 = [
    { search: "text2", expected: "text2" },
    { search: mockFunction, expected: "text3" },
  ];
  it.each(table2)("should return command", ({ search, expected }) => {
    expect(commandContainer.getCommand(search)).toHaveProperty(
      "name",
      expected
    );
  });

  it("should return command by command name", () => {
    expect(commandContainer.getCommandByCommandName("text_3")).toHaveProperty(
      "name",
      "text3"
    );
  });

  const mockClb = jest.fn();
  commandContainer.forEach(mockClb);

  it("should be called 3 times", () => {
    expect(mockClb).toBeCalledTimes(3);
  });

  it("should be called with expected first arguments", () => {
    expect(mockClb.mock.calls[2][0]).toEqual(command2);
  });

  it("should be called with expected second arguments", () => {
    expect(mockClb.mock.calls[2][1]).toEqual(2);
  });

  it("should be called with expected third arguments", () => {
    expect(mockClb.mock.calls[2][2]).toContainEqual(command1);
  });
});
