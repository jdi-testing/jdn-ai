export const runContextMenu = () => {
  /*
  origin https://www.cssscript.com/multi-level-context-menu/
  ----->
*/

  const sendMessage = (message) =>
    chrome.runtime.sendMessage(message).catch((error) => {
      if (error.message !== "The message port closed before a response was received.") throw new Error(error.message);
    });

  function ContextMenu(menu, options) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const num = ContextMenu.count++;

    this.menu = menu;
    this.contextTarget = null;

    if (!(menu instanceof Array)) {
      throw new Error("Parameter 1 must be of type Array");
    }

    if (typeof options !== "undefined") {
      if (typeof options !== "object") {
        throw new Error("Parameter 2 must be of type object");
      }
    } else {
      options = {};
    }

    function onResize() {
      if (ContextUtil.getProperty(options, "close_on_resize", true)) {
        self.hide();
      }
    }

    window.addEventListener("resize", onResize);

    this.setOptions = function (_options) {
      if (typeof _options === "object") {
        options = _options;
      } else {
        throw new Error("Parameter 1 must be of type object");
      }
    };

    this.changeOption = function (option, value) {
      if (typeof option === "string") {
        if (typeof value !== "undefined") {
          options[option] = value;
        } else {
          throw new Error("Parameter 2 must be set");
        }
      } else {
        throw new Error("Parameter 1 must be of type string");
      }
    };

    this.getOptions = function () {
      return options;
    };

    this.reload = function () {
      if (document.getElementById("jdn_cm_" + num) == null) {
        const cnt = document.createElement("div");
        cnt.className = "cm_container";
        cnt.id = "jdn_cm_" + num;

        document.body.appendChild(cnt);
      }

      const container = document.getElementById("jdn_cm_" + num);
      container.innerHTML = "";

      container.appendChild(renderLevel(menu));
    };

    function renderLevel(level) {
      const ul_outer = document.createElement("ul");

      level.forEach(function (item) {
        const li = document.createElement("li");
        li.menu = self;

        if (typeof item.type === "undefined") {
          const icon_span = document.createElement("span");
          icon_span.className = "cm_icon_span";

          if (ContextUtil.getProperty(item, "icon", "") != "") {
            icon_span.innerHTML = ContextUtil.getProperty(item, "icon", "");
          } else {
            icon_span.innerHTML = ContextUtil.getProperty(options, "default_icon", "");
          }

          const text_span = document.createElement("span");
          text_span.className = "cm_text";

          if (ContextUtil.getProperty(item, "text", "") != "") {
            text_span.innerHTML = ContextUtil.getProperty(item, "text", "");
          } else {
            text_span.innerHTML = ContextUtil.getProperty(options, "default_text", "item");
          }

          const sub_span = document.createElement("span");
          sub_span.className = "cm_sub_span";

          if (typeof item.sub !== "undefined") {
            if (ContextUtil.getProperty(options, "sub_icon", "") != "") {
              sub_span.innerHTML = ContextUtil.getProperty(options, "sub_icon", "");
            } else {
              sub_span.innerHTML = `<svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.39777 5.66428L0.360269 0.948654C0.344493 0.936233 0.325533 0.928515 0.305568 0.926384C0.285603 0.924253 
              0.265441 0.927797 0.247399 0.936608C0.229357 0.94542 0.214166 0.959141 0.203571 0.976196C0.192976 0.993252 0.187406 
              1.01295 0.187501 1.03303V2.0683C0.187501 2.13392 0.218305 2.19687 0.269198 2.23705L5.09063 6.00178L0.269198 
              9.76651C0.216966 9.80669 0.187501 9.86964 0.187501 9.93526V10.9705C0.187501 11.0603 0.290626 11.1098 0.360269 
              11.0549L6.39777 6.33928C6.44908 6.29925 6.4906 6.24805 6.51915 6.18957C6.5477 6.13108 6.56254 6.06686 6.56254 
              6.00178C6.56254 5.9367 6.5477 5.87247 6.51915 5.81399C6.4906 5.75551 6.44908 5.70431 6.39777 5.66428Z" fill="#5A5A5A"/>
              </svg>              
              `;
            }
          }

          if (item.icon) li.appendChild(icon_span);
          li.appendChild(text_span);
          li.appendChild(sub_span);

          if (!ContextUtil.getProperty(item, "enabled", true)) {
            li.setAttribute("disabled", "");
          } else {
            if (typeof item.events === "object") {
              const keys = Object.keys(item.events);

              for (let i = 0; i < keys.length; i++) {
                li.addEventListener(keys[i], item.events[keys[i]]);
              }
            }

            if (typeof item.sub !== "undefined") {
              li.appendChild(renderLevel(item.sub));
            }
          }
        } else {
          if (item.type == ContextMenu.DIVIDER) {
            li.className = "cm_divider";
          }
        }

        ul_outer.appendChild(li);
      });

      return ul_outer;
    }

    this.display = function (e, target) {
      if (typeof target !== "undefined") {
        self.contextTarget = target;
      } else {
        self.contextTarget = e.target;
      }

      const menu = document.getElementById("jdn_cm_" + num);

      const clickCoords = { x: e.clientX, y: e.clientY };
      const clickCoordsX = clickCoords.x;
      const clickCoordsY = clickCoords.y;

      const menuWidth = menu.offsetWidth + 4;
      const menuHeight = menu.offsetHeight + 4;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const mouseOffset = parseInt(ContextUtil.getProperty(options, "mouse_offset", 2));

      if (windowWidth - clickCoordsX < menuWidth) {
        menu.style.left = windowWidth - menuWidth + pageXOffset + "px";
      } else {
        menu.style.left = clickCoordsX + mouseOffset + pageXOffset + "px";
      }

      if (windowHeight - clickCoordsY < menuHeight) {
        menu.style.top = windowHeight - menuHeight + pageYOffset + "px";
      } else {
        menu.style.top = clickCoordsY + mouseOffset + pageYOffset + "px";
      }

      menu.style.position = "absolute";

      const sizes = ContextUtil.getSizes(menu);

      if (windowWidth - clickCoordsX < sizes.width) {
        menu.classList.add("cm_border_right");
      } else {
        menu.classList.remove("cm_border_right");
      }

      if (windowHeight - clickCoordsY < sizes.height) {
        menu.classList.add("cm_border_bottom");
      } else {
        menu.classList.remove("cm_border_bottom");
      }

      menu.classList.add("display");

      if (ContextUtil.getProperty(options, "close_on_click", true)) {
        window.addEventListener("click", documentClick);
      }

      e.preventDefault();
    };

    this.hide = function () {
      document.getElementById("jdn_cm_" + num).classList.remove("display");
      window.removeEventListener("click", documentClick);
    };

    this.remove = function () {
      document.getElementById("jdn_cm_" + num).remove();
      window.removeEventListener("click", documentClick);
      window.removeEventListener("resize", onResize);
    };

    function documentClick() {
      self.hide();
    }

    this.reload();
  }

  ContextMenu.count = 0;
  ContextMenu.DIVIDER = "cm_divider";

  const ContextUtil = {
    getProperty: function (options, opt, def) {
      if (typeof options[opt] !== "undefined") {
        return options[opt];
      } else {
        return def;
      }
    },

    getSizes: function (obj) {
      const lis = obj.getElementsByTagName("li");

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

        const ul = li.getElementsByTagName("ul");
        if (typeof ul[0] !== "undefined") {
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
  let types;
  let highlightTargets;

  /* helpers */

  const notAddedToPO = () => predictedElements.some(({ generate }) => !generate);
  const addedToPO = () => predictedElements.some(({ generate }) => generate);
  const isGroup = () => predictedElements.length !== 1;
  const noDeleted = () => predictedElements.some(({ deleted }) => !deleted);
  const areInProgress = () =>
    predictedElements.some(({ locator }) => locator.taskStatus === "PENDING" || locator.taskStatus === "STARTED");
  const areRevoked = () => predictedElements.some(({ locator }) => locator.taskStatus === "REVOKED");
  const areFailed = () => predictedElements.some(({ locator }) => locator.taskStatus === "FAILURE");

  /* menu */

  const menuItems = () => {
    const menuItems = [
      ...(notAddedToPO()
        ? [
            {
              text: "Add to Page Object",
              events: {
                click: () =>
                  sendMessage({
                    message: isGroup() ? "TOGGLE_ELEMENT_GROUP" : "TOGGLE_ELEMENT",
                    param: predictedElements.filter((element) => !element.generate),
                  }),
              },
            },
          ]
        : []),
      ...(addedToPO()
        ? [
            {
              text: "Remove from Page Object",
              events: {
                click: () =>
                  sendMessage({
                    message: isGroup() ? "TOGGLE_ELEMENT_GROUP" : "TOGGLE_ELEMENT",
                    param: predictedElements.filter((element) => element.generate),
                  }),
              },
            },
          ]
        : []),
      {
        type: ContextMenu.DIVIDER,
      },
      ...(renderGenerationOption() || []),
      ...(!isGroup()
        ? [
            {
              text: `<span>Edit</span>`,
              icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.34531 10.125H2.25C2.15055 10.125 2.05516 10.0855 1.98484 10.0152C1.91451 9.94484 1.875 9.84945 
      1.875 9.75V7.65469C1.87483 7.60599 1.88427 7.55774 1.90277 7.5127C1.92127 7.46765 1.94847 7.4267 1.98281 
      7.39218L7.60782 1.76718C7.64271 1.73175 7.6843 1.70361 7.73017 1.68441C7.77604 1.6652 7.82527 1.65531 7.875 
      1.65531C7.92473 1.65531 7.97396 1.6652 8.01983 1.68441C8.0657 1.70361 8.1073 1.73175 8.14219 1.76718L10.2328 
      3.85781C10.2682 3.8927 10.2964 3.9343 10.3156 3.98017C10.3348 4.02604 10.3447 4.07527 10.3447 4.125C10.3447 
      4.17473 10.3348 4.22396 10.3156 4.26983C10.2964 4.3157 10.2682 4.35729 10.2328 4.39218L4.60782 10.0172C4.5733 
      10.0515 4.53235 10.0787 4.4873 10.0972C4.44226 10.1157 4.39401 10.1252 4.34531 10.125V10.125Z" 
      stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.375 3L9 5.625" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
              events: {
                click: () =>
                  sendMessage({
                    message: "OPEN_EDIT_LOCATOR_REQUEST",
                    param: { value: predictedElements[0], types },
                  }),
              },
            },
          ]
        : []),
      ...(noDeleted()
        ? [
            {
              text: `<span class="cm_container_warning-option">Delete</span>`,
              icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.125 2.625H1.875" stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.875 4.875V7.875" stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7.125 4.875V7.875" stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.375 2.625V9.75C9.375 9.84946 9.33549 9.94484 9.26517 10.0152C9.19484 10.0855 9.09946 10.125 9 
        10.125H3C2.90054 10.125 2.80516 10.0855 2.73484 10.0152C2.66451 9.94484 2.625 9.84946 2.625 9.75V2.625" 
        stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7.875 2.625V1.875C7.875 1.67609 7.79598 1.48532 7.65533 1.34467C7.51468 1.20402 7.32391 1.125 7.125 
        1.125H4.875C4.67609 1.125 4.48532 1.20402 4.34467 1.34467C4.20402 1.48532 4.125 1.67609 4.125 1.875V2.625" 
        stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
              events: {
                click: () =>
                  sendMessage({
                    message: "REMOVE_ELEMENT",
                    param: predictedElements,
                  }),
              },
            },
          ]
        : [
            {
              text: `Restore`,
              icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.74072 4.67343H1.49072V2.42343" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8.91572 3.08436C8.53304 2.70112 8.07855 2.39708 7.57826 2.18964C7.07797 1.9822 6.54169 1.87543 
            6.0001 1.87543C5.4585 1.87543 4.92223 1.9822 4.42193 2.18964C3.92164 2.39708 3.46716 2.70112 3.08447 
            3.08436L1.49072 4.67343" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8.25928 7.32657H10.5093V9.57657" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin=
            "round"/>
            <path d="M3.08447 8.91563C3.46716 9.29887 3.92164 9.60291 4.42193 9.81035C4.92222 10.0178 5.4585 10.1246 
            6.0001 10.1246C6.54169 10.1246 7.07797 10.0178 7.57826 9.81035C8.07855 9.60291 8.53304 9.29887 8.91572 
            8.91563L10.5095 7.32657" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            `,
              events: {
                click: () =>
                  sendMessage({
                    message: "RESTORE_ELEMENT",
                    param: predictedElements,
                  }),
              },
            },
          ]),
      {
        type: ContextMenu.DIVIDER,
      },
      ...(isGroup()
        ? [
            {
              text: "Select element",
              sub: [...getActiveElements()],
            },
          ]
        : []),
      {
        text: `Bring to front`,
        events: {
          click: () => chrome.storage.local.set({ JDN_BRING_TO_FRONT: { hash: Date.now(), predictedElements } }),
        },
      },
      {
        text: `Bring to background`,
        events: {
          click: () => chrome.storage.local.set({ JDN_BRING_TO_BACKGROUND: { hash: Date.now(), predictedElements } }),
        },
      },
    ];
    return menuItems;
  };

  const renderGenerationOption = () => {
    if (areInProgress()) {
      return [
        {
          text: `<span>Pause generation</span>`,
          icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.375 1.875H7.6875C7.48039 1.875 7.3125 2.04289 7.3125 2.25V9.75C7.3125 9.95711 7.48039 10.125 7.6875 
      10.125H9.375C9.58211 10.125 9.75 9.95711 9.75 9.75V2.25C9.75 2.04289 9.58211 1.875 9.375 1.875Z" stroke="#5A5A5A"
       stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4.3125 1.875H2.625C2.41789 1.875 2.25 2.04289 2.25 2.25V9.75C2.25 9.95711 2.41789 10.125 2.625 10.125H4
      .3125C4.51961 10.125 4.6875 9.95711 4.6875 9.75V2.25C4.6875 2.04289 4.51961 1.875 4.3125 1.875Z" stroke="#5A5A5A"
       stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
          events: {
            click: () =>
              sendMessage({
                message: "STOP_GROUP_GENERATION",
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
          icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.6922 5.68125L3.94687 1.55625C3.89009 1.52122 3.82499 1.50198 3.75829 1.5005C3.69159 1.49903 3.6257
         1.51537 3.56743 1.54786C3.50915 1.58034 3.4606 1.62778 3.42677 1.68529C3.39294 1.74279 3.37507 1.80828 3.375 
         1.875V10.125C3.37507 10.1917 3.39294 10.2572 3.42677 10.3147C3.4606 10.3722 3.50915 10.4197 3.56743 10.4521C3
         .6257 10.4846 3.69159 10.501 3.75829 10.4995C3.82499 10.498 3.89009 10.4788 3.94687 10.4437L10.6922 6.31875C10
         .7476 6.286 10.7935 6.23937 10.8254 6.18348C10.8572 6.12758 10.874 6.06435 10.874 6C10.874 5.93565 10.8572 
         5.87241 10.8254 5.81652C10.7935 5.76062 10.7476 5.714 10.6922 5.68125V5.68125Z" stroke="#5A5A5A" stroke-
         linecap="round" stroke-linejoin="round"/>
        </svg>`,
          events: {
            click: () =>
              sendMessage({
                message: "RERUN_GENERATION",
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
          icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.25928 4.67343H10.5093V2.42343" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8.91556 8.91563C8.33881 9.49286 7.60381 9.88606 6.80354 10.0455C6.00328 10.2049 5.17371 10.1234 
        4.41977 9.81133C3.66583 9.49921 3.02139 8.9705 2.56798 8.29208C2.11457 7.61365 1.87256 6.81599 1.87256 6C1.
        87256 5.18401 2.11457 4.38635 2.56798 3.70792C3.02139 3.0295 3.66583 2.50079 4.41977 2.18868C5.17371 1.87656 
        6.00328 1.79507 6.80354 1.95451C7.60381 2.11395 8.33881 2.50715 8.91556 3.08438L10.5093 4.67344" 
        stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
          events: {
            click: () =>
              sendMessage({
                message: "RERUN_GENERATION",
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
        click: () =>
          sendMessage({
            message: "ELEMENT_SELECT",
            param: _element,
          }),
      },
    }));
    return items;
  };

  const contextMenuListener = (event) => {
    highlightTargets = document.querySelectorAll(".jdn-active");

    if (highlightTargets.length === 0) {
      highlightTargets = event.target.closest("[jdn-highlight=true]");
    }
    if (highlightTargets.length === 0) return;

    event.preventDefault();
    contextEvent = event;

    sendMessage({
      message: "GET_ELEMENTS_DATA",
      param: Array.from(highlightTargets).map((_element) => _element.id),
    }).then(({ elements, _types }) => {
      if (!elements || !elements.length) return;
      predictedElements = elements;
      types = _types;
      elementMenu && elementMenu.remove();
      elementMenu = new ContextMenu(menuItems());
      elementMenu.display(contextEvent);
    });
  };

  const mouseLeaveListener = () => {
    elementMenu && elementMenu.hide();
  };

  const runDocumentListeners = () => {
    document.oncontextmenu = contextMenuListener;
    document.addEventListener("mouseleave", mouseLeaveListener);
  };

  const messageHandler = ({ message, param }, sender, sendResponse) => {
    if (message === "PING_SCRIPT" && param.scriptName === "runContextMenu") {
      sendResponse({ message: true });
    }
  };

  runDocumentListeners();
  chrome.runtime.onMessage.addListener(messageHandler);
};
