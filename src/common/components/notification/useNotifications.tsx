import React, { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, notification } from 'antd';
import { last } from 'lodash';
import { AppDispatch, RootState } from '../../../app/store/store';

import { Action } from './types/notification.types';
import { messages } from './utils/messages';
import { useNotificationController } from './utils/useNotificationController';
import { NotificationInstance } from 'antd/lib/notification/interface';

export const useNotifications = (container?: HTMLElement | null) => {
  const [bottom, setBottom] = React.useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const lastNotification = useSelector((state: RootState) => last(state.main.notifications));
  const openNotification = (
    message: string,
    type: keyof NotificationInstance,
    cancelAction?: Action,
    description?: string,
  ) => {
    notification.destroy();

    const cancelNotification = (action: Action) => () => {
      if (Array.isArray(action)) {
        action.forEach((_action) => {
          //@ts-ignore
          dispatch(_action);
        });
        //@ts-ignore
      } else dispatch(action);
      openNotification(messages().ACTION_CANCELLED, 'info');
    };

    const renderCancelButton = (action: Action) =>
      action ? (
        <Button size="small" type="text" onClick={cancelNotification(action)}>
          Cancel
        </Button>
      ) : null;

    const _message = description ? (
      message
    ) : (
      <div className="jdn__notification_message">
        {message}
        {renderCancelButton(cancelAction)}
      </div>
    );
    //@ts-ignore
    notification[type]({
      message: _message,
      description,
      getContainer: () => container || document.body,
      placement: 'bottom',
      bottom,
    });
  };

  useLayoutEffect(() => {
    const containerBottom = container?.getBoundingClientRect().bottom;
    const docBottom = document.documentElement.getBoundingClientRect().bottom;
    setBottom(containerBottom ? docBottom - containerBottom : 0);
  }, [container]);

  useNotificationController(lastNotification, openNotification);
};
