import { NextResponse } from "next/server";

export const maxDuration = 300; // 5 minute max timeout for Vercel Pro/Enterprise

export async function POST(req: Request) {
  try {
    const { text, url } = await req.json();

    if (!text && !url) {
      return NextResponse.json(
        { error: "Must provide either text or a URL to extract." },
        { status: 400 }
      );
    }

    // In a full implementation, if `url` is provided, we would call the Universal Document API here
    // to extract the text from the URL or File first. For now, we assume `text` is populated.
    const extractionText = text || "Sample extracted text from the UD pipeline...";

    // Ensure we have the API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY is missing. Returning mock data.");
      // Return mock data for testing UI without burning API credits
      return NextResponse.json({
        flashcards: [
          {
            id: "1",
            question: "What is the primary advantage of the Universal Document architecture?",
            answer: "It allows for lossless, secure transmission of any document format across the Hive ecosystem.",
            explanation: "Universal Document acts as the foundational data layer, normalizing complex inputs (PDF, Audio, Web) into a structured format for AI ingestion."
          },
          {
            id: "2",
            question: "How does the 'Card 16' mechanic drive extreme virality?",
            answer: "By creating a forced-signup paywall exactly when the user is most engaged with the study material.",
            explanation: "Classmates can view the first 15 cards for free, building immense value and trust, before requiring a free account to view the remaining cards."
          }
        ]
      });
    }

    // The Claude 3.5 Sonnet Prompt
    const systemPrompt = `You are a clinical-grade academic extraction AI. Your objective is to ingest complex academic material (medical textbooks, law cases, lectures) and convert the knowledge into highly optimized study flashcards.
    
    RULES:
    1. Extract the most critical concepts, definitions, and mechanisms from the provided text.
    2. Format the output STRICTLY as a JSON array. Do not output markdown, pleasantries, or anything other than the JSON array.
    3. Each object in the array MUST have three fields: "question", "answer", and a brief "explanation".
    4. Aim for exactly 15 flashcards unless the text is extremely short.
    5. The JSON array must be valid and parsable.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Here is the academic text to extract:\n\n${extractionText}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API Error:", errorText);
      return NextResponse.json({ error: "Failed to generate flashcards." }, { status: 500 });
    }

    const data = await response.json();
    const messageContent = data.content[0].text;
    
    // Parse the JSON output from Claude
    let flashcards = [];
    try {
      // Find the JSON array in the response (in case Claude added markdown around it)
      const jsonMatch = messageContent.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : messageContent;
      flashcards = JSON.parse(jsonString);
      
      // Add unique IDs
      flashcards = flashcards.map((fc: any, index: number) => ({
        id: index.toString(),
        ...fc
      }));
    } catch (parseError) {
      console.error("Failed to parse Claude JSON output:", messageContent);
      return NextResponse.json({ error: "Failed to parse generation output." }, { status: 500 });
    }

    return NextResponse.json({ flashcards });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
