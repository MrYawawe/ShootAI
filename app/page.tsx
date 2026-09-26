
'use client';

import { useState } from 'react';

type PersonSetting = 'with_person' | 'without_person';
type ActionType = 'camera_move' | 'product_move' | 'product_action' | 'still';

type Shot = {
  title: string;
  duration: string;
  recordFrom: 'front' | 'top' | 'side' | 'above_side' | 'below';
  phoneSetup: 'hold' | 'fixed';
  productSetup: 'hold' | 'table' | 'surface';
  setupInstruction: string;
  aimInstruction: string;
  actionType: ActionType;
  actionName: string;
  actionVisual: string;
  movingObject: 'phone' | 'product' | 'none';
  movement: 'none' | 'closer' | 'away' | 'left' | 'right' | 'up' | 'down' | 'around';
  movementSpeed: 'slow' | 'normal';
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
  'UGC Style',
  'Product Showcase',
  'Problem → Solution'
];

const directionInfo = {
  front: { title: 'RECORD FROM THE FRONT', short: 'FRONT' },
  top: { title: 'RECORD FROM THE TOP', short: 'TOP' },
  side: { title: 'RECORD FROM THE SIDE', short: 'SIDE' },
  above_side: { title: 'RECORD FROM ABOVE + SIDE', short: 'ABOVE + SIDE' },
  below: { title: 'RECORD FROM BELOW', short: 'BELOW' }
};

function isEnvironmentShot(shot: Shot): boolean {
  const words = [
    shot.title,
    shot.setupInstruction,
    shot.aimInstruction,
    shot.actionInstruction,
    shot.recordInstruction
  ].join(' ').toLowerCase();

  const noProduct =
    /\bno product\b/.test(words) ||
    /\bproduct is not\b/.test(words) ||
    /\bproduct isn't\b/.test(words) ||
    /\bwithout the product\b/.test(words) ||
    /\bproduct (?:out of|outside) (?:the )?frame\b/.test(words) ||
    /\bempty (?:bathroom )?(?:counter|surface|table|sink)\b/.test(words);

  const productAction =
    shot.actionType === 'product_move' ||
    shot.actionType === 'product_action';

  return noProduct && !productAction;
}

function getSceneLabel(shot: Shot): string {
  if (!isEnvironmentShot(shot)) return 'PRODUCT';

  const words = [
    shot.title,
    shot.setupInstruction,
    shot.aimInstruction,
    shot.recordInstruction
  ].join(' ').toLowerCase();

  if (words.includes('sink')) return 'SINK';
  if (words.includes('bathroom')) return 'BATHROOM';
  if (words.includes('counter')) return 'COUNTER';
  if (words.includes('table')) return 'TABLE';
  return 'BACKGROUND';
}

function parseShotText(value: string) {
  const text: string[] = [];
  const voiceover: string[] = [];
  const lines = (value || '').split(/\n+/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^TEXT\s*:/i.test(trimmed)) {
      text.push(trimmed.replace(/^TEXT\s*:/i, '').trim());
    } else if (/^VOICEOVER\s*:/i.test(trimmed)) {
      voiceover.push(trimmed.replace(/^VOICEOVER\s*:/i, '').trim());
    } else {
      // Backward compatibility with older filming plans.
      voiceover.push(trimmed);
    }
  }

  return {
    text: text.filter(Boolean).join('\n'),
    voiceover: voiceover.filter(Boolean).join('\n')
  };
}

function DirectionDiagram({ shot }: { shot: Shot }) {
  const direction = directionInfo[shot.recordFrom] || directionInfo.front;
  const scene = getSceneLabel(shot);

  return (
    <div className={`new-director-diagram direction-${shot.recordFrom}`}>
      <div className="diagram-question">WHERE DO I RECORD FROM?</div>
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
          <span>{scene}</span>
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
  const environment = isEnvironmentShot(shot);
  const phoneText =
    shot.phoneSetup === 'hold' ? 'HOLD YOUR PHONE' : 'KEEP PHONE FIXED';

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
              {shot.phoneSetup === 'hold' ? 'HOLD IT' : 'KEEP IT FIXED'}
            </strong>
          </div>
          <div>
            <span>{environment ? 'IN THE FRAME' : 'PRODUCT'}</span>
            <strong>
              {environment ? getSceneLabel(shot) : productText}
            </strong>
          </div>
        </div>

        <p>{shot.setupInstruction}</p>
      </div>
    </div>
  );
}

