/**
 * SearchO2 — Kids Sustainability Academy & Interactive Game Guide
 * Featuring Professor Whisker Puff & Pip Squeak-a-Link
 * 
 * Character Roles & Voice Synthesis Standard:
 * 
 * 1. Professor Whisker Puff (char_puff):
 *    - Species: Calico Astrobiologist Cat (Felis catus)
 *    - Role: Chief of Biophilic Microclimatology, Hygiene & Soil Stratification Sciences
 *    - Voice: 7-8 years old smart girl voice (articulately pitched female voice: Hazel / Zira / Jenny, pitch 1.35)
 *    - Persona: Precocious, intriguing, serious young scientist cat who loves biophysics and soil stratification
 * 
 * 2. Pip Squeak-a-Link (char_pip):
 *    - Species: Alpine Harvest Field Mouse (Micromys minutus)
 *    - Role: Chief Agtech Marshaler, Apprentice Mason & Multi-Role Field Safety Scout
 *    - Voice: 4-5 years old toddler boy voice (playfully pitched male voice, pitch 1.82, rate 1.15)
 *    - Persona: Curious, funny, intelligent, enthusiastic toddler field scout with waffle sneakers and green wands
 * 
 * Features & Transitions:
 *  - On Skip: Smooth introductory Puff & Pip interactive dialogue handover modal before starting Shakir tour!
 *    Pip asks for a practical walking tour across plots, and Puff explains that Shakir, OxyEco Forger,
 *    is the only expert for hands-on field craftsmanship, then transitions smoothly to Shakir's tour.
 *  - Screen Compatibility: Fully responsive across small laptops (1366x768 @ 125%), small monitors,
 *    mobile portrait, and mobile landscape (height <= 450px). All tabs, bubbles, and controls fit without cutting!
 *  - Floating Instruction Point: Icon-only button with rich hover card tooltip.
 *  - Spoken Voice: Hand-calibrated female / male voice routing with Web Audio SFX chimes.
 */

