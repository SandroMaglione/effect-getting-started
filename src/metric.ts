import * as Fs from "@effect/platform-node/FileSystem";
import { Console, Effect } from "effect";

Effect.gen(function* (_) {
  const fs = yield* _(Fs.FileSystem);
  const file = yield* _(fs.readFileString(`${__dirname}/file.txt`));
  yield* _(Console.log(`Got file`, file));
})
  .pipe(
    Effect.provide(Fs.layer),
    Effect.catchTags({
      BadArgument: (error) => Console.error(error),
      SystemError: (error) => Console.error(error),
    }),
    Effect.runPromise
  )
  .then(() => {});
