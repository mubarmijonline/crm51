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

  /* Row actions are icons, not a row of word-buttons. Each carries an
     aria-label and a title, and data-label so the mobile card view can put the
     word back where there is room for it. */
  function attrEscape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Pass `href` for navigation and `onclick` only for a real action.
     Building a URL inside an onclick string meant nesting quotes three deep,
     which is how "' + row.client_id + '" ended up in the DOM as literal text
     instead of being concatenated - every Profile button threw
     "row is not defined". An href cannot go wrong that way, and it also gives
     the row middle-click and open-in-new-tab for free. */
  window.crmAction = function (opts) {
    var common =
      ' class="crm-iconbtn' + (opts.danger ? ' crm-iconbtn--danger' : '') + '"' +
      ' aria-label="' + attrEscape(opts.label) + '"' +
      ' title="' + attrEscape(opts.label) + '"' +
      ' data-label="' + attrEscape(opts.label) + '"';
    var glyph = '<i data-lucide="' + opts.icon + '"></i>';

    if (opts.href) {
      return '<a href="' + attrEscape(opts.href) + '"' + common + '>' + glyph + '</a>';
    }
    return '<button type="button"' + common +
           ' onclick="' + attrEscape(opts.onclick) + '">' + glyph + '</button>';
  };

  window.crmActions = function (buttons) {
    return '<div class="crm-actions">' + buttons.join('') + '</div>';
  };

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

    // A select column, only when the caller says which field identifies a row.
    if (opts.rowId) {
      columns.unshift({
        data: null, orderable: false, searchable: false, className: 'crm-cell-select',
        // Set as the column title, not prepended to the DOM: DataTables
        // rebuilds the header from this definition and wiped the prepend.
        title: '<label class="crm-checkbox"><input type="checkbox" class="crm-check-all" ' +
               'aria-label="Select all rows on this page"><span></span></label>',
        render: function (data, type, row) {
          if (type !== 'display') return '';
          var id = row[opts.rowId];
          return '<label class="crm-checkbox"><input type="checkbox" class="crm-check" ' +
                 'value="' + id + '" aria-label="Select row ' + id + '"><span></span></label>';
        }
      });
    }

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
        // POST, not GET. Server-side DataTables sends six params per column;
        // at 21 columns that is a 4.7 KB query string, which nginx rejects
        // with 400 before Flask ever sees it. The body has no such limit.
        type: 'POST',
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
      // scrollX off deliberately. It clones the header into a second table
      // with its own width calculation, and a sticky first column in the body
      // then no longer lines up with the header above it. One table scrolling
      // inside .crm-scroll keeps a single set of column widths.
      scrollX: false,
      autoWidth: false,
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
        // Rows are replaced on every draw, so the boxes need re-ticking from
        // the selection rather than from the DOM.
        if (opts.rowId && typeof syncChecks === 'function') syncChecks();
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
        '<div class="crm-mode" role="group" aria-label="Pointer mode">' +
          '<button type="button" data-mode="drag" title="Drag to scroll the table" aria-label="Drag to scroll">' +
            '<i data-lucide="hand"></i></button>' +
          '<button type="button" data-mode="select" title="Select and copy text" aria-label="Select text">' +
            '<i data-lucide="text-cursor"></i></button>' +
        '</div>' +
        '<div class="dropdown crm-views">' +
          '<button type="button" class="btn btn-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
            '<i data-lucide="bookmark"></i>Views</button>' +
          '<div class="dropdown-menu dropdown-menu-right crm-views__menu"></div>' +
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

    /* --- saved views ------------------------------------------------------
       A view is the query plus the sort and page size - the things that make
       "my overdue education leads" a different screen from the same table. The
       state already lives in the URL, so a view is just a stored URL. Kept per
       browser in localStorage, per the decision not to add a schema. */

    var VIEWS = 'crm51.' + key + '.views';
    var DEFAULT_VIEW = 'crm51.' + key + '.defaultView';

    function readViews() {
      try { return JSON.parse(store(VIEWS) || '[]'); } catch (e) { return []; }
    }
    function writeViews(list) { store(VIEWS, JSON.stringify(list)); }

    function currentView() {
      var info = table.page.info();
      return { q: $input.val(), size: info.length,
               sort: currentSortName(), dir: currentSortDir() };
    }

    function applyView(v) {
      $input.val(v.q || '');
      $clear.prop('hidden', !v.q);
      terms = (v.q || '').split(/\s+/).filter(Boolean);
      renderChips();
      if (v.sort) {
        var i = columns.findIndex(function (c) { return c.data === v.sort; });
        if (i >= 0) table.order([i, v.dir === 'desc' ? 'desc' : 'asc']);
      }
      if (v.size) table.page.len(v.size);
      table.search(v.q || '').draw();
    }

    function renderViews() {
      var list = readViews();
      var dflt = store(DEFAULT_VIEW) || '';
      var $menu = $tools.find('.crm-views__menu').empty();

      if (!list.length) {
        $menu.append('<span class="dropdown-item crm-views__empty">No saved views yet</span>');
      }
      list.forEach(function (v, i) {
        var $row = $('<div class="crm-views__row"></div>');
        $('<button type="button" class="crm-views__apply"></button>')
          .text(v.name)
          .append(v.name === dflt ? ' <span class="crm-views__badge">default</span>' : '')
          .on('click', function () { applyView(v); $menu.parent().removeClass('show'); $menu.removeClass('show'); })
          .appendTo($row);
        $('<button type="button" class="crm-views__star" title="Set as default" aria-label="Set as default"><i data-lucide="star"></i></button>')
          .on('click', function (e) {
            e.stopPropagation();
            store(DEFAULT_VIEW, v.name === dflt ? '' : v.name);
            renderViews();
          }).appendTo($row);
        $('<button type="button" class="crm-views__del" title="Delete view" aria-label="Delete view"><i data-lucide="x"></i></button>')
          .on('click', function (e) {
            e.stopPropagation();
            var next = readViews(); next.splice(i, 1); writeViews(next);
            if (v.name === dflt) store(DEFAULT_VIEW, '');
            renderViews();
          }).appendTo($row);
        $menu.append($row);
      });

      $menu.append('<div class="dropdown-divider"></div>');
      $('<button type="button" class="dropdown-item crm-views__save"><i data-lucide="bookmark-plus"></i>Save current view</button>')
        .on('click', function () {
          var name = window.prompt('Name this view');
          if (!name) return;
          name = name.trim().slice(0, 40);
          if (!name) return;
          var list = readViews().filter(function (x) { return x.name !== name; });
          list.push($.extend({ name: name }, currentView()));
          writeViews(list);
          renderViews();
        })
        .appendTo($menu);

      if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', attrs: { width: 13, height: 13 } });
    }
    renderViews();

    // A default view applies only on a clean URL, so a shared link always wins.
    (function () {
      if (window.location.search) return;
      var dflt = store(DEFAULT_VIEW);
      if (!dflt) return;
      var v = readViews().filter(function (x) { return x.name === dflt; })[0];
      if (v) applyView(v);
    })();


    /* --- selection and bulk actions --------------------------------------
       Server-side paging means "select all" can only ever mean the rows on
       this page; anything else would be a promise the table cannot keep. The
       bar says so. */

    var selected = {};        // id -> true
    var lastIndex = null;

    function selectionCount() { return Object.keys(selected).length; }

    function rowId(row) { return opts.rowId ? row[opts.rowId] : null; }

    function syncBar() {
      var n = selectionCount();
      $bar.toggleClass('is-shown', n > 0);
      $bar.find('.crm-bulk__count').text(n === 1 ? '1 row selected' : n + ' rows selected');
      var $head = $table.find('thead .crm-check-all');
      var ids = table.rows({ page: 'current' }).data().toArray().map(rowId).filter(function (x) { return x != null; });
      var onPage = ids.filter(function (id) { return selected[id]; }).length;

      // Selection survives paging and filtering, so say so rather than
      // claiming a scope the count does not match. Export can only reach the
      // rows currently loaded; delete works on ids and reaches all of them.
      $bar.find('.crm-bulk__scope').text(
        n > onPage ? onPage + ' on this page, ' + (n - onPage) + ' on others'
                   : 'on this page');
      $bar.find('.crm-bulk__export').prop('disabled', onPage === 0)
          .attr('title', n > onPage ? 'Exports the ' + onPage + ' selected rows on this page'
                                    : 'Exports the selected rows');
      $head.prop('checked', ids.length > 0 && onPage === ids.length);
      $head.prop('indeterminate', onPage > 0 && onPage < ids.length);
    }

    function syncChecks() {
      $table.find('tbody .crm-check').each(function () {
        this.checked = !!selected[this.value];
        $(this).closest('tr').toggleClass('selected', this.checked);
      });
      syncBar();
    }

    var $bar = $('<div class="crm-bulk" role="region" aria-label="Bulk actions">' +
        '<span class="crm-bulk__count"></span>' +
        '<span class="crm-bulk__scope">on this page</span>' +
        '<div class="crm-bulk__actions">' +
          '<button type="button" class="btn btn-secondary btn-sm crm-bulk__export"><i data-lucide="download"></i>Export selected</button>' +
          '<button type="button" class="btn btn-secondary btn-sm crm-bulk__clear">Clear</button>' +
        '</div>' +
      '</div>');
    $wrap.append($bar);

    // A change event does not carry shiftKey in every browser, so record it
    // from the click that precedes it.
    var shiftHeld = false;
    $table.on('click', '.crm-check, .crm-checkbox', function (e) { shiftHeld = e.shiftKey; });
    $table.on('keydown', '.crm-check', function (e) { shiftHeld = e.shiftKey; });

    $table.on('change', '.crm-check', function (e) {
      var idx = $(this).closest('tr').index();
      if ((e.shiftKey || shiftHeld) && lastIndex !== null) {
        var lo = Math.min(idx, lastIndex), hi = Math.max(idx, lastIndex);
        $table.find('tbody tr').slice(lo, hi + 1).find('.crm-check').each(function () {
          if (this.checked !== e.target.checked) {
            this.checked = e.target.checked;
            if (this.checked) selected[this.value] = true; else delete selected[this.value];
          }
        });
      }
      if (this.checked) selected[this.value] = true; else delete selected[this.value];
      lastIndex = idx;
      shiftHeld = false;
      syncChecks();
    });

    $table.on('change', '.crm-check-all', function () {
      var on = this.checked;
      $table.find('tbody .crm-check').each(function () {
        this.checked = on;
        if (on) selected[this.value] = true; else delete selected[this.value];
      });
      syncChecks();
    });

    $bar.on('click', '.crm-bulk__clear', function () { selected = {}; syncChecks(); });

    $bar.on('click', '.crm-bulk__export', function () {
      var ids = Object.keys(selected);
      var rows = table.rows({ page: 'current' }).data().toArray()
        .filter(function (r) { return selected[rowId(r)]; });
      var cols = columns.filter(function (c) { return c.data; });
      var esc = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
      var csv = [cols.map(function (c) { return esc(c.data); }).join(',')];
      rows.forEach(function (r) { csv.push(cols.map(function (c) { return esc(r[c.data]); }).join(',')); });
      var blob = new Blob(['\ufeff' + csv.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = key + '-' + rows.length + '-rows.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });

    /* --- skeleton on the very first load --------------------------------- */
    $table.find('tbody').html(skeleton(columns.length, 8));
    $table.one('draw.dt', function () { $table.find('.crm-skel-row').remove(); });

    $wrap.on('click', '.crm-retry', function () { table.ajax.reload(); });

    /* --- drag to scroll ---------------------------------------------------
       Wide tables are hard to reach with a trackpad and impossible with a
       mouse that has no horizontal wheel. Grab anywhere that is not a control
       and drag. A few pixels of movement before we claim the gesture, so a
       plain click on a row still behaves like a click. */
    // With scrollX off there is no .dataTables_scrollBody, so the wrapper is
    // the scrolling element.
    var scroller = $wrap.find('.dataTables_scrollBody').get(0) || $wrap.get(0);
    scroller.classList.add('crm-scroll');

    var drag = null;
    var DRAG_THRESHOLD = 4;

    /* Drag-to-scroll and selecting text are mutually exclusive: a drag that
       starts on a cell is either panning the table or highlighting a value,
       and the browser cannot tell which was meant. So it is a mode, with a
       toggle, remembered per table. */
    var MODE = 'crm51.' + key + '.mode';
    var mode = store(MODE) || 'drag';

    function applyMode(next) {
      mode = next;
      scroller.classList.toggle('is-select-mode', mode === 'select');
      $tools.find('.crm-mode button').each(function () {
        this.classList.toggle('is-on', this.getAttribute('data-mode') === mode);
      });
      store(MODE, mode);
    }

    $tools.on('click', '.crm-mode button', function () {
      applyMode(this.getAttribute('data-mode'));
    });
    applyMode(mode);

    scroller.addEventListener('pointerdown', function (e) {
      if (mode !== 'drag') return;          // let the browser select instead
      if (e.button !== 0) return;
      if (e.target.closest('button, a, input, select, textarea, label, .dropdown')) return;
      drag = { x: e.clientX, left: scroller.scrollLeft, active: false, id: e.pointerId };
    });

    scroller.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.active) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        drag.active = true;
        scroller.classList.add('is-dragging');
        try { scroller.setPointerCapture(drag.id); } catch (err) {}
      }
      scroller.scrollLeft = drag.left - dx;
      e.preventDefault();
    });

    function endDrag() {
      if (!drag) return;
      if (drag.active) {
        scroller.classList.remove('is-dragging');
        try { scroller.releasePointerCapture(drag.id); } catch (err) {}
      }
      drag = null;
    }
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('pointerleave', endDrag);

    // The pinned column only needs its edge once the body has actually moved.
    scroller.addEventListener('scroll', function () {
      scroller.classList.toggle('is-scrolled', scroller.scrollLeft > 0);
    });

    if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', attrs: { width: 14, height: 14 } });
    return table;
  };
})(window, jQuery);


