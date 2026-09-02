/* Date field.
 *
 * Replaces bootstrap-datepicker on the pages that opt in. What was wrong with
 * that one, concretely:
 *
 *   - the input was readonly, so a date could only be reached by clicking,
 *     never typed. Setting a date two years out took twenty-four clicks on a
 *     chevron because there was no month or year jump.
 *   - 22px cells, unreachable on a touch screen.
 *   - it drew its own greys, so it stayed a light widget in the dark theme.
 *   - no keyboard support at all.
 *
 * This one: type it or pick it, month and year are selects, cells are 36px,
 * every colour is a token, and the grid is arrow-key navigable.
 *
 *   crmDate(input, { min, max, format })   - upgrade one input
 *   <input data-datepicker>                - or let it upgrade itself
 *
 * The value stays an ISO yyyy-mm-dd string in the input, which is what the
 * form posts and what MySQL's DATE column wants, so nothing downstream changes.
 */
(function (window, document) {
  'use strict';

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  var ISO    = /^(\d{4})-(\d{2})-(\d{2})$/;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d)  { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function today()  { return midnight(new Date()); }

  function parse(text) {
    var m = ISO.exec(String(text || '').trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, d = +m[3];
    var date = new Date(y, mo, d);
    // Rejects 2026-02-31, which the Date constructor would roll into March.
    if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d) return null;
    return date;
  }

  function human(d) {
    return d.toLocaleDateString(undefined,
      { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function crmDate(input, opts) {
    input = typeof input === 'string' ? document.querySelector(input) : input;
    if (!input || input.crmDate) return input && input.crmDate;
    opts = opts || {};

    var min = parse(opts.min || input.getAttribute('data-min'));
    var max = parse(opts.max || input.getAttribute('data-max'));

    // The old field was readonly. Typing is the fastest way to enter a date
    // you already know, so it is allowed again; the popover is the discovery
    // path, not the only path.
    input.removeAttribute('readonly');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('inputmode', 'numeric');
    if (!input.placeholder) input.placeholder = 'yyyy-mm-dd';

    var wrap = document.createElement('div');
    wrap.className = 'crm-date';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    input.classList.add('crm-date__input');

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'crm-date__trigger';
    trigger.setAttribute('aria-label', 'Open calendar');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.innerHTML = '<i data-lucide="calendar"></i>';
    wrap.appendChild(trigger);

    var pop = document.createElement('div');
    pop.className = 'crm-date__pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Choose a date');
    pop.hidden = true;
    wrap.appendChild(pop);

    var live = document.createElement('span');
    live.className = 'crm-date__live';
    live.setAttribute('aria-live', 'polite');
    wrap.appendChild(live);

    var view   = today();   // which month the grid is showing
    var cursor = today();   // which day has keyboard focus

    function selected() { return parse(input.value); }

    function blocked(d) {
      return (min && d < min) || (max && d > max);
    }

    function years() {
      var now = new Date().getFullYear();
      var from = min ? min.getFullYear() : now - 10;
      var to   = max ? max.getFullYear() : now + 10;
      var sel  = selected();
      if (sel) { from = Math.min(from, sel.getFullYear()); to = Math.max(to, sel.getFullYear()); }
      from = Math.min(from, view.getFullYear());
      to   = Math.max(to, view.getFullYear());
      var out = [];
      for (var y = from; y <= to; y++) out.push(y);
      return out;
    }

    function render() {
      var sel = selected(), t = today();

      var head =
        '<div class="crm-date__head">' +
          '<button type="button" class="crm-date__nav" data-nav="-1" aria-label="Previous month">' +
            '<i data-lucide="chevron-left"></i></button>' +
          '<div class="crm-date__pickers">' +
            '<select class="crm-date__month" aria-label="Month">' +
              MONTHS.map(function (m, i) {
                return '<option value="' + i + '"' +
                       (i === view.getMonth() ? ' selected' : '') + '>' + m + '</option>';
              }).join('') +
            '</select>' +
            '<select class="crm-date__year" aria-label="Year">' +
              years().map(function (y) {
                return '<option value="' + y + '"' +
                       (y === view.getFullYear() ? ' selected' : '') + '>' + y + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<button type="button" class="crm-date__nav" data-nav="1" aria-label="Next month">' +
            '<i data-lucide="chevron-right"></i></button>' +
        '</div>';

      var week = '<div class="crm-date__week">' +
        DAYS.map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div>';

      // Always six rows, so the popover does not change height month to month
      // and the buttons underneath do not move while you are aiming at them.
      var first = new Date(view.getFullYear(), view.getMonth(), 1);
      var start = new Date(first);
      start.setDate(1 - first.getDay());

      var cells = '';
      for (var i = 0; i < 42; i++) {
        var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        var out   = d.getMonth() !== view.getMonth();
        var isSel = sel && d.getTime() === sel.getTime();
        var isNow = d.getTime() === t.getTime();
        var off   = blocked(d);
        cells +=
          '<button type="button" class="crm-date__day' +
            (out ? ' is-outside' : '') + (isSel ? ' is-selected' : '') +
            (isNow ? ' is-today' : '') + '"' +
          ' data-date="' + iso(d) + '"' +
          (off ? ' disabled' : '') +
          (isSel ? ' aria-current="date"' : '') +
          ' tabindex="' + (d.getTime() === midnight(cursor).getTime() ? '0' : '-1') + '">' +
          d.getDate() + '</button>';
      }

      var foot =
        '<div class="crm-date__foot">' +
          '<button type="button" class="crm-date__quick" data-quick="0">Today</button>' +
          '<button type="button" class="crm-date__quick" data-quick="1">Tomorrow</button>' +
          '<button type="button" class="crm-date__quick" data-quick="7">In a week</button>' +
          '<button type="button" class="crm-date__clear">Clear</button>' +
        '</div>';

      pop.innerHTML = head + week + '<div class="crm-date__grid">' + cells + '</div>' + foot;
      if (window.lucide && lucide.createIcons) lucide.createIcons({ nameAttr: 'data-lucide' });
    }

    function open() {
      if (!pop.hidden) return;
      var sel = selected();
      view = sel ? new Date(sel) : today();
      cursor = sel ? new Date(sel) : today();
      render();
      pop.hidden = false;
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      // Above the field when there is no room below it.
      var box = wrap.getBoundingClientRect();
      pop.classList.toggle('is-above',
        box.bottom + 380 > window.innerHeight && box.top > 380);
    }

    function close(focusInput) {
      if (pop.hidden) return;
      pop.hidden = true;
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      if (focusInput) input.focus();
    }

    function commit(d) {
      input.value = d ? iso(d) : '';
      live.textContent = d ? human(d) + ' selected' : 'Date cleared';
      input.dispatchEvent(new Event('input',  { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function move(days) {
      var next = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + days);
      if (blocked(next)) return;
      cursor = next;
      view = new Date(next.getFullYear(), next.getMonth(), 1);
      render();
      var el = pop.querySelector('[data-date="' + iso(cursor) + '"]');
      if (el) el.focus();
    }

    trigger.addEventListener('click', function () {
      if (pop.hidden) { open(); var f = pop.querySelector('[tabindex="0"]'); if (f) f.focus(); }
      else close(true);
    });

    pop.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-nav]');
      if (nav) {
        view = new Date(view.getFullYear(), view.getMonth() + (+nav.getAttribute('data-nav')), 1);
        render();
        return;
      }
      var day = e.target.closest('[data-date]');
      if (day && !day.disabled) { commit(parse(day.getAttribute('data-date'))); close(true); return; }

      var quick = e.target.closest('[data-quick]');
      if (quick) {
        var d = today();
        d.setDate(d.getDate() + (+quick.getAttribute('data-quick')));
        if (!blocked(d)) { commit(d); close(true); }
        return;
      }
      if (e.target.closest('.crm-date__clear')) { commit(null); close(true); }
    });

    pop.addEventListener('change', function (e) {
      if (e.target.classList.contains('crm-date__month')) {
        view = new Date(view.getFullYear(), +e.target.value, 1); render();
      } else if (e.target.classList.contains('crm-date__year')) {
        view = new Date(+e.target.value, view.getMonth(), 1); render();
      }
    });

    pop.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'Escape')      { e.preventDefault(); close(true); }
      else if (k === 'ArrowLeft')  { e.preventDefault(); move(-1); }
      else if (k === 'ArrowRight') { e.preventDefault(); move(1); }
      else if (k === 'ArrowUp')    { e.preventDefault(); move(-7); }
      else if (k === 'ArrowDown')  { e.preventDefault(); move(7); }
      else if (k === 'Home')       { e.preventDefault(); move(-cursor.getDay()); }
      else if (k === 'End')        { e.preventDefault(); move(6 - cursor.getDay()); }
      else if (k === 'PageUp')     { e.preventDefault(); move(-28); }
      else if (k === 'PageDown')   { e.preventDefault(); move(28); }
      else if (k === 'Enter' || k === ' ') {
        var on = document.activeElement;
        if (on && on.hasAttribute('data-date') && !on.disabled) {
          e.preventDefault(); commit(parse(on.getAttribute('data-date'))); close(true);
        }
      }
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && pop.hidden) { e.preventDefault(); open(); }
      else if (e.key === 'Escape') close();
    });

    // Typed input is normalised on the way out, so a half-finished date does
    // not fight the user while they are still typing it.
    input.addEventListener('blur', function () {
      var raw = input.value.trim();
      if (!raw) return;
      var d = parse(raw);
      if (d && !blocked(d)) { if (iso(d) !== raw) commit(d); }
      else { input.value = ''; commit(null); }
    });

    document.addEventListener('mousedown', function (e) {
      if (!wrap.contains(e.target)) close();
    });

    var api = {
      input: input,
      get: selected,
      set: function (v) { commit(v instanceof Date ? midnight(v) : parse(v)); },
      setMin: function (v) { min = parse(v); if (!pop.hidden) render(); },
      setMax: function (v) { max = parse(v); if (!pop.hidden) render(); },
      open: open, close: close
    };
    input.crmDate = api;
    return api;
  }

  function autoInit(root) {
    var nodes = (root || document).querySelectorAll('input[data-datepicker]:not(.crm-date__input)');
    Array.prototype.forEach.call(nodes, function (n) {
      crmDate(n, { min: n.getAttribute('data-min'), max: n.getAttribute('data-max') });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { autoInit(); });
  } else {
    autoInit();
  }

  crmDate.autoInit = autoInit;
  window.crmDate = crmDate;
})(window, document);
