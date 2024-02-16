import { Effect, Layer, Option, pipe } from "effect";
import { z } from "zod";
import * as Base64 from "./Base64.js";
import * as JsonParse from "./JsonParse.js";
import { parseZod } from "./Zod.js";

const zodSchema = z.object({ example: z.string() });

const program = (recipeIdOrUrl: string) =>
  Effect.gen(function* (_) {
    const idOrUrl = yield* _(Option.fromNullable(recipeIdOrUrl));

    const base64 = yield* _(Base64.Base64Service);
    const idOrUrlData = yield* _(base64.decode(idOrUrl));

    const json = yield* _(JsonParse.JsonParseService);
    const idOrUrlJson = yield* _(json.parse(idOrUrlData));

    return yield* _(idOrUrlJson, parseZod(zodSchema));
  });

const main = (source: string) =>
  pipe(
    program(source),
    Effect.catchAll(() => Effect.succeed(null)),
    Effect.provide(
      Layer.merge(Base64.Base64ServiceLive, JsonParse.JsonParseServiceLive)
    ),
    Effect.runSync
  );

const decoded = main("sh/&sajh/&12saHH");
console.log(decoded);
