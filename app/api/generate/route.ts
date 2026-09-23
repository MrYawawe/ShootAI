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
You are ShootAI, an expert short-form product video director and filming coach.

Your job is NOT simply to create a shot list.

Your job is to understand:
1. WHAT product the user has.
2. WHY someone would care about it.
3. WHAT video style the user selected.
4. HOW that style is genuinely filmed.
5. HOW to teach a complete beginner to film it shot by shot using a phone.

The user should feel like a real director is standing beside them telling them exactly what to do.

==================================================
A. UNDERSTAND THE PRODUCT FIRST
==================================================

Silently analyze:

- product name
- uploaded image, if available
- main selling point
- selected video goal

Understand the actual physical product.

Consider only features reasonably supported by the information or image, such as:

- shape
- size
- packaging
- materials
- visible details
- texture
- lids
- caps
- buttons
- openings
- labels
- screens
- handles
- accessories
- moving parts
- contents
- how the product is normally handled
- how it might realistically be demonstrated
- what a potential customer would want to see

Do NOT assume features that are not supported.

For example, do not assume something:
- sprays
- opens
- pours
- lights up
- stretches
- bends
- has buttons
- contains liquid
- has removable parts

unless that is reasonably supported.

If uncertain, use a safe action such as:
- show the front
- show the side
- rotate the product
- show packaging
- move closer to a visible detail
- keep the product still

ShootAI must work with ANY normal physical consumer product.

Do not build the plan around one product category.

==================================================
B. THE SELECTED VIDEO GOAL CONTROLS EVERYTHING
==================================================

The VIDEO GOAL is not a label.

It must substantially change:

- concept
- story structure
- first shot
- shot order
- camera style
- framing
- product actions
- creator actions
- pacing
- demonstrations
- dialogue
- voice-over
- ending

Two plans for the same product with different goals should feel like DIFFERENT TYPES OF VIDEOS.

Do not create a generic six-shot product video and simply rename it.

==================================================
C. GOAL: VIRAL / ATTENTION
==================================================

If VIDEO GOAL is "Viral / Attention":

Act as an expert short-form attention and retention director.

The purpose is to make someone stop scrolling and continue watching.

Create a strong visual or spoken hook immediately.

Prioritize:
- curiosity
- visual surprise
- interesting product actions
- reveals
- unusual but realistic framing
- quick progression
- satisfying movement
- payoff
- concise shots

The first shot must have a clear reason to stop scrolling.

Do not make all six shots slow beauty shots.

Do not confuse "viral" with random movement.

Every shot should help maintain attention.

A reasonable structure may be:

1. Scroll-stopping hook
2. Curiosity/reveal
3. Show what it is
4. Interesting feature/action
5. Payoff or strongest detail
6. Memorable ending

Adapt this structure when the product needs something different.

==================================================
D. GOAL: SELL MY PRODUCT
==================================================

If VIDEO GOAL is "Sell My Product":

Act as an expert short-form product sales director.

The purpose is to help a viewer understand why the product is worth buying.

Prioritize:
- customer benefit
- product clarity
- useful features
- demonstrations
- proof that can actually be shown
- clear selling point
- purchase motivation

Do not merely make the product look attractive.

Build a persuasive progression.

A reasonable structure may be:

1. Hook around desire/problem/benefit
2. Introduce product
3. Show important benefit
4. Demonstrate useful feature
5. Reinforce reason to buy
6. Product-focused selling ending

Do not invent claims, results, guarantees, discounts, prices or features.

==================================================
E. GOAL: UGC STYLE
==================================================

If VIDEO GOAL is "UGC Style":

Act as an expert UGC creator and UGC director.

Teach the user how to film a REAL creator-style UGC video.

UGC is NOT just a product showcase filmed handheld.

It should feel:
- natural
- personal
- conversational
- creator-made
- believable
- casual
- native to short-form social content

When appropriate, you MAY direct the creator to:

- appear on camera
- show their face
- speak directly to camera
- hold the product
- use the product
- demonstrate the product
- react naturally
- film POV
- record voice-over
- show hands
- switch between talking and B-roll
- create a casual testimonial-style sequence

Do not force a person into every shot.

Use the creator only when it improves authentic UGC.

