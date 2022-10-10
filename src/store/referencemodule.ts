/* eslint-disable no-unused-vars */
import type { Profile } from '@generated/types';
import { ReferenceModules } from '@generated/types';
import create from 'zustand';

interface ReferenceModuleState {
  selectedReferenceModule: ReferenceModules;
  setSelectedReferenceModule: (selectedModule: ReferenceModules) => void;
  onlyFollowers: boolean;
  setOnlyFollowers: (onlyFollowers: boolean) => void;
  degreesOfSeparation: number;
  setDegreesOfSeparation: (degreesOfSeparation: number) => void;
  lensFluencers: Array<Profile>;
  setLensFluencers: (lensFluencers: Array<Profile>) => void;
  currencies: any;
  setCurrencies: (lensFluencers: any) => void;
  amounts: any;
  setAmounts: (lensFluencers: any) => void;
}

export const useReferenceModuleStore = create<ReferenceModuleState>((set) => ({
  selectedReferenceModule: ReferenceModules.DegreesOfSeparationReferenceModule,
  setSelectedReferenceModule: (selectedReferenceModule) => set(() => ({ selectedReferenceModule })),
  onlyFollowers: false,
  setOnlyFollowers: (onlyFollowers) => set(() => ({ onlyFollowers })),
  degreesOfSeparation: 2,
  setDegreesOfSeparation: (degreesOfSeparation) => set(() => ({ degreesOfSeparation })),
  lensFluencers: [],
  setLensFluencers: (lensFluencers) => set(() => ({ lensFluencers })),
  currencies: [],
  setCurrencies: (currencies) => set(() => ({ currencies })),
  amounts: [],
  setAmounts: (amounts) => set(() => ({ amounts }))
}));
