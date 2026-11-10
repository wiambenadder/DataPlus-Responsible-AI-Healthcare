import "server-only";

import {
  POLICY_ASSESSMENTS,
  POLICY_COUNTRIES,
  POLICY_DOCUMENTS,
} from "./fixtures";
import type {
  PolicyCountry,
  PolicyCountryDetails,
  PolicyDocument,
  PolicyDocumentFilters,
} from "./types";

// This is the first backend boundary for the Policy Codebook. The UI only
// calls these functions or the matching Route Handlers. A future Supabase
// implementation can replace the fixture arrays without changing components.
export async function listPolicyCountries(): Promise<PolicyCountry[]> {
  return POLICY_COUNTRIES;
}

export async function getPolicyCountry(
  iso3: string,
): Promise<PolicyCountryDetails | null> {
  const country = POLICY_COUNTRIES.find(
    (item) => item.iso3 === iso3.toUpperCase(),
  );
  if (!country) return null;

  const assessments =
    POLICY_ASSESSMENTS[country.iso3 as keyof typeof POLICY_ASSESSMENTS];
  if (!assessments) return null;

  return {
    ...country,
    assessments,
    documents: POLICY_DOCUMENTS.filter(
      (document) => document.countryCode === country.iso3,
    ),
  };
}

export async function listPolicyDocuments(
  filters: PolicyDocumentFilters = {},
): Promise<PolicyDocument[]> {
  const query = filters.query?.trim().toLowerCase();
  return POLICY_DOCUMENTS.filter((document) => {
    const haystack = [
      document.country,
      document.countryCode,
      document.title,
      document.localTitle,
      document.agency,
      document.summary,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || haystack.includes(query)) &&
      (!filters.countries?.length ||
        filters.countries.includes(document.countryCode)) &&
      (!filters.categories?.length ||
        filters.categories.some((category) =>
          document.categories.includes(category),
        )) &&
      (!filters.formats?.length || filters.formats.includes(document.format))
    );
  }).sort((a, b) => b.publicationDate.localeCompare(a.publicationDate));
}

export async function getPolicyDocument(
  id: string,
): Promise<PolicyDocument | null> {
  return POLICY_DOCUMENTS.find((document) => document.id === id) ?? null;
}
