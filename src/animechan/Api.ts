import * as Http from "@effect/platform/HttpClient";
import { Context, Data, Effect, Layer } from "effect";
import * as Client from "./Client.js";
import { Quote } from "./Quote.js";

class ApiError extends Data.TaggedError("ApiError")<{
  error: unknown;
}> {}

const make = Effect.gen(function* (_) {
  const client = yield* _(Client.Client);

  const random = Http.request.get("/random").pipe(
    client,
    Effect.flatMap(Http.response.schemaBodyJson(Quote)),
    Effect.catchTags({
      ResponseError: (error) => new ApiError({ error }),
      ParseError: (error) => new ApiError({ error }),
    }),
    Effect.scoped
  );

  return { random };
});

export class Api extends Context.Tag("Api")<
  Api,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(this, make);
}
