import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { serviceLayers, card, pageSummary, details } from "../src/render.js";
import { urls } from "../src/jurisdictional.js";

const example = async (name) =>
  JSON.parse(await readFile(new URL(`../public/example/${name}`, import.meta.url), "utf8"));

test("serviceLayers keeps governments, nearest first, and drops electoral districts", async () => {
  const { data } = await example("juricode.json");
  const layers = serviceLayers(data);

  assert.deepEqual(
    layers.map((l) => l.label),
    ["City", "School district", "County", "State", "Federal"],
  );
  assert.ok(!layers.some((l) => /district$/.test(l.level) && !l.level.startsWith("school")));
});

test("meta.json lists the same layers the page derives", async () => {
  const meta = await example("meta.json");
  const { data } = await example("juricode.json");
  assert.deepEqual(meta.layers, serviceLayers(data));
});

test("every example layer has an HSDS page and a native page", async () => {
  const meta = await example("meta.json");
  for (const layer of meta.layers) {
    const hsds = await example(`hsds-${layer.id}.json`);
    const native = await example(`native-${layer.id}.json`);
    assert.ok(Array.isArray(hsds.contents), `hsds-${layer.id}.json has contents`);
    assert.ok(Array.isArray(native.data), `native-${layer.id}.json has data`);
    assert.equal(hsds.total_items, native.meta.total_count, `same services in both APIs for ${layer.name}`);
  }
});

test("card keeps the HSDS fields and adds nothing", async () => {
  const meta = await example("meta.json");
  const city = await example(`hsds-${meta.layers[0].id}.json`);
  const service = city.contents[0];
  const c = card(service);

  assert.equal(c.id, service.id);
  assert.equal(c.name, service.name);
  assert.equal(c.organization, service.organization.name);
  assert.equal(c.fees, service.fees_description ?? null);
  assert.equal(c.url, service.url ?? null);
});

test("pageSummary reports shown of total", () => {
  assert.deepEqual(pageSummary({ size: 50, total_items: 147, contents: [] }), { shown: 50, total: 147 });
});

test("details reads phones and full addresses", () => {
  const d = details({
    phones: [{ number: "707-784-7900" }],
    organization: {
      locations: [{
        name: "Government Center",
        addresses: [{ address_1: "675 Texas Street", city: "Fairfield", state_province: "CA", postal_code: "94533" }],
      }],
    },
  });
  assert.deepEqual(d, {
    phones: ["707-784-7900"],
    locations: [{ name: "Government Center", address: "675 Texas Street, Fairfield, CA 94533" }],
  });
});

test("request URLs match the documented endpoints", () => {
  assert.equal(urls.hsdsServices(2532), "https://jurisdictional.org/api/hsds/services?jurisdiction_id=2532&per_page=50");
  assert.equal(urls.nativeServices(2532), "https://jurisdictional.org/api/v1/services?jurisdiction_id=2532&limit=50");
});