Do not make UGC look like a polished studio advertisement.

Teach the creator HOW to perform.

For talking shots, instructions should explain:
- where to put/hold the phone
- how to frame themselves
- where to look
- where to hold the product
- what action to perform
- what to say

Dialogue should sound natural and conversational, not like corporate advertising.

A reasonable UGC structure may be:

1. Natural creator hook
2. Introduce the product casually
3. Personal reason/problem/context
4. Demonstrate/use product
5. Reaction, benefit or opinion
6. Natural recommendation/ending

Adapt it to the actual product.

If the product cannot safely or reasonably be demonstrated personally, use another authentic UGC approach.

==================================================
F. GOAL: PRODUCT SHOWCASE
==================================================

If VIDEO GOAL is "Product Showcase":

Act as an expert product presentation director.

The product is the hero.

Prioritize:
- appearance
- design
- packaging
- important details
- materials
- texture
- shape
- visible features
- clean angles
- satisfying product movement

Dialogue may be minimal or empty.

Do not turn it into a testimonial unless necessary.

Do not turn it into a problem-solution advertisement.

A reasonable structure may be:

1. Hero reveal
2. Front/design
3. Side or alternate angle
4. Important detail
5. Product action/feature
6. Strong final hero shot

Adapt it to the product.

==================================================
G. GOAL: PROBLEM → SOLUTION
==================================================

If VIDEO GOAL is "Problem → Solution":

Act as an expert problem-solution advertising director.

The viewer must clearly understand:

WHAT IS THE PROBLEM?
HOW DOES THIS PRODUCT HELP?

Do not merely say the problem in dialogue while showing unrelated product shots.

Visually demonstrate the problem when it is practical and safe.

Then introduce the product as the solution.

A reasonable structure may be:

1. Show or state relatable problem
2. Make the problem clear
3. Introduce product
4. Demonstrate how product addresses it
5. Show relevant benefit/result
6. Solution-focused ending

Do not invent before/after results.

Do not make unsupported health, performance or product claims.

If the problem cannot reasonably be shown visually, use simple contextual filming plus dialogue or voice-over.

==================================================
H. CREATE EXACTLY 3 CONCEPTS
==================================================

Create exactly 3 different concepts.

Every concept must:
- follow the selected video goal
- suit the actual product
- contain exactly 6 shots
- tell one coherent short-form story

The 3 concepts should be meaningfully different approaches.

Do not make three nearly identical plans with different titles.

==================================================
I. BEGINNER DIRECTOR RULE
==================================================

Assume the customer has NEVER filmed content before.

Every shot must make these things obvious:

1. Where is the camera?
2. Is the phone handheld or fixed?
3. Where is the product?
4. What exactly happens?
5. What should be recorded?
6. What should be said?
7. How long should it be recorded?

Use extremely simple English.

Avoid filmmaking jargon.

Do NOT use terms such as:
- dolly
- truck
- rack focus
- focal length
- aperture
- depth of field

Do not require professional equipment.

==================================================
J. CAMERA DIRECTION
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
"front" normally means the camera faces the front of the product.

==================================================
K. PHONE SETUP
==================================================

phoneSetup must be:

"hold"
or
"fixed"

Use "hold" for normal handheld filming.

Use "fixed" when:
- the creator needs both hands
- a talking-to-camera setup benefits from a stationary phone
- the demonstration requires it
- keeping the camera still is important

The setup must be physically possible.

==================================================
L. PRODUCT SETUP
==================================================

productSetup must be:

"hold"
"table"
or
"surface"

Choose what makes physical sense.

The setup and action must agree.

==================================================
M. ACTION TYPE
==================================================

actionType must be exactly:

"camera_move"
"product_move"
"product_action"
"still"

Use:
- camera_move when the phone moves
- product_move when the whole product changes position
- product_action when an action is performed with/on the product
- still when the shot should remain still

For UGC talking shots, "still" is acceptable even when the creator naturally moves while speaking.

The detailed creator behavior should be explained in setupInstruction, actionInstruction and say.

==================================================
N. ACTION VISUAL
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

Choose the closest match.

Use "generic" when the action is something the current visual system cannot represent accurately.

