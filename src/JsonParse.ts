import { Brand, Context, Data, Effect, Layer } from "effect";

type JsonString = string & Brand.Brand<"JsonString">;
const JsonString = Brand.nominal<JsonString>();

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  source: string;
  error: unknown;
}> {}

export interface JsonParseService {
  readonly parse: (
    source: string
  ) => Effect.Effect<JsonString, JsonParseError>;
}

export const JsonParseService = Context.GenericTag<JsonParseService>(
  "@app/JsonParseService"
);

export const JsonParseServiceLive = Layer.succeed(
  JsonParseService,
  JsonParseService.of({
    parse: (source) =>
      Effect.try({
        try: () => JsonString(JSON.parse(source)),
        catch: (error) => new JsonParseError({ source, error }),
      }),
  })
);
