import { Data, Effect, Option, ReadonlyArray, flow } from "effect";
import * as NodeHtmlParser from "node-html-parser";

class ParsedElementError extends Data.TaggedError("ParsedElementError")<{
  error: unknown;
}> {}

export class ParsedElement extends Data.TaggedClass("Person")<{
  element: NodeHtmlParser.HTMLElement;
}> {
  querySelectorAll(selector: string) {
    return Effect.try({
      try: () => this.element.querySelectorAll(selector),
      catch: (error) => new ParsedElementError({ error }),
    }).pipe(
      Effect.map(ReadonlyArray.map((element) => new ParsedElement({ element })))
    );
  }

  querySelector(selector: string) {
    return Effect.try({
      try: () => this.element.querySelector(selector),
      catch: (error) => new ParsedElementError({ error }),
    }).pipe(
      Effect.map(
        flow(
          Option.fromNullable,
          Option.map((element) => new ParsedElement({ element }))
        )
      )
    );
  }

  get textContent() {
    return Effect.try({
      try: () => this.element.textContent,
      catch: (error) => new ParsedElementError({ error }),
    });
  }
}
