import * as Http from "@effect/platform/HttpClient";
import * as Schema from "@effect/schema/Schema";
import {
  Cache,
  Console,
  Context,
  Data,
  Duration,
  Effect,
  Request,
  RequestResolver,
  Schedule,
  flow,
} from "effect";

class PokemonClientError extends Data.TaggedError("PokemonClientError")<{
  reason: string;
  error: unknown;
}> {}

class Pokemon extends Schema.Class<Pokemon>()({
  name: Schema.string,
  types: Schema.struct({ type: Schema.struct({ name: Schema.string }) }).pipe(
    Schema.nonEmptyArray
  ),
}) {}

class Type extends Schema.Class<Type>()({
  name: Schema.string,
}) {}

const client = Http.client.fetchOk().pipe(
  Http.client.mapRequest(
    flow(
      Http.request.prependUrl("https://pokeapi.co/api/v2"),
      Http.request.setMethod("GET"),
      Http.request.acceptJson
    )
  ),
  Http.client.catchAll(
    (error) => new PokemonClientError({ error, reason: "HttpClient" })
  )
);

class GetPokemon extends Request.TaggedClass("GetPokemon")<
  PokemonClientError,
  Pokemon,
  { readonly id: number }
> {}

const GetPokemonResolver = RequestResolver.fromEffect((req: GetPokemon) =>
  Http.request.get(`/pokemon/${req.id}`).pipe(
    client,
    Effect.flatMap(Http.response.schemaBodyJson(Pokemon)),
    Effect.catchTags({
      ParseError: (error) => new PokemonClientError({ error, reason: "Parse" }),
      ResponseError: (error) =>
        new PokemonClientError({ error, reason: "Response" }),
    }),
    Effect.scoped
  )
);

const getPokemon = (id: number) =>
  Effect.request(new GetPokemon({ id }), GetPokemonResolver);

class GetType extends Request.TaggedClass("GetType")<
  PokemonClientError,
  Type,
  { readonly name: string }
> {}

const GetTypeResolver = RequestResolver.fromEffect((req: GetType) =>
  Http.request.get(`/type/${req.name}`).pipe(
    client,
    Effect.flatMap(Http.response.schemaBodyJson(Type)),
    Effect.catchTags({
      ParseError: (error) => new PokemonClientError({ error, reason: "Parse" }),
      ResponseError: (error) =>
        new PokemonClientError({ error, reason: "Response" }),
    }),
    Effect.scoped
  )
);

const getType = (name: string) =>
  Effect.request(new GetType({ name }), GetTypeResolver);

const cacheSource = Cache.make({
  capacity: globalThis.Number.MAX_SAFE_INTEGER,
  timeToLive: Infinity,
  lookup: (key: number) =>
    Effect.gen(function* (_) {
      const pokemon = yield* _(getPokemon(key));
      yield* _(Console.info("Request a pokemon", pokemon));
      return pokemon;
    }),
});

const CacheContext =
  Context.GenericTag<Effect.Effect.Success<typeof cacheSource>>("@app/cache");

Effect.gen(function* (_) {
  const cache = yield* _(CacheContext);
  const pokemon = yield* _(cache.get(20));

  yield* _(Console.info(pokemon));

  const type = yield* _(getType(pokemon.types[0].type.name));

  yield* _(Console.info("Got a pokemon type", type));
})
  .pipe(
    Effect.catchTags({
      PokemonClientError: (error) => Console.error(error.reason, error.error),
    }),
    Effect.repeat(
      Schedule.recurs(5).pipe(Schedule.addDelay(() => Duration.millis(1000)))
    ),
    Effect.provideServiceEffect(CacheContext, cacheSource),
    Effect.runPromise
  )
  .then(() => {});
