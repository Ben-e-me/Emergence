/**
 * @file Sidebar.jsx
 * @description Hover-triggered control panel overlay for the Emergence experience.
 * @architecture
 * - A small hover zone near the collapsed panel triggers expansion.
 * - Collapsed: compact header (title + burger icon). Expanded: glass panel with sections.
 * - Sections animate in top-to-bottom with staggered bezier transitions.
 * - Sections: Zoom, Time, Rule, Color (with HSB picker overlay).
 */
import React, { useRef, useState } from 'react';
import styles from './Sidebar.module.css';
import {
  SPEED_STEPS,
  DEFAULT_SPEED_INDEX,
  ZOOM_STEPS,
  DEFAULT_ZOOM_INDEX,
  RULE_CONWAY_CLASSIC,
  RULE_HIGH_LIFE,
  RULE_DEAD_UNIVERSE,
} from '../../constants/simulationConstants.js';

// ─── Color utilities ──────────────────────────────────────────────────────────

function hexToHsb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return {
    h: Math.round(h * 360),
    s: max === 0 ? 0 : Math.round((d / max) * 100),
    b: Math.round(max * 100),
  };
}

function hsbToHex(h, s, b) {
  const sv = s / 100;
  const bv = b / 100;
  const c = bv * sv;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = bv - c;
  let r = 0,
    g = 0,
    bl = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    bl = x;
  } else if (h < 240) {
    g = x;
    bl = c;
  } else if (h < 300) {
    r = x;
    bl = c;
  } else {
    r = c;
    bl = x;
  }
  const toHex = (n) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

/** Returns '#000000' or '#ffffff' for best contrast against a hex color. */
function getContrastColor(hex) {
  if (!hex || hex.length < 7) return '#ffffff';
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 0.55 ? '#000000' : '#ffffff';
}

/** Formats a zoom factor as a label string (e.g. 0.25 → '0.25×', 4 → '4×'). */
function formatZoomLabel(zoom) {
  if (zoom >= 1) return `${Math.round(zoom)}×`;
  return `${zoom}×`;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="5" width="18" height="2" rx="1" />
      <rect x="3" y="11" width="18" height="2" rx="1" />
      <rect x="3" y="17" width="18" height="2" rx="1" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
      aria-hidden="true"
    >
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}

function IconStepForward() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="4,4 15,12 4,20" />
      <rect x="17" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function IconStepBack() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="20,4 9,12 20,20" />
      <rect x="3" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function IconSlower() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="15,5 7,12 15,19" />
      <polygon points="21,5 13,12 21,19" />
    </svg>
  );
}

function IconFaster() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="9,5 17,12 9,19" />
      <polygon points="3,5 11,12 3,19" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4" y="11" width="16" height="3" rx="1.5" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4" y="11" width="16" height="3" rx="1.5" />
      <rect x="11" y="4" width="3" height="16" rx="1.5" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.8 0 1.5-.7 1.5-1.5 0-.4-.1-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16c2.8 0 5-2.2 5-5 0-4.4-4-8-9-8zm-5.5 9c-.8 0-1.5-.7-1.5-1.5S5.7 8 6.5 8 8 8.7 8 9.5 7.3 11 6.5 11zm3-4C8.7 7 8 6.3 8 5.5S8.7 4 9.5 4 11 4.7 11 5.5 10.3 7 9.5 7zm5 0c-.8 0-1.5-.7-1.5-1.5S13.7 4 14.5 4 16 4.7 16 5.5 15.3 7 14.5 7zm3 4c-.8 0-1.5-.7-1.5-1.5S16.7 8 17.5 8 19 8.7 19 9.5 18.3 11 17.5 11z" />
    </svg>
  );
}

function IconRuleClassic() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="2" y="10" width="5" height="5" rx="1" />
      <rect x="9" y="10" width="5" height="5" rx="1" />
      <rect x="17" y="10" width="5" height="5" rx="1" />
    </svg>
  );
}

function IconRuleHighLife() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="9" y="3" width="5" height="5" rx="1" />
      <rect x="15" y="9" width="5" height="5" rx="1" />
      <rect x="3" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="15" width="5" height="5" rx="1" />
      <rect x="3" y="15" width="5" height="5" rx="1" />
    </svg>
  );
}

