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
              sub_span.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.39777 5.66281L3.36027 0.947181C3.34449 0.934761 3.32553 0.927042 3.30557 0.924912C3.2856 0.922781 3.26544 0.926325 3.2474 0.935136C3.22936 0.943947 3.21417 0.957668 3.20357 0.974724C3.19298 0.99178 3.18741 1.01148 3.1875 1.03156V2.06682C3.1875 2.13245 3.2183 2.1954 3.2692 2.23557L8.09063 6.00031L3.2692 9.76504C3.21697 9.80522 3.1875 9.86816 3.1875 9.93379V10.9691C3.1875 11.0588 3.29063 11.1083 3.36027 11.0534L9.39777 6.33781C9.44908 6.29778 9.4906 6.24658 9.51915 6.18809C9.5477 6.12961 9.56254 6.06539 9.56254 6.00031C9.56254 5.93523 9.5477 5.871 9.51915 5.81252C9.4906 5.75404 9.44908 5.70283 9.39777 5.66281Z" fill="black" fill-opacity="0.45"/>
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

      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const mouseOffset = parseInt(ContextUtil.getProperty(options, "mouse_offset", 0));

      if (windowWidth - clickCoordsX < menuWidth) {
        menu.style.left = clickCoordsX - menuWidth + mouseOffset + scrollX + "px";
      } else {
        menu.style.left = clickCoordsX + mouseOffset + scrollX + "px";
      }

      if (windowHeight - clickCoordsY < menuHeight) {
        menu.style.top = clickCoordsY - menuHeight + mouseOffset + scrollY + "px";
      } else {
        menu.style.top = clickCoordsY + mouseOffset + scrollY + "px";
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
              // icon: `<i class="ph-light ph-plus-circle green"></i>`,
              icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.125 6H7.875" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 4.125V7.875" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
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
              icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.125 6H7.875" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
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
      ...(!isGroup()
        ? [
            {
              text: `<span>Edit</span>`,
              icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.34531 10.125H2.25C2.15055 10.125 2.05516 10.0855 1.98484 10.0152C1.91451 9.94484 1.875 9.84945 1.875 9.75V7.65469C1.87483 7.60599 1.88427 7.55774 1.90277 7.5127C1.92127 7.46765 1.94847 7.4267 1.98281 7.39218L7.60782 1.76718C7.64271 1.73175 7.6843 1.70361 7.73017 1.68441C7.77604 1.6652 7.82527 1.65531 7.875 1.65531C7.92473 1.65531 7.97396 1.6652 8.01983 1.68441C8.0657 1.70361 8.1073 1.73175 8.14219 1.76718L10.2328 3.85781C10.2682 3.8927 10.2964 3.9343 10.3156 3.98017C10.3348 4.02604 10.3447 4.07527 10.3447 4.125C10.3447 4.17473 10.3348 4.22396 10.3156 4.26983C10.2964 4.3157 10.2682 4.35729 10.2328 4.39218L4.60782 10.0172C4.5733 10.0515 4.53235 10.0787 4.4873 10.0972C4.44226 10.1157 4.39401 10.1252 4.34531 10.125V10.125Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.375 3L9 5.625" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
              events: {
                click: () =>
                  sendMessage({
                    message: "OPEN_EDIT_LOCATOR",
                    param: { value: predictedElements[0] },
                  }),
              },
            },
            {
              type: ContextMenu.DIVIDER,
            },
          ]
        : []),
        ...(isGroup()
        ? [
            {
              type: ContextMenu.DIVIDER,
            },
            {
              text: "Select element",
              icon: `<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.87498 5.25V4.6875C7.87498 4.43886 7.77621 4.2004 7.60039 4.02459C7.42458 3.84877 7.18612 3.75 6.93748 3.75C6.68884 3.75 6.45038 3.84877 6.27457 4.02459C6.09875 4.2004 5.99998 4.43886 5.99998 4.6875V1.6875C5.99998 1.43886 5.90121 1.2004 5.72539 1.02459C5.54958 0.848772 5.31112 0.75 5.06248 0.75C4.81384 0.75 4.57538 0.848772 4.39957 1.02459C4.22375 1.2004 4.12498 1.43886 4.12498 1.6875V7.37344L3.09842 5.59219C2.9741 5.37649 2.76918 5.21902 2.52876 5.1544C2.28833 5.08979 2.03208 5.12334 1.81639 5.24766C1.60069 5.37198 1.44321 5.57689 1.3786 5.81732C1.31399 6.05774 1.34753 6.31399 1.47185 6.52969C2.99998 9.75 3.9281 10.875 5.99998 10.875C6.49244 10.875 6.98007 10.778 7.43504 10.5895C7.89001 10.4011 8.30341 10.1249 8.65163 9.77665C8.99985 9.42843 9.27607 9.01503 9.46453 8.56006C9.65298 8.10509 9.74998 7.61746 9.74998 7.125V5.25C9.74998 5.00136 9.65121 4.7629 9.47539 4.58709C9.29958 4.41127 9.06112 4.3125 8.81248 4.3125C8.56384 4.3125 8.32538 4.41127 8.14957 4.58709C7.97375 4.7629 7.87498 5.00136 7.87498 5.25V5.25Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
              sub: [...getActiveElements()],
            },
          ]
        : []),
      {
        text: "Bring to front",
        icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 4.125H2.25C2.04289 4.125 1.875 4.29289 1.875 4.5V9.75C1.875 9.95711 2.04289 10.125 2.25 10.125H7.5C7.70711 10.125 7.875 9.95711 7.875 9.75V4.5C7.875 4.29289 7.70711 4.125 7.5 4.125Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.5 1.875H6.75" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.375 1.875H9.75C9.84946 1.875 9.94484 1.91451 10.0152 1.98484C10.0855 2.05516 10.125 2.15054 10.125 2.25V2.625" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.125 5.25V4.5" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.375 7.875H9.75C9.84946 7.875 9.94484 7.83549 10.0152 7.76517C10.0855 7.69484 10.125 7.59946 10.125 7.5V7.125" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.875 1.875H4.5C4.40054 1.875 4.30516 1.91451 4.23484 1.98484C4.16451 2.05516 4.125 2.15054 4.125 2.25V2.625" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
        events: {
          click: () => chrome.storage.local.set({ JDN_BRING_TO_FRONT: { hash: Date.now(), predictedElements } }),
        },
      },
      {
        text: "Send to back",
        icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.625 10.125H2.25C2.15054 10.125 2.05516 10.0855 1.98484 10.0152C1.91451 9.94484 1.875 9.84946 1.875 9.75V9.375" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.25 4.125H4.125" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.25 10.125H4.5" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.875 7.875V6.75" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.875 7.5V6.75" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.125 10.125H7.5C7.59946 10.125 7.69484 10.0855 7.76517 10.0152C7.83549 9.94484 7.875 9.84946 7.875 9.75V9.375" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.125 4.125H7.5C7.59946 4.125 7.69484 4.16451 7.76517 4.23484C7.83549 4.30516 7.875 4.40054 7.875 4.5V4.875" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.625 4.125H2.25C2.15054 4.125 2.05516 4.16451 1.98484 4.23484C1.91451 4.30516 1.875 4.40054 1.875 4.5V4.875" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.875 7.875H9.75C9.84946 7.875 9.94484 7.83549 10.0152 7.76517C10.0855 7.69484 10.125 7.59946 10.125 7.5V2.25C10.125 2.15054 10.0855 2.05516 10.0152 1.98484C9.94484 1.91451 9.84946 1.875 9.75 1.875H4.5C4.40054 1.875 4.30516 1.91451 4.23484 1.98484C4.16451 2.05516 4.125 2.15054 4.125 2.25V4.125" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
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
              icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.125 2.625H1.875" stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.875 4.875V7.875" stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.125 4.875V7.875" stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.375 2.625V9.75C9.375 9.84946 9.33549 9.94484 9.26517 10.0152C9.19484 10.0855 9.09946 10.125 9 10.125H3C2.90054 10.125 2.80516 10.0855 2.73484 10.0152C2.66451 9.94484 2.625 9.84946 2.625 9.75V2.625" stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.875 2.625V1.875C7.875 1.67609 7.79598 1.48532 7.65533 1.34467C7.51468 1.20402 7.32391 1.125 7.125 1.125H4.875C4.67609 1.125 4.48532 1.20402 4.34467 1.34467C4.20402 1.48532 4.125 1.67609 4.125 1.875V2.625" stroke="#FF4D4F" stroke-linecap="round" stroke-linejoin="round"/>
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
    ];
    return menuItems;
  };

  const renderGenerationOption = () => {
    if (areInProgress()) {
      return [
        {
          text: `<span>Pause generation</span>`,
          icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.375 1.875H7.6875C7.48039 1.875 7.3125 2.04289 7.3125 2.25V9.75C7.3125 9.95711 7.48039 10.125 7.6875 10.125H9.375C9.58211 10.125 9.75 9.95711 9.75 9.75V2.25C9.75 2.04289 9.58211 1.875 9.375 1.875Z"
            stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4.3125 1.875H2.625C2.41789 1.875 2.25 2.04289 2.25 2.25V9.75C2.25 9.95711 2.41789 10.125 2.625 10.125H4.3125C4.51961 10.125 4.6875 9.95711 4.6875 9.75V2.25C4.6875 2.04289 4.51961 1.875 4.3125 1.875Z"
            stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
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
          <path d="M10.6922 5.68084L3.94687 1.55584C3.89009 1.52081 3.82499 1.50157 3.75829 1.50009C3.69159 1.49862 3.6257 1.51496 3.56743 1.54744C3.50915 1.57993 3.4606 1.62737 3.42677 1.68487C3.39294 1.74238 3.37507 1.80787 3.375 1.87459V10.1246C3.37507 10.1913 3.39294 10.2568 3.42677 10.3143C3.4606 10.3718 3.50915 10.4192 3.56743 10.4517C3.6257 10.4842 3.69159 10.5006 3.75829 10.4991C3.82499 10.4976 3.89009 10.4784 3.94687 10.4433L10.6922 6.31834C10.7476 6.28558 10.7935 6.23896 10.8254 6.18307C10.8572 6.12717 10.874 6.06394 10.874 5.99959C10.874 5.93524 10.8572 5.872 10.8254 5.81611C10.7935 5.76021 10.7476 5.71359 10.6922 5.68084V5.68084Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
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
        <path d="M8.91556 8.91563C8.33881 9.49286 7.60381 9.88606 6.80354 10.0455C6.00328 10.2049 5.17371 10.1234 4.41977 9.81133C3.66583 9.49921 3.02139 8.9705 2.56798 8.29208C2.11457 7.61365 1.87256 6.81599 1.87256 6C1.87256 5.18401 2.11457 4.38635 2.56798 3.70792C3.02139 3.0295 3.66583 2.50079 4.41977 2.18868C5.17371 1.87656 6.00328 1.79507 6.80354 1.95451C7.60381 2.11395 8.33881 2.50715 8.91556 3.08438L10.5093 4.67344" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
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
    const isMacPlatform = window.navigator?.userAgent.indexOf("Mac") != -1;
    if (isMacPlatform && event.ctrlKey) return;

    const highlightTarget = event.target.closest("[jdn-highlight=true]");
    if (!highlightTarget) return;

    event.preventDefault();

    setTimeout(() => {
      contextEvent = event;

      sendMessage({
        message: "GET_ACTIVE_ELEMENTS",
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
      case "KILL_HIGHLIGHT":
        elementMenu && elementMenu.hide();
        break;
    }
  });
};
