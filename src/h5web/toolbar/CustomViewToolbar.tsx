import { MdAspectRatio } from 'react-icons/md';
import ToggleBtn from './controls/ToggleBtn';
import { useState, useEffect } from 'react';
import { useCustomViewConfig } from '../vis-packs/core/custom/config';
import { useHeatmapConfig } from '../vis-packs/core/heatmap/config';

import DomainSlider from './controls/DomainSlider/DomainSlider';
import SnapshotButton from './controls/SnapshotButton';
import Separator from './Separator';
import Toolbar from './Toolbar';
import ColorMapSelector from './controls/ColorMapSelector/ColorMapSelector';
import ScaleSelector from './controls/ScaleSelector/ScaleSelector';
import shallow from 'zustand/shallow';
import GridToggler from './controls/GridToggler';
import OptionList from './controls/Selector/OptionList';
import type { ReactElement } from 'react';
import PubSub from 'pubsub-js';

function CustomViewToolbar() {
  const {
    dataDomain,
    customDomain,
    setCustomDomain,
    colorMap,
    setColorMap,
    scaleType,
    setScaleType,
    layout,
    setLayout,
    showGrid,
    toggleGrid,
    invertColorMap,
    toggleColorMapInversion,
    isOverlaying,
    toggleOverlay,
  } = useCustomViewConfig((state) => state, shallow);

  // anytime the "Overlay" toggle is changed, publish it's value via the event bus.
  useEffect(() => {
    PubSub.publish('toggleOverlay', {
      value: isOverlaying,
    });
  }, [isOverlaying]);

  return (
    <Toolbar>
      {/* Toggles the overlaying on the entities in OVerlayList context */}
      <ToggleBtn
        label="Overlay"
        value={isOverlaying}
        onToggle={toggleOverlay}
      />
      {dataDomain && (
        <DomainSlider
          dataDomain={dataDomain}
          customDomain={customDomain}
          scaleType={scaleType}
          onCustomDomainChange={setCustomDomain}
        />
      )}

      {dataDomain && <Separator />}

      <ColorMapSelector
        value={colorMap}
        onValueChange={setColorMap}
        invert={invertColorMap}
        onInversionChange={toggleColorMapInversion}
      />
      <Separator />
      <ScaleSelector value={scaleType} onScaleChange={setScaleType} />
      <Separator />
      <ToggleBtn
        label="Keep ratio"
        icon={MdAspectRatio}
        value={layout === 'cover'}
        onToggle={() => setLayout(layout === 'cover' ? 'fill' : 'cover')}
      />

      <GridToggler value={showGrid} onToggle={toggleGrid} />

      <Separator />

      <SnapshotButton />
    </Toolbar>
  );
}

export default CustomViewToolbar;
