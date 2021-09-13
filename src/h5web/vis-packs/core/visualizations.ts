import {
  FiCode,
  FiGrid,
  FiActivity,
  FiMap,
  FiCpu,
  FiImage,
} from 'react-icons/fi';
import type { Dataset } from '../../providers/models';
import type { VisDef } from '../models';
import { hasImageAttribute } from './utils';
import {
  hasScalarShape,
  hasPrintableType,
  hasArrayShape,
  hasNumericType,
  hasMinDims,
  hasNonNullShape,
  hasComplexType,
} from '../../guards';
import {
  RawVisContainer,
  ScalarVisContainer,
  MatrixVisContainer,
  LineVisContainer,
  HeatmapVisContainer,
  ComplexVisContainer,
  ComplexLineVisContainer,
  RgbVisContainer,
  NxCustomViewContainer,
} from './containers';
import {
  MatrixToolbar,
  LineToolbar,
  HeatmapToolbar,
  ComplexToolbar,
  ComplexLineToolbar,
  RgbToolbar,
  CustomViewToolbar,
} from '../../toolbar/toolbars';
import {
  MatrixConfigProvider,
  LineConfigProvider,
  HeatmapConfigProvider,
  ComplexConfigProvider,
  ComplexLineConfigProvider,
  RgbConfigProvider,
  CustomViewConfigProvider,
} from './configs';

export enum Vis {
  Raw = 'Raw',
  Scalar = 'Scalar',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
  Complex = 'Complex',
  ComplexLine = 'ComplexLine',
  RGB = 'RGB',
  Custom = 'Custom',
}

export interface CoreVisDef extends VisDef {
  supportsDataset: (dataset: Dataset) => boolean;
}

export const CORE_VIS: Record<Vis, CoreVisDef> = {
  [Vis.Raw]: {
    name: Vis.Raw,
    Icon: FiCpu,
    Container: RawVisContainer,
    supportsDataset: hasNonNullShape,
  },

  [Vis.Scalar]: {
    name: Vis.Scalar,
    Icon: FiCode,
    Container: ScalarVisContainer,
    supportsDataset: (dataset) => {
      return hasPrintableType(dataset) && hasScalarShape(dataset);
    },
  },

  [Vis.Matrix]: {
    name: Vis.Matrix,
    Icon: FiGrid,
    Toolbar: MatrixToolbar,
    Container: MatrixVisContainer,
    ConfigProvider: MatrixConfigProvider,
    supportsDataset: (dataset) => {
      return hasPrintableType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Line]: {
    name: Vis.Line,
    Icon: FiActivity,
    Toolbar: LineToolbar,
    Container: LineVisContainer,
    ConfigProvider: LineConfigProvider,
    supportsDataset: (dataset) => {
      return hasNumericType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Heatmap]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: HeatmapVisContainer,
    ConfigProvider: HeatmapConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasNumericType(dataset) &&
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 2)
      );
    },
  },
  [Vis.Custom]: {
    name: Vis.Custom,
    Icon: FiMap,
    Toolbar: CustomViewToolbar,
    Container: NxCustomViewContainer,
    ConfigProvider: CustomViewConfigProvider,
    supportsDataset: () => {
      // so that it isn't used as an available visualisation  for entities when viewing datasets
      return false;
    },
  },

  [Vis.ComplexLine]: {
    name: Vis.Line,
    Icon: FiActivity,
    Toolbar: ComplexLineToolbar,
    Container: ComplexLineVisContainer,
    ConfigProvider: ComplexLineConfigProvider,
    supportsDataset: (dataset) => {
      return hasComplexType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Complex]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Toolbar: ComplexToolbar,
    Container: ComplexVisContainer,
    ConfigProvider: ComplexConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasComplexType(dataset) &&
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 2)
      );
    },
  },

  [Vis.RGB]: {
    name: Vis.RGB,
    Icon: FiImage,
    Toolbar: RgbToolbar,
    Container: RgbVisContainer,
    ConfigProvider: RgbConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasImageAttribute(dataset) &&
        hasArrayShape(dataset) &&
        dataset.shape.length === 3 &&
        hasNumericType(dataset)
      );
    },
  },
};
