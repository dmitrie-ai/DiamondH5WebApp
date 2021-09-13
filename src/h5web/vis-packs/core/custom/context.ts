import React from 'react';
import type { Entity } from 'src/h5web/providers/models';

import create from 'zustand';

interface overlayContextInterface {
  overlayList: Entity[];
  isOverlaying: boolean;
}

export const overlayContext = React.createContext<overlayContextInterface>({
  overlayList: [],
  isOverlaying: false,
});
