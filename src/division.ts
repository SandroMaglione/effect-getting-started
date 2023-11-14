import { Console, Data, Effect, Either, pipe } from "effect";

export class DivideByZeroError extends Data.TaggedError("DivideByZeroError")<{
  a: number;
  b: number;
}> {}

const divide = (
  a: number,
  b: number
): Either.Either<DivideByZeroError, number> =>
  b === 0 ? Either.left(new DivideByZeroError({ a, b })) : Either.right(a / b);

const program = Effect.gen(function* (_) {
  const result = yield* _(divide(10, 2));
  yield* _(Console.log(`Division successful: ${result}`));
});

pipe(
  program,
  Effect.catchTags({
    DivideByZeroError: (error) =>
      Console.log(`Cannot divide ${error.a} and ${error.b}`),
  }),
  Effect.runSync
);
