#!/usr/bin/env node
// Records the example the page shows on load, so it makes no API calls until
// someone searches. Writes public/example/: juricode.json, hsds-<id>.json and
// native-<id>.json for each service layer, and meta.json.
//
//   node bin/record-example.js ["300 Hemlock St, Vacaville, CA 95688"]
//
// Exits non-zero, naming the failing URL, on any error.

import { mkdir, writeFile } from "node:fs/promises";
import { getJSON, urls } from "../src/jurisdictional.js";
import { serviceLayers } from "../src/render.js";

const address = process.argv[2] ?? "300 Hemlock St, Vacaville, CA 95688";
const dir = new URL("../public/example/", import.meta.url);

async function save(name, url) {
  const body = await getJSON(url);
  await writeFile(new URL(name, dir), JSON.stringify(body, null, 2) + "\n");
  console.log(`saved ${name} from ${url}`);
  return body;
}

try {
  await mkdir(dir, { recursive: true });
  const juricode = await save("juricode.json", urls.juricode(address));
  const layers = serviceLayers(juricode.data);
  const requests = [urls.juricode(address)];

  for (const layer of layers) {
    await save(`hsds-${layer.id}.json`, urls.hsdsServices(layer.id));
    await save(`native-${layer.id}.json`, urls.nativeServices(layer.id));
    requests.push(urls.hsdsServices(layer.id), urls.nativeServices(layer.id));
  }

  const meta = { address, recorded_at: new Date().toISOString(), layers, requests };
  await writeFile(new URL("meta.json", dir), JSON.stringify(meta, null, 2) + "\n");
  console.log(`recorded ${layers.length} layers for ${address}`);
} catch (error) {
  console.error(`record-example failed: ${error.message}`);
  process.exit(1);
}
