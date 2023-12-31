import * as Http from "@effect/platform/HttpClient";
import * as Schema from "@effect/schema/Schema";
import {
  Console,
  Data,
  Effect,
  Request,
  RequestResolver,
  flow,
  pipe,
} from "effect";

class PokemonClientError extends Data.TaggedError("PokemonClientError")<{
  reason: string;
  error: unknown;
}> {}

class Pokemon extends Schema.Class<Pokemon>()({ name: Schema.string }) {}

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
    })
  )
);

const getPokemon = Effect.request(
  new GetPokemon({ id: 23 }),
  GetPokemonResolver
);

pipe(
  getPokemon,
  Effect.flatMap((pokemon) => Console.info("Got a pokemon", pokemon)),
  Effect.catchTags({
    PokemonClientError: (error) => Console.error(error.reason, error.error),
  }),
  Effect.runPromise
).then(() => {});
