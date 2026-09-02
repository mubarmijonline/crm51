/* Skeletons and per-widget loading.
 *
 * One module so a widget never has to invent its own spinner. Two entry
 * points, matching the two kinds of wait:
 *
 *   crmSkeleton.<shape>(host, n)  - first load: draw a placeholder in the
 *                                   shape of the content that is coming.
 *   crmBusy(host, true|false)     - refresh: keep the content, dim it,
 *                                   put a spinner over it.
 *
 * Both take an element or a selector. Neither throws when the host is absent,
 * so a page that does not have a given widget can call them unconditionally.
 */
(function (window, document) {
  'use strict';

  function el(host) {
    return typeof host === 'string' ? document.querySelector(host) : host;
  }

  function bars(n, widths) {
    var out = '';
    for (var i = 0; i < n; i++) {
      out += '<span class="crm-skel crm-skel--line" style="width:' +
             widths[i % widths.length] + '"></span>';
    }
    return out;
  }

  var crmSkeleton = {

    /* A stack of text lines. The default for anything without its own shape. */
    text: function (host, rows) {
      var h = el(host); if (!h) return;
      h.innerHTML = '<div class="crm-skel-stack">' +
        bars(rows || 3, ['100%', '92%', '64%']) + '</div>';
    },

    /* Notes timeline: avatar, author line, then the note itself. Mirrors the
     * markup crm-notes.js renders, so nothing jumps when the notes arrive. */
    notes: function (host, count) {
      var h = el(host); if (!h) return;
      var out = '<div class="notes" aria-busy="true">';
      for (var i = 0; i < (count || 3); i++) {
        out +=
          '<div class="crm-skel-note">' +
            '<span class="crm-skel crm-skel--avatar"></span>' +
            '<div class="crm-skel-note__body">' +
              '<span class="crm-skel crm-skel--title"></span>' +
              bars(i === 1 ? 2 : 1, ['100%', '78%']) +
            '</div>' +
          '</div>';
      }
      h.innerHTML = out + '</div>';
    },

    /* Column chart: bars of varying height along a baseline. */
    chart: function (host, bars_) {
      var h = el(host); if (!h) return;
      var heights = [58, 84, 41, 96, 67, 50, 78, 35];
      var out = '<div class="crm-skel-chart" aria-busy="true">';
      for (var i = 0; i < (bars_ || 7); i++) {
        out += '<span class="crm-skel" style="height:' +
               heights[i % heights.length] + '%;animation-delay:' +
               (i * 0.06).toFixed(2) + 's"></span>';
      }
      h.innerHTML = out + '</div>';
    },

    /* Month grid. 35 cells is five weeks, what the calendar shows most often. */
    calendar: function (host, cells) {
      var h = el(host); if (!h) return;
      var out = '<div class="crm-skel-cal" aria-busy="true">';
      for (var i = 0; i < (cells || 35); i++) {
        out += '<div style="animation-delay:' + ((i % 7) * 0.05).toFixed(2) + 's"></div>';
      }
      h.innerHTML = out + '</div>';
    },

    clear: function (host) {
      var h = el(host); if (h) h.innerHTML = '';
    }
  };

  /* Per-widget busy state. Reference-counted, so two overlapping requests over
   * the same widget do not have the second one's completion uncover the first
   * one that is still running. */
  function crmBusy(host, on) {
    var h = el(host); if (!h) return;
    var n = parseInt(h.getAttribute('data-busy') || '0', 10);
    n = Math.max(0, n + (on ? 1 : -1));
    h.setAttribute('data-busy', n);

    var veil = h.querySelector(':scope > .crm-busy__veil');
    if (n > 0) {
      h.classList.add('crm-busy');
      h.setAttribute('aria-busy', 'true');
      if (!veil) {
        veil = document.createElement('div');
        veil.className = 'crm-busy__veil';
        veil.innerHTML = '<span class="crm-busy__spin" role="status" aria-label="Loading"></span>';
        h.appendChild(veil);
      }
    } else {
      h.removeAttribute('aria-busy');
      h.classList.remove('crm-busy');
      h.removeAttribute('data-busy');
      if (veil) veil.remove();
    }
  }

  /* Declarative auto-init.
   *
   * `<div id="chart" data-skeleton="chart"></div>` gets a placeholder without
   * the page having to script one. This is how the Google Charts containers
   * are covered: chart.draw() replaces the container's children, so the
   * skeleton clears itself when the chart paints - no callback to wire into
   * ten separate draw functions.
   *
   * A chart that never arrives would otherwise pulse forever, so each one
   * gives up after a while and says so.
   */
  var GIVE_UP_MS = 15000;

  function start(node) {
    if (node.getAttribute('data-skeleton-on') === '1') return;
    node.setAttribute('data-skeleton-on', '1');

    var shape = node.getAttribute('data-skeleton');
    crmSkeleton[shape](node);

    // Painting during parsing can be undone: the parser had not yet reached
    // the element's closing tag, so it carried on writing into it and threw
    // the placeholder away. Anything still empty once the DOM is settled gets
    // painted again - and anything that has real content by then is left be.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        if (!node.firstChild) crmSkeleton[shape](node);
      });
    }

    window.setTimeout(function () {
      if (!node.querySelector('.crm-skel, .crm-skel-cal')) return;  // it painted
      node.innerHTML =
        '<div class="crm-state">' +
          '<p class="crm-state__body">No data to chart for this record.</p>' +
        '</div>';
    }, GIVE_UP_MS);
  }

  /* Per-widget, in the literal sense: a widget's skeleton starts when that
   * widget is actually on screen. Several of these containers sit in panels
   * that are collapsed on load, and a placeholder that pulses - and then
   * times out - inside something nobody has opened is just wasted work. */
  var io = null;

  function observer() {
    if (io || !window.IntersectionObserver) return io;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        start(e.target);
      });
    }, { rootMargin: '120px' });
    return io;
  }

  function autoInit() {
    var nodes = document.querySelectorAll('[data-skeleton]:not([data-skeleton-seen])');
    Array.prototype.forEach.call(nodes, function (node) {
      if (!crmSkeleton[node.getAttribute('data-skeleton')]) return;
      node.setAttribute('data-skeleton-seen', '1');
      var o = observer();
      if (o) o.observe(node); else start(node);
    });
  }

  /* Waiting for DOMContentLoaded is too late. A synchronous <script> further
   * down the page - the Google Charts loader, for one - holds that event back
   * until it has downloaded, and the containers would sit empty until then,
   * which is exactly the wait the skeleton exists to cover. Scanning on each
   * frame while the document is still parsing picks each container up within
   * a frame of it being parsed. start() is idempotent, so the repeat scans
   * and the final DOMContentLoaded pass cost nothing. */
  function scan() {
    autoInit();
    if (document.readyState === 'loading') window.requestAnimationFrame(scan);
  }

  if (document.readyState === 'loading') {
    window.requestAnimationFrame(scan);
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  window.crmSkeleton = crmSkeleton;
  window.crmBusy = crmBusy;
})(window, document);
