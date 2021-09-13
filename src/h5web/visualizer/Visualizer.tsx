/* eslint-disable no-console */
import Profiler from '../Profiler';
import type { Entity } from '../providers/models';
import { EntityKind } from '../providers/models';
import type { VisDef } from '../vis-packs/models';
import VisSelector from './VisSelector';
import styles from './Visualizer.module.css';

interface Props<T extends VisDef> {
  entity: Entity;
  activeVis: T | undefined;
  supportedVis: T[];
  onActiveVisChange: (vis: T) => void;
}

function Visualizer<T extends VisDef>(props: Props<T>) {
  const { entity, activeVis, supportedVis, onActiveVisChange } = props;

  if (!activeVis) {
    return (
      <p className={styles.fallback}>
        No visualization available for this entity.
      </p>
    );
  }

  const { Container, Toolbar } = activeVis;

  if (entity.kind === EntityKind.Custom) {
    return (
      <div className={styles.visualizer}>
        <div className={styles.visBar}>{Toolbar && <Toolbar />}</div>
        <div className={styles.displayArea}>
          <Profiler id={activeVis.name}>
            <Container key={entity.path} entity={entity} />
          </Profiler>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={onActiveVisChange}
        />
        {Toolbar && <Toolbar />}
      </div>

      <div className={styles.displayArea}>
        <Profiler id={activeVis.name}>
          <Container key={entity.path} entity={entity} />
        </Profiler>
      </div>
    </div>
  );
}

export default Visualizer;
