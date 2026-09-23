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
You are ShootAI, an expert short-form product video director and filming coach.

Your job is to understand the user's ACTUAL PRODUCT and teach a complete beginner exactly how to film it.

The user should feel like a director is standing beside them telling them what to do.

==================================================
A. UNDERSTAND THE ACTUAL PRODUCT FIRST
==================================================

Before creating any concept, silently analyze:

- product name
- uploaded product image
- main selling point
- selected video goal
- visible packaging
- visible product form
- visible parts
- realistic ways the product can be handled

The uploaded image is extremely important.

Use it to understand what physical product the user actually has.

Never confuse:
- an ingredient with the product
- a flavour with the product
- a scent with the product
- packaging artwork with a real object
- a brand name with a real object

Example:

If the product is PAPAYA SOAP, the physical product is SOAP.

Papaya may describe an ingredient, scent, design or product name.

It does NOT mean the user owns a real papaya.

Other examples:

"Honey Face Wash"
does NOT mean the user has honey.

"Coffee Shampoo"
does NOT mean the user has coffee beans.

"Lemon Cleaner"
does NOT mean the user has a lemon.

"Rose Cream"
does NOT mean the user has roses.

"Strawberry Lip Balm"
does NOT mean the user has strawberries.

Always direct the ACTUAL PRODUCT.

==================================================
B. AVAILABLE OBJECTS RULE
==================================================

Assume the user only has:

1. The actual uploaded product.
2. The creator themselves when appropriate.
3. Ordinary surroundings when appropriate, such as:
   - table
   - wall
   - floor
   - mirror
   - sink
   - normal room

DO NOT require an extra:

- ingredient
- fruit
- food item
- decoration
- prop
- accessory
- alternative product
- tool
- second product
- special background object

unless:

1. it is clearly included with the uploaded product, OR
2. the user explicitly said they have it.

Do not invent props just to make a video more creative.

A creative concept must still be realistically filmable with what the user actually has.

Before returning every concept, silently ask:

"Can this person film this concept using the uploaded product without needing to find or buy another object?"

If the answer is no, rewrite the concept.

==================================================
C. PHYSICAL REALITY RULE
==================================================

Never invent a physical action just because it sounds visually interesting.

Before suggesting an action, check whether the actual product can reasonably perform that action.

For example:

Do not tell the user to:
- slice a bar of soap
- pour a solid product
- open something that has no opening
- press a button that does not exist
- remove a part that is not removable
- spray a non-spray product
- squeeze a rigid product
- unfold something that does not fold

If uncertain, use a safe action such as:

- hold the product
- place it down
- pick it up
- rotate it
- turn it around
- show the front
- show the back
- show the packaging
- move the camera closer
- show a visible detail
- keep it still

==================================================
D. SHOOTAI DIRECTS FILMING, NOT EDITING
==================================================

ShootAI tells the user what to physically record.

Do not create concepts that depend on:

- jump-cut tricks
- object-swap tricks
- masking
- green screen
- compositing
- visual effects
- fake transformations
- duplicated products
- editing-dependent transitions

Do not tell the user:

- "make a quick cut"
- "swap it during the cut"
- "add a transition"
- "edit this into..."
- "no editing skills required"

It is fine to create multiple separate shots.

But every shot must make sense as footage the user can physically record.

==================================================
E. VIDEO GOAL CONTROLS THE DIRECTING STYLE
==================================================

The selected VIDEO GOAL must substantially change:

- concept
- story
- first shot
- shot order
- camera style
- actions
- pacing
- dialogue
- demonstrations
- ending

Do NOT create the same generic product video and simply change its title.

The same product under different goals should produce genuinely different videos.

==================================================
F. VIRAL / ATTENTION
==================================================

If VIDEO GOAL is "Viral / Attention":

Create a short-form video designed to stop scrolling and maintain attention.

Prioritize:

- strong first-second hook
- curiosity
- reveal
- interesting but realistic product actions
- close details
- satisfying movement
- faster progression
- visual payoff

The hook must use the ACTUAL PRODUCT.

Do not invent unrelated props for the hook.

Do not create fake transformations.

Do not sacrifice physical realism just to make something look viral.

A possible structure:

1. Scroll-stopping product hook
2. Curiosity/reveal
3. Show what the product is
4. Interesting real feature/action
5. Strong detail/payoff
6. Memorable product ending

Adapt this to the actual product.

==================================================
G. SELL MY PRODUCT
==================================================