function IconRuleDead() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="5" height="5" rx="1" opacity="0.4" />
      <rect x="16" y="3" width="5" height="5" rx="1" opacity="0.4" />
      <rect x="3" y="16" width="5" height="5" rx="1" opacity="0.4" />
      <rect x="16" y="16" width="5" height="5" rx="1" opacity="0.4" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const RULE_PRESETS = [
  {
    key: 'classic',
    label: 'Classic',
    rule: RULE_CONWAY_CLASSIC,
    description: 'The original. Simple rules, infinite complexity.',
    Icon: IconRuleClassic,
  },
  {
    key: 'highlife',
    label: 'HighLife',
    rule: RULE_HIGH_LIFE,
    description: 'Birth at 6 neighbors. Replicators emerge.',
    Icon: IconRuleHighLife,
  },
  {
    key: 'dead',
    label: 'Dead',
    rule: RULE_DEAD_UNIVERSE,
    description: 'Nothing survives. Watch it collapse.',
    Icon: IconRuleDead,
  },
];

const ACCENT_SWATCHES = [
  { color: '#7b61ff', label: 'Violet' },
  { color: '#00d4aa', label: 'Teal' },
  { color: '#ffffff', label: 'White' },
  { color: '#D0FF00', label: 'Lime' },
];

// ─── HSB Color Picker Overlay ─────────────────────────────────────────────────

