import * as Schema from "@effect/schema/Schema";

export class Quote extends Schema.Class<Quote>()({
  anime: Schema.string,
  character: Schema.string,
  quote: Schema.string,
}) {}
