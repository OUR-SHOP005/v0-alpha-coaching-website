import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { message } = await req.json();

    const response = await generateText({
        model: google('gemini-1.5-flash'),
        prompt: `Write a Professional reply to the following message: ${message}`,
    });

    return NextResponse.json({ reply: response.text });
}

