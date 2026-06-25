export const QUESTIONS = [
  {
    question:
      "Who owns the data used to train your model, who can access it, and is that written down anywhere?",
    domain: "Model Source",
    subtopic: "Governance & Stewardship",
  },

  {
    question:
      "How do you check that the population your training data represents is balanced and complete?",
    domain: "Model Source",
    subtopic: "Training Data Quality & Coverage",
  },

  {
    question:
      "How do you make sure the training data stays current, and is there a process for retiring outdated data?",
    domain: "Model Source",
    subtopic: "Timeliness",
  },

  {
    question:
      "Could someone outside your organization find this data, access it, and reuse it for a different purpose if they needed to?",
    domain: "Model Source",
    subtopic: "Data Interoperability & Reuse",
  },

  {
    question:
      "What formal compliance record do you have for how this data is protected, and when was it last reviewed?",
    domain: "Model Source",
    subtopic: "Privacy & Security",
  },

  {
    question:
      "Do you follow a recognized data standard or metadata schema, like HL7 or FHIR, for organizing this data?",
    domain: "Model Source",
    subtopic: "Data Standards & Metadata",
  },

  {
    question:
      "What accuracy metrics do you track, and how do they compare to a baseline or comparator?",
    domain: "Model Development",
    subtopic: "Accuracy",
  },

  {
    question:
      "How do you validate that the model’s outputs are reliable, and is there a formal protocol for this?",
    domain: "Model Development",
    subtopic: "Model Validation & Reliability",
  },

  {
    question:
      "Walk me through what actually happens between a user’s input and the system’s output. Who made the design decisions, and where are they documented?",
    domain: "Model Development",
    subtopic: "AI System Design",
  },

  {
    question:
      "Have you formally tested whether performance varies across different populations or contexts?",
    domain: "Model Development",
    subtopic: "Cross-Population Performance",
  },

  {
    question:
      "Have you tested for bias against any specific groups, and is this recurring practice or a one-off?",
    domain: "Model Development",
    subtopic: "Bias & Fairness Assessment",
  },

  {
    question:
      "How do end users understand why the model is making a particular recommendation?",
    domain: "Model Development",
    subtopic: "Transparency & Explainability",
  },

  {
    question:
      "Have you run formal stress tests on the model under unusual or messy input conditions?",
    domain: "Model Development",
    subtopic: "Robustness",
  },

  {
    question:
      "What’s the chain of reasoning from what your tool does to an actual health outcome, and is there an indicator in place to test that chain?",
    domain: "Model Deployment",
    subtopic: "Mechanism of Change",
  },

  {
    question:
      "How do you monitor uptime, latency, and capacity as usage grows?",
    domain: "Model Deployment",
    subtopic: "System Reliability & Capacity",
  },

  {
    question:
      "What protocol exists for catching and escalating a problematic output before it reaches a patient or health worker?",
    domain: "Model Deployment",
    subtopic: "Protocol & Safety Monitoring",
  },

  {
    question:
      "What guardrails prevent the tool from being used outside its intended purpose, and how are they enforced?",
    domain: "Model Deployment",
    subtopic: "Responsible Use of AI",
  },

  {
    question:
      "How does your tool currently connect with national health information systems, like DHIS2 or EHR?",
    domain: "Model Deployment",
    subtopic: "Deployment Infrastructure & Integration",
  },

  {
    question:
      "What do you formally track about how the tool is being used day to day, and where does that data go?",
    domain: "Model Deployment",
    subtopic: "Implementation Outcomes",
  },

  {
    question:
      "What health outcome improvements have you formally attributed to the tool, and through what method?",
    domain: "Impact",
    subtopic: "Outcome Improvement",
  },

  {
    question:
      "How long does it typically take between an AI recommendation and the resulting action, and do you track this formally?",
    domain: "Impact",
    subtopic: "Time to Action",
  },

  {
    question:
      "Do you formally track whether the tool’s benefits are reaching disadvantaged or underserved groups specifically? Not just who you reach, but whether outcomes differ by equity dimension.",
    domain: "Impact",
    subtopic: "Equity Effect",
  },

  {
    question:
      "What does your financial model look like, and is there a formal analysis of your path to being self-sustaining?",
    domain: "Impact",
    subtopic: "Financial Sustainability",
  },

  {
    question:
      "How does the cost of delivering care with this tool compare to the alternative, and is that comparison formally documented?",
    domain: "Impact",
    subtopic: "Cost-Effectiveness",
  },

  {
    question:
      "What formal review process governs the tool once it’s deployed, and who runs it?",
    domain: "Impact",
    subtopic: "Continued Oversight",
  },

  {
    question:
      "Beyond current funding, what does long-term financial viability look like for this tool?",
    domain: "Sustainability",
    subtopic: "Financial Viability",
  },

  {
    question:
      "How would you describe your business model, and how clear is the path to revenue or sustained funding?",
    domain: "Sustainability",
    subtopic: "Business Model Clarity",
  },

  {
    question:
      "Is this tool embedded in routine government or health system processes, or does it run alongside them?",
    domain: "Sustainability",
    subtopic: "Health System Integration",
  },

  {
    question:
      "If your organization stepped back, is there local capacity to keep this tool running independently?",
    domain: "Sustainability",
    subtopic: "Local Ownership & Capacity",
  },

  {
    question:
      "Is this tool referenced in any national health financing, digital health, or AI policy document?",
    domain: "Sustainability",
    subtopic: "Policy & Financing Alignment",
  },

  {
    question:
      "Who is formally responsible for oversight of this tool five years from now, and is that written down?",
    domain: "Sustainability",
    subtopic: "Long-Term Oversight",
  }
]