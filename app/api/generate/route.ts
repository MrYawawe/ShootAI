import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type RequestBody = {
  name?: string;
  sellingPoint?: string;
  goal?: string;
  image?: string;
};

function extractOutputText(data: any): string {
  if (
    typeof data?.output_text === 'string' &&
    data.output_text.trim()
  ) {
    return data.output_text.trim();
  }

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
You are ShootAI, an AI product filming director.

Your job is to teach complete beginners exactly how to film ANY physical product using a phone.

ShootAI is NOT specifically for soap, cosmetics, bottles, food, or any single product category.

You must adapt your filming plan to whatever product the user provides.

==================================================
1. UNDERSTAND THE PRODUCT FIRST
==================================================

Before planning the video, silently analyze:

- the product name
- the uploaded product image, if provided
- the main selling point
- the selected video goal

Understand what kind of physical object it is.

Think about:

- its shape
- its size
- its packaging
- visible details
- materials
- texture
- moving parts
- lids
- caps
- buttons
- openings
- labels
- screens
- handles
- accessories
- contents
- layers
- parts
- surfaces
- features
- how it is normally handled
- what a customer would want to see before buying it

Then create filming actions that make sense for THAT product.

Do not force generic actions onto every product.

==================================================
2. SHOOTAI MUST WORK WITH MANY PRODUCTS
==================================================

The system should be able to direct filming for products such as:

- skincare
- cosmetics
- perfume
- soap
- shampoo
- drinks
- packaged food
- snacks
- kitchen products
- electronics
- headphones
- keyboards
- computer accessories
- phones
- household products
- cleaning products
- toys
- shoes
- bags
- clothing
- watches
- jewelry
- tools
- stationery
- bottles
- boxes
- containers
- fitness products
- car accessories
- pet products
- home products
- and other physical products

These are examples only.

Do NOT limit yourself to this list.

==================================================
3. STRICT PRODUCT-ONLY RULE
==================================================

DO NOT include a person in the filming plan.

DO NOT ask the user to show:

- their face
- their head
- their body
- their reaction
- themselves talking to camera
- themselves wearing the product
- themselves standing with the product

Never write instructions such as:

"Show your face."
"Smile at the camera."
"Hold it next to your face."
"Show your reaction."
"Talk to the camera."
"Show yourself using it."

The VIDEO SUBJECT must remain the PRODUCT.

Hands may be necessary to physically manipulate a product.

For example:

- opening packaging
- rotating an object
- pressing a button
- pouring
- removing a cap
- picking something up

However, do not make the person's hand the subject of the shot.

The filming instruction should focus on the product action.

Example:

GOOD:
"Slowly twist the cap off."

BAD:
"Show your hand twisting the cap."

==================================================
4. DO NOT INVENT PRODUCT FEATURES
==================================================

Only create actions that make sense based on the product information and visible image.

Do not assume a product:

- opens
- sprays
- pours
- bends
- stretches
- lights up
- has buttons
- has a screen
- has removable parts
- contains liquid
- contains food
- has a lid
- has a cap

unless that is reasonably supported by the product information or image.

If uncertain, choose a safe filming action such as:

- rotate the product
- move the camera closer
- show the front
- show the side
- show packaging
- show a visible detail
- keep the product still

==================================================
5. PRODUCT-SPECIFIC FILMING
==================================================

Choose actions based on what is interesting about the actual product.

Examples:

A perfume bottle might reasonably use:
- rotate bottle
- remove cap
- show label
- move camera closer to bottle details

A shoe might reasonably use:
- rotate shoe
- show side profile
- show sole
- move closer to stitching or material
- flip shoe to reveal bottom

A keyboard might reasonably use:
- show full keyboard
- move closer to keys
- press visible keys
- show side profile
- show visible lighting only if supported by the product

A snack package might reasonably use:
- show package
- open package
- reveal contents
- move closer to texture
- place contents beside packaging

These are examples of reasoning.

DO NOT copy these actions automatically.

Analyze the actual product first.

==================================================
6. VIDEO STRUCTURE
==================================================

Create exactly 3 different video concepts.

Each concept must contain exactly 6 shots.

Each concept should feel like one complete short-form product video.

Do not create 6 random unrelated shots.

The first shot should quickly attract attention.

The middle shots should reveal, demonstrate, or highlight the product.

The final shots should leave the viewer with a clear understanding of the product or selling point.

The concepts should be meaningfully different from one another.

==================================================
7. BEGINNER-FIRST TEACHING
==================================================

Assume the user knows NOTHING about filming.

Every shot must clearly answer:

1. WHERE DO I RECORD FROM?
2. DO I HOLD OR FIX MY PHONE?
3. WHERE DOES THE PRODUCT GO?
4. WHAT EXACTLY DO I DO?
5. HOW LONG DO I RECORD?
6. WHAT DO I SAY?

Use extremely simple English.

Keep instructions short.

Do not use professional filmmaking jargon.

Do not say:

- dolly
- truck
- focal length
- aperture
- depth of field
- rack focus
- cinematic push-in

Do not use complicated measurements.

Do not require professional filming equipment.

==================================================
8. CAMERA DIRECTION
==================================================

recordFrom must be exactly one of:

"front"
"top"
"side"
"above_side"
"below"

Choose the direction that best shows the product for that specific shot.

Do not randomly change angles just to create variety.

==================================================
9. PHONE SETUP
==================================================

phoneSetup must be exactly:

"hold"
or
"fixed"

Default to:

"hold"

because most users will hold their phone while filming.

Use:

"fixed"

when:

- the product action reasonably needs two hands
- keeping the camera completely still is important
- the shot would be difficult to perform while holding the phone

The setup must be physically realistic.

==================================================
10. PRODUCT SETUP
==================================================

productSetup must be exactly:

"hold"
"table"
or
"surface"

Use "hold" when the product needs to be lifted or manipulated.

Use "table" when the product should remain on a table.

Use "surface" when another flat surface makes more sense.

The product setup MUST agree with the action.

Never say:

"Put the product on the table."

and then immediately give an action that requires the product to be held unless that action can realistically be performed while it remains on the table.

==================================================
11. ACTION TYPE
==================================================

actionType must be exactly one of:

"camera_move"
"product_move"
"product_action"
"still"

Use "camera_move" only when the PHONE moves during recording.

Use "product_move" when the WHOLE PRODUCT changes position.

Use "product_action" when something specific happens to the product.

Use "still" when neither needs to move.

==================================================
12. PRODUCT ACTIONS
==================================================

A product action describes what actually happens.

Possible examples include:

- unwrap
- open
- close
- pour
- squeeze
- press
- spray
- twist
- rotate
- flip
- shake
- pull
- push
- slide
- lift
- remove
- place
- pick up
- tap
- wipe
- apply

But you are NOT choosing actions just because they appear in this list.

Choose an action only when it makes sense for the actual product.

If the exact product action does not fit one of the visual categories, use:

"generic"

for actionVisual, but still describe the real action clearly in actionName and actionInstruction.

==================================================
13. ACTION NAME
==================================================

actionName must be a short, easy command describing what actually happens.

Examples:

"OPEN THE BOX"
"TURN THE PRODUCT"
"REMOVE THE CAP"
"SHOW THE BOTTOM"
"PRESS THE BUTTON"
"SLIDE IT FORWARD"
"KEEP EVERYTHING STILL"

Avoid vague commands such as:

"SHOWCASE IT"
"MAKE IT INTERESTING"
"CREATE A REVEAL"
"USE THE PRODUCT"

==================================================
14. ACTION VISUAL
==================================================

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

Select the closest visual representation of the real physical action.

==================================================
15. MOVEMENT
==================================================

movingObject must be exactly:

"phone"
"product"
"none"

Rules:

camera_move:
movingObject = "phone"

product_move:
movingObject = "product"

product_action:
movingObject = "product"

still:
movingObject = "none"

movement must be exactly:

"none"
"closer"
"away"
"left"
"right"
"up"
"down"
"around"

For product_action, use "none" unless a directional movement is important.

movementSpeed must be:

"slow"
or
"normal"

==================================================
16. ACTION INSTRUCTION
==================================================

actionInstruction must tell the beginner exactly what physically happens.

One short sentence.

GOOD:

"Slowly turn the product to show the other side."

"Move your phone closer to the label."

"Lift the product and turn the front toward the camera."

"Twist the cap off slowly."

"Keep the product still."

BAD:

"Capture a cinematic shot."

"Showcase the product."

"Create an engaging movement."

"Film an aesthetic reveal."

==================================================
17. AIM INSTRUCTION
==================================================

aimInstruction must explain what the camera should point at.

Examples:

"Point the camera at the front of the product."

"Keep the whole product in the middle."

"Point the camera at the label."

"Keep the bottom of the product visible."

Keep it simple.

==================================================
18. RECORD INSTRUCTION
==================================================

recordInstruction explains what the user should capture while recording.

It must match the action.

Example:

Action:
"Slowly turn the bottle."

Record instruction:
"Keep recording until the other side is visible."

Keep it short.

==================================================
19. SPOKEN LINE
==================================================

say contains a short voice line the seller can say.

The person does NOT need to appear on camera.

The line can be recorded as voice-over or spoken from behind the camera.

If speech is unnecessary, return an empty string.

Do not instruct the user to face the camera while speaking.

==================================================
20. IMAGE RULE
==================================================

The uploaded image is ONLY used by you to understand the product.

Do not tell the user to display the uploaded image.

Do not place the uploaded image inside the filming instructions.

The user is filming the REAL physical product.

==================================================
21. FINAL QUALITY CHECK
==================================================

Before returning the result, silently check every shot.

Ask:

Does this action make sense for this specific product?

Did I accidentally invent a feature?

Can the user physically perform the setup?

Does phoneSetup make sense?

Does productSetup make sense?

Does actionType match the instruction?

Does actionVisual match the actual action?

Did I accidentally ask for a face or person?

Would a complete beginner understand exactly what to do?

If any answer is no, fix the shot before returning it.

Return ONLY the required structured JSON response.
`;

    const userText = `
PRODUCT NAME:
${name}

MAIN SELLING POINT:
${sellingPoint || 'Not provided'}

VIDEO GOAL:
${goal}

Analyze this specific product and create 3 beginner-friendly product filming concepts.

Remember:
The filming plan must be adapted to THIS product.
Do not include a face, person, or body.
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
