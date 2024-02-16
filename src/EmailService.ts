import { Config, ConfigError, Context, Effect, Layer } from "effect";

export interface EmailService {
  /**
   * Send an email with the given `message` as content.
   */
  readonly sendEmail: (
    message: string
  ) => Effect.Effect<string, ConfigError.ConfigError>;
}

export const EmailService = Context.GenericTag<EmailService>("@app/EmailService");

export const EmailServiceLive = Layer.effect(
  EmailService,
  Effect.gen(function* (_) {
    const sendEmail: EmailService["sendEmail"] = (message) =>
      Effect.gen(function* (_) {
        const from = yield* _(Config.string("SENDER"));
        return `Send "${message}" from "${from}"`;
      });

    return EmailService.of({ sendEmail });
  })
);
