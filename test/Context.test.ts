import { Context, Effect, pipe } from "effect";
import { describe, expect, it } from "vitest";

const Port = Context.GenericTag<{ PORT: number }>("@services/Port");
const Timeout = Context.GenericTag<{ TIMEOUT: number }>("@services/Timeout");

describe("Context", () => {
  it("add and merge work the same", () => {
    const portContext = Context.make(Port, { PORT: 8080 });

    const Services = pipe(portContext, Context.add(Timeout, { TIMEOUT: 5000 }));
    const ServicesMerge = Context.merge(
      portContext,
      Context.make(Timeout, { TIMEOUT: 5000 })
    );

    expect(Services).toStrictEqual(ServicesMerge);
  });

  it("can make and extract value", () => {
    const made = Context.make(Port, { PORT: 10 });
    const { PORT } = made.pipe(Context.get(Port));
    expect(PORT).toBe(10);
  });

  it("can extract a context in Effect.gen", () => {
    const result = Effect.gen(function* (_) {
      const port = yield* _(Port);
      return port.PORT;
    }).pipe(
      Effect.provideService(
        Port,
        Context.make(Port, { PORT: 10 }).pipe(Context.get(Port))
      ),
      Effect.runSync
    );
    expect(result).toBe(10);
  });
});
