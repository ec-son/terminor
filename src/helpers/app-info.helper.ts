import { resolve } from "path";
import { readFileSync, statSync, existsSync } from "fs";

export const appInfo = (
  flag: "name" | "version" | "description"
): string | undefined => {
  const pathPackage = resolve("package.json");
  if (!existsSync(pathPackage)) return undefined;
  else if (!statSync(pathPackage).isFile()) return undefined;

  const packageJsonContents = readFileSync(pathPackage).toString();
  const packageJson = JSON.parse(packageJsonContents);
  return packageJson[flag] || undefined;
};
