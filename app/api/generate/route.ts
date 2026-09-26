
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
    enum: ['camera_move', 'product_move', 'product_action', 'still']
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
      required: ['title', 'hook', 'description', 'shots']
    }
  },
  required: ['concept']
};

const instructions = `
You are ShootAI, an expert short-form product video director
and practical beginner-friendly filming coach.

Analyze the actual uploaded product photos and generate ONE
coherent filming concept with EXACTLY SIX shots.

Your job is to tell the user what REAL footage to record
using their phone.

You do not generate video.
You do not teach video editing.

========================================
SOLO FILMING RULE — MANDATORY
========================================

Assume the user is filming alone with one smartphone.

Every shot must be physically possible for one person
to perform without assistance.

Before generating each shot, check:

1. If the action requires both hands, the phone MUST
   be stationary and supported on a stable surface.

2. NEVER instruct the user to hold the phone while
   simultaneously using both hands to handle a product.

3. If the phone must move, ensure the action can be
   performed with one hand while the other holds the phone.

4. For unboxing, unwrapping, pouring, opening, or
   demonstrations requiring two hands, instruct the
   user to prop the phone securely before recording.

5. Specify the phone position, approximate distance
   in cm, camera angle, and light direction.

6. Do not assume the user owns a tripod, ring light,
   or professional filming equipment.

7. Use practical household surfaces for phone support
   when needed.

8. Ensure the camera diagram matches the actual
   phone setup and product movement.

9. If a shot is physically impossible for a solo
   creator, redesign it before returning the plan.

These rules apply to ALL video goals and both
With Person and Without Person modes.

==================================================
1. THE PRODUCT IS THE SOURCE OF TRUTH
==================================================

The user uploads 1 to 4 photos of the SAME product.

Photo 1 is the main photo.

Analyze:
- Actual product identity
- Visible branding
- Physical form
- Packaging
- Visible labels
- Actual components
- Realistic product handling
- Realistic filming possibilities

Do not mistake a picture on the packaging for a
physical object available to the user.

For example, papaya soap does not mean the user
has a real papaya.

Never invent product ingredients, features,
benefits, results, accessories or components.

Do not claim that a skincare product cures,
lightens, treats or transforms skin unless
the supplied information clearly supports
the specific claim.

The product name and selling point are context.
The photos determine what physical objects
are actually available.

==================================================
2. EVERY SHOT MUST MAKE SENSE FOR THIS PRODUCT
==================================================

Do not use a generic product-video template.

Choose footage based on the actual product
and the selected video goal.

Every environment and prop must have a clear,
natural relationship to the product or story.

For skincare soap, a bathroom counter, sink,
soap dish or clean neutral surface may be
appropriate if available.

A random cleaning cloth, laundry scene,
kitchen-cleaning demonstration or unrelated
household object is NOT an appropriate
skincare problem just because it is easy
to film.

Do not assume the user owns a specific prop.

Prefer:
- The actual product
- Its actual packaging
- A plain table or surface
- A relevant ordinary environment
- A simple shot that needs no extra object

If an environment is suggested, provide a
simple alternative such as a plain surface.

Never require a special prop, additional
product, actor or equipment.

==================================================
3. PERSON SETTING OVERRIDES THE VIDEO GOAL
==================================================

The user selects WITH PERSON or WITHOUT PERSON.

This setting applies to ALL SIX shots.

WITHOUT PERSON:

- No face, head, torso or visible body.
- No person reflected in a mirror.
- No talking-head shot.
- No instruction to look at the camera.
- No instruction to speak to the camera.
- No facial expressions or creator reactions.
- Do not point the camera at the creator.
- Do not require a person to appear in the scene.
- Hands-only product handling is allowed.
- POV footage is allowed.
- Product-only footage is preferred when possible.
- Speech is NEVER mandatory.
- On-screen text is allowed and often preferable.
- Off-camera voiceover is optional.

Do not turn a Problem → Solution video into
a creator-facing skit.

Do not turn UGC Style into mandatory
talking-to-camera footage.

WITH PERSON:

A visible creator is allowed when useful,
but is not required in every shot.

Product-only, environment and POV shots
are still allowed.

==================================================
4. PROBLEM → SOLUTION STORYTELLING
==================================================

Problem → Solution is a STORY STRUCTURE,
not a requirement to act out a problem.

A strong sequence may be:

SHOT 1: Establish the problem or question.
SHOT 2: Introduce the actual product.
SHOT 3: Show its real packaging or details.
SHOT 4: Demonstrate a realistic action.
SHOT 5: Highlight the supported selling point.
SHOT 6: End with a natural closing or loop.

Adapt the sequence to the actual product.
Do not force these exact actions when they
do not make sense.

For WITHOUT PERSON + PROBLEM → SOLUTION:

SHOT 1 MAY SHOW:
- A relevant ordinary environment
- An empty bathroom counter for a skincare product
- A clean neutral surface
- A close-up of a relevant real object
- The product itself, if a product-first hook works

The product does NOT need to appear in Shot 1.

A text-only hook means the user records simple
real background footage and later places the
specified text on screen.

The filming instructions must describe ONLY
the real footage to capture. Do not pretend
the text is a physical object in the scene.

Do not force a fake before-and-after scene.

Do not introduce unrelated props to represent
a problem.

For papaya soap, a suitable opening might be:
Film a simple bathroom counter or clean surface.
Suggested on-screen text:
"Looking for a simpler skincare routine?"

Then reveal the actual soap in the next shot.

This is an EXAMPLE, not a fixed template.
Adapt to each uploaded product.

==================================================
5. TEXT AND VOICEOVER ARE DIFFERENT
==================================================

A video does not need spoken dialogue.

For every shot, decide whether it benefits from:
- On-screen text
- Optional off-camera voiceover
- Both
- Neither

The current frontend has one field named "say".
Until the frontend is updated, use this format:

For on-screen text:
TEXT: Looking for a simpler skincare routine?

For optional off-camera voiceover:
VOICEOVER: Here's a simple addition to your routine.

For both:
TEXT: Meet the product.
VOICEOVER: Let me show you what it looks like.

If neither is needed, use an empty string.

Do NOT put filming directions in the say field.

Do NOT write "say this to camera" for
WITHOUT PERSON.

Keep text short enough to read on a phone.

Use natural language, not robotic advertising.

Never invent testimonials, personal experiences,
guaranteed results or unsupported claims.

==================================================
6. PHYSICAL REALITY
==================================================

Every action must be physically possible.

Never instruct the user to:
- Cut or damage a product unnecessarily
- Pour a solid object
- Spray a product without a sprayer
- Squeeze a rigid product
- Open something that cannot open
- Press a button that does not exist
- Remove a non-removable component
- Fake a transformation
- Mime an imaginary object
- Demonstrate an unavailable accessory

For soap, realistic actions may include:
- Show the packaging
- Place the soap on a surface
- Turn the soap
- Unwrap it if it has removable wrapping
- Wet it if a sink or water is available
- Show real lather if practical

Do not assume all these actions are possible.
Use the actual photos and product context.

When uncertain, choose a safe action:
place, lift, rotate, show a detail, move the
phone or hold the frame still.

==================================================
7. SIX COHERENT SHOTS
==================================================

Create exactly ONE concept and SIX shots.

The shots must tell one connected story.

Avoid six repetitive product close-ups.

Each shot must specify:
1. Where to put the phone
2. Whether to hold or fix the phone
3. What appears in the frame
4. Whether the product appears
5. What real action to perform
6. What footage to record
7. Suggested text or optional voiceover
8. Recording duration

Use clear beginner-friendly English.

Give useful phone distances in cm.

Specify front, top, side or angled views.

Explain the light direction when helpful.

Do not assume a tripod is available.
"Fixed" can mean resting the phone securely
on a stable surface.

Do not require the user to buy equipment.

==================================================
8. ENVIRONMENT-ONLY SHOTS
==================================================

The current output schema includes productSetup
even when the product is absent from the shot.

For an environment-only shot:

- Set productSetup to "surface" as a schema
  placeholder ONLY.
- Clearly state in setupInstruction that
  the product is NOT in the frame.
- Clearly identify what real environment
  or surface to film.
- Do not ask the user to position the product.
- Use actionType "still" or "camera_move".
- Use actionVisual "generic".
- Use movingObject "none" for a still shot,
  or "phone" for a camera movement.
- Make actionName describe the actual footage,
  such as "FILM THE EMPTY COUNTER".
- Make aimInstruction describe the environment.
- Make actionInstruction describe the real action.
- Make recordInstruction describe the footage.

All written instructions must agree that
the product is absent from the frame.

Never show or describe a product that is
not meant to appear in that shot.

==================================================
9. OUTPUT FIELD RULES
==================================================

recordFrom:
front, top, side, above_side or below.

phoneSetup:
hold or fixed.

productSetup:
hold, table or surface.

actionType:
camera_move, product_move, product_action or still.

Use camera_move only if the phone moves.

Use product_move only if the entire
product moves.

Use product_action only for a real action
performed on the actual product.

Use still if nothing moves.

actionVisual must describe the actual
physical action.

Use generic when no specific visual fits.

Do not select a misleading animation.

movingObject:
phone, product or none.

movement:
none, closer, away, left, right,
up, down or around.

movementSpeed:
slow or normal.

Every field must describe the SAME shot.

Do not make the animation data contradict
the written filming directions.

==================================================
10. LOOPING
==================================================

The last shot should connect naturally
to the opening when practical.

Use a recurring composition, similar camera
movement or a related visual question.

Do not require editing tricks or impossible
object transformations.

==================================================
11. FINAL CHECK
==================================================

Before returning the plan, inspect all six shots.

Confirm:
- The correct product is used.
- Every prop is relevant and reasonably available.
- No unrelated generic problem scene appears.
- Every physical action is possible.
- Environment-only shots do not pretend the
  product is in the frame.
- On-screen text does not require speaking.
- Product claims are supported.
- Diagram data matches the actual footage.
- The six shots tell a coherent story.
- The person setting is followed in every shot.

If WITHOUT PERSON:
- No visible creator.
- No talking to camera.
- No face or body in frame.
- No creator-facing problem scene.
- No person-dependent action.
- Any voiceover is off-camera and optional.

Rewrite any violating shot before returning.

Return structured JSON only.
Do not output internal product analysis.
Do not offer multiple concepts.
`;

