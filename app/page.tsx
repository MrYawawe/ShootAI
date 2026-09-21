'use client';

import { useState } from 'react';

type Shot = {
  title: string;
  duration: string;
  camera: string;
  phonePosition: string;
  distance: string;
  subjectPosition: string;
  lightDirection: string;
  setup: string;
  recordSteps: string[];
  say: string;
  visualType:
    | 'product_front'
    | 'product_top'
    | 'product_hand'
    | 'person_product'
    | 'product_movement'
    | 'detail';
  movement:
    | 'none'
    | 'toward_camera'
    | 'away_camera'
    | 'left_to_right'
    | 'right_to_left'
    | 'top_to_bottom'
    | 'bottom_to_top';
  lightSide: 'left' | 'right' | 'front';
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

function movementText(movement: Shot['movement']) {
  const labels = {
    none: 'KEEP STILL',
    toward_camera: 'MOVE TOWARD PHONE ↑',
    away_camera: 'MOVE AWAY FROM PHONE ↓',
    left_to_right: 'MOVE LEFT → RIGHT',
    right_to_left: 'MOVE RIGHT → LEFT',
    top_to_bottom: 'MOVE TOP → BOTTOM',
    bottom_to_top: 'MOVE BOTTOM → TOP'
  };

  return labels[movement] || 'KEEP STILL';
}

function ShotGuide({ shot }: { shot: Shot }) {
  const isPerson = shot.visualType === 'person_product';
  const isHand = shot.visualType === 'product_hand';
  const isTop = shot.visualType === 'product_top';

  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #2a2a2a',
        borderRadius: 18,
        padding: 22,
        margin: '24px 0'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 18,
          fontSize: 12,
          color: '#999',
          fontWeight: 700,
          letterSpacing: 1
        }}
      >
        <span>SHOT SETUP</span>
        <span>{shot.distance}</span>
      </div>

      <div
        style={{
          minHeight: 300,
          border: '1px solid #333',
          borderRadius: 14,
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '33.33% 33.33%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            fontSize: 11,
            color: '#888',
            letterSpacing: 1
          }}
        >
          {isTop ? 'TOP-DOWN VIEW' : 'CAMERA VIEW'}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: '6px 10px',
            border: '1px solid #3a3a3a',
            borderRadius: 20,
            fontSize: 11,
            color: '#bbb'
          }}
        >
          9:16 VERTICAL
        </div>

        <div
          style={{
            position: 'absolute',
            left: shot.lightSide === 'left' ? 18 : 'auto',
            right: shot.lightSide === 'right' ? 18 : 'auto',
            top: shot.lightSide === 'front' ? 55 : '50%',
            transform:
              shot.lightSide === 'front'
                ? 'translateY(0)'
                : 'translateY(-50%)',
            color: '#ffd84d',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700
          }}
        >
          <div style={{ fontSize: 28 }}>☀</div>
          LIGHT
          <div style={{ fontSize: 20 }}>
            {shot.lightSide === 'right' ? '←' : '→'}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          {isPerson && (
            <div
              style={{
                width: 58,
                height: 58,
                border: '2px solid #aaa',
                borderRadius: '50%',
                margin: '0 auto 8px'
              }}
            />
          )}

          {isHand && (
            <div
              style={{
                fontSize: 12,
                color: '#aaa',
                marginBottom: 8
              }}
            >
              HOLD PRODUCT
            </div>
          )}

          <div
            style={{
              width: isPerson ? 95 : 125,
              height: isPerson ? 90 : 145,
              border: '2px solid #ffd84d',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 10,
              fontWeight: 800,
              color: '#fff',
              position: 'relative',
              margin: 'auto'
            }}
          >
            PRODUCT

            <span
              style={{
                position: 'absolute',
                width: 'calc(100% + 18px)',
                height: 'calc(100% + 18px)',
                border: '1px dashed #555',
                borderRadius: 12
              }}
            />
          </div>

          <div
            style={{
              marginTop: 18,
              color: '#ffd84d',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: .5
            }}
          >
            {movementText(shot.movement)}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#999',
            fontSize: 11,
            width: '85%',
            textAlign: 'center'
          }}
        >
          {shot.subjectPosition}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginTop: 18
        }}
      >
        <div
          style={{
            width: 28,
            height: 44,
            border: '2px solid #aaa',
            borderRadius: 6,
            position: 'relative'
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              border: '1px solid #aaa',
              borderRadius: '50%',
              position: 'absolute',
              top: 4,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
        </div>

        <div>
          <div
            style={{
              color: '#fff',
              fontSize: 13,
              fontWeight: 700
            }}
          >
            PHONE
          </div>

          <div
            style={{
              color: '#999',
              fontSize: 12
            }}
          >
            {shot.phonePosition} · {shot.distance}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<
    'home' | 'dashboard' | 'create' | 'ideas' | 'director' | 'done'
  >('home');

  const [name, setName] = useState('');
  const [point, setPoint] = useState('');
  const [goal, setGoal] = useState(goals[0]);
  const [image, setImage] = useState<string>();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState(0);
  const [shot, setShot] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          image
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not generate filming ideas.'
        );
      }

      if (!data.concepts || !Array.isArray(data.concepts)) {
        throw new Error('ShootAI received an invalid response.');
      }

      setConcepts(data.concepts);
      setSelectedConcept(0);
      setShot(0);
      setView('ideas');
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

      <button
        className="navbtn"
        onClick={() => setView('dashboard')}
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

            <h1>Don’t know how to film your product?</h1>

            <p className="lead">
              Show ShootAI what you sell. Get a content concept and
              exact shot-by-shot instructions you can follow with your
              phone.
            </p>

            <button
              className="cta"
              onClick={() => setView('create')}
            >
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
                  YOUR
                  <br />
                  PRODUCT
                </div>
                <span>✓ Great framing</span>
              </div>

              <small>SHOT 1 OF 6 · HOOK</small>

              <b>Bring the product quickly toward the camera.</b>
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
              <span>
                Upload a photo and tell us the key selling point.
              </span>
            </article>

            <article>
              <i>02</i>
              <h3>Pick a concept</h3>
              <span>
                ShootAI gives you simple short-form content
                directions.
              </span>
            </article>

            <article>
              <i>03</i>
              <h3>Follow the director</h3>
              <span>
                Film one shot at a time with clear setup, lighting and
                recording instructions.
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
              <div className="badge">YOUR WORKSPACE</div>
              <h2>Projects</h2>
            </div>

            <button
              className="cta small"
              onClick={() => setView('create')}
            >
              + New project
            </button>
          </div>

          <div className="empty">
            <div>◎</div>

            <h3>Your first product video starts here.</h3>

            <p>
              Create a project and ShootAI will plan every shot for
              you.
            </p>

            <button
              className="cta small"
              onClick={() => setView('create')}
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
            onClick={() => setView('dashboard')}
          >
            ← Dashboard
          </button>

          <div className="badge">NEW PROJECT</div>

          <h2>What are you filming?</h2>

          <p>
            Give ShootAI enough context to create a useful plan.
          </p>

          <label className="upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                pickFile(e.target.files?.[0])
              }
            />

            {image ? (
              <img src={image} alt="Product preview" />
            ) : (
              <>
                <strong>＋</strong>
                <b>Upload product photo</b>
                <span>Click to choose an image</span>
              </>
            )}
          </label>

          <label>
            Product name

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Papaya Soap"
            />
          </label>

          <label>
            Main selling point

            <textarea
              value={point}
              onChange={(e) => setPoint(e.target.value)}
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
                  className={goal === g ? 'selected' : ''}
                  onClick={() => setGoal(g)}
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
              ? 'ShootAI is creating your concepts...'
              : 'Generate filming ideas ✦'}
          </button>
        </section>
      </main>
    );
  }

  if (view === 'ideas') {
    return (
      <main>
        {nav}

        <section className="page narrow">
          <button
            className="back"
            onClick={() => setView('create')}
          >
            ← Product details
          </button>

          <div className="badge">
            {concepts.length} CONCEPTS
          </div>

          <h2>Choose a direction.</h2>

          <p>Pick the concept you’d actually enjoy filming.</p>

          <div className="cards">
            {concepts.map((concept, i) => (
              <article
                className={
                  i === 0 ? 'idea best' : 'idea'
                }
                key={`${concept.title}-${i}`}
              >
                {i === 0 && <em>AI PICK</em>}

                <small>
                  {concept.shots?.length || 0} SHOTS · EASY TO FILM
                </small>

                <h3>“{concept.hook}”</h3>

                <p>{concept.description}</p>

                <div className="sequence">
                  {concept.title}
                </div>

                <button
                  className="outline"
                  onClick={() => {
                    setSelectedConcept(i);
                    setShot(0);
                    setView('director');
                  }}
                >
                  Use this concept →
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (view === 'director') {
    const concept = concepts[selectedConcept];
    const shots = concept?.shots || [];
    const s = shots[shot];

    if (!s) {
      return (
        <main>
          {nav}

          <section className="page narrow">
            <h2>No shot available.</h2>

            <button
              className="cta"
              onClick={() => setView('ideas')}
            >
              Back to concepts
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
            onClick={() => setView('ideas')}
          >
            ← Concepts
          </button>

          <div className="progress">
            <i
              style={{
                width: `${((shot + 1) / shots.length) * 100}%`
              }}
            />
          </div>

          <div className="shotrow">
            <span>
              SHOT {shot + 1} OF {shots.length}
            </span>

            <span>{s.duration.toUpperCase()}</span>
          </div>

          <h2>{s.title}</h2>

          <ShotGuide shot={s} />

          <div
            style={{
              marginTop: 28
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#ffd84d',
                fontWeight: 800,
                letterSpacing: 1,
                marginBottom: 8
              }}
            >
              HOW TO SET UP
            </div>

            <div
              style={{
                borderTop: '1px solid #292929',
                padding: '18px 0'
              }}
            >
              <strong
                style={{
                  display: 'block',
                  marginBottom: 6
                }}
              >
                {s.phonePosition}
              </strong>

              <span style={{ color: '#aaa' }}>
                {s.setup}
              </span>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid #292929',
              padding: '18px 0'
            }}
          >
            <small
              style={{
                color: '#ffd84d',
                fontWeight: 800,
                letterSpacing: 1
              }}
            >
              ☀ LIGHT
            </small>

            <strong
              style={{
                display: 'block',
                marginTop: 8
              }}
            >
              {s.lightDirection}
            </strong>
          </div>

          <div
            style={{
              borderTop: '1px solid #292929',
              padding: '18px 0'
            }}
          >
            <small
              style={{
                color: '#ffd84d',
                fontWeight: 800,
                letterSpacing: 1
              }}
            >
              ● RECORD
            </small>

            <div
              style={{
                marginTop: 14,
                display: 'grid',
                gap: 10
              }}
            >
              {s.recordSteps.map((step, i) => (
                <div
                  key={`${step}-${i}`}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start'
                  }}
                >
                  <span
                    style={{
                      minWidth: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#ffd84d'
                    }}
                  >
                    {i + 1}
                  </span>

                  <span
                    style={{
                      paddingTop: 3
                    }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="say">
            <small>WHAT TO SAY</small>
            <strong>{s.say}</strong>
          </div>

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

        <div className="badge">
          FILMING PLAN COMPLETE
        </div>

        <h2>You know exactly what to shoot.</h2>

        <p>
          Follow your six shots while filming, then edit the footage
          in your preferred editor.
        </p>

        <div className="donegrid">
          {(concepts[selectedConcept]?.shots || []).map(
            (s, i) => (
              <div key={`${s.title}-${i}`}>
                ✓ <span>{s.title}</span>
              </div>
            )
          )}
        </div>

        <button
          className="cta"
          onClick={() => {
            setName('');
            setPoint('');
            setImage(undefined);
            setConcepts([]);
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
