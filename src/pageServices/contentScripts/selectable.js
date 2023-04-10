export const selectable = () => {
  let selectables;

  const sendMessage = (message) =>
    chrome.runtime.sendMessage(message).catch((error) => {
      if (error.message !== "The message port closed before a response was received.") throw new Error(error.message);
    });

  const runSelectable = () => {
    const keyForMultiSelect = window.navigator?.userAgent.indexOf("Mac") != -1 ? "metaKey" : "ctrlKey";
    if (selectables) {
      selectables.disable();
      selectables.enable();
      return;
    }
    selectables = new Selectables({
      elements: ".jdn-highlight",
      moreUsing: keyForMultiSelect,
      zone: "body",
      selectedClass: "jdn-active",
      onSelect: (payload) => {
        sendMessage({ message: "ELEMENT_GROUP_SET_ACTIVE", param: payload });
      },
      onDeselect: (payload) => {
        sendMessage({ message: "ELEMENT_GROUP_UNSET_ACTIVE", param: payload });
      },
    });

    Selectables.prototype.unselect = function (payload) {
      const opt = this.options;
      let query = "";

      if (Array.isArray(payload)) {
        payload.forEach(({ jdnHash }) => {
          query += `${!!query.length ? ", " : ""}[id='${jdnHash}']`;
        });
      } else query = `[id='${payload.jdnHash}']`;

      this.foreach(document.querySelectorAll(query), (element) => {
        if (element.classList.contains(opt.selectedClass)) {
          element.classList.remove(opt.selectedClass);
        }
      });
    };

    Selectables.prototype.setSelect = function (payload) {
      const opt = this.options;
      let query = "";

      if (Array.isArray(payload)) {
        payload.forEach(({ jdnHash }) => {
          query += `${!!query.length ? ", " : ""}[id='${jdnHash}']`;
        });
      } else query = `[id='${payload.jdnHash}']`;

      this.foreach(document.querySelectorAll(query), (element) => {
        if (!element.classList.contains(opt.selectedClass)) {
          element.classList.add(opt.selectedClass);
        }
      });
    };
  };

  const unsetActive = (payload) => selectables.unselect(payload);

  const setActive = (payload) => selectables.setSelect(payload);

  const messageHandler = ({ message, param }, sender, sendResponse) => {
    switch (message) {
      case "UNSET_ACTIVE":
        unsetActive(param);
        break;
      case "SET_ACTIVE":
        setActive(param);
        break;
      case "TOGGLE_ACTIVE_GROUP": {
        param.forEach((_loc) => (_loc.active ? setActive(_loc) : unsetActive(_loc)));
        break;
      }
      case "KILL_HIGHLIGHT":
        if (selectables) selectables = selectables.disable();
        break;
      case "PING_SCRIPT": {
        if (param.scriptName === "selectable") sendResponse({ message: true });
        break;
      }
    }
  };

  chrome.runtime.onMessage.addListener(messageHandler);

  chrome.storage.onChanged.addListener((event) => {
    if (event.hasOwnProperty("JDN_HIGHLIGHT_IS_SET")) runSelectable();
    if (event.hasOwnProperty("IS_DISCONNECTED")) selectables && (selectables = selectables.disable());
  });

  /*
   *   Selectables
   *
   *   v1.4.1
   *
   *   https://github.com/p34eu/Selectables.git
   */

  /* because it's an imported library */
  /* eslint-disable */

  function Selectables(opts) {
    "use strict";
    const defaults = {
      zone: "#wrapper", // ID of the element with selectables.
      elements: "a", //  items to be selectable .list-group, #id > .class,'htmlelement' - valid querySelectorAll
      selectedClass: "active", // class name to apply to selected items
      key: false, // 'altKey,ctrlKey,metaKey,false  // activate using optional key
      moreUsing: "shiftKey", // altKey,ctrlKey,metaKey   // add more to selection
      enabled: true, // false to .enable() at later time
      start: null, //  event on selection start
      stop: null, // event on selection end
      onSelect: null, // event fired on every item when selected.
      onDeselect: null, // event fired on every item when selected.
    };
    const extend = function extend(a, b) {
      for (const prop in b) {
        a[prop] = b[prop];
      }
      return a;
    };
    this.foreach = function (items, callback, scope) {
      if (Object.prototype.toString.call(items) === "[object Object]") {
        for (const prop in items) {
          if (Object.prototype.hasOwnProperty.call(items, prop)) {
            callback.call(scope, items[prop], prop, items);
          }
        }
      } else {
        for (let i = 0, len = items.length; i < len; i++) {
          callback.call(scope, items[i], i, items);
        }
      }
    };
    this.options = extend(defaults, opts || {});
    this.on = false;
    this.selectedItems = new Set;
    const self = this;
    this.enable = function () {
      if (this.on) {
        throw new Error(this.constructor.name + " :: is already enabled");
      }
      this.zone = document.querySelector(this.options.zone);
      if (!this.zone) {
        throw new Error(this.constructor.name + " :: no zone defined in options. Please use element with ID");
      }
      this.items = document.querySelectorAll(this.options.zone + " " + this.options.elements);
      this.disable();
      this.zone.addEventListener("mousedown", self.rectOpen);
      this.on = true;
      return this;
    };
    this.disable = function () {
      this.zone.removeEventListener("mousedown", self.rectOpen);
      this.on = false;
      return this;
    };
    const offset = function (el) {
      const r = el.getBoundingClientRect();
      return { top: r.top + document.body.scrollTop, left: r.left + document.body.scrollLeft };
    };
    this.isContextForGroup = function (e) {
      const target = e.target.closest("[jdn-highlight=true]");
      if (!target) return;
      return target.classList.contains(self.options.selectedClass) && e.button === 2;
    };
    this.rectOpen = function (e) {
      self.options.start && self.options.start(e);
      if (self.options.key && !e[self.options.key]) return;
      self.options.onDeselect && self.selectedItems.size && self.options.onDeselect(Array.from(self.selectedItems));

      document.body.classList.add("s-noselect");
      self.ipos = [e.pageX, e.pageY];
      if (!rb()) {
        const gh = document.createElement("div");
        gh.id = "s-rectBox";
        gh.style.left = e.pageX + "px";
        gh.style.top = e.pageY + "px";
        document.body.appendChild(gh);
      }
      document.body.addEventListener("mousemove", self.rectDraw);
      document.body.addEventListener("mouseup", self.select);
      document.body.addEventListener("mouseleave", self.select);
    };
    var rb = function () {
      return document.getElementById("s-rectBox");
    };
    const cross = function (a, b) {
      const aTop = offset(a).top;
      const aLeft = offset(a).left;
      const bTop = offset(b).top;
      const bLeft = offset(b).left;
      return !(
        aTop + a.offsetHeight < bTop ||
        aTop > bTop + b.offsetHeight ||
        aLeft + a.offsetWidth < bLeft ||
        aLeft > bLeft + b.offsetWidth
      );
    };
    const isPlainClick = function (element) {
      return (
        (!element.style.width || element.style.width === "0px") &&
        (!element.style.height || element.style.height === "0px")
      );
    };
    this.select = function (e) {
      const selected = new Set;
      const deselected = new Set;
      const a = rb();
      if (!a) {
        return;
      }
      delete self.ipos;
      document.body.classList.remove("s-noselect");
      document.body.removeEventListener("mousemove", self.rectDraw);
      document.body.removeEventListener("mouseup", self.select);
      document.body.removeEventListener("mouseleave", self.select);

      const s = self.options.selectedClass;
      const toggleActiveClass = function (el) {
        if (el.classList.contains(s)) {
          deselected.add(el.id);
          el.classList.remove(s);
        } else {
          selected.add(el.id);
          el.classList.add(s);
        }
      };
      if (isPlainClick(a)) {
        const highlightTarget = e.target.closest("[jdn-highlight=true]:not([id^='jdn-overlay'])");

        if (highlightTarget && !self.isContextForGroup(e)) { // simple click on any highlight
          if (!e[self.options.moreUsing]) self.removePreviousSelection();
          toggleActiveClass(highlightTarget);
        } else if (!highlightTarget) self.removePreviousSelection(); // simple click outside highlight

      } else {
        self.selectedItems = new Set;
        self.foreach(self.items, function (el) {
          if (cross(a, el) === true) {
            toggleActiveClass(el);
          }
        });
      }

      // setTimeout to allow click listeners in other scripts (eg. contextmenu.js) work correctly
      setTimeout(function () {
        if (a && a.parentNode) a.parentNode.removeChild(a);
      }, 100);

      if (selected.size && self.options.onSelect) self.options.onSelect(Array.from(selected));
      if (deselected.size && self.options.onDeselect) self.options.onDeselect(Array.from(deselected));

      if (self.options.stop) self.options.stop(e);
    };

    this.removePreviousSelection = function () {
      const deselected = new Set;
      self.foreach(self.items, function (el) {
          const s = self.options.selectedClass;
          if (el.classList.contains(s)) {
            el.classList.remove(s);
            deselected.add(el.id);
          }
      });
      if (self.options.onDeselect && deselected.size) self.options.onDeselect(Array.from(deselected));
    }

    this.rectDraw = function (e) {
      const g = rb();
      if (!self.ipos || g === null) {
        return;
      }
      let tmp;
      let x1 = self.ipos[0];
      let y1 = self.ipos[1];
      let x2 = e.pageX;
      let y2 = e.pageY;
      if (x1 > x2) {
        (tmp = x2), (x2 = x1), (x1 = tmp);
      }
      if (y1 > y2) {
        (tmp = y2), (y2 = y1), (y1 = tmp);
      }
      g.style.left = x1 + "px";
      g.style.top = y1 + "px";
      g.style.width = x2 - x1 + "px";
      g.style.height = y2 - y1 + "px";

      if ((g.style.width !== "0px" || g.style.height !== "0px") && !e[self.options.moreUsing]) {
        self.removePreviousSelection();
      }
    };

    this.options.selectables = this;
    if (this.options.enabled) {
      return this.enable();
    }
    return this;
  }
};
