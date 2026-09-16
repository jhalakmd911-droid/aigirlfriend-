import fs from 'fs';
import path from 'path';

// সরাসরি আপনার OpenRouter API Key এখানে বসিয়ে দিন
const OPENROUTER_API_KEY = 'sk-or-v1-আপনার_আসল_এপিআই_কী_এখানে_বসান';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function fixCodeWithAI(errorMessage, fileContent) {
    const prompt = `You are an expert AI debugger for Next.js. 
    Here is an error: ${errorMessage}
    Here is the current file code:
    ${fileContent}
    
    Please provide ONLY the fixed, corrected code for this file without any extra markdown explanation if possible, or wrap it cleanly so it can be extracted.`;

    try {
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (error) {
        console.error('AI Fixer Error:', error);
        return null;
    }
}

console.log('AI Fixer Robot is ready to assist you!');
