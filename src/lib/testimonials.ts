/**
 * Innovator testimonials for the carousel on the home page.
 *
 * The list is empty on purpose: add an entry only when the innovator has
 * agreed in writing to the quote, their name and role, the organization
 * name and link, and the photo. Keep that approval (an email is fine)
 * with the team's records.
 *
 * The carousel stays hidden on the live site until at least one entry is
 * here. In development it shows draft slides so you can see the layout.
 *
 * Photos: save the event photo in /public/testimonials/ (for example
 * /public/testimonials/acme-health.jpg) and set `photo` to
 * "/testimonials/acme-health.jpg". A landscape photo around 1200×900 works best.
 *
 * Example entry (copy, then replace every field):
 * {
 *   quote: "What they said, in their own words.",
 *   name: "Full Name",
 *   role: "Founder",
 *   organization: "Organization Name",
 *   organizationUrl: "https://www.example.org/",
 *   photo: "/testimonials/organization-name.jpg",
 *   photoAlt: "Describe the photo, e.g. the team at a community health event in Kigali",
 * },
 */

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  organization: string;
  /** Page explaining what the organization does. */
  organizationUrl: string;
  /** Event photo in /public/testimonials/. */
  photo: string;
  photoAlt: string;
};

export const TESTIMONIALS: Testimonial[] = [];
