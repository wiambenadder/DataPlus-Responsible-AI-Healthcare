export type PolicyCategory =
  | "governance"
  | "software"
  | "privacy"
  | "validation"
  | "cybersecurity";

export type DepthRating = 0 | 1 | 2 | 3;

export type PolicyFinding = {
  subdomain: string;
  depthRating: DepthRating;
  ratingLabel: string;
  excerpt: string;
  page?: number;
  article?: string;
};

export type PolicyDocument = {
  id: string;
  country: string;
  countryCode: string;
  publicationDate: string;
  year: number;
  title: string;
  localTitle: string;
  agency: string;
  decreeNumber?: string;
  categories: PolicyCategory[];
  format: "Guideline" | "Regulation" | "Strategy" | "Law";
  policyStage: "Operational" | "Implementation" | "Proposed";
  policyType: "Normative" | "Strategic";
  summary: string;
  sourceUrl: string;
  findings: PolicyFinding[];
};

export type AssessmentStatus = "binding" | "draft" | "none" | "extension";

export type AssessmentItem = {
  id: string;
  title: string;
  status: string;
  statusTone: AssessmentStatus;
  details: { label: string; text: string }[];
  sourceDocumentId: string;
};

export type PolicyCountry = {
  name: string;
  iso3: string;
  region: string;
  incomeLevel: string;
  population: string;
  healthSpending: string;
  internetConnectivity: string;
  updatedAt: string;
  agencies: string[];
  governanceSummary: string;
  documentCount: number;
};

export type PolicyCountryDetails = PolicyCountry & {
  assessments: {
    ai: AssessmentItem[];
    baseline: AssessmentItem[];
  };
  documents: PolicyDocument[];
};

export type PolicyDocumentFilters = {
  query?: string;
  countries?: string[];
  categories?: PolicyCategory[];
  formats?: PolicyDocument["format"][];
};
