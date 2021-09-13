import type { FetchStore } from 'react-suspense-fetch';
import {
  assertGroupWithChildren,
  assertStr,
  hasComplexType,
  hasMinDims,
  hasNumDims,
  isGroup,
} from '../../guards';
import { Entity, ProviderError } from '../../providers/models';
import { buildEntityPath, getAttributeValue, handleError } from '../../utils';
import type { VisDef } from '../models';
import { NxInterpretation } from './models';
import { findSignalDataset, isNxDataGroup } from './utils';
import { NexusVis, NEXUS_VIS } from './visualizations';
import { EntityKind } from 'src/h5web/providers/models';

export function getDefaultEntity(
  entity: Entity,
  entitiesStore: FetchStore<Entity, string>
): Entity {
  const defaultPath = getAttributeValue(entity, 'default');
  if (defaultPath === undefined) {
    return entity;
  }

  assertStr(defaultPath, `Expected 'default' attribute to be a string`);
  const path = defaultPath.startsWith('/')
    ? defaultPath
    : buildEntityPath(entity.path, defaultPath);

  const defaultEntity = handleError(
    () => entitiesStore.get(path),
    ProviderError.NotFound,
    `No entity found at NeXus default path "${path}"`
  );

  return getDefaultEntity(defaultEntity, entitiesStore);
}

export function getSupportedVis(entity: Entity): VisDef | undefined {
  if (entity.kind === 'custom') {
    return NEXUS_VIS[NexusVis.NxCustomView];
  }
  if (!isGroup(entity) || !isNxDataGroup(entity)) {
    return undefined;
  }

  assertGroupWithChildren(entity);
  const dataset = findSignalDataset(entity);
  const isCplx = hasComplexType(dataset);
  const interpretation = getAttributeValue(dataset, 'interpretation');

  if (
    interpretation === NxInterpretation.RGB &&
    hasNumDims(dataset, 3) &&
    !isCplx
  ) {
    return NEXUS_VIS[NexusVis.NxRGB];
  }

  const imageVis = isCplx ? NexusVis.NxComplexImage : NexusVis.NxImage;
  const spectrumVis = isCplx ? NexusVis.NxComplexSpectrum : NexusVis.NxSpectrum;

  if (interpretation === NxInterpretation.Image) {
    return NEXUS_VIS[imageVis];
  }

  if (interpretation === NxInterpretation.Spectrum) {
    return NEXUS_VIS[spectrumVis];
  }

  return NEXUS_VIS[hasMinDims(dataset, 2) ? imageVis : spectrumVis];
}
