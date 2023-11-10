import { Effect } from "effect";
import { main } from "./Core";

Effect.runPromise(main).catch((defect) => {
  console.error(defect);
  process.exit(1);
});
