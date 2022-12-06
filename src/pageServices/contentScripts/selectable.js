export const selectable = () => {
  let selectables;

  const sendMessage = (message) =>
    chrome.runtime.sendMessage(message).catch((error) => {
      if (error.message !== "The message port closed before a response was received.") throw new Error(error.message);
    });

  const runSelectable = () => {
    selectables = new Selectables({
      elements: ".jdn-highlight",
      moreUsing: "ctrlKey",
      zone: "body",
      selectedClass: "jdn-active",
      onSelect: (element) => sendMessage({ message: "ELEMENT_SET_ACTIVE", param: element.id }),
      onDeselect: (element) => {
        sendMessage({ message: "ELEMENT_UNSET_ACTIVE", param: element.id });
      },
    });

    Selectables.prototype.unselect = function(payload) {
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

    Selectables.prototype.setSelect = function(payload) {
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

  const messageHandler = ({ message, param }) => {
    switch (message) {
      case "UNSET_ACTIVE":
        unsetActive(param);
        break;
      case "SET_ACTIVE":
        setActive(param);
        break;
    }
  };

  chrome.runtime.onMessage.addListener(messageHandler);

  chrome.storage.onChanged.addListener((event) => {
    if (event.hasOwnProperty("JDN_HIGHLIGHT_IS_SET")) runSelectable();
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
      zone: "#wrapper", // ID of the element whith selectables.
      elements: "a", //  items to be selectable .list-group, #id > .class,'htmlelement' - valid querySelectorAll
      selectedClass: "active", // class name to apply to seleted items
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
    const self = this;
    this.enable = function () {
      if (this.on) {
        throw new Error(this.constructor.name + " :: is alredy enabled");
      }
      this.zone = document.querySelector(this.options.zone);
      if (!this.zone) {
        throw new Error(this.constructor.name + " :: no zone defined in options. Please use element with ID");
      }
      this.items = document.querySelectorAll(this.options.zone + " " + this.options.elements);
      this.disable();
      this.zone.addEventListener("mousedown", self.rectOpen);
      document.addEventListener("contextmenu", this.contextClick);
      this.on = true;
      return this;
    };
    this.disable = function () {
      this.zone.removeEventListener("mousedown", self.rectOpen);
      document.removeEventListener("contextmenu", this.contextClick);
      this.on = false;
      return this;
    };
    const offset = function (el) {
      const r = el.getBoundingClientRect();
      return { top: r.top + document.body.scrollTop, left: r.left + document.body.scrollLeft };
    };
    this.suspend = function (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    this.isContextForGroup = function (e) {
      const target = e.target.closest("[jdn-highlight=true]");
      if (!target) return;
      return target.classList.contains(self.options.selectedClass) && e.button === 2;
    };
    this.rectOpen = function (e) {
      self.options.start && self.options.start(e);
      if (self.options.key && !e[self.options.key]) {
        return;
      }
      const s = self.options.selectedClass;
      self.foreach(self.items, function (el) {
        el.addEventListener("click", self.suspend, true); // skip any clicks
        if (!e[self.options.moreUsing] && !self.isContextForGroup(e)) {
          if (el.classList.contains(s)) {
            el.classList.remove(s);
            self.options.onDeselect && self.options.onDeselect(el);
          }
        }
      });

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
      window.addEventListener("mouseup", self.select);
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
      const { width, height } = element.getBoundingClientRect();
      return width === 2 && height === 2;
    };
    this.select = function (e) {
      const a = rb();
      if (!a) {
        return;
      }
      delete self.ipos;
      document.body.classList.remove("s-noselect");
      document.body.removeEventListener("mousemove", self.rectDraw);
      window.removeEventListener("mouseup", self.select);

      const s = self.options.selectedClass;
      const toggleActiveClass = function (el) {
        if (el.classList.contains(s)) {
          el.classList.remove(s);
          self.options.onDeselect && self.options.onDeselect(el);
        } else {
          el.classList.add(s);
          self.options.onSelect && self.options.onSelect(el);
        }
      };

      if (isPlainClick(a)) {
        const highlightTarget = e.target.closest("[jdn-highlight=true]");
        if (!highlightTarget) return;
        if (!self.isContextForGroup(e)) toggleActiveClass(highlightTarget);
      } else {
        self.foreach(self.items, function (el) {
          if (cross(a, el) === true) toggleActiveClass(el);
          setTimeout(function () {
            el.removeEventListener("click", self.suspend, true);
          }, 100);
        });
      }

      a.parentNode.removeChild(a);
      self.options.stop && self.options.stop(e);
    };
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
      (g.style.left = x1 + "px"),
        (g.style.top = y1 + "px"),
        (g.style.width = x2 - x1 + "px"),
        (g.style.height = y2 - y1 + "px");
    };
    this.options.selectables = this;
    if (this.options.enabled) {
      return this.enable();
    }
    return this;
  }
};
