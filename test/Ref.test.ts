import { Effect, Ref } from "effect";
import { describe, expect, it } from "vitest";

describe("Ref", () => {
  it("keep track of a value", () => {
    const refSource = Ref.make(10);
    const effect = Effect.gen(function* (_) {
      const ref = yield* _(refSource);
      const refValue = yield* _(ref, Ref.get);

      yield* _(Effect.sync(() => expect(refValue).toBe(10)));

      const refSetValue = yield* _(ref, Ref.setAndGet(20));

      yield* _(Effect.sync(() => expect(refSetValue).toBe(20)));

      const refBeforeUpdate = yield* _(
        ref,
        Ref.getAndUpdate((n) => n + 2)
      );

      yield* _(Effect.sync(() => expect(refBeforeUpdate).toBe(20)));
      return yield* _(ref, Ref.get);
    });

    const result = effect.pipe(Effect.runSync);
    expect(result).toBe(22);
  });
});
