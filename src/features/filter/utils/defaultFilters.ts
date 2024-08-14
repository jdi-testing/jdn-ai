import { ElementLibrary } from '../../locators/types/generationClasses.types';
import { vuetifyDefaultFilterOn } from './vuetifyDefaultFilter';
import { MUIDefaultFilterOn } from './MUIDefaultFilter';
import { HTML5DefaultFilterOn } from './HTML5DefaultFilter';

type VuetifyFilter = typeof vuetifyDefaultFilterOn;
type MUIFilter = typeof MUIDefaultFilterOn;
type HTML5Filter = typeof HTML5DefaultFilterOn;

type DefaultFilters = Partial<Record<ElementLibrary, VuetifyFilter | MUIFilter | HTML5Filter>>;

export const defaultFilters: DefaultFilters = {
  [ElementLibrary.Vuetify]: vuetifyDefaultFilterOn,
  [ElementLibrary.MUI]: MUIDefaultFilterOn,
  [ElementLibrary.HTML5]: HTML5DefaultFilterOn,
};
