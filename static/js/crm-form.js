/* ---------------------------------------------------------------------------
   crm-form.js — the one form behaviour.

   Rules, from the brief:
   - Validate a field on blur the first time, then live on every keystroke once
     it has been touched. Never validate an untouched field while typing.
   - On submit, focus the first invalid field and scroll it into view.
   - Show a summary at the top listing failures as links that jump to them.
   - The submit button is disabled only while submitting, never for being
     invalid - that hides the reason from the user.
   - Server errors map back onto their field by name.

   Usage:  crmForm('#create_crm_form');
   --------------------------------------------------------------------------- */

(function (window, $) {
  'use strict';

  function groupOf(el) { return el.closest('.form-group'); }

  function labelFor(el) {
    var g = groupOf(el);
    var l = g && g.querySelector('label');
    return l ? l.textContent.replace('*', '').trim() : (el.name || 'This field');
  }

  function messageFor(el) {
    if (el.validity.valueMissing)  return labelFor(el) + ' is required.';
    if (el.validity.typeMismatch)  return el.type === 'email'
      ? 'Enter a valid email address.' : 'Enter a valid value.';
    if (el.validity.tooShort)      return 'Use at least ' + el.minLength + ' characters.';
    if (el.validity.tooLong)       return 'Use at most ' + el.maxLength + ' characters.';
    if (el.validity.patternMismatch) return 'Use the format shown in the hint.';
    return el.validationMessage || 'Check this value.';
  }

  function setError(el, message) {
    var g = groupOf(el);
    if (!g) return;
    var slot = g.querySelector('.form-error');
    if (!slot) {
      slot = document.createElement('p');
      slot.className = 'form-error';
      var host = el.closest('.form-group');
      host.appendChild(slot);
    }
    if (message) {
      g.classList.add('has-error');
      slot.textContent = message;
      el.setAttribute('aria-invalid', 'true');
      if (!slot.id) slot.id = (el.id || el.name || 'f') + '_error';
      el.setAttribute('aria-describedby', slot.id);
    } else {
      g.classList.remove('has-error');
      slot.textContent = '';
      el.removeAttribute('aria-invalid');
    }
  }

  function validate(el) {
    // readonly controls are barred from constraint validation by the platform;
    // several fields here rely on that, so do not second-guess it.
    if (el.disabled || el.readOnly || el.type === 'hidden') { setError(el, ''); return true; }
    var ok = el.checkValidity();
    setError(el, ok ? '' : messageFor(el));
    return ok;
  }

  /* A sticky action bar overlaps whatever is behind it. CSS alone cannot fix
   * the case that matters - tabbing into a field the bar is sitting on - because
   * the browser counts an element under an overlay as already visible and so
   * never scrolls, which means scroll-margin never applies. Nudge it instead. */
  document.addEventListener('focusin', function (e) {
    var bar = document.querySelector('.form-actions');
    if (!bar || getComputedStyle(bar).position !== 'sticky') return;

    var el = e.target;
    if (!el || !el.getBoundingClientRect) return;

    var f = el.getBoundingClientRect();
    var b = bar.getBoundingClientRect();
    if (!f.height || f.top >= b.bottom || f.bottom <= b.top) return;   // clear

    // Move the field up by however much the bar is covering, plus a margin so
    // it does not sit flush against it.
    window.scrollBy({ top: f.bottom - b.top + 16, behavior: 'smooth' });
  });

  window.crmForm = function (selector, opts) {
    var form = document.querySelector(selector);
    if (!form) return null;
    opts = opts || {};

    form.setAttribute('novalidate', 'novalidate');   // we render the messages

    var fields = function () {
      return Array.prototype.slice.call(
        form.querySelectorAll('input, select, textarea'))
        .filter(function (el) { return el.name && el.type !== 'hidden'; });
    };

    // --- touched-then-live -------------------------------------------------
    form.addEventListener('blur', function (e) {
      var el = e.target;
      if (!el.name || !groupOf(el)) return;
      el.dataset.touched = '1';
      validate(el);
    }, true);

    form.addEventListener('input', function (e) {
      var el = e.target;
      if (el.dataset.touched === '1') validate(el);
    });
    form.addEventListener('change', function (e) {
      var el = e.target;
      if (el.dataset.touched === '1') validate(el);
    });

    // --- summary -----------------------------------------------------------
    var summary = form.querySelector('.form-summary');
    if (!summary) {
      summary = document.createElement('div');
      summary.className = 'form-summary';
      summary.setAttribute('role', 'alert');
      summary.innerHTML = '<p class="form-summary__title"></p><ul></ul>';
      form.insertBefore(summary, form.firstChild);
    }

    function showSummary(bad) {
      var list = summary.querySelector('ul');
      list.innerHTML = '';
      bad.forEach(function (el) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#';
        a.textContent = labelFor(el);
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          el.focus();
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });
        li.appendChild(a);
        list.appendChild(li);
      });
      summary.querySelector('.form-summary__title').textContent =
        bad.length === 1 ? 'One field needs attention'
                         : bad.length + ' fields need attention';
      summary.classList.add('is-shown');
      summary.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function hideSummary() { summary.classList.remove('is-shown'); }

    // --- submit ------------------------------------------------------------
    var submitBtn = form.querySelector('[type=submit]');
    var busyLabel = opts.busyLabel || 'Saving…';
    var idleLabel = submitBtn ? submitBtn.textContent : '';

    window.crmFormBusy = function (on) {
      if (!submitBtn) return;
      submitBtn.classList.toggle('is-busy', !!on);
      submitBtn.disabled = !!on;              // only while submitting
      submitBtn.textContent = on ? busyLabel : idleLabel;
    };

    form.addEventListener('submit', function (e) {
      var bad = fields().filter(function (el) {
        el.dataset.touched = '1';
        return !validate(el);
      });

      if (bad.length) {
        e.preventDefault();
        e.stopImmediatePropagation();         // keep the page handler from firing
        showSummary(bad);
        bad[0].focus();
        bad[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
        return false;
      }
      hideSummary();
    }, true);                                  // capture: runs before page handlers

    // --- server errors back onto their fields ------------------------------
    window.crmFormErrors = function (errors) {
      var first = null;
      Object.keys(errors || {}).forEach(function (name) {
        var el = form.querySelector('[name="' + name + '"]');
        if (!el) return;
        setError(el, errors[name]);
        if (!first) first = el;
      });
      if (first) { first.focus(); first.scrollIntoView({ block: 'center' }); }
    };

    return form;
  };
})(window, jQuery);
