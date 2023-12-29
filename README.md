# How to `effect`
This is a collection of examples of how to use [`effect`](https://github.com/Effect-TS/effect).

This is an exploration of **all** (eventually) the features offered by `effect`.

## How to use
Install:

```bash
pnpm install
```

Then you can run each script (take a look at `package.json` for the list of all the scripts you can run):

```bash
pnpm run index
```

> **Note**: The convention is that files that start with a lowercase letter are runnable scripts

***

## Notes

### Base64
No need to install extra libraries like `js-base64`. The `Encoding` module provides encoding/decoding of base64.

### `Context` (`Tag`)
Inside [`GlobalValue`](https://github.com/Effect-TS/effect/blob/main/packages/effect/src/GlobalValue.ts#L17) Effect stores a `globalStore` of type `Map<unknown, any>`.

Inside this store the `Context` module registers a [`tagRegistry`](https://github.com/Effect-TS/effect/blob/14e4393ebe3ba2635c73297bf7cd6750c883e669/packages/effect/src/internal/context.ts#L59):

```ts
const tagRegistry = globalValue("effect/Context/Tag/tagRegistry", () => new Map<any, C.Tag<any, any>>())
```

Inside this registry Effect collects all `Tag`s, created using `Context.Tag` by calling the *internal* [`makeTag`](https://github.com/Effect-TS/effect/blob/14e4393ebe3ba2635c73297bf7cd6750c883e669/packages/effect/src/internal/context.ts#L62).

> [!Note]
> When you pass an `identifier` to `Context.Tag` you specify a key for the `tagRegistry`. Effect [checks the registry](https://github.com/Effect-TS/effect/blob/14e4393ebe3ba2635c73297bf7cd6750c883e669/packages/effect/src/internal/context.ts#L63-L65) when accessing and creating a new tag.

A `Tag` is an instance of [`Pipeable`](https://github.com/Effect-TS/effect/blob/main/packages/effect/src/Pipeable.ts#L9). This allows to chain `.pipe` to an instance of `Tag` to extract the methods of a service.

```ts
interface Base64Service {
  readonly decode: (
    source: string
  ) => Effect.Effect<never, Base64DecodeError, string>;
}

export const Base64Service = Context.Tag<Base64Service>("@app/Base64Service");

/** Use `pipe` to extract the methods from the service 👆 */
const result = Base64.Base64Service.pipe(
  Effect.flatMap((base64) => base64.decode("Zm9vYmFy")),
  Effect.provide(Base64.Base64ServiceLive), // 👈 Then provide a valid instance
  Effect.runSync
);
```