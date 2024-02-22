import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeEmptyPageObjects } from '../../../features/pageObjects/reducers/removeEmptyPageObjects.thunk';
import { locatorGenerationController } from '../../../features/locators/utils/LocatorGenerationController';
import connector from '../../../pageServices/connector';
import { removeOverlay } from '../../../pageServices/pageDataHandlers';
import { clearAll } from '../../main.slice';
import { changeIdentificationStatus } from '../../../features/locators/locators.slice';
import { IdentificationStatus } from '../../../features/locators/types/locator.types';
import { selectInProgressHashes } from '../../../features/locators/selectors/locatorsFiltered.selectors';
import { AppDispatch } from '../../store/store';

export const useOnDisconnect = () => {
  const dispatch = useDispatch<AppDispatch>();
  const inProgressHashes = useSelector(selectInProgressHashes);

  useEffect(() => {
    const disconnectHandler = () => {
      dispatch(changeIdentificationStatus(IdentificationStatus.noStatus));
      dispatch(clearAll());
      locatorGenerationController.revokeTasks(inProgressHashes);
      dispatch(removeEmptyPageObjects());
      removeOverlay();
    };

    connector.updateDisconnectListener(disconnectHandler);
  }, []);
};
