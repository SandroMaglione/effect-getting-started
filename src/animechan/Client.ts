import * as Http from "@effect/platform/HttpClient";
import { Config, Context, Data, Effect, Layer, flow } from "effect";

export interface ClientOptions {
  baseUrl: string;
}

class ClientError extends Data.TaggedError("ClientError")<{
  error: Http.error.HttpClientError;
}> {}

const make = (options: ClientOptions) =>
  Http.client.fetchOk().pipe(
    Http.client.mapRequest(
      flow(Http.request.prependUrl(options.baseUrl), Http.request.acceptJson)
    ),
    Http.client.catchAll((error) => new ClientError({ error }))
  );

export class Client extends Context.Tag("Client")<
  Client,
  ReturnType<typeof make>
>() {
  static readonly Live = (config: Config.Config.Wrap<ClientOptions>) =>
    Config.unwrap(config).pipe(Effect.map(make), Layer.effect(this));
}
