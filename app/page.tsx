'use client';

import { useState } from 'react';

type ActionType =
  | 'camera_move'
  | 'product_move'
  | 'product_action'
  | 'still';

type ActionVisual =
  | 'unwrap'
  | 'open'
  | 'close'
  | 'pour'
  | 'squeeze'
  | 'press'
  | 'spray'
  | 'twist'
  | 'rotate'
  | 'flip'
  | 'shake'
  | 'pull'
  | 'push'
  | 'slide'
  | 'lift'
  | 'remove'
  | 'place'
  | 'pick_up'
  | 'tap'
  | 'wipe'
  | 'apply'
  | 'generic';

type Shot = {
  title: string;
  duration: string;

  recordFrom:
    | 'front'
    | 'top'
    | 'side'
    | 'above_side'
    | 'below';

  phoneSetup: 'hold' | 'fixed';

  productSetup:
    | 'hold'
    | 'table'
    | 'surface';

  setupInstruction: string;
  aimInstruction: string;

  actionType: ActionType;
  actionName: string;
  actionVisual: ActionVisual;

  movingObject:
    | 'phone'
    | 'product'
    | 'none';

  movement:
    | 'none'
    | 'closer'
    | 'away'
    | 'left'
    | 'right'
    | 'up'
    | 'down'
    | 'around';

  movementSpeed:
    | 'slow'
    | 'normal';

  actionInstruction: string;
  recordInstruction: string;
  say: string;
};

type Concept = {
  title: string;
  hook: string;
  description: string;
  shots: Shot[];
};

const goals = [
  'Viral / Attention',
  'Sell My Product',
  'UGC Style',
  'Product Showcase',
  'Problem → Solution'
];

const directionInfo = {
  front: {
    title: 'RECORD FROM THE FRONT',
    short: 'FRONT'
  },

  top: {
    title: 'RECORD FROM THE TOP',
    short: 'TOP'
  },

  side: {
    title: 'RECORD FROM THE SIDE',
    short: 'SIDE'
  },

  above_side: {
    title: 'RECORD FROM ABOVE + SIDE',
    short: 'ABOVE + SIDE'
  },

  below: {
    title: 'RECORD FROM BELOW',
    short: 'BELOW'
  }
};

function DirectionDiagram({ shot }: { shot: Shot }) {
  const direction =
    directionInfo[shot.recordFrom] ||
    directionInfo.front;

  return (
    <div
      className={`new-director-diagram direction-${shot.recordFrom}`}
    >
      <div className="diagram-question">
        WHERE DO I RECORD FROM?
      </div>

      <h3>{direction.title}</h3>

      <div className="direction-stage">
        <div className="direction-phone">
          <div className="direction-camera-dot" />
          <span>PHONE</span>
        </div>

        <div className="camera-path">
          <span className="path-line" />
          <span className="path-arrow">›</span>
        </div>

        <div className="direction-product">
          <span>PRODUCT</span>
        </div>
      </div>

      <div className="direction-answer">
        <span>YOUR CAMERA</span>
        <strong>{direction.short}</strong>
      </div>
    </div>
  );
}

function SetupGuide({ shot }: { shot: Shot }) {
  const phoneText =
    shot.phoneSetup === 'hold'
      ? 'HOLD YOUR PHONE'
      : 'KEEP PHONE FIXED';

  const productText =
    shot.productSetup === 'hold'
      ? 'HOLD THE PRODUCT'
      : shot.productSetup === 'table'
      ? 'PUT PRODUCT ON TABLE'
      : 'PUT PRODUCT ON A SURFACE';

  return (
    <div className="director-step-card">
      <div className="step-number">2</div>

      <div className="step-content">
        <small>SET UP</small>

        <h3>{phoneText}</h3>

        <div className="setup-choices">
          <div>
            <span>PHONE</span>

            <strong>
              {shot.phoneSetup === 'hold'
                ? 'HOLD IT'
                : 'KEEP IT FIXED'}
            </strong>
          </div>

          <div>
            <span>PRODUCT</span>
            <strong>{productText}</strong>
          </div>
        </div>

        <p>{shot.setupInstruction}</p>
      </div>
    </div>
  );
}

