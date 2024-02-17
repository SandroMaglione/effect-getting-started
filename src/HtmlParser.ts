import { Context, Data, Effect, Layer } from "effect";
import * as NodeHtmlParser from "node-html-parser";
import * as ParsedElement from "./ParsedElement.js";

class HtmlParseError extends Data.TaggedError("HtmlParseError")<{
  error: unknown;
}> {}

const make = {
  parse: ({ data }: { data: string }) =>
    Effect.gen(function* (_) {
      return yield* _(
        Effect.try({
          try: () => NodeHtmlParser.parse(data),
          catch: (error) => new HtmlParseError({ error }),
        })
      );
    }).pipe(
      Effect.map((element) => new ParsedElement.ParsedElement({ element }))
    ),
};

export class HtmlParser extends Context.Tag("HtmlParser")<
  HtmlParser,
  typeof make
>() {
  static Live = Layer.succeed(this, make);
}
