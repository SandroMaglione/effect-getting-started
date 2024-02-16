import { main } from "./Core.js";
import { runPromise } from "./Runtime.js";

runPromise(main)
  .then(console.log)
  .catch((defect) => {
    console.error(defect);
    process.exit(1);
  });