function CameraMovementVisual({
  shot
}: {
  shot: Shot;
}) {
  const movementClass =
    `move-${shot.movement}`;

  return (
    <div
      className={`movement-stage movement-${shot.movement}`}
    >
      <div
        className={`mini-phone moving-object ${movementClass}`}
      >
        <div className="mini-camera-dot" />
        <span>PHONE</span>
      </div>

      <div className="movement-dots">
        <i />
        <i />
        <i />
        <b>›</b>
      </div>

      <div className="mini-product">
        PRODUCT
      </div>
    </div>
  );
}

function ProductMovementVisual({
  shot
}: {
  shot: Shot;
}) {
  const movementClass =
    `move-${shot.movement}`;

  return (
    <div
      className={`movement-stage movement-${shot.movement}`}
    >
      <div className="mini-phone">
        <div className="mini-camera-dot" />
        <span>PHONE</span>
      </div>

      <div className="movement-dots">
        <i />
        <i />
        <i />
        <b>›</b>
      </div>

      <div
        className={`mini-product moving-object ${movementClass}`}
      >
        PRODUCT
      </div>
    </div>
  );
}

function ProductActionVisual({
  shot
}: {
  shot: Shot;
}) {
  const action = shot.actionVisual;

  if (action === 'unwrap') {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="unwrap-demo">
          <div className="soap-core">
            SOAP
          </div>

          <div className="soap-wrapper">
            WRAPPER
          </div>

          <div className="action-arrow">
            →
          </div>
        </div>

        <div className="action-caption">
          SLIDE WRAPPER OFF
        </div>
      </div>
    );
  }

  if (
    action === 'open' ||
    action === 'remove'
  ) {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="open-demo">
          <div className="action-bottle">
            <div className="action-cap" />
            <span>PRODUCT</span>
          </div>

          <div className="up-action-arrow">
            ↑
          </div>
        </div>

        <div className="action-caption">
          {action === 'open'
            ? 'OPEN IT'
            : 'REMOVE IT'}
        </div>
      </div>
    );
  }

  if (action === 'twist') {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="twist-demo">
          <div className="twist-arrow">
            ↻
          </div>

          <div className="action-bottle">
            <div className="action-cap" />
            <span>PRODUCT</span>
          </div>
        </div>

        <div className="action-caption">
          TWIST IT
        </div>
      </div>
    );
  }

  if (action === 'rotate') {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="rotate-demo">
          <div className="rotate-arrow">
            ↻
          </div>

          <div className="rotate-product">
            PRODUCT
          </div>
        </div>

        <div className="action-caption">
          TURN THE PRODUCT
        </div>
      </div>
    );
  }

  if (action === 'pour') {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="pour-demo">
          <div className="pour-product">
            PRODUCT
          </div>

          <div className="pour-stream" />

          <div className="pour-cup">
            CUP
          </div>
        </div>

        <div className="action-caption">
          POUR IT
        </div>
      </div>
    );
  }

  if (action === 'squeeze') {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="squeeze-demo">
          <span className="squeeze-left">
            →
          </span>

          <div className="squeeze-product">
            PRODUCT
          </div>

          <span className="squeeze-right">
            ←
          </span>
        </div>

        <div className="action-caption">
          SQUEEZE IT
        </div>
      </div>
    );
  }

  if (
    action === 'press' ||
    action === 'tap'
  ) {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="press-demo">
          <div className="press-arrow">
            ↓
          </div>

          <div className="press-product">
            PRODUCT
          </div>
        </div>

        <div className="action-caption">
          {action === 'tap'
            ? 'TAP IT'
            : 'PRESS IT'}
        </div>
      </div>
    );
  }

  if (
    action === 'lift' ||
    action === 'pick_up'
  ) {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="lift-demo">
          <div className="lift-product">
            PRODUCT
          </div>

          <div className="lift-arrow">
            ↑
          </div>

          <div className="surface-line" />
        </div>

        <div className="action-caption">
          LIFT IT UP
        </div>
      </div>
    );
  }

  if (action === 'place') {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="place-demo">
          <div className="place-product">
            PRODUCT
          </div>

          <div className="place-arrow">
            ↓
          </div>

          <div className="surface-line" />
        </div>

        <div className="action-caption">
          PUT IT DOWN
        </div>
      </div>
    );
  }

  if (
    action === 'slide' ||
    action === 'pull' ||
    action === 'push'
  ) {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="slide-demo">
          <div className="slide-product">
            PRODUCT
          </div>

          <div className="slide-arrow">
            →
          </div>
        </div>

        <div className="action-caption">
          {action === 'pull'
            ? 'PULL IT'
            : action === 'push'
            ? 'PUSH IT'
            : 'SLIDE IT'}
        </div>
      </div>
    );
  }

  if (action === 'shake') {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="shake-demo">
          <span>←</span>

          <div className="shake-product">
            PRODUCT
          </div>

          <span>→</span>
        </div>

        <div className="action-caption">
          SHAKE IT
        </div>
      </div>
    );
  }

  if (action === 'flip') {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="flip-demo">
          <div className="flip-arrow">
            ↻
          </div>

          <div className="flip-product">
            PRODUCT
          </div>
        </div>

        <div className="action-caption">
          FLIP IT
        </div>
      </div>
    );
  }

  if (action === 'spray') {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE PRODUCT
        </div>

        <div className="spray-demo">
          <div className="spray-product">
            PRODUCT
          </div>

          <div className="spray-cloud">
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="action-caption">
          SPRAY IT
        </div>
      </div>
    );
  }

  if (
    action === 'wipe' ||
    action === 'apply'
  ) {
    return (
      <div className="action-stage">
        <div className="action-label">
          WATCH THE ACTION
        </div>

        <div className="apply-demo">
          <div className="apply-product">
            PRODUCT
          </div>

          <div className="apply-arrow">
            →
          </div>

          <div className="apply-target">
            AREA
          </div>
        </div>

        <div className="action-caption">
          {action === 'wipe'
            ? 'WIPE ACROSS'
            : 'APPLY IT'}
        </div>
      </div>
    );
  }

  return (
    <div className="action-stage">
      <div className="action-label">
        DO THIS
      </div>

      <div className="generic-action">
        <div className="generic-product">
          PRODUCT
        </div>

        <div className="generic-arrow">
          →
        </div>
      </div>

      <div className="action-caption">
        {shot.actionName}
      </div>
    </div>
  );
}

