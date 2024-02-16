import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import * as Base64 from "../src/Base64.js";

describe("Base64", () => {
  describe("decode", () => {
    it("should decode from Base64 to string", () => {
      const result = Base64.Base64Service.pipe(
        Effect.flatMap((base64) => base64.decode("Zm9vYmFy")),
        Effect.provide(Base64.Base64ServiceLive),
        Effect.runSync
      );
      expect(result).toBe("foobar");
    });
  });
});
