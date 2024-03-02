import { Config, Layer } from "effect";
import * as Api from "./Api.js";
import * as Client from "./Client.js";

const ClientLive = Client.Client.Live({
  baseUrl: Config.string("baseUrl"),
});

const MainLive = Api.Api.Live.pipe(Layer.provide(ClientLive));
