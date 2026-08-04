# amadeuskang.com

This is the personal website of Amadeus Kang.

The main site is a single hand-built static page (`index.html`, no build step).
The blog is built with [Eleventy](https://www.11ty.dev/): articles are markdown
files in `articles/`, compiled to static HTML in `_site/`.

## Build

```bash
npm install
npm run build   # outputs to _site/
npm run serve   # dev server with hot reload
```

Deploys serve `_site/`, not the repo root (`index.html` is copied through
unchanged).
