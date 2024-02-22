import type { PayloadAction } from '@reduxjs/toolkit';
import { PredictedEntity } from '../../features/locators/types/locator.types';
import { PageDocumentState } from './pageDocument.slice';

export const pageDocumentReducers = {
  createDocumentForRobula(state: PageDocumentState, action: PayloadAction<PredictedEntity[]>) {
    if (state.pageDocument.content) {
      const documentContent = state.pageDocument.content;
      console.log('!!!createDocumentForRobula!!! Document content:', documentContent);
      /* вот тут добавить логику создания документ без notShownElementIds*/
    } else {
      console.error('Document content is not available.');
    }

    const notShownElementIds = action.payload
      .filter((el: PredictedEntity) => !el.is_shown)
      .map((el: PredictedEntity) => el.element_id);
    console.log('notShownElementIds', notShownElementIds);
  },
};
