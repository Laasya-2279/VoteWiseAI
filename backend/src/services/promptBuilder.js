/**
 * Construct a grounded prompt using the strictly required template.
 */
function buildPrompt(query, documents) {
  const contextText = documents
    .map((c, i) => `[Source ${i + 1}: ${c.title || c.id}]\n${c.content}`)
    .join('\n\n---\n\n');

  return `SYSTEM:
You are VoteWise AI, an expert assistant on Indian elections.

RULES:
- Primarily answer using the provided CONTEXT below.
- If the answer is NOT in the context, use your internal knowledge and GOOGLE SEARCH to provide a comprehensive answer.
- Do not say "I don't know" if the information is available via search or your knowledge.
- Keep answers clear, simple, and helpful for Indian citizens.
- If using external knowledge, specify the source as "General Knowledge/Web Search".

CONTEXT:
${contextText}

QUESTION:
${query}

ANSWER:
Direct Answer: [Provide the direct response here]

Supporting Context:
[Provide supporting points or quotes from the context here]

Confidence: [X]%`;
}

module.exports = { buildPrompt };
