import * as Http from "@effect/platform/HttpClient";
import { Context, Effect, Layer } from "effect";

const make = {
  getWebpage: ({ url }: { url: string }) =>
    Effect.gen(function* (_) {
      const client = Http.client.fetchOk();
      const req = Http.request.get(url);
      const response = yield* _(req.pipe(client, Effect.scoped));
      return yield* _(response.text);
    }),
};

export class Scraper extends Context.Tag("Scraper")<Scraper, typeof make>() {
  static Live = Layer.succeed(this, make);
}
