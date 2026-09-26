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
    /\btalk(?:ing)?\s+to\s+(?:the\s+)?camera\b/i,
    /\bspeak(?:ing)?\s+to\s+(?:the\s+)?camera\b/i,
    /\blook\s+(?:directly\s+)?(?:at|into)\s+(?:the\s+)?camera\b/i,
    /\bface\s+(?:the\s+)?camera\b/i,
    /\b(?:show|film|record|frame|capture)\s+(?:your|the)\s+(?:face|head|body|torso)\b/i,
    /\b(?:point|aim|turn)\s+(?:the\s+)?(?:phone|camera)\s+(?:at|toward|towards)\s+(?:yourself|the\s+creator|your\s+face)\b/i,
    /\b(?:smile|frown|nod|react)\s+(?:at|to|into|for)\s+(?:the\s+)?camera\b/i,
    /\b(?:facial\s+expression|talking[- ]head|creator[- ]facing)\b/i,
    /\b(?:stand|sit|step|walk)\s+(?:in|into)\s+(?:the\s+)?frame\b/i,
    /\b(?:frustrated|friendly|happy|sad|surprised|excited|confused|serious)\s+(?:facial\s+)?expression\b/i,
    /\b(?:use|make|show|give|with)\s+(?:a\s+)?(?:mildly\s+)?(?:frustrated|friendly|happy|sad|surprised|excited|confused|serious)\s+expression\b/i,
    /\b(?:gesture|mouth\s+the\s+words|lip[- ]sync|talking[- ]head|talk\s+to\s+camera)\b/i,
    /\b(?:say|speak|deliver|read)\s+(?:the\s+)?(?:line|words|script|hook)\s+(?:clearly|aloud|out\s+loud|on\s+camera|while\s+filming)\b/i,
    /\b(?:say|speak|talk)\s+(?:while|as)\s+(?:you\s+)?(?:film|record|look)\b/i,
    /\b(?:film|record|capture|show)\s+(?:yourself|the\s+creator|a\s+person|someone\s+speaking)\b/i,
    /\b(?:look|stare|gaze)\s+(?:straight|directly)\s+(?:at|into)\s+(?:the\s+)?(?:phone|lens|camera)\b/i,
    /\b(?:on[- ]camera\s+(?:dialogue|speaking|delivery)|creator\s+reaction)\b/i
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

    if (personInVideo === 'without_person') {
      const script = (shot.say || '').trim();
      const scriptLines = script.split(/\n+/).map(line => line.trim()).filter(Boolean);
      const invalidScript = scriptLines.some(line =>
        !/^(TEXT|VOICEOVER)\s*:/i.test(line)
      );
      if (invalidScript || forbiddenPersonPatterns.some(pattern => pattern.test(script))) {
        violations.push(
          `Shot ${index + 1}: Script must use TEXT: or optional off-camera VOICEOVER: only.`
        );
      }
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
