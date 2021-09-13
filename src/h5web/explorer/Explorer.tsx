/* eslint-disable no-console */
/* eslint-disable no-void */
import { useContext, Suspense } from 'react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';
import EntityList from './EntityList';
import styles from './Explorer.module.css';
import { ProviderContext } from '../providers/context';
import type { Entity } from '../providers/models';
import { EntityKind } from '../providers/models';
import Icon from './Icon';

interface Props {
  selectedPath: string;
  onSelect: (path: string) => void;
}
const customViewPath = '/custom-view';
const customEntity: Entity = {
  name: 'custom',
  path: customViewPath,
  kind: EntityKind.Custom,
  attributes: [],
};
function Explorer(props: Props) {
  const { selectedPath, onSelect } = props;
  const { filename } = useContext(ProviderContext);

  return (
    <div className={styles.explorer} role="tree">
      {/* button showing which .h5 file is opened */}
      <button
        className={styles.fileBtn}
        type="button"
        role="treeitem"
        aria-selected={selectedPath === '/'}
        onClick={() => onSelect('/')}
      >
        <FiFileText className={styles.fileIcon} />{' '}
        {/* small icon to the left */}
        {filename}
      </button>

      {/* React Suspense specifies a "loading" state whilst a request is served, e.g. a spinner */}
      <Suspense
        fallback={
          <FiRefreshCw
            className={styles.spinner}
            aria-label="Loading root metadata..."
          />
        }
      >
        {/* Custom view tab button in explorer */}
        <button
          className={styles.btn}
          type="button"
          role="treeitem"
          aria-selected={selectedPath === customViewPath}
          aria-expanded={undefined}
          onClick={() => onSelect(customViewPath)}
        >
          <Icon entity={customEntity} isExpanded={false} />
          Custom
        </button>
        {/* displays .h5 file data underneath the button showing the .h5 file currently opened */}
        <EntityList
          level={0}
          parentPath="/"
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      </Suspense>
    </div>
  );
}

export default Explorer;
