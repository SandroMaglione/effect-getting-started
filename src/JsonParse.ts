import { Context, Data, Effect, Layer } from "effect";

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  source: string;
  error: unknown;
}> {}

export interface JsonParseService {
  readonly parse: (
    source: string
  ) => Effect.Effect<never, JsonParseError, string>;
}

export const JsonParseService = Context.Tag<JsonParseService>(
  "@app/JsonParseService"
);

export const JsonParseServiceLive = Layer.succeed(
  JsonParseService,
  JsonParseService.of({
    parse: (source) =>
      Effect.try({
        try: () => JSON.parse(source),
        catch: (error) => new JsonParseError({ source, error }),
      }),
  })
);
