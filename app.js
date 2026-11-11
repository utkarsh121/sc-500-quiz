/* SC-500 Exam Practice — static, no backend, no tracking.
   All state lives in localStorage. Question bank is per-topic files
   data/topics/*.json, listed in data/bank.json, and also embedded as
   window.SC500_BANK in data/questions.js so the site works from file://
   as well as from GitHub Pages. */
(function () {
  'use strict';

  var LS_MARKS = 'sc500_learn_marks_v1';
  var LS_WRONG = 'sc500_wrong_ids_v1';
  var LS_HISTORY = 'sc500_exam_history_v1';

  var bank = null;
  var questions = [];
  var learnList = []; // set by bankLoaded(); must be declared before the bank loads, not re-initialised later
  var learnIndex = 0;
  var learnFlipped = false;

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, Math.min(n, arr.length)); }
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage full/blocked: ignore */ }
  }
  function letters(i) { return 'ABCD'[i]; }
  function fmtTime(sec) {
    sec = Math.max(0, sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return h > 0 ? h + ':' + p(m) + ':' + p(s) : p(m) + ':' + p(s);
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  // Source strings are "Title. https://learn.microsoft.com/..." or just "Title."
  // Show a short "Source: <title>" link, never a raw long URL.
  function parseSource(source) {
    var s = String(source || '').trim();
    var m = s.match(/(https?:\/\/\S+)\s*$/);
    var url = m ? m[1].replace(/[).,]+$/, '') : '';
    var title = (m ? s.slice(0, m.index) : s).trim().replace(/\s*[.\-–—:;]+\s*$/, '');
    if (!title) title = url || 'Microsoft Learn';
    return { title: title, url: url };
  }
  function sourceHtml(source) {
    var p = parseSource(source);
    if (p.url && /^https:\/\//.test(p.url)) {
      return '<a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener">' + escapeHtml(p.title) + '</a>';
    }
    return escapeHtml(p.title);
  }
  function renderSourceLink(el, qOrSource) {
    if (qOrSource && typeof qOrSource === 'object') {
      el.innerHTML = 'Source: ' + sourceHtmlFor(qOrSource) +
        (qOrSource.source_quote ? '<br><span class="source-quote">' + escapeHtml(qOrSource.source_quote) + '</span>' : '');
    } else {
      el.innerHTML = 'Source: ' + sourceHtml(qOrSource);
    }
  }
  // New bank questions carry source_url / source_title / source_quote.
  function sourceHtmlFor(q) {
    if (q && q.source_url && q.source_title) {
      return '<a href="' + escapeHtml(q.source_url) + '" target="_blank" rel="noopener">' + escapeHtml(q.source_title) + '</a>';
    }
    return sourceHtml(q ? q.source : '');
  }
  function sourceQuoteHtml(q) {
    if (q && q.source_quote) return '<p class="source-quote">' + escapeHtml(q.source_quote) + '</p>';
    return '';
  }
  function activeQuestions() { return questions.filter(function (q) { return q.status === 'active'; }); }

  // ---------- views ----------
  var views = ['home', 'learn', 'eval-setup', 'eval-exam', 'results'];
  function showView(name) {
    views.forEach(function (v) {
      var el = $('view-' + v);
      if (el) el.classList.toggle('hidden', v !== name);
    });
    window.scrollTo(0, 0);
    document.querySelectorAll('.top-nav [data-nav]').forEach(function (el) {
      if (el.getAttribute('data-nav') === name) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
    if (name === 'learn') renderLearn();
    if (name === 'eval-exam') renderExam();
  }
  document.querySelectorAll('[data-nav]').forEach(function (el) {
    el.addEventListener('click', function () { showView(el.getAttribute('data-nav')); });
  });

  // ---------- load bank ----------
  function bankLoaded(data) {
    bank = data;
    questions = (data.questions || []).slice();
    var active = activeQuestions();
    var meta = 'Bank version ' + data.bank_version + ' · ' + active.length + ' hard questions · ' +
      'Last updated ' + data.last_updated;
    $('bank-meta').textContent = meta;
    $('bank-version-home').textContent = data.bank_version;
    $('bank-count-home').textContent = String(active.length);
    $('bank-version-foot').textContent = data.bank_version;
    renderHomeCounts(active);
    // Learn topic list
    var topics = [];
    active.forEach(function (q) { if (topics.indexOf(q.topic) === -1) topics.push(q.topic); });
    topics.sort();
    var sel = $('learn-topic');
    topics.forEach(function (t) {
      var o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o);
    });
    learnList = active.slice();
    renderLearn();
  }
  // Per-domain and per-topic counts on the home screen, computed from the
  // live bank (not hardcoded) so they stay correct as the bank grows.
  var DOMAIN_ORDER = [
    { domain: 'Manage identity, access, and governance', short: 'Domain 1 — Identity, access, and governance', weight: '20–25% of the exam' },
    { domain: 'Secure storage, databases, and networking', short: 'Domain 2 — Storage, databases, and networking', weight: '25–30% of the exam' },
    { domain: 'Secure compute', short: 'Domain 3 — Secure compute', weight: '20–25% of the exam' },
    { domain: 'Manage and monitor security posture', short: 'Domain 4 — Security posture', weight: '20–25% of the exam' }
  ];
  function renderHomeCounts(active) {
    var dc = $('domain-counts');
    if (dc) {
      dc.innerHTML = '';
      DOMAIN_ORDER.forEach(function (d) {
        var n = active.filter(function (q) { return q.domain === d.domain; }).length;
        if (!n) return;
        var card = document.createElement('article');
        card.className = 'count-card';
        var num = document.createElement('p'); num.className = 'count-num'; num.textContent = String(n);
        var label = document.createElement('p'); label.className = 'count-label'; label.textContent = d.short;
        var sub = document.createElement('p'); sub.className = 'count-sub';
        sub.textContent = d.weight + ' · ' + Math.round((n / active.length) * 100) + '% of the bank';
        card.appendChild(num); card.appendChild(label); card.appendChild(sub);
        dc.appendChild(card);
      });
    }
    var tc = $('topic-counts');
    if (tc) {
      var byTopic = {};
      active.forEach(function (q) { byTopic[q.topic] = (byTopic[q.topic] || 0) + 1; });
      tc.innerHTML = '';
      Object.keys(byTopic).sort(function (a, b) { return byTopic[b] - byTopic[a] || (a < b ? -1 : 1); })
        .forEach(function (topic) {
          var li = document.createElement('li');
          var name = document.createElement('span'); name.textContent = topic;
          var n = document.createElement('span'); n.className = 'topic-n'; n.textContent = String(byTopic[topic]);
          li.appendChild(name); li.appendChild(n); tc.appendChild(li);
        });
    }
  }
  function loadError(msg) {
    var el = $('load-error');
    el.classList.remove('hidden');
    el.textContent = 'Could not load the question bank: ' + msg +
      ' If you opened this file directly, please serve it instead: python3 -m http.server, then open http://localhost:8000/';
  }
  if (window.SC500_BANK) {
    bankLoaded(window.SC500_BANK);
  } else {
    fetch('data/bank.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (manifest) {
        return Promise.all(manifest.files.map(function (f) {
          return fetch(f.file).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + f.file); return r.json(); });
        })).then(function (topics) {
          var qs = [];
          topics.forEach(function (t) { qs = qs.concat(t.questions || []); });
          bankLoaded({ bank_version: manifest.bank_version, last_updated: manifest.last_updated, questions: qs });
        });
      })
      .catch(function (e) { loadError(e.message); });
  }

  // ---------- Learn mode ----------
  // NOTE: learnList, learnIndex and learnFlipped are declared near the top,
  // before the bank loads. Do NOT re-declare them here — bankLoaded() calls
  // renderLearn() during initial load, when these must already be assigned
  // (var hoisting alone leaves them undefined until this point executes).

  function learnFiltered() {
    var diff = $('learn-difficulty').value;
    var domain = $('learn-domain').value;
    var topic = $('learn-topic').value;
    var wrongOnly = $('learn-wrong-only').checked;
    var marks = loadJSON(LS_MARKS, {});
    var wrong = loadJSON(LS_WRONG, []);
    var list = activeQuestions().filter(function (q) {
      if (diff !== 'all' && q.difficulty !== diff) return false;
      if (domain !== 'all' && q.domain !== domain) return false;
      if (topic !== 'all' && q.topic !== topic) return false;
      if (wrongOnly && marks[q.id] !== 'unsure' && wrong.indexOf(q.id) === -1) return false;
      return true;
    });
    return list;
  }
  function renderLearn() {
    if (!questions.length) return;
    if (learnIndex >= learnList.length) learnIndex = Math.max(0, learnList.length - 1);
    var marks = loadJSON(LS_MARKS, {});
    var known = learnList.filter(function (q) { return marks[q.id] === 'known'; }).length;
    $('learn-progress').textContent = learnList.length
      ? ('Card ' + (learnIndex + 1) + ' of ' + learnList.length + ' · ' + known + ' marked known')
      : 'No cards match these filters.';
    var fill = $('learn-progress-fill');
    if (fill) fill.style.width = learnList.length ? Math.round(((learnIndex + 1) / learnList.length) * 100) + '%' : '0%';
    if (!learnList.length) {
      $('learn-meta').textContent = '';
      $('learn-question').textContent = 'No cards match these filters. Clear the filters or the “wrong / unsure only” box.';
      $('learn-options').innerHTML = '';
      $('learn-answer').classList.add('hidden');
      return;
    }
    var q = learnList[learnIndex];
    var mark = marks[q.id];
    var metaEl = $('learn-meta');
    metaEl.textContent = q.id + ' · ' + q.topic + ' · ' + q.difficulty + ' · ' + (q.section || q.domain);
    if (mark === 'known' || mark === 'unsure') {
      var badge = document.createElement('span');
      badge.className = 'mark-badge ' + mark;
      badge.textContent = mark === 'known' ? '✓ Known' : '? Unsure';
      metaEl.appendChild(badge);
    }
    $('learn-question').textContent = q.question;
    var opts = $('learn-options');
    opts.innerHTML = '';
    q.options.forEach(function (opt, i) {
      var d = document.createElement('div');
      d.className = 'opt';
      d.textContent = letters(i) + '. ' + opt;
      opts.appendChild(d);
    });
    var ans = $('learn-answer');
    if (learnFlipped) {
      ans.classList.remove('hidden');
      $('learn-answer-text').textContent = letters(q.correct_index) + '. ' + q.options[q.correct_index];
      $('learn-explanation').textContent = q.explanation;
      renderSourceLink($('learn-source'), q);
      $('learn-flip').textContent = 'Hide answer';
    } else {
      ans.classList.add('hidden');
      $('learn-flip').textContent = 'Reveal answer';
    }
    $('learn-prev').disabled = learnIndex === 0;
    $('learn-next').disabled = learnIndex >= learnList.length - 1;
  }
  function refreshLearnList() { learnList = learnFiltered(); learnIndex = 0; learnFlipped = false; renderLearn(); }
  $('learn-difficulty').addEventListener('change', refreshLearnList);
  $('learn-domain').addEventListener('change', refreshLearnList);
  $('learn-topic').addEventListener('change', refreshLearnList);
  $('learn-wrong-only').addEventListener('change', refreshLearnList);
  $('learn-shuffle').addEventListener('click', function () { learnList = shuffle(learnList); learnIndex = 0; learnFlipped = false; renderLearn(); });
  $('learn-reset-marks').addEventListener('click', function () {
    if (!confirm('Clear all your Known / Unsure marks?')) return;
    saveJSON(LS_MARKS, {}); saveJSON(LS_WRONG, []); renderLearn();
  });
  $('learn-flip').addEventListener('click', function () { learnFlipped = !learnFlipped; renderLearn(); });
  $('learn-prev').addEventListener('click', function () { if (learnIndex > 0) { learnIndex--; learnFlipped = false; renderLearn(); } });
  $('learn-next').addEventListener('click', function () { if (learnIndex < learnList.length - 1) { learnIndex++; learnFlipped = false; renderLearn(); } });
  $('learn-known').addEventListener('click', function () {
    if (!learnList.length) return;
    var marks = loadJSON(LS_MARKS, {}); marks[learnList[learnIndex].id] = 'known'; saveJSON(LS_MARKS, marks);
    if (learnIndex < learnList.length - 1) learnIndex++; learnFlipped = false; renderLearn();
  });
  $('learn-unsure').addEventListener('click', function () {
    if (!learnList.length) return;
    var marks = loadJSON(LS_MARKS, {}); marks[learnList[learnIndex].id] = 'unsure'; saveJSON(LS_MARKS, marks);
    if (learnIndex < learnList.length - 1) learnIndex++; learnFlipped = false; renderLearn();
  });

  // ---------- Evaluate mode ----------
  var exam = null; // { qs, answers[], flagged:Set, index, timerOn, secondsLeft, timerId, startedAt, difficulty, count }
  var lastSetup = { difficulty: 'all', domain: 'all', count: 20, timerOn: true };
  var defaultMinutes = { 10: 30, 20: 60, 40: 120, 100: 180, 200: 240 };
  function updateTimeHint() {
    var n = parseInt($('eval-count').value, 10);
    $('eval-time-hint').textContent = 'Timer: ' + defaultMinutes[n] + ' minutes for ' + n +
      ' questions. 30 minutes for 10, 60 minutes for 20, 120 minutes for 40, 180 minutes for 100, 240 minutes for 200. The timer auto-submits at 0:00.';
  }
  $('eval-count').addEventListener('change', updateTimeHint);

  $('eval-start').addEventListener('click', function () { startExam(lastSetupFromForm()); });
  function lastSetupFromForm() {
    return {
      difficulty: $('eval-difficulty').value,
      domain: $('eval-domain').value,
      count: parseInt($('eval-count').value, 10),
      timerOn: $('eval-timer').checked
    };
  }
  function startExam(setup) {
    lastSetup = setup;
    var pool = activeQuestions().filter(function (q) {
      if (setup.difficulty !== 'all' && q.difficulty !== setup.difficulty) return false;
      if (setup.domain && setup.domain !== 'all' && q.domain !== setup.domain) return false;
      return true;
    });
    if (!pool.length) { alert('No questions match that difficulty.'); return; }
    var qs = sample(pool, setup.count);
    exam = {
      qs: qs, answers: qs.map(function () { return null; }),
      flagged: {}, index: 0, timerOn: setup.timerOn,
      secondsLeft: setup.timerOn ? (defaultMinutes[setup.count] || 120) * 60 : null,
      startedAt: Date.now(), timerId: null
    };
    if (exam.timerOn) {
      exam.timerId = setInterval(function () {
        if (!exam) return;
        exam.secondsLeft -= 1;
        var el = $('eval-timer-display');
        if (el) {
          el.textContent = 'Time left: ' + fmtTime(exam.secondsLeft);
          el.classList.toggle('low', exam.secondsLeft <= 300);
        }
        if (exam.secondsLeft <= 0) { submitExam(true); }
      }, 1000);
    }
    showView('eval-exam');
  }
  function renderExam() {
    if (!exam) return;
    var q = exam.qs[exam.index];
    var answeredCount = exam.answers.filter(function (a) { return a !== null; }).length;
    $('eval-progress').textContent = 'Question ' + (exam.index + 1) + ' of ' + exam.qs.length +
      ' · ' + answeredCount + ' answered';
    var evalFill = $('eval-progress-fill');
    if (evalFill) evalFill.style.width = Math.round((answeredCount / exam.qs.length) * 100) + '%';
    $('eval-timer-display').textContent = exam.timerOn ? ('Time left: ' + fmtTime(exam.secondsLeft)) : 'Timer off';
    $('eval-timer-display').classList.toggle('low', exam.timerOn && exam.secondsLeft <= 300);
    $('eval-meta').textContent = q.id + ' · ' + q.topic + ' · ' + q.difficulty +
      (exam.flagged[exam.index] ? ' · ⚑ Flagged for review' : '');
    $('eval-question').textContent = q.question;
    var box = $('eval-options');
    box.innerHTML = '';
    q.options.forEach(function (opt, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt-btn' + (exam.answers[exam.index] === i ? ' selected' : '');
      b.setAttribute('aria-pressed', exam.answers[exam.index] === i ? 'true' : 'false');
      b.textContent = letters(i) + '. ' + opt;
      b.addEventListener('click', function () { exam.answers[exam.index] = i; renderExam(); });
      box.appendChild(b);
    });
    $('eval-prev').disabled = exam.index === 0;
    $('eval-next').disabled = exam.index >= exam.qs.length - 1;
    $('eval-flag').textContent = exam.flagged[exam.index] ? '⚑ Flagged — click to unflag' : '⚑ Flag for review';
    $('eval-flag').setAttribute('aria-pressed', exam.flagged[exam.index] ? 'true' : 'false');
    var nav = $('eval-nav');
    nav.innerHTML = '';
    exam.qs.forEach(function (qq, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'nav-btn' + (exam.answers[i] !== null ? ' answered' : '') +
        (exam.flagged[i] ? ' flagged' : '') + (i === exam.index ? ' current' : '');
      b.textContent = String(i + 1);
      var state = (exam.answers[i] !== null ? ', answered' : ', unanswered') +
        (exam.flagged[i] ? ', flagged for review' : '') +
        (i === exam.index ? ', current question' : '');
      b.setAttribute('aria-label', 'Question ' + (i + 1) + state);
      b.setAttribute('aria-current', i === exam.index ? 'true' : 'false');
      b.addEventListener('click', function () { exam.index = i; renderExam(); });
      nav.appendChild(b);
    });
  }
  $('eval-prev').addEventListener('click', function () { if (exam && exam.index > 0) { exam.index--; renderExam(); } });
  $('eval-next').addEventListener('click', function () { if (exam && exam.index < exam.qs.length - 1) { exam.index++; renderExam(); } });
  $('eval-flag').addEventListener('click', function () {
    if (!exam) return;
    exam.flagged[exam.index] = !exam.flagged[exam.index];
    if (!exam.flagged[exam.index]) delete exam.flagged[exam.index];
    renderExam();
  });
  $('eval-submit').addEventListener('click', function () {
    if (!exam) return;
    var unanswered = exam.answers.filter(function (a) { return a === null; }).length;
    var msg = unanswered > 0
      ? ('You have ' + unanswered + ' unanswered question(s). Submit anyway?')
      : 'Submit this exam? You will see your score and a full review.';
    if (confirm(msg)) submitExam(false);
  });

  function submitExam(auto) {
    if (!exam) return;
    if (exam.timerId) clearInterval(exam.timerId);
    var timeUsedSec = Math.round((Date.now() - exam.startedAt) / 1000);
    var total = exam.qs.length;
    var correct = 0;
    var wrongIds = [];
    var byTopic = {};
    exam.qs.forEach(function (q, i) {
      var ok = exam.answers[i] === q.correct_index;
      if (ok) correct++; else wrongIds.push(q.id);
      if (!byTopic[q.topic]) byTopic[q.topic] = { correct: 0, total: 0 };
      byTopic[q.topic].total++;
      if (ok) byTopic[q.topic].correct++;
    });
    var pct = total ? Math.round((correct / total) * 100) : 0;
    var passed = pct >= 70;
    // Save wrong ids for Learn "review wrong only", and a history entry.
    saveJSON(LS_WRONG, wrongIds);
    var history = loadJSON(LS_HISTORY, []);
    history.unshift({ date: new Date().toISOString(), total: total, correct: correct, pct: pct, passed: passed, timeUsedSec: timeUsedSec, auto: !!auto });
    saveJSON(LS_HISTORY, history.slice(0, 20));
    var finished = exam; exam = null;

    var sum = $('results-summary');
    sum.innerHTML = '';
    function p(html) { var e = document.createElement('p'); e.innerHTML = html; sum.appendChild(e); }
    p('<strong class="score-line">Score: ' + correct + ' / ' + total + ' (' + pct + '%)</strong>');
    var bar = document.createElement('div');
    bar.className = 'progress-track';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuenow', String(pct));
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-label', 'Score: ' + pct + ' percent');
    var barFill = document.createElement('div');
    barFill.className = 'progress-fill ' + (passed ? 'score-pass' : 'score-fail');
    barFill.style.width = pct + '%';
    bar.appendChild(barFill);
    sum.appendChild(bar);
    p(passed
      ? '<span class="pass">PASS</span> — 70% or above.'
      : '<span class="fail">NOT YET PASSING</span> — below 70%.');
    p('Microsoft’s real SC-500 pass mark is 700 (on a 100–900 scaled score). This simulator does <strong>not</strong> produce a real scaled score: 70% here is used as a <em>proxy</em> for 700, so treat pass / fail as a study guide, not a prediction.');
    p('Time used: ' + fmtTime(timeUsedSec) + (auto ? ' (auto-submitted — time ran out)' : '') +
      ' · Difficulty: ' + lastSetup.difficulty + ' · Domain: ' + (lastSetup.domain || 'all') + ' · ' + new Date().toLocaleString());

    var tbody = document.querySelector('#results-breakdown tbody');
    tbody.innerHTML = '';
    Object.keys(byTopic).sort().forEach(function (topic) {
      var t = byTopic[topic];
      var tr = document.createElement('tr');
      [topic, String(t.correct), String(t.total), Math.round((t.correct / t.total) * 100) + '%'].forEach(function (v) {
        var td = document.createElement('td'); td.textContent = v; tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    var review = $('results-review');
    review.innerHTML = '';
    finished.qs.forEach(function (q, i) {
      var mine = finished.answers[i];
      var ok = mine === q.correct_index;
      var div = document.createElement('div');
      div.className = 'review-item ' + (ok ? 'correct' : 'wrong');
      var html = '<p class="verdict ' + (ok ? 'correct' : 'wrong') + '">' + (ok ? '✓ Correct' : '✗ Incorrect') + '</p>' +
        '<p class="card-meta">' + q.id + ' · ' + q.topic + ' · ' + q.difficulty + '</p>' +
        '<p><strong>Q' + (i + 1) + '.</strong> ' + escapeHtml(q.question) + '</p>' +
        '<p class="your-answer' + (ok ? '' : ' wrong-answer') + '">Your answer: ' + (mine === null ? '<em>Not answered</em>' : escapeHtml(letters(mine) + '. ' + q.options[mine])) + '</p>' +
        '<p class="correct-answer-line">Correct answer: ' + escapeHtml(letters(q.correct_index) + '. ' + q.options[q.correct_index]) + '</p>' +
        '<p>' + escapeHtml(q.explanation) + '</p>' +
        '<p class="card-source">Source: ' + sourceHtmlFor(q) + '</p>' + sourceQuoteHtml(q);
      div.innerHTML = html;
      review.appendChild(div);
    });
    showView('results');
  }
  $('results-retake').addEventListener('click', function () { startExam(lastSetup); });
  $('results-learn-wrong').addEventListener('click', function () {
    $('learn-wrong-only').checked = true;
    $('learn-difficulty').value = 'all';
    $('learn-domain').value = 'all';
    $('learn-topic').value = 'all';
    refreshLearnList();
    showView('learn');
  });
})();
