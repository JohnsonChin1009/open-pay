export async function sendToGemini(prompt: string, user_id?: string) {
    const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, user_id }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to fetch response from API");

    return data.answer;
}