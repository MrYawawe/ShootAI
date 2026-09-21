import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, sellingPoint, goal, image } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is missing." },
        { status: 500 }
      );
    }

    const content: any[] = [
      {
        type: "input_text",
        text: `
You are ShootAI, an expert short-form product video director.

The user wants to film a product video themselves.
Do NOT generate a video.
Do NOT explain video editing.

Your job is to create 3 strong short-form video concepts that are easy to film with a phone.

Product name: ${name || "Unknown product"}
Selling points: ${sellingPoint || "Not provided"}
Content goal: ${goal || "Sell My Product"}

For each concept, create:
- title
- hook
- short description
- 6 shots

For every shot include:
- title
- duration
- camera
- setup
- action
- lighting
- say

Make the instructions extremely practical.
Tell the person exactly how to position the phone and product.
Keep each video around 15-30 seconds.

Return ONLY valid JSON in this exact structure:

{
  "concepts": [
    {
      "title": "",
      "hook": "",
      "description": "",
      "shots": [
        {
          "title": "",
          "duration": "",
          "camera": "",
          "setup": "",
          "action": "",
          "lighting": "",
          "say": ""
        }
      ]
    }
  ]
}
        `,
      },
    ];

    if (image) {
      content.push({
        type: "input_image",
        image_url: image,
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          {
            role: "user",
            content,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return NextResponse.json(
        { error: "AI request failed." },
        { status: 500 }
      );
    }

    const text = data.output
      ?.flatMap((item: any) => item.content || [])
      ?.find((item: any) => item.type === "output_text")
      ?.text;

    if (!text) {
      return NextResponse.json(
        { error: "AI returned no result." },
        { status: 500 }
      );
    }

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
