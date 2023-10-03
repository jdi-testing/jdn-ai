import { ElementLibrary } from '../../locators/types/generationClasses.types';
import { vuetifyDefaultFilterOn } from './vuetifyDefaultFilter';

export const defaultFilter: Partial<Record<ElementLibrary, typeof vuetifyDefaultFilterOn>> = {
  [ElementLibrary.Vuetify]: vuetifyDefaultFilterOn,
};
