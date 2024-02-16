import { Context, Data, Effect, Encoding, Layer } from "effect";

class Base64DecodeError extends Data.TaggedError("Base64DecodeError")<{
  source: string;
  error: Encoding.DecodeException;
}> {}

export interface Base64Service {
  readonly decode: (
    source: string
  ) => Effect.Effect<string, Base64DecodeError>;
}

export const Base64Service = Context.GenericTag<Base64Service>("@app/Base64Service");

export const Base64ServiceLive = Layer.succeed(
  Base64Service,
  Base64Service.of({
    decode: (source) =>
      Encoding.decodeBase64String(source).pipe(
        Effect.mapError((error) => new Base64DecodeError({ source, error }))
      ),
  })
);
