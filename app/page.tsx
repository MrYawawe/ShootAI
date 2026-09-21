'use client';

import { useState } from 'react';

type Shot = {
  title: string;
  duration: string;
  camera: string;
  setup?: string;
  action: string;
  lighting: string;
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
    if (f) {
      const r = new FileReader();
      r.onload = () => setImage(String(r.result));
      r.readAsDataURL(f);
    }
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
        throw new Error(data.error || 'Could not generate filming ideas.');
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

      <button className="navbtn" onClick={() => setView('dashboard')}>
        Dashboard
      </button>
    </nav>
  );

  if (view === 'home')
    return (
      <main>
        {nav}

        <section className="hero">
          <div>
            <div className="badge">AI PRODUCT FILMING DIRECTOR</div>

            <h1>Don’t know how to film your product?</h1>

            <p className="lead">
              Show ShootAI what you sell. Get a content concept and exact
              shot-by-shot instructions you can follow with your phone.
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
              <span>Upload a photo and tell us the key selling point.</span>
            </article>

            <article>
              <i>02</i>
              <h3>Pick a concept</h3>
              <span>
                ShootAI gives you simple short-form content directions.
              </span>
            </article>

            <article>
              <i>03</i>
              <h3>Follow the director</h3>
              <span>
                Film one shot at a time with camera, action, lighting and
                dialogue guidance.
              </span>
            </article>
          </div>
        </section>
      </main>
    );

  if (view === 'dashboard')
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
              Create a project and ShootAI will plan every shot for you.
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

  if (view === 'create')
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
              onChange={(e) => pickFile(e.target.files?.[0])}
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
              ? 'ShootAI is creating your concepts...'
              : 'Generate filming ideas ✦'}
          </button>
        </section>
      </main>
    );

  if (view === 'ideas')
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
                className={i === 0 ? 'idea best' : 'idea'}
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

          <div className="visual">
            <div className="guide"></div>

            {image ? (
              <img src={image} alt="Your product" />
            ) : (
              <div className="box">PRODUCT</div>
            )}

            <b>↑</b>
          </div>

          <div className="details">
            <div>
              <small>CAMERA</small>
              <strong>{s.camera}</strong>
            </div>

            {s.setup && (
              <div>
                <small>SETUP</small>
                <strong>{s.setup}</strong>
              </div>
            )}

            <div>
              <small>ACTION</small>
              <strong>{s.action}</strong>
            </div>

            <div>
              <small>LIGHTING</small>
              <strong>{s.lighting}</strong>
            </div>
          </div>

          <div className="say">
            <small>SAY</small>
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

        <div className="badge">FILMING PLAN COMPLETE</div>

        <h2>You know exactly what to shoot.</h2>

        <p>
          Follow your shots while filming, then edit the footage in your
          preferred editor.
        </p>

        <div className="donegrid">
          {(concepts[selectedConcept]?.shots || []).map((s, i) => (
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
