import { Config, ConfigProvider, Effect } from "effect";
import { describe, expect, it } from "vitest";

/** This is used to identify `Config` */
const name = "config-name";

const config = Config.boolean(name).pipe(Config.nested("nesting"));

/**
 * A `ConfigProvider` allows to define concrete values for a `Config`.
 *
 * Used for testing (inject config variables) or when mapping config names
 * to a new custom convention (e.g. `constantCase`, add/remove nesting)
 */
const provider = ConfigProvider.fromMap(
  new Map([["new_$CONFIG_NAME$", "true"]]),
  { pathDelim: "_" }
).pipe(
  ConfigProvider.constantCase, // "nesting.config-name" -> "NESTING.CONFIG-NAME"
  ConfigProvider.unnested("NESTING"), // "NESTING.CONFIG-NAME" -> "CONFIG_NAME"
  ConfigProvider.nested("new"), // "CONFIG_NAME" -> "new.CONFIG_NAME"
  ConfigProvider.within(
    ["new"],
    ConfigProvider.mapInputPath((path) => `$${path}$` as const)
  ) // "new.CONFIG_NAME" -> "new.$CONFIG_NAME$"
); // "new.$CONFIG_NAME$" -> "new_$CONFIG_NAME$"

const main = Effect.gen(function* (_) {
  const cf = yield* _(provider.load(config));
  return cf;
});

describe("ConfigProvider", () => {
  it("load", () => {
    const result = main.pipe(Effect.runSync);
    expect(result).toStrictEqual(true);
  });
});
