import { CSSProperties, Suspense, useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import styles from './Explorer.module.css';
import Icon from './Icon';
import { hasArrayShape, isDataset, isGroup } from '../guards';
import type { Entity } from '../providers/models';
import EntityList from './EntityList';
import { useToggle } from '@react-hookz/web';
import { isNxGroup } from '../vis-packs/nexus/utils';
import PubSub from 'pubsub-js';

interface Props {
  path: string;
  entity: Entity;
  level: number;
  selectedPath: string;
  onSelect: (path: string) => void;
}

function EntityItem(props: Props) {
  const { path, entity, level, selectedPath, onSelect } = props;
  const isSelected = path === selectedPath;
  const [isSelectedForOverlay, toggleSelectedForOverlay] = useToggle(false);
  const [isExpanded, toggleExpanded] = useToggle(false);

  useEffect(() => {
    if (
      isGroup(entity) &&
      (selectedPath === path || selectedPath.startsWith(`${path}/`))
    ) {
      // If group is selected or is parent of selected entity, expand it
      toggleExpanded(true);
    }
  }, [entity, path, selectedPath, toggleExpanded]);
  let isArray = false;
  if (isDataset(entity) && hasArrayShape(entity)) {
    isArray = true;
  }
  // For the Image overlay feature. Called when a checkbox is interacted with
  function AddToOverlay() {
    console.log('clicked checkbox');
    PubSub.publish('addToOverlayList', {
      entity,
      isAdded: !isSelectedForOverlay,
    });
    toggleSelectedForOverlay(!isSelectedForOverlay);
  }

  return (
    <li
      className={styles.entity}
      style={{ '--level': level } as CSSProperties}
      role="none"
    >
      <button
        className={styles.btn}
        type="button"
        role="treeitem"
        aria-expanded={isGroup(entity) ? isExpanded : undefined}
        aria-selected={isSelected}
        onClick={() => {
          // Expand if collapsed; collapse is expanded and selected
          if (isGroup(entity) && (!isExpanded || isSelected)) {
            toggleExpanded();
          }

          onSelect(path);
        }}
      >
        <Icon entity={entity} isExpanded={isExpanded} />
        {entity.name}
        {isArray ? (
          <input
            type="checkbox"
            id="scales"
            name="overlay"
            onInput={AddToOverlay}
            checked={isSelectedForOverlay}
          />
        ) : null}
        {isNxGroup(entity) && (
          <span className={styles.nx} aria-label=" (NeXus group)">
            NX
          </span>
        )}
      </button>

      {isGroup(entity) && isExpanded && (
        <Suspense
          fallback={
            <FiRefreshCw
              className={styles.spinner}
              aria-label="Loading group metadata..."
            />
          }
        >
          <EntityList
            level={level + 1}
            parentPath={path}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        </Suspense>
      )}
    </li>
  );
}

export default EntityItem;