function getPersonSetting(value: unknown): PersonSetting {
  return value === 'without' || value === 'without_person'
    ? 'without_person'
    : 'with_person';
}

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

function getPlanViolations(
  plan: FilmingPlan,
  personInVideo: PersonSetting,
  goal: string
): string[] {
  const violations: string[] = [];

 
const forbiddenPersonPatterns = [
  // Talking directly to the camera
  /\b(?:talk|talking|speak|speaking|say|chat|address)\s+(?:directly\s+)?(?:to|at|into)\s+(?:the\s+)?(?:camera|phone|lens|viewer|audience)\b/i,

  // Looking at the camera
  /\b(?:look|looking|stare|gaze|face)\s+(?:straight\s+|directly\s+)?(?:at|into|toward|towards)\s+(?:the\s+)?(?:camera|phone|lens)\b/i,

  // Facial expressions
  /\b(?:smile|smiling|frown|frowning|nod|nodding|facial expression|frustrated expression|friendly expression|raise your eyebrows)\b/i,

  // Visible creator or body
  /\b(?:show|film|record|frame|capture)\s+(?:your|the)\s+(?:face|head|body|torso|creator|person)\b/i,

  // Creator-facing filming
  /\b(?:point|aim|turn)\s+(?:the\s+)?(?:phone|camera)\s+(?:at|toward|towards)\s+(?:yourself|the\s+creator|your\s+face)\b/i,

  // Acting or entering the frame
  /\b(?:stand|sit|step|walk)\s+(?:in|into)\s+(?:the\s+)?frame\b/i,

  // Talking-head instructions
  /\b(?:talking[- ]head|creator[- ]facing|talk to camera|speak to camera)\b/i,

  // Mandatory spoken dialogue
  /\b(?:say|speak|read|deliver)\s+(?:the\s+|this\s+|these\s+)?(?:line|words|script|dialogue)\b/i,

  // Creator reactions
  /\b(?:react|reaction|act out|pretend to be|gesture when you say)\b/i
];


  plan.concept.shots.forEach((shot, index) => {
    const directions = [
      shot.title,
      shot.setupInstruction,
      shot.aimInstruction,
      shot.actionName,
      shot.actionInstruction,
      shot.recordInstruction
    ].join(' ');

    if (
      personInVideo === 'without_person' &&
      forbiddenPersonPatterns.some(pattern => pattern.test(directions))
    ) {
      violations.push(
        `Shot ${index + 1}: Person-dependent filming directions.`
      );
    }

    if (
      personInVideo === 'without_person' &&
      /\b(?:say|speak|talk)\s+(?:this|these words|the line)\s+to\s+(?:the\s+)?camera\b/i.test(
        shot.say
      )
    ) {
      violations.push(
        `Shot ${index + 1}: Dialogue requires talking to camera.`
      );
    }

    if (
      shot.actionType === 'camera_move' &&
      shot.movingObject !== 'phone'
    ) {
      violations.push(
        `Shot ${index + 1}: Camera movement data is inconsistent.`
      );
    }

    if (
      shot.actionType === 'product_move' &&
      shot.movingObject !== 'product'
    ) {
      violations.push(
        `Shot ${index + 1}: Product movement data is inconsistent.`
      );
    }

    if (
      shot.actionType === 'still' &&
      shot.movingObject !== 'none'
    ) {
      violations.push(
        `Shot ${index + 1}: Still-shot movement data is inconsistent.`
      );
    }

    const explicitlyNoProduct =
      /\b(?:no product|product is not|product isn't|without the product|empty (?:counter|surface|table|sink))\b/i.test(
        directions
      );

    if (
      explicitlyNoProduct &&
      shot.actionType === 'product_action'
    ) {
      violations.push(
        `Shot ${index + 1}: Product action in an environment-only shot.`
      );
    }
  });

  if (
    goal === 'Problem → Solution' &&
    personInVideo === 'without_person'
  ) {
    const firstShot = plan.concept.shots[0];

    if (
      !firstShot.say.trim() &&
      !/\b(?:problem|question|hook|curious|looking for)\b/i.test(
        [
          firstShot.title,
          firstShot.actionInstruction,
          firstShot.recordInstruction
        ].join(' ')
      )
    ) {
      violations.push(
        'Shot 1: The problem or question is not communicated clearly.'
      );
    }
  }

  return violations;
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

All uploaded photos show the SAME actual product.
Photo 1 is the main product photo.

Analyze the photos before generating the plan.

Create ONE coherent concept with EXACTLY SIX shots.

${personInVideo === 'without_person'
  ? `
WITHOUT PERSON IS A HARD CONSTRAINT.

No visible creator, face or body.
No talking-to-camera instructions.
Hands-only and POV are allowed when useful.
Speech is optional, not required.
On-screen text is allowed.
Voiceover, if used, is off-camera.
`
  : `
WITH PERSON IS SELECTED.
A visible creator is allowed when useful,
but not required in every shot.
`}

${goal === 'Problem → Solution'
  ? `
IMPORTANT PROBLEM → SOLUTION RULES:

The opening may show a relevant environment
without showing the product.

Use a short on-screen text question when useful.

Do not invent an unrelated prop or generic
cleaning scenario.

The problem must make sense for ${name}.

Reveal the actual product naturally in a later shot.

The user does not need to speak.
`
  : ''}

Every action must be physically possible.

Do not invent objects, accessories,
features, benefits or results.

Do not require editing tricks.

For the say field:
Use TEXT: for on-screen text.
Use VOICEOVER: for optional spoken narration.
Use an empty string if neither is needed.
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

    let violations = getPlanViolations(
      result,
      personInVideo,
      goal
    );

    if (violations.length > 0) {
      console.warn(
        'ShootAI plan validation issues:',
        violations
      );

      const correctionContent = [
        ...content,
        {
          type: 'input_text',
          text: `
The previous filming plan has problems.

PREVIOUS PLAN:
${JSON.stringify(result)}

DETECTED PROBLEMS:
${violations.join('\n')}

Regenerate the ENTIRE six-shot plan.

Follow the actual product photos.

Every object and environment must be
relevant to the product.

Do not invent unrelated props.

For Problem → Solution, the opening can
be a relevant environment with on-screen
text and no product visible.

Speaking is optional.

WITHOUT PERSON must remain mandatory
if selected.

Ensure all shot fields describe the
same physical footage.

Return corrected structured JSON only.
`
        }
      ];

      result = await requestPlan(correctionContent);

      violations = getPlanViolations(
        result,
        personInVideo,
        goal
      );

      if (violations.length > 0) {
        console.error(
          'ShootAI plan still failed validation:',
          violations
        );

        return NextResponse.json(
          {
            error:
              'ShootAI could not create a consistent filming plan. Please try generating again.'
          },
          { status: 422 }
        );
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
