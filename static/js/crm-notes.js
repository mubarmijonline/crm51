/* ---------------------------------------------------------------------------
   crm-notes.js — the notes timeline.

   Replaces the DataTable-of-textareas with a comment thread: newest first,
   grouped by day under a sticky header, each note an avatar plus a bubble.
   Relative time under a day, absolute after, with the full timestamp on hover.

     crmNotes('#notes_timeline', { url: '/get_american_notes?id=' + id });
   --------------------------------------------------------------------------- */

(function (window, $) {
  'use strict';

  var AVATAR_TINTS = ['--viz-1', '--viz-2', '--viz-3', '--viz-4', '--viz-5', '--viz-6'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Same name always lands on the same tint.
  function tintFor(name) {
    var h = 0, s = String(name || '?');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return AVATAR_TINTS[h % AVATAR_TINTS.length];
  }

  function initials(name) {
    var parts = String(name || '?').trim().split(/[\s.]+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  // "2024-05-03 04:02 PM" and "2024-05-03 16:02:23" both parse.
  function parseDate(row) {
    var raw = row.added_date_standard || row.added_date || '';
    var d = new Date(raw.replace(' ', 'T'));
    if (!isNaN(d)) return d;
    d = new Date(raw);
    return isNaN(d) ? null : d;
  }

  function relative(d) {
    if (!d) return '';
    var secs = (Date.now() - d.getTime()) / 1000;
    if (secs < 60)    return 'just now';
    if (secs < 3600)  return Math.floor(secs / 60) + ' min ago';
    if (secs < 86400) return Math.floor(secs / 3600) + ' hrs ago';
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function absolute(d) {
    if (!d) return '';
    return d.toLocaleString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function dayLabel(d) {
    if (!d) return 'Undated';
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var that = new Date(d);  that.setHours(0, 0, 0, 0);
    var diff = Math.round((today - that) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  window.crmNotes = function (selector, opts) {
    var host = document.querySelector(selector);
    if (!host) return null;

    function render(rows) {
      if (!rows || !rows.length) {
        host.innerHTML = '<p class="notes__empty">No notes yet. The first one you add appears here.</p>';
        return;
      }

      // The endpoint already sorts newest first; sort again so a partial or
      // re-ordered payload cannot scramble the thread.
      rows = rows.slice().sort(function (a, b) {
        var da = parseDate(a), db = parseDate(b);
        return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
      });

      var html = '', lastDay = null, dayIndex = 0;
      rows.forEach(function (row) {
        var d = parseDate(row);
        var day = dayLabel(d);
        if (day !== lastDay) {
          // Cycle six accents so two consecutive days never share one. The
          // date is always spelled out, so colour is never the only signal.
          html += '<div class="notes__day d' + (dayIndex % 6) + '">' +
                    '<span>' + esc(day) + '</span></div>';
          lastDay = day;
          dayIndex++;
        }
        var who = row.added_by || 'Unknown';
        html +=
          '<div class="note">' +
            '<span class="note__avatar" style="background:var(' + tintFor(who) + ')">' +
              esc(initials(who)) + '</span>' +
            '<div class="note__body">' +
              '<div class="note__bubble">' +
                '<span class="note__author">' + esc(who) + '</span>' +
                '<p class="note__text">' + esc(row.notes) + '</p>' +
              '</div>' +
              '<div class="note__meta">' +
                '<time title="' + esc(row.added_date || '') + '">' + esc(relative(d)) + '</time>' +
                (absolute(d) ? '<span aria-hidden="true">·</span><span>' + esc(absolute(d)) + '</span>' : '') +
              '</div>' +
            '</div>' +
          '</div>';
      });
      host.innerHTML = html;
    }

    function load() {
      host.innerHTML = '<p class="notes__empty">Loading notes…</p>';
      $.getJSON(opts.url).done(function (payload) {
        render(payload && payload.data ? payload.data : payload);
      }).fail(function () {
        host.innerHTML = '<p class="notes__empty">Could not load the notes. Refresh to try again.</p>';
      });
    }

    load();
    return { reload: load, render: render };
  };
})(window, jQuery);