function HsbColorPicker({ currentColor, onApply, onClose }) {
  const initial = hexToHsb(
    currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : '#7b61ff',
  );
  const [h, setH] = useState(initial.h);
  const [s, setS] = useState(initial.s);
  const [bv, setBv] = useState(initial.b);
  const [hexInput, setHexInput] = useState(currentColor);
  const [hexError, setHexError] = useState(false);

  const previewColor = hsbToHex(h, s, bv);

  const syncFromHsb = (nh, ns, nb) => {
    const hex = hsbToHex(nh, ns, nb);
    setHexInput(hex);
    setHexError(false);
  };

  const handleHChange = (v) => {
    const n = Number(v);
    setH(n);
    syncFromHsb(n, s, bv);
  };
  const handleSChange = (v) => {
    const n = Number(v);
    setS(n);
    syncFromHsb(h, n, bv);
  };
  const handleBChange = (v) => {
    const n = Number(v);
    setBv(n);
    syncFromHsb(h, s, n);
  };

  const handleHexChange = (val) => {
    const full = val.startsWith('#') ? val : `#${val}`;
    setHexInput(full);
    if (/^#[0-9a-fA-F]{6}$/.test(full)) {
      const parsed = hexToHsb(full);
      setH(parsed.h);
      setS(parsed.s);
      setBv(parsed.b);
      setHexError(false);
    } else {
      setHexError(val.length > 0);
    }
  };

  const hueGradient =
    'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))';
  const satGradient = `linear-gradient(to right, ${hsbToHex(h, 0, bv)}, ${hsbToHex(h, 100, bv)})`;
  const briGradient = `linear-gradient(to right, #000000, ${hsbToHex(h, s, 100)})`;

  const applyHoverBg = previewColor;
  const applyHoverText = getContrastColor(previewColor);

  return (
    <div className={styles.overlayBackdrop} onClick={onClose}>
      <div className={styles.overlayPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.overlayHeader}>
          <span className={styles.overlayTitle}>Custom color</span>
          <button className={styles.iconBtnSm} onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <div className={styles.colorPreview} style={{ background: previewColor }} />

        <div className={styles.sliderGroup}>
          <span className={styles.sliderLabel}>Hue</span>
          <div className={styles.sliderWrapper}>
            <div className={styles.sliderTrack} style={{ '--track-bg': hueGradient }} />
            <input
              className={styles.hsbSlider}
              type="range"
              min={0}
              max={360}
              value={h}
              onChange={(e) => handleHChange(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.sliderGroup}>
          <span className={styles.sliderLabel}>Saturation</span>
          <div className={styles.sliderWrapper}>
            <div className={styles.sliderTrack} style={{ '--track-bg': satGradient }} />
            <input
              className={styles.hsbSlider}
              type="range"
              min={0}
              max={100}
              value={s}
              onChange={(e) => handleSChange(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.sliderGroup}>
          <span className={styles.sliderLabel}>Brightness</span>
          <div className={styles.sliderWrapper}>
            <div className={styles.sliderTrack} style={{ '--track-bg': briGradient }} />
            <input
              className={styles.hsbSlider}
              type="range"
              min={0}
              max={100}
              value={bv}
              onChange={(e) => handleBChange(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.hexRow}>
          <span className={styles.hexHash}>#</span>
          <input
            className={`${styles.hexInput} ${hexError ? styles.hexInputError : ''}`}
            type="text"
            value={hexInput.replace('#', '')}
            maxLength={6}
            placeholder="7b61ff"
            onChange={(e) => handleHexChange(e.target.value)}
            onFocus={(e) => {
              setHexInput('');
              setHexError(false);
              e.target.value = '';
            }}
            onBlur={() => {
              if (!hexInput || hexInput === '#') setHexInput(previewColor);
            }}
            spellCheck={false}
          />
        </div>

        <button
          className={styles.applyBtn}
          style={{ '--apply-hover-bg': applyHoverBg, '--apply-hover-text': applyHoverText }}
          onClick={() => {
            onApply(previewColor);
            onClose();
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// ─── Animated burger/close button ─────────────────────────────────────────────

function MenuToggle({ isExpanded }) {
  return (
    <span className={styles.menuToggle}>
      <span className={`${styles.menuToggleFrame} ${!isExpanded ? styles.menuToggleActive : ''}`}>
        <IconMenu />
      </span>
      <span className={`${styles.menuToggleFrame} ${isExpanded ? styles.menuToggleActive : ''}`}>
        <IconClose />
      </span>
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children, animIndex }) {
  return (
    <div className={styles.section} style={{ '--anim-index': animIndex }}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLine} />
        <span className={styles.sectionTitle}>{title}</span>
        <div className={styles.sectionLine} />
      </div>
      {children}
    </div>
  );
}

// ─── Value label with hover-to-reset ─────────────────────────────────────────

function ResetLabel({ value, defaultValue, onReset }) {
  const [hovered, setHovered] = useState(false);
  const isDefault = value === defaultValue;
  return (
    <span
      className={styles.resetLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && !isDefault ? (
        <button className={styles.resetBtn} onClick={onReset}>
          reset
        </button>
      ) : (
        value
      )}
    </span>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  isRunning,
  onToggleRunning,
  onStep,
  onStepBack,
  canStepBack,
  generationsPerSecond,
  onSpeedChange,
  zoom,
  onZoomChange,
  activeRuleKey,
  onRuleChange,
  accentColor,
  onColorChange,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [stepFwdHovered, setStepFwdHovered] = useState(false);
  const [stepBackHovered, setStepBackHovered] = useState(false);
  const closeTimerRef = useRef(null);
  const closeAnimTimerRef = useRef(null);

  const speedIndex =
    SPEED_STEPS.findIndex((s) => s.gps === generationsPerSecond) ?? DEFAULT_SPEED_INDEX;
  const zoomIndex = ZOOM_STEPS.indexOf(zoom) ?? DEFAULT_ZOOM_INDEX;

  const canSlower = speedIndex > 0;
  const canFaster = speedIndex < SPEED_STEPS.length - 1;
  const canZoomOut = zoomIndex > 0;
  const canZoomIn = zoomIndex < ZOOM_STEPS.length - 1;

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (closeAnimTimerRef.current) {
      clearTimeout(closeAnimTimerRef.current);
      closeAnimTimerRef.current = null;
    }
    setIsClosing(false);
    setIsExpanded(true);
  };
  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(true);
      closeAnimTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
        setIsClosing(false);
      }, 380);
    }, 120);
  };

  // Auto-pause then step — "one-way" (only play button resumes)
  const handleStepForward = () => {
    if (isRunning) onToggleRunning();
    onStep();
  };
  const handleStepBack = () => {
    if (isRunning) onToggleRunning();
    onStepBack();
  };

  const currentZoomLabel = formatZoomLabel(zoom);
  const defaultZoomLabel = formatZoomLabel(ZOOM_STEPS[DEFAULT_ZOOM_INDEX]);
  const currentSpeedLabel = SPEED_STEPS[speedIndex]?.label ?? '1×';
  const defaultSpeedLabel = SPEED_STEPS[DEFAULT_SPEED_INDEX].label;

  // Step button icons: show pause hint while running + hovered
  const stepFwdIcon = stepFwdHovered && isRunning ? <IconPause /> : <IconStepForward />;
  const stepBackIcon = stepBackHovered && isRunning ? <IconPause /> : <IconStepBack />;

  // Step button CSS classes based on running state + hover
  const stepFwdClass = [
    styles.iconBtn,
    isRunning ? (stepFwdHovered ? styles.stepBtnHint : styles.stepBtnDimmed) : '',
  ]
    .filter(Boolean)
    .join(' ');
  const stepBackClass = [
    styles.iconBtn,
    isRunning ? (stepBackHovered ? styles.stepBtnHint : styles.stepBtnDimmed) : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Hover trigger zone — only active when sidebar is collapsed */}
      {!isExpanded && (
        <div
          className={styles.hoverZone}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.logoTitle}>Emergence</span>
          <button
            className={styles.menuBtn}
            onClick={() => setIsExpanded((v) => !v)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <MenuToggle isExpanded={isExpanded} />
          </button>
        </div>

        {/* Expanded sections — kept in DOM during close animation */}
        {(isExpanded || isClosing) && (
          <div className={`${styles.sections} ${isClosing ? styles.sectionsClosing : ''}`}>
            {/* Zoom */}
            <Section title="Zoom" animIndex={0}>
              <div className={styles.tripleRow}>
                <button
                  className={styles.iconBtn}
                  onClick={() => onZoomChange(ZOOM_STEPS[zoomIndex - 1])}
                  disabled={!canZoomOut}
                  aria-label="Zoom out"
                >
                  <IconMinus />
                </button>
                <ResetLabel
                  value={currentZoomLabel}
                  defaultValue={defaultZoomLabel}
                  onReset={() => onZoomChange(ZOOM_STEPS[DEFAULT_ZOOM_INDEX])}
                />
                <button
                  className={styles.iconBtn}
                  onClick={() => onZoomChange(ZOOM_STEPS[zoomIndex + 1])}
                  disabled={!canZoomIn}
                  aria-label="Zoom in"
                >
                  <IconPlus />
                </button>
              </div>
            </Section>

            {/* Time */}
            <Section title="Time" animIndex={1}>
              <div className={styles.speedLabelRow}>
                <ResetLabel
                  value={currentSpeedLabel}
                  defaultValue={defaultSpeedLabel}
                  onReset={() => onSpeedChange(SPEED_STEPS[DEFAULT_SPEED_INDEX].gps)}
                />
              </div>
              <div className={styles.timeRow}>
                <button
                  className={styles.iconBtn}
                  onClick={() => onSpeedChange(SPEED_STEPS[speedIndex - 1].gps)}
                  disabled={!canSlower}
                  aria-label="Slower"
                >
                  <IconSlower />
                </button>
                <button
                  className={stepBackClass}
                  onMouseEnter={() => setStepBackHovered(true)}
                  onMouseLeave={() => setStepBackHovered(false)}
                  onClick={handleStepBack}
                  disabled={!isRunning && !canStepBack}
                  aria-label="Step back"
                >
                  {stepBackIcon}
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.iconBtnPrimary}`}
                  onClick={onToggleRunning}
                  aria-label={isRunning ? 'Pause' : 'Play'}
                >
                  {isRunning ? <IconPause /> : <IconPlay />}
                </button>
                <button
                  className={stepFwdClass}
                  onMouseEnter={() => setStepFwdHovered(true)}
                  onMouseLeave={() => setStepFwdHovered(false)}
                  onClick={handleStepForward}
                  aria-label="Step forward"
                >
                  {stepFwdIcon}
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={() => onSpeedChange(SPEED_STEPS[speedIndex + 1].gps)}
                  disabled={!canFaster}
                  aria-label="Faster"
                >
                  <IconFaster />
                </button>
              </div>
            </Section>

            {/* Rule */}
            <Section title="Rule" animIndex={2}>
              <div className={styles.ruleList}>
                {RULE_PRESETS.map(({ key, label, description, Icon }) => (
                  <button
                    key={key}
                    className={`${styles.ruleBtn} ${activeRuleKey === key ? styles.ruleBtnActive : ''}`}
                    onClick={() => onRuleChange(key)}
                  >
                    <span className={styles.ruleBtnIcon}>
                      <Icon />
                    </span>
                    <span className={styles.ruleBtnContent}>
                      <span className={styles.ruleBtnLabel}>{label}</span>
                      <span className={styles.ruleBtnDesc}>{description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Color */}
            <Section title="Color" animIndex={3}>
              <div className={styles.swatchRow}>
                {ACCENT_SWATCHES.map(({ color, label }) => (
                  <button
                    key={color}
                    className={`${styles.swatch} ${accentColor === color ? styles.swatchActive : ''}`}
                    style={{ '--swatch-color': color }}
                    onClick={() => onColorChange(color)}
                    aria-label={label}
                    title={label}
                  />
                ))}
                <button
                  className={styles.swatchCustom}
                  onClick={() => setShowColorPicker(true)}
                  aria-label="Custom color"
                  title="Custom color"
                >
                  <IconPalette />
                </button>
              </div>
            </Section>
          </div>
        )}
      </aside>

      {showColorPicker && (
        <HsbColorPicker
          currentColor={accentColor}
          onApply={onColorChange}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </>
  );
}
