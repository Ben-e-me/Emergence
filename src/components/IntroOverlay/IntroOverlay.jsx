/**
 * @file IntroOverlay.jsx
 * @description Full-screen narrative intro overlay for the Emergence experience.
 * @architecture
 * - Four story beats: standard → standard → cta → rules, each advancing on click.
 * - Beat 2 (rules) shows an inline 3-column grid instead of a collapsible toggle.
 * - Hint copy is only visible while the user moves the mouse; fades on stop.
 * - Solid dark background throughout; z-index 300 sits above sidebar (100).
 * - Exit: overlay fades out; localStorage flag prevents re-showing.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './IntroOverlay.module.css';
import { VisualDot } from './visuals/VisualDot.jsx';
import { VisualNeurons } from './visuals/VisualNeurons.jsx';
import { VisualRules } from './visuals/VisualRules.jsx';
import { VisualEmergence } from './visuals/VisualEmergence.jsx';
import { VisualEmergenceMask } from './visuals/VisualEmergenceMask.jsx';

export const STORAGE_KEY = 'emergence-intro-seen';

/* ── Rule icons ─────────────────────────────────────────────────────────── */

function BirthIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Centre cell — newly alive */}
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
      {/* Three neighbour cells hinting at the rule */}
      <rect x="1" y="5" width="4" height="4" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="19" y="5" width="4" height="4" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="10" y="1" width="4" height="4" rx="0.75" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function SurvivalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Two neighbours */}
      <rect x="3" y="9" width="5" height="5" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="16" y="9" width="5" height="5" rx="0.75" fill="currentColor" opacity="0.35" />
      {/* Centre cell — surviving */}
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

function DeathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fading cell */}
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.28" />
      {/* X mark */}
      <line
        x1="7"
        y1="7"
        x2="17"
        y2="17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <line
        x1="17"
        y1="7"
        x2="7"
        y2="17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/* ── Data ───────────────────────────────────────────────────────────────── */

const RULES_DATA = [
  {
    title: 'Birth',
    desc: 'A dead cell with exactly 3 live neighbors comes to life.',
    icon: <BirthIcon />,
  },
  {
    title: 'Survival',
    desc: 'A live cell with 2 or 3 live neighbors survives.',
    icon: <SurvivalIcon />,
  },
  {
    title: 'Death',
    desc: 'Any other live cell dies. Any other dead cell stays dead.',
    icon: <DeathIcon />,
  },
];

const BEATS = [
  {
    type: 'standard',
    heading: 'Everything around you\nfollows simple rules.',
    body: 'Gravity pulls. Atoms bond. Physics, chemistry, biology.',
    visual: 'dot',
  },
  {
    type: 'standard',
    heading: 'At scale, simple rules\nproduce unexpected complexity.',
    body: 'A neuron fires when enough neighbors do.',
    visual: 'neurons',
  },
  {
    type: 'cta',
    visual: 'emergence',
  },
  {
    type: 'rules',
    heading: 'In the Game of Life, only three rules\ndirect everything you see.',
    visual: 'rules',
  },
];

const VISUALS = {
  dot: VisualDot,
  neurons: VisualNeurons,
  emergence: VisualEmergence,
  rules: VisualRules,
};

/* ── Component ──────────────────────────────────────────────────────────── */

