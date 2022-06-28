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
        sendMessage({
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

      const menu = document.getElementById("jdn_cm_" + num);

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
      document.getElementById("jdn_cm_" + num).classList.remove("display");
      removeHighlight();
      window.removeEventListener("click", documentClick);
    };

    this.remove = function() {
      document.getElementById("jdn_cm_" + num).remove();
      removeHighlight();
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
  // <-----

  /* global chrome */

  let elementMenu;
  let contextEvent;
  let predictedElement;

  const menuItems = (
      element,
      types
  ) => {
    const { element_id, locator, generate, jdnHash } = element;
    const menuItems = [
      {
        text: `${!generate ? "Select" : "Unselect"} locator`,
        events: {
          click: () =>
            sendMessage({
              message: "TOGGLE_ELEMENT",
              param: element_id,
            }),
        },
      },
      {
        "type": ContextMenu.DIVIDER
      },
      {
        text: `<span>Edit</span>
      <span><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.57843 12.1013L2.10457 8.41825L5.26143 11.5751L1.57843 12.1013Z" fill="white"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9726 3.86385C13.3631 3.47332 13.3631 2.84016 12.9726 2.44963L11.2299 0.706985C10.8394 0.316461 10.2062 0.31646 9.81572 0.706985L9.47052 1.05219L12.6273 4.20902L11.5751 5.2613L8.41823 2.10447L3.15682 7.36589L6.31368 10.5227L12.9726 3.86385Z" fill="white"/>
      </svg>
      </i>`,
        events: {
          click: () => chrome.storage.sync.set({ OPEN_EDIT_LOCATOR: { isOpen: true, value: element, types} })
        },
      },
      {
        text: `<span class="cm_container_warning-option">Delete</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M2.23828 2.72394C2.23828 2.45612 2.45144 2.23901 2.71439 2.23901H11.2844C11.5474 2.23901 11.7606 2.45612 11.7606 2.72394V13.3924C11.7606 13.6602 11.5474 13.8773 11.2844 13.8773H2.71439C2.45144 13.8773 2.23828 13.6602 2.23828 13.3924V2.72394ZM3.19051 3.20887V12.9075H10.8083V3.20887H3.19051Z" fill="#D82C15"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M2.11523 2.72419C2.11523 2.39068 2.38127 2.11646 2.71415 2.11646H11.2842C11.6171 2.11646 11.8831 2.39068 11.8831 2.72419V13.3927C11.8831 13.7262 11.6171 14.0004 11.2842 14.0004H2.71415C2.38127 14.0004 2.11523 13.7262 2.11523 13.3927V2.72419ZM2.71415 2.36207C2.52114 2.36207 2.36085 2.52206 2.36085 2.72419V13.3927C2.36085 13.5948 2.52114 13.7548 2.71415 13.7548H11.2842C11.4772 13.7548 11.6375 13.5948 11.6375 13.3927V2.72419C11.6375 2.52206 11.4772 2.36207 11.2842 2.36207H2.71415ZM3.06746 3.20912C3.06746 3.1413 3.12244 3.08632 3.19027 3.08632H10.8081C10.8759 3.08632 10.9309 3.1413 10.9309 3.20912V12.9077C10.9309 12.9756 10.8759 13.0305 10.8081 13.0305H3.19027C3.12244 13.0305 3.06746 12.9756 3.06746 12.9077V3.20912ZM3.31308 3.33193V12.7849H10.6853V3.33193H3.31308Z" fill="#D82C15"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M0.123047 2.76803C0.123047 2.47586 0.342977 2.23901 0.614275 2.23901H13.3862C13.6575 2.23901 13.8774 2.47586 13.8774 2.76803C13.8774 3.0602 13.6575 3.29704 13.3862 3.29704H0.614275C0.342977 3.29704 0.123047 3.0602 0.123047 2.76803Z" fill="#D82C15"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.76828C0 2.41701 0.266501 2.11646 0.614035 2.11646H13.386C13.7335 2.11646 14 2.41701 14 2.76828C14 3.11954 13.7335 3.4201 13.386 3.4201H0.614035C0.266501 3.4201 0 3.11954 0 2.76828ZM0.614035 2.36207C0.418974 2.36207 0.245614 2.53521 0.245614 2.76828C0.245614 3.00135 0.418974 3.17448 0.614035 3.17448H13.386C13.581 3.17448 13.7544 3.00135 13.7544 2.76828C13.7544 2.53521 13.581 2.36207 13.386 2.36207H0.614035Z" fill="#D82C15"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M3.29688 0.652062C3.29688 0.359895 3.53372 0.123047 3.82589 0.123047H10.1741C10.4662 0.123047 10.7031 0.359895 10.7031 0.652062C10.7031 0.944229 10.4662 1.18108 10.1741 1.18108H3.82589C3.53372 1.18108 3.29688 0.944229 3.29688 0.652062Z" fill="#D82C15"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M3.17383 0.651822C3.17383 0.291831 3.46566 0 3.82565 0H10.1738C10.5338 0 10.8257 0.291831 10.8257 0.651822C10.8257 1.01181 10.5338 1.30364 10.1738 1.30364H3.82565C3.46566 1.30364 3.17383 1.01181 3.17383 0.651822ZM3.82565 0.245614C3.60131 0.245614 3.41944 0.42748 3.41944 0.651822C3.41944 0.876164 3.60131 1.05803 3.82565 1.05803H10.1738C10.3982 1.05803 10.58 0.876164 10.58 0.651822C10.58 0.42748 10.3982 0.245614 10.1738 0.245614H3.82565Z" fill="#D82C15"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.56417 5.03467C5.85634 5.03467 6.09319 5.27152 6.09319 5.56368V10.8538C6.09319 11.146 5.85634 11.3828 5.56417 11.3828C5.272 11.3828 5.03516 11.146 5.03516 10.8538V5.56368C5.03516 5.27152 5.272 5.03467 5.56417 5.03467Z" fill="#D82C15"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M4.91211 5.56393C4.91211 5.20394 5.20394 4.91211 5.56393 4.91211C5.92392 4.91211 6.21575 5.20394 6.21575 5.56393V10.8541C6.21575 11.2141 5.92392 11.5059 5.56393 11.5059C5.20394 11.5059 4.91211 11.2141 4.91211 10.8541V5.56393ZM5.56393 5.15772C5.33959 5.15772 5.15772 5.33959 5.15772 5.56393V10.8541C5.15772 11.0784 5.33959 11.2603 5.56393 11.2603C5.78827 11.2603 5.97014 11.0784 5.97014 10.8541V5.56393C5.97014 5.33959 5.78827 5.15772 5.56393 5.15772Z" fill="#D82C15"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8.51144 5.03467C8.8036 5.03467 9.04045 5.27152 9.04045 5.56368V10.8538C9.04045 11.146 8.8036 11.3828 8.51144 11.3828C8.21927 11.3828 7.98242 11.146 7.98242 10.8538V5.56368C7.98242 5.27152 8.21927 5.03467 8.51144 5.03467Z" fill="#D82C15"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M7.85938 5.56344C7.85938 5.20345 8.15121 4.91162 8.5112 4.91162C8.87119 4.91162 9.16302 5.20345 9.16302 5.56344V10.8536C9.16302 11.2136 8.87119 11.5054 8.5112 11.5054C8.15121 11.5054 7.85938 11.2136 7.85938 10.8536V5.56344ZM8.5112 5.15724C8.28685 5.15724 8.10499 5.3391 8.10499 5.56344V10.8536C8.10499 11.0779 8.28685 11.2598 8.5112 11.2598C8.73554 11.2598 8.91741 11.0779 8.91741 10.8536V5.56344C8.91741 5.3391 8.73554 5.15724 8.5112 5.15724Z" fill="#D82C15"/>
        </svg>`,
        events: {
          click: () =>
            sendMessage({
              message: "REMOVE_ELEMENT",
              param: element_id,
            }),
        },
      },
      {
        "type": ContextMenu.DIVIDER
      },
      {
        text: `Bring to front`,
        events: {
          click: () => chrome.storage.local.set({ JDN_BRING_TO_FRONT: { hash: Date.now(), jdnHash } }),
        },
      },
      {
        text: `Bring to background`,
        events: {
          click: () => chrome.storage.local.set({ JDN_BRING_TO_BACKGROUND: { hash: Date.now(), jdnHash } }),
        },
      }
    ];

    const generationOption = renderGenerationOption(element_id, locator);
    if (generationOption) menuItems.splice(5, 0, generationOption);
    return menuItems;
  };

  const renderGenerationOption = (element_id, locator) => {
    if (locator.taskStatus === "PENDING" || locator.taskStatus === "STARTED") {
      return {
        text: `<span>Stop generation</span>
        <span>
        <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="2" height="11" rx="1" fill="white"/>
          <rect x="5" width="2" height="11" rx="1" fill="white"/>
        </svg>
        </span>`,
        events: {
          click: () =>
            sendMessage({
              message: "STOP_GENERATION",
              param: element_id,
            }),
        },
      };
    };
    if (locator.taskStatus === "REVOKED") {
      return {
        text: `<span>Rerun</span>
        <span>
          <svg width="8" height="11" viewBox="0 0 8 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 10V1L7 5.5L1 10Z" fill="white" stroke="white" stroke-width="1.75" stroke-linejoin="round"/>
          </svg>
        </span>`,
        events: {
          click: () =>
            sendMessage({
              message: "RERUN_GENERATION",
              param: element_id,
            }),
        },
      };
    }
  };

  const contextMenuListener = (event) => {
    const highlightTarget = event.target.closest("[jdn-highlight=true]");
    if (!highlightTarget) return;
    event.preventDefault();
    contextEvent = event;

    sendMessage({
      message: "GET_ELEMENT",
      param: highlightTarget.id,
    }).then(({ element, types }) => {
      if (!element) return;
      predictedElement = element;
      types = types;
      elementMenu && elementMenu.remove();
      elementMenu = new ContextMenu(menuItems(element, types));
      elementMenu.display(contextEvent);
      const el = document.getElementById(predictedElement.jdnHash);

      sendMessage({
        message: "CM_ELEMENT_HIGHLIGHT_ON",
        param: predictedElement.element_id,
      });

      el?.classList?.add("cm--selected");
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
