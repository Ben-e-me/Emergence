/**
 * @file App.jsx
 * @description Top-level composition for the Emergence experience.
 * @architecture
 * - Canvas fills the full viewport; Sidebar overlays as a fixed panel.
 * - Owns all simulation and UI state, passing callbacks down to Sidebar.
 */
import React, { useEffect, useState } from 'react';
import styles from './App.module.css';
import { LifeCanvas } from '../LifeCanvas/LifeCanvas.jsx';
import { Sidebar } from '../Sidebar/Sidebar.jsx';
import { useGameOfLife } from '../../hooks/useGameOfLife.js';
import { useViewportGrid } from '../../hooks/useViewportGrid.js';
import { useAccentColor } from '../../hooks/useAccentColor.js';
import { randomSeed } from '../../simulation/seeds.js';
import {
  DEFAULT_SPEED_INDEX,
  DEFAULT_ZOOM_INDEX,
  SPEED_STEPS,
  ZOOM_STEPS,
  RULE_CONWAY_CLASSIC,
  RULE_HIGH_LIFE,
  RULE_DEAD_UNIVERSE,
} from '../../constants/simulationConstants.js';

const RULE_MAP = {
  classic: RULE_CONWAY_CLASSIC,
  highlife: RULE_HIGH_LIFE,
  dead: RULE_DEAD_UNIVERSE,
};

export function App() {
  const { width, height, cellSizeCss } = useViewportGrid();
  const [accentColor, setAccentColor] = useAccentColor();

  const [speedIndex, setSpeedIndex] = useState(DEFAULT_SPEED_INDEX);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [activeRuleKey, setActiveRuleKey] = useState('classic');

  const generationsPerSecond = SPEED_STEPS[speedIndex].gps;
  const zoom = ZOOM_STEPS[zoomIndex];
  const activeRule = RULE_MAP[activeRuleKey];

  const { grid, ages, isRunning, historyLength, step, stepBack, toggleRunning, reset } =
    useGameOfLife({ width, height, rule: activeRule, generationsPerSecond, autoStart: true });

  useEffect(() => {
    reset(randomSeed());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRuleChange = (key) => {
    setActiveRuleKey(key);
    reset(randomSeed());
  };

  const handleSpeedChange = (gps) => {
    const idx = SPEED_STEPS.findIndex((s) => s.gps === gps);
    if (idx !== -1) setSpeedIndex(idx);
  };

  const handleZoomChange = (z) => {
    const idx = ZOOM_STEPS.indexOf(z);
    if (idx !== -1) setZoomIndex(idx);
  };

  return (
    <div className={styles.root}>
      <LifeCanvas
        grid={grid}
        ages={ages}
        width={width}
        height={height}
        cellSizeCss={cellSizeCss}
        accentColor={accentColor}
        zoom={zoom}
      />
      <Sidebar
        isRunning={isRunning}
        onToggleRunning={toggleRunning}
        onStep={step}
        onStepBack={stepBack}
        canStepBack={historyLength > 0}
        generationsPerSecond={generationsPerSecond}
        onSpeedChange={handleSpeedChange}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        activeRuleKey={activeRuleKey}
        onRuleChange={handleRuleChange}
        accentColor={accentColor}
        onColorChange={setAccentColor}
      />
    </div>
  );
}
