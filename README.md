# Public services, open data

> **A [Jurisdictional](https://jurisdictional.org) prototype.**
> Jurisdictional is the open, sourced map of who governs every U.S. address, and the services each government offers.
> This page shows what its Open Referral feed can do.
> Fork it.

Type a U.S. street address and see every public service the governments there offer: city, school district, county, state.
Each service is an [Open Referral](https://openreferral.org/) record in the [Human Services Data Specification (HSDS) 3.3.1](https://docs.openreferral.org/en/v3.3.1/).

## Why

When every government describes its services the same way, any directory, 211 line, city portal or AI assistant can show them without a custom integration.
- **Service providers** keep their services current in one place, and every HSDS reader picks them up.
- **Service directories** load one standard feed of U.S. government services: stable ids, an open license, no scraping.

Open, standard and sourced, the feed is digital public infrastructure: shared civic plumbing anyone can build on.

## Try it

In your browser: [jurisdictional.github.io/example-public-services](https://jurisdictional.github.io/example-public-services/).

The page opens on a recorded example for 300 Hemlock St, Vacaville, CA, so loading it makes no API calls.
A search runs live against the API, from your browser; the page needs no server.

Locally (Node 20 or later, no dependencies):

```sh
npm start        # http://localhost:3000
npm test
```

## The API calls

One call finds the governments at an address, then one call per government reads its services:

```
GET https://jurisdictional.org/api/v1/juricode?address=…
GET https://jurisdictional.org/api/hsds/services?jurisdiction_id=…&per_page=50
GET https://jurisdictional.org/api/hsds/services/:id
```

`GET https://jurisdictional.org/api/hsds` is the feed's root.
Jurisdictional's native endpoint, `GET /api/v1/services?jurisdiction_id=…`, returns the same services with text search and `service_type` and `actions` filters.
The page shows it too, as the option for when you want more than the standard.

Reads are free: 100 requests a day per connection without a token, more with a free one.
The data is under the [ODbL 1.0](https://jurisdictional.org/license); the full reference is [API.md](https://github.com/civicstudio/jurisdictional/blob/main/docs/API.md#open-referral-hsds).

## Re-record the example

```sh
npm run record                                   # 300 Hemlock St, Vacaville, CA 95688
node bin/record-example.js "<another address>"
```

It rewrites `public/example/` and stops with the failing URL on any error.
The page and the tests both read those files.

## Files

- `index.html`: the page.
- `src/jurisdictional.js`: the API calls and their URLs.
- `src/render.js`: records to cards, no DOM, tested in Node.
- `public/example/`: the recorded example.
- `bin/serve.js`, `bin/record-example.js`: local server and recorder.

## License

Code: MIT.
Data: ODbL 1.0, from [jurisdictional.org](https://jurisdictional.org/license).
