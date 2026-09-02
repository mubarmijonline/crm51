/* Themed Google Charts.
 *
 * The charts in this app were drawn with hardcoded colours ('#555' for the
 * legend, Google's defaults for the bars), so they were legible in the light
 * theme and close to invisible in the dark one. This reads the palette off the
 * document instead - the same --viz-* tokens the note avatars use - and
 * redraws when the theme changes.
 *
 * crmChart(el, url, opts) fetches, draws, and returns a handle with .reload().
 * The container keeps whatever skeleton it had until the draw replaces it.
 */
(function (window, document, $) {
  'use strict';

  var charts = [];

  /* google.visualization exists as soon as the loader script runs, but
   * arrayToDataTable only appears once the corechart package has finished
   * loading. Checking the namespace was not enough: every chart threw once on
   * its first draw and only rendered on the load callback afterwards. */
  var ready = false;

  function whenReady(fn) {
    if (ready) { fn(); return; }
    google.charts.setOnLoadCallback(function () { ready = true; fn(); });
  }

  function token(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v || '').trim() || fallback;
  }

  function palette() {
    var out = [];
    for (var i = 1; i <= 6; i++) out.push(token('--viz-' + i, '#666'));
    return out;
  }

  /* Rotating the six viz colours made red the first bar of every chart, so the
   * biggest column on the page was always red and "Pending" came out red while
   * "Completed" came out blue. Red is meant to be sparing here, and colour
   * should carry meaning rather than just index position. These buckets have a
   * known vocabulary, so they get the status colours; anything unrecognised
   * falls back to one neutral, because the axis labels already tell the
   * categories apart. */
  var BUCKET_TONE = {
    'enrol':          '--status-success-fg',
    'completed':      '--status-success-fg',
    'deposit taken':  '--status-success-fg',
    'pending':        '--status-warning-fg',
    'not interested': '--status-danger-fg',
    'not contacted':  '--status-neutral-fg',
    'no deposit':     '--status-neutral-fg',
    'unspecified':    '--status-neutral-fg',
    'hot':            '--status-danger-fg',
    'cold':           '--status-info-fg'
  };

  function toneFor(bucket) {
    var key = String(bucket || '').trim().toLowerCase();
    return token(BUCKET_TONE[key] || '--viz-2', '#1F6FB2');
  }

  function theme() {
    return {
      colors: palette(),
      backgroundColor: 'transparent',
      chartArea: { width: '82%', height: '68%' },
      legend: { position: 'none' },
      titleTextStyle: {
        color: token('--text-title', '#111'),
        fontSize: 14, bold: true
      },
      hAxis: {
        textStyle: { color: token('--text-muted', '#666'), fontSize: 12 },
        gridlines: { color: 'transparent' }
      },
      vAxis: {
        textStyle: { color: token('--text-muted', '#666'), fontSize: 12 },
        gridlines: { color: token('--border-hairline', '#eee') },
        minorGridlines: { count: 0 },
        baselineColor: token('--border-hairline', '#eee')
      },
      tooltip: { textStyle: { fontSize: 12 } },
      bar: { groupWidth: '56%' }
    };
  }

  function crmChart(el, url, opts) {
    opts = opts || {};
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;

    var rows = null;

    function draw() {
      if (!rows || !ready) return;

      if (!rows.length) {
        node.innerHTML = '<div class="crm-state">' +
          '<p class="crm-state__body">Nothing to chart yet.</p></div>';
        return;
      }

      var table = [[opts.categoryLabel || 'Category', opts.valueLabel || 'Leads']];
      rows.forEach(function (r) { table.push([r.bucket, r.lead_count]); });

      var options = theme();
      options.title = opts.title || '';

      var data = google.visualization.arrayToDataTable(table);
      var view = new google.visualization.DataView(data);
      view.setColumns([0, 1, {
        type: 'string', role: 'style',
        calc: function (dt, row) { return 'color: ' + toneFor(dt.getValue(row, 0)); }
      }]);

      new google.visualization.ColumnChart(node).draw(view, options);
    }

    function load() {
      $.getJSON(url).done(function (payload) {
        rows = (payload && payload.data) || [];
        if (payload && payload.title && !opts.title) opts.title = payload.title;
        whenReady(draw);
      }).fail(function () {
        node.innerHTML = '<div class="crm-state">' +
          '<p class="crm-state__body">Could not load this chart.</p></div>';
      });
    }

    var handle = { reload: load, redraw: draw, node: node };
    charts.push(handle);

    whenReady(draw);   // in case the rows land first
    load();
    return handle;
  }

  /* Google Charts renders to fixed pixel sizes, so a theme swap or a resize
   * needs a redraw rather than a repaint. */
  function redrawAll() { charts.forEach(function (c) { c.redraw(); }); }

  new MutationObserver(redrawAll).observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-theme'] });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(redrawAll, 200);
  });

  window.crmChart = crmChart;
})(window, document, jQuery);
