/* eslint-disable no-console */
import { useContext } from 'react';
import { ProviderContext } from '../providers/context';
import { ProviderError } from '../providers/models';
import { getAttributeValue, handleError } from '../utils';
import CorePack from './core/CorePack';
import NexusPack from './nexus/NexusPack';
import { isNxGroup } from './nexus/utils';
import { EntityKind } from 'src/h5web/providers/models';
import type { Entity } from 'src/h5web/providers/models';

interface Props {
  path: string;
}
const customViewPath = '/custom-view';
const customViewEntity: Entity = {
  name: 'custom',
  kind: EntityKind.Custom,
  path: customViewPath,
  attributes: [],
};

function VisPackChooser(props: Props) {
  const { path } = props;

  if (path === customViewPath) {
    return <NexusPack entity={customViewEntity} />;
  }

  if (!('ResizeObserver' in window)) {
    throw new Error(
      "Your browser's version is not supported. Please upgrade to the latest version."
    );
  }

  const { entitiesStore } = useContext(ProviderContext);
  const entity = handleError(
    () => entitiesStore.get(path),
    ProviderError.NotFound,
    `No entity found at ${path}`
  );

  if (
    getAttributeValue(entity, 'default') ||
    getAttributeValue(entity, 'NX_class') === 'NXdata'
  ) {
    return <NexusPack entity={entity} />;
  }

  return <CorePack entity={entity} />;
}

export default VisPackChooser;
