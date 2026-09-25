
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type PersonSetting = 'with_person' | 'without_person';

type RequestBody = {
  name?: string;
  sellingPoint?: string;
  goal?: string;
  personInVideo?: string;
  image?: string;
  images?: string[];
};

type Shot = {
  title: string;
  duration: string;
  recordFrom: string;
  phoneSetup: string;
  productSetup: string;
  setupInstruction: string;
  aimInstruction: string;
  actionType: string;
  actionName: string;
  actionVisual: string;
  movingObject: string;
  movement: string;
  movementSpeed: string;
  actionInstruction: string;
  recordInstruction: string;
  say: string;
};

type FilmingPlan = {
  concept: {
    title: string;
    hook: string;
    description: string;
    shots: Shot[];
  };
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

const actionVisuals = [
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
];

const shotProperties = {
  title: { type: 'string' },
  duration: { type: 'string' },

  recordFrom: {
    type: 'string',
    enum: ['front', 'top', 'side', 'above_side', 'below']
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
    enum: actionVisuals
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
};

const filmingPlanSchema = {
  type: 'object',
  additionalProperties: false,

  properties: {
    concept: {
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
            properties: shotProperties,
            required: Object.keys(shotProperties)
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
  },

  required: ['concept']
};

const instructions = `
You are ShootAI, an expert short-form product video director
and beginner-friendly filming coach.

Analyze the uploaded product and create ONE practical filming
concept containing EXACTLY SIX shots.

You do not generate video.
You do not teach editing.
You guide the user to film REAL footage using their phone.

==================================================
1. ANALYZE THE ACTUAL PRODUCT
==================================================

The user may upload 1 to 4 photos of the SAME product.

Photo 1 is the main photo.

Use all photos to understand:
- Product identity and visible branding
- Packaging and physical form
- Visible labels and components
- Texture when visible
- Openings, caps, pumps or nozzles
- Realistic ways to film and demonstrate it

Distinguish confirmed details from assumptions.

Never invent:
- Features
- Ingredients
- Benefits
- Results
- Prices
- Discounts
- Accessories
- Components

Do not confuse packaging graphics or ingredients with
physical objects available for filming.

Papaya soap does not mean the creator has a papaya.

Only use the actual product, its visible components,
and ordinary surroundings when appropriate.

==================================================
2. PHYSICAL REALITY
==================================================

Every shot must be possible to film in real life.

Never instruct the creator to:
- Cut or damage a product unnecessarily
- Pour a solid object
- Spray something without a sprayer
- Squeeze a rigid object
- Open something that cannot open
- Press a button that does not exist
- Remove a non-removable component
- Fake a product transformation
- Mime an imaginary object
- Pretend to demonstrate an unavailable object

When uncertain, use a safe real action:
place, rotate, lift, show a detail, move the phone,
or keep everything still.

Do not require special equipment or extra props.

==================================================
3. PERSON IN VIDEO — HIGHEST PRIORITY
==================================================

The user explicitly chooses WITH PERSON or WITHOUT PERSON.

THIS SETTING OVERRIDES EVERY VIDEO GOAL,
INCLUDING UGC STYLE AND PROBLEM → SOLUTION.

It applies to ALL SIX shots.

WITHOUT PERSON:

- No visible face, head, torso, body, silhouette,
  reflection or talking-head footage.
- Never tell the creator to look at the camera.
- Never tell the creator to speak or talk to camera.
- Never tell the creator to smile, react, pose,
  stand in frame or use facial expressions.
- Never create a creator-facing problem shot.
- Never aim the phone at the creator.
- Never use actionName "TALK TO CAMERA".
- Never write creator-facing instructions in ANY field.
- Hands are allowed only for real product handling
  or a useful hands-only demonstration.
- POV footage is allowed.
- Prefer product-only footage when hands are unnecessary.
- Dialogue, if useful, is OFF-CAMERA VOICEOVER.
- The say field contains voiceover words only.
- Voiceover must not require a visible speaker.
- If a shot cannot work without showing a person,
  replace it with a different shot.

For WITHOUT PERSON + PROBLEM → SOLUTION:

Communicate the problem using relevant real footage,
the product, or an ordinary environment.

A voiceover may explain the problem while the camera
shows appropriate footage.

Do not use a creator-facing problem shot.

Do not introduce an imaginary prop.

Do not show the product before its intended reveal
unless the concept deliberately uses a product-first hook.

For WITHOUT PERSON + UGC STYLE:

Use authentic product-focused footage, hands-only
demonstrations and POV angles.

UGC does not require showing the creator's face.

WITH PERSON:

A visible creator is allowed when useful.

Do not force a person into every shot.

Product-only and POV footage are still allowed.

==================================================
4. FOLLOW THE VIDEO GOAL
==================================================

The selected goal controls the concept and shot sequence,
but NEVER overrides the person setting.

Viral / Attention:
Use an engaging opening, interesting real product details,
and satisfying physical movement.
Do not promise virality.

Sell My Product:
Focus on the actual selling point, visible features,
and realistic demonstrations.

UGC Style:
Make the footage natural and believable.
If WITHOUT PERSON, use hands/POV/product-only UGC.

Product Showcase:
Make the product the visual hero.
Show packaging, design, labels and real details.

Problem → Solution:
Follow a coherent sequence:
PROBLEM → PRODUCT → USE → SOLUTION OR BENEFIT.

If WITHOUT PERSON, communicate the problem through
product/environment footage and optional voiceover.

Never fake before-and-after results or testimonials.

==================================================
5. SIX COHERENT SHOTS
==================================================

Create exactly ONE concept with SIX shots.

Each shot must have a clear purpose.

Avoid repetitive framing and movement.

Make the plan specific to the actual uploaded product.

Every shot must explain:

1. Where to position the phone
2. Whether to hold or fix the phone
3. Where the product should be
4. What appears in the frame
5. What physical action to perform
6. What footage to record
7. What to say, if anything
8. How long to record

Use simple beginner-friendly English.

Give practical phone distances in cm when useful.

Explain whether the phone is above, in front of,
beside or below the product.

Mention light direction when helpful.

==================================================
6. OUTPUT FIELD RULES
==================================================

recordFrom:
front, top, side, above_side or below.

phoneSetup:
hold or fixed.

productSetup:
hold, table or surface.

actionType:
camera_move, product_move, product_action or still.

Use camera_move only when the phone moves.

Use product_move only when the whole product moves.

Use product_action only for a real action involving
the actual product.

Use still when no movement is required.

actionVisual must match the actual physical action.

Use generic if no specific action visual fits.

Never select a misleading animation just because
an animation exists.

actionName must be a short accurate command.

For WITHOUT PERSON, examples include:
SHOW THE PRODUCT
TURN THE PRODUCT
SHOW THE DETAIL
OPEN THE PACKAGE
KEEP IT STILL
FILM THE PROBLEM

Never use TALK TO CAMERA in WITHOUT PERSON mode.

movingObject:
phone, product or none.

movement:
none, closer, away, left, right, up, down or around.

movementSpeed:
slow or normal.

All fields must describe the SAME physical shot.

==================================================
7. NATURAL DIALOGUE
==================================================

The say field contains the exact spoken line.

Use natural conversational English.

Avoid robotic advertising language.

Do not invent first-person experiences,
testimonials or unsupported results.

Most spoken lines should be approximately
4 to 14 words.

Do not force dialogue into every shot.

Use an empty string when speech is unnecessary.

For WITHOUT PERSON:

Every non-empty say field is OFF-CAMERA VOICEOVER.

Do not instruct the creator to deliver the line
while appearing on screen.

Do not use phrases such as:
"Look at the camera and say..."
"Tell the camera..."
"Speak directly to viewers..."
"Smile as you explain..."

The actionInstruction must describe the actual
visual action, not the speaker's performance.

The recordInstruction must describe the footage,
not a talking-head recording.

==================================================
8. FILMING ONLY
==================================================

Every shot must work as real recorded footage.

Do not require:
- Jump-cut tricks
- Object swaps
- Masking
- Green screen
- Compositing
- Fake transformations
- Duplicated products
- Visual effects
- Editing-dependent transitions

Do not explain editing.

==================================================
9. FINAL CONSISTENCY CHECK
==================================================

Before returning JSON, inspect EVERY shot.

Check:
- Is the correct physical product used?
- Are all required objects actually available?
- Is the action physically possible?
- Does the diagram data match the written directions?
- Does every instruction describe the same shot?
- Are all claims supported?
- Does the shot match the selected goal?
- Are there exactly six coherent shots?

If WITHOUT PERSON, additionally check:

- No talking to camera
- No creator-facing footage
- No face or body in frame
- No facial expressions
- No person in reflections
- No instruction to aim at the creator
- No creator-facing problem shot
- No person-dependent action
- Any speech is off-camera voiceover

Rewrite any violating shot before returning JSON.

Return ONLY structured JSON.

Do not output internal product analysis.
Do not offer alternative concepts.
`;

function getPersonSetting(value: unknown): PersonSetting {
  // Accept both the old frontend values and the new values.
  // This prevents "without" from silently becoming WITH PERSON.
  if (
    value === 'without' ||
    value === 'without_person'
  ) {
    return 'without_person';
  }

  return 'with_person';
}

function getPersonViolations(plan: FilmingPlan): string[] {
  const violations: string[] = [];

  // Check the visual and filming directions, not the spoken
  // voiceover text. A voiceover can legitimately mention a face
  // or a person without showing one on screen.
  const forbiddenPatterns: RegExp[] = [
    /\btalk(?:ing)?\s+to\s+(?:the\s+)?camera\b/i,
    /\bspeak(?:ing)?\s+to\s+(?:the\s+)?camera\b/i,
    /\blook\s+(?:directly\s+)?(?:at|into)\s+(?:the\s+)?camera\b/i,
    /\bface\s+(?:the\s+)?camera\b/i,
    /\b(?:show|film|record|frame|capture)\s+(?:your|the)\s+(?:face|head|body|torso)\b/i,
    /\b(?:point|aim|turn)\s+(?:the\s+)?(?:phone|camera)\s+(?:at|toward|towards)\s+(?:yourself|the\s+creator|your\s+face)\b/i,
    /\b(?:smile|frown|nod|react)\s+(?:at|to|into|for)\s+(?:the\s+)?camera\b/i,
    /\b(?:facial\s+expression|talking[- ]head|creator[- ]facing)\b/i,
    /\b(?:stand|sit|step|walk)\s+(?:in|into)\s+(?:the\s+)?frame\b/i,
    /\b(?:show|include|capture)\s+(?:yourself|the\s+creator|a\s+person)\s+(?:in|on)\s+(?:the\s+)?(?:frame|screen|camera)\b/i,
    /\b(?:your|the creator's)\s+(?:face|head|body|torso)\s+(?:in|on)\s+(?:the\s+)?frame\b/i
  ];

  plan.concept.shots.forEach((shot, index) => {
    const visualDirections = [
      shot.title,
      shot.setupInstruction,
      shot.aimInstruction,
      shot.actionName,
      shot.actionInstruction,
      shot.recordInstruction
    ].join(' ');

    if (
      forbiddenPatterns.some(pattern =>
        pattern.test(visualDirections)
      )
    ) {
      violations.push(
        `Shot ${index + 1} contains person-dependent filming directions.`
      );
    }
  });

  return violations;
}

function parsePlan(outputText: string): FilmingPlan {
  const result = JSON.parse(outputText) as FilmingPlan;

  if (
    !result?.concept ||
    !Array.isArray(result.concept.shots) ||
    result.concept.shots.length !== 6
  ) {
    throw new Error('Invalid six-shot filming plan.');
  }

  return result;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const name = body.name?.trim();
    const sellingPoint = body.sellingPoint?.trim() || '';
    const goal = body.goal?.trim() || 'Product Showcase';
    const personInVideo = getPersonSetting(body.personInVideo);

    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required.' },
        { status: 400 }
      );
    }

    const images = Array.isArray(body.images)
      ? body.images.filter(
          (item): item is string =>
            typeof item === 'string' &&
            item.startsWith('data:image/')
        )
      : [];

    // Compatibility with the older single-image frontend.
    if (
      images.length === 0 &&
      typeof body.image === 'string' &&
      body.image.startsWith('data:image/')
    ) {
      images.push(body.image);
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Please upload at least one product photo.' },
        { status: 400 }
      );
    }

    if (images.length > 4) {
      return NextResponse.json(
        { error: 'You can upload up to 4 product photos.' },
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

    const userText = `
PRODUCT NAME:
${name}

MAIN SELLING POINT:
${sellingPoint || 'Not provided'}

SELECTED VIDEO GOAL:
${goal}

PERSON IN VIDEO:
${personInVideo === 'without_person'
  ? 'WITHOUT PERSON'
  : 'WITH PERSON'}

The uploaded photos show the actual physical product.

All photos show the SAME product from different views.

Photo 1 is the MAIN PHOTO.

Analyze all photos together before planning the shots.

Create ONE concept containing EXACTLY SIX shots.

IMPORTANT:
The person setting is a HARD CONSTRAINT for every shot.

${personInVideo === 'without_person'
  ? `
WITHOUT PERSON IS SELECTED.

Do not show a visible creator, face or body.
Do not create talking-to-camera shots.
Do not aim the phone at the creator.
Do not use facial expressions or creator-facing actions.
Hands-only and POV footage are allowed when useful.
Any spoken line must be OFF-CAMERA VOICEOVER.
This restriction overrides UGC and Problem → Solution.
`
  : `
WITH PERSON IS SELECTED.

A visible creator is allowed when useful.
Do not force a person into every shot.
`}

Every action must be physically possible.

Never mime imaginary objects.

Do not invent props, features, claims or results.

Do not require editing tricks.
`;

    const content: any[] = [
      {
        type: 'input_text',
        text: userText
      }
    ];

    for (let index = 0; index < images.length; index++) {
      content.push({
        type: 'input_text',
        text:
          index === 0
            ? 'MAIN PRODUCT PHOTO:'
            : `ADDITIONAL PRODUCT PHOTO ${index + 1}:`
      });

      content.push({
        type: 'input_image',
        image_url: images[index]
      });
    }

    async function requestPlan(
      inputContent: any[]
    ): Promise<FilmingPlan> {
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
                content: inputContent
              }
            ],

            max_output_tokens: 10000,

            text: {
              format: {
                type: 'json_schema',
                name: 'shootai_filming_plan',
                strict: true,
                schema: filmingPlanSchema
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

        throw new Error(
          data?.error?.message ||
          'ShootAI could not generate the filming plan.'
        );
      }

      const outputText = extractOutputText(data);

      if (!outputText) {
        console.error(
          'ShootAI empty response:',
          JSON.stringify(data)
        );

        throw new Error(
          'ShootAI received an empty response.'
        );
      }

      return parsePlan(outputText);
    }

    let result = await requestPlan(content);

    // Validate WITHOUT PERSON plans before returning them.
    // If a violation is found, ask the AI to regenerate the
    // plan using the same product photos and stricter feedback.
    if (personInVideo === 'without_person') {
      let violations = getPersonViolations(result);

      if (violations.length > 0) {
        console.warn(
          'ShootAI person constraint violations:',
          violations
        );

        const correctionContent = [
          ...content,
          {
            type: 'input_text',
            text: `
The previous plan violated WITHOUT PERSON.

Previous plan:
${JSON.stringify(result)}

Detected problems:
${violations.join('\n')}

Regenerate the ENTIRE six-shot plan.

WITHOUT PERSON is mandatory.

No talking to camera.
No creator-facing shots.
No visible face or body.
No facial expressions.
No instructions to aim the phone at the creator.

Use real product-only footage or appropriate hands/POV shots.

If speech is useful, it must be off-camera voiceover.

Keep the actual product and selected video goal.

Return the corrected structured JSON only.
`
          }
        ];

        result = await requestPlan(correctionContent);
        violations = getPersonViolations(result);

        if (violations.length > 0) {
          console.error(
            'ShootAI correction still violated person setting:',
            violations
          );

          return NextResponse.json(
            {
              error:
                'ShootAI could not create a plan that follows Without Person. Please try generating again.'
            },
            { status: 422 }
          );
        }
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Generate route error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong while generating your filming plan.'
      },
      { status: 500 }
    );
  }
}
