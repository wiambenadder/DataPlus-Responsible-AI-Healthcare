import os
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("LITELLM_TOKEN"),
    base_url="https://litellm.oit.duke.edu"
)

domain = "Domain 1: Model Source"
subtopic = "Governance & Stewardship"

response = """
The innovator described that Jacaranda Health is authorized to collect data from mothers in partner health facilities, and that they obtain government/Ministry of Health licenses to operate and collect this type of data. They stated the only personal identifier collected is the mother’s phone number, and that it is excluded from model-training datasets; training uses message questions and responses. They indicated data transformation/writing tasks are handled by the machine learning team, and that a quality assurance team led by a medical doctor checks that the data/content is correct and aligned with medical context. They also stated that training data is stored in their databases and linked using a random UUID, and that the data is not shared outside the company (not open-sourced).
"""

prompt = f"""
You are a qualitative research coder applying a predefined assessment framework.
Your task is to analyze an interview transcript section and assess the innovator's response for a single framework subpoint.

## Scope of Analysis

The interview is structured by framework subpoints, and the interviewer explicitly identifies the subpoint being discussed.
Treat the interviewer-defined subpoint as the coding unit.
Analyze only the information discussed within the provided subpoint section.
Do not search for evidence elsewhere in the transcript.
Do not reclassify statements into other subpoints. The purpose of this task is to assess how the innovator responds to the subpoint being discussed, not to determine whether the statements would fit better under another subpoint.
Summarize and evaluate only the content provided within the specified subpoint section.

## Evidence Rules

Use an evidence-first approach.
Do not infer the existence of:

*   practices    
*   policies    
*   governance structures    
*   metrics    
*   monitoring systems    
*   responsibilities    
*   measurement activities
    
unless they are explicitly described by the innovator.
Base all conclusions solely on information contained in the transcript section.
If evidence is ambiguous, incomplete, or uncertain, choose the lower rating.
Do not assume that a practice exists simply because it would be reasonable or expected.

## Rating Framework

Apply the following decision process exactly.

### Question 1: Is there any evidence that this subpoint is addressed?

If no evidence exists:

*   Rating = Not Addressed    

If evidence exists:

*   Proceed to Question 2    

### Question 2: Does an equivalent practice exist that addresses the subpoint?

An equivalent practice is an actual activity, process, responsibility, policy, workflow, or mechanism that addresses the intent of the subpoint.
If no equivalent practice exists:

*   Rating = Aware, Not Practiced
    
If an equivalent practice exists:

*   Proceed to Question 3    

### Question 3: Is the practice formally tracked and producing repeatable outputs?

Formal tracking includes explicit evidence of:

*   metrics    
*   indicators    
*   KPIs    
*   dashboards    
*   monitoring systems    
*   logs    
*   audits    
*   reports    
*   scheduled reviews  
*   documented measurement processes
    

Do not infer measurement from the existence of a practice.
If formal tracking is explicitly described:
*   Rating = Measured
    

If a practice exists but formal tracking is not described:
*   Rating = Practiced, Not Measured
    

## Additional Coding Fields

### Actual Metric Used

Identify any metric, indicator, KPI, monitoring process, or tracking mechanism mentioned by the innovator.
Record the metric actually used by the innovator, even if it differs from the framework's intended metric.
If no metric is mentioned, record:
None identified.

### Barrier Classification

Only complete this field if the rating is Aware, Not Practiced.
Classify the barrier as:

#### Conscious Decision

The innovator explicitly indicates that they have deliberately chosen not to implement or measure the subpoint.

#### Capacity Constraint

The innovator indicates that they would like to address the subpoint but lack sufficient:

*   resources    
*   staff   
*   funding    
*   expertise    
*   infrastructure    
*   data    
*   time
    
If insufficient evidence exists to determine the barrier type, state:
Cannot determine from transcript.

### Language Misalignment

Assess whether the innovator appears confused by the subpoint, requires clarification, misunderstands terminology, or needs the concept reframed.
Record:

*   Yes
    
*   No
    
Provide a brief explanation.

## Relevant Innovator Information

Provide a concise synthesis of the innovator's statements that were made within this subpoint section.
Do not include direct quotations.
Do not include information from outside the provided subpoint section.
Keep the summary factual and concise.

## Output Format

### Domain

[Domain Name]

### Subtopic

[Subpoint Name]

### Relevant Innovator Information

[Concise synthesis of relevant information from this section only]

### Evidence Assessment

Evidence Found:  
Yes / No

### Rating

[Not Addressed / Aware, Not Practiced / Practiced, Not Measured / Measured]

### Rating Justification

Question 1: Is there evidence that the subpoint is addressed?  
Answer: [Yes/No]
Question 2: Does an equivalent practice exist?  
Answer: [Yes/No]
Question 3: Is the practice formally tracked and producing repeatable outputs?  
Answer: [Yes/No]
Reasoning:  
[Brief explanation based strictly on transcript evidence]

### Actual Metric Used

[Metric(s) identified or None identified]

### Barrier Classification

[Conscious Decision / Capacity Constraint / Cannot determine / Not Applicable]

### Language Misalignment

[Yes / No]
Explanation:  
[Brief explanation]

Return JSON only with this structure:

{
  "domain": "",
  "subtopic": "",
  "relevant_innovator_information": "",
  "evidence_found": "",
  "rating": "",
  "rating_justification": "",
  "actual_metric_used": "",
  "barrier_classification": "",
  "language_misalignment": "",
  "language_misalignment_explanation": ""
}

Transcript Section:  
{response}
  
Domain:  
{domain}

Subtopic:  
{subtopic}

"""

result = client.chat.completions.create(
    model="gpt-5.2",
    temperature=0,
    messages=[
        {"role": "user", "content": prompt}
    ]
)

print(result.choices[0].message.content)
