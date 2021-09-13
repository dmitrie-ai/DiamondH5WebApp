/* eslint-disable no-console */
import { useState, Suspense, useEffect, useRef, useContext } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import Explorer from './explorer/Explorer';
import MetadataViewer from './metadata-viewer/MetadataViewer';
import styles from './App.module.css';
import BreadcrumbsBar from './breadcrumbs/BreadcrumbsBar';
import VisPackChooser from './vis-packs/VisPackChooser';
import { assertAbsolutePath } from './guards';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './visualizer/ErrorFallback';
import LoadingFallback from './LoadingFallback';
import VisConfigProvider from './VisConfigProvider';
import PubSub from 'pubsub-js';
import type { Entity } from './providers/models';
import { overlayContext } from './vis-packs/core/custom/context';

const DEFAULT_PATH = process.env.REACT_APP_DEFAULT_PATH || '/';
assertAbsolutePath(DEFAULT_PATH);

function App() {
  const [selectedPath, setSelectedPath] = useState<string>(DEFAULT_PATH);
  const [isExplorerOpen, setExplorerOpen] = useState(true);
  const [isInspecting, setInspecting] = useState(false);
  const [isOverlaying, setIsOverlaying] = useState<boolean>(false);
  const overlayList = useRef<Entity[]>([]);

  useEffect(() => {
    PubSub.subscribe('addToOverlayList', manageOverlays);
  }, []); // for overlay feature. Event bus for the checkboxes. Subscribe on mount
  useEffect(() => {
    PubSub.subscribe('toggleOverlay', toggleOverlay);
  }, []); // for overlay feature. Event bus for the "Overlay" toggle. Subscribe on mount

  function getNewList( // for overlay feature. Adds or removes an entity from the list of overlays
    oldList: Entity[],
    data: { entity: Entity; isAdded: boolean }
  ): Entity[] {
    const { entity, isAdded } = data;
    if (isAdded) {
      return [...oldList, entity];
    }
    const newList: Entity[] = [];
    oldList.forEach((en) => {
      if (entity.name !== en.name) {
        newList.push(en);
      }
    });
    return newList;
  }

  function manageOverlays(
    _msg: string,
    data: { entity: Entity; isAdded: boolean }
  ) {
    overlayList.current = getNewList(overlayList.current, data);
  }

  // toggle overlay button
  function toggleOverlay(_msg: string, data: { value: boolean }) {
    setIsOverlaying(data.value);
  }

  return (
    <ReflexContainer className={styles.root} orientation="vertical">
      {/* left container where explorer is */}
      <ReflexElement
        className={styles.explorer}
        style={{ display: isExplorerOpen ? undefined : 'none' }}
        flex={25}
        minSize={150}
      >
        {/* explorer component */}
        <Explorer selectedPath={selectedPath} onSelect={setSelectedPath} />{' '}
      </ReflexElement>
      {/* splitter between left and right */}
      <ReflexSplitter
        style={{ display: isExplorerOpen ? undefined : 'none' }}
      />
      {/* main(graphing) area container */}
      <ReflexElement className={styles.mainArea} flex={75} minSize={500}>
        {/* bar on top of graphing area with current location displayed and Display/Inspect */}
        <BreadcrumbsBar
          path={selectedPath}
          isExplorerOpen={isExplorerOpen}
          isInspecting={isInspecting}
          onToggleExplorer={() => setExplorerOpen(!isExplorerOpen)}
          onChangeInspecting={setInspecting}
          onSelectPath={setSelectedPath}
        />
        {/* area with toolbar and graph area below*/}
        <VisConfigProvider>
          <ErrorBoundary
            resetKeys={[selectedPath, isInspecting]}
            FallbackComponent={ErrorFallback}
          >
            <Suspense
              fallback={<LoadingFallback isInspecting={isInspecting} />}
            >
              {isInspecting ? (
                <MetadataViewer
                  path={selectedPath}
                  onSelectPath={setSelectedPath}
                />
              ) : (
                <overlayContext.Provider
                  // context holds the list of entities to be overlayed and the value of the "Toggle overlay" toggle
                  // this context is used by CustomViewVis where the graphs are drawn
                  value={{ overlayList: overlayList.current, isOverlaying }}
                >
                  <VisPackChooser path={selectedPath} />
                </overlayContext.Provider>
              )}
            </Suspense>
          </ErrorBoundary>
        </VisConfigProvider>
      </ReflexElement>
    </ReflexContainer>
  );
}

export default App;
