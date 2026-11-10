/**
 * Innovator testimonials for the carousel on the home page.
 *
 * These come from the 2026 alpha test. Each organization approved its
 * quote and the use of its name and logo on the website. Add a new entry
 * only with the same written approval, and keep that approval (an email is
 * fine) with the team's records.
 *
 * Quotes are the edited versions agreed with the innovators, with small
 * grammar fixes. Don't change the meaning of a quote without asking them.
 *
 * Logos: `logo` can be a file in /public/testimonials/ (for example
 * "/testimonials/simprints.svg") or the logo's address on the
 * organization's own website. Saving the file locally is more reliable;
 * if a logo can't be loaded, the slide shows the organization's name
 * instead. Use `logoOnDark: true` for white logos so they sit on navy.
 */

export type Testimonial = {
  quote: string;
  organization: string;
  /** One short line on what the organization does. */
  description: string;
  /** The organization's own website. */
  url: string;
  /** Logo file or address. Leave empty to show the name as text. */
  logo?: string;
  /** Set for white logos, which need a dark background. */
  logoOnDark?: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The platform's accessibility is generally intuitive. I also like the possibility to export the assessment to include other members of the team, and I like the minimalist approach of the dashboard's design.",
    organization: "Bive",
    description: "Affordable, easy-to-access health care for families in Colombia.",
    url: "https://www.bive.co/",
    logo: "https://static.wixstatic.com/media/ff9fc9_0498300098fc4d1eb8b54f122be84d32~mv2.png",
  },
  {
    quote:
      "I liked the dashboard because it's intuitive and strategic for innovators. For example, you can quickly see where you stand, and with the AI implementation roadmap, you can define how to get there.",
    organization: "Bive",
    description: "Affordable, easy-to-access health care for families in Colombia.",
    url: "https://www.bive.co/",
    logo: "https://static.wixstatic.com/media/ff9fc9_0498300098fc4d1eb8b54f122be84d32~mv2.png",
  },
  {
    quote: "It is easy to navigate, and it loads every page very fast.",
    organization: "Jacaranda Health",
    description: "Improving quality of care and outcomes for every mother and newborn.",
    url: "https://jacarandahealth.org/",
    logo: "https://jacarandahealth.org/ypoagriw/2023/09/JH-LOGO-WHITE-1.svg",
    logoOnDark: true,
  },
  {
    quote:
      "The tool is awesome. The responses accurately capture our processes in most places.",
    organization: "Sevamob",
    description: "An AI-assisted disease management platform.",
    url: "http://sevamob.com/",
    // Sevamob's site only serves its logo over plain http, which browsers
    // block on our https site. Save the logo as
    // /public/testimonials/sevamob.png and set logo to
    // "/testimonials/sevamob.png". Until then the name shows as text.
  },
  {
    quote:
      "I enjoyed navigating the platform, and I think the domains and subdomains are comprehensive, covering many considerations when designing and deploying an AI-driven solution. I like the structure of the roadmap, as it shows innovators the key considerations and thresholds they must address at earlier stages of their development, as well as the recommendations to advance.",
    organization: "Simprints",
    description: "Open-source biometric ID, built with privacy at its core, to help fight poverty and disease.",
    url: "https://www.simprints.com/",
    logo: "https://www.simprints.com/wp-content/uploads/2024/05/simprints-logo-lightbg.svg",
  },
];
