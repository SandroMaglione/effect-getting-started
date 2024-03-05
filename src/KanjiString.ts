import * as Schema from "@effect/schema/Schema";
import { Brand } from "effect";
import { isKanji } from "wanakana";

type KanjiString = string & Brand.Brand<"KanjiString">;

const KanjiString = Schema.string.pipe(
  Schema.fromBrand(
    Brand.refined<KanjiString>(isKanji, (src) =>
      Brand.error(`String "${src}" is not a valid kanji`)
    )
  )
);
