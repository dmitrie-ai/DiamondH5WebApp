/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import type { ReactNode } from 'react';
import type { NdArray } from 'ndarray';
import styles from '../heatmap/HeatmapVis.module.css';
import ColorBar from '../heatmap/ColorBar';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { getDims, getVisDomain } from './utils';
import { Domain, ScaleType, AxisParams } from '../models';
import { CurveType } from '../line/models';
import { useContext } from 'react';
import type { ColorMap, Layout } from './models';
import { assertDefined } from '../../../guards';
import HeatmapMesh from '../heatmap/HeatmapMesh';
import { getAxisValues } from 'src/h5web/vis-packs/core/custom/utils';
import {
  getBounds,
  getValidDomainForScale,
} from 'src/h5web/vis-packs/core/utils';
import { getSafeDomain } from 'src/h5web/vis-packs/core/heatmap/utils';
import DataCurve from '../line/DataCurve';
import { overlayContext } from './context';

interface Props {
  colorMap?: ColorMap;
  scaleType?: ScaleType;
  layout?: Layout;
  showGrid?: boolean;
  title?: string;
  invertColorMap?: boolean;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
  alphaArray?: NdArray;
  alphaDomain?: Domain;
  flipYAxis?: boolean;
  children?: ReactNode;
}
// Where entities in OverlayList are drawn
function CustomViewVis(props: Props) {
  const {
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    layout = 'cover',
    showGrid = false,
    invertColorMap = false,
    title,
    abscissaParams = {},
    ordinateParams = {},
    alphaArray,
    alphaDomain,
    flipYAxis,
    children,
  } = props;
  const { label: abscissaLabel, value: abscissaValue } = abscissaParams;
  const { label: ordinateLabel, value: ordinateValue } = ordinateParams;
  const { overlayList, isOverlaying } = useContext(overlayContext);

  if (isOverlaying) {
    return toggleOverlay();
  }
  return (
    <figure
      className={styles.root}
      aria-labelledby="vis-title"
      data-keep-canvas-colors
    />
  );
  function toggleOverlay() {
    if (overlayList.length === 0) {
      return (
        <figure
          className={styles.root}
          aria-labelledby="vis-title"
          data-keep-canvas-colors
        />
      );
    }

    return renderOverlay(overlayList);
  }
  function renderOverlay(overlayList: any[]) {
    // configure the axis based on the first entity
    // Not a good way. Probably better to configure the axis based on the biggest domain in the list of entities
    const [firstEntity, rest] = overlayList;
    const valuesArray: number[] = firstEntity.value.flat();
    const { rows, cols } = getDims(firstEntity);
    const dimMapping = [rows, cols];
    const slicedDims = [rows, cols];
    const dataDomain = getValidDomainForScale(
      getBounds(valuesArray),
      scaleType
    ) as Domain;
    const abscissas = getAxisValues(abscissaValue, cols);
    const visDomain = getVisDomain([null, null], dataDomain);
    const [safeDomain] = getSafeDomain(visDomain, dataDomain, scaleType);
    const abscissaDomain = getValidDomainForScale(
      getBounds(abscissas),
      scaleType
    ) as Domain;

    assertDefined(abscissaDomain, 'Abscissas have undefined domain');

    const ordinates = getAxisValues(ordinateValue, rows);
    const ordinateDomain = getValidDomainForScale(
      getBounds(ordinates),
      scaleType
    ) as Domain;
    assertDefined(ordinateDomain, 'Ordinates have undefined domain');
    const graphComponents: any[] = [];
    overlayList.forEach((entity) => {
      const dataArray = entity.value;
      // if the entity is a heatmap
      if (entity.shape.length === 2) {
        graphComponents.push(
          <HeatmapMesh
            rows={rows}
            cols={cols}
            values={valuesArray}
            domain={safeDomain}
            colorMap={colorMap}
            invertColorMap={invertColorMap}
            scaleType={scaleType}
            alphaValues={Array.from({ length: 820 }, () => 1)} // need to add slider for the opacity of each overlay
            alphaDomain={[0, 1]}
            transparent
          />
        );
      } else {
        // if the entity is a scatter or line graph
        graphComponents.push(
          <DataCurve
            abscissas={Array.from({ length: entity.shape[0] }, (_, i) => i++)}
            ordinates={dataArray}
            color="black"
            curveType={CurveType.LineAndGlyphs}
          />
        );
      }
    });

    return (
      <figure
        className={styles.root}
        aria-labelledby="vis-title"
        data-keep-canvas-colors
      >
        <VisCanvas
          title={title}
          aspectRatio={layout === 'contain' ? cols / rows : undefined}
          visRatio={layout === 'cover' ? cols / rows : undefined}
          abscissaConfig={{
            visDomain: abscissaDomain,
            showGrid,
            isIndexAxis: !abscissaValue,
            label: abscissaLabel,
          }}
          ordinateConfig={{
            visDomain: ordinateDomain,
            showGrid,
            isIndexAxis: !ordinateValue,
            label: ordinateLabel,
            flip: flipYAxis,
          }}
        >
          <PanZoomMesh />
          {graphComponents}

          {children}
        </VisCanvas>
        <ColorBar
          domain={safeDomain}
          scaleType={scaleType}
          colorMap={colorMap}
          invertColorMap={invertColorMap}
          withBounds
        />
      </figure>
    );
  }
}

export type { Props as CustomViewVisProps };
export default CustomViewVis;
// To Do:
// IMprove VisCanvas config selection based on entities in the OVerlayList
// Add opacity slider for each entity
// Add ability to change order of overlay
