/* ============================================================================
 * 《密钥》· 鼠标输入工具（input.js）
 * ----------------------------------------------------------------------------
 * 为小游戏提供可复用的鼠标/指针交互原语：
 *   - Input.on(el, type, handler)        绑定事件（自动解绑在实例销毁时）
 *   - Input.getRect(el)                  取元素视口矩形
 *   - Input.pointInRect(x, y, rect)      点是否落在矩形内
 *   - Input.rectsIntersect(a, b)         两矩形是否相交
 *   - Input.throttleRAF(fn)              rAF 节流（拖拽 move 用）
 *   - Input.DragController               拖拽控制器（带落点命中检测）
 *
 * 统一使用 Pointer 事件，鼠标/触控均可驱动。
 * ========================================================================== */

window.Input = (function () {
  "use strict";

  /* ---------- 基础工具 ---------- */

  function on(el, type, handler, opts) {
    if (!el) return function () {};
    el.addEventListener(type, handler, opts);
    return function off() {
      el.removeEventListener(type, handler, opts);
    };
  }

  function getRect(el) {
    return el.getBoundingClientRect();
  }

  function pointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function rectsIntersect(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function throttleRAF(fn) {
    var ticking = false;
    var lastArgs = null;
    return function throttled() {
      lastArgs = arguments;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        fn.apply(null, lastArgs);
      });
    };
  }

  /* ---------- 拖拽控制器 ---------- */

  function DragController(cfg) {
    this.cfg = cfg || {};
    this.handle = this.cfg.handle;
    this.target = this.cfg.target || this.handle;
    this.enabled = true;
    this._dragging = false;
    this._cleanups = [];
    this._bind();
  }

  DragController.prototype._bind = function () {
    var self = this;
    if (!this.handle) return;

    var start = function (ev) {
      if (!self.enabled) return;
      ev.preventDefault();
      self._dragging = true;
      self._startX = ev.clientX;
      self._startY = ev.clientY;
      self._baseLeft = self.target.offsetLeft;
      self._baseTop = self.target.offsetTop;

      if (self.cfg.onStart) self.cfg.onStart(ev.clientX, ev.clientY, ev);

      self._moveFn = throttleRAF(function (e) {
        self._onMove(e);
      });
      self._upFn = function (e) {
        self._onUp(e);
      };
      window.addEventListener("pointermove", self._moveFn);
      window.addEventListener("pointerup", self._upFn);
      window.addEventListener("pointercancel", self._upFn);
    };

    self._cleanups.push(on(self.handle, "pointerdown", start));
  };

  DragController.prototype._hitTest = function (x, y) {
    var targets = this.cfg.hitTargets || [];
    for (var i = 0; i < targets.length; i++) {
      var el = targets[i];
      if (el && el.offsetParent !== null && pointInRect(x, y, getRect(el))) {
        return el;
      }
    }
    return null;
  };

  DragController.prototype._onMove = function (ev) {
    if (!this._dragging) return;
    var dx = ev.clientX - this._startX;
    var dy = ev.clientY - this._startY;
    var hit = this._hitTest(ev.clientX, ev.clientY);

    if (this.cfg.moveElement !== false && this.target) {
      this.target.style.transform =
        "translate(" + dx + "px," + dy + "px)";
      this.target.style.zIndex = "50";
    }
    if (this.cfg.onMove) {
      this.cfg.onMove(ev.clientX, ev.clientY, ev, { dx: dx, dy: dy, overTarget: hit });
    }
  };

  DragController.prototype._onUp = function (ev) {
    if (!this._dragging) return;
    this._dragging = false;
    window.removeEventListener("pointermove", this._moveFn);
    window.removeEventListener("pointerup", this._upFn);
    window.removeEventListener("pointercancel", this._upFn);

    var hit = this._hitTest(ev.clientX, ev.clientY);
    if (this.cfg.onDrop) this.cfg.onDrop(ev.clientX, ev.clientY, ev, hit);
    if (hit && this.cfg.onHit) this.cfg.onHit(hit);
  };

  DragController.prototype.reset = function () {
    if (this.target) {
      this.target.style.transform = "";
      this.target.style.zIndex = "";
    }
  };

  DragController.prototype.setEnabled = function (v) {
    this.enabled = v;
  };

  DragController.prototype.destroy = function () {
    this._cleanups.forEach(function (fn) {
      if (fn) fn();
    });
    this._cleanups = [];
    this.enabled = false;
  };

  return {
    on: on,
    getRect: getRect,
    pointInRect: pointInRect,
    rectsIntersect: rectsIntersect,
    throttleRAF: throttleRAF,
    DragController: DragController
  };
})();