function StillVisual() {
  return (
    <div className="action-stage">
      <div className="action-label">
        WHILE RECORDING
      </div>

      <div className="still-demo">
        <div className="still-phone">
          PHONE
        </div>

        <div className="still-lines">
          · · ·
        </div>

        <div className="still-product">
          PRODUCT
        </div>
      </div>

      <div className="action-caption still-caption">
        KEEP EVERYTHING STILL
      </div>
    </div>
  );
}

type TeachingMode =
  | 'talking'
  | 'pov'
  | 'problem'
  | 'demonstration'
  | 'product_action'
  | 'camera_move'
  | 'product_move'
  | 'still';

function getTeachingMode(shot: Shot, goal: string): TeachingMode {
  const words = [shot.title, shot.actionName, shot.actionInstruction, shot.setupInstruction, shot.aimInstruction, shot.recordInstruction].join(' ').toLowerCase();

  if (goal === 'UGC Style' && (words.includes('talk to camera') || words.includes('speak to camera') || words.includes('look into the camera') || words.includes('look at the camera') || words.includes('your face') || words.includes('face and'))) return 'talking';
  if (words.includes('pov') || words.includes('point of view') || words.includes('your view')) return 'pov';
  if (goal === 'Problem → Solution' && (words.includes('problem') || words.includes('before'))) return 'problem';
  if (goal === 'UGC Style' && (words.includes('use the product') || words.includes('demonstrate') || words.includes('try it') || words.includes('show how') || words.includes('using the product'))) return 'demonstration';
  if (shot.actionType === 'camera_move') return 'camera_move';
  if (shot.actionType === 'product_move') return 'product_move';
  if (shot.actionType === 'product_action') return 'product_action';
  return 'still';
}