function CameraMovementVisual({ shot }: { shot: Shot }) {
  const scene = getSceneLabel(shot);

  return (
    <div className={`movement-stage movement-${shot.movement}`}>
      <div className={`mini-phone moving-object move-${shot.movement}`}>
        <div className="mini-camera-dot" />
        <span>PHONE</span>
      </div>

      <div className="movement-dots">
        <i /><i /><i /><b>›</b>
      </div>

      <div className="mini-product">{scene}</div>
    </div>
  );
}

function ProductMovementVisual({ shot }: { shot: Shot }) {
  return (
    <div className={`movement-stage movement-${shot.movement}`}>
      <div className="mini-phone">
        <div className="mini-camera-dot" />
        <span>PHONE</span>
      </div>

      <div className="movement-dots">
        <i /><i /><i /><b>›</b>
      </div>

      <div className={`mini-product moving-object move-${shot.movement}`}>
        PRODUCT
      </div>
    </div>
  );
}

function StillVisual({ shot }: { shot: Shot }) {
  const environment = isEnvironmentShot(shot);

  return (
    <div className="action-stage">
      <div className="action-label">WHILE RECORDING</div>
      <div className="still-demo">
        <div className="still-phone">PHONE</div>
        <div className="still-lines">· · ·</div>
        <div className="still-product">{getSceneLabel(shot)}</div>
      </div>
      <div className="action-caption still-caption">
        {environment ? 'KEEP THE SCENE STILL' : 'KEEP EVERYTHING STILL'}
      </div>
    </div>
  );
}

