/* eslint-disable no-console */
import { useEffect } from 'react';
import CustomViewVis from './CustomViewVis';
import { useCustomViewConfig } from './config';
import type { AxisMapping, ScaleType } from '../models';
import shallow from 'zustand/shallow';

interface Props {
  axisMapping?: AxisMapping;
  title: string;
  colorScaleType?: ScaleType;
}

function MappedCustomViewVis(props: Props) {
  const { axisMapping = [], title, colorScaleType } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    layout,
    showGrid,
    setDataDomain,
    setScaleType,
    invertColorMap,
  } = useCustomViewConfig((state) => state, shallow);

  useEffect(() => {
    if (colorScaleType) {
      setScaleType(colorScaleType);
    }
  }, [setScaleType, colorScaleType]);

  return (
    <CustomViewVis
      title={title}
      colorMap={colorMap}
      scaleType={scaleType}
      layout={layout}
      showGrid={showGrid}
      invertColorMap={invertColorMap}
    />
  );
}

export default MappedCustomViewVis;