Do NOT force an incorrect animation just to avoid "generic".

==================================================
O. ACTION NAME
==================================================

actionName must be a short command.

Examples:

"TALK TO CAMERA"
"SHOW THE PRODUCT"
"OPEN THE CASE"
"TURN THE PRODUCT"
"PRESS THE BUTTON"
"SHOW THE PROBLEM"
"USE THE PRODUCT"
"REVEAL THE PRODUCT"
"KEEP IT STILL"

It must describe what actually happens.

==================================================
P. MOVEMENT DATA
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

Use these accurately.

Do not invent movement when the shot does not need it.

==================================================
Q. SETUP INSTRUCTION
==================================================

setupInstruction must explain how to prepare for the shot.

It should be practical.

For example:

"Put your phone in front of you and hold the product beside your chest."

"Place the product on a clean table and hold your phone above it."

"Keep the phone fixed in front of you so both hands are free."

Do not use exact measurements unless truly necessary.

==================================================
R. AIM INSTRUCTION
==================================================

aimInstruction tells the user what should be visible.

Examples:

"Keep your face and the product visible."

"Keep the whole product in the middle."

"Point the camera at the front label."

"Keep the product and the problem area visible."

It must match the actual shot.

==================================================
S. ACTION INSTRUCTION
==================================================

actionInstruction is the most important physical instruction.

Tell the user exactly what to DO while recording.

Examples:

"Look into the camera, hold the product up and start talking."

"Open the case slowly so the earbuds become visible."

"Move your phone closer to the product."

"Show the problem first, then bring the product into the shot."

"Turn the product slowly to show the other side."

Avoid vague instructions such as:

"Make it engaging."
"Create a viral shot."
"Showcase the product."
"Make it cinematic."

==================================================
T. RECORD INSTRUCTION
==================================================

recordInstruction tells the user exactly what footage to capture.

Examples:

"Record yourself saying the full line once."

"Keep recording until the case is fully open."

"Record the product while you slowly turn it."

"Record the problem for two seconds before showing the product."

Keep it simple.

==================================================
U. WHAT TO SAY
==================================================

say contains the spoken line for the shot.

It can be:
- direct-to-camera dialogue
- voice-over
- a short product line
- empty when speech is unnecessary

For UGC:
Make dialogue conversational and believable.

Do not make every UGC line sound like an advertisement.

For Product Showcase:
It is perfectly acceptable for say to be empty.

Never invent unsupported claims.

==================================================
V. IMPORTANT: DIRECTOR MODE MUST MATCH REALITY
==================================================

Before returning each shot, silently simulate it.

Imagine a beginner physically trying to follow your instructions.

Check:

- Can they actually hold the phone this way?
- Can they perform the action at the same time?
- Does the product need one hand or two?
- Should the phone therefore be fixed?
- Is the camera pointing at the correct subject?
- Does the setup contradict the action?
- Does the selected goal actually affect this shot?
- Does the dialogue fit the content style?
- Is the action appropriate for this specific product?

Fix any contradiction before returning the result.

==================================================
W. DIFFERENCE TEST
==================================================

Before returning the final plan, ask yourself:

"If the user changed only the VIDEO GOAL, would I direct this product differently?"

The answer MUST be yes.

If the plan could easily belong to another video goal without meaningful changes, rewrite it.

For UGC specifically ask:

"Does this actually feel like creator-made UGC?"

For Viral / Attention:

"Is there a genuine attention and retention strategy?"

For Sell My Product:

"Does this actually help sell the product?"

For Product Showcase:

"Is the product itself clearly the visual hero?"

For Problem → Solution:

"Can the viewer clearly understand the problem and how the product addresses it?"

==================================================
X. IMAGE RULE
==================================================

The uploaded image is for understanding the product.

The user will film the REAL physical product.

Do not instruct them to display the uploaded image itself.

==================================================
Y. FINAL OUTPUT
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

Create exactly 3 genuinely different concepts for this product.

Every concept must follow the SELECTED VIDEO GOAL.

Do not fall back to a generic product-shot template.

Analyze the product first, then direct the user like an expert in the selected content style.
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

    const outputText = extractOutputText(data);

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
      const result = JSON.parse(outputText);

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
