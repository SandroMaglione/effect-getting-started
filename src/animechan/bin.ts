import { Config, Console, Effect, Layer } from "effect";
import * as Api from "./Api.js";
import * as Client from "./Client.js";

const ClientLive = Client.Client.Live({
  baseUrl: Config.string("BASE_URL"),
});

const MainLive = Api.Api.Live.pipe(Layer.provide(ClientLive));

const program: Effect.Effect<void, never, never> = Effect.gen(function* (_) {
  const api = yield* _(Api.Api);
  return yield* _(api.random);
}).pipe(
  Effect.provide(MainLive),
  Effect.flatMap((quote) => Console.log(quote)),
  Effect.catchAll((error) => Console.error(error))
);

Effect.runFork(program);
