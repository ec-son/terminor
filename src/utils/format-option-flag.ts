export function formatOptionFlag(
  flag: string,
  alias?: string
): { flag: string; alias?: string; longFormat: string } {
  flag = flag.replace(/^-{0,}/, "--");

  alias = alias && alias.replace(/^-{0,}/, "-");

  return {
    flag,
    alias,
    longFormat: `${alias ? alias + ", " : ""}${flag}`,
  };
}
