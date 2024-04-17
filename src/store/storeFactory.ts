/* eslint-disable no-shadow */
import { create } from 'zustand';

import { devtools } from 'zustand/middleware';
import setLocalStore from './localStore';

export type StoreReturnType<T> = T & {
  setState: (newState: Partial<T>) => void;
};

export type SetMutationStateExtraArg = {
  key: string;
  content: any;
};

export function createStore<Store>(initialState: Store) {
  const state = initialState;

  return create<StoreReturnType<Store>>()(
    devtools((set) => ({
      ...state,
      setState: (newState: Partial<Store>) => {
        setLocalStore(newState);
        set((st) => {
          // console.log({newState});
          return { ...st, ...newState }
        });
      },
    }))
  );
}
