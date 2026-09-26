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
Do not repeat any of the detected violations.
For WITHOUT PERSON, describe only the actual scene and phone/product movements; use TEXT: or optional VOICEOVER: for narration.

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
