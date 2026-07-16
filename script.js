(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var menuButton = document.querySelector('.menu-toggle');

  if (menuButton && header) {
    menuButton.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });

    header.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    reveals.forEach(function (element) { revealObserver.observe(element); });
  } else {
    reveals.forEach(function (element) { element.classList.add('in'); });
  }

  var scheduled = false;
  function updateProgress() {
    if (!header) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    header.style.setProperty('--progress', progress);
    scheduled = false;
  }
  window.addEventListener('scroll', function () {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  var gamePanel = document.querySelector('.game-panel');
  var gameArena = document.querySelector('.game-arena');
  var gameRail = document.querySelector('.game-rail');
  var gameTarget = document.querySelector('.game-target');
  var gameSignal = document.querySelector('.game-signal');
  var gameAction = document.getElementById('game-action');
  var gameActionText = gameAction ? gameAction.querySelector('span') : null;
  var gameFeedback = document.getElementById('game-feedback');
  var gameFeedbackTitle = gameFeedback ? gameFeedback.querySelector('strong') : null;
  var gameFeedbackText = gameFeedback ? gameFeedback.querySelector('span') : null;
  var gameProgress = document.querySelectorAll('.game-progress li');
  var gameProgressList = document.querySelector('.game-progress');
  var gameRoundLabel = document.querySelector('.game-round');
  var gameScore = document.querySelector('.game-score b');
  var gameBest = document.querySelector('.game-best b');
  var gameComplete = document.querySelector('.game-complete');
  var gameFinalScore = gameComplete ? gameComplete.querySelector('b') : null;
  var gameRestart = document.querySelector('.game-restart');
  var gameCopy = {
    he: {
      start: 'התחילו לשחק', lock: 'נעלו את האות', ready: 'מוכנים למהלך הראשון?',
      readySub: 'לחצו התחלה ואז נעלו את האות בתוך הפריים.',
      running: 'האות בתנועה', runningSub: 'תפסו אותו כשהוא כולו בתוך הפריים.',
      hit: 'פגיעה מדויקת!', hitSub: 'החיבור ננעל. עוברים לשלב הבא.',
      perfect: 'בול באמצע!', miss: 'כמעט. נסו שוב.', missSub: 'חכו שהריבוע ייכנס כולו לתוך המסגרת.',
      stages: 'שלבי המשחק'
    },
    en: {
      start: 'Start game', lock: 'Lock the signal', ready: 'Ready for the first move?',
      readySub: 'Press start, then lock the signal inside the frame.',
      running: 'The signal is moving', runningSub: 'Catch it when the square is fully inside the frame.',
      hit: 'Signal locked!', hitSub: 'Connection made. Moving to the next stage.',
      perfect: 'Dead center!', miss: 'Almost. Try again.', missSub: 'Wait until the square is fully inside the frame.',
      stages: 'Game stages'
    }
  };
  var game = { state: 'idle', round: 0, score: 0, best: 0, position: 0, startTime: 0, raf: 0, timeout: 0, geo: null };
  var targetCenters = [0.28, 0.7, 0.43, 0.76];
  var targetRatios = [0.24, 0.19, 0.15, 0.12];
  var roundSpeeds = [0.48, 0.62, 0.78, 0.96];
  var reducedGameMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function gameLang() { return document.documentElement.lang === 'en' ? 'en' : 'he'; }
  function padScore(value) { return String(value).padStart(4, '0'); }
  function setGameFeedback(title, text) {
    if (gameFeedbackTitle) gameFeedbackTitle.textContent = title;
    if (gameFeedbackText) gameFeedbackText.textContent = text;
  }
  function readBestScore() {
    try { game.best = Number(localStorage.getItem('fm-game-best')) || 0; } catch (e) {}
    if (gameBest) gameBest.textContent = padScore(game.best);
  }
  function saveBestScore() {
    if (game.score <= game.best) return;
    game.best = game.score;
    try { localStorage.setItem('fm-game-best', String(game.best)); } catch (e) {}
    if (gameBest) gameBest.textContent = padScore(game.best);
  }
  function updateGameProgress() {
    gameProgress.forEach(function (item, index) {
      item.classList.toggle('done', index < game.round || (game.state === 'complete' && index <= game.round));
      item.classList.toggle('active', index === game.round && game.state !== 'complete');
    });
    if (gameRoundLabel) gameRoundLabel.textContent = 'ROUND 0' + Math.min(game.round + 1, 4) + ' / 04';
    if (gamePanel) gamePanel.setAttribute('data-round', String(game.round));
  }
  function gameGeometry() {
    if (!gameArena || !gameRail || !gameTarget || !gameSignal) return null;
    var railWidth = gameRail.getBoundingClientRect().width;
    var signalWidth = gameSignal.getBoundingClientRect().width;
    var targetWidth = Math.max(58, railWidth * targetRatios[game.round]);
    var targetX = Math.max(0, Math.min(railWidth - targetWidth, railWidth * targetCenters[game.round] - targetWidth / 2));
    var travel = Math.max(1, railWidth - signalWidth);
    gameArena.style.setProperty('--target-w', targetWidth.toFixed(1) + 'px');
    gameArena.style.setProperty('--target-x', targetX.toFixed(1) + 'px');
    return { railWidth: railWidth, signalWidth: signalWidth, targetWidth: targetWidth, targetX: targetX, travel: travel };
  }
  function paintSignal() {
    var geometry = game.geo || gameGeometry();
    if (!geometry) return;
    gameSignal.style.transform = 'translate3d(' + (game.position * geometry.travel).toFixed(1) + 'px, -50%, 0)';
  }
  function gameTick(time) {
    if (game.state !== 'running') return;
    if (!game.startTime) game.startTime = time;
    var elapsed = (time - game.startTime) / 1000;
    var phase = reducedGameMotion ? Math.floor(elapsed * 3) / 3 : elapsed;
    var raw = (phase * roundSpeeds[game.round]) % 2;
    game.position = raw <= 1 ? raw : 2 - raw;
    paintSignal();
    game.raf = window.requestAnimationFrame(gameTick);
  }
  function beginRound() {
    clearTimeout(game.timeout);
    cancelAnimationFrame(game.raf);
    game.state = 'running';
    game.startTime = 0;
    gamePanel.setAttribute('data-state', 'running');
    gamePanel.classList.remove('is-hit', 'is-miss');
    gameAction.disabled = false;
    gameActionText.textContent = gameCopy[gameLang()].lock;
    setGameFeedback(gameCopy[gameLang()].running, gameCopy[gameLang()].runningSub);
    updateGameProgress();
    game.geo = gameGeometry();
    game.raf = window.requestAnimationFrame(gameTick);
  }
  function startGame() {
    game.round = 0;
    game.score = 0;
    game.position = 0;
    if (gameScore) gameScore.textContent = '0000';
    if (gameComplete) gameComplete.hidden = true;
    beginRound();
  }
  function finishGame() {
    cancelAnimationFrame(game.raf);
    game.state = 'complete';
    gamePanel.setAttribute('data-state', 'complete');
    saveBestScore();
    updateGameProgress();
    if (gameFinalScore) gameFinalScore.textContent = padScore(game.score);
    if (gameComplete) gameComplete.hidden = false;
    if (gameRestart) gameRestart.focus();
  }
  function attemptLock() {
    if (game.state === 'idle' || game.state === 'complete') { startGame(); return; }
    if (game.state !== 'running') return;
    var geometry = game.geo || gameGeometry();
    if (!geometry) return;
    var signalLeft = game.position * geometry.travel;
    var signalRight = signalLeft + geometry.signalWidth;
    var targetRight = geometry.targetX + geometry.targetWidth;
    var hit = signalLeft >= geometry.targetX && signalRight <= targetRight;
    var langCopy = gameCopy[gameLang()];

    if (!hit) {
      gamePanel.classList.remove('is-hit');
      gamePanel.classList.add('is-miss');
      setGameFeedback(langCopy.miss, langCopy.missSub);
      game.timeout = setTimeout(function () {
        gamePanel.classList.remove('is-miss');
        if (game.state === 'running') setGameFeedback(langCopy.running, langCopy.runningSub);
      }, 520);
      return;
    }

    cancelAnimationFrame(game.raf);
    game.state = 'pause';
    gamePanel.classList.remove('is-miss');
    gamePanel.classList.add('is-hit');
    var targetCenter = geometry.targetX + geometry.targetWidth / 2;
    var signalCenter = signalLeft + geometry.signalWidth / 2;
    var accuracy = Math.max(0, 1 - Math.abs(signalCenter - targetCenter) / (geometry.targetWidth / 2));
    var points = 100 + Math.round(accuracy * 150);
    game.score += points;
    if (gameScore) gameScore.textContent = padScore(game.score);
    setGameFeedback(accuracy > .82 ? langCopy.perfect : langCopy.hit, langCopy.hitSub);
    gameAction.disabled = true;
    gameProgress[game.round].classList.add('done');
    game.timeout = setTimeout(function () {
      if (game.round >= 3) { finishGame(); return; }
      game.round += 1;
      beginRound();
    }, 720);
  }
  function refreshGameLanguage() {
    if (!gamePanel) return;
    var copy = gameCopy[gameLang()];
    if (gameProgressList) gameProgressList.setAttribute('aria-label', copy.stages);
    if (game.state === 'idle') {
      gameActionText.textContent = copy.start;
      setGameFeedback(copy.ready, copy.readySub);
    } else if (game.state === 'running') {
      gameActionText.textContent = copy.lock;
      setGameFeedback(copy.running, copy.runningSub);
    }
  }

  if (gamePanel && gameAction) {
    readBestScore();
    gameAction.addEventListener('click', attemptLock);
    if (gameRestart) gameRestart.addEventListener('click', startGame);
    window.addEventListener('resize', function () { game.geo = gameGeometry(); paintSignal(); }, { passive: true });
    window.addEventListener('firstmotion:language', refreshGameLanguage);
    document.addEventListener('keydown', function (event) {
      if (event.code !== 'Space' || event.repeat || event.target === gameAction || event.target === gameRestart) return;
      var rect = gamePanel.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      event.preventDefault();
      attemptLock();
    });
    refreshGameLanguage();
    updateGameProgress();
    paintSignal();
  }

  var faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  document.querySelectorAll('.yr').forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
})();
