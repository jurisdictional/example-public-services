// Pure functions from API records to what the page shows. No DOM, so Node tests them.

// Governments that run services, nearest first.
// Electoral districts (congressional, legislative, council, supervisorial)
// elect people but run no services, so they are left out.
const ORDER = ["place", "school_district", "special_district", "county", "state", "federal"];

const LABELS = {
  place: "City",
  school_district: "School district",
  special_district: "Special district",
  county: "County",
  state: "State",
  federal: "Federal",
};

function kind(level) {
  if (level.startsWith("school_district")) return "school_district";
  if (level.startsWith("special_district")) return "special_district";
  return ORDER.includes(level) ? level : null;
}

// The juricode layers that can have services, nearest government first.
export function serviceLayers(juricodeData) {
  return juricodeData.jurisdictions
    .filter((j) => kind(j.level))
    .map((j) => ({
      id: j.id,
      name: j.display_name ?? j.name,
      level: j.level,
      label: LABELS[kind(j.level)],
    }))
    .sort((a, b) => ORDER.indexOf(kind(a.level)) - ORDER.indexOf(kind(b.level)));
}

// One HSDS service_list record as a card.
// Fields the record leaves out stay out; nothing is made up.
export function card(service) {
  return {
    id: service.id,
    name: service.name,
    organization: service.organization?.name ?? null,
    description: service.description ?? null,
    url: service.url ?? null,
    fees: service.fees_description ?? null,
    eligibility: service.eligibility_description ?? null,
  };
}

// An HSDS services page as "showing N of M".
export function pageSummary(page) {
  return { shown: page.size ?? page.contents.length, total: page.total_items ?? page.contents.length };
}

// One full HSDS service record as contact details: phones and addresses.
export function details(service) {
  const phones = (service.phones ?? []).map((p) => p.number);
  const locations = (service.organization?.locations ?? []).map((l) => ({
    name: l.name ?? null,
    address: (l.addresses ?? [])
      .map((a) => [a.address_1, a.city, `${a.state_province} ${a.postal_code}`].filter(Boolean).join(", "))
      .join("; "),
  }));
  return { phones, locations };
}
