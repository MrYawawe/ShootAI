
'use client';

import { useState } from 'react';

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
  'Problem → Solution',
];

async function compressPhoto(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const photo = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not open this photo.'));
      img.src = objectUrl;
    });

    const width = photo.naturalWidth;
    const height = photo.naturalHeight;

    if (!width || !height) {
      throw new Error('This photo has invalid dimensions.');
    }

    let maxSide = 1200;

    for (let attempt = 0; attempt < 5; attempt++) {
      const scale = Math.min(1, maxSide / Math.max(width, height));

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Your browser could not process this photo.');
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.78, 0.65, 0.5, 0.38]) {
        const result = canvas.toDataURL('image/jpeg', quality);

        if (
          result.startsWith('data:image/jpeg;base64,') &&
          result.length <= 400000
        ) {
          return result;
        }
      }

      maxSide = Math.round(maxSide * 0.75);
    }

    throw new Error('This photo is too large. Try a smaller image.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function Diagram({
  shot,
  personInVideo,
}: {
  shot: Shot;
  personInVideo: 'with' | 'without';
}) {
  const direction = (shot.recordFrom || 'front').replaceAll('_', ' ');
  const action = shot.actionName || 'Keep everything steady';

  return (
    <div className="diagram">
      <div className="diagram-label">CAMERA POSITION</div>

      <div className="diagram-stage">
        <div className="diagram-phone">
          <span className="camera-dot" />
          PHONE
        </div>

        <div className="diagram-arrow">
          <span>→</span>
          <small>{direction.toUpperCase()}</small>
        </div>

        <div className="diagram-product">PRODUCT</div>
      </div>

      <p>
        <strong>Position:</strong> {shot.aimInstruction}
      </p>

      <div className="diagram-label second-label">WHAT MOVES?</div>

      <div className="diagram-stage action-stage">
        <div className="diagram-object">
          {shot.movingObject === 'phone'
            ? 'PHONE'
            : shot.movingObject === 'product'
              ? 'PRODUCT'
              : 'ACTION'}
        </div>

        <div className="diagram-arrow">
          <span>
            {shot.movement === 'up'
              ? '↑'
              : shot.movement === 'down'
                ? '↓'
                : shot.movement === 'left'
                  ? '←'
                  : shot.movement === 'around'
                    ? '↻'
                    : shot.movement === 'none'
                      ? '•'
                      : '→'}
          </span>
          <small>{(shot.movement || 'still').toUpperCase()}</small>
        </div>

        <div className="diagram-object">END POSITION</div>
      </div>

      <p>
        <strong>{action}:</strong> {shot.actionInstruction}
      </p>

      {personInVideo === 'without' && (
        <div className="diagram-note">
          Product-only framing. No face or body in the shot.
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<
    'home' | 'dashboard' | 'create' | 'director' | 'done'
  >('home');

  const [name, setName] = useState('');
  const [point, setPoint] = useState('');
  const [goal, setGoal] = useState(goals[0]);

  const [personInVideo, setPersonInVideo] = useState<
    'with' | 'without'
  >('with');

  const [images, setImages] = useState<string[]>([]);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [shotIndex, setShotIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function pickFiles(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files);

    if (images.length + selected.length > 4) {
      setError('You can upload up to 4 product photos.');
      return;
    }

    if (selected.some((file) => !file.type.startsWith('image/'))) {
      setError('Please upload image files only.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const compressed = await Promise.all(
        selected.map((file) => compressPhoto(file))
      );

      setImages((current) => [...current, ...compressed].slice(0, 4));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not process your photos.'
      );
    } finally {
      setUploading(false);
    }
  }

  async function generateIdeas() {
    if (images.length === 0) {
      setError('Please upload at least one product photo.');
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          sellingPoint: point.trim(),
          goal,
          personInVideo,
          image: images[0],
          images,
        }),
      });

      const responseText = await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          response.status === 413
            ? 'Photos are too large. Please remove and upload them again.'
            : `Server error (${response.status}). Please try again.`
        );
      }

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'Could not generate your filming plan.'
        );
      }

      if (!data.concept || !Array.isArray(data.concept.shots)) {
        throw new Error('ShootAI received an invalid filming plan.');
      }

      setConcept(data.concept);
      setShotIndex(0);
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

  function startAgain() {
    setName('');
    setPoint('');
    setImages([]);
    setConcept(null);
    setShotIndex(0);
    setError('');
    setView('create');
  }

  const nav = (
    <nav className="navigation">
      <button className="logo" onClick={() => setView('home')}>
        Shoot<span>AI</span>
      </button>

      <button
        className="nav-button"
        onClick={() => setView('dashboard')}
      >
        Dashboard
      </button>
    </nav>
  );

  const shots = concept?.shots || [];
  const currentShot = shots[shotIndex];

  return (
    <main className="app">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #0d1013;
          color: #f5f6f7;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .navigation {
          max-width: 1160px;
          margin: auto;
          padding: 25px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #252b31;
        }

        .logo {
          border: 0;
          background: transparent;
          color: #fff;
          font-size: 25px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .logo span {
          color: #eaff47;
        }

        .nav-button {
          border: 1px solid #343a42;
          background: #181c20;
          color: #e8ebed;
          border-radius: 10px;
          padding: 10px 17px;
        }

        .page {
          width: min(100% - 36px, 760px);
          margin: 55px auto 100px;
        }

        .wide {
          width: min(100% - 36px, 1100px);
        }

        .eyebrow {
          display: inline-block;
          color: #eaff47;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
          margin-bottom: 18px;
        }

        h1 {
          font-size: clamp(38px, 6vw, 67px);
          line-height: 1.07;
          letter-spacing: -2.5px;
          margin: 0 0 23px;
        }

        h2 {
          font-size: clamp(26px, 4vw, 39px);
          line-height: 1.15;
          letter-spacing: -1px;
          margin: 0 0 20px;
        }

        h3 {
          font-size: 19px;
          margin: 10px 0 15px;
        }

        p {
          color: #a5adb6;
          line-height: 1.65;
        }

        .hero {
          min-height: 570px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 60px;
        }

        .lead {
          font-size: 17px;
          max-width: 540px;
          margin-bottom: 30px;
        }

        .cta {
          background: #eaff47;
          border: 0;
          border-radius: 11px;
          color: #111409;
          padding: 16px 23px;
          font-weight: 850;
          font-size: 15px;
        }

        .cta:hover {
          background: #f2ff81;
        }

        .cta:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .full {
          width: 100%;
        }

        .mock {
          background: linear-gradient(145deg, #242a2f, #111519);
          border: 1px solid #343b42;
          border-radius: 28px;
          padding: 35px;
          min-height: 420px;
          display: grid;
          place-items: center;
        }

        .mock-phone {
          width: 230px;
          border: 7px solid #3b424a;
          background: #101417;
          border-radius: 28px;
          padding: 15px;
          box-shadow: 0 25px 55px #0008;
        }

        .mock-screen {
          height: 260px;
          background: #e8e9e5;
          border-radius: 13px;
          display: grid;
          place-items: center;
          color: #343a42;
          text-align: center;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .mock-phone small {
          display: block;
          color: #eaff47;
          margin: 16px 0 8px;
          font-size: 10px;
        }

        .mock-phone b {
          font-size: 12px;
          line-height: 1.5;
        }

        .panel {
          background: #171b20;
          border: 1px solid #30363e;
          border-radius: 20px;
          padding: 28px;
          margin-top: 26px;
        }

        .back {
          background: transparent;
          border: 0;
          color: #aeb6be;
          padding: 0;
          margin-bottom: 28px;
        }

        .field {
          display: block;
          font-size: 13px;
          font-weight: 750;
          margin-bottom: 26px;
        }

        .field input,
        .field textarea {
          display: block;
          width: 100%;
          margin-top: 11px;
          background: #0e1115;
          border: 1px solid #343c44;
          color: white;
          border-radius: 11px;
          padding: 15px;
          outline: none;
        }

        .field textarea {
          min-height: 110px;
          resize: vertical;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #eaff47;
        }

        .upload {
          border: 1px dashed #59616b;
          background: #111519;
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          display: block;
          cursor: pointer;
          margin: 12px 0 28px;
        }

        .upload strong {
          display: block;
          font-size: 15px;
          margin: 9px 0;
        }

        .upload small {
          color: #8b949e;
        }

        .plus {
          color: #eaff47;
          font-size: 35px;
        }

        .photos {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 26px;
        }

        .photo {
          border: 1px solid #353c44;
          border-radius: 13px;
          padding: 10px;
          background: #111519;
        }

        .photo img {
          display: block;
          width: 100%;
          height: 170px;
          object-fit: contain;
          background: #f5f5f3;
          border-radius: 8px;
        }

        .photo-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          gap: 8px;
        }

        .photo-bottom small {
          color: #c5ccd2;
          font-weight: 750;
        }

        .remove {
          background: #242a30;
          border: 1px solid #3b424b;
          color: #e4e7ea;
          padding: 6px 10px;
          border-radius: 7px;
          font-size: 11px;
        }

        .choices {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }

        .choice {
          min-height: 53px;
          background: #101418;
          border: 1px solid #373f48;
          border-radius: 10px;
          color: #c7cdd3;
          font-weight: 700;
          padding: 10px;
        }

        .choice.selected {
          border-color: #eaff47;
          background: #262e17;
          color: #eaff47;
        }

        .hint {
          font-size: 12px;
          color: #9099a3;
          font-weight: 400;
          line-height: 1.5;
          margin-top: 10px;
        }

        .error {
          color: #ff8181;
          background: #341c20;
          border: 1px solid #6b303a;
          border-radius: 10px;
          padding: 13px;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .progress {
          height: 5px;
          background: #30363d;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 28px;
        }

        .progress div {
          height: 100%;
          background: #eaff47;
          transition: width 0.2s;
        }

        .shot-meta {
          display: flex;
          justify-content: space-between;
          color: #eaff47;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }

        .step {
          display: flex;
          gap: 18px;
          background: #171b20;
          border: 1px solid #303740;
          border-radius: 17px;
          padding: 23px;
          margin: 15px 0;
        }

        .step-number {
          flex: 0 0 32px;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: #eaff47;
          color: #151a0c;
          display: grid;
          place-items: center;
          font-weight: 900;
        }

        .step-body {
          min-width: 0;
          flex: 1;
        }

        .step-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
          color: #aeb6bf;
        }

        .step-body p {
          margin-bottom: 0;
          font-size: 14px;
        }

        .diagram {
          background: #0e1216;
          border: 1px solid #343c44;
          border-radius: 14px;
          padding: 18px;
          margin: 17px 0;
        }

        .diagram-label {
          color: #aab4bd;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .second-label {
          margin-top: 25px;
        }

        .diagram-stage {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin: 24px 0;
        }

        .diagram-phone {
          position: relative;
          border: 3px solid #eaff47;
          border-radius: 10px;
          width: 82px;
          height: 105px;
          display: grid;
          place-items: center;
          font-size: 10px;
          font-weight: 900;
          color: #eaff47;
        }

        .camera-dot {
          position: absolute;
          top: 7px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #eaff47;
        }

        .diagram-product,
        .diagram-object {
          min-width: 85px;
          min-height: 72px;
          border: 2px solid #aab5bf;
          border-radius: 8px;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 8px;
          font-size: 10px;
          font-weight: 850;
        }

        .diagram-arrow {
          flex: 1;
          text-align: center;
          color: #eaff47;
        }

        .diagram-arrow span {
          display: block;
          font-size: 35px;
        }

        .diagram-arrow small {
          font-size: 9px;
          font-weight: 800;
        }

        .diagram p {
          font-size: 12px;
        }

        .diagram-note {
          border: 1px solid #475631;
          background: #202918;
          color: #dfff9a;
          padding: 11px;
          border-radius: 9px;
          font-size: 12px;
        }

        .instruction {
          background: #101418;
          border-left: 3px solid #eaff47;
          padding: 15px;
          border-radius: 6px;
          color: #e5e9ec;
          line-height: 1.65;
          font-size: 14px;
        }

        .say {
          background: #252b1a;
          border: 1px solid #52602c;
          border-radius: 14px;
          padding: 20px;
          margin: 20px 0;
        }

        .say small {
          display: block;
          color: #eaff47;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .say strong {
          line-height: 1.6;
        }

        .done-list {
          margin: 25px 0;
          display: grid;
          gap: 10px;
        }

        .done-item {
          background: #181e20;
          border: 1px solid #30383c;
          border-radius: 10px;
          padding: 14px;
          color: #eaff47;
        }

        .done-item span {
          color: white;
          margin-left: 10px;
        }

        @media (max-width: 750px) {
          .hero {
            grid-template-columns: 1fr;
            gap: 25px;
            padding-top: 30px;
          }

          .mock {
            min-height: 350px;
          }

          .page {
            margin-top: 35px;
          }

          .panel {
            padding: 19px;
          }

          .step {
            padding: 15px;
            gap: 12px;
          }

          .diagram {
            padding: 12px;
          }

          .diagram-phone {
            width: 65px;
            height: 85px;
          }

          .diagram-product,
          .diagram-object {
            min-width: 66px;
            font-size: 9px;
          }
        }
      `}</style>

      {nav}

      {view === 'home' && (
        <section className="page wide hero">
          <div>
            <div className="eyebrow">AI PRODUCT FILMING DIRECTOR</div>

            <h1>Don’t know how to film your product?</h1>

            <p className="lead">
              Show ShootAI what you sell. Get a content concept and
              exact shot-by-shot instructions you can follow with
              your phone.
            </p>

            <button className="cta" onClick={() => setView('create')}>
              Create a filming plan →
            </button>

            <p>
              No video generation. No editing. Just clear direction.
            </p>
          </div>

          <div className="mock">
            <div className="mock-phone">
              <div className="mock-screen">YOUR<br />PRODUCT</div>
              <small>SHOT 1 OF 6 · HOOK</small>
              <b>Follow the camera position and movement instructions.</b>
            </div>
          </div>
        </section>
      )}

      {view === 'dashboard' && (
        <section className="page">
          <div className="eyebrow">YOUR WORKSPACE</div>
          <h2>Dashboard</h2>
          <p>Create a new filming plan for your product.</p>

          <div className="panel">
            <h3>New filming plan</h3>
            <p>Upload your product and let ShootAI direct your shots.</p>

            <button className="cta" onClick={() => setView('create')}>
              Create a filming plan →
            </button>
          </div>
        </section>
      )}

      {view === 'create' && (
        <section className="page">
          <button className="back" onClick={() => setView('home')}>
            ← Back
          </button>

          <div className="eyebrow">NEW FILMING PLAN</div>
          <h2>Tell us about your product.</h2>

          <p>
            Upload up to four photos. ShootAI will use them to plan
            your filming instructions.
          </p>

          <div className="panel">
            <div className="field">
              Product photos

              {images.length === 0 && (
                <label className="upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      void pickFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />

                  <span className="plus">＋</span>
                  <strong>
                    {uploading ? 'Processing photos...' : 'Upload product photos'}
                  </strong>
                  <small>1–4 photos · Automatically compressed</small>
                </label>
              )}

              {images.length > 0 && (
                <div className="photos">
                  {images.map((src, index) => (
                    <div className="photo" key={`${index}-${src.slice(-15)}`}>
                      <img
                        src={src}
                        alt={`Product photo ${index + 1}`}
                      />

                      <div className="photo-bottom">
                        <small>
                          {index === 0
                            ? 'MAIN PHOTO'
                            : `PHOTO ${index + 1}`}
                        </small>

                        <button
                          type="button"
                          className="remove"
                          onClick={() =>
                            setImages((current) =>
                              current.filter((_, i) => i !== index)
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {images.length < 4 && (
                    <label className="upload" style={{ margin: 0 }}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        disabled={uploading}
                        onChange={(e) => {
                          void pickFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />

                      <span className="plus">＋</span>
                      <strong>
                        {uploading ? 'Processing...' : 'Add photos'}
                      </strong>
                      <small>
                        Up to {4 - images.length} more
                      </small>
                    </label>
                  )}
                </div>
              )}
            </div>

            <label className="field">
              Product name

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your product name"
              />
            </label>

            <label className="field">
              Main selling point

              <textarea
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                placeholder="What should customers know about it?"
              />
            </label>

            <div className="field">
              Video goal

              <div className="choices">
                {goals.map((item) => (
                  <button
                    type="button"
                    className={`choice ${
                      goal === item ? 'selected' : ''
                    }`}
                    key={item}
                    onClick={() => setGoal(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              Person in video

              <div className="choices">
                <button
                  type="button"
                  className={`choice ${
                    personInVideo === 'with' ? 'selected' : ''
                  }`}
                  onClick={() => setPersonInVideo('with')}
                >
                  With Person
                </button>

                <button
                  type="button"
                  className={`choice ${
                    personInVideo === 'without' ? 'selected' : ''
                  }`}
                  onClick={() => setPersonInVideo('without')}
                >
                  Without Person
                </button>
              </div>

              <div className="hint">
                Without Person keeps faces and bodies off-camera.
                Hands/POV can still be used when needed.
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <button
              className="cta full"
              disabled={loading || uploading}
              onClick={generateIdeas}
            >
              {uploading
                ? 'Processing photos...'
                : loading
                  ? 'ShootAI is planning your video...'
                  : 'Generate filming plan ✦'}
            </button>
          </div>
        </section>
      )}

      {view === 'director' && currentShot && (
        <section className="page">
          <button className="back" onClick={() => setView('create')}>
            ← Product details
          </button>

          <div className="progress">
            <div
              style={{
                width: `${((shotIndex + 1) / shots.length) * 100}%`,
              }}
            />
          </div>

          <div className="shot-meta">
            <span>SHOT {shotIndex + 1} OF {shots.length}</span>
            <span>{currentShot.duration}</span>
          </div>

          <h2>{currentShot.title}</h2>

          <p>
            Follow these steps. Don’t worry about camera terms.
          </p>

          <div className="step">
            <div className="step-number">1</div>

            <div className="step-body">
              <div className="step-label">CAMERA DIRECTION</div>
              <h3>Where do I record from?</h3>

              <Diagram
                shot={currentShot}
                personInVideo={personInVideo}
              />
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>

            <div className="step-body">
              <div className="step-label">SET UP</div>

              <h3>
                {currentShot.phoneSetup === 'hold'
                  ? 'Hold your phone'
                  : 'Keep your phone fixed'}
              </h3>

              <div className="instruction">
                <strong>Phone:</strong>{' '}
                {currentShot.phoneSetup === 'hold'
                  ? 'Hold it.'
                  : 'Keep it fixed.'}
                <br />

                <strong>Product:</strong>{' '}
                {currentShot.productSetup === 'hold'
                  ? 'Hold the product.'
                  : currentShot.productSetup === 'table'
                    ? 'Put the product on a table.'
                    : 'Put the product on a surface.'}
              </div>

              <p>{currentShot.setupInstruction}</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>

            <div className="step-body">
              <div className="step-label">WHAT DO I DO?</div>

              <h3>{currentShot.actionName || 'Follow this action'}</h3>

              <div className="instruction">
                {currentShot.actionInstruction}
              </div>

              <p>
                {currentShot.movementSpeed === 'slow'
                  ? 'Do it slowly.'
                  : 'Use a natural speed.'}
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>

            <div className="step-body">
              <div className="step-label">RECORD</div>

              <h3>
                Record for {currentShot.duration}
              </h3>

              <div className="instruction">
                {currentShot.recordInstruction}
              </div>
            </div>
          </div>

          {currentShot.say && (
            <div className="say">
              <small>WHAT TO SAY</small>
              <strong>{currentShot.say}</strong>
            </div>
          )}

          <button
            className="cta full"
            onClick={() => {
              if (shotIndex < shots.length - 1) {
                setShotIndex(shotIndex + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setView('done');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            {shotIndex < shots.length - 1
              ? '✓ Done — Next shot'
              : '✓ Complete filming plan'}
          </button>
        </section>
      )}

      {view === 'done' && (
        <section className="page">
          <div className="eyebrow">FILMING PLAN COMPLETE</div>

          <h2>You know exactly what to shoot.</h2>

          <p>
            Follow your shots while filming, then edit the footage
            in your preferred editor.
          </p>

          <div className="done-list">
            {shots.map((item, index) => (
              <div className="done-item" key={`${item.title}-${index}`}>
                ✓ <span>{item.title}</span>
              </div>
            ))}
          </div>

          <button className="cta" onClick={startAgain}>
            Create another plan →
          </button>
        </section>
      )}
    </main>
  );
}
