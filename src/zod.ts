import { Data, Either } from "effect";
import type { z } from "zod";

class ZodParseError<In> extends Data.TaggedError("ZodParseError")<{
  error: z.ZodError<In>;
}> {}

/**
 * If you need to migrate your app from `zod` to `@effect/schema` this
 * function can be useful to convert a `zod` parsed schema to
 * `Either` (`effect`).
 */
export const parseZod =
  <ReqOut, ReqIn>(schema: z.Schema<ReqOut, z.ZodTypeDef, ReqIn>) =>
  <T>(data: T): Either.Either<ReqOut, ZodParseError<ReqIn>> => {
    const parsed = schema.safeParse(data);
    return parsed.success
      ? Either.right(parsed.data)
      : Either.left(new ZodParseError({ error: parsed.error }));
  };
