/* ---------------------------------------------------------------------------
   crm-toast.js — brief, non-blocking feedback, with an optional action.

   A modal is the wrong shape for "that worked": it interrupts, and it makes
   Undo a second decision rather than a quiet offer. Toasts stack top-right,
   dismiss themselves, and pause their timer while the pointer is over them so
   an Undo is never snatched away mid-reach.

     crmToast({ text: 'Booking moved', action: 'Undo', onAction: fn });
   --------------------------------------------------------------------------- */

(function (window) {
  'use strict';

  var HOST_ID = 'crm_toasts';
  var DEFAULT_MS = 6000;

  function host() {
    var el = document.getElementById(HOST_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = HOST_ID;
      el.className = 'crm-toasts';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    return el;
  }

  window.crmToast = function (opts) {
    opts = opts || {};
    var box = document.createElement('div');
    box.className = 'crm-toast' + (opts.tone ? ' crm-toast--' + opts.tone : '');

    var body = document.createElement('div');
    body.className = 'crm-toast__text';
    body.textContent = opts.text || '';
    box.appendChild(body);

    var timer = null;
    function close() {
      clearTimeout(timer);
      box.classList.add('is-going');
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 160);
    }

    if (opts.action) {
      var act = document.createElement('button');
      act.type = 'button';
      act.className = 'crm-toast__action';
      act.textContent = opts.action;
      act.addEventListener('click', function () {
        close();
        if (opts.onAction) opts.onAction();
      });
      box.appendChild(act);
    }

    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'crm-toast__close';
    dismiss.setAttribute('aria-label', 'Dismiss');
    dismiss.innerHTML = '&times;';
    dismiss.addEventListener('click', close);
    box.appendChild(dismiss);

    host().appendChild(box);

    var ms = opts.duration || DEFAULT_MS;
    timer = setTimeout(close, ms);
    // Reaching for Undo should not be a race against the timer.
    box.addEventListener('mouseenter', function () { clearTimeout(timer); });
    box.addEventListener('mouseleave', function () { timer = setTimeout(close, 2500); });

    return { close: close };
  };
})(window);
