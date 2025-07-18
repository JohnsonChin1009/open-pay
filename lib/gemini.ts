export async function sendToGemini(prompt: string, history: string[] = []) {
    const res = await fetch("/api/pingGemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, history }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to fetch response from Gemini API");

    return data.text;
}