/** @param {{ onDone: () => void, variant?: 'standard' | 'mask' }} props */
export function IntroOverlay({ onDone, variant = 'standard' }) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const advancingRef = useRef(false);
  const hintTimerRef = useRef(null);

  // Fade in first beat
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Show hint on mouse movement, fade after 1.8 s of inactivity
  const handleMouseMove = useCallback(() => {
    setHintVisible(true);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setHintVisible(false), 1800);
  }, []);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  const doExit = useCallback(() => {
    setIsExiting(true);
    localStorage.setItem(STORAGE_KEY, '1');
    setTimeout(() => onDone(), 800);
  }, [onDone]);

  const advance = (e) => {
    if (e.target.closest('[data-rules-panel]')) return;
    if (advancingRef.current) return;
    advancingRef.current = true;
    setHintVisible(false);
    setVisible(false);

    setTimeout(() => {
      const next = beatIndex + 1;
      if (next < BEATS.length) {
        setBeatIndex(next);
        setVisible(true);
        advancingRef.current = false;
      } else {
        doExit();
        advancingRef.current = false;
      }
    }, 420);
  };

  const handleSkip = (e) => {
    e.stopPropagation();
    doExit();
  };

  const beat = BEATS[beatIndex];
  const Visual = beat ? VISUALS[beat.visual] : null;
  const isLastBeat = beatIndex === BEATS.length - 1;

  /* ── Render helpers ─────────────────────────────────────────────────── */

  function renderHeading(text) {
    return text.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  }

  return (
    <div
      className={`${styles.overlay} ${isExiting ? styles.exit : ''}`}
      onClick={isExiting ? undefined : advance}
      onMouseMove={handleMouseMove}
      role="presentation"
    >
      {/* ── Standard beat ─────────────────────────────────────────────── */}
      {!isExiting && beat?.type === 'standard' && (
        <div className={`${styles.beatContent} ${visible ? styles.beatVisible : ''}`}>
          <div className={styles.visualArea}>
            <Visual />
          </div>
          <div className={styles.textArea}>
            <h2 className={styles.heading}>{renderHeading(beat.heading)}</h2>
            {beat.body && <p className={styles.body}>{beat.body}</p>}
          </div>
        </div>
      )}

      {/* ── CTA beat ──────────────────────────────────────────────────── */}
      {!isExiting && beat?.type === 'cta' && (
        <div
          className={[
            styles.ctaContent,
            variant === 'mask' ? styles.ctaContentMask : '',
            visible ? styles.beatVisible : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.ctaVisual}>
            {variant === 'mask' ? <VisualEmergenceMask /> : <Visual />}
          </div>
          <p className={styles.ctaEyebrow}>This is</p>
          {variant !== 'mask' && <h1 className={styles.ctaTitle}>Emergence</h1>}
        </div>
      )}

      {/* ── Rules beat ────────────────────────────────────────────────── */}
      {!isExiting && beat?.type === 'rules' && (
        <div
          className={`${styles.beatContent} ${styles.beatContentWide} ${visible ? styles.beatVisible : ''}`}
        >
          <div className={styles.visualArea}>
            <Visual />
          </div>
          <div className={styles.textArea}>
            <h2 className={styles.heading}>{renderHeading(beat.heading)}</h2>
            <div className={styles.rulesGrid} data-rules-panel>
              {RULES_DATA.map((rule, i) => (
                <div
                  key={rule.title}
                  className={styles.rulesCol}
                  style={{ animationDelay: `${0.5 + i * 0.35}s` }}
                >
                  <span className={styles.rulesColIcon}>{rule.icon}</span>
                  <span className={styles.rulesColTitle}>{rule.title}</span>
                  <p className={styles.rulesColDesc}>{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Hint ──────────────────────────────────────────────────────── */}
      {!isExiting && (
        <p className={`${styles.hint} ${hintVisible ? styles.hintVisible : ''}`}>
          {isLastBeat ? 'click to begin' : 'click to continue'}
        </p>
      )}

      {/* ── Progress dots ─────────────────────────────────────────────── */}
      {!isExiting && (
        <div className={styles.progress}>
          {BEATS.map((_, i) => (
            <button
              key={i}
              className={[
                styles.progressDot,
                i === beatIndex ? styles.progressDotActive : '',
                i < beatIndex ? styles.progressDotDone : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={
                i < beatIndex
                  ? (e) => {
                      e.stopPropagation();
                      if (advancingRef.current) return;
                      setVisible(false);
                      setTimeout(() => {
                        setBeatIndex(i);
                        setVisible(true);
                      }, 320);
                    }
                  : undefined
              }
              aria-label={i < beatIndex ? `Go to step ${i + 1}` : undefined}
            />
          ))}
        </div>
      )}

      {/* ── Skip ──────────────────────────────────────────────────────── */}
      {!isExiting && (
        <button className={styles.skipButton} onClick={handleSkip}>
          Skip
        </button>
      )}
    </div>
  );
}

/** Returns true if the intro has already been completed. */
export function hasSeenIntro() {
  return localStorage.getItem(STORAGE_KEY) === '1';
}
