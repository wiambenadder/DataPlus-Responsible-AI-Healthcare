# Website redesign and release checklist

The landing page is shared by `/hub` and the signed-out `/` route. Signed-in
users retain their existing overview at `/`. The header now exposes About,
audience benefits, tools, and data use directly, with a mobile disclosure and
Escape-to-close behavior. The navigation stays visible while scrolling; the branding strip scrolls away. Tool cards now include one small decorative icon each and the assessment card and menu open the public introduction at `/ai-readiness`; its Begin button opens `/report/assessment`. Signed-out visitors are sent to login with a return path to the assessment. No tool processing or assessment prompts changed.

## Sources and branding

Project history, roles, and named contributors come from README.md; the homepage and About project-team credit use Duke Bass Connections at the project owner’s request.
Duke brand references reviewed on October 26, 2026:
- https://brand.duke.edu/logos/
- https://brand.duke.edu/branding/
- https://dukeghic.org/who-we-are/
- https://www.innovationsinhealthcare.org/partnerships/
- Comparable Duke partnership presentation: https://globalhealth.duke.edu/about/our-partners

Local logo files preserve the original official assets:
- `public/brand/duke-ghic-white.png`: https://dukeghic.org/wp-content/uploads/sites/20/2017/09/Global-Health-Innovation-Center-logo-FINAL-white-768x141.png
- `public/brand/iih-white.png`: https://www.innovationsinhealthcare.org/assets/components/ipihd/img/logo-white.png

These are existing source logos, not proof of project-specific usage approval.
Confirm use and placement with both organizations and Duke's licensing office.
Keep marks separate, proportionate, and surrounded by clear space; do not make
an improvised combined logo. Confirm the team names/roles before public release.

## Photography and testimonials

Only the existing hero photo remains on the landing page. The visible credit
links to its source; it is labeled illustrative. No new regional imagery or
permission has been invented. Obtain and retain written website-use permission
and agreed credits, and review future images for representation including Asia.

Three placeholder cards are visible only outside production. Each says
“Testimonial pending approval”; they are prompts, not invented quotations.
Production renders no unfilled testimonial section. Add actual testimonials
only with permission, approved attribution, and an explicit approval record.
Confirm organization listing permissions; participation is distinct from endorsement.

## Data verification before wider launch

Beta badges, the pilot page, and pilot promotion have been removed from the website. General data inquiries link directly to Duke GHIC’s published email address.

The new pre-upload notice covers the PDF assessment and legacy upload page.
Verify deployed Supabase database/storage access rules, organization membership,
admin access, authorization of upload and AI endpoints, storage visibility,
AI provider configuration/terms, logging, retention, backups, and deletion.
Do not treat the explanatory text as a security audit or proof of controls.
Publish verified policy details and a dedicated support/deletion inbox in SITE.
Until then, access and deletion questions link to Duke GHIC general inquiries.

The separate spreadsheet standardization flows process files in the browser;
they are not described as part of the PDF assessment storage flow.

## Proposed next pilot (not yet conducted)

Recruit a small cohort across innovators, funders, and ministries of health.
Include regional perspectives across Africa, Asia, and other intended contexts.
Ask each participant to:
1. Explain the platform's purpose and name the supporting organizations.
2. Find the resource relevant to their role without uploading anything.
3. Locate the framework and distinguish available tools from planned resources.
4. Explain data requested, intended access, publication, and deletion requests.
5. Navigate on a phone and with a keyboard; report unclear labels or barriers.
6. Review a sample result and identify evidence, limits, and a next step.

Record consent and actionable findings. Resolve major comprehension,
accessibility, and data-protection issues before broad promotion. Approve quotes
and credits separately from consent to take part in the pilot.
