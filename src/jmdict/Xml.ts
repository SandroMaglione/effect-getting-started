import { Data, Effect } from "effect";
// @ts-expect-error
import xml2js from "xml2js";
import * as StreamedReader from "./StreamedReader.js";

export const xml2jsAttributeKey = "attr";
export const xml2jsTextKey = "text";

class XmlError extends Data.TaggedError("XmlError")<{
  error: unknown;
}> {}

/// Using a streamed file buffer, parses the XML file according
/// to the given `main` and `entry` tags, converts each entry
/// to a JSON object, and yields these objects interpreted as the
/// given `T` type (without type-checking).
export async function* iterateEntriesStreamed<T extends object>(
  filename: string,
  mainTagId: string,
  entryTagId: string
): AsyncGenerator<T> {
  Effect.gen(function* (_) {
    const reader = yield* _(StreamedReader.StreamedReader);
    // const reader = await StreamedReader.create(filename);
    yield* _(reader.skipTo(`<${mainTagId}>`));

    const entryTagStart = `<${entryTagId}>`;
    const entryTagEnd = `</${entryTagId}>`;

    const readEntry = Effect.gen(function* (_) {
      yield* _(reader.skipTo(entryTagStart));

      const entryStr = yield* _(reader.readTo(entryTagEnd));
      if (entryStr === null) return null;

      let entryXml = entryTagStart + entryStr;
      entryXml = entryXml.replace(/\&(.*?)\;/g, "$1");

      const entryObj = yield* _(
        Effect.tryPromise<any, XmlError>({
          try: () =>
            xml2js.parseStringPromise(entryXml, {
              attrkey: xml2jsAttributeKey,
              charkey: xml2jsTextKey,
            }),
          catch: (error) => new XmlError({ error }),
        })
      );

      return entryObj[entryTagId] as T;
    });

    let prevPercent = globalThis.BigInt(-1);

    while (true) {
      const curPercent = reader.getProgressFraction() * globalThis.BigInt(100);

      if (curPercent !== prevPercent) {
        // TODO
        // Logging.logProgressPercentage(logger, curPercent);
        prevPercent = curPercent;
      }

      const entryObj = yield* _(readEntry);
      if (entryObj === null) break;

      yield entryObj;
    }

    // TODO
    // Logging.logProgressPercentage(logger, 100);
  }).pipe(Effect.provide(StreamedReader.StreamedReader.Live(filename)));
}