function AdaptiveTeachingVisual({ shot, goal }: { shot: Shot; goal: string }) {
  const mode = getTeachingMode(shot, goal);

  if (mode === 'talking') return (
    <div className="teaching-stage talking-stage">
      <div className="teaching-label">HOW TO FILM THIS</div>
      <div className="talking-layout">
        <div className="teaching-phone">PHONE</div><div className="teaching-arrow">→</div>
        <div className="creator-frame"><div className="creator-head" /><div className="creator-body">YOU</div><div className="creator-product">PRODUCT</div></div>
      </div>
      <div className="teaching-caption">LOOK AT THE CAMERA</div>
      <div className="teaching-tip">Keep yourself and the product visible while you speak.</div>
    </div>
  );

  if (mode === 'pov') return (
    <div className="teaching-stage pov-stage">
      <div className="teaching-label">POV SETUP</div>
      <div className="pov-layout"><div className="pov-phone">PHONE<span>↓</span></div><div className="pov-view"><strong>WHAT VIEWERS SEE</strong><div>PRODUCT</div></div></div>
      <div className="teaching-caption">FILM FROM YOUR VIEW</div>
      <div className="teaching-tip">{shot.aimInstruction}</div>
    </div>
  );

  if (mode === 'problem') return (
    <div className="teaching-stage problem-stage">
      <div className="teaching-label">SHOW THE PROBLEM CLEARLY</div>
      <div className="problem-layout"><div className="problem-box">PROBLEM</div><div className="teaching-arrow">→</div><div className="solution-box">PRODUCT</div></div>
      <div className="teaching-caption">PROBLEM FIRST</div>
      <div className="teaching-tip">Record the problem clearly before revealing the solution.</div>
    </div>
  );

  if (mode === 'demonstration') return (
    <div className="teaching-stage demo-stage">
      <div className="teaching-label">DEMONSTRATE IT</div>
      <div className="demo-layout"><div className="demo-product">PRODUCT</div><div className="teaching-arrow">→</div><div className="demo-action">USE IT</div></div>
      <div className="teaching-caption">{shot.actionName}</div>
      <div className="teaching-tip">{shot.actionInstruction}</div>
    </div>
  );

  if (mode === 'camera_move') return <CameraMovementVisual shot={shot} />;
  if (mode === 'product_move') return <ProductMovementVisual shot={shot} />;
  if (mode === 'product_action') return <ProductActionVisual shot={shot} />;
  return <StillVisual />;
}

