import type { PayloadAction } from '@reduxjs/toolkit';
import { PredictedEntity } from '../../features/locators/types/locator.types';
import { PageDocumentState } from './pageDocument.slice';
import { removeNodesByAttribute } from '../../common/utils/removeNodesByAttribute';

export const pageDocumentReducers = {
  createDocumentForRobula(state: PageDocumentState, action: PayloadAction<PredictedEntity[]>) {
    if (state.pageDocument.content) {
      const documentContent = state.pageDocument.content;

      const notShownElementIds = action.payload
        .filter((el: PredictedEntity) => !el.is_shown)
        .map((el: PredictedEntity) => el.element_id);

      /* set cleaned Html String into pageDocumentForRobula: */
      state.pageDocumentForRobula = removeNodesByAttribute(documentContent, 'jdn-hash', notShownElementIds);
    } else {
      console.error('Document content is not available.');
    }
  },
};
