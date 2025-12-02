import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY is missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function testKey() {
    try {
        console.log("Testing gemini-2.5-pro-preview-03-25...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-03-25" });
        const result = await model.generateContent("Hi");
        console.log("Success:", await result.response.text());
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testKey();
