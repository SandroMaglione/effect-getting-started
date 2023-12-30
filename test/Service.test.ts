import { Context, Effect } from "effect";
import { describe, expect, it } from "vitest";

interface FService {
  sf: (param: number) => Effect.Effect<never, never, string>;
  sc: Effect.Effect<never, never, number>;
}

interface PService {
  PORT: number;
}

const FService = Context.Tag<FService>();
const service = Context.Tag<PService>();

const func = (s: PService) => (str: string) => `${s.PORT}_$${str}$`;

describe("Service", () => {
  it("require", () => {
    const result = Effect.gen(function* (_) {
      const s1 = yield* _(Effect.serviceOption(service));

      // Get service content and use it in a function
      const s2 = yield* _(s1._tag, Effect.serviceFunction(service, func));

      // Add `NoSuchElementException` to error channel
      const s3 = yield* _(Effect.serviceOptional(service));

      // Constants = No params, returning `Effect`
      const { sc } = Effect.serviceConstants(FService);

      // Functions = With params, returning `Effect`
      const { sf } = Effect.serviceFunctions(FService);

      const f = yield* _(sf(10));
      const s = yield* _(sc);

      return `${s3.PORT}-${s2}-${s1._tag}-${f}-${s}`;
    }).pipe(
      Effect.provideService(service, { PORT: 80 }),
      Effect.provideServiceEffect(
        FService,
        Effect.succeed({
          sc: Effect.succeed(21),
          sf: (n) => Effect.succeed(`${n}`),
        })
      ),
      Effect.runSync
    );
    expect(result).toBe("80-80_$Some$-Some-10-21");
  });
});
