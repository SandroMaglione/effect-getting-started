import { Console, Effect, LogLevel, Logger } from "effect";
import * as EmailService from "./EmailService.js";

const program = Effect.gen(function* (_) {
  yield* _(Effect.logInfo("This is running!"));

  const emailService = yield* _(EmailService.EmailService);
  const response = yield* _(emailService.sendEmail("Here we go!"));

  yield* _(Effect.logInfo(`Done: ${response}`));

  return response;
}).pipe(Logger.withMinimumLogLevel(LogLevel.Info));

export const main = program.pipe(
  Effect.catchTags({
    Unsupported: (error) => Console.error(error.message),
    InvalidData: (error) => Console.error(error.message),
    MissingData: (error) => Console.error(error.message),
    SourceUnavailable: (error) => Console.error(error.message),
  }),
  Effect.catchAll(() => Console.error("Some error!"))
);
