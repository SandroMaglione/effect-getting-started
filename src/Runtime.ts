import { Effect, Layer, Runtime, Scope } from "effect";
import * as EmailService from "./EmailService.js";

const appLayer = EmailService.EmailServiceLive;

export const scope = Effect.runSync(Scope.make());

const runtimePromise = Effect.runPromise(
  Layer.toRuntime(appLayer).pipe(Scope.extend(scope))
);

export async function runPromise<E, A>(
  effect: Effect.Effect<A, E, Layer.Layer.Success<typeof appLayer>>
): Promise<A> {
  const runtime = await runtimePromise;
  return Runtime.runPromise(runtime)(effect);
}
