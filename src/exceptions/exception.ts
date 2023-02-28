import { KsError } from "./ks-error";
export default () => {
  process.on("uncaughtException", function (err) {
    if (err instanceof KsError) {
      console.log(err.message);
    } else throw err;
  });
};
