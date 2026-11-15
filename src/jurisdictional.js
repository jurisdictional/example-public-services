// A minimal client for the Jurisdictional API: https://jurisdictional.org/developers
// Reads are free: 100 a day per IP without a token, more with a free one.
// Runs in the browser (GitHub Pages) and in Node 20+, with no dependencies.

const env = globalThis.process?.env ?? {};

export const BASE_URL = env.JURISDICTIONAL_BASE_URL ?? "https://jurisdictional.org";

// The request URLs, so the page can show exactly what it fetched.
export const urls = {
  juricode: (address) =>
    `${BASE_URL}/api/v1/juricode?${new URLSearchParams({ address })}`,
  hsdsServices: (jurisdictionId, perPage = 50) =>
    `${BASE_URL}/api/hsds/services?${new URLSearchParams({
      jurisdiction_id: String(jurisdictionId),
      per_page: String(perPage),
    })}`,
  hsdsService: (id) => `${BASE_URL}/api/hsds/services/${encodeURIComponent(id)}`,
  nativeServices: (jurisdictionId, limit = 50) =>
    `${BASE_URL}/api/v1/services?${new URLSearchParams({
      jurisdiction_id: String(jurisdictionId),
      limit: String(limit),
    })}`,
};

// Fetches a URL and returns its JSON body.
// A non-200 answer throws with the API's own message; nothing fails silently.
export async function getJSON(url) {
  const response = await fetch(url);
  const body = await response.json().catch(() => null);

  if (response.status === 429) {
    throw new Error(
      "The Jurisdictional API's free daily limit for this connection is used up (100 requests a day without a token). Try again tomorrow, or use the recorded example.",
    );
  }

  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Jurisdictional API answered ${response.status} for ${url}`);
  }

  return body;
}

// The `data` of GET /api/v1/juricode: the geocoded point and every
// jurisdiction in force there, from the nation down to the city.
export async function juricode(address) {
  return (await getJSON(urls.juricode(address))).data;
}

export const hsdsServices = (jurisdictionId) => getJSON(urls.hsdsServices(jurisdictionId));
export const hsdsService = (id) => getJSON(urls.hsdsService(id));
export const nativeServices = (jurisdictionId) => getJSON(urls.nativeServices(jurisdictionId));
