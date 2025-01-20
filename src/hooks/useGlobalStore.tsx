import { createStore } from '../store/storeFactory';
import { initialGlobalState } from '../store/initialGlobalState';

export const useStore = createStore({ ...initialGlobalState });