function ProductActionVisual({ shot }: { shot: Shot }) {
  const action = shot.actionVisual;
  const label = shot.actionName || 'SHOW THE PRODUCT';

  if (action === 'unwrap') {
    return (
      <div className="action-stage">
        <div className="action-label">WATCH THE PRODUCT</div>
        <div className="unwrap-demo">
          <div className="soap-core">SOAP</div>
          <div className="soap-wrapper">WRAPPER</div>
          <div className="action-arrow">→</div>
        </div>
        <div className="action-caption">SLIDE WRAPPER OFF</div>
      </div>
    );
  }

  if (action === 'open' || action === 'remove' || action === 'twist') {
    return (
      <div className="action-stage">
        <div className="action-label">WATCH THE PRODUCT</div>
        <div className="open-demo">
          <div className="action-bottle">
            <div className="action-cap" />
            <span>PRODUCT</span>
          </div>
          <div className="up-action-arrow">
            {action === 'twist' ? '↻' : '↑'}
          </div>
        </div>
        <div className="action-caption">{label}</div>
      </div>
    );
  }

  if (action === 'rotate' || action === 'flip') {
    return (
      <div className="action-stage">
        <div className="action-label">WATCH THE PRODUCT</div>
        <div className="rotate-demo">
          <div className="rotate-arrow">↻</div>
          <div className="rotate-product">PRODUCT</div>
        </div>
        <div className="action-caption">{label}</div>
      </div>
    );
  }

  if (action === 'lift' || action === 'pick_up' || action === 'place') {
    return (
      <div className="action-stage">
        <div className="action-label">WATCH THE PRODUCT</div>
        <div className="lift-demo">
          <div className="lift-product">PRODUCT</div>
          <div className="lift-arrow">
            {action === 'place' ? '↓' : '↑'}
          </div>
          <div className="surface-line" />
        </div>
        <div className="action-caption">{label}</div>
      </div>
    );
  }

  if (action === 'slide' || action === 'pull' || action === 'push') {
    return (
      <div className="action-stage">
        <div className="action-label">WATCH THE PRODUCT</div>
        <div className="slide-demo">
          <div className="slide-product">PRODUCT</div>
          <div className="slide-arrow">→</div>
        </div>
        <div className="action-caption">{label}</div>
      </div>
    );
  }

  if (action === 'press' || action === 'tap') {
    return (
      <div className="action-stage">
        <div className="action-label">WATCH THE PRODUCT</div>
        <div className="press-demo">
          <div className="press-arrow">↓</div>
          <div className="press-product">PRODUCT</div>
        </div>
        <div className="action-caption">{label}</div>
      </div>
    );
  }

  if (action === 'shake') {
    return (
      <div className="action-stage">
        <div className="action-label">WATCH THE PRODUCT</div>
        <div className="shake-demo">
          <span>←</span>
          <div className="shake-product">PRODUCT</div>
          <span>→</span>
        </div>
        <div className="action-caption">{label}</div>
      </div>
    );
  }

  if (action === 'spray') {
    return (
      <div className="action-stage">
        <div className="action-label">WATCH THE PRODUCT</div>
        <div className="spray-demo">
          <div className="spray-product">PRODUCT</div>
          <div className="spray-cloud"><i /><i /><i /></div>
        </div>
        <div className="action-caption">{label}</div>
      </div>
    );
  }

  return (
    <div className="action-stage">
      <div className="action-label">DO THIS</div>
      <div className="generic-action">
        <div className="generic-product">PRODUCT</div>
        <div className="generic-arrow">→</div>
      </div>
      <div className="action-caption">{label}</div>
    </div>
  );
}
function AdaptiveTeachingVisual({
  shot,
  goal,
  personInVideo
}: {
  shot: Shot;
  goal: string;
  personInVideo: PersonSetting;
}) {
  const environment = isEnvironmentShot(shot);

  // Environment shots must not show a fake product or creator.
  if (environment) {
    if (shot.actionType === 'camera_move') {
      return <CameraMovementVisual shot={shot} />;
    }
    return <StillVisual shot={shot} />;
  }

  const words = [
    shot.title,
    shot.actionName,
    shot.actionInstruction,
    shot.setupInstruction,
    shot.aimInstruction,
    shot.recordInstruction
  ].join(' ').toLowerCase();

  if (
    personInVideo === 'with_person' &&
    goal === 'UGC Style' &&
    (
      words.includes('talk to camera') ||
      words.includes('speak to camera') ||
      words.includes('look into the camera') ||
      words.includes('look at the camera')
    )
  ) {
    return (
      <div className="teaching-stage talking-stage">
        <div className="teaching-label">HOW TO FILM THIS</div>
        <div className="talking-layout">
          <div className="teaching-phone">PHONE</div>
          <div className="teaching-arrow">→</div>
          <div className="creator-frame">
            <div className="creator-head" />
            <div className="creator-body">YOU</div>
            <div className="creator-product">PRODUCT</div>
          </div>
        </div>
        <div className="teaching-caption">LOOK AT THE CAMERA</div>
        <div className="teaching-tip">{shot.aimInstruction}</div>
      </div>
    );
  }

  if (
    words.includes('pov') ||
    words.includes('point of view') ||
    words.includes('your view')
  ) {
    return (
      <div className="teaching-stage pov-stage">
        <div className="teaching-label">POV SETUP</div>
        <div className="pov-layout">
          <div className="pov-phone">PHONE<span>↓</span></div>
          <div className="pov-view">
            <strong>WHAT VIEWERS SEE</strong>
            <div>PRODUCT</div>
          </div>
        </div>
        <div className="teaching-caption">FILM FROM YOUR VIEW</div>
        <div className="teaching-tip">{shot.aimInstruction}</div>
      </div>
    );
  }

  if (shot.actionType === 'camera_move') {
    return <CameraMovementVisual shot={shot} />;
  }

  if (shot.actionType === 'product_move') {
    return <ProductMovementVisual shot={shot} />;
  }

  if (shot.actionType === 'product_action') {
    return <ProductActionVisual shot={shot} />;
  }

  return <StillVisual shot={shot} />;
}

function MovementGuide({
  shot,
  goal,
  personInVideo
}: {
  shot: Shot;
  goal: string;
  personInVideo: PersonSetting;
}) {
  const title =
    (shot.actionName || '').replace(/_/g, ' ').trim() ||
    (shot.actionType === 'camera_move'
      ? 'MOVE YOUR PHONE'
      : shot.actionType === 'product_move'
      ? 'MOVE THE PRODUCT'
      : 'KEEP STILL');

  return (
    <div className="movement-card">
      <div className="step-number">3</div>
      <div className="step-content">
        <small>WHAT DO I DO?</small>
        <h3>{title}</h3>

        <AdaptiveTeachingVisual
          shot={shot}
          goal={goal}
          personInVideo={personInVideo}
        />

        <div className="action-instruction-box">
          <span>DO THIS</span>
          <strong>{shot.actionInstruction}</strong>
        </div>

        {shot.actionType !== 'still' && (
          <div className="speed-label">
            {shot.movementSpeed === 'slow' ? 'DO IT SLOWLY' : 'NORMAL SPEED'}
          </div>
        )}
      </div>
    </div>
  );
}

