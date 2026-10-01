export async function aiResumeFeedback(resumeText) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return 'AI service not configured. Add GEMINI_API_KEY (Google AI Studio) to backend/.env to enable resume feedback.';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a campus placement trainer. Review this student resume and reply with: 1) a two-sentence summary, 2) three strengths, 3) three concrete improvements.\n\nRESUME:\n${resumeText}`
            }]
          }]
        })
      }
    );
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback returned by the model.';
  } catch {
    return 'AI feedback is unavailable right now. Please try again later.';
  }
}