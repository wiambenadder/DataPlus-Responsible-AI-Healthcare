# Policy, Evidence, and Financing for Responsible AI

**Duke Data+ 2026**

An AI-powered, open-source platform that provides global healthcare AI innovators with a standardized assessment framework and personalized roadmap to evaluate and improve their AI solutions' readiness for responsible, real-world deployment.

---

## Description

As AI healthcare technologies continue to emerge, existing evaluation approaches have struggled to keep pace. Most assessments depend on expert-led reviews that are time-intensive, difficult to scale, and provide limited incentives for innovators to engage in the evaluation process. This project develops an AI-powered, open-source platform that provides innovators with a standardized assessment framework and personalized roadmap to evaluate and improve their AI solutions' readiness for responsible, real-world deployment. By leveraging AI-driven analysis and evidence-based evaluation frameworks, the platform identifies strengths, uncovers gaps, and delivers actionable recommendations that help innovators translate promising technologies into scalable healthcare solutions. In doing so, it transforms evaluation from a one-time review into an interactive process that encourages continuous improvement while supporting the responsible adoption of AI in healthcare.

Developed as part of Duke University's **Data+ 2026** program, this project sits at the intersection of artificial intelligence, global health, and software engineering. It is supported by the Duke Global Health Innovation Center (Duke GHIC), Innovations in Healthcare (IiH), and GEMINI (Global Emergency Medicine Innovation, Implementation, and Informatics Program at Duke), in partnership with the Society for Family Health (Rwanda).

---

## Features

- AI-powered evaluation of healthcare AI innovations
- Standardized assessment framework based on the Innovations in Healthcare (IiH) evaluation model
- AI-generated personalized implementation roadmaps and recommendations
- PDF upload and automated document extraction
- Interactive follow-up questions to gather additional evidence
- Evidence-based scoring across multiple evaluation domains
- User authentication and organization management
- Company creation and invitation workflows
- Dashboard for viewing and managing assessments
- Secure cloud-based data storage with Supabase

---

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

### Backend & Services
- Supabase
- OpenAI API
- Resend

### Libraries
- PDF Parse
- SheetJS (xlsx)
- jsPDF
- Lucide React

---

## Getting Started

### Prerequisites

Before installing and running this project, ensure you have the following installed:

- Node.js (v20 or later recommended)
- npm
- Git
- Windows 10/11, macOS, or Linux

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd dataplus
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and add the required API keys and configuration values.

The application requires credentials for:

- Supabase
- OpenAI
- Resend

These values are not included in this repository.

---

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Run ESLint:

```bash
npm run lint
```

---

## Deployment

The production version of this application is deployed using **Vercel**.

To deploy your own instance:

1. Import the repository into Vercel.
2. Configure the required environment variables.
3. Deploy using the Vercel dashboard or by pushing changes to the connected production branch.

---

## Project Structure

```
src/
├── app/            # Application pages and API routes
├── components/     # Shared UI components
├── lib/            # Assessment framework, question banks, prompts, and utilities
├── public/         # Static assets
└── ...
```

---

## Authors

- Wiam Benadder
- Mia Liu
- Jeanette Pan

---

## Acknowledgments

This project was completed as part of **Duke Data+ 2026**.

Special thanks to:

- **Innovations in Healthcare (IiH)** for providing the assessment framework, domain expertise, and access to the Global Healthcare Innovator Grants (GHIG) cohort.
- **Lisa Bourget, MBA** — Project Lead
- **Joao Ricardo Nickenig Vissoci, Ph.D.** — Project Advisor
- **Catherine Gonzalez** — Project Manager
- **Eunice Mutindi** — Project Advisor
- **Duke Data+** for the summer research program and mentorship.
- **Duke Global Health Innovation Center (Duke GHIC)**, **Innovations in Healthcare (IiH)**, and **GEMINI** for supporting this project.

Built with **Next.js**, **React**, **Supabase**, **OpenAI**, **Tailwind CSS**, and **Vercel**.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.