async function prepareProductPhoto(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const photo = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('This photo could not be opened.'));
      img.src = objectUrl;
    });

    const originalWidth = photo.naturalWidth;
    const originalHeight = photo.naturalHeight;

    if (!originalWidth || !originalHeight) {
      throw new Error('This photo has invalid dimensions.');
    }

    let maxSide = 1200;

    for (let attempt = 0; attempt < 5; attempt++) {
      const scale = Math.min(
        1,
        maxSide / Math.max(originalWidth, originalHeight)
      );

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(originalWidth * scale));
      canvas.height = Math.max(1, Math.round(originalHeight * scale));

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Your browser could not process this photo.');
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.78, 0.65, 0.5, 0.38]) {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        if (
          dataUrl.startsWith('data:image/jpeg;base64,') &&
          dataUrl.length <= 400_000
        ) {
          return dataUrl;
        }
      }

      maxSide = Math.round(maxSide * 0.75);
    }

    throw new Error('This photo is too large to process. Try a smaller image.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function Home() {
  const [view, setView] = useState<
    'home' | 'dashboard' | 'create' | 'director' | 'done'
  >('home');

  const [name, setName] = useState('');
  const [point, setPoint] = useState('');
  const [goal, setGoal] = useState(goals[0]);
  const [personInVideo, setPersonInVideo] =
    useState<PersonSetting>('with_person');

  const [images, setImages] = useState<string[]>([]);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [shot, setShot] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function pickFiles(files?: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files);

    if (images.length + selected.length > 4) {
      setError('You can upload up to 4 photos.');
      return;
    }

    if (selected.some(file => !file.type.startsWith('image/'))) {
      setError('Please choose image files only.');
      return;
    }

    try {
      const newImages = await Promise.all(
        selected.map(prepareProductPhoto)
      );

      setImages(current => [...current, ...newImages].slice(0, 4));
      setError('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not process your photos.'
      );
    }
  }

  async function generateIdeas() {
    if (images.length === 0) {
      setError('Please upload at least 1 product photo.');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your product name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          sellingPoint: point,
          goal,
          personInVideo,
          image: images[0],
          images
        })
      });

      const responseText = await response.text();
      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          response.status === 413
            ? 'Photos are too large for the server. Please remove and re-upload them.'
            : `Server returned an unexpected response (${response.status}). Please try again.`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not generate filming ideas.'
        );
      }

      if (!data.concept || !Array.isArray(data.concept.shots)) {
        throw new Error('ShootAI received an invalid response.');
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
      <button className="logo" onClick={() => setView('home')}>
        Shoot<span>AI</span>
      </button>

      <button className="navbtn" onClick={() => setView('dashboard')}>
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
            <div className="badge">AI PRODUCT FILMING DIRECTOR</div>
            <h1>Don’t know how to film your product?</h1>

           <p className="lead">
  Upload your product photos. Get a creative concept and six
  step-by-step shots you can film using just your phone.
</p>

            <button className="cta" onClick={() => setView('create')}>
              Create a filming plan →
            </button>

            <p className="tiny">
              No video generation. No editing. Just clear direction.
            </p>
          </div>

        
<div className="mock">
  <div className="phone">
    <div className="frame">
      <div className="box">
        <span style={{ fontSize: 12 }}>PRODUCT VIDEO</span>
        <strong style={{ fontSize: 22 }}>PAPAYA SOAP</strong>
        <span style={{ fontSize: 11 }}>6-SHOT FILMING PLAN</span>
      </div>
      <span>✓ Phone-only filming</span>
    </div>

    <small>SHOT 1 OF 6 · THE HOOK</small>
    <b>Time to refresh your shower routine?</b>
    <p style={{ fontSize: 12, color: '#aab0b8', marginTop: 10 }}>
      Place your phone 30 cm from the bathroom counter.
      Keep it steady and record for 2 seconds.
    </p>
  </div>
</div>

        </section>

        <section className="how">
          <p>HOW IT WORKS</p>
          <h2>From product to shot list in minutes.</h2>

          <div className="steps">
            <article>
              <i>01</i>
              <h3>Show your product</h3>
              <span>Upload product photos and tell us the key selling point.</span>
            </article>

            <article>
              <i>02</i>
              <h3>AI plans your video</h3>
              <span>
                ShootAI studies your product and creates the filming plan for you.
              </span>
            </article>

            <article>
              <i>03</i>
              <h3>Follow the director</h3>
              <span>
                Film one shot at a time with simple visual directions.
              </span>
            </article>
          </div>
        </section>
     
<section className="how">
  <p>BUILT FOR SOLO CREATORS</p>
  <h2>Everything you need to know before pressing record.</h2>

  <div className="steps">
    <article>
      <i>01</i>
      <h3>Made for your product</h3>
      <span>
        Get filming ideas based on your actual product photos,
        selling points, and video goal.
      </span>
    </article>

    <article>
      <i>02</i>
      <h3>Know exactly where to place your phone</h3>
      <span>
        Follow clear camera directions, positioning diagrams,
        and practical setup instructions.
      </span>
    </article>

    <article>
      <i>03</i>
      <h3>Film without a production team</h3>
      <span>
        Create product footage with your phone, a simple setup,
        and easy-to-follow shot instructions.
      </span>
    </article>
  </div>
</section>

<section className="how">
  <p>COMMON QUESTIONS</p>
  <h2>Everything you need to know.</h2>

  <div className="faq-list">
    <details>
      <summary>What is ShootAI?</summary>
      <p>
        ShootAI is an AI filming director that creates practical,
        step-by-step product video plans based on your product photos.
      </p>
    </details>

    <details>
      <summary>Do I need professional filming equipment?</summary>
      <p>
        No. ShootAI is designed to help you film using your phone
        and a simple setup.
      </p>
    </details>

    <details>
      <summary>Does ShootAI generate the actual video?</summary>
      <p>
        No. ShootAI guides you through filming your own footage.
        It does not generate videos or edit them.
      </p>
    </details>

    <details>
      <summary>Can I film without showing my face?</summary>
      <p>
        Yes. You can select Without Person when creating your
        filming plan.
      </p>
    </details>
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
              <div className="badge">YOUR WORKSPACE</div>
              <h2>Projects</h2>
            </div>

            <button className="cta small" onClick={() => setView('create')}>
              + New project
            </button>
          </div>

          <div className="empty">
            <div>◎</div>
            <h3>Your first product video starts here.</h3>
            <p>Create a project and ShootAI will plan every shot for you.</p>

            <button className="cta small" onClick={() => setView('create')}>
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
          <button className="back" onClick={() => setView('dashboard')}>
            ← Dashboard
          </button>

          <div className="badge">NEW PROJECT</div>
          <h2>What are you filming?</h2>
          <p>Give ShootAI enough context to create a useful plan.</p>

          <div style={{ margin: '25px 0' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}
            >
              <strong style={{ fontSize: 13 }}>Product photos</strong>
              <span style={{ fontSize: 12, color: '#8f97a1' }}>
                {images.length}/4 photos · 1 required
              </span>
            </div>

            {images.length === 0 ? (
              <label className="upload" style={{ margin: 0 }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    void pickFiles(e.target.files);
                    e.target.value = '';
                  }}
                />

                <strong>＋</strong>
                <b>Upload product photos</b>
                <span>Choose 1–4 photos of the same product</span>
              </label>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 12
                }}
              >
                {images.map((src, index) => (
                  <div
                    key={`${index}-${src.slice(-20)}`}
                    style={{
                      position: 'relative',
                      border: '1px solid #343a42',
                      background: '#111418',
                      borderRadius: 14,
                      padding: 10
                    }}
                  >
                    <div
                      style={{
                        height: 150,
                        background: '#f5f5f3',
                        borderRadius: 9,
                        overflow: 'hidden',
                        display: 'grid',
                        placeItems: 'center'
                      }}
                    >
                      <img
                        src={src}
                        alt={`Product photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 10
                      }}
                    >
                      <span
                        style={{
                          color: '#c8cdd2',
                          fontSize: 11,
                          fontWeight: 700
                        }}
                      >
                        {index === 0 ? 'MAIN PHOTO' : `PHOTO ${index + 1}`}
                      </span>

                      <button
                        type="button"
                        aria-label={`Remove photo ${index + 1}`}
                        onClick={() =>
                          setImages(current =>
                            current.filter((_, i) => i !== index)
                          )
                        }
                        style={{
                          border: '1px solid #343a42',
                          borderRadius: 7,
                          padding: '5px 9px',
                          background: '#1c2025',
                          color: '#d9dde2',
                          fontSize: 11,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {images.length < 4 && (
                  <label
                    style={{
                      margin: 0,
                      minHeight: 190,
                      border: '1px dashed #414852',
                      borderRadius: 14,
                      background: '#111418',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 9,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={e => {
                        void pickFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />

                    <span style={{ color: '#eaff47', fontSize: 28 }}>＋</span>
                    <span style={{ color: '#d9dde2', fontSize: 12 }}>
                      Add photos
                    </span>
                    <span style={{ color: '#747c86', fontSize: 11 }}>
                      Up to {4 - images.length} more
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          <label>
            Product name
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your product name"
            />
          </label>

          <label>
            Main selling point
            <textarea
              value={point}
              onChange={e => setPoint(e.target.value)}
              placeholder="What should customers know about it?"
            />
          </label>

          <label>
            Video goal
            <div className="goalgrid">
              {goals.map(g => (
                <button
                  type="button"
                  key={g}
                  className={goal === g ? 'selected' : ''}
                  onClick={() => setGoal(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </label>

          <label>
            Person in video
            <div className="goalgrid">
              <button
                type="button"
                className={
                  personInVideo === 'with_person' ? 'selected' : ''
                }
                onClick={() => setPersonInVideo('with_person')}
              >
                With Person
              </button>

              <button
                type="button"
                className={
                  personInVideo === 'without_person' ? 'selected' : ''
                }
                onClick={() => setPersonInVideo('without_person')}
              >
                Without Person
              </button>
            </div>

            <span
              style={{
                display: 'block',
                marginTop: 8,
                color: '#8f97a1',
                fontSize: 12
              }}
            >
              Without Person keeps faces and bodies off-camera.
              Hands/POV can still be used when needed.
            </span>
          </label>

          {error && (
            <p style={{ color: '#ff6b6b', marginTop: 12 }}>
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
    const shots = concept?.shots || [];
    const s = shots[shot];

    if (!s) {
      return (
        <main>
          {nav}
          <section className="page narrow">
            <h2>No shot available.</h2>
            <button className="cta" onClick={() => setView('create')}>
              Back to product details
            </button>
          </section>
        </main>
      );
    }

    const script = parseShotText(s.say);

    return (
      <main>
        {nav}

        <section className="page narrow">
          <button className="back" onClick={() => setView('create')}>
            ← Product details
          </button>

          <div className="progress">
            <i
              style={{
                width: `${((shot + 1) / shots.length) * 100}%`
              }}
            />
          </div>

          <div className="shotrow">
            <span>SHOT {shot + 1} OF {shots.length}</span>
            <span>{s.duration.toUpperCase()}</span>
          </div>

          <h2>{s.title}</h2>

          <div className="director-intro">
            Follow these steps. Don’t worry about camera terms.
          </div>

          <div className="director-step-card direction-step">
            <div className="step-number">1</div>

            <div className="step-content">
              <small>CAMERA DIRECTION</small>
              <DirectionDiagram shot={s} />
              <p className="aim-instruction">{s.aimInstruction}</p>
            </div>
          </div>

          <SetupGuide shot={s} />

          <MovementGuide
            shot={s}
            goal={goal}
            personInVideo={personInVideo}
          />

          <div className="record-card">
            <div className="step-number">4</div>

            <div className="step-content">
              <small>RECORD</small>
              <h3>RECORD FOR {s.duration.toUpperCase()}</h3>

              <div className="record-timer">
                <span className="big-record-dot" />
                <strong>{s.duration}</strong>
              </div>

              <p>{s.recordInstruction}</p>
            </div>
          </div>

          {script.text && (
            <div className="say">
              <small>ON-SCREEN TEXT · NO SPEAKING REQUIRED</small>
              <strong style={{ whiteSpace: 'pre-line' }}>
                {script.text}
              </strong>
            </div>
          )}

          {script.voiceover && (
            <div className="say">
              <small>
                {personInVideo === 'without_person'
                  ? 'OPTIONAL OFF-CAMERA VOICEOVER'
                  : 'OPTIONAL VOICEOVER / WHAT TO SAY'}
              </small>
              <strong style={{ whiteSpace: 'pre-line' }}>
                {script.voiceover}
              </strong>
            </div>
          )}

          <button
            className="cta full"
            onClick={() =>
              shot < shots.length - 1
                ? setShot(shot + 1)
                : setView('done')
            }
          >
            {shot < shots.length - 1
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
        <div className="tick">✓</div>
        <div className="badge">FILMING PLAN COMPLETE</div>
        <h2>You know exactly what to shoot.</h2>

        <p>
          Follow your six shots while filming, then edit the footage
          in your preferred editor.
        </p>

        <div className="donegrid">
          {(concept?.shots || []).map((s, i) => (
            <div key={`${s.title}-${i}`}>
              ✓ <span>{s.title}</span>
            </div>
          ))}
        </div>

        <button
          className="cta"
          onClick={() => {
            setName('');
            setPoint('');
            setImages([]);
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
