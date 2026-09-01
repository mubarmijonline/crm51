/* ---------------------------------------------------------------------------
   crm-table.js — the one table component.

   Wraps DataTables in server-side mode and adds what the stock plugin does not:
   a debounced search that does not fire on every keystroke, match highlighting,
   state in the URL so a filtered view is shareable, real loading/empty/error
   states, and density plus column visibility persisted per browser.

   Usage:
     crmTable('#students_table', {
       key:     'american_leads',     // storage + URL namespace
       url:     '/api/american_leads',
       columns: [...],                // DataTables column defs
       order:   [[1, 'desc']]
     });
   --------------------------------------------------------------------------- */

(function (window, $) {
  'use strict';

  var SEARCH_DEBOUNCE_MS = 300;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* --- URL state ---------------------------------------------------------
     Page, size, sort and query live in the query string, so a filtered view
     survives a refresh and the back button, and can be pasted to a colleague. */
  function readUrlState() {
    var p = new URLSearchParams(window.location.search);
    return {
      q:    p.get('q') || '',
      page: parseInt(p.get('page') || '1', 10),
      size: parseInt(p.get('size') || '25', 10),
      sort: p.get('sort') || '',
      dir:  p.get('dir') === 'desc' ? 'desc' : 'asc'
    };
  }

  function writeUrlState(state) {
    var p = new URLSearchParams(window.location.search);
    function set(k, v, dflt) {
      if (v === undefined || v === null || v === '' || String(v) === String(dflt)) p.delete(k);
      else p.set(k, v);
    }
    set('q', state.q, '');
    set('page', state.page, 1);
    set('size', state.size, 25);
    set('sort', state.sort, '');
    set('dir', state.dir, 'asc');
    var qs = p.toString();
    window.history.replaceState(null, '',
      window.location.pathname + (qs ? '?' + qs : ''));
  }

  /* --- match highlighting ------------------------------------------------
     Applied to the rendered cell, never to the value the server matched on. */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlight(text, terms) {
    var out = escapeHtml(text == null ? '' : text);
    if (!terms.length) return out;
    var pattern = terms.filter(Boolean).map(escapeRegex).join('|');
    if (!pattern) return out;
    return out.replace(new RegExp('(' + pattern + ')', 'gi'),
      '<mark class="crm-hit">$1</mark>');
  }

  /* --- state panels ------------------------------------------------------ */
  function skeleton(colCount, rowCount) {
    var cells = '';
    for (var c = 0; c < colCount; c++) cells += '<td><span class="crm-skel"></span></td>';
    var rows = '';
    for (var r = 0; r < (rowCount || 8); r++) rows += '<tr class="crm-skel-row">' + cells + '</tr>';
    return rows;
  }

  function panel(icon, title, body, actionHtml) {
    return '<div class="crm-state">' +
      '<i data-lucide="' + icon + '"></i>' +
      '<p class="crm-state__title">' + escapeHtml(title) + '</p>' +
      '<p class="crm-state__body">' + escapeHtml(body) + '</p>' +
      (actionHtml || '') + '</div>';
  }

  window.crmTable = function (selector, opts) {
    var $table = $(selector);
    if (!$table.length) return null;

    var url      = opts.url;
    var key      = opts.key || 'table';
    var DENSITY  = 'crm51.' + key + '.density';
    var COLS     = 'crm51.' + key + '.cols';
    var urlState = readUrlState();
    var terms    = urlState.q.split(/\s+/).filter(Boolean);

    /* Wrap every column's renderer so matches highlight, without touching the
       value the server sorted or filtered on. */
    var columns = opts.columns.map(function (col) {
      if (col.data === undefined) return col;              // action columns
      var inner = col.render;
      var wrapped = $.extend({}, col);
      wrapped.render = function (data, type, row, meta) {
        var value = inner ? inner(data, type, row, meta) : data;
        if (type !== 'display') return inner ? inner(data, type, row, meta) : data;
        if (inner) return value;                            // badges etc. as-is
        return highlight(value, terms);
      };
      return wrapped;
    });

    var hiddenCols = [];
    try { hiddenCols = JSON.parse(store(COLS) || '[]'); } catch (e) { hiddenCols = []; }

    var startPage = Math.max(0, (urlState.page - 1)) * urlState.size;
    var order = opts.order || [];
    if (urlState.sort) {
      var idx = columns.findIndex(function (c) { return c.data === urlState.sort; });
      if (idx >= 0) order = [[idx, urlState.dir]];
    }

    var table = $table.DataTable({
      serverSide: true,
      processing: false,          // we render our own states
      searchDelay: SEARCH_DEBOUNCE_MS,
      deferRender: true,
      ajax: {
        url: url,
        type: 'GET',
        error: function () {
          $table.find('tbody').html(
            '<tr><td colspan="' + columns.length + '">' +
            panel('triangle-alert', 'Could not load this table',
                  'The request failed. Check your connection and try again.',
                  '<button type="button" class="btn btn-secondary btn-sm crm-retry">Retry</button>') +
            '</td></tr>');
          if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide' });
        }
      },
      columns: columns,
      order: order,
      paging: true,
      pageLength: urlState.size,
      displayStart: startPage,
      lengthMenu: [[25, 50, 100], [25, 50, 100]],
      dom: opts.dom || 'lrtip',   // our own search box replaces 'f'
      scrollX: true,
      language: {
        emptyTable: panel('inbox', 'Nothing here yet',
                          'Records appear here once the first one is created.'),
        zeroRecords: panel('search-x', 'No results',
                           'No rows match the current search. Clear it to see everything.'),
        info: 'Showing _START_ to _END_ of _TOTAL_',
        infoEmpty: 'No records',
        infoFiltered: ' (filtered from _MAX_)',
        lengthMenu: 'Rows: _MENU_'
      },
      drawCallback: function () {
        // Carry each column's header onto its cells, so the mobile card view
        // can label them without a second set of markup.
        var api = this.api();
        // ':visible' matters: a hidden column removes its <td>, so indexing the
        // full header list would shift every label by one.
        var labels = api.columns(':visible').header().toArray().map(function (th) {
          return $(th).text().trim();
        });
        $(this).find('tbody tr').each(function () {
          $(this).children('td').each(function (i) {
            var label = labels[i] || '';
            if (label) this.setAttribute('data-label', label);
            else this.classList.add('crm-cell-actions');
          });
        });

        if (window.lucide) {
          lucide.createIcons({ nameAttr: 'data-lucide',
            attrs: { width: 14, height: 14, 'stroke-width': 1.75 } });
        }
        var info = this.api().page.info();
        writeUrlState({
          q: $input.val(), page: info.page + 1, size: info.length,
          sort: currentSortName(), dir: currentSortDir()
        });
      }
    });

    function currentSortName() {
      var o = table.order();
      return (o.length && columns[o[0][0]]) ? (columns[o[0][0]].data || '') : '';
    }
    function currentSortDir() {
      var o = table.order();
      return o.length ? o[0][1] : 'asc';
    }

    /* --- search box: debounced, clearable, with a loading state ---------- */
    var $wrap  = $table.closest('.dataTables_wrapper');
    var $tools = $('<div class="crm-toolbar">' +
      '<div class="crm-search">' +
        '<span class="crm-search__icon"><i data-lucide="search"></i></span>' +
        '<input type="search" class="crm-search__input" autocomplete="off" ' +
               'placeholder="' + (opts.placeholder || 'Search') + '" aria-label="Search this table">' +
        '<button type="button" class="crm-search__clear" aria-label="Clear search" hidden>' +
          '<i data-lucide="x"></i></button>' +
        '<span class="crm-search__spinner" hidden></span>' +
      '</div>' +
      '<div class="crm-toolbar__right">' +
        '<div class="crm-density" role="group" aria-label="Row density">' +
          '<button type="button" data-density="compact" title="Compact rows" aria-label="Compact rows"><i data-lucide="rows-3"></i></button>' +
          '<button type="button" data-density="" title="Default rows" aria-label="Default rows"><i data-lucide="rows-2"></i></button>' +
          '<button type="button" data-density="comfortable" title="Comfortable rows" aria-label="Comfortable rows"><i data-lucide="rows"></i></button>' +
        '</div>' +
        '<div class="dropdown crm-cols">' +
          '<button type="button" class="btn btn-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
            '<i data-lucide="columns-3"></i>Columns</button>' +
          '<div class="dropdown-menu dropdown-menu-right crm-cols__menu"></div>' +
        '</div>' +
      '</div>' +
    '</div>');
    $wrap.prepend($tools);

    var $input   = $tools.find('.crm-search__input');
    var $clear   = $tools.find('.crm-search__clear');
    var $spinner = $tools.find('.crm-search__spinner');
    var $chips   = $('<div class="crm-chips" hidden></div>').insertAfter($tools);

    $input.val(urlState.q);
    $clear.prop('hidden', !urlState.q);

    function renderChips() {
      var q = $input.val().trim();
      var list = q.split(/\s+/).filter(Boolean);
      if (!list.length) { $chips.attr('hidden', true).empty(); return; }
      $chips.removeAttr('hidden').empty();
      list.forEach(function (t) {
        $('<button type="button" class="crm-chip"></button>')
          .text(t)
          .append(' <i data-lucide="x"></i>')
          .attr('aria-label', 'Remove filter ' + t)
          .on('click', function () {
            var rest = $input.val().split(/\s+/).filter(function (x) { return x && x !== t; });
            $input.val(rest.join(' ')).trigger('input');
          })
          .appendTo($chips);
      });
      if (list.length > 1) {
        $('<button type="button" class="crm-chip crm-chip--clear">Clear all</button>')
          .on('click', function () { $input.val('').trigger('input'); })
          .appendTo($chips);
      }
      if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', attrs: { width: 12, height: 12 } });
    }
    renderChips();

    var timer = null;
    $input.on('input', function () {
      var value = $input.val();
      $clear.prop('hidden', !value);
      clearTimeout(timer);
      $spinner.removeAttr('hidden');
      timer = setTimeout(function () {
        terms = value.split(/\s+/).filter(Boolean);
        renderChips();
        table.search(value).draw();
      }, SEARCH_DEBOUNCE_MS);
    });

    $clear.on('click', function () { $input.val('').trigger('input').focus(); });

    // Hide the spinner only once the response has actually landed.
    $table.on('xhr.dt', function () { $spinner.attr('hidden', true); });
    $table.on('preXhr.dt', function () { $spinner.removeAttr('hidden'); });

    /* --- density --------------------------------------------------------- */
    function applyDensity(v) {
      var host = $wrap.get(0);
      if (v) host.setAttribute('data-density', v); else host.removeAttribute('data-density');
      $tools.find('.crm-density button').each(function () {
        this.classList.toggle('is-on', (this.getAttribute('data-density') || '') === (v || ''));
      });
    }
    applyDensity(store(DENSITY) || '');
    $tools.on('click', '.crm-density button', function () {
      var v = this.getAttribute('data-density') || '';
      applyDensity(v); store(DENSITY, v);
    });

    /* --- column visibility ----------------------------------------------- */
    var $menu = $tools.find('.crm-cols__menu');
    table.columns().every(function (i) {
      var title = $(this.header()).text().trim();
      if (!title) return;                              // the action column
      var name = columns[i] && columns[i].data;
      var on = hiddenCols.indexOf(name) === -1;
      this.visible(on, false);
      $('<label class="dropdown-item crm-cols__item"></label>')
        .append($('<input type="checkbox">').prop('checked', on).on('change', function () {
          table.column(i).visible(this.checked);
          var next = [];
          table.columns().every(function (j) {
            if (!this.visible() && columns[j] && columns[j].data) next.push(columns[j].data);
          });
          store(COLS, JSON.stringify(next));
        }))
        .append($('<span></span>').text(title))
        .appendTo($menu);
    });
    table.columns.adjust();

    /* --- skeleton on the very first load --------------------------------- */
    $table.find('tbody').html(skeleton(columns.length, 8));
    $table.one('draw.dt', function () { $table.find('.crm-skel-row').remove(); });

    $wrap.on('click', '.crm-retry', function () { table.ajax.reload(); });

    if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', attrs: { width: 14, height: 14 } });
    return table;
  };
})(window, jQuery);
