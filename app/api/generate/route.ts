import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type RequestBody = {
  name?: string;
  sellingPoint?: string;
  goal?: string;
  image?: string;
};

function extractOutputText(data: any): string {
  // Some Responses API responses expose this directly.
  if (
    typeof data?.output_text === 'string' &&
    data.output_text.trim()
  ) {
    return data.output_text.trim();
  }

  // Otherwise read the text from the output array.
  if (Array.isArray(data?.output)) {
    const pieces: string[] = [];

    for (const item of data.output) {
      if (!Array.isArray(item?.content)) continue;

      for (const content of item.content) {
        if (
          typeof content?.text === 'string' &&
          content.text.trim()
        ) {
          pieces.push(content.text);
        }
      }
    }

    return pieces.join('\n').trim();
  }

  return '';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const name = body.name?.trim();
    const sellingPoint =
      body.sellingPoint?.trim() || '';
    const goal =
      body.goal?.trim() || 'Product Showcase';
    const image = body.image;

    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'OPENAI_API_KEY is not configured.'
        },
        { status: 500 }
      );
    }

    const instructions = `
You are ShootAI, an AI product video director for complete beginners.

The user has a physical product and wants to film a short-form product video using a phone.

Your job is NOT to generate or edit video.

Your job is to tell the user exactly how to physically film the product, one shot at a time.

Use extremely simple English.

Create exactly 3 different video concepts.
Each concept must contain exactly 6 shots.

EVERY SHOT MUST CLEARLY EXPLAIN:

1. Where the phone records from.
2. Whether the phone is held or fixed.
3. Whether the product is held or placed down.
4. What physically happens during the shot.
5. How long to record.
6. What to say, if anything.

PHYSICAL LOGIC:

The setup and action must always work together.

For example:

If the user unwraps a soap, do not simply say "move the product."

Use:
actionType: "product_action"
actionName: "UNWRAP THE SOAP"
actionVisual: "unwrap"

The instruction could be:
"Hold the soap and slowly slide the wrapper off."

If an action realistically needs two hands, keep the phone fixed.

If the action can easily be performed with one hand, the phone may be held.

Do not create physically impossible instructions.

PHONE SETUP:

phoneSetup must be:
"hold"
or
"fixed"

Use "hold" by default.

Use "fixed" when the product action reasonably requires both hands or when a completely stationary camera is important.

PRODUCT SETUP:

productSetup must be:
"hold"
"table"
or
"surface"

Use "hold" when the product needs to be held or manipulated.

Use "table" when it should remain on a table.

Use "surface" for another flat surface.

CAMERA DIRECTION:

recordFrom must be exactly:
"front"
"top"
"side"
"above_side"
or
"below"

ACTION TYPES:

actionType must be exactly:
"camera_move"
"product_move"
"product_action"
or
"still"

CAMERA_MOVE:

Use only when the phone itself moves during recording.

Examples:
Move phone closer.
Move phone away.
Move phone left.
Move phone right.
Move phone upward.
Move phone around the product.

PRODUCT_MOVE:

Use when the whole product changes position.

Examples:
Bring the product closer.
Slide the whole product right.
Lift the whole product toward the camera.

PRODUCT_ACTION:

Use when something is physically done to the product.

Examples:
unwrap
open
close
pour
squeeze
press
spray
twist
rotate
flip
shake
pull
push
slide
lift
remove
place
pick up
tap
wipe
apply

Do not use generic "move product" when a more specific action exists.

ACTION NAME:

actionName must be a very short command.

Examples:

"UNWRAP THE SOAP"
"REMOVE THE CAP"
"OPEN THE BOX"
"POUR THE DRINK"
"SQUEEZE THE TUBE"
"TURN THE BOTTLE"
"SLIDE THE BOX"
"KEEP STILL"

ACTION VISUAL:

actionVisual must be exactly one of:

"unwrap"
"open"
"close"
"pour"
"squeeze"
"press"
"spray"
"twist"
"rotate"
"flip"
"shake"
"pull"
"push"
"slide"
"lift"
"remove"
"place"
"pick_up"
"tap"
"wipe"
"apply"
"generic"

Choose the closest matching visual.

MOVING OBJECT:

movingObject must be:
"phone"
"product"
or
"none"

camera_move = "phone"
product_move = "product"
product_action = "product"
still = "none"

MOVEMENT:

movement must be exactly:
"none"
"closer"
"away"
"left"
"right"
"up"
"down"
or
"around"

Use "none" for product_action unless directional movement is genuinely needed.

MOVEMENT SPEED:

movementSpeed must be:
"slow"
or
"normal"

ACTION INSTRUCTION:

actionInstruction must explain exactly what to physically do.

Keep it to one short sentence.

Good:
"Slowly slide the wrapper off the soap."
"Twist the cap off the bottle."
"Slowly turn the bottle to show the label."

Bad:
"Show the product."
"Create a reveal."
"Make it cinematic."
"Move dynamically."

RECORD INSTRUCTION:

recordInstruction should explain what to capture while recording.

Keep it extremely simple.

WHAT TO SAY:

say should contain a short natural spoken line.

If the shot does not need speech, return an empty string.

IMPORTANT:

Do not use professional filmmaking jargon.

Do not mention:
dolly
truck
focal length
aperture
depth of field
cinematic push-in

Do not require professional equipment.

Do not use exact centimeter measurements.

Do not mention the uploaded product image in the instructions.

The uploaded image is only for understanding the product.

The first shot should get attention quickly.

All 6 shots must work together as ONE short product video.

Return only the required structured response.
`;

    const userText = `
PRODUCT NAME:
${name}

MAIN SELLING POINT:
${sellingPoint || 'Not provided'}

VIDEO GOAL:
${goal}

Create 3 beginner-friendly filming concepts for this product.
`;

    const content: any[] = [
      {
        type: 'input_text',
        text: userText
      }
    ];

    if (
      image &&
      image.startsWith('data:image/')
    ) {
      content.push({
        type: 'input_image',
        image_url: image
      });
    }

    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          model: 'gpt-5-mini',

          instructions,

          input: [
            {
              role: 'user',
              content
            }
          ],

          max_output_tokens: 12000,

          text: {
            format: {
              type: 'json_schema',
              name: 'shootai_filming_plan',
              strict: true,

              schema: {
                type: 'object',
                additionalProperties: false,

                properties: {
                  concepts: {
                    type: 'array',
                    minItems: 3,
                    maxItems: 3,

                    items: {
                      type: 'object',
                      additionalProperties: false,

                      properties: {
                        title: {
                          type: 'string'
                        },

                        hook: {
                          type: 'string'
                        },

                        description: {
                          type: 'string'
                        },

                        shots: {
                          type: 'array',
                          minItems: 6,
                          maxItems: 6,

                          items: {
                            type: 'object',
                            additionalProperties:
                              false,

                            properties: {
                              title: {
                                type: 'string'
                              },

                              duration: {
                                type: 'string'
                              },

                              recordFrom: {
                                type: 'string',
                                enum: [
                                  'front',
                                  'top',
                                  'side',
                                  'above_side',
                                  'below'
                                ]
                              },

                              phoneSetup: {
                                type: 'string',
                                enum: [
                                  'hold',
                                  'fixed'
                                ]
                              },

                              productSetup: {
                                type: 'string',
                                enum: [
                                  'hold',
                                  'table',
                                  'surface'
                                ]
                              },

                              setupInstruction: {
                                type: 'string'
                              },

                              aimInstruction: {
                                type: 'string'
                              },

                              actionType: {
                                type: 'string',
                                enum: [
                                  'camera_move',
                                  'product_move',
                                  'product_action',
                                  'still'
                                ]
                              },

                              actionName: {
                                type: 'string'
                              },

                              actionVisual: {
                                type: 'string',
                                enum: [
                                  'unwrap',
                                  'open',
                                  'close',
                                  'pour',
                                  'squeeze',
                                  'press',
                                  'spray',
                                  'twist',
                                  'rotate',
                                  'flip',
                                  'shake',
                                  'pull',
                                  'push',
                                  'slide',
                                  'lift',
                                  'remove',
                                  'place',
                                  'pick_up',
                                  'tap',
                                  'wipe',
                                  'apply',
                                  'generic'
                                ]
                              },

                              movingObject: {
                                type: 'string',
                                enum: [
                                  'phone',
                                  'product',
                                  'none'
                                ]
                              },

                              movement: {
                                type: 'string',
                                enum: [
                                  'none',
                                  'closer',
                                  'away',
                                  'left',
                                  'right',
                                  'up',
                                  'down',
                                  'around'
                                ]
                              },

                              movementSpeed: {
                                type: 'string',
                                enum: [
                                  'slow',
                                  'normal'
                                ]
                              },

                              actionInstruction: {
                                type: 'string'
                              },

                              recordInstruction: {
                                type: 'string'
                              },

                              say: {
                                type: 'string'
                              }
                            },

                            required: [
                              'title',
                              'duration',
                              'recordFrom',
                              'phoneSetup',
                              'productSetup',
                              'setupInstruction',
                              'aimInstruction',
                              'actionType',
                              'actionName',
                              'actionVisual',
                              'movingObject',
                              'movement',
                              'movementSpeed',
                              'actionInstruction',
                              'recordInstruction',
                              'say'
                            ]
                          }
                        }
                      },

                      required: [
                        'title',
                        'hook',
                        'description',
                        'shots'
                      ]
                    }
                  }
                },

                required: ['concepts']
              }
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'OpenAI API error:',
        JSON.stringify(data)
      );

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            'ShootAI could not generate the filming plan.'
        },
        { status: 500 }
      );
    }

    const outputText =
      extractOutputText(data);

    if (!outputText) {
      console.error(
        'ShootAI empty response:',
        JSON.stringify(data)
      );

      return NextResponse.json(
        {
          error:
            'ShootAI received an empty response.'
        },
        { status: 500 }
      );
    }

    try {
      const result =
        JSON.parse(outputText);

      if (
        !Array.isArray(result?.concepts) ||
        result.concepts.length !== 3
      ) {
        throw new Error(
          'Invalid concepts response.'
        );
      }

      return NextResponse.json(result);
    } catch (error) {
      console.error(
        'ShootAI JSON parsing error:',
        outputText,
        error
      );

      return NextResponse.json(
        {
          error:
            'ShootAI could not read the generated filming plan.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      'Generate route error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Something went wrong while generating your filming plan.'
      },
      { status: 500 }
    );
  }
}
