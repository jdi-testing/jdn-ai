import {
  plusCircle,
  minusCircle,
  pencil,
  handPointing,
  bringToFrontIcon,
  sendToBackIcon,
  trash,
  arrowsClockwise,
  pause,
  play,
  arrowClockwise,
  caretRight,
  copy,
  arrowFatLinesDown,
} from './assets/icons';

import { LocatorOption } from '../../features/locators/utils/constants';
import { LocatorType } from '../../common/types/common';
import { ScriptMsg } from '../scriptMsg.constants';

export const runContextMenu = () => {
  /*
  origin https://www.cssscript.com/multi-level-context-menu/
  ----->
*/

  const sendMessage = (message) =>
    chrome.runtime.sendMessage(message).catch((error) => {
      if (error.message !== 'The message port closed before a response was received.') throw new Error(error.message);
    });

  function ContextMenu(menu, options) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const num = ContextMenu.count++;

    this.menu = menu;
    this.contextTarget = null;

    if (!(menu instanceof Array)) {
      throw new Error('Parameter 1 must be of type Array');
    }

    if (typeof options !== 'undefined') {
      if (typeof options !== 'object') {
        throw new Error('Parameter 2 must be of type object');
      }
    } else {
      options = {};
    }

    function onResize() {
      if (ContextUtil.getProperty(options, 'close_on_resize', true)) {
        self.hide();
      }
    }

    window.addEventListener('resize', onResize);

    this.setOptions = function (_options) {
      if (typeof _options === 'object') {
        options = _options;
      } else {
        throw new Error('Parameter 1 must be of type object');
      }
    };

    this.changeOption = function (option, value) {
      if (typeof option === 'string') {
        if (typeof value !== 'undefined') {
          options[option] = value;
        } else {
          throw new Error('Parameter 2 must be set');
        }
      } else {
        throw new Error('Parameter 1 must be of type string');
      }
    };

    this.getOptions = function () {
      return options;
    };

    this.reload = function () {
      if (document.getElementById('jdn_cm_' + num) == null) {
        const cnt = document.createElement('div');
        cnt.className = 'cm_container context-menu';
        cnt.id = 'jdn_cm_' + num;

        document.body.appendChild(cnt);
      }

      const container = document.getElementById('jdn_cm_' + num);
      container.innerHTML = '';

      container.appendChild(renderLevel(menu));
    };

    function renderLevel(level) {
      const ul_outer = document.createElement('ul');

      level.forEach(function (item) {
        const li = document.createElement('li');
        li.menu = self;

        if (typeof item.type === 'undefined') {
          const icon_span = document.createElement('span');
          icon_span.className = 'cm_icon_span';

          if (ContextUtil.getProperty(item, 'icon', '') != '') {
            icon_span.innerHTML = ContextUtil.getProperty(item, 'icon', '');
          } else {
            icon_span.innerHTML = ContextUtil.getProperty(options, 'default_icon', '');
          }

          const text_span = document.createElement('span');
          text_span.className = 'cm_text';

          if (ContextUtil.getProperty(item, 'text', '') != '') {
            text_span.innerHTML = ContextUtil.getProperty(item, 'text', '');
          } else {
            text_span.innerHTML = ContextUtil.getProperty(options, 'default_text', 'item');
          }

          const sub_span = document.createElement('span');
          sub_span.className = 'cm_sub_span';

          if (typeof item.sub !== 'undefined') {
            if (ContextUtil.getProperty(options, 'sub_icon', '') != '') {
              sub_span.innerHTML = ContextUtil.getProperty(options, 'sub_icon', '');
            } else {
              sub_span.innerHTML = caretRight;
            }
          }

          if (item.icon) li.appendChild(icon_span);
          li.appendChild(text_span);
          li.appendChild(sub_span);

          if (!ContextUtil.getProperty(item, 'enabled', true)) {
            li.setAttribute('disabled', '');
          } else {
            if (typeof item.events === 'object') {
              const keys = Object.keys(item.events);

              for (let i = 0; i < keys.length; i++) {
                li.addEventListener(keys[i], item.events[keys[i]]);
              }
            }

            if (typeof item.sub !== 'undefined') {
              li.appendChild(renderLevel(item.sub));
            }
          }
        } else {
          if (item.type == ContextMenu.DIVIDER) {
            li.className = 'cm_divider';
          }
        }

        ul_outer.appendChild(li);
      });

      return ul_outer;
    }

    this.display = function (e, target) {
      if (typeof target !== 'undefined') {
        self.contextTarget = target;
      } else {
        self.contextTarget = e.target;
      }

      const menu = document.getElementById('jdn_cm_' + num);

      const clickCoords = { x: e.clientX, y: e.clientY };
      const clickCoordsX = clickCoords.x;
      const clickCoordsY = clickCoords.y;

      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const mouseOffset = parseInt(ContextUtil.getProperty(options, 'mouse_offset', 0));

      if (windowWidth - clickCoordsX < menuWidth) {
        menu.style.left = clickCoordsX - menuWidth + mouseOffset + scrollX + 'px';
      } else {
        menu.style.left = clickCoordsX + mouseOffset + scrollX + 'px';
      }

      if (windowHeight - clickCoordsY < menuHeight) {
        menu.style.top = clickCoordsY - menuHeight + mouseOffset + scrollY + 'px';
      } else {
        menu.style.top = clickCoordsY + mouseOffset + scrollY + 'px';
      }

      menu.style.position = 'absolute';

      const sizes = ContextUtil.getSizes(menu);

      if (windowWidth - clickCoordsX < sizes.width) {
        menu.classList.add('cm_border_right');
      } else {
        menu.classList.remove('cm_border_right');
      }

      if (windowHeight - clickCoordsY < sizes.height) {
        menu.classList.add('cm_border_bottom');
      } else {
        menu.classList.remove('cm_border_bottom');
      }

      menu.classList.add('display');

      if (ContextUtil.getProperty(options, 'close_on_click', true)) {
        window.addEventListener('click', documentClick);
      }

      e.preventDefault();
    };

    this.hide = function () {
      document.getElementById('jdn_cm_' + num).classList.remove('display');
      window.removeEventListener('click', documentClick);
    };

    this.remove = function () {
      document.getElementById('jdn_cm_' + num).remove();
      window.removeEventListener('click', documentClick);
      window.removeEventListener('resize', onResize);
    };

    function documentClick() {
      self.hide();
    }

    this.reload();
  }

  ContextMenu.count = 0;
  ContextMenu.DIVIDER = 'cm_divider';

  const ContextUtil = {
    getProperty: function (options, opt, def) {
      if (typeof options[opt] !== 'undefined') {
        return options[opt];
      } else {
        return def;
      }
    },

    getSizes: function (obj) {
      const lis = obj.getElementsByTagName('li');

      let width_def = 0;
      let height_def = 0;

      for (let i = 0; i < lis.length; i++) {
        const li = lis[i];

        if (li.offsetWidth > width_def) {
          width_def = li.offsetWidth;
        }

        if (li.offsetHeight > height_def) {
          height_def = li.offsetHeight;
        }
      }

      let width = width_def;
      let height = height_def;

      for (let i = 0; i < lis.length; i++) {
        const li = lis[i];

        const ul = li.getElementsByTagName('ul');
        if (typeof ul[0] !== 'undefined') {
          const ul_size = ContextUtil.getSizes(ul[0]);

          if (width_def + ul_size.width > width) {
            width = width_def + ul_size.width;
          }

          if (height_def + ul_size.height > height) {
            height = height_def + ul_size.height;
          }
        }
      }

      return {
        width: width,
        height: height,
      };
    },
  };
  // <-----

  /* global chrome */

  let elementMenu;
  let contextEvent;
  let predictedElements;

  /* helpers */

  const notAddedToPO = () => predictedElements.some(({ isGenerated }) => !isGenerated);
  const addedToPO = () => predictedElements.some(({ isGenerated }) => isGenerated);
  const isGroup = () => predictedElements.length !== 1;
  const noDeleted = () => predictedElements.some(({ deleted }) => !deleted);
  const areInProgress = () =>
    predictedElements.some(
      ({ locatorValue }) => locatorValue.taskStatus === 'PENDING' || locatorValue.taskStatus === 'STARTED',
    );
  const areRevoked = () => predictedElements.some(({ locatorValue }) => locatorValue.taskStatus === 'REVOKED');
  const areFailed = () => predictedElements.some(({ locatorValue }) => locatorValue.taskStatus === 'FAILURE');

  /* menu */

  const onAddedToPOHandler = () => {
    sendMessage({
      message: isGroup() ? ScriptMsg.ToggleElementGroup : ScriptMsg.ToggleElement,
      param: predictedElements.filter((element) => !element.isGenerated),
    });

    sendMessage({
      message: ScriptMsg.ToggleElementGroupIsChecked,
      param: predictedElements.filter((element) => !element.isChecked),
    });
  };

  const onRemoveFromPO = () => {
    sendMessage({
      message: isGroup() ? ScriptMsg.ToggleElementGroup : ScriptMsg.ToggleElement,
      param: predictedElements.filter((element) => element.isGenerated),
    });

    sendMessage({
      message: ScriptMsg.ToggleElementGroupIsChecked,
      param: predictedElements.filter((element) => element.isChecked),
    });
  };

  const menuItems = () => {
    const menuItems = [
      ...(notAddedToPO()
        ? [
            {
              text: 'Add to Page Object',
              icon: plusCircle,
              events: {
                click: onAddedToPOHandler,
              },
            },
          ]
        : []),
      ...(addedToPO()
        ? [
            {
              text: 'Remove from Page Object',
              icon: minusCircle,
              events: {
                click: onRemoveFromPO,
              },
            },
          ]
        : []),
      ...(!isGroup()
        ? [
            {
              text: 'Edit',
              icon: pencil,
              events: {
                click: () =>
                  sendMessage({
                    message: ScriptMsg.OpenEditLocator,
                    param: { value: predictedElements[0] },
                  }),
              },
            },
          ]
        : []),
      ...(isGroup()
        ? [
            {
              type: ContextMenu.DIVIDER,
            },
            {
              text: 'Select element',
              icon: handPointing,
              sub: [...getActiveElements()],
              events: {
                click: (evt) => evt.stopPropagation(),
              },
            },
          ]
        : []),
      {
        text: 'Copy',
        icon: copy,
        sub: [...getCopyOptions()],
        events: {
          click: (evt) => evt.stopPropagation(),
        },
      },
      {
        text: 'Advanced calculation',
        icon: arrowFatLinesDown,
        enabled: !predictedElements.every((element) => element.locatorType === LocatorType.cssSelector),
        sub: [...getAdvancedCalculationOptions()],
        events: {
          click: (evt) => evt.stopPropagation(),
        },
      },
      {
        type: ContextMenu.DIVIDER,
      },
      {
        text: 'Bring to front',
        icon: bringToFrontIcon,
        events: {
          click: () => chrome.storage.local.set({ JDN_BRING_TO_FRONT: { hash: Date.now(), predictedElements } }),
        },
      },
      {
        text: 'Send to back',
        icon: sendToBackIcon,
        events: {
          click: () => chrome.storage.local.set({ JDN_BRING_TO_BACKGROUND: { hash: Date.now(), predictedElements } }),
        },
      },
      ...(renderGenerationOption() || []),
      {
        type: ContextMenu.DIVIDER,
      },
      ...(noDeleted()
        ? [
            {
              text: `<span class="cm_container_warning-option">Delete</span>`,
              icon: trash,
              events: {
                click: () =>
                  sendMessage({
                    message: ScriptMsg.RemoveElement,
                    param: predictedElements,
                  }),
              },
            },
          ]
        : [
            {
              text: `Restore`,
              icon: arrowsClockwise,
              events: {
                click: () =>
                  sendMessage({
                    message: ScriptMsg.RestoreElement,
                    param: predictedElements,
                  }),
              },
            },
          ]),
    ];
    return menuItems;
  };

  const renderGenerationOption = () => {
    if (areInProgress()) {
      return [
        {
          text: `<span>Pause generation</span>`,
          icon: pause,
          events: {
            click: () =>
              sendMessage({
                message: ScriptMsg.StopGroupGeneration,
                param: predictedElements,
              }),
          },
        },
      ];
    }
    if (areRevoked()) {
      return [
        {
          text: `<span>Rerun</span>`,
          icon: play,
          events: {
            click: () =>
              sendMessage({
                message: ScriptMsg.RerunGeneration,
                param: predictedElements,
              }),
          },
        },
      ];
    }
    if (areFailed()) {
      return [
        {
          text: `<span>Retry</span>`,
          icon: arrowClockwise,
          events: {
            click: () =>
              sendMessage({
                message: ScriptMsg.RerunGeneration,
                param: predictedElements,
              }),
          },
        },
      ];
    }
    return [];
  };

  const getActiveElements = () => {
    const items = predictedElements.map((_element) => ({
      text: _element.name,
      events: {
        click: () => {
          elementMenu.hide();
          return sendMessage({
            message: ScriptMsg.ElementSelect,
            param: _element,
          });
        },
      },
    }));
    return items;
  };

  const getCopyOptions = () => {
    const options = Object.values(LocatorOption).map((option) => ({
      text: option,
      events: {
        click: () => {
          elementMenu.hide();
          return sendMessage({
            message: ScriptMsg.CopyLocator,
            param: { option, value: predictedElements },
          });
        },
      },
    }));

    options.splice(3, 0, { type: ContextMenu.DIVIDER });
    options.splice(7, 0, { type: ContextMenu.DIVIDER });

    return options;
  };

  const getAdvancedCalculationOptions = () => {
    const MaxGenerationTime = {
      '1s': 1000,
      '3s': 3000,
      '5s': 5000,
      '10s': 10000,
      '1m': 60000,
      Unlimited: 3600000,
    };

    const options = Object.keys(MaxGenerationTime).map((label) => ({
      text: label,
      events: {
        click: () => {
          elementMenu.hide();
          return sendMessage({
            message: ScriptMsg.AdvancedCalculation,
            param: {
              time: MaxGenerationTime[label],
              locators: predictedElements.filter((element) => element.locatorType !== LocatorType.cssSelector),
            },
          });
        },
      },
    }));

    return options;
  };

  const contextMenuListener = (event) => {
    const isMacPlatform = window.navigator?.userAgent.indexOf('Mac') != -1;
    if (isMacPlatform && event.ctrlKey) return;

    const highlightTarget = event.target.closest('[jdn-highlight=true]');
    if (!highlightTarget.classList.contains('jdn-active')) return;

    event.preventDefault();

    setTimeout(() => {
      contextEvent = event;

      sendMessage({
        message: ScriptMsg.GetActiveElements,
      }).then(({ elements }) => {
        if (!elements || !elements.length) return;
        predictedElements = elements;
        elementMenu && elementMenu.remove();
        elementMenu = new ContextMenu(menuItems());
        elementMenu.display(contextEvent);
      });
    }, 100);
  };

  const runDocumentListeners = () => {
    document.oncontextmenu = contextMenuListener;
  };

  runDocumentListeners();

  chrome.runtime.onMessage.addListener(({ message }) => {
    switch (message) {
      case ScriptMsg.KillHighlight:
        elementMenu && elementMenu.hide();
        break;
    }
  });
};
