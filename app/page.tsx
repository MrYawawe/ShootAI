  if (view === 'home') {
    return (
      <main className="landing">
        <header className="landing-nav-wrap">
          <nav className="landing-nav">
            <button className="landing-logo" onClick={() => setView('home')} aria-label="ShootAI home">
              <span className="landing-logo-mark">✳</span> Shoot<span>AI</span>
            </button>
            <div className="landing-nav-links">
              <a href="#how-it-works">How it works</a>
              <a href="#features">Features</a>
              <a href="#faq">FAQ</a>
            </div>
            <button className="landing-nav-cta" onClick={() => setView('dashboard')}>
              Open workspace <span>↗</span>
            </button>
          </nav>
        </header>

        <section className="landing-hero">
          <div className="landing-glow" aria-hidden="true" />
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">
              <span className="landing-live-dot" />
              YOUR AI PRODUCT VIDEO DIRECTOR
              <span className="landing-eyebrow-line" />
            </div>
            <h1>Great product videos <em>start with a plan.</em></h1>
            <p>
              Turn your product photos into a clear, six-shot filming plan.
              Know what to film, where to place your phone, and what to do in every shot.
            </p>
            <div className="landing-actions">
              <button className="landing-primary" onClick={() => setView('create')}>
                Create your filming plan <span>↗</span>
              </button>
              <a className="landing-secondary" href="#how-it-works">
                See how it works <span>↓</span>
              </a>
            </div>
            <div className="landing-proof">
              <span>✦ Made for solo creators</span>
              <span>◉ Film with your phone</span>
              <span>✓ No editing required</span>
            </div>
          </div>
                    <div className="landing-preview">
            <div className="landing-preview-top">
              <span><i /> LIVE PLAN PREVIEW</span>
              <span>SHOOTAI / 001</span>
            </div>

            <div className="landing-preview-content">
              <div className="landing-preview-heading">
                <span>YOUR FILMING PLAN</span>
                <span className="landing-preview-pill">6 SHOTS</span>
              </div>

              <div className="landing-product-scene">
                <div className="landing-scene-grid" />
                <div className="landing-scene-label">PRODUCT SHOWCASE</div>
                <div className="landing-soap-shadow" />
                <div className="landing-soap">
                  <span>JAM</span>
                  <strong>PAPAYA</strong>
                  <small>SOAP · 70G</small>
                </div>
                <div className="landing-scene-corner corner-tl" />
                <div className="landing-scene-corner corner-tr" />
                <div className="landing-scene-corner corner-bl" />
                <div className="landing-scene-corner corner-br" />
                <div className="landing-scene-bottom">
                  <span>SHOT 01 / 06</span>
                  <span>00:02 SEC</span>
                </div>
              </div>

              <div className="landing-shot-detail">
                <div className="landing-shot-number">01</div>
                <div>
                  <span>THE OPENING HOOK</span>
                  <h3>Start with the product.</h3>
                  <p>Place your phone 30 cm from the product. Film a steady, front-facing shot for 2 seconds.</p>
                </div>
              </div>

              <div className="landing-shot-progress">
                <span className="active" />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="landing-preview-footer">
              <span>✳ DIRECTED BY SHOOTAI</span>
              <span>READY TO FILM ↗</span>
            </div>
          </div>
        </section>
                <section className="landing-process" id="how-it-works">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">01 / THE PROCESS</span>
            <h2>From product photo to filming plan.</h2>
            <p>Three simple steps. No production experience needed.</p>
          </div>

          <div className="landing-process-grid">
            <article className="landing-process-card">
              <div className="landing-process-number">01 <span>↗</span></div>
              <div className="landing-process-icon">▧</div>
              <h3>Show us your product.</h3>
              <p>Upload your product photos, add a selling point, and choose your video goal.</p>
              <div className="landing-process-tag">YOUR PRODUCT</div>
            </article>

            <article className="landing-process-card">
              <div className="landing-process-number">02 <span>↗</span></div>
              <div className="landing-process-icon">✳</div>
              <h3>Get your creative direction.</h3>
              <p>ShootAI creates a concept and six practical shots based on your product.</p>
              <div className="landing-process-tag">YOUR FILMING PLAN</div>
            </article>

            <article className="landing-process-card">
              <div className="landing-process-number">03 <span>↗</span></div>
              <div className="landing-process-icon">◎</div>
              <h3>Pick up your phone and film.</h3>
              <p>Follow each shot's camera position, setup, action, and recording instructions.</p>
              <div className="landing-process-tag">YOUR FOOTAGE</div>
            </article>
          </div>
        </section>
                <section className="landing-features" id="features">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">02 / THE EXPERIENCE</span>
            <h2>Less guessing. More filming.</h2>
            <p>Practical direction for every shot, from setup to recording.</p>
          </div>

          <div className="landing-feature-grid">
            <article className="landing-feature-card landing-feature-large">
              <div className="landing-feature-label">01 / CAMERA DIRECTION</div>
              <div className="landing-camera-demo">
                <div className="landing-demo-phone">PHONE</div>
                <div className="landing-demo-arrow">⟶</div>
                <div className="landing-demo-product">PRODUCT</div>
              </div>
              <h3>Know where your phone goes.</h3>
              <p>Get clear camera angles, positioning diagrams, and setup instructions for each shot.</p>
            </article>

            <article className="landing-feature-card">
              <div className="landing-feature-label">02 / PERSONALIZED PLAN</div>
              <div className="landing-feature-symbol">✳</div>
              <h3>Made for your actual product.</h3>
              <p>Your product photos, selling points, and video goal shape the filming plan.</p>
            </article>

            <article className="landing-feature-card">
              <div className="landing-feature-label">03 / STEP-BY-STEP</div>
              <div className="landing-feature-symbol">06<span> SHOTS</span></div>
              <h3>One shot at a time.</h3>
              <p>Follow the setup, movement, timing, and recording instructions as you film.</p>
            </article>
          </div>
        </section>
                <section className="landing-faq" id="faq">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">03 / COMMON QUESTIONS</span>
            <h2>Good questions. Clear answers.</h2>
          </div>

          <div className="landing-faq-list">
            <details>
              <summary>What exactly does ShootAI do?</summary>
              <p>ShootAI turns your product photos and selling points into a practical six-shot filming plan you can follow with your phone.</p>
            </details>
            <details>
              <summary>Does ShootAI generate the video for me?</summary>
              <p>No. ShootAI guides you through filming your own footage. It does not generate or edit videos.</p>
            </details>
            <details>
              <summary>Do I need professional equipment?</summary>
              <p>No. ShootAI is designed for phone-only filming with simple setups.</p>
            </details>
            <details>
              <summary>Can I create videos without showing my face?</summary>
              <p>Yes. Select Without Person when creating your filming plan.</p>
            </details>
          </div>
        </section>

        <section className="landing-final-cta">
          <div className="landing-final-glow" aria-hidden="true" />
          <span className="landing-section-kicker">YOUR NEXT VIDEO STARTS HERE</span>
          <h2>Stop wondering what to film.</h2>
          <p>Upload your product. Get your shot list. Start creating with confidence.</p>
          <button className="landing-primary" onClick={() => setView('create')}>
            Create your filming plan <span>↗</span>
          </button>
        </section>

        <footer className="landing-footer">
          <span className="landing-footer-logo">Shoot<span>AI</span></span>
          <span>Your product. Your phone. Your creative direction.</span>
          <span>© 2026 ShootAI</span>
        </footer>
      </main>
    );
  }
