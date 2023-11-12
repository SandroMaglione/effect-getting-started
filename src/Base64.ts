import { Context, Data, Effect, Layer } from "effect";
import { Base64 } from "js-base64";

export class Base64DecodeError extends Data.TaggedError("Base64DecodeError")<{
  source: string;
}> {}

export interface Base64Service {
  readonly decode: (
    source: string
  ) => Effect.Effect<never, Base64DecodeError, string>;
}

export const Base64Service = Context.Tag<Base64Service>("@app/Base64Service");

export const Base64ServiceLive = Layer.succeed(
  Base64Service,
  Base64Service.of({
    decode: (source) =>
      Effect.try({
        try: () => Base64.decode(source),
        catch: () => new Base64DecodeError({ source }),
      }),
  })
);
