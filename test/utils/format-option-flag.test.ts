import { formatOptionFlag } from "../../src/utils/format-option-flag";

/**
 * formatOptionFlag
 */

describe("format option flag", () => {
  const table: Array<{
    alias?: string;
    flags: string;
    expected: { flag: string; alias?: string; longFormat: string };
  }> = [
    {
      alias: "f",
      flags: "force",
      expected: { flag: "--force", alias: "-f", longFormat: "-f, --force" },
    },
    {
      alias: "------f",
      flags: "------force",
      expected: { flag: "--force", alias: "-f", longFormat: "-f, --force" },
    },

    {
      flags: "--force",
      expected: { flag: "--force", longFormat: "--force" },
    },
  ];
  it.each(table)(
    "should return a correct format option flag",
    ({ alias, flags, expected }) => {
      expect(formatOptionFlag(flags, alias)).toEqual(expected);
    }
  );
});
