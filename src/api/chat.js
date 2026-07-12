export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { message, history = [] } = req.body;

    try {
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    system_instuction: {
                        parts: [{ text: "You are GuddyAi, a witty, friendly AI assistant embedded inside Konnet - a vibrant social medis app. Help users write posts, captions, reply to comments, explore trends, or just chat. Be concise and fun." }]
                    },
                    contents: [
                        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
                        { role: 'user', parts: [{ text: message }] }
                    ]
                })
            }
        );
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't respond right now.";
        res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: 'Connection issue - try again.' });
    }
}