/* ---------------------------------------------------------------------------
   crmEnhance — for tables that stay client-side.

   Some views are inherently small: a recall list is one date's call-backs, the
   user list is fifteen rows. Those do not need a server-side endpoint, but they
   should still drag-scroll, pin their first column, label their cells on mobile
   and get the same search field. Call this instead of crmTable.

     crmEnhance('#recall_date_table', { placeholder: 'Search this list' });
   --------------------------------------------------------------------------- */
(function (window, $) {
  'use strict';

  window.crmEnhance = function (selector, opts) {
    opts = opts || {};
    var $table = $(selector);
    if (!$table.length || !$.fn.DataTable.isDataTable(selector)) return null;

    var table = $table.DataTable();
    var $wrap = $table.closest('.dataTables_wrapper');
    var already = $wrap.data('crm-enhanced');
    $wrap.data('crm-enhanced', true);

    /* --- mobile card labels --------------------------------------------- */
    function relabel() {
      var api = table;
      var labels = api.columns(':visible').header().toArray().map(function (th) {
        return $(th).text().trim();
      });
      $table.find('tbody tr').each(function () {
        $(this).children('td').each(function (i) {
          var l = labels[i] || '';
          if (l) this.setAttribute('data-label', l);
          else this.classList.add('crm-cell-actions');
        });
      });
    }
    table.on('draw', relabel);
    relabel();

    /* --- drag to scroll ------------------------------------------------- */
    var scroller = $wrap.find('.dataTables_scrollBody').get(0) || $wrap.get(0);
    scroller.classList.add('crm-scroll');

    if (already) {
      // Called again - typically because a modal just made the table visible
      // and it can finally measure itself. Re-label and re-measure, but do not
      // bind the listeners a second time.
      relabel();
      table.columns.adjust();
      return table;
    }

    var drag = null;

    // Same mode toggle as the server-side tables: pan, or select text.
    var MODE = 'crm51.' + (opts.key || selector.replace(/\W/g,'')) + '.mode';
    var mode = (function () { try { return localStorage.getItem(MODE) || 'drag'; } catch (e) { return 'drag'; } })();
    function setMode(next) {
      mode = next;
      scroller.classList.toggle('is-select-mode', mode === 'select');
      $wrap.find('.crm-mode button').each(function () {
        this.classList.toggle('is-on', this.getAttribute('data-mode') === mode);
      });
      try { localStorage.setItem(MODE, mode); } catch (e) {}
    }

    scroller.addEventListener('pointerdown', function (e) {
      if (mode !== 'drag') return;
      if (e.button !== 0) return;
      if (e.target.closest('button, a, input, select, textarea, label, .dropdown')) return;
      drag = { x: e.clientX, left: scroller.scrollLeft, active: false, id: e.pointerId };
    });
    scroller.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.active) {
        if (Math.abs(dx) < 4) return;
        drag.active = true;
        scroller.classList.add('is-dragging');
        try { scroller.setPointerCapture(drag.id); } catch (err) {}
      }
      scroller.scrollLeft = drag.left - dx;
      e.preventDefault();
    });
    function endDrag() {
      if (!drag) return;
      if (drag.active) {
        scroller.classList.remove('is-dragging');
        try { scroller.releasePointerCapture(drag.id); } catch (err) {}
      }
      drag = null;
    }
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      scroller.addEventListener(ev, endDrag);
    });
    scroller.addEventListener('scroll', function () {
      scroller.classList.toggle('is-scrolled', scroller.scrollLeft > 0);
    });

    /* --- one search field, replacing the stock one ----------------------- */
    if (opts.search !== false) {
      var $filter = $wrap.find('.dataTables_filter');
      $filter.hide();
      var $bar = $('<div class="crm-toolbar"><div class="crm-search">' +
        '<span class="crm-search__icon"><i data-lucide="search"></i></span>' +
        '<input type="search" class="crm-search__input" autocomplete="off" ' +
               'placeholder="' + (opts.placeholder || 'Search') + '" aria-label="Search this table">' +
        '<button type="button" class="crm-search__clear" aria-label="Clear search" hidden>' +
          '<i data-lucide="x"></i></button>' +
        '</div>' +
        '<div class="crm-toolbar__right">' +
          '<div class="crm-mode" role="group" aria-label="Pointer mode">' +
            '<button type="button" data-mode="drag" title="Drag to scroll the table" aria-label="Drag to scroll"><i data-lucide="hand"></i></button>' +
            '<button type="button" data-mode="select" title="Select and copy text" aria-label="Select text"><i data-lucide="text-cursor"></i></button>' +
          '</div>' +
        '</div></div>');
      $wrap.prepend($bar);
      $bar.on('click', '.crm-mode button', function () { setMode(this.getAttribute('data-mode')); });
      var $in = $bar.find('.crm-search__input');
      var $clear = $bar.find('.crm-search__clear');
      var t = null;
      $in.on('input', function () {
        $clear.prop('hidden', !$in.val());
        clearTimeout(t);
        t = setTimeout(function () { table.search($in.val()).draw(); }, 300);
      });
      $clear.on('click', function () { $in.val('').trigger('input').focus(); });
    }

    setMode(mode);
    if (window.lucide) lucide.createIcons({ nameAttr: 'data-lucide', attrs: { width: 14, height: 14 } });
    return table;
  };
})(window, jQuery);
