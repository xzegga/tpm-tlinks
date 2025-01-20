import { getProperty } from '../utils/objectsOperations';
import { localStorageKeys, sessionStorageKeys } from './initialGlobalState';

/*
  Set values to local storage or session storage if the key is in its own list localStorageKeys or sessionStorageKeys respectively.
*/
const setLocalStore = (newState: any) => {
  const setItem = (
    storage: Storage,
    keyValue: string,
    keyName: string,
    value: any
  ) => {
    storage.setItem(keyValue || keyName, value);
  };

  const setItemForStorage = (
    storageKeys: string[],
    storage: Storage,
    state: any,
    key: string
  ) => {
    storageKeys.forEach((k) => {
      // Get key dot notation property names and localStorey key name suggested
      const [keyName, keyValue] = k.split(':');

      // Get value of the object.property
      const keyValuePair = getProperty(state, keyName);

      // Set the item in its respective storage
      if (keyValuePair?.name === key) {
        setItem(storage, keyValue, keyValuePair.name, keyValuePair.value);
      }
    });
  };

  // Main function to set items in both localStorage and sessionStorage based on newState
  Object.keys(newState).forEach((key) => {
    setItemForStorage(localStorageKeys, localStorage, newState, key);
    setItemForStorage(sessionStorageKeys, sessionStorage, newState, key);
  });
};

export default setLocalStore;
