import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type RequestBody = {
  name?: string;
  sellingPoint?: string;
  goal?: string;
  image?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const name = body.name?.trim();
    const sellingPoint = body.sellingPoint?.trim() || '';
    const goal = body.goal?.trim() || 'Product Showcase';
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
        { error: 'OPENAI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const instructions = `
You are ShootAI, an AI product video director for complete beginners.

The user has a physical product and wants to film a short-form product video using a phone.

Your job is NOT to generate a video.
Your job is NOT to edit a video.

Your job is to tell the user exactly how to physically film the product, one shot at a time.

The user should be able to follow your directions even if they know nothing about filming.

IMPORTANT:
Use extremely simple English.
Avoid professional filmmaking jargon.
Do not say things like dolly, truck, pan, tilt, focal length, aperture, depth of field, hero angle, or cinematic push-in.

Create exactly 3 different video concepts.
Each concept must contain exactly 6 shots.

Every shot must make these things completely clear:

1. Where is the phone recording from?
2. Is the user holding the phone or keeping it fixed?
3. Is the product being held or placed down?
4. What EXACTLY moves or happens during the recording?
5. How long should the user record?
6. What should the user say, if anything?

PHYSICAL LOGIC IS VERY IMPORTANT.

The setup and action must make sense together.

Examples:

If the action is "unwrap the soap":
- The product cannot be described as sitting untouched on a table.
- The user may need to hold the soap, hold the wrapper, or use one hand to remove the wrapper.
- The action must explicitly say "Slide the wrapper off the soap" or "Peel the wrapper off."

If the action is "pour the drink":
- The product must be held.
- The action should say exactly what to pour and where.

If the action is "open the lid":
- The product setup must allow the user to open the lid.
- Do not simply say "move the product."

If the action is "rotate the bottle":
- Say "Slowly turn the bottle."
- Do not say "move the product."

Never create a setup that contradicts the action.

HANDHELD PHONE RULE:
Assume the user holds the phone by default.
Use phoneSetup "fixed" only when keeping the phone still is genuinely important for that shot.

PRODUCT SETUP:
Use:
- "hold" when the user needs to hold or manipulate the product.
- "table" when the product should sit on a table.
- "surface" when another flat surface makes more sense.

CAMERA DIRECTION:
recordFrom must be exactly one of:
- "front"
- "top"
- "side"
- "above_side"
- "below"

ACTION SYSTEM:

Each shot must have an actionType.

actionType must be exactly one of:
- "camera_move"
- "product_move"
- "product_action"
- "still"

Use "camera_move" ONLY when the PHONE itself moves while recording.

Examples:
- move phone closer
- move phone away
- move phone left
- move phone right
- move phone up
- move phone down
- move phone around product

Use "product_move" when the whole product changes position without another special interaction.

Examples:
- bring product closer to camera
- move product left
- move product right
- lift product upward
- lower product

Use "product_action" when the user DOES something to the product.

Examples:
- unwrap
- peel
- open
- close
- pour
- squeeze
- press
- pump
- spray
- twist
- rotate
- flip
- shake
- pull
- push
- slide
- lift a lid
- remove a cap
- put on a cap
- take product out of packaging
- place product down
- pick product up
- tap product
- wipe product
- apply product

For product_action, actionName must describe the REAL action.

Good:
"UNWRAP THE SOAP"
"OPEN THE LID"
"POUR THE DRINK"
"SQUEEZE THE TUBE"
"TURN THE BOTTLE"
"REMOVE THE CAP"

Bad:
"MOVE THE PRODUCT"
"SHOW THE PRODUCT"
"USE THE PRODUCT"

The actionInstruction must tell the user exactly what to physically do in ONE short sentence.

Good:
"Hold the soap and slowly slide the wrapper off."
"Hold the bottle and slowly twist the cap off."
"Lift the bottle and pour the drink into the glass."
"Slowly turn the bottle so the front label comes into view."

Bad:
"Create an engaging reveal."
"Showcase the packaging."
"Move the product dynamically."

ACTION VISUAL:

For product_action, actionVisual must be exactly one of:
- "unwrap"
- "open"
- "close"
- "pour"
- "squeeze"
- "press"
- "spray"
- "twist"
- "rotate"
- "flip"
- "shake"
- "pull"
- "push"
- "slide"
- "lift"
- "remove"
- "place"
- "pick_up"
- "tap"
- "wipe"
- "apply"
- "generic"

Choose the closest visual.

For camera_move and product_move, movement must be exactly one of:
- "closer"
- "away"
- "left"
- "right"
- "up"
- "down"
- "around"

For still shots, movement must be "none".

For product_action, movement can be "none" because actionVisual describes the important action.

movingObject must be exactly:
- "phone"
- "product"
- "none"

Rules:
- camera_move = movingObject "phone"
- product_move = movingObject "product"
- product_action = movingObject "product"
- still = movingObject "none"

movementSpeed must be:
- "slow"
- "normal"

Keep every instruction short.

Do NOT describe exact centimeters or complicated angles.

Do NOT require professional equipment.

Do NOT assume a tripod unless phoneSetup is "fixed".

Do NOT mention the uploaded image in the filming instructions.

The uploaded image is only there so you can understand what the product looks like.

HOOK:
The first shot should get attention quickly.

FLOW:
The six shots should form one coherent short video, not six unrelated shots.

VARIETY:
Do not make every shot the same.
Use product actions when they naturally demonstrate the product.

WHAT TO SAY:
"say" should be a short natural line the seller can speak.
If speaking is unnecessary, return an empty string.

Return ONLY valid JSON.
No markdown.
No explanation.

Use exactly this structure:

{
  "concepts": [
    {
      "title": "Concept title",
      "hook": "Short hook",
      "description": "One short description",
      "shots": [
        {
          "title": "Short shot title",
          "duration": "2-3 sec",
          "recordFrom": "front",
          "phoneSetup": "hold",
          "productSetup": "hold",
          "setupInstruction": "Simple setup instruction.",
          "aimInstruction": "Simple instruction explaining where to point the phone.",
          "actionType": "product_action",
          "actionName": "UNWRAP THE SOAP",
          "actionVisual": "unwrap",
          "movingObject": "product",
          "movement": "none",
          "movementSpeed": "slow",
          "actionInstruction": "Hold the soap and slowly slide the wrapper off.",
          "recordInstruction": "Keep recording while the wrapper comes off.",
          "say": ""
        }
      ]
    }
  ]
}
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

    if (image && image.startsWith('data:image/')) {
      content.push({
        type: 'input_image',
        image_url: image
      });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
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
                      title: { type: 'string' },
                      hook: { type: 'string' },
                      description: { type: 'string' },
                      shots: {
                        type: 'array',
                        minItems: 6,
                        maxItems: 6,
                        items: {
                          type: 'object',
                          additionalProperties: false,
                          properties: {
                            title: { type: 'string' },
                            duration: { type: 'string' },
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
                              enum: ['hold', 'fixed']
                            },
                            productSetup: {
                              type: 'string',
                              enum: ['hold', 'table', 'surface']
                            },
                            setupInstruction: { type: 'string' },
                            aimInstruction: { type: 'string' },
                            actionType: {
                              type: 'string',
                              enum: [
                                'camera_move',
                                'product_move',
                                'product_action',
                                'still'
                              ]
                            },
                            actionName: { type: 'string' },
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
                              enum: ['phone', 'product', 'none']
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
                              enum: ['slow', 'normal']
                            },
                            actionInstruction: { type: 'string' },
                            recordInstruction: { type: 'string' },
                            say: { type: 'string' }
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
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI error:', data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            'ShootAI could not generate the filming plan.'
        },
        { status: 500 }
      );
    }

    const outputText = data.output_text;

    if (!outputText) {
      console.error('No output_text:', data);

      return NextResponse.json(
        { error: 'ShootAI received an empty response.' },
        { status: 500 }
      );
    }

    let result;

    try {
      result = JSON.parse(outputText);
    } catch {
      console.error('Invalid JSON:', outputText);

      return NextResponse.json(
        { error: 'ShootAI received an invalid response.' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generate route error:', error);

    return NextResponse.json(
      { error: 'Something went wrong while generating your filming plan.' },
      { status: 500 }
    );
  }
}
