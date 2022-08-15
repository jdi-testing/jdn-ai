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
      const el = document.querySelector(".cm--selected");
      if (el) {
        el.classList.remove("cm--selected");
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

  const menuItems = (element, types) => {
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
        type: ContextMenu.DIVIDER,
      },
      {
        text: `<span>Edit</span>
      <span><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.57843 12.1013L2.10457 8.41825L5.26143 11.5751L1.57843 12.1013Z" fill="white"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9726 3.86385C13.3631 3.47332 13.3631 2.84016 12.9726 2.44963L11.2299 0.706985C10.8394 0.316461 10.2062 0.31646 9.81572 0.706985L9.47052 1.05219L12.6273 4.20902L11.5751 5.2613L8.41823 2.10447L3.15682 7.36589L6.31368 10.5227L12.9726 3.86385Z" fill="white"/>
      </svg>
      </i>`,
        events: {
          click: () => chrome.storage.sync.set({ OPEN_EDIT_LOCATOR: { isOpen: true, value: element, types } }),
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
        type: ContextMenu.DIVIDER,
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
      },
    ];

    const generationOption = renderGenerationOption(element_id, locator);
    if (generationOption) menuItems.splice(3, 0, generationOption);
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
    }
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
    if (locator.taskStatus === "FAILURE") {
      return {
        text: `<span>Retry</span>
        <span>
          <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="fill: white;">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.02846 8.10606C2.10043 6.29947 3.06937 4.56615 4.7523 3.59451C7.36109 2.08832 10.6972 2.98222 12.2033 5.59101C13.0298 7.02242 12.9935 8.52768 12.5002 9.80985C12.0101 11.0836 11.0644 12.1533 10.0364 12.7468L9.69548 12.1564C10.5866 11.6419 11.429 10.6951 11.8638 9.56503C12.2953 8.44342 12.3205 7.15764 11.6129 5.93192C10.295 3.64924 7.37589 2.86707 5.09321 4.18498C3.62125 5.03481 2.77279 6.55048 2.70974 8.1332L2.02846 8.10606Z" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.90343 8.10094C1.97703 6.25331 2.96805 4.48008 4.68967 3.4861C7.35825 1.9454 10.7708 2.85978 12.3115 5.52836C13.1597 6.9975 13.1213 8.54301 12.6167 9.85458C12.1165 11.1546 11.1519 12.2469 10.0988 12.8549C10.039 12.8894 9.96253 12.869 9.92801 12.8092L9.5871 12.2187C9.55258 12.1589 9.57307 12.0825 9.63285 12.0479C10.4988 11.548 11.3224 10.6237 11.747 9.51999C12.1672 8.42786 12.1904 7.1823 11.5045 5.99427C10.2211 3.77137 7.37847 3.00969 5.15558 4.29308C3.72229 5.12059 2.89592 6.59636 2.83451 8.13803C2.83319 8.17115 2.81876 8.2024 2.79441 8.22489C2.77005 8.24738 2.73776 8.25927 2.70463 8.25795L2.02335 8.23081C1.95437 8.22806 1.90068 8.16992 1.90343 8.10094ZM2.15967 7.98604L2.59127 8.00324C2.69449 6.42492 3.55871 4.92636 5.03058 4.07657C7.37305 2.72415 10.3686 3.5268 11.721 5.86927C12.4504 7.13266 12.4232 8.45868 11.9804 9.60976C11.5529 10.7209 10.7409 11.6593 9.86517 12.2003L10.0812 12.5744C11.0425 11.9841 11.9206 10.9675 12.3834 9.76481C12.8654 8.51205 12.8996 7.04703 12.095 5.65336C10.6233 3.10436 7.36367 2.23094 4.81467 3.70261C3.20922 4.62952 2.26863 6.26583 2.15967 7.98604Z" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.75646 8.09492C1.832 6.1988 2.8491 4.37841 4.61645 3.35803C7.35568 1.77653 10.8586 2.71512 12.4401 5.45436C13.314 6.9681 13.2732 8.56117 12.7552 9.90749C12.2431 11.2387 11.2561 12.3575 10.1733 12.9827C10.0428 13.058 9.87603 13.0133 9.80072 12.8829L9.45981 12.2924C9.3845 12.162 9.42919 11.9952 9.55963 11.9199C10.396 11.437 11.1971 10.5394 11.6098 9.4668C12.0166 8.4095 12.0374 7.2115 11.3772 6.06799C10.1346 3.91576 7.38232 3.17828 5.23009 4.42088C3.8425 5.222 3.04224 6.65063 2.98276 8.14377C2.97988 8.21604 2.94841 8.28422 2.89527 8.33329C2.84213 8.38235 2.77167 8.4083 2.69939 8.40543L2.01812 8.37829C1.86761 8.37229 1.75047 8.24542 1.75646 8.09492ZM2.31951 7.8444L2.45596 7.84984C2.60388 6.27745 3.48571 4.79816 4.95736 3.9485C7.37048 2.55528 10.4564 3.38214 11.8496 5.79527C12.6047 7.10319 12.5751 8.47675 12.1189 9.66266C11.6996 10.7525 10.9207 11.681 10.0643 12.2485L10.1326 12.3668C11.0157 11.7839 11.8156 10.8306 12.2461 9.71163C12.7148 8.49362 12.7466 7.07616 11.9677 5.72708C10.5368 3.24874 7.36752 2.39953 4.88918 3.83041C3.37535 4.70442 2.46936 6.22715 2.31951 7.8444Z" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.63143 8.08979C1.7086 6.15265 2.74777 4.29234 4.55382 3.24962C7.35284 1.63361 10.9322 2.59268 12.5482 5.3917C13.4439 6.9432 13.401 8.57652 12.8717 9.95222C12.3495 11.3097 11.3436 12.4511 10.2356 13.0908C10.0454 13.2006 9.80216 13.1355 9.69233 12.9452L9.35142 12.3548C9.24159 12.1645 9.30677 11.9213 9.497 11.8115C10.3082 11.3431 11.0905 10.468 11.493 9.42176C11.8884 8.39397 11.9073 7.23619 11.2688 6.13034C10.0607 4.03789 7.38491 3.3209 5.29246 4.52898C3.94352 5.30778 3.16538 6.69652 3.10753 8.14859C3.10333 8.25399 3.05744 8.35341 2.97994 8.42497C2.90244 8.49653 2.79969 8.53437 2.69429 8.53017L2.01301 8.50303C1.79352 8.49429 1.62269 8.30927 1.63143 8.08979ZM4.67882 3.46613C2.95017 4.46417 1.95513 6.24464 1.88123 8.09974C1.87798 8.18126 1.94144 8.24998 2.02296 8.25323L2.70424 8.28037C2.74339 8.28193 2.78155 8.26787 2.81034 8.2413C2.83912 8.21472 2.85617 8.17779 2.85773 8.13864C2.91885 6.60443 3.74121 5.13592 5.16746 4.31247C7.37948 3.03536 10.2082 3.79332 11.4853 6.00534C12.1673 7.1865 12.1445 8.42473 11.7263 9.51153C11.3035 10.6105 10.4834 11.5306 9.622 12.028C9.55134 12.0688 9.52714 12.1591 9.56793 12.2298L9.90884 12.8202C9.94963 12.8909 10.04 12.9151 10.1106 12.8743C11.1684 12.2636 12.1364 11.1673 12.6384 9.86245C13.1451 8.54551 13.1838 6.99269 12.3317 5.5167C10.7847 2.83726 7.35826 1.91915 4.67882 3.46613ZM2.19491 7.83272C2.34834 6.17682 3.27611 4.61715 4.82655 3.722C7.36468 2.25661 10.6104 3.1263 12.0758 5.66443C12.8765 7.05122 12.8426 8.50892 12.3627 9.75636C11.9227 10.8999 11.1059 11.8739 10.2013 12.471C10.1726 12.49 10.1373 12.4962 10.1037 12.4883C10.0702 12.4804 10.0414 12.459 10.0242 12.4292L9.95591 12.3109C9.92288 12.2537 9.94006 12.1806 9.99511 12.1442C10.8302 11.5908 11.5922 10.6829 12.0021 9.61763C12.447 8.46116 12.4746 7.12784 11.7412 5.85761C10.3825 3.50427 7.37307 2.6979 5.01973 4.0566C3.58462 4.88516 2.72457 6.32759 2.58027 7.86139C2.57405 7.92752 2.51721 7.97723 2.45085 7.97459L2.3144 7.96915C2.28014 7.96779 2.24794 7.9524 2.22534 7.92661C2.20275 7.90081 2.19175 7.86686 2.19491 7.83272Z" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.98278 8.34236L0.619141 5.98047L1.20961 5.63956L2.40279 7.70621L4.46945 6.51303L4.81036 7.1035L2.44847 8.46714C2.28541 8.56128 2.07692 8.50541 1.98278 8.34236Z" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.511719 6.04282C0.477201 5.98304 0.497685 5.90659 0.557472 5.87207L1.14794 5.53116C1.20773 5.49664 1.28418 5.51713 1.3187 5.57691L2.44938 7.53531L4.40778 6.40463C4.46756 6.37011 4.54401 6.3906 4.57853 6.45038L4.91944 7.04086C4.95396 7.10064 4.93347 7.17709 4.87369 7.21161L2.5118 8.57525C2.28896 8.7039 2.00401 8.62755 1.87536 8.40471L0.511719 6.04282ZM0.790725 6.02608L2.09186 8.27971C2.15148 8.38298 2.28353 8.41836 2.3868 8.35874L4.64043 7.0576L4.42452 6.68364L2.46613 7.81432C2.40634 7.84884 2.32989 7.82835 2.29537 7.76857L1.16469 5.81017L0.790725 6.02608Z" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.383434 6.11705C0.308122 5.9866 0.352816 5.81981 0.483259 5.7445L1.07373 5.40359C1.20417 5.32828 1.37097 5.37297 1.44628 5.50341L2.5031 7.33387L4.33356 6.27706C4.46401 6.20174 4.6308 6.24644 4.70612 6.37688L5.04703 6.96735C5.12234 7.0978 5.07764 7.26459 4.9472 7.33991L2.58531 8.70354C2.29182 8.87299 1.91652 8.77243 1.74707 8.47894L0.383434 6.11705ZM0.992175 6.08051L2.21945 8.20621C2.23828 8.23882 2.27997 8.24999 2.31259 8.23116L4.43828 7.00389L4.3701 6.8858L2.53964 7.94262C2.4092 8.01793 2.2424 7.97323 2.16709 7.84279L1.11027 6.01233L0.992175 6.08051Z" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.275036 6.1794C0.165206 5.98917 0.230384 5.74593 0.420614 5.6361L1.01109 5.29519C1.20132 5.18536 1.44456 5.25054 1.55439 5.44077L2.54871 7.16298L4.27092 6.16866C4.46115 6.05883 4.70439 6.12401 4.81422 6.31424L5.15513 6.90471C5.26496 7.09494 5.19979 7.33818 5.00955 7.44801L2.64767 8.81165C2.29438 9.01562 1.84264 8.89457 1.63867 8.54129L0.275036 6.1794ZM0.545614 5.8526C0.474957 5.8934 0.450748 5.98375 0.491542 6.0544L1.85518 8.41629C1.99011 8.65 2.28896 8.73008 2.52267 8.59514L4.88455 7.23151C4.95521 7.19071 4.97942 7.10037 4.93863 7.02971L4.59772 6.43924C4.55692 6.36858 4.46658 6.34437 4.39592 6.38516L2.56546 7.44198C2.50567 7.4765 2.42922 7.45602 2.3947 7.39623L1.33788 5.56577C1.29709 5.49511 1.20674 5.4709 1.13609 5.51169L0.545614 5.8526ZM0.883777 6.14286C0.849259 6.08308 0.869743 6.00663 0.92953 5.97211L1.04762 5.90393C1.10741 5.86941 1.18386 5.8899 1.21838 5.94968L2.2752 7.78015C2.31599 7.8508 2.40634 7.87501 2.47699 7.83422L4.30746 6.7774C4.36724 6.74288 4.44369 6.76337 4.47821 6.82315L4.54639 6.94125C4.58091 7.00103 4.56043 7.07748 4.50064 7.112L2.37494 8.33927C2.28254 8.39262 2.16439 8.36096 2.11105 8.26856L0.883777 6.14286ZM2.29628 8.08939L2.29915 8.09436L2.30412 8.09149C2.3015 8.09081 2.29888 8.09011 2.29628 8.08939Z" />
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

    if (message === "PING_SCRIPT" && param.scriptName === "runContextMenu") {
      sendResponse({ message: true });
    }
  };

  runDocumentListeners();
  chrome.runtime.onMessage.addListener(messageHandler);
};
