import { main } from "./Core";
import { runPromise } from "./Runtime";

runPromise(main)
  .then(console.log)
  .catch((defect) => {
    console.error(defect);
    process.exit(1);
  });
