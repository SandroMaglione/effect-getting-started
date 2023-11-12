import { Effect, Layer, Runtime, Scope } from "effect";
import * as EmailService from "./EmailService";

const layer = EmailService.EmailServiceLive;

const runtimeEffect = Effect.gen(function* (_) {
  const scope = yield* _(Scope.make());
  const runtime = yield* _(Layer.toRuntime(layer), Scope.extend(scope));
  return runtime;
});

export async function runPromise<E, A>(
  effect: Effect.Effect<Layer.Layer.Success<typeof layer>, E, A>
): Promise<A> {
  const runtime = await Effect.runPromise(runtimeEffect);
  return Runtime.runPromise(runtime)(effect);
}
