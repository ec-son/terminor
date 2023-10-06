import { MetaDataType } from "../../src/types/metadata.type";
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
    commandInstance: "text1",
    index: Symbol(),
    name: "text1",
  });

  const mockFunction = jest.fn();

  const command1 = {
    commandInstance: "text2",
    name: "text2",
    index: Symbol(),
  };

  const command2 = {
    commandInstance: mockFunction,
    name: "text3",
    index: Symbol(),
  };
  commandContainer.setCommand(command1);
  commandContainer.setCommand(command2);

  mockFunction[command2.index] = { commandName: "text_3" } as MetaDataType;

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

  it("should return metadata", () => {
    expect(commandContainer.getCommand("text3", true)).toEqual({
      commandName: "text_3",
    });
  });

  it("should return command by command name", () => {
    expect(commandContainer.getCommandByCommandName("text_3")).toHaveProperty(
      "name",
      "text3"
    );
  });

  it("should return metadata by command name", () => {
    expect(commandContainer.getCommandByCommandName("text_3", true)).toEqual({
      commandName: "text_3",
    });
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
