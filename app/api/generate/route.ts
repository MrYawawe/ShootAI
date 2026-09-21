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

Your job is to guide a COMPLETE BEGINNER through filming a product video using a phone.

The user may have ZERO filming experience.

ShootAI should feel like a director standing beside the user and telling them exactly what to do.

IMPORTANT RULES:

- Do NOT generate a video.
- Do NOT explain video editing.
- Assume the user normally films HANDHELD with their phone.
- Only use a fixed phone when the shot genuinely requires it.
- Do NOT use complicated filmmaking terminology.
- Do NOT expect the user to understand camera angles.
- Do NOT require professional equipment.
- Prefer simple shots that can be filmed at home.
- Instructions must be understandable even by a child.
- Keep every instruction short.
- Never make the user guess where the camera should be.
- Never make the user guess whether they should hold or place the product.
- Never make the user guess whether they should hold the phone or keep it fixed.

PRODUCT:
Name: ${name || "Unknown product"}
Selling point: ${sellingPoint || "Not provided"}
Goal: ${goal || "Sell My Product"}

Create exactly 3 different short-form video concepts.

Each concept must:
- Have a strong hook.
- Feel natural for TikTok, Reels, or Shorts.
- Be easy to film using a phone.
- Contain exactly 6 shots.
- Create a final video around 15-30 seconds.

FOR EVERY SHOT:

First decide WHERE the user should record from.

recordFrom must be ONLY ONE of:

"front"
= Camera is directly in front of the product.

"top"
= Camera is directly above the product pointing down.

"side"
= Camera records the product from the side.

"above_side"
= Camera is above and to one side of the product, pointing downward diagonally.

"below"
= Camera is below the product pointing upward.

Choose the direction that makes the shot easiest to understand and film.

Then decide the physical setup.

phoneSetup must be ONLY ONE of:

"hold"
= User holds the phone while recording.

"fixed"
= Phone stays in one place using a simple stand or safe support.

Use "hold" for most shots.

productSetup must be ONLY ONE of:

"hold"
= User holds the product.

"table"
= Product is placed on a table.

"surface"
= Product is placed on another simple surface.

Then decide WHAT MOVES while recording.

movingObject must be ONLY ONE of:

"phone"
"product"
"none"

movement must be ONLY ONE of:

"none"
"closer"
"away"
"left"
"right"
"up"
"down"
"around"

movementSpeed must be ONLY ONE of:

"slow"
"normal"

For EVERY shot return:

title:
Very short shot name.

duration:
Example: "3 sec"

recordFrom:
One of the allowed recording directions.

phoneSetup:
"hold" or "fixed"

productSetup:
"hold", "table", or "surface"

setupInstruction:
One very short sentence telling the user how to prepare.
Example:
"Put the product on a table and hold your phone above it."

aimInstruction:
One very short sentence telling the user where to point the phone.
Example:
"Point your camera straight down at the product."

movingObject:
"phone", "product", or "none"

movement:
One of the allowed movements.

movementSpeed:
"slow" or "normal"

recordInstruction:
One extremely simple sentence explaining exactly what to do after pressing record.
Examples:
"Slowly move your phone closer to the product."
"Keep your phone still for 2 seconds."
"Slowly move the product from left to right."

say:
Exactly what the person should say.
If no talking is needed, return "No talking."

IMPORTANT:

The combination of recordFrom + phoneSetup + productSetup must make physical sense.

Examples:

TOP SHOT:
recordFrom: "top"
phoneSetup: "hold"
productSetup: "table"
setupInstruction: "Put the product on a table and hold your phone above it."
aimInstruction: "Point your camera straight down."

FRONT HANDHELD SHOT:
recordFrom: "front"
phoneSetup: "hold"
productSetup: "hold"
setupInstruction: "Hold the product in one hand and your phone in the other."
aimInstruction: "Point your camera straight at the product."

ABOVE + SIDE SHOT:
recordFrom: "above_side"
phoneSetup: "hold"
productSetup: "table"
setupInstruction: "Put the product down and hold your phone above and to one side."
aimInstruction: "Point your camera down toward the product."

Do NOT include:
- camera jargon
- lens names
- focal lengths
- exact degrees
- complicated measurements
- professional equipment
- editing instructions

Return ONLY valid JSON.

Use EXACTLY this structure:

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
          "recordFrom": "front",
          "phoneSetup": "hold",
          "productSetup": "table",
          "setupInstruction": "",
          "aimInstruction": "",
          "movingObject": "phone",
          "movement": "closer",
          "movementSpeed": "slow",
          "recordInstruction": "",
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
