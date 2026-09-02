/* ---------------------------------------------------------------------------
   crm-autoform.js — applies the form language to every page automatically.

   Loaded from the base, so it runs on all of them. It does what CSS cannot:
   attach the classes and validation the new pages get by hand, to pages that
   were never migrated. No template edit required.
   --------------------------------------------------------------------------- */

(function (window, $) {
  'use strict';

  function upgrade(root) {
    root = root || document;

    // Eight pages collect input with no <form> element at all. Mark their
    // container so the same CSS and the rules below reach them too.
    root.querySelectorAll('main .card_customized, main .form-section').forEach(function (box) {
      if (box.closest('form')) return;
      if (box.closest('.dataTables_wrapper')) return;
      if (box.querySelector('input:not([type=hidden]), select, textarea')) {
        box.classList.add('crm-formish');
      }
    });

    // 0. Mark genuine form-layout tables. A layout table holds form controls
    //    and has no <thead>; anything with a <thead>, a DataTable, or no
    //    controls is real content and must be left alone.
    root.querySelectorAll('form table, .crm-formish table').forEach(function (t) {
      if (t.classList.contains('dataTable')) return;
      if (t.closest('.dataTables_wrapper')) return;
      if (t.tHead) return;
      if (!t.querySelector('input:not([type=hidden]), select, textarea')) return;
      t.classList.add('crm-layout-table');
    });

    // 1. Wrap orphan label+control pairs so .form-group styling applies.
    root.querySelectorAll('form label, .crm-formish label').forEach(function (label) {
      if (label.closest('.form-group')) return;
      var control = label.parentElement &&
        label.parentElement.querySelector('input, select, textarea');
      if (!control || control.type === 'hidden') return;
      var host = label.parentElement;
      if (host && !host.classList.contains('form-group') &&
          host.querySelectorAll('input, select, textarea').length === 1) {
        host.classList.add('form-group');
      }
    });

    // 2. Every control gets .form-control, so one rule styles the lot.
    root.querySelectorAll(
      'form input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]), form select, form textarea, ' +
      '.crm-formish input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]), .crm-formish select, .crm-formish textarea'
    ).forEach(function (el) {
      if (!el.classList.contains('form-control') && !el.closest('.dataTables_wrapper')) {
        el.classList.add('form-control');
      }
    });

    // 3. Required fields announce themselves.
    root.querySelectorAll('form [required]:not([aria-required]), .crm-formish [required]:not([aria-required])').forEach(function (el) {
      el.setAttribute('aria-required', 'true');
      var group = el.closest('.form-group');
      var label = group && group.querySelector('label');
      if (label && !label.querySelector('.form-label__req')) {
        var star = document.createElement('span');
        star.className = 'form-label__req';
        star.setAttribute('aria-hidden', 'true');
        star.textContent = '*';
        label.appendChild(star);
      }
    });

    // 4. Strip the inline colour and font declarations the old pages carry.
    //    Layout properties (width, display, grid) are left alone.
    var KILL = /(^|;)\s*(color|background|background-color|font|font-family|font-size|font-weight|text-align|border)\s*:[^;]*/gi;
    root.querySelectorAll('form [style], .crm-formish [style]').forEach(function (el) {
      var v = el.getAttribute('style');
      if (!v || !/color|font|background|text-align/i.test(v)) return;
      var cleaned = v.replace(KILL, '$1').replace(/^;+|;+$/g, '').trim();
      if (cleaned) el.setAttribute('style', cleaned); else el.removeAttribute('style');
    });

    // 5. The old quick-add buttons put their label inside an <i class="fa-*">.
    //    Lift the text out and swap the icon for a Lucide plus.
    root.querySelectorAll('form .btn > i[class*="fa-"], .crm-formish .btn > i[class*="fa-"]').forEach(function (icon) {
      var text = (icon.textContent || '').trim();
      var btn = icon.parentElement;
      icon.remove();
      var glyph = document.createElement('i');
      glyph.setAttribute('data-lucide', 'plus');
      btn.insertBefore(glyph, btn.firstChild);
      if (text) btn.appendChild(document.createTextNode(' ' + text));
    });

    // 6. Any form with fields gets the shared validation, once.
    root.querySelectorAll('form').forEach(function (form) {
      if (form.dataset.crmForm === '1') return;
      if (!form.querySelector('input:not([type=hidden]), select, textarea')) return;
      if (!form.id) return;                       // crmForm selects by id
      form.dataset.crmForm = '1';
      try { window.crmForm('#' + form.id); } catch (e) {}
    });

    if (window.lucide) {
      lucide.createIcons({ nameAttr: 'data-lucide', attrs: { width: 15, height: 15, 'stroke-width': 1.75 } });
    }
  }

  window.crmAutoForm = upgrade;

  $(function () {
    upgrade(document);
    // Pages that reveal a record after a search inject their fields late.
    var pending = null;
    new MutationObserver(function () {
      clearTimeout(pending);
      pending = setTimeout(function () { upgrade(document); }, 120);
    }).observe(document.body, { childList: true, subtree: true });
  });
})(window, jQuery);
