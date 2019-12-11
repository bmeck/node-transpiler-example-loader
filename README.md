This loader compiles files so that single quoted strings are upper cased. The parser is written poorly since it is an example, and doesn't account for template literals etc.

Example usage:

```console
node --experimental-loader ./loader.mjs  ./example/a.shoutjs
```

It does so by translating things into base64 encoded `data:` URLs and cross referencing already resolved URL with their original source URLs and vice versa.