(function (global) {
  'use strict';

  var AcademyState = {
    isOpen: false,
    isPlaying: true,
    isPaused: false,
    currentScene: 0,
    isVoiceEnabled: true,
    watchedThoroughly: true,
    hasSkipped: false,
    onCompleteOrSkip: null,
    dialogueTimer: null,
    graceTimer: null,
    scenes: [
      {
        id: 'welcome',
        title: 'Welcome to SearchO2 & The Living Biosphere',
        subtitle: 'Biophilic Microclimatology & Atmospheric Equilibrium',
        catText: 'Welcome, dear Eco Pioneer! I am Professor Whisker Puff, Chief of Soil and Climate Sciences. We are studying an extraordinary living marvel: how trees, soil microbes, and clean energy work in harmony to keep our planetary atmosphere in perfect balance! Keep your eyes sharp, because nature has wonderful secrets to share!',
        pipText: 'And I\'m Pip Squeak-a-Link, Chief Agtech Marshaler! Look at my bright green marshaling wands—whoosh! And my waffle-sole sneakers are strapped for action! Every single tree we plant breathes out fresh, living oxygen for our world! Let\'s explore together!'
      },
      {
        id: 'procedure',
        title: 'How to Proceed into the Farm Game',
        subtitle: 'Soil Stratification, Horizon Aeration & Crew Infrastructure',
        catText: 'Our scientific expedition begins right at Plot 1! Healthy soil isn\'t just plain dirt—it\'s a thriving underground metropolis of beneficial microbes! When we till and aerate the top soil horizon, we give our pioneer saplings the porous breathing room they need to flourish.',
        pipText: 'Ooh, Plot 1, Plot 1! Field safety first—stand tall and straight like me! Once our little sapling is tucked into the soil, we construct the Crew Shed so our workers have a cozy base and warm tea! Then we pave the Main Arterial Road for supply trucks!'
      },
      {
        id: 'oxygen',
        title: 'How to Earn More Oxygen (O₂)',
        subtitle: 'Botanical Biodiversity, Pinosylvin Terpenes & Clean Grid',
        catText: 'Here is a fascinating biophysical secret: botanical biodiversity! When we combine stately Oaks, elegant Beeches, and fragrant Pines, they protect each other. Conifers produce natural pinosylvin terpenes, while broad canopies maximize photosynthetic photon flux, powered by clean wind turbines and battery storage!',
        pipText: 'Tree superpowers! Giant Oaks and friendly Pines working together like best friends! Add rich organic bio-compost and fresh pond water, and watch our clean wind turbines spin round and round to supercharge our oxygen meter to the sky!'
      },
      {
        id: 'journey',
        title: 'Your Planetary Sustainability Journey',
        subtitle: '10 Global Biomes & Closed-Loop Community Economy',
        catText: 'Our farm is the gateway to a breathtaking global journey! As our atmospheric oxygen index rises, we will expand across 10 diverse global biomes—traveling from lush German meadows across mountain peaks, coastal mangroves, and all the way to orbital Artemis space biospheres!',
        pipText: 'And my favorite part—the harvest! Crisp apples and sweet berries go straight to our Village Café and Juice Bar! Delicious! When farm visitors sip fresh smoothies, every single coin funds our planetary restoration fleet!'
      },
      {
        id: 'secrets',
        title: 'Hidden Treasures & Quick Unlocks',
        subtitle: 'Thermal Radiometer Anomaly & Planetary Council Grant',
        catText: 'An exciting discovery! My thermal radiometer datapad has located an anomalous subterranean reading right beside the farm shed! Concealed beneath a weathered Jute Tarpaulin lies a secret cache of high-grade explorer tools, just waiting to be uncovered!',
        pipText: 'A secret treasure under the blanket! Watch our complete orientation with us to the very end, and the Planetary Council will grant you €200 game euros plus 150 XP! You can build the Crew Shed, pave the road, and uncover the secret cache instantly!'
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // Web Audio Synthesizer: Character SFX
  // Whisker Puff (Crisp feline chime) & Pip (Curious toddler squeak)
  // ---------------------------------------------------------------------------
  var _audioCtx = null;
  function getAudioContext() {
    if (!_audioCtx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) _audioCtx = new AudioCtx();
    }
    if (_audioCtx && _audioCtx.state === 'suspended') {
      _audioCtx.resume();
    }
    return _audioCtx;
  }

  function playPuffCatSFX() {
    if (!AcademyState.isVoiceEnabled) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;

      // Crisp analytical crystal harmonic ping (attention chime)
      var oscPing = ctx.createOscillator();
      var gainPing = ctx.createGain();
      oscPing.type = 'triangle';
      oscPing.frequency.setValueAtTime(820, now);
      oscPing.frequency.exponentialRampToValueAtTime(620, now + 0.12);
      gainPing.gain.setValueAtTime(0.001, now);
      gainPing.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gainPing.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      oscPing.connect(gainPing);
      gainPing.connect(ctx.destination);
      oscPing.start(now);
      oscPing.stop(now + 0.2);

      // Young feline vocal glissando (460Hz -> 640Hz -> 400Hz)
      var oscMeow = ctx.createOscillator();
      var gainMeow = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, now + 0.05);
      filter.Q.setValueAtTime(2.8, now + 0.05);

      oscMeow.type = 'sine';
      oscMeow.frequency.setValueAtTime(460, now + 0.05);
      oscMeow.frequency.exponentialRampToValueAtTime(640, now + 0.18);
      oscMeow.frequency.exponentialRampToValueAtTime(400, now + 0.44);

      gainMeow.gain.setValueAtTime(0.001, now + 0.05);
      gainMeow.gain.linearRampToValueAtTime(0.14, now + 0.12);
      gainMeow.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

      oscMeow.connect(filter);
      filter.connect(gainMeow);
      gainMeow.connect(ctx.destination);
      oscMeow.start(now + 0.05);
      oscMeow.stop(now + 0.46);
    } catch (e) {}
  }

  function playPipMouseSFX() {
    if (!AcademyState.isVoiceEnabled) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;

      // Playful toddler mouse chirp with triple ascending harmonic bounce
      [0, 0.09, 0.18].forEach(function (offset, idx) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var t = now + offset;
        osc.type = 'triangle';
        var baseFreq = idx === 0 ? 1450 : (idx === 1 ? 1950 : 2600);
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 550, t + 0.06);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.13, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      });
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // Speech Synthesis Engine: Spoken Dialogue for Whisker Puff & Pip
  // Whisker Puff: Strictly FEMALE voice (Hazel, Zira, Jenny, Google US English), pitch 1.35
  // Pip: Strictly MALE/BOY voice (David, Mark, Guy, Google UK Male) shifted to high toddler pitch 1.82
  // ---------------------------------------------------------------------------
  var _activeUtterance = null;
  var _speechTimeoutId = null;
  var _cachedVoices = [];

  function getSpeechVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      var v = window.speechSynthesis.getVoices() || [];
      if (v.length > 0) _cachedVoices = v;
    }
    return _cachedVoices;
  }

  function getCharacterVoice(character, voices) {
    if (!voices || voices.length === 0) return null;
    var normVoices = voices.map(function (v) {
      return {
        voice: v,
        name: (v.name || '').toLowerCase(),
        lang: (v.lang || '').toLowerCase().replace('_', '-')
      };
    });

    var enVoices = normVoices.filter(function (nv) {
      return nv.lang.indexOf('en') === 0;
    });
    if (enVoices.length === 0) enVoices = normVoices;

    if (character === 'cat' || character === 'puff') {
      // Professor Whisker Puff: Sweet, charming, articulate young scholar girl voice across Desktop & Mobile (iOS / Android / Chrome / Safari)
      var maleKeywords = ['david', 'mark', 'guy', 'george', 'richard', 'james', 'john', 'charles', 'stefan', 'peter', 'male'];
      var nonMale = enVoices.filter(function (nv) {
        return !maleKeywords.some(function (k) { return nv.name.includes(k); });
      });
      if (nonMale.length === 0) nonMale = enVoices;

      // 1. Top Tier Charming Natural / Expressive Female Voices
      var topTierNames = [
        'jenny', 'aria', 'sonia', 'libby', 'maisie', 'natasha', 'clara',
        'samantha', 'victoria', 'karen', 'tessa', 'fiona', 'moira', 'chloe', 'ana',
        'google uk english female', 'google us english', 'en-gb-x-rjs#female', 'en-us-x-sfg#female'
      ];
      for (var i = 0; i < topTierNames.length; i++) {
        var match = nonMale.find(function (nv) { return nv.name.includes(topTierNames[i]); });
        if (match) return match.voice;
      }
      // 2. Any voice tagged with "female", "natural", or "neural"
      var femaleTagged = nonMale.find(function (nv) {
        return nv.name.includes('female') || nv.name.includes('natural') || nv.name.includes('neural');
      });
      if (femaleTagged) return femaleTagged.voice;

      // 3. Any UK/US English non-male voice
      var ukOrUs = nonMale.find(function (nv) {
        return nv.lang === 'en-gb' || nv.lang === 'en-us';
      });
      if (ukOrUs) return ukOrUs.voice;

      return nonMale[0].voice;
    } else {
      // Pip Squeak-a-Link: High-energy curious toddler boy / apprentice voice across Desktop & Mobile
      var childMatch = enVoices.find(function (nv) {
        return nv.name.includes('junior') || nv.name.includes('child') || nv.name.includes('kid');
      });
      if (childMatch) return childMatch.voice;

      var boyNames = ['google uk english male', 'oliver', 'george', 'arthur', 'daniel', 'guy', 'david', 'mark'];
      for (var j = 0; j < boyNames.length; j++) {
        var bMatch = enVoices.find(function (nv) { return nv.name.includes(boyNames[j]); });
        if (bMatch) return bMatch.voice;
      }

      var maleTagged = enVoices.find(function (nv) { return nv.name.includes('male'); });
      if (maleTagged) return maleTagged.voice;

      return enVoices[0].voice;
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function () {
      getSpeechVoices();
    };
    getSpeechVoices();
  }

  function stopAllSpeech() {
    if (_speechTimeoutId) {
      clearTimeout(_speechTimeoutId);
      _speechTimeoutId = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    _activeUtterance = null;
  }

  function clearTimers() {
    if (AcademyState.dialogueTimer) {
      clearTimeout(AcademyState.dialogueTimer);
      AcademyState.dialogueTimer = null;
    }
    if (AcademyState.graceTimer) {
      clearTimeout(AcademyState.graceTimer);
      AcademyState.graceTimer = null;
    }
  }

  function speakLine(character, text, onEnd) {
    if (!AcademyState.isOpen && !document.getElementById('kidsAcademyHandoverModal')) {
      if (typeof onEnd === 'function') onEnd();
      return;
    }

    if (!AcademyState.isVoiceEnabled) {
      _speechTimeoutId = setTimeout(function () {
        if (typeof onEnd === 'function') onEnd();
      }, 3400);
      return;
    }

    if (character === 'cat') {
      playPuffCatSFX();
    } else {
      playPipMouseSFX();
    }

    if (!('speechSynthesis' in window)) {
      _speechTimeoutId = setTimeout(function () {
        if (typeof onEnd === 'function') onEnd();
      }, 3600);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    var clean = text
      .replace(/\b(slurp|byzzz|bzzzz|bzzz|whoosh|zoom|moo)\b/gi, '')
      .replace(/squeak tastic/gi, 'fantastic')
      .replace(/Squeak-tastic/gi, 'Fantastic')
      .replace(/\bSearchO2\b/gi, 'Search O two')
      .replace(/\bO2\b/g, 'oxygen')
      .replace(/\bCO2\b/g, 'carbon dioxide')
      .replace(/\bStreuobst\b/gi, 'meadow orchard')
      .replace(/\bAlpenhof\b/gi, 'Alpen hof')
      .replace(/€\s*(\d+)/g, '$1 euros')
      .replace(/(\d+)\s*XP\b/gi, '$1 experience points')
      .replace(/\bProf\.?\b/gi, 'Professor')
      .replace(/\bDr\.?\b/gi, 'Doctor')
      .replace(/&amp;/g, 'and')
      .replace(/&/g, 'and')
      .replace(/[—–]/g, ', ')
      .replace(/["“”*()]/g, '')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    var utter = new SpeechSynthesisUtterance(clean);
    _activeUtterance = utter;
    if (typeof window !== 'undefined') {
      window.__activeSpeechUtterance = utter;
    }

    var voices = getSpeechVoices();
    if (!voices || voices.length === 0) {
      voices = window.speechSynthesis.getVoices() || [];
    }

    if (character === 'cat' || character === 'puff') {
      // Professor Whisker Puff: Sweet, charming, articulate young scholar girl voice
      utter.pitch = 1.10;
      utter.rate = 0.98;

      var catVoice = getCharacterVoice('cat', voices);
      if (catVoice) utter.voice = catVoice;
    } else {
      // Pip Squeak-a-Link: High-energy curious toddler boy companion
      utter.pitch = 1.38;
      utter.rate = 1.08;

      var mouseVoice = getCharacterVoice('pip', voices);
      if (mouseVoice) utter.voice = mouseVoice;
    }

    var handled = false;
    function finish() {
      if (handled) return;
      handled = true;
      if (typeof window !== 'undefined') {
        window.__finishCurrentAcademySpeech = null;
      }
      if (_speechTimeoutId) {
        clearTimeout(_speechTimeoutId);
        _speechTimeoutId = null;
      }
      _activeUtterance = null;
      if (typeof window !== 'undefined' && window.__activeSpeechUtterance === utter) {
        window.__activeSpeechUtterance = null;
      }
      if (typeof onEnd === 'function') {
        onEnd();
      }
    }

    utter.onend = finish;
    utter.onerror = finish;

    var wordCount = clean.split(/\s+/).length;
    var maxDurationMs = Math.max(9000, wordCount * 700 + 6000);

    _speechTimeoutId = setTimeout(function () {
      if (!handled) {
        finish();
      }
    }, maxDurationMs);

    if (typeof window !== 'undefined') {
      window.__finishCurrentAcademySpeech = finish;
    }

    setTimeout(function () {
      if (!AcademyState.isOpen && !document.getElementById('kidsAcademyHandoverModal')) return;
      try {
        window.speechSynthesis.speak(utter);
      } catch (e) {
        finish();
      }
    }, 60);
  }

  // ---------------------------------------------------------------------------
  // Dialogue & Scene Sequence Engine (Event-Driven, Zero Dialogue Cuts)
  // ---------------------------------------------------------------------------
  function startSceneSequence(sceneIdx) {
    if (!AcademyState.isOpen) return;
    clearTimers();
    stopAllSpeech();

    AcademyState.currentScene = sceneIdx;
    switchSceneContent(sceneIdx);

    var sc = AcademyState.scenes[sceneIdx];
    if (!sc) return;

    var catBubble = document.getElementById('academyCatBubble');
    var pipBubble = document.getElementById('academyPipBubble');

    // 1. Professor Whisker Puff speaks first
    if (catBubble) catBubble.classList.add('speaker-active');
    if (pipBubble) pipBubble.classList.remove('speaker-active');
    updateActorStatus('🐱 Professor Whisker Puff speaking...');

    speakLine('cat', sc.catText, function () {
      if (!AcademyState.isOpen || AcademyState.currentScene !== sceneIdx) return;
      if (catBubble) catBubble.classList.remove('speaker-active');

      // 2. Natural conversation pause (350ms)
      AcademyState.dialogueTimer = setTimeout(function () {
        if (!AcademyState.isOpen || AcademyState.currentScene !== sceneIdx) return;
        if (pipBubble) pipBubble.classList.add('speaker-active');
        updateActorStatus('🐭 Pip Squeak-a-Link speaking...');

        // 3. Pip Squeak-a-Link speaks second
        speakLine('mouse', sc.pipText, function () {
          if (!AcademyState.isOpen || AcademyState.currentScene !== sceneIdx) return;
          if (pipBubble) pipBubble.classList.remove('speaker-active');
          updateActorStatus('✅ Dialogue completed');

          // 4. Reading grace period (2.2s) before auto-advancing to next scene
          startGracePeriod(sceneIdx);
        });
      }, 350);
    });
  }

  function startGracePeriod(sceneIdx) {
    var gracePill = document.getElementById('sceneGraceNotice');
    if (gracePill) {
      if (sceneIdx < AcademyState.scenes.length - 1) {
        gracePill.innerHTML = '<span>Auto-advancing to Scene ' + (sceneIdx + 2) + '... (or click Next ➔)</span>';
      } else {
        gracePill.innerHTML = '<span>Masterplan Orientation complete! Unlocking €200 Grant...</span>';
      }
      gracePill.classList.add('visible');
    }

    AcademyState.graceTimer = setTimeout(function () {
      if (!AcademyState.isOpen || AcademyState.currentScene !== sceneIdx) return;
      if (gracePill) gracePill.classList.remove('visible');

      if (sceneIdx < AcademyState.scenes.length - 1) {
        startSceneSequence(sceneIdx + 1);
      } else {
        handleFinishThoroughly();
      }
    }, 2200);
  }

  function updateActorStatus(statusText) {
    var statEl = document.getElementById('academySpeakerStatus');
    if (statEl) {
      statEl.textContent = statusText;
    }
  }

  function nextSceneManual() {
    clearTimers();
    stopAllSpeech();
    if (AcademyState.currentScene < AcademyState.scenes.length - 1) {
      startSceneSequence(AcademyState.currentScene + 1);
    } else {
      handleFinishThoroughly();
    }
  }

  function prevSceneManual() {
    clearTimers();
    stopAllSpeech();
    if (AcademyState.currentScene > 0) {
      startSceneSequence(AcademyState.currentScene - 1);
    }
  }

  function togglePauseResume() {
    AcademyState.isPaused = !AcademyState.isPaused;
    var btn = document.getElementById('btnAcademyPause');
    if (AcademyState.isPaused) {
      clearTimers();
      stopAllSpeech();
      if (btn) btn.innerHTML = '<span>▶️ Resume</span>';
      updateActorStatus('⏸️ Orientation Paused');
    } else {
      if (btn) btn.innerHTML = '<span>⏸️ Pause</span>';
      startSceneSequence(AcademyState.currentScene);
    }
  }

  // ---------------------------------------------------------------------------
  // Inject Academy & Theater CSS (Screen Compatible for All Viewports)
  // ---------------------------------------------------------------------------
  function ensureAcademyStyles() {
    if (document.getElementById('kidsAcademyStyles')) return;
    var style = document.createElement('style');
    style.id = 'kidsAcademyStyles';
    style.textContent = [
      '/* Kids Sustainability Academy Floating Instruction Point (Icon Only + Hover Card) */',
      '.kids-academy-instruction-point {',
      '  position: fixed;',
      '  bottom: 24px;',
      '  left: 24px;',
      '  z-index: 99995;',
      '  user-select: none;',
      '}',
      '.instruction-point-icon-btn {',
      '  width: 36px;',
      '  height: 36px;',
      '  border-radius: 50%;',
      '  background: radial-gradient(circle at 35% 35%, #059669 0%, #065F46 65%, #022C22 100%);',
      '  border: 2px solid #34D399;',
      '  box-shadow: 0 6px 16px rgba(6, 95, 70, 0.45), 0 0 12px rgba(52, 211, 153, 0.35);',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  position: relative;',
      '  padding: 0;',
      '  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease, border-color 0.22s ease;',
      '}',
      '.instruction-point-icon-btn:hover {',
      '  transform: scale(1.12) translateY(-2px);',
      '  border-color: #FACC15;',
      '  box-shadow: 0 8px 20px rgba(6, 95, 70, 0.55), 0 0 16px rgba(250, 204, 21, 0.55);',
      '}',
      '.ip-char-pair {',
      '  font-size: 1.05rem;',
      '  line-height: 1;',
      '  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4));',
      '  pointer-events: none;',
      '}',
      '.ip-pulse-ring {',
      '  position: absolute;',
      '  inset: -6px;',
      '  border-radius: 50%;',
      '  border: 2px solid #34D399;',
      '  opacity: 0.7;',
      '  animation: ipPulseRing 2.4s cubic-bezier(0.24, 0, 0.38, 1) infinite;',
      '  pointer-events: none;',
      '}',
      '@keyframes ipPulseRing {',
      '  0% { transform: scale(0.9); opacity: 0.8; }',
      '  60% { transform: scale(1.35); opacity: 0; }',
      '  100% { transform: scale(1.35); opacity: 0; }',
      '}',
      '',
      '/* Sleek Hover Card / Tooltip */',
      '.instruction-point-tooltip {',
      '  position: absolute;',
      '  bottom: calc(100% + 14px);',
      '  left: 0;',
      '  width: 290px;',
      '  max-width: calc(100vw - 32px);',
      '  background: radial-gradient(ellipse at 50% 0%, #0F3826 0%, #071F15 75%, #030D08 100%);',
      '  border: 1.5px solid #34D399;',
      '  border-radius: 18px;',
      '  padding: 14px 16px;',
      '  box-shadow: 0 20px 40px rgba(0,0,0,0.65), 0 0 25px rgba(52, 211, 153, 0.25);',
      '  opacity: 0;',
      '  visibility: hidden;',
      '  transform: translateY(8px) scale(0.96);',
      '  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), visibility 0.22s;',
      '  pointer-events: none;',
      '  z-index: 99996;',
      '}',
      '.kids-academy-instruction-point:hover .instruction-point-tooltip,',
      '.instruction-point-icon-btn:focus + .instruction-point-tooltip {',
      '  opacity: 1;',
      '  visibility: visible;',
      '  transform: translateY(0) scale(1);',
      '}',
      '.ip-tooltip-badge {',
      '  display: inline-block;',
      '  background: linear-gradient(135deg, #059669, #0D9488);',
      '  color: #D1FAE5;',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-weight: 800;',
      '  font-size: 0.68rem;',
      '  letter-spacing: 0.5px;',
      '  padding: 2px 8px;',
      '  border-radius: 999px;',
      '  margin-bottom: 6px;',
      '}',
      '.ip-tooltip-title {',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-size: 0.92rem;',
      '  font-weight: 800;',
      '  color: #FCD34D;',
      '  line-height: 1.25;',
      '  margin-bottom: 4px;',
      '}',
      '.ip-tooltip-desc {',
      '  font-size: 0.74rem;',
      '  line-height: 1.35;',
      '  color: #E2E8F0;',
      '  margin-bottom: 8px;',
      '}',
      '.ip-tooltip-reward {',
      '  background: rgba(245, 158, 11, 0.15);',
      '  border: 1px solid rgba(245, 158, 11, 0.4);',
      '  border-radius: 10px;',
      '  padding: 5px 8px;',
      '  font-size: 0.70rem;',
      '  font-weight: 800;',
      '  color: #FDE68A;',
      '  margin-bottom: 8px;',
      '}',
      '.ip-tooltip-callout {',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-size: 0.74rem;',
      '  font-weight: 800;',
      '  color: #34D399;',
      '  text-align: right;',
      '}',
      '',
      '/* Fullscreen Animated Academy Theater (Fully Responsive & Screen Compatible) */',
      '.kids-academy-backdrop {',
      '  position: fixed;',
      '  inset: 0;',
      '  background: rgba(3, 14, 9, 0.90);',
      '  backdrop-filter: blur(8px);',
      '  -webkit-backdrop-filter: blur(8px);',
      '  z-index: 100002;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  opacity: 0;',
      '  pointer-events: none;',
      '  transition: opacity 0.28s ease;',
      '  padding: 12px;',
      '  box-sizing: border-box;',
      '  overflow-y: auto;',
      '}',
      '.kids-academy-backdrop.visible {',
      '  opacity: 1;',
      '  pointer-events: auto;',
      '}',
      '.kids-academy-card {',
      '  width: 100%;',
      '  max-width: 920px;',
      '  max-height: 94vh;',
      '  max-height: 94dvh;',
      '  background: radial-gradient(ellipse at 50% 0%, #0F3826 0%, #071F15 65%, #030D08 100%);',
      '  border: 2.5px solid #10B981;',
      '  border-radius: 24px;',
      '  box-shadow: 0 25px 60px rgba(0,0,0,0.7), 0 0 45px rgba(16, 185, 129, 0.25);',
      '  overflow: hidden;',
      '  display: flex;',
      '  flex-direction: column;',
      '  position: relative;',
      '  box-sizing: border-box;',
      '}',
      '',
      '/* Academy Topbar */',
      '.academy-topbar {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  padding: 10px 18px;',
      '  background: rgba(4, 21, 14, 0.95);',
      '  border-bottom: 1.5px solid rgba(52, 211, 153, 0.25);',
      '  flex-shrink: 0;',
      '}',
      '.academy-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }',
      '.academy-brand-icon { font-size: 1.6rem; flex-shrink: 0; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4)); }',
      '.academy-title {',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-weight: 800;',
      '  font-size: 1.05rem;',
      '  color: #ECFDF5;',
      '  line-height: 1.15;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',
      '.academy-subtitle {',
      '  font-size: 0.68rem;',
      '  color: #34D399;',
      '  font-weight: 800;',
      '  letter-spacing: 0.6px;',
      '  text-transform: uppercase;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',
      '.academy-top-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }',
      '.btn-academy-voice {',
      '  background: rgba(16, 185, 129, 0.18);',
      '  border: 1.5px solid #10B981;',
      '  border-radius: 999px;',
      '  color: #D1FAE5;',
      '  padding: 5px 12px;',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-weight: 800;',
      '  font-size: 0.76rem;',
      '  cursor: pointer;',
      '  transition: all 0.18s ease;',
      '  white-space: nowrap;',
      '}',
      '.btn-academy-voice:hover { background: rgba(16, 185, 129, 0.3); }',
      '.btn-academy-voice.muted { border-color: #EF4444; color: #FCA5A5; background: rgba(239, 68, 68, 0.15); }',
      '.btn-academy-skip {',
      '  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);',
      '  border: 1.5px solid #FCD34D;',
      '  border-radius: 999px;',
      '  color: #FFFFFF;',
      '  padding: 5px 14px;',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-weight: 800;',
      '  font-size: 0.78rem;',
      '  cursor: pointer;',
      '  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);',
      '  transition: transform 0.18s ease, filter 0.18s ease;',
      '  white-space: nowrap;',
      '}',
      '.btn-academy-skip:hover { transform: scale(1.04); filter: brightness(1.1); }',
      '',
      '/* Center Stage Area */',
      '.academy-stage-wrapper {',
      '  position: relative;',
      '  flex: 1;',
      '  min-height: 0;',
      '  display: flex;',
      '  flex-direction: column;',
      '  justify-content: space-between;',
      '  background: linear-gradient(180deg, rgba(6, 78, 59, 0.4) 0%, rgba(2, 44, 34, 0.85) 100%);',
      '  overflow-y: auto;',
      '  box-sizing: border-box;',
      '}',
      '.academy-scene-canvas {',
      '  flex: 1;',
      '  min-height: 110px;',
      '  position: relative;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 10px 16px;',
      '}',
      '',
      '/* Actor Characters and Speech Bubbles */',
      '.academy-actors-stage {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  align-items: flex-end;',
      '  padding: 0 20px 8px;',
      '  gap: 14px;',
      '  position: relative;',
      '  z-index: 10;',
      '  flex-shrink: 0;',
      '}',
      '.actor-box {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  width: 48%;',
      '  position: relative;',
      '}',
      '.speech-bubble {',
      '  background: #FFFFFF;',
      '  border-radius: 18px;',
      '  padding: 10px 14px;',
      '  box-shadow: 0 8px 24px rgba(0,0,0,0.35);',
      '  position: relative;',
      '  margin-bottom: 8px;',
      '  width: 100%;',
      '  box-sizing: border-box;',
      '  display: flex;',
      '  flex-direction: column;',
      '  justify-content: center;',
      '  transition: all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);',
      '  border: 2px solid transparent;',
      '}',
      '.speech-cat { border-color: #F59E0B; background: linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%); }',
      '.speech-mouse { border-color: #06B6D4; background: linear-gradient(180deg, #ECFEFF 0%, #CFFAFE 100%); }',
      '.speech-author {',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-weight: 800;',
      '  font-size: 0.80rem;',
      '  margin-bottom: 3px;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 5px;',
      '}',
      '.speech-cat .speech-author { color: #B45309; }',
      '.speech-mouse .speech-author { color: #0891B2; }',
      '.speech-text {',
      '  font-size: 0.78rem;',
      '  line-height: 1.35;',
      '  color: #1F2937;',
      '  font-weight: 600;',
      '  margin: 0;',
      '}',
      '.speech-tail {',
      '  position: absolute;',
      '  bottom: -8px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  width: 0; height: 0;',
      '  border-left: 8px solid transparent;',
      '  border-right: 8px solid transparent;',
      '}',
      '.tail-cat { border-top: 8px solid #FEF3C7; }',
      '.tail-mouse { border-top: 8px solid #CFFAFE; }',
      '.speaker-active {',
      '  transform: scale(1.03) !important;',
      '  box-shadow: 0 0 18px rgba(250, 204, 21, 0.85) !important;',
      '  border-color: #FACC15 !important;',
      '}',
      '',
      '/* Character SVGs & Animations */',
      '.whisker-puff-svg, .pip-mouse-svg {',
      '  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));',
      '  transition: transform 0.2s ease;',
      '}',
      '.speaker-active + .whisker-puff-svg, .speaker-active + .pip-mouse-svg {',
      '  transform: scale(1.05);',
      '}',
      '@keyframes wandGlow {',
      '  0%, 100% { filter: drop-shadow(0 0 5px #22C55E); }',
      '  50% { filter: drop-shadow(0 0 12px #4ADE80); }',
      '}',
      '.wand-light { animation: wandGlow 1.4s ease-in-out infinite; }',
      '',
      '/* Scene Step Indicators */',
      '.scene-step-pill {',
      '  position: absolute;',
      '  top: 10px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  background: rgba(6, 78, 59, 0.92);',
      '  border: 1.5px solid #34D399;',
      '  border-radius: 999px;',
      '  padding: 3px 14px;',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-size: 0.78rem;',
      '  font-weight: 800;',
      '  color: #D1FAE5;',
      '  box-shadow: 0 4px 12px rgba(0,0,0,0.35);',
      '  z-index: 12;',
      '  white-space: nowrap;',
      '}',
      '.scene-grace-notice {',
      '  position: absolute;',
      '  bottom: 6px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  background: rgba(245, 158, 11, 0.92);',
      '  border: 1.5px solid #FDE68A;',
      '  border-radius: 999px;',
      '  padding: 3px 12px;',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-size: 0.70rem;',
      '  font-weight: 800;',
      '  color: #78350F;',
      '  box-shadow: 0 2px 10px rgba(0,0,0,0.3);',
      '  z-index: 12;',
      '  opacity: 0;',
      '  pointer-events: none;',
      '  transition: opacity 0.2s ease;',
      '  white-space: nowrap;',
      '}',
      '.scene-grace-notice.visible { opacity: 1; }',
      '',
      '/* Bottom Controls & Timeline Bar (Screen Compatible - Never Cut Tabs) */',
      '.academy-timeline-tray {',
      '  padding: 8px 16px 12px;',
      '  background: rgba(3, 14, 9, 0.96);',
      '  border-top: 1.5px solid rgba(52, 211, 153, 0.25);',
      '  flex-shrink: 0;',
      '}',
      '.academy-controls-row {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  margin-bottom: 6px;',
      '}',
      '.academy-speaker-status {',
      '  font-size: 0.72rem;',
      '  font-weight: 800;',
      '  color: #FCD34D;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',
      '.academy-nav-btns {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  flex-shrink: 0;',
      '}',
      '.btn-nav-step {',
      '  background: rgba(255, 255, 255, 0.12);',
      '  border: 1.5px solid rgba(52, 211, 153, 0.4);',
      '  border-radius: 999px;',
      '  color: #ECFDF5;',
      '  padding: 3px 10px;',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-weight: 800;',
      '  font-size: 0.74rem;',
      '  cursor: pointer;',
      '  transition: all 0.18s ease;',
      '  white-space: nowrap;',
      '}',
      '.btn-nav-step:hover { background: rgba(52, 211, 153, 0.25); transform: translateY(-1px); }',
      '.timeline-progress-track {',
      '  width: 100%;',
      '  height: 6px;',
      '  background: rgba(255, 255, 255, 0.15);',
      '  border-radius: 999px;',
      '  position: relative;',
      '  overflow: hidden;',
      '  margin-bottom: 6px;',
      '}',
      '.timeline-progress-fill {',
      '  position: absolute;',
      '  top: 0; left: 0; bottom: 0;',
      '  width: 20%;',
      '  background: linear-gradient(90deg, #10B981 0%, #34D399 50%, #FBBF24 100%);',
      '  border-radius: 999px;',
      '  transition: width 0.35s ease;',
      '  box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);',
      '}',
      '.timeline-indicators-row {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  gap: 4px;',
      '  overflow-x: auto;',
      '  -webkit-overflow-scrolling: touch;',
      '  padding-bottom: 2px;',
      '}',
      '.timeline-indicator {',
      '  font-size: 0.68rem;',
      '  font-weight: 800;',
      '  color: #94A3B8;',
      '  white-space: nowrap;',
      '  flex-shrink: 0;',
      '  padding: 2px 6px;',
      '  border-radius: 6px;',
      '}',
      '.timeline-indicator.active {',
      '  color: #34D399;',
      '  background: rgba(52, 211, 153, 0.15);',
      '}',
      '',
      '/* Handover Transition Modal (Puff & Pip Handover to Shakir) */',
      '.handover-modal-card {',
      '  background: radial-gradient(ellipse at 50% 0%, #0D3826 0%, #071E15 65%, #030D08 100%);',
      '  border: 2.5px solid #10B981;',
      '  border-radius: 24px;',
      '  padding: 20px 24px;',
      '  max-width: 660px;',
      '  width: 100%;',
      '  max-height: 94vh;',
      '  max-height: 94dvh;',
      '  box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 45px rgba(16, 185, 129, 0.35);',
      '  position: relative;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  text-align: center;',
      '  overflow-y: auto;',
      '  box-sizing: border-box;',
      '}',
      '.handover-banner-pill {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  background: linear-gradient(135deg, #059669, #047857);',
      '  color: #D1FAE5;',
      '  padding: 4px 14px;',
      '  border-radius: 999px;',
      '  font-size: 0.72rem;',
      '  font-weight: 800;',
      '  letter-spacing: 0.5px;',
      '  text-transform: uppercase;',
      '  margin-bottom: 8px;',
      '}',
      '.handover-title {',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-size: 1.45rem;',
      '  font-weight: 900;',
      '  color: #FCD34D;',
      '  margin-bottom: 4px;',
      '}',
      '.handover-subtitle {',
      '  font-size: 0.75rem;',
      '  color: #A7F3D0;',
      '  margin-bottom: 14px;',
      '}',
      '.handover-stage-box {',
      '  display: flex;',
      '  align-items: flex-end;',
      '  justify-content: space-between;',
      '  width: 100%;',
      '  gap: 12px;',
      '  margin-bottom: 16px;',
      '}',
      '.handover-center-arrow {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 4px;',
      '  flex-shrink: 0;',
      '}',
      '.handover-arrow-badge {',
      '  background: linear-gradient(135deg, #0284C7, #0369A1);',
      '  border: 1.5px solid #38BDF8;',
      '  border-radius: 999px;',
      '  padding: 4px 10px;',
      '  color: #FFFFFF;',
      '  font-size: 0.70rem;',
      '  font-weight: 800;',
      '  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);',
      '}',
      '.handover-actions-row {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 12px;',
      '  flex-wrap: wrap;',
      '  width: 100%;',
      '  margin-top: 8px;',
      '}',
      '',
      '/* Enhanced Reward Celebration Modal */',
      '.reward-modal-card {',
      '  background: radial-gradient(ellipse at 50% 0%, #1B4332 0%, #081C15 65%, #04100C 100%);',
      '  border: 2.5px solid #F59E0B;',
      '  border-radius: 28px;',
      '  padding: 20px 24px;',
      '  max-width: 600px;',
      '  width: 100%;',
      '  max-height: 94vh;',
      '  max-height: 94dvh;',
      '  text-align: center;',
      '  box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 50px rgba(245, 158, 11, 0.35);',
      '  position: relative;',
      '  overflow-y: auto;',
      '  box-sizing: border-box;',
      '}',
      '.reward-sparkle-halo {',
      '  position: absolute;',
      '  top: -60px; left: 50%; transform: translateX(-50%);',
      '  width: 240px; height: 240px;',
      '  background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%);',
      '  pointer-events: none;',
      '}',
      '.reward-banner-pill {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  background: linear-gradient(135deg, #B45309, #D97706);',
      '  color: #FFF;',
      '  padding: 4px 16px;',
      '  border-radius: 999px;',
      '  font-size: 0.74rem;',
      '  font-weight: 800;',
      '  letter-spacing: 0.5px;',
      '  text-transform: uppercase;',
      '  margin-bottom: 10px;',
      '}',
      '.reward-big-amount {',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-size: 2.6rem;',
      '  font-weight: 900;',
      '  color: #FCD34D;',
      '  text-shadow: 0 4px 16px rgba(245, 158, 11, 0.6);',
      '  line-height: 1;',
      '  margin: 2px 0 8px;',
      '}',
      '.reward-explanation-box {',
      '  background: rgba(255, 255, 255, 0.08);',
      '  border: 1.5px solid rgba(245, 158, 11, 0.35);',
      '  border-radius: 16px;',
      '  padding: 12px 16px;',
      '  text-align: left;',
      '  margin: 12px 0;',
      '  font-size: 0.80rem;',
      '  line-height: 1.45;',
      '  color: #E2E8F0;',
      '}',
      '.reward-btn-claim {',
      '  background: linear-gradient(135deg, #10B981, #059669);',
      '  color: #FFFFFF;',
      '  font-family: "Baloo 2", sans-serif;',
      '  font-size: 1rem;',
      '  font-weight: 900;',
      '  padding: 10px 26px;',
      '  border-radius: 999px;',
      '  border: 2px solid #6EE7B7;',
      '  cursor: pointer;',
      '  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.45);',
      '  transition: transform 0.18s ease, filter 0.18s ease;',
      '}',
      '.reward-btn-claim:hover {',
      '  transform: scale(1.04) translateY(-2px);',
      '  filter: brightness(1.1);',
      '}',
      '',
      '/* Responsive Scalers for Small Laptop & Medium Displays (<= 680px Height) */',
      '@media (max-height: 680px) {',
      '  .academy-topbar { padding: 6px 14px; }',
      '  .academy-title { font-size: 0.95rem; }',
      '  .academy-subtitle { font-size: 0.62rem; }',
      '  .academy-scene-canvas { padding: 6px 12px; min-height: 85px; }',
      '  .academy-actors-stage { padding: 0 14px 4px; gap: 10px; }',
      '  .speech-bubble { padding: 6px 10px; margin-bottom: 6px; }',
      '  .speech-text { font-size: 0.74rem; line-height: 1.3; }',
      '  .whisker-puff-svg { width: 75px !important; height: 95px !important; }',
      '  .pip-mouse-svg { width: 65px !important; height: 80px !important; }',
      '  .academy-timeline-tray { padding: 6px 14px 10px; }',
      '  .timeline-progress-track { margin-bottom: 4px; height: 5px; }',
      '  .scene-step-pill { top: 6px; padding: 2px 12px; font-size: 0.74rem; }',
      '  .reward-big-amount { font-size: 2.1rem; }',
      '  .reward-modal-card { padding: 14px 18px; }',
      '}',
      '',
      '/* Responsive Scalers for Mobile Landscape & Very Short Displays (<= 520px Height) */',
      '@media (max-height: 520px) {',
      '  .kids-academy-backdrop { padding: 4px; }',
      '  .kids-academy-card { max-height: 98vh; max-height: 98dvh; border-radius: 16px; border-width: 1.5px; }',
      '  .academy-topbar { padding: 4px 12px; }',
      '  .academy-title { font-size: 0.85rem; }',
      '  .academy-brand-icon { font-size: 1.2rem; }',
      '  .btn-academy-voice, .btn-academy-skip { padding: 3px 8px; font-size: 0.68rem; }',
      '  .academy-scene-canvas { min-height: 70px; padding: 4px 10px; }',
      '  .academy-actors-stage { padding: 0 10px 4px; gap: 8px; }',
      '  .speech-bubble { padding: 5px 8px; margin-bottom: 4px; }',
      '  .speech-text { font-size: 0.68rem; line-height: 1.25; }',
      '  .speech-author { font-size: 0.70rem; margin-bottom: 1px; }',
      '  .whisker-puff-svg { width: 55px !important; height: 70px !important; }',
      '  .pip-mouse-svg { width: 48px !important; height: 60px !important; }',
      '  .academy-timeline-tray { padding: 4px 10px 6px; }',
      '  .timeline-progress-track { height: 4px; margin-bottom: 3px; }',
      '  .academy-controls-row { margin-bottom: 2px; }',
      '  .academy-speaker-status { font-size: 0.66rem; }',
      '  .btn-nav-step { padding: 2px 7px; font-size: 0.66rem; }',
      '  .timeline-indicators-row { font-size: 0.62rem; gap: 2px; }',
      '  .scene-step-pill { top: 4px; font-size: 0.68rem; padding: 2px 8px; }',
      '  .handover-modal-card { padding: 10px 14px; border-radius: 16px; }',
      '  .handover-title { font-size: 1.15rem; margin-bottom: 2px; }',
      '  .handover-stage-box { margin-bottom: 8px; gap: 8px; }',
      '  .reward-modal-card { padding: 10px 14px; border-radius: 16px; }',
      '  .reward-big-amount { font-size: 1.9rem; }',
      '}',
      '',
      '/* Responsive Scalers for Mobile Screen Width (<= 640px) */',
      '@media (max-width: 640px) {',
      '  .kids-academy-backdrop { padding: 6px; }',
      '  .kids-academy-card { border-radius: 18px; }',
      '  .academy-topbar { padding: 8px 12px; }',
      '  .academy-title { font-size: 0.88rem; }',
      '  .academy-subtitle { display: none; }',
      '  .academy-top-actions { gap: 4px; }',
      '  .btn-academy-voice { padding: 3px 8px; font-size: 0.70rem; }',
      '  .btn-academy-skip { padding: 3px 9px; font-size: 0.70rem; }',
      '  .academy-actors-stage { padding: 0 10px 6px; gap: 8px; }',
      '  .speech-bubble { padding: 8px 10px; }',
      '  .speech-text { font-size: 0.72rem; line-height: 1.3; }',
      '  .whisker-puff-svg { width: 68px !important; height: 86px !important; }',
      '  .pip-mouse-svg { width: 58px !important; height: 74px !important; }',
      '  .academy-controls-row { flex-wrap: wrap; gap: 4px; }',
      '  .timeline-indicators-row { gap: 6px; }',
      '  .timeline-indicator { font-size: 0.65rem; }',
      '  .instruction-point-icon-btn { width: 32px; height: 32px; }',
      '  .ip-char-pair { font-size: 0.92rem; }',
      '  .instruction-point-tooltip { width: 250px; }',
      '  .handover-stage-box { flex-direction: column; align-items: center; }',
      '  .actor-box { width: 95%; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Scene Canvas Visual Renderers
  // ---------------------------------------------------------------------------
  function renderSceneVisual(sceneIndex) {
    if (sceneIndex === 0) {
      return '<div style="display:flex;align-items:center;justify-content:center;gap:24px;width:100%;height:100%;flex-wrap:wrap;">' +
        '<div style="position:relative;width:95px;height:95px;flex-shrink:0;">' +
          '<div style="position:absolute;inset:-8px;border-radius:50%;background:radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%);animation:planetRotateGlow 8s linear infinite;"></div>' +
          '<div style="width:95px;height:95px;border-radius:50%;background:radial-gradient(circle at 35% 35%, #34D399 0%, #059669 50%, #064E3B 100%);box-shadow:inset -6px -6px 16px rgba(0,0,0,0.5), 0 0 20px rgba(52,211,153,0.5);display:grid;place-items:center;font-size:2.8rem;">🌍</div>' +
          '<div class="o2-bubble" style="top:15px;left:75px;animation-delay:0s;">O₂</div>' +
          '<div class="o2-bubble" style="top:48px;left:-10px;animation-delay:1.2s;">O₂</div>' +
          '<div class="o2-bubble" style="top:72px;left:82px;animation-delay:2.1s;">O₂</div>' +
        '</div>' +
        '<div style="max-width:300px;color:#ECFDF5;text-align:left;">' +
          '<div style="font-family:\'Baloo 2\', sans-serif;font-size:1.05rem;font-weight:800;color:#34D399;margin-bottom:2px;">Living Biosphere Equilibrium</div>' +
          '<div style="font-size:0.72rem;line-height:1.4;color:#A7F3D0;">SearchO2 connects every plant, microbe, and human action in real-time. Trees actively absorb CO₂ and breathe fresh oxygen into your local atmosphere!</div>' +
        '</div>' +
      '</div>';
    } else if (sceneIndex === 1) {
      return '<div style="display:flex;align-items:center;justify-content:center;gap:14px;width:100%;height:100%;flex-wrap:wrap;">' +
        '<div style="background:rgba(6,78,59,0.7);border:1.5px solid #10B981;border-radius:14px;padding:8px 12px;text-align:center;width:115px;flex-shrink:0;">' +
          '<div style="font-size:1.8rem;line-height:1;">🌱 🔬</div>' +
          '<div style="font-size:0.75rem;font-weight:900;color:#FDE047;margin-top:4px;">1. Till Plot 1</div>' +
          '<div style="font-size:0.62rem;color:#A7F3D0;">Aerobic Soil Porosity</div>' +
        '</div>' +
        '<div style="font-size:1.4rem;color:#34D399;font-weight:900;">➔</div>' +
        '<div style="background:rgba(6,78,59,0.7);border:1.5px solid #10B981;border-radius:14px;padding:8px 12px;text-align:center;width:115px;flex-shrink:0;">' +
          '<div style="font-size:1.8rem;line-height:1;">🏡 ☕</div>' +
          '<div style="font-size:0.75rem;font-weight:900;color:#FDE047;margin-top:4px;">2. Crew Shed</div>' +
          '<div style="font-size:0.62rem;color:#A7F3D0;">Shelter &amp; Field Labor</div>' +
        '</div>' +
        '<div style="font-size:1.4rem;color:#34D399;font-weight:900;">➔</div>' +
        '<div style="background:rgba(6,78,59,0.7);border:1.5px solid #10B981;border-radius:14px;padding:8px 12px;text-align:center;width:115px;flex-shrink:0;">' +
          '<div style="font-size:1.8rem;line-height:1;">🛣️ 🚚</div>' +
          '<div style="font-size:0.75rem;font-weight:900;color:#FDE047;margin-top:4px;">3. Main Road</div>' +
          '<div style="font-size:0.62rem;color:#A7F3D0;">Pave &amp; Welcome Visitors</div>' +
        '</div>' +
      '</div>';
    } else if (sceneIndex === 2) {
      return '<div style="display:flex;align-items:center;justify-content:center;gap:18px;width:100%;height:100%;flex-wrap:wrap;">' +
        '<div style="text-align:center;">' +
          '<div style="font-size:2.2rem;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.4));">🌳 🌲</div>' +
          '<div style="font-size:0.75rem;font-weight:900;color:#A7F3D0;margin-top:2px;">Photosynthesis &amp; Terpenes</div>' +
          '<div style="font-size:0.62rem;color:#6EE7B7;">Oak · Beech · Pine · Birch</div>' +
        '</div>' +
        '<div style="font-size:1.6rem;color:#FCD34D;">⚡</div>' +
        '<div style="text-align:center;">' +
          '<div style="font-size:2.2rem;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.4));">💨 🔋</div>' +
          '<div style="font-size:0.75rem;font-weight:900;color:#38BDF8;margin-top:2px;">Wind Grid &amp; BESS</div>' +
          '<div style="font-size:0.62rem;color:#BAE6FD;">100% Zero-Carbon Power</div>' +
        '</div>' +
        '<div style="font-size:1.6rem;color:#FCD34D;">=</div>' +
        '<div style="background:rgba(2,132,199,0.3);border:2px solid #38BDF8;border-radius:14px;padding:8px 14px;text-align:center;">' +
          '<div style="font-size:1.5rem;color:#38BDF8;font-weight:900;">+300% O₂</div>' +
          '<div style="font-size:0.62rem;color:#E0F2FE;">Atmospheric Repair</div>' +
        '</div>' +
      '</div>';
    } else if (sceneIndex === 3) {
      return '<div style="display:flex;align-items:center;justify-content:center;gap:16px;width:100%;height:100%;flex-wrap:wrap;">' +
        '<div style="text-align:center;background:rgba(6,78,59,0.7);padding:8px 12px;border-radius:12px;border:1.5px solid #10B981;">' +
          '<div style="font-size:1.7rem;">🇩🇪 ➔ 🏔️ ➔ 🏝️ ➔ 🚀</div>' +
          '<div style="font-size:0.72rem;font-weight:900;color:#FDE047;margin-top:2px;">10 Global Biomes</div>' +
          '<div style="font-size:0.62rem;color:#A7F3D0;">Germany to Artemis Space Biosphere</div>' +
        '</div>' +
        '<div style="font-size:1.3rem;color:#34D399;">🔄</div>' +
        '<div style="text-align:center;background:rgba(6,78,59,0.7);padding:8px 12px;border-radius:12px;border:1.5px solid #F59E0B;">' +
          '<div style="font-size:1.7rem;">☕ 🧃 🌾</div>' +
          '<div style="font-size:0.72rem;font-weight:900;color:#FDE047;margin-top:2px;">Village Café &amp; Juice Bar</div>' +
          '<div style="font-size:0.62rem;color:#A7F3D0;">Closed-Loop Eco-Tourism Revenue</div>' +
        '</div>' +
      '</div>';
    } else {
      return '<div style="display:flex;align-items:center;justify-content:center;gap:18px;width:100%;height:100%;flex-wrap:wrap;">' +
        '<div style="position:relative;text-align:center;background:rgba(180,83,9,0.35);border:2px solid #F59E0B;border-radius:16px;padding:10px 16px;">' +
          '<div style="font-size:2rem;filter:drop-shadow(0 0 10px #F59E0B);">⛏️ 📦 ✨</div>' +
          '<div style="font-size:0.80rem;font-weight:900;color:#FDE047;margin-top:2px;">Secret Jute Tarpaulin Cache</div>' +
          '<div style="font-size:0.65rem;color:#FEF3C7;">Right beside the Farm Shed!</div>' +
        '</div>' +
        '<div style="background:rgba(16,185,129,0.35);border:2px solid #10B981;border-radius:16px;padding:10px 16px;text-align:center;">' +
          '<div style="font-size:1.8rem;color:#FCD34D;font-weight:900;">€200 &amp; +150 XP</div>' +
          '<div style="font-size:0.76rem;font-weight:900;color:#A7F3D0;">Planetary Council Grant</div>' +
          '<div style="font-size:0.62rem;color:#6EE7B7;">Instant Facility &amp; Tool Unlocks!</div>' +
        '</div>' +
      '</div>';
    }
  }

  // ---------------------------------------------------------------------------
  // Character SVGs (Whisker Puff & Pip)
  // ---------------------------------------------------------------------------
  function getWhiskerPuffSvg(w, h) {
    w = w || 105; h = h || 130;
    return '<svg class="whisker-puff-svg" viewBox="0 0 160 190" width="' + w + '" height="' + h + '" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="80" cy="184" rx="52" ry="6" fill="rgba(0,0,0,0.35)"/>' +
      '<g class="whisker-tail">' +
        '<path d="M 38 152 C 16 142, 10 118, 22 98 C 28 88, 38 84, 42 92 C 44 98, 36 108, 30 115 C 24 125, 26 140, 42 152 Z" fill="#E07A2B"/>' +
        '<path d="M 22 98 C 28 88, 38 84, 42 92 C 44 98, 36 108, 30 115 Z" fill="#FFFFFF"/>' +
      '</g>' +
      '<path d="M 54 135 L 106 135 L 118 174 L 42 174 Z" fill="#065F46"/>' +
      '<path d="M 58 135 L 52 174 M 72 135 L 70 174 M 88 135 L 90 174 M 102 135 L 108 174" stroke="#044E3B" stroke-width="2"/>' +
      '<path d="M 50 88 L 110 88 L 114 140 L 46 140 Z" fill="#F8FAFC"/>' +
      '<path d="M 52 90 L 70 90 L 76 136 L 48 136 Z" fill="#1E3A8A"/>' +
      '<path d="M 108 90 L 90 90 L 84 136 L 112 136 Z" fill="#1E3A8A"/>' +
      '<circle cx="80" cy="100" r="3.2" fill="#F59E0B" stroke="#B45309" stroke-width="0.8"/>' +
      '<circle cx="80" cy="114" r="3.2" fill="#F59E0B" stroke="#B45309" stroke-width="0.8"/>' +
      '<circle cx="80" cy="128" r="3.2" fill="#F59E0B" stroke="#B45309" stroke-width="0.8"/>' +
      '<circle cx="42" cy="34" r="14" fill="#D97706"/>' +
      '<circle cx="118" cy="34" r="14" fill="#D97706"/>' +
      '<ellipse cx="44" cy="46" rx="6" ry="3.5" fill="#9333EA" transform="rotate(-15 44 46)"/>' +
      '<ellipse cx="40" cy="48" rx="5" ry="3" fill="#D946EF" transform="rotate(20 40 48)"/>' +
      '<ellipse cx="116" cy="46" rx="6" ry="3.5" fill="#9333EA" transform="rotate(15 116 46)"/>' +
      '<ellipse cx="120" cy="48" rx="5" ry="3" fill="#D946EF" transform="rotate(-20 120 48)"/>' +
      '<g class="whisker-head">' +
        '<polygon points="54,62 42,22 72,44" fill="#E07A2B"/>' +
        '<polygon points="52,56 46,28 66,45" fill="#FBCFE8"/>' +
        '<polygon points="106,62 118,22 88,44" fill="#1F2937"/>' +
        '<polygon points="108,56 114,28 94,45" fill="#FBCFE8"/>' +
        '<ellipse cx="80" cy="68" rx="36" ry="32" fill="#FFFFFF"/>' +
        '<path d="M 44 68 C 44 50, 58 40, 72 42 C 65 55, 60 70, 50 78 C 46 76, 44 72, 44 68 Z" fill="#E07A2B"/>' +
        '<path d="M 116 68 C 116 50, 102 40, 88 42 C 95 55, 100 70, 110 78 C 114 76, 116 72, 116 68 Z" fill="#1F2937"/>' +
        '<ellipse cx="74" cy="78" rx="7" ry="5.5" fill="#F8FAFC"/>' +
        '<ellipse cx="86" cy="78" rx="7" ry="5.5" fill="#F8FAFC"/>' +
        '<polygon points="80,75 77,72 83,72" fill="#F472B6"/>' +
        '<line x1="56" y1="78" x2="38" y2="76" stroke="#94A3B8" stroke-width="1.2"/>' +
        '<line x1="56" y1="81" x2="36" y2="83" stroke="#94A3B8" stroke-width="1.2"/>' +
        '<line x1="104" y1="78" x2="122" y2="76" stroke="#94A3B8" stroke-width="1.2"/>' +
        '<line x1="104" y1="81" x2="124" y2="83" stroke="#94A3B8" stroke-width="1.2"/>' +
        '<ellipse cx="68" cy="62" rx="4.5" ry="5.5" fill="#047857"/>' +
        '<circle cx="66.5" cy="60.5" r="1.5" fill="#FFFFFF"/>' +
        '<ellipse cx="92" cy="62" rx="4.5" ry="5.5" fill="#047857"/>' +
        '<circle cx="90.5" cy="60.5" r="1.5" fill="#FFFFFF"/>' +
        '<circle cx="68" cy="62" r="12" stroke="#111827" stroke-width="2.5" fill="rgba(147,197,253,0.2)"/>' +
        '<circle cx="92" cy="62" r="12" stroke="#111827" stroke-width="2.5" fill="rgba(147,197,253,0.2)"/>' +
        '<line x1="80" y1="62" x2="80" y2="62" stroke="#111827" stroke-width="2.5"/>' +
        '<path d="M 80 62 Q 80 59 80 62" stroke="#111827" stroke-width="2.5"/>' +
        '<line x1="56" y1="60" x2="48" y2="57" stroke="#111827" stroke-width="2"/>' +
        '<line x1="104" y1="60" x2="112" y2="57" stroke="#111827" stroke-width="2"/>' +
      '</g>' +
      '<g class="whisker-tool">' +
        '<rect x="115" y="118" width="22" height="34" rx="5" fill="#1E293B" stroke="#0EA5E9" stroke-width="1.8"/>' +
        '<rect x="119" y="122" width="14" height="12" rx="2" fill="#0284C7"/>' +
        '<line x1="122" y1="126" x2="130" y2="126" stroke="#67E8F9" stroke-width="1.5"/>' +
        '<line x1="122" y1="130" x2="128" y2="130" stroke="#A5F3FC" stroke-width="1.2"/>' +
        '<circle cx="126" cy="146" r="3" fill="#10B981"/>' +
        '<path d="M 126 149 L 126 172" stroke="#34D399" stroke-width="2" stroke-dasharray="2 2"/>' +
        '<ellipse cx="116" cy="132" rx="6" ry="6" fill="#FFFFFF"/>' +
      '</g>' +
      '<ellipse cx="46" cy="122" rx="6.5" ry="6.5" fill="#E07A2B"/>' +
    '</svg>';
  }

  function getPipSvg(w, h) {
    w = w || 90; h = h || 115;
    return '<svg class="pip-mouse-svg" viewBox="0 0 140 170" width="' + w + '" height="' + h + '" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="70" cy="164" rx="42" ry="6" fill="rgba(0,0,0,0.35)"/>' +
      '<g class="pip-tail">' +
        '<path d="M 68 144 C 94 144, 118 135, 124 112 C 128 92, 114 78, 106 82 C 98 86, 104 98, 112 102 Z" fill="#F9A8D4"/>' +
      '</g>' +
      '<path d="M 50 148 L 62 148 L 64 160 L 44 160 Z" fill="#84CC16"/>' +
      '<rect x="42" y="158" width="24" height="4" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.8"/>' +
      '<line x1="48" y1="160" x2="48" y2="162" stroke="#64748B" stroke-width="1"/>' +
      '<line x1="54" y1="160" x2="54" y2="162" stroke="#64748B" stroke-width="1"/>' +
      '<line x1="60" y1="160" x2="60" y2="162" stroke="#64748B" stroke-width="1"/>' +
      '<path d="M 76 148 L 88 148 L 94 160 L 74 160 Z" fill="#84CC16"/>' +
      '<rect x="72" y="158" width="24" height="4" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.8"/>' +
      '<line x1="78" y1="160" x2="78" y2="162" stroke="#64748B" stroke-width="1"/>' +
      '<line x1="84" y1="160" x2="84" y2="162" stroke="#64748B" stroke-width="1"/>' +
      '<line x1="90" y1="160" x2="90" y2="162" stroke="#64748B" stroke-width="1"/>' +
      '<path d="M 50 128 L 90 128 L 94 150 L 76 150 L 74 142 L 72 142 L 70 150 L 46 150 Z" fill="#EA580C"/>' +
      '<line x1="70" y1="128" x2="70" y2="142" stroke="#C2410C" stroke-width="1.5"/>' +
      '<path d="M 46 94 L 94 94 L 92 130 L 48 130 Z" fill="#06B6D4"/>' +
      '<circle cx="56" cy="104" r="2.5" fill="#FDE047"/>' +
      '<circle cx="54" cy="102" r="1.5" fill="#FFFFFF"/>' +
      '<circle cx="58" cy="102" r="1.5" fill="#FFFFFF"/>' +
      '<circle cx="56" cy="106" r="1.5" fill="#FFFFFF"/>' +
      '<circle cx="82" cy="108" r="2.5" fill="#FDE047"/>' +
      '<circle cx="80" cy="106" r="1.5" fill="#FFFFFF"/>' +
      '<circle cx="84" cy="106" r="1.5" fill="#FFFFFF"/>' +
      '<circle cx="82" cy="110" r="1.5" fill="#FFFFFF"/>' +
      '<circle cx="68" cy="118" r="2.5" fill="#FDE047"/>' +
      '<circle cx="66" cy="116" r="1.5" fill="#FFFFFF"/>' +
      '<circle cx="70" cy="116" r="1.5" fill="#FFFFFF"/>' +
      '<ellipse cx="70" cy="104" rx="8" ry="10" fill="#F3E8D6"/>' +
      '<circle cx="44" cy="46" r="18" fill="#9C744A"/>' +
      '<circle cx="44" cy="46" r="12" fill="#F472B6"/>' +
      '<circle cx="44" cy="46" r="7" fill="#FBCFE8"/>' +
      '<circle cx="96" cy="46" r="18" fill="#9C744A"/>' +
      '<circle cx="96" cy="46" r="12" fill="#F472B6"/>' +
      '<circle cx="96" cy="46" r="7" fill="#FBCFE8"/>' +
      '<ellipse cx="70" cy="68" rx="22" ry="24" fill="#9C744A"/>' +
      '<ellipse cx="70" cy="74" rx="14" ry="16" fill="#F3E8D6"/>' +
      '<ellipse cx="70" cy="84" rx="4" ry="3.5" fill="#F472B6"/>' +
      '<line x1="56" y1="83" x2="40" y2="80" stroke="#9C744A" stroke-width="1.2"/>' +
      '<line x1="56" y1="86" x2="40" y2="87" stroke="#9C744A" stroke-width="1.2"/>' +
      '<line x1="84" y1="83" x2="100" y2="80" stroke="#9C744A" stroke-width="1.2"/>' +
      '<line x1="84" y1="86" x2="100" y2="87" stroke="#9C744A" stroke-width="1.2"/>' +
      '<ellipse cx="61" cy="66" rx="4.5" ry="5.5" fill="#0F172A"/>' +
      '<circle cx="62.5" cy="64.5" r="1.5" fill="#FFFFFF"/>' +
      '<circle cx="59.5" cy="67.5" r="0.8" fill="#FFFFFF"/>' +
      '<ellipse cx="79" cy="66" rx="4.5" ry="5.5" fill="#0F172A"/>' +
      '<circle cx="80.5" cy="64.5" r="1.5" fill="#FFFFFF"/>' +
      '<circle cx="77.5" cy="67.5" r="0.8" fill="#FFFFFF"/>' +
      '<g class="pip-wand-left wand-light">' +
        '<rect x="22" y="80" width="8" height="36" rx="4" fill="#22C55E"/>' +
        '<rect x="23" y="112" width="6" height="12" rx="2" fill="#EAB308"/>' +
        '<circle cx="26" cy="80" r="6" fill="#4ADE80" opacity="0.6"/>' +
        '<ellipse cx="28" cy="112" rx="5" ry="5" fill="#F3E8D6"/>' +
      '</g>' +
      '<g class="pip-wand-right wand-light">' +
        '<rect x="108" y="80" width="8" height="36" rx="4" fill="#22C55E"/>' +
        '<rect x="109" y="112" width="6" height="12" rx="2" fill="#EAB308"/>' +
        '<circle cx="112" cy="80" r="6" fill="#4ADE80" opacity="0.6"/>' +
        '<ellipse cx="110" cy="112" rx="5" ry="5" fill="#F3E8D6"/>' +
      '</g>' +
    '</svg>';
  }

  // ---------------------------------------------------------------------------
  // Build Academy Modal HTML (Clean In-Game UI, Screen Compatible)
  // ---------------------------------------------------------------------------
  function buildAcademyModalHtml() {
    return '<div class="kids-academy-backdrop" id="kidsAcademyModal">' +
      '<div class="kids-academy-card" role="dialog" aria-modal="true">' +
        '<div class="academy-topbar">' +
          '<div class="academy-brand">' +
            '<div class="academy-brand-icon">🎓</div>' +
            '<div style="min-width:0;">' +
              '<div class="academy-title">Kids Eco-Academy · The Living Biosphere</div>' +
              '<div class="academy-subtitle">PROFESSOR WHISKER PUFF &amp; PIP SQUEAK-A-LINK</div>' +
            '</div>' +
          '</div>' +
          '<div class="academy-top-actions">' +
            '<button type="button" class="btn-academy-voice" id="btnAcademyVoice" title="Toggle Spoken Voice">' +
              '<span>' + (AcademyState.isVoiceEnabled ? '🔊 Voice: ON' : '🔇 Voice: OFF') + '</span>' +
            '</button>' +
            '<button type="button" class="btn-academy-skip" id="btnAcademySkip" title="Skip to Field Handover">' +
              '<span>⏭️ Skip to Tour ➔</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div class="academy-stage-wrapper" id="academyStageWrapper">' +
          '<div class="scene-step-pill" id="sceneStepPill">Scene 1/5: The Living Biosphere</div>' +
          '<div class="scene-grace-notice" id="sceneGraceNotice"></div>' +
          '<div class="academy-scene-canvas" id="academySceneCanvas">' +
            renderSceneVisual(0) +
          '</div>' +

          '<div class="academy-actors-stage">' +
            '<div class="actor-box">' +
              '<div class="speech-bubble speech-cat" id="academyCatBubble">' +
                '<div class="speech-author"><span>🐱</span> Professor Whisker Puff</div>' +
                '<p class="speech-text" id="academyCatText">' + AcademyState.scenes[0].catText + '</p>' +
                '<div class="speech-tail tail-cat"></div>' +
              '</div>' +
              getWhiskerPuffSvg(100, 125) +
            '</div>' +

            '<div class="actor-box">' +
              '<div class="speech-bubble speech-mouse" id="academyPipBubble">' +
                '<div class="speech-author"><span>🐭</span> Pip Squeak-a-Link</div>' +
                '<p class="speech-text" id="academyPipText">' + AcademyState.scenes[0].pipText + '</p>' +
                '<div class="speech-tail tail-mouse"></div>' +
              '</div>' +
              getPipSvg(86, 110) +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="academy-timeline-tray">' +
          '<div class="academy-controls-row">' +
            '<div class="academy-speaker-status" id="academySpeakerStatus">🐱 Professor Whisker Puff speaking...</div>' +
            '<div class="academy-nav-btns">' +
              '<button type="button" class="btn-nav-step" id="btnAcademyPrev" title="Previous Scene">⏮️ Prev</button>' +
              '<button type="button" class="btn-nav-step" id="btnAcademyPause" title="Pause / Resume">⏸️ Pause</button>' +
              '<button type="button" class="btn-nav-step" id="btnAcademyNext" title="Next Scene">Next ➔</button>' +
            '</div>' +
          '</div>' +
          '<div class="timeline-progress-track">' +
            '<div class="timeline-progress-fill" id="academyProgressFill" style="width:20%;"></div>' +
          '</div>' +
          '<div class="timeline-indicators-row">' +
            '<span class="timeline-indicator active" id="tlInd0">1. Welcome</span>' +
            '<span class="timeline-indicator" id="tlInd1">2. How to Proceed</span>' +
            '<span class="timeline-indicator" id="tlInd2">3. Earning O₂</span>' +
            '<span class="timeline-indicator" id="tlInd3">4. Global Journey</span>' +
            '<span class="timeline-indicator" id="tlInd4">5. Secrets &amp; Rewards</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ---------------------------------------------------------------------------
  // Build Introductory Puff & Pip Interactive Dialogue Handover Modal
  // Bridges Skip Tour -> Practical Field Walking Tour with Shakir
  // ---------------------------------------------------------------------------
  function buildHandoverModalHtml() {
    return '<div class="kids-academy-backdrop visible" id="kidsAcademyHandoverModal">' +
      '<div class="handover-modal-card" role="dialog" aria-modal="true">' +
        '<div class="handover-banner-pill">🧭 FIELD HANDOVER · PRACTICAL WALKING MISSION</div>' +
        '<div class="handover-title">Meeting Shakir, OxyEco Forger</div>' +
        '<div class="handover-subtitle">FROM BIOSPHERE THEORY TO HANDS-ON LANDMARK CRAFTSMANSHIP</div>' +

        '<div class="handover-stage-box">' +
          '<div class="actor-box">' +
            '<div class="speech-bubble speech-mouse" id="handoverPipBubble">' +
              '<div class="speech-author"><span>🐭</span> Pip Squeak-a-Link</div>' +
              '<p class="speech-text" id="handoverPipText">' +
                '“Oh Professor Puff, you know my understanding will truly click in my brain once I have the chance to visit the ground and get real, worthful blueprints of what to do! Then every single one of your valuable biosphere theories will be permanently mapped into my brain cells!”' +
              '</p>' +
              '<div class="speech-tail tail-mouse"></div>' +
            '</div>' +
            getPipSvg(82, 102) +
          '</div>' +

          '<div class="handover-center-arrow">' +
            '<div class="handover-arrow-badge">🧑‍🌾 Meeting Shakir</div>' +
            '<div style="font-size:2rem;line-height:1;margin:4px 0;animation:wandGlow 1.8s infinite;">➔ 🚜 ➔</div>' +
            '<div style="font-size:0.68rem;color:#BAE6FD;font-weight:800;">Ch. 1 Plot 1 Tour</div>' +
          '</div>' +

          '<div class="actor-box">' +
            '<div class="speech-bubble speech-cat" id="handoverPuffBubble">' +
              '<div class="speech-author"><span>🐱</span> Professor Whisker Puff</div>' +
              '<p class="speech-text" id="handoverPuffText">' +
                '“What an acute scientific insight, Pip! Experiential cognitive mapping is indeed how abstract biosphere theories take permanent root. While theoretical calculations model global equilibrium, true craftsmanship happens on the ground! And for that, only Shakir, our master OxyEco Forger, has the architectural blueprints and practical wisdom to guide your paws!”' +
              '</p>' +
              '<div class="speech-tail tail-cat"></div>' +
            '</div>' +
            getWhiskerPuffSvg(95, 118) +
          '</div>' +
        '</div>' +

        '<div class="handover-actions-row">' +
          '<button type="button" class="reward-btn-claim" id="btnHandoverStartShakir">' +
            '<span>🚜 Start Shakir\'s Field Walking Tour ➔</span>' +
          '</button>' +
          '<button type="button" class="btn-nav-step" id="btnHandoverFreeRoam" style="background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.3);padding:8px 18px;border-radius:999px;color:#CBD5E1;font-weight:700;font-size:0.80rem;cursor:pointer;">' +
            '<span>👀 Free Roam (Explore on My Own)</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function openHandoverTransitionModal() {
    ensureAcademyStyles();
    closeHandoverModal(true);
    stopAllSpeech();

    var wrap = document.createElement('div');
    wrap.innerHTML = buildHandoverModalHtml();
    document.body.appendChild(wrap.firstChild);

    var pipBubble = document.getElementById('handoverPipBubble');
    var puffBubble = document.getElementById('handoverPuffBubble');

    var pipLine = 'Oh Professor Puff, you know my understanding will truly click in my brain once I have the chance to visit the ground and get real, worthful blueprints of what to do! Then every single one of your valuable biosphere theories will be permanently mapped into my brain cells!';
    var puffLine = 'What an acute scientific insight, Pip! Experiential cognitive mapping is indeed how abstract biosphere theories take permanent root. While theoretical calculations model global equilibrium, true craftsmanship happens on the ground! And for that, only Shakir, our master OxyEco Forger, has the architectural blueprints and practical wisdom to guide your paws!';

    // Pip speaks first with a 240ms breathing pause to let modal mount and audio context initialize without cutting
    setTimeout(function () {
      if (!document.getElementById('kidsAcademyHandoverModal')) return;
      if (pipBubble) pipBubble.classList.add('speaker-active');
      speakLine('mouse', pipLine, function () {
        if (pipBubble) pipBubble.classList.remove('speaker-active');

        // Pause then Puff speaks
        setTimeout(function () {
          if (!document.getElementById('kidsAcademyHandoverModal')) return;
          if (puffBubble) puffBubble.classList.add('speaker-active');
          speakLine('cat', puffLine, function () {
            if (puffBubble) puffBubble.classList.remove('speaker-active');
          });
        }, 400);
      });
    }, 240);

    // Start Shakir Tour button
    var startBtn = document.getElementById('btnHandoverStartShakir');
    if (startBtn) {
      startBtn.onclick = function () {
        closeHandoverModal(true);
        launchShakirTourDirectly();
      };
    }

    // Free Roam button
    var roamBtn = document.getElementById('btnHandoverFreeRoam');
    if (roamBtn) {
      roamBtn.onclick = function () {
        closeHandoverModal(true);
        if (global.SearchO2ShakirGuide && typeof global.SearchO2ShakirGuide.showShakirSpeechBubble === 'function') {
          global.SearchO2ShakirGuide.showShakirSpeechBubble('Enjoy exploring the farm! Tap on me anytime to resume our guided tour! 🧑‍🌾', 4500);
        }
      };
    }
  }

  function closeHandoverModal(immediate) {
    stopAllSpeech();
    var modal = document.getElementById('kidsAcademyHandoverModal');
    if (modal) {
      modal.style.pointerEvents = 'none';
      if (immediate) {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      } else {
        modal.classList.remove('visible');
        setTimeout(function () {
          if (modal.parentNode) modal.parentNode.removeChild(modal);
        }, 200);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Build Enhanced Reward Celebration Modal HTML
  // ---------------------------------------------------------------------------
  function buildRewardCelebrationModalHtml() {
    return '<div class="kids-academy-backdrop visible" id="kidsAcademyRewardModal">' +
      '<div class="reward-modal-card" role="dialog" aria-modal="true">' +
        '<div class="reward-sparkle-halo"></div>' +
        '<div class="reward-banner-pill">🏆 FULL ORIENTATION SCHOLAR AWARD</div>' +
        '<div style="font-size:2rem;line-height:1;margin-bottom:4px;">✨ 🐱 🐭 ✨</div>' +
        '<div class="reward-big-amount">+€200 &amp; +150 XP</div>' +
        '<div style="font-family:\'Baloo 2\', sans-serif;font-size:1.1rem;font-weight:800;color:#A7F3D0;">' +
          'Planetary Council Fellowship Grant Deposited!' +
        '</div>' +

        '<div class="reward-explanation-box">' +
          '<div style="margin-bottom:8px;">' +
            '<strong style="color:#FCD34D;">🐱 Professor Whisker Puff:</strong> ' +
            '“Outstanding scientific dedication, young scholar! You explored our entire Biosphere Masterplan from beginning to end with remarkable focus! In recognition of your planetary stewardship, the Planetary Council has officially deposited your <strong>€200 Fellowship Grant</strong> and <strong>+150 Knowledge XP</strong>!”' +
          '</div>' +
          '<div style="margin-bottom:8px;">' +
            '<strong style="color:#38BDF8;">🐭 Pip Squeak-a-Link:</strong> ' +
            '“Hooray! Fantastic! €200 shiny euros in our pockets! Now every one of Professor Puff\'s brilliant theories will be permanently mapped into my mouse brain cells as we walk the ground with Shakir and inspect our real building blueprints! Let\'s meet Shakir at the Farm Gate!”' +
          '</div>' +
          '<div>' +
            '<strong style="color:#FCD34D;">🐱 Whisker Puff (Next Mission):</strong> ' +
            '“Now let us meet Shakir at the Farm Gate, where he will unveil your custom estate crest and hand you the architectural blueprints for our planetary journey!”' +
          '</div>' +
        '</div>' +

        '<button type="button" class="reward-btn-claim" id="btnClaimAcademyReward">' +
          '<span>Claim €200 &amp; Start Farm Tour ➔</span>' +
        '</button>' +
      '</div>' +
    '</div>';
  }

  // ---------------------------------------------------------------------------
  // Launch Shakir's Journey Immediately
  // ---------------------------------------------------------------------------
  function launchShakirTourDirectly() {
    closeAcademyModal(true);
    closeHandoverModal(true);
    if (typeof global.closeModal === 'function') {
      try { global.closeModal(); } catch (e) {}
    } else if (typeof window !== 'undefined' && typeof window.closeModal === 'function') {
      try { window.closeModal(); } catch (e) {}
    }

    try {
      sessionStorage.setItem('searchO2_shakir_welcomed', '1');
      sessionStorage.setItem('searchO2_academy_video_played', '1');
    } catch (e) {}

    if (global.SearchO2ShakirGuide && typeof global.SearchO2ShakirGuide.startGuidedTour === 'function') {
      global.SearchO2ShakirGuide.startGuidedTour(1);
    } else if (global.SearchO2ShakirGuide && typeof global.SearchO2ShakirGuide.walkToChapter === 'function') {
      if (typeof global.switchScreen === 'function') {
        try { global.switchScreen('farm'); } catch (e) {}
      } else if (typeof window !== 'undefined' && typeof window.switchScreen === 'function') {
        try { window.switchScreen('farm'); } catch (e) {}
      }
      setTimeout(function () {
        global.SearchO2ShakirGuide.walkToChapter(1);
      }, 60);
    } else if (global.SearchO2HomeAvatar && typeof global.SearchO2HomeAvatar.walkToChapter === 'function') {
      if (typeof global.switchScreen === 'function') {
        try { global.switchScreen('farm'); } catch (e) {}
      }
      setTimeout(function () {
        global.SearchO2HomeAvatar.walkToChapter(1);
      }, 60);
    } else if (global.SearchO2ShakirGuide && typeof global.SearchO2ShakirGuide.openWelcomeModal === 'function') {
      global.SearchO2ShakirGuide.openWelcomeModal();
    }
  }

  // ---------------------------------------------------------------------------
  // Open / Close & Navigation Logic
  // ---------------------------------------------------------------------------
  function openAcademyModal(options) {
    if (AcademyState.isOpen && document.getElementById('kidsAcademyModal')) {
      return;
    }
    options = options || {};
    try {
      sessionStorage.setItem('searchO2_academy_video_played', '1');
      sessionStorage.setItem('searchO2_shakir_welcomed', '1');
    } catch (e) {}

    ensureAcademyStyles();

    closeAcademyModal(true);
    closeHandoverModal(true);

    AcademyState.isOpen = true;
    AcademyState.isPlaying = true;
    AcademyState.isPaused = false;
    AcademyState.currentScene = 0;
    AcademyState.watchedThoroughly = true;
    AcademyState.hasSkipped = false;
    AcademyState.onCompleteOrSkip = options.onCompleteOrSkip || null;

    var container = document.createElement('div');
    container.innerHTML = buildAcademyModalHtml();
    document.body.appendChild(container.firstChild);

    var modal = document.getElementById('kidsAcademyModal');
    setTimeout(function () {
      if (modal) modal.classList.add('visible');
    }, 20);

    // Skip Button: triggers the smooth Puff & Pip handover transition modal!
    var skipBtn = document.getElementById('btnAcademySkip');
    if (skipBtn) {
      skipBtn.onclick = function (e) {
        if (e) e.stopPropagation();
        handleSkip();
      };
    }

    // Voice Toggle
    var voiceBtn = document.getElementById('btnAcademyVoice');
    if (voiceBtn) {
      voiceBtn.onclick = function (e) {
        if (e) e.stopPropagation();
        AcademyState.isVoiceEnabled = !AcademyState.isVoiceEnabled;
        if (!AcademyState.isVoiceEnabled) {
          stopAllSpeech();
          voiceBtn.classList.add('muted');
          voiceBtn.innerHTML = '<span>🔇 Voice: OFF</span>';
        } else {
          voiceBtn.classList.remove('muted');
          voiceBtn.innerHTML = '<span>🔊 Voice: ON</span>';
          startSceneSequence(AcademyState.currentScene);
        }
      };
    }

    // Step Navigation Controls
    var nextBtn = document.getElementById('btnAcademyNext');
    if (nextBtn) {
      nextBtn.onclick = function (e) {
        if (e) e.stopPropagation();
        nextSceneManual();
      };
    }

    var prevBtn = document.getElementById('btnAcademyPrev');
    if (prevBtn) {
      prevBtn.onclick = function (e) {
        if (e) e.stopPropagation();
        prevSceneManual();
      };
    }

    var pauseBtn = document.getElementById('btnAcademyPause');
    if (pauseBtn) {
      pauseBtn.onclick = function (e) {
        if (e) e.stopPropagation();
        togglePauseResume();
      };
    }

    // Kick off Scene 0 with smooth 280ms breathing window for layout and voice stabilization
    setTimeout(function () {
      if (!AcademyState.isOpen) return;
      startSceneSequence(0);
    }, 280);
  }

  function closeAcademyModal(immediate) {
    clearTimers();
    stopAllSpeech();

    var modal = document.getElementById('kidsAcademyModal');
    if (modal) {
      modal.style.pointerEvents = 'none';
      if (immediate) {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      } else {
        modal.classList.remove('visible');
        setTimeout(function () {
          if (modal.parentNode) modal.parentNode.removeChild(modal);
        }, 220);
      }
    }
    AcademyState.isOpen = false;
    AcademyState.isPlaying = false;
    AcademyState.isPaused = false;
  }

  function handleSkip() {
    clearTimers();
    stopAllSpeech();
    AcademyState.watchedThoroughly = false;
    AcademyState.hasSkipped = true;
    closeAcademyModal(true); // Cleanly removes video modal

    // Opens the smooth introductory Puff & Pip interactive dialogue handover modal!
    setTimeout(function () {
      openHandoverTransitionModal();
    }, 60);
  }

  function switchSceneContent(sceneIdx) {
    var sc = AcademyState.scenes[sceneIdx];
    if (!sc) return;

    var pill = document.getElementById('sceneStepPill');
    if (pill) pill.textContent = 'Scene ' + (sceneIdx + 1) + '/5: ' + sc.title;

    var canvas = document.getElementById('academySceneCanvas');
    if (canvas) canvas.innerHTML = renderSceneVisual(sceneIdx);

    var catText = document.getElementById('academyCatText');
    if (catText) catText.textContent = sc.catText;

    var pipText = document.getElementById('academyPipText');
    if (pipText) pipText.textContent = sc.pipText;

    var fill = document.getElementById('academyProgressFill');
    if (fill) {
      var pct = Math.round(((sceneIdx + 1) / AcademyState.scenes.length) * 100);
      fill.style.width = pct + '%';
    }

    for (var i = 0; i < 5; i++) {
      var ind = document.getElementById('tlInd' + i);
      if (ind) {
        ind.classList.toggle('active', i === sceneIdx);
      }
    }
  }

  function handleFinishThoroughly() {
    clearTimers();
    stopAllSpeech();
    closeAcademyModal(true);

    if (AcademyState.watchedThoroughly && !AcademyState.hasSkipped) {
      if (typeof global.state !== 'undefined' && global.state) {
        global.state.money = (global.state.money || 0) + 200;
        global.state.xp = (global.state.xp || 0) + 150;
        if (typeof global.addKnowledgeXP === 'function') {
          global.addKnowledgeXP(150, 'Completed Kids Sustainability Academy Masterplan Orientation');
        }
        if (typeof global.requestSave === 'function') global.requestSave();
        if (typeof global.render === 'function') global.render();
      }

      if (typeof global.SoundTrackEngine !== 'undefined') {
        global.SoundTrackEngine.playSFX('achievement');
      }

      var rewardWrap = document.createElement('div');
      rewardWrap.innerHTML = buildRewardCelebrationModalHtml();
      document.body.appendChild(rewardWrap.firstChild);

      // Voice celebration for reward
      speakLine('cat', 'Outstanding scientific dedication, young scholar! You explored our entire Biosphere Masterplan with remarkable focus! The Planetary Council has deposited 200 euro and 150 Knowledge XP into your account!', function () {
        speakLine('mouse', 'Hooray! Fantastic! 200 shiny euros in our pockets! Now every one of Professor Puff\'s brilliant theories will be permanently mapped into my mouse brain cells as we walk the ground with Shakir and inspect our real building blueprints! Let\'s meet Shakir at the Farm Gate!');
      });

      var claimBtn = document.getElementById('btnClaimAcademyReward');
      if (claimBtn) {
        claimBtn.onclick = function () {
          stopAllSpeech();
          var rModal = document.getElementById('kidsAcademyRewardModal');
          if (rModal && rModal.parentNode) rModal.parentNode.removeChild(rModal);

          setTimeout(function () {
            launchShakirTourDirectly();
          }, 60);
        };
      }
    } else {
      launchShakirTourDirectly();
    }
  }

  // ---------------------------------------------------------------------------
  // Floating Instruction Point Button on Farm UI (Icon Only + Hover Info)
  // ---------------------------------------------------------------------------
  function renderInstructionPointButton() {
    ensureAcademyStyles();
    if (document.getElementById('kidsAcademyInstructionPoint')) return;

    var point = document.createElement('div');
    point.id = 'kidsAcademyInstructionPoint';
    point.className = 'kids-academy-instruction-point';
    point.innerHTML =
      '<button type="button" class="instruction-point-icon-btn" id="btnKidsAcademyTrigger" aria-label="Kids Eco-Academy: Professor Whisker Puff &amp; Pip Squeak-a-Link">' +
        '<span class="ip-char-pair">🐱🐭</span>' +
        '<span class="ip-pulse-ring"></span>' +
      '</button>' +
      '<div class="instruction-point-tooltip" role="tooltip">' +
        '<div class="ip-tooltip-badge">🎓 KIDS ECO-ACADEMY</div>' +
        '<div class="ip-tooltip-title">Professor Whisker Puff &amp; Pip Squeak-a-Link</div>' +
        '<div class="ip-tooltip-desc">Interactive Biosphere Masterplan &amp; Game Guide: Learn how to proceed, maximize O₂, explore 10 global biomes, and uncover hidden treasures!</div>' +
        '<div class="ip-tooltip-reward">🏆 Watch thoroughly to claim €200 Game Euro Grant + 150 XP!</div>' +
        '<div class="ip-tooltip-callout">Click icon to open orientation ➔</div>' +
      '</div>';

    var btn = point.querySelector('#btnKidsAcademyTrigger');
    if (btn) {
      btn.onclick = function (e) {
        if (e) e.stopPropagation();
        openAcademyModal();
      };
    }

    document.body.appendChild(point);
  }

  // ---------------------------------------------------------------------------
  // Auto-Trigger on Game Starting Before Shakir Tour
  // ---------------------------------------------------------------------------
  function triggerOnFarmStart(onCompleteOrSkip) {
    if (AcademyState.isOpen || document.getElementById('kidsAcademyModal') || document.getElementById('kidsAcademyHandoverModal')) {
      return true;
    }
    var played = sessionStorage.getItem('searchO2_academy_video_played');
    if (!played) {
      sessionStorage.setItem('searchO2_academy_video_played', '1');
      openAcademyModal({
        isStarting: true,
        onCompleteOrSkip: onCompleteOrSkip
      });
      return true;
    }
    return false;
  }

  var KidsSustainabilityAcademy = {
    isOpen: function () {
      return !!(AcademyState.isOpen && document.getElementById('kidsAcademyModal'));
    },
    openAcademyModal: openAcademyModal,
    closeAcademyModal: closeAcademyModal,
    openHandoverTransitionModal: openHandoverTransitionModal,
    closeHandoverModal: closeHandoverModal,
    launchShakirTourDirectly: launchShakirTourDirectly,
    triggerOnFarmStart: triggerOnFarmStart,
    renderInstructionPointButton: renderInstructionPointButton,
    stopAllSpeech: stopAllSpeech,
    playPuffCatSFX: playPuffCatSFX,
    playPipMouseSFX: playPipMouseSFX,
    getWhiskerPuffSvg: getWhiskerPuffSvg,
    getPipSvg: getPipSvg
  };

  global.KidsSustainabilityAcademy = KidsSustainabilityAcademy;
  global.openKidsSustainabilityAcademy = function () {
    openAcademyModal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderInstructionPointButton);
  } else {
    renderInstructionPointButton();
  }

})(typeof window !== 'undefined' ? window : this);
