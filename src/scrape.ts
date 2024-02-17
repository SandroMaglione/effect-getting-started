import {
  Console,
  Effect,
  Layer,
  ReadonlyArray,
  String,
  flow,
  pipe,
} from "effect";
import * as HtmlParser from "./HtmlParser.js";
import * as ParsedElement from "./ParsedElement.js";
import * as Scraper from "./Scraper.js";

const extractFurigana = (element: ParsedElement.ParsedElement) =>
  Effect.gen(function* (_) {
    const furigana = yield* _(element.querySelector("furigana"));
    const kanji = yield* _(
      furigana,
      Effect.flatMap((element) => element.querySelectorAll("kanji"))
    );

    return yield* _(Effect.all(kanji.map((element) => element.textContent)));
  });

const extractKanji = (element: ParsedElement.ParsedElement) =>
  Effect.gen(function* (_) {
    const text = yield* _(element.querySelector("text"));
    const kanji = yield* _(
      text,
      Effect.flatMap((element) => element.textContent)
    );

    return pipe(kanji, String.trim, String.split(""));
  });

const fetchUrl = (word: string) =>
  Effect.gen(function* (_) {
    const scraper = yield* _(Scraper.Scraper);
    const htmlParser = yield* _(HtmlParser.HtmlParser);

    const text = yield* _(
      scraper.getWebpage({ url: `https://jisho.org/search/${word}` })
    );
    const element = yield* _(htmlParser.parse({ data: text }));
    const mainWord = yield* _(element.querySelector("exact_block"));
    const japanese = yield* _(
      mainWord,
      Effect.flatMap((element) => element.querySelector("japanese"))
    );

    return yield* _(
      japanese,
      Effect.flatMap((element) =>
        Effect.all({
          furigana: extractFurigana(element),
          kanji: extractKanji(element),
        })
      ),
      Effect.map(({ furigana, kanji }) =>
        pipe(kanji, ReadonlyArray.zip(furigana))
      )
    );
  });

const program = (words: string[]) =>
  Effect.gen(function* (_) {
    return yield* _(Effect.all(words.map(flow(fetchUrl))));
  });

const MainLayer = Scraper.Scraper.Live.pipe(
  Layer.provideMerge(Layer.mergeAll(HtmlParser.HtmlParser.Live))
);

const runnable = flow(program, Effect.provide(MainLayer));

const main = flow(
  runnable,
  Effect.tapError((error) => Console.log(error))
);

Effect.runPromise(main(["全部", "分かる"]))
  .then(console.log)
  .catch(console.error);
