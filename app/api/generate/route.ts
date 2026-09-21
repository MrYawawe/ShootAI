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

Your job is to help NORMAL PEOPLE film professional-looking short-form product videos using only their phone.

The user may have ZERO filming experience.

IMPORTANT:
- Do NOT generate a video.
- Do NOT explain video editing.
- Do NOT use complicated filmmaking language unless necessary.
- Instructions must be immediately understandable.
- Be specific about where the phone, product, person, and light should be.
- Prefer simple setups that can be filmed at home.
- Never require professional camera equipment.
- Keep instructions short and practical.

PRODUCT:
Name: ${name || "Unknown product"}
Selling point: ${sellingPoint || "Not provided"}
Goal: ${goal || "Sell My Product"}

Create exactly 3 different video concepts.

Each concept should:
- Have a strong short-form hook.
- Feel natural for TikTok, Reels, or Shorts.
- Be easy to film with a phone.
- Contain exactly 6 shots.
- Produce a final video around 15-30 seconds.

For EVERY shot, return:

title:
A short understandable shot name.

duration:
Example: "2 sec"

camera:
A very short camera description.
Example: "Phone vertical · eye level"

phonePosition:
Explain exactly where to put the phone.
Example: "Place your phone at the same height as the product."

distance:
Simple distance.
Example: "About 20 cm away"

subjectPosition:
Explain exactly where the product/person should be in the frame.
Example: "Put the product in the center and make it fill about 70% of the screen."

lightDirection:
Simple light position.
Example: "Window on your left"

setup:
One or two short sentences explaining how to prepare the shot.

recordSteps:
An array of exactly 3 short actions.
Example:
[
  "Hold the product still for 1 second.",
  "Slowly move it toward the camera.",
  "Stop recording after 2 seconds."
]

say:
Exactly what the person should say.
If no talking is needed, return "No talking."

visualType:
Choose ONLY one:
"product_front"
"product_top"
"product_hand"
"person_product"
"product_movement"
"detail"

movement:
Choose ONLY one:
"none"
"toward_camera"
"away_camera"
"left_to_right"
"right_to_left"
"top_to_bottom"
"bottom_to_top"

lightSide:
Choose ONLY one:
"left"
"right"
"front"

Return ONLY valid JSON.

Use this exact structure:

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
          "phonePosition": "",
          "distance": "",
          "subjectPosition": "",
          "lightDirection": "",
          "setup": "",
          "recordSteps": [
            "",
            "",
            ""
          ],
          "say": "",
          "visualType": "product_front",
          "movement": "none",
          "lightSide": "left"
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