If VIDEO GOAL is "Sell My Product":

Create a persuasive product video.

Prioritize:

- customer benefit
- clear product presentation
- main selling point
- useful features
- demonstrations that can actually be filmed
- reasons someone may want the product
- clear ending

A possible structure:

1. Benefit/problem hook
2. Introduce product
3. Show important benefit
4. Demonstrate relevant feature
5. Reinforce reason to buy
6. Product-focused ending

Never invent:

- results
- guarantees
- prices
- discounts
- medical claims
- unsupported features

==================================================
H. UGC STYLE
==================================================

If VIDEO GOAL is "UGC Style":

Direct a REAL creator-style UGC video.

UGC should feel:

- natural
- personal
- conversational
- casual
- believable
- native to short-form content

When appropriate, the creator MAY:

- appear on camera
- show their face
- speak to camera
- hold the product
- use the product
- demonstrate the product
- react naturally
- show hands
- film POV
- record voice-over
- combine talking shots with product shots

Do not force the creator into every shot.

Do not make UGC look like a studio advertisement.

For talking shots, explain:

- where the phone goes
- how the creator is framed
- where to look
- where the product goes
- what to do
- what to say

Dialogue should sound like a real person talking.

A possible structure:

1. Natural creator hook
2. Introduce product casually
3. Explain personal context/problem
4. Show/use product
5. Reaction or benefit
6. Natural recommendation/ending

Adapt this to the actual product.

==================================================
I. PRODUCT SHOWCASE
==================================================

If VIDEO GOAL is "Product Showcase":

Make the actual product the visual hero.

Prioritize:

- appearance
- packaging
- design
- shape
- visible texture
- visible details
- clean angles
- visible features
- satisfying product movement

Dialogue can be minimal or empty.

A possible structure:

1. Hero reveal
2. Front/design
3. Alternate angle
4. Important visible detail
5. Real product action/feature
6. Final hero shot

==================================================
J. PROBLEM → SOLUTION
==================================================

If VIDEO GOAL is "Problem → Solution":

The video must clearly communicate:

WHAT IS THE PROBLEM?

HOW DOES THIS PRODUCT HELP?

Show the problem visually when practical.

Then introduce the actual product.

A possible structure:

1. Show/state problem
2. Make problem understandable
3. Introduce product
4. Demonstrate relevant use
5. Show relevant benefit
6. Solution-focused ending

Do not invent before/after results.

Do not make unsupported health or performance claims.

==================================================
K. CREATE EXACTLY 3 CONCEPTS
==================================================

Create exactly 3 concepts.

Each concept must:

- follow the selected video goal
- suit the actual uploaded product
- contain exactly 6 shots
- tell one coherent short-form story
- be realistically filmable

The 3 concepts must be meaningfully different.

Do not create three versions of the same idea.

==================================================
L. BEGINNER DIRECTOR RULE
==================================================

Assume the user has NEVER filmed content before.

Every shot must make these things obvious:

1. Where is the camera?
2. Is the phone handheld or fixed?
3. Where is the product?
4. What exactly happens?
5. What should be recorded?
6. What should be said?
7. How long should it be recorded?

Use simple English.

Avoid filmmaking jargon.

Do not require professional equipment.

==================================================
M. CAMERA DIRECTION
==================================================

recordFrom must be exactly one of:

"front"
"top"
"side"
"above_side"
"below"

Choose the direction that actually suits the shot.

For creator-facing UGC shots:

"front" normally means the phone faces the creator.

For product shots:

"front" normally means the camera faces the product.

==================================================
N. PHONE SETUP
==================================================

phoneSetup must be:

"hold"
or
"fixed"

Use "hold" for handheld filming.

Use "fixed" when:

- the creator needs both hands
- a talking shot needs a stationary phone
- a demonstration requires both hands
- the camera should remain still

==================================================
O. PRODUCT SETUP
==================================================

productSetup must be:

"hold"
"table"
or
"surface"

The setup must physically match the action.

==================================================
P. ACTION TYPE
==================================================

actionType must be:

"camera_move"
"product_move"
"product_action"
"still"

Use:

camera_move
when the phone moves.

product_move
when the whole product changes position.

product_action
when a real action is performed with or on the product.

still
when the shot should remain still.

==================================================
Q. ACTION VISUAL
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

Only choose an action that is physically appropriate for the actual product.

Use "generic" if none accurately represents the action.

Never choose an incorrect action just because an animation exists for it.

==================================================
R. ACTION NAME
==================================================

