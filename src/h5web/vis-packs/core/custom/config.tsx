import create from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorMap, Layout } from './models';
import { CustomDomain, Domain, ScaleType } from '../models';
import { useState } from 'react';
import type { ConfigProviderProps } from '../../models';
import createContext from 'zustand/context';

interface CustomViewConfig {
  dataDomain: Domain | undefined;
  setDataDomain: (dataDomain: Domain) => void;

  customDomain: CustomDomain;
  setCustomDomain: (customDomain: CustomDomain) => void;

  colorMap: ColorMap;
  setColorMap: (colorMap: ColorMap) => void;

  invertColorMap: boolean;
  toggleColorMapInversion: () => void;

  scaleType: ScaleType;
  setScaleType: (scaleType: ScaleType) => void;

  showGrid: boolean;
  toggleGrid: () => void;

  layout: Layout;
  setLayout: (layout: Layout) => void;

  isOverlaying: boolean;
  toggleOverlay: () => void;
}

function createStore() {
  // create zustand context and persists it(saves to local storage )
  return create<CustomViewConfig>(
    persist(
      (set, get) => ({
        dataDomain: undefined,
        setDataDomain: (dataDomain: Domain) => set({ dataDomain }),

        customDomain: [null, null],
        setCustomDomain: (customDomain: CustomDomain) => set({ customDomain }),

        colorMap: 'Viridis',
        setColorMap: (colorMap: ColorMap) => set({ colorMap }),

        invertColorMap: false,
        toggleColorMapInversion: () => {
          set((state) => ({ invertColorMap: !state.invertColorMap }));
        },

        scaleType: ScaleType.Linear,
        setScaleType: (scaleType: ScaleType) => {
          if (scaleType !== get().scaleType) {
            set(() => ({ scaleType, dataDomain: undefined })); // clear `dataDomain` to avoid stale state
          }
        },

        showGrid: true,
        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
        isOverlaying: false,
        toggleOverlay: () => {
          set((state) => ({ isOverlaying: !state.isOverlaying }));
        },

        layout: 'cover',
        setLayout: (layout: Layout) => set({ layout }),
      }),
      {
        name: 'h5web:customView',
        whitelist: [
          'customDomain',
          'colorMap',
          'scaleType',
          'showGrid',
          'isOverlaying',
          'invertColorMap',
          'layout',
        ],
        version: 8,
      }
    )
  );
}

const { Provider, useStore } = createContext<CustomViewConfig>();
export const useCustomViewConfig = useStore;

export function CustomViewConfigProvider(props: ConfigProviderProps) {
  const { children } = props;
  return <Provider createStore={createStore}>{children}</Provider>;
}
