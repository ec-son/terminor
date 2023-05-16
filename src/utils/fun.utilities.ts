// import { KsError } from "../exceptions/ks-error";

// function processOption(optionName?: string, alias?: string) {
//   if (!optionName && !alias)
//     throw new KsError("option name must be defined or alias");

//   if (optionName && alias)
//     return `-${alias.replace(/^-+/, "")}, --${optionName.replace(/^-+/, "")}`;

//   return alias
//     ? "-" + alias.replace(/^-+/, "")
//     : "--" + optionName?.replace(/^-+/, "");
// }

// export { processOption };