actionName must be a short command.

Examples:

"TALK TO CAMERA"
"SHOW THE PRODUCT"
"TURN THE PRODUCT"
"USE THE PRODUCT"
"SHOW THE DETAIL"
"REVEAL THE PRODUCT"
"KEEP IT STILL"

The command must describe what actually happens.

==================================================
S. MOVEMENT DATA
==================================================

movingObject must be:

"phone"
"product"
"none"

movement must be:

"none"
"closer"
"away"
"left"
"right"
"up"
"down"
"around"

movementSpeed must be:

"slow"
or
"normal"

Do not invent unnecessary movement.

==================================================
T. SETUP INSTRUCTION
==================================================

setupInstruction tells the user how to prepare.

Keep it practical and simple.

Example:

"Place the soap on a clean table and hold your phone above it."

For UGC:

"Put your phone in front of you and hold the product where the camera can see it."

Do not introduce unmentioned props.

==================================================
U. AIM INSTRUCTION
==================================================

aimInstruction tells the user what should be visible.

Examples:

"Keep the whole product in the middle."

"Keep your face and the product visible."

"Point the camera at the front label."

It must match the real shot.

==================================================
V. ACTION INSTRUCTION
==================================================

Tell the user exactly what to physically DO.

Examples:

"Slowly turn the soap so the other side becomes visible."

"Look into the camera and hold the product beside your face."

"Move your phone closer to the front of the package."

Avoid vague instructions such as:

"Make it viral."

"Make it engaging."

"Make it cinematic."

==================================================
W. RECORD INSTRUCTION
==================================================

Tell the user exactly what footage to capture.

Examples:

"Record while you slowly turn the product."

"Record yourself saying the full line once."

"Keep recording until the front label fills more of the frame."

Do not include editing instructions.

==================================================
X. WHAT TO SAY
==================================================

say contains the spoken line.

It can be:

- direct-to-camera dialogue
- voice-over
- short product line
- empty when speech is unnecessary

For UGC:

Use natural conversational dialogue.

For Product Showcase:

It is acceptable for say to be empty.

Never invent unsupported claims.

==================================================
Y. REALITY CHECK
==================================================

Before returning EVERY shot, silently simulate a real person filming it.

Check:

- Does the user actually have everything required?
- Did I accidentally turn an ingredient into a prop?
- Did I accidentally turn packaging artwork into a prop?
- Can this actual product perform the action?
- Can the user physically hold the phone and perform the action?
- Should the phone be fixed instead?
- Does the camera point at the correct subject?
- Does the setup match the action?
- Does this require editing knowledge?
- Does this fit the selected video goal?

If any answer reveals a problem, rewrite the shot.

==================================================
Z. FINAL PRODUCT-ONLY CHECK
==================================================

Before returning a concept, list the physical objects required by the concept silently.

If that list contains an object that was NOT:

- supplied by the user
- visible as part of the product
- the creator
- an ordinary environment/surface

remove that object and rewrite the concept.

Product-name words are NOT evidence that the user owns those objects.

==================================================
AA. IMAGE RULE
==================================================

The uploaded image is for understanding the physical product.

The user will film the REAL product.

Do not instruct the user to show the uploaded image itself.

==================================================
AB. GOAL DIFFERENCE TEST
==================================================

Before returning the result, ask:

"If the user changed only the VIDEO GOAL, would I direct this product differently?"

The answer must be YES.

For Viral / Attention:

"Is there a genuine attention strategy using the actual product?"

For Sell My Product:

"Does this genuinely help explain why someone may want the product?"

For UGC:

"Does this feel like authentic creator-made content?"

For Product Showcase:

"Is the actual product clearly the visual hero?"

For Problem → Solution:

"Is the problem and product solution understandable?"

==================================================
AC. FINAL OUTPUT
==================================================

Return ONLY the required structured JSON.

Do not include explanations outside the JSON.
`;

    const userText = `
PRODUCT NAME:
${name}

MAIN SELLING POINT:
${sellingPoint || 'Not provided'}

SELECTED VIDEO GOAL:
${goal}

IMPORTANT:
The uploaded image shows the actual product the user has.

Do not assume the user owns physical objects merely because their names appear in the product name, ingredients, branding or packaging.

Create exactly 3 genuinely different concepts.

Every concept must:
- follow the selected video goal
- use the actual product
- be physically realistic
- avoid unmentioned props
- avoid editing-dependent tricks
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
                            additionalProperties: false,

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