function MovementGuide({
  shot,
  goal
}: {
  shot: Shot;
  goal: string;
}) {
  let title = shot.actionName;

  if (!title) {
    if (shot.actionType === 'camera_move') {
      title = 'MOVE YOUR PHONE';
    } else if (
      shot.actionType === 'product_move'
    ) {
      title = 'MOVE THE PRODUCT';
    } else if (shot.actionType === 'still') {
      title = 'KEEP STILL';
    } else {
      title = 'DO THIS';
    }
  }

  return (
    <div className="movement-card">
      <div className="step-number">3</div>

      <div className="step-content">
        <small>WHAT DO I DO?</small>

        <h3>{title}</h3>

        <AdaptiveTeachingVisual
          shot={shot}
          goal={goal}
        />

        <div className="action-instruction-box">
          <span>DO THIS</span>
          <strong>
            {shot.actionInstruction}
          </strong>
        </div>

        {shot.actionType !== 'still' && (
          <div className="speed-label">
            {shot.movementSpeed === 'slow'
              ? 'DO IT SLOWLY'
              : 'NORMAL SPEED'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<
    | 'home'
    | 'dashboard'
    | 'create'
    | 'director'
    | 'done'
  >('home');

  const [name, setName] = useState('');
  const [point, setPoint] = useState('');
  const [goal, setGoal] =
    useState(goals[0]);

  const [image, setImage] =
    useState<string>();

  const [concept, setConcept] =
    useState<Concept | null>(null);

  const [shot, setShot] = useState(0);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  function pickFile(f?: File) {
    if (!f) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImage(String(reader.result));
    };

    reader.readAsDataURL(f);
  }

  async function generateIdeas() {
    if (!name.trim()) {
      setError(
        'Please enter your product name.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        '/api/generate',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            name,
            sellingPoint: point,
            goal,
            image
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Could not generate filming ideas.'
        );
      }

      if (
        !data.concept ||
        !Array.isArray(data.concept.shots)
      ) {
        throw new Error(
          'ShootAI received an invalid response.'
        );
      }

      setConcept(data.concept);
      setShot(0);
      setView('director');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const nav = (
    <nav>
      <button
        className="logo"
        onClick={() => setView('home')}
      >
        Shoot<span>AI</span>
      </button>

      <button
        className="navbtn"
        onClick={() =>
          setView('dashboard')
        }
      >
        Dashboard
      </button>
    </nav>
  );

  if (view === 'home') {
    return (
      <main>
        {nav}

        <section className="hero">
          <div>
            <div className="badge">
              AI PRODUCT FILMING DIRECTOR
            </div>

            <h1>
              Don’t know how to film your
              product?
            </h1>

            <p className="lead">
              Show ShootAI what you sell.
              Get a content concept and
              exact shot-by-shot
              instructions you can follow
              with your phone.
            </p>

            <button
              className="cta"
              onClick={() =>
                setView('create')
              }
            >
              Create a filming plan →
            </button>

            <p className="tiny">
              No video generation. No
              editing. Just clear
              direction.
            </p>
          </div>

          <div className="mock">
            <div className="phone">
              <div className="frame">
                <div className="box">
                  YOUR
                  <br />
                  PRODUCT
                </div>

                <span>
                  ✓ Great framing
                </span>
              </div>

              <small>
                SHOT 1 OF 6 · HOOK
              </small>

              <b>
                Bring the product quickly
                toward the camera.
              </b>
            </div>
          </div>
        </section>

        <section className="how">
          <p>HOW IT WORKS</p>

          <h2>
            From product to shot list in
            minutes.
          </h2>

          <div className="steps">
            <article>
              <i>01</i>
              <h3>
                Show your product
              </h3>
              <span>
                Upload a photo and tell us
                the key selling point.
              </span>
            </article>

            <article>
              <i>02</i>
              <h3>AI plans your video</h3>
              <span>
                ShootAI studies your product
                and creates the filming plan
                for you.
              </span>
            </article>

            <article>
              <i>03</i>
              <h3>
                Follow the director
              </h3>
              <span>
                Film one shot at a time
                with simple visual
                directions.
              </span>
            </article>
          </div>
        </section>
      </main>
    );
  }

  if (view === 'dashboard') {
    return (
      <main>
        {nav}

        <section className="page">
          <div className="row">
            <div>
              <div className="badge">
                YOUR WORKSPACE
              </div>

              <h2>Projects</h2>
            </div>

            <button
              className="cta small"
              onClick={() =>
                setView('create')
              }
            >
              + New project
            </button>
          </div>

          <div className="empty">
            <div>◎</div>

            <h3>
              Your first product video
              starts here.
            </h3>

            <p>
              Create a project and ShootAI
              will plan every shot for
              you.
            </p>

            <button
              className="cta small"
              onClick={() =>
                setView('create')
              }
            >
              Create project →
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (view === 'create') {
    return (
      <main>
        {nav}

        <section className="page narrow">
          <button
            className="back"
            onClick={() =>
              setView('dashboard')
            }
          >
            ← Dashboard
          </button>

          <div className="badge">
            NEW PROJECT
          </div>

          <h2>
            What are you filming?
          </h2>

          <p>
            Give ShootAI enough context
            to create a useful plan.
          </p>

          <label className="upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                pickFile(
                  e.target.files?.[0]
                )
              }
            />

            {image ? (
              <img
                src={image}
                alt="Product preview"
              />
            ) : (
              <>
                <strong>＋</strong>
                <b>
                  Upload product photo
                </b>
                <span>
                  Click to choose an image
                </span>
              </>
            )}
          </label>

          <label>
            Product name

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter your product name"
            />
          </label>

          <label>
            Main selling point

            <textarea
              value={point}
              onChange={(e) =>
                setPoint(e.target.value)
              }
              placeholder="What should customers know about it?"
            />
          </label>

          <label>
            Video goal

            <div className="goalgrid">
              {goals.map((g) => (
                <button
                  type="button"
                  key={g}
                  className={
                    goal === g
                      ? 'selected'
                      : ''
                  }
                  onClick={() =>
                    setGoal(g)
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </label>

          {error && (
            <p
              style={{
                color: '#ff6b6b',
                marginTop: 12
              }}
            >
              {error}
            </p>
          )}

          <button
            className="cta full"
            onClick={generateIdeas}
            disabled={loading}
          >
            {loading
              ? 'ShootAI is planning your video...'
              : 'Generate filming plan ✦'}
          </button>
        </section>
      </main>
    );
  }

  if (view === 'director') {
    const shots =
      concept?.shots || [];

    const s = shots[shot];

    if (!s) {
      return (
        <main>
          {nav}

          <section className="page narrow">
            <h2>
              No shot available.
            </h2>

            <button
              className="cta"
              onClick={() =>
                setView('create')
              }
            >
              Back to product details
            </button>
          </section>
        </main>
      );
    }

    return (
      <main>
        {nav}

        <section className="page narrow">
          <button
            className="back"
            onClick={() =>
              setView('create')
            }
          >
            ← Product details
          </button>

          <div className="progress">
            <i
              style={{
                width: `${
                  ((shot + 1) /
                    shots.length) *
                  100
                }%`
              }}
            />
          </div>

          <div className="shotrow">
            <span>
              SHOT {shot + 1} OF{' '}
              {shots.length}
            </span>

            <span>
              {s.duration.toUpperCase()}
            </span>
          </div>

          <h2>{s.title}</h2>

          <div className="director-intro">
            Follow these steps. Don’t
            worry about camera terms.
          </div>

          <div className="director-step-card direction-step">
            <div className="step-number">
              1
            </div>

            <div className="step-content">
              <small>
                CAMERA DIRECTION
              </small>

              <DirectionDiagram
                shot={s}
              />

              <p className="aim-instruction">
                {s.aimInstruction}
              </p>
            </div>
          </div>

          <SetupGuide shot={s} />

          <MovementGuide shot={s} goal={goal} />

          <div className="record-card">
            <div className="step-number">
              4
            </div>

            <div className="step-content">
              <small>RECORD</small>

              <h3>
                RECORD FOR{' '}
                {s.duration.toUpperCase()}
              </h3>

              <div className="record-timer">
                <span className="big-record-dot" />
                <strong>
                  {s.duration}
                </strong>
              </div>

              <p>
                {s.recordInstruction}
              </p>
            </div>
          </div>

          {s.say && (
            <div className="say">
              <small>
                WHAT TO SAY
              </small>

              <strong>{s.say}</strong>
            </div>
          )}

          <button
            className="cta full"
            onClick={() =>
              shot <
              shots.length - 1
                ? setShot(shot + 1)
                : setView('done')
            }
          >
            {shot <
            shots.length - 1
              ? '✓ Done — Next shot'
              : '✓ Complete filming plan'}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main>
      {nav}

      <section className="finish">
        <div className="tick">
          ✓
        </div>

        <div className="badge">
          FILMING PLAN COMPLETE
        </div>

        <h2>
          You know exactly what to
          shoot.
        </h2>

        <p>
          Follow your six shots while
          filming, then edit the footage
          in your preferred editor.
        </p>

        <div className="donegrid">
          {(concept?.shots || []).map((s, i) => (
            <div
              key={`${s.title}-${i}`}
            >
              ✓ <span>{s.title}</span>
            </div>
          ))}
        </div>

        <button
          className="cta"
          onClick={() => {
            setName('');
            setPoint('');
            setImage(undefined);
            setConcept(null);
            setShot(0);
            setError('');
            setView('create');
          }}
        >
          Create another plan →
        </button>
      </section>
    </main>
  );
}
