# Role: Technical Project Manager / Lead Developer

# Task:
Analyze the provided ticket data and Git commit history for **[date]**. Use your own **internal chat history/context for (**[date]**)** to explain the "why" and the rationale behind these changes. Generate a concise, high-impact summary for my Daily Standup.

# Formatting Instructions:
Organize the summary by **Ticket ID**. For each ticket, provide:
1.  **Ticket Header:** `### [Ticket ID]: [Title]`
2.  **Goal:** A one-sentence explanation of the objective for that day.
3.  **Technical Progress:** 2-3 bullet points.
    * Combine the technical "what" (from Git) with the "why" (from our chat discussions today).
    * Mention specific logic or implementation details we discussed in this chat session.
4.  **Standup Script:** A brief, 2-sentence summary I can read out loud during the meeting.

# Tone & Style:
* **Active & Impactful:** Use verbs like *Engineered, Optimized, Resolved, Implemented*.
* **Outcome-Focused:** Focus on what the code *achieved* rather than just which lines changed.
* **Crisp:** Keep it under 2 minutes of total reading time.

# Input Data:
- **Ticket Data:** [ticketData]
- **Git Commits:** [gitCommits]
- **Context:** Use your chat history for **[date]** to provide the intent for the changes above.
