export const runContextMenu = () => {
  /*
  origin https://www.cssscript.com/multi-level-context-menu/
  ----->
*/

  const MODAL_CLOSE_TIMEOUT = 2000;

  function ContextMenu(menu, options) {
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

    function removeHighlight() {
      const el = document.querySelector('.cm--selected');
      if (el) {
        el.classList.remove('cm--selected');
        chrome.runtime.sendMessage({
          message: "CM_ELEMENT_HIGHLIGHT_OFF",
          param: el.id,
      });
      }
    }

    window.addEventListener("resize", onResize);

    this.setOptions = function(_options) {
      if (typeof _options === "object") {
        options = _options;
      } else {
        throw new Error("Parameter 1 must be of type object");
      }
    };

    this.changeOption = function(option, value) {
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

    this.getOptions = function() {
      return options;
    };

    this.reload = function() {
      if (document.getElementById("cm_" + num) == null) {
        const cnt = document.createElement("div");
        cnt.className = "cm_container";
        cnt.id = "cm_" + num;

        document.body.appendChild(cnt);
      }

      const container = document.getElementById("cm_" + num);
      container.innerHTML = "";

      container.appendChild(renderLevel(menu));
    };

    function renderLevel(level) {
      const ul_outer = document.createElement("ul");

      level.forEach(function(item) {
        const li = document.createElement("li");
        li.menu = self;

        if (typeof item.type === "undefined") {
          const icon_span = document.createElement("span");
          icon_span.className = "cm_icon_span";

          if (ContextUtil.getProperty(item, "icon", "") != "") {
            icon_span.innerHTML = ContextUtil.getProperty(item, "icon", "");
          } else {
            icon_span.innerHTML = ContextUtil.getProperty(
                options,
                "default_icon",
                ""
            );
          }

          const text_span = document.createElement("span");
          text_span.className = "cm_text";

          if (ContextUtil.getProperty(item, "text", "") != "") {
            text_span.innerHTML = ContextUtil.getProperty(item, "text", "");
          } else {
            text_span.innerHTML = ContextUtil.getProperty(
                options,
                "default_text",
                "item"
            );
          }

          const sub_span = document.createElement("span");
          sub_span.className = "cm_sub_span";

          if (typeof item.sub !== "undefined") {
            if (ContextUtil.getProperty(options, "sub_icon", "") != "") {
              sub_span.innerHTML = ContextUtil.getProperty(
                  options,
                  "sub_icon",
                  ""
              );
            } else {
              sub_span.innerHTML = `<svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5L0.5 9.33013L0.5 0.669872L8 5Z" fill="white"/>
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

    this.display = function(e, target) {
      if (typeof target !== "undefined") {
        self.contextTarget = target;
      } else {
        self.contextTarget = e.target;
      }

      const menu = document.getElementById("cm_" + num);

      const clickCoords = { x: e.clientX, y: e.clientY };
      const clickCoordsX = clickCoords.x;
      const clickCoordsY = clickCoords.y;

      const menuWidth = menu.offsetWidth + 4;
      const menuHeight = menu.offsetHeight + 4;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const mouseOffset = parseInt(
          ContextUtil.getProperty(options, "mouse_offset", 2)
      );

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

    this.hide = function() {
      document.getElementById("cm_" + num).classList.remove("display");
      removeHighlight()
      window.removeEventListener("click", documentClick);
    };
    
    this.remove = function() {
      document.getElementById("cm_" + num).remove();
      removeHighlight()
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
    getProperty: function(options, opt, def) {
      if (typeof options[opt] !== "undefined") {
        return options[opt];
      } else {
        return def;
      }
    },

    getSizes: function(obj) {
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

  const changeElementNameModal = (element_id, name) => {
    // MODAL
    const modal = document.createElement('div');
    modal.classList.add("jdn-change-element-name-modal");

    // MODAL CLOSE LINK
    const modalCloseLink = document.createElement('a');
    modalCloseLink.innerHTML = "&#215;";
    modalCloseLink.classList.add('jdn-change-element-name-modal__close-link');
    modal.append(modalCloseLink);

    // MODAL TITLE
    const modalTitle = document.createElement('p');
    modalTitle.innerText = "Change Name";
    modalTitle.classList.add('jdn-change-element-name-modal__title');
    modal.append(modalTitle);

    // MODAL FORM
    const form = document.createElement('form');

    // MODAL FORM INPUT
    const formInput = document.createElement('input');
    formInput.classList.add('jdn-change-element-name-modal__form-input');
    formInput.value = name;
    form.append(formInput);

    // MODAL FORM BUTTON
    const formButton = document.createElement('button');
    formButton.classList.add('jdn-change-element-name-modal__form-button');
    formButton.innerText = "Save";
    form.append(formButton);

    // MODAL INITIALIZATION
    modal.append(form);
    document.body.appendChild(modal);
    formInput.focus();

    // ACTION: CHANGE ELEMENT NAME
    formButton.addEventListener("click", (event) => {
      event.preventDefault();
      chrome.runtime.sendMessage({
        message: "CHANGE_ELEMENT_NAME",
        param: { id: element_id, name: formInput.value },
      });
      nameBeenSuccessfullyChanged();
    });

    // ACTION: SHOW SUCCESS STATUS
    const nameBeenSuccessfullyChanged = () => {
      form.remove();
      modal.classList.add('jdn-change-element-name-modal--success');
      modalTitle.innerText = "Name Changed";
      modalTitle.classList.add("jdn-change-element-name-modal__title--success");
      setTimeout(() => {
        modal.remove();
      }, MODAL_CLOSE_TIMEOUT);
    };

    // ACTION: CLOSE MODAL
    modalCloseLink.addEventListener("click", () => modal.remove());
  };

  // <-----

  /* global chrome */

  let elementMenu;
  let contextEvent;
  let predictedElement;

  const menuItems = (
      { name, type, element_id, generate },
      types
  ) => [
    {
      text: `<span>Change name: ${name}</span> 
      <span class="cm_text_edit_icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.57843 12.1013L2.10457 8.41825L5.26143 11.5751L1.57843 12.1013Z" fill="white"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9726 3.86385C13.3631 3.47332 13.3631 2.84016 12.9726 2.44963L11.2299 0.706985C10.8394 0.316461 10.2062 0.31646 9.81572 0.706985L9.47052 1.05219L12.6273 4.20902L11.5751 5.2613L8.41823 2.10447L3.15682 7.36589L6.31368 10.5227L12.9726 3.86385Z" fill="white"/>
      </svg>
      </i>`,
      events: {
        click: () => changeElementNameModal(element_id, name),
      },
    },
    {
      text: `<span>Settings</span> 
      <span class="cm_text_edit_icon"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.09452 0C4.80712 0 4.56144 0.203156 4.50624 0.485156L4.30585 1.51406C3.81339 1.70028 3.35804 1.96044 2.95819 2.28867L1.97147 1.94883C1.69967 1.85523 1.40063 1.96762 1.25663 2.21602L0.351944 3.78398C0.208544 4.03298 0.260734 4.3491 0.477334 4.5375L1.26835 5.22539C1.22721 5.4782 1.20038 5.73557 1.20038 6C1.20038 6.26443 1.22721 6.5218 1.26835 6.77461L0.477334 7.4625C0.260734 7.6509 0.208544 7.96702 0.351944 8.21602L1.25663 9.78399C1.40003 10.033 1.69967 10.1453 1.97147 10.0523L2.95819 9.7125C3.35791 10.0405 3.81362 10.2998 4.30585 10.4859L4.50624 11.5148C4.56144 11.7968 4.80712 12 5.09452 12H6.90624C7.19364 12 7.43932 11.7968 7.49452 11.5148L7.69491 10.4859C8.18737 10.2997 8.64272 10.0396 9.04257 9.71133L10.0293 10.0512C10.3011 10.1448 10.6001 10.033 10.7441 9.78399L11.6488 8.21484C11.7922 7.96584 11.74 7.6509 11.5234 7.4625L10.7324 6.77461C10.7735 6.5218 10.8004 6.26443 10.8004 6C10.8004 5.73557 10.7735 5.4782 10.7324 5.22539L11.5234 4.5375C11.74 4.3491 11.7922 4.03298 11.6488 3.78398L10.7441 2.21602C10.6007 1.96702 10.3011 1.85466 10.0293 1.94766L9.04257 2.2875C8.64285 1.95948 8.18714 1.7002 7.69491 1.51406L7.49452 0.485156C7.43932 0.203156 7.19364 0 6.90624 0H5.09452ZM6.00038 3.6C7.32578 3.6 8.40038 4.6746 8.40038 6C8.40038 7.3254 7.32578 8.4 6.00038 8.4C4.67498 8.4 3.60038 7.3254 3.60038 6C3.60038 4.6746 4.67498 3.6 6.00038 3.6Z" fill="white"/>
      </svg>      
      </span>`,
      events: {
        click: () => chrome.runtime.sendMessage({
          message: "OPEN_XPATH_CONFIG",
          param: [element_id],
        }),
      },
    },
    {
      text: `<b>Block type: ${type}</b>`,
      sub: typesMenu(types),
    },
    {
      text: `Switch ${generate ? "off" : "on"}`,
      events: {
        click: () =>
          chrome.runtime.sendMessage({
            message: "TOGGLE_ELEMENT",
            param: element_id,
          }),
      },
    },
    {
      text: `Bring to front`,
      events: {
        click: () => chrome.storage.local.set({ JDN_BRING_TO_FRONT: { hash: Date.now(), element_id } }),
      },
    },
    {
      text: `Bring to background`,
      events: {
        click: () => chrome.storage.local.set({ BRING_TO_BACKGROUND: { hash: Date.now(), element_id } }),
      },
    },
    {
      text: `<span class="cm_container_warning-option">Remove</span>`,
      events: {
        click: () =>
          chrome.runtime.sendMessage({
            message: "REMOVE_ELEMENT",
            param: element_id,
          }),
      },
    }
  ];

  const typesMenu = (types) => {
    return types
        .map((type) => {
          return {
            text: type.jdi,
            icon:
          type.label === predictedElement.predicted_label ? `<svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4.08L5.17241 8L12 1" stroke="#1582D8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ` : "",
            events: {
              click: () =>
                chrome.runtime.sendMessage({
                  message: "CHANGE_TYPE",
                  param: { id: predictedElement.element_id, newType: type.jdi },
                }),
            },
          };
        });
  };

  const contextMenuListener = (event) => {
    const highlightTarget = event.target.closest("[jdn-highlight=true]:not(.jdn-error)");
    if (highlightTarget) {
      event.preventDefault();
      contextEvent = event;
      chrome.runtime.sendMessage({
        message: "GET_ELEMENT",
        param: highlightTarget.id,
      });
    }
  };

  const mouseLeaveListener = () => {
    elementMenu && elementMenu.hide();
  };

  const runDocumentListeners = () => {
    document.oncontextmenu = contextMenuListener;
    document.addEventListener("mouseleave", mouseLeaveListener);
  };

  const messageHandler = ({ message, param }, sender, sendResponse) => {
    if (message === "ELEMENT_DATA") {
      if (!param.element) return;
      predictedElement = param.element;
      types = param.types;
      elementMenu && elementMenu.remove();
      elementMenu = new ContextMenu(menuItems(param.element, param.types));
      elementMenu.display(contextEvent);
      const el = document.getElementById(predictedElement.element_id);
      chrome.runtime.sendMessage({
        message: "CM_ELEMENT_HIGHLIGHT",
        param: predictedElement.element_id,
      });
        el?.classList?.add('cm--selected');
    }

    if (message === "HIGHLIGHT_TOGGLED") {
      predictedElement = param;
    }

    if (message === "PING_SCRIPT" && (param.scriptName === "runContextMenu")) {
      sendResponse({ message: true });
    }
  };

  runDocumentListeners();
  chrome.runtime.onMessage.addListener(messageHandler);
};
