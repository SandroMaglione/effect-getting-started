import { Effect, Fiber, Layer, Queue, flow } from "effect";
import * as HtmlParser from "./HtmlParser.js";
import * as Scraper from "./Scraper.js";

const fetchUrl = (url: string) =>
  Effect.gen(function* (_) {
    const scraper = yield* _(Scraper.Scraper);
    const htmlParser = yield* _(HtmlParser.HtmlParser);

    const text = yield* _(scraper.getWebpage({ url }));
    return yield* _(htmlParser.parse({ data: text }));
  });

const program = (urls: string[]) =>
  Effect.gen(function* (_) {
    const queue = yield* _(
      Queue.bounded<HtmlParser.HtmlParseElement>(urls.length)
    );

    for (const url in urls) {
      yield* _(
        Effect.fork(fetchUrl(url)),
        Effect.tap(Fiber.mapEffect(queue.offer))
      );
    }

    return yield* _(Queue.takeAll(queue));
  });

const MainLayer = Scraper.Scraper.Live.pipe(
  Layer.provideMerge(Layer.mergeAll(HtmlParser.HtmlParser.Live))
);

const runnable = flow(program, Effect.provide(MainLayer));

const main = flow(runnable);

Effect.runPromise(
  main([
    "https://effect.website/docs/guides/concurrency/queue",
    "https://effect.website/docs/guides/concurrency/fibers",
  ])
)
  .then(console.log)
  .catch(console.error);
