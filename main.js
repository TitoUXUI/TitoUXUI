"use strict";

/* =========================================================
   Nicolás — Portfolio UX/UI
   main.js: escena POV (hotspots, cursor, transición) +
   portfolio (audiencia, tema, audio narrado).
   ========================================================= */

(function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var prefersFinePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------------------------------------------------------
     TEMA (claro / oscuro)
     El valor inicial ya se aplicó inline en <head> para evitar
     flash. Acá solo cableamos el toggle y su persistencia.
     --------------------------------------------------------- */
  var THEME_KEY = "tito-theme";
  var themeToggle = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggle) {
      var isLight = theme === "light";
      themeToggle.setAttribute("aria-pressed", String(isLight));
      var labelEl = themeToggle.querySelector(".label-text");
      if (labelEl) {
        labelEl.textContent = isLight ? "Modo oscuro" : "Modo claro";
      }
    }
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* localStorage no disponible (modo privado, etc.): la preferencia
         simplemente no persiste entre visitas. */
    }
  }

  applyTheme(document.documentElement.getAttribute("data-theme") || "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";
      applyTheme(next);
      storeTheme(next);
    });
  }

  /* ---------------------------------------------------------
     CURSOR CUSTOM
     Guía visual constante; en pantallas táctiles se desactiva
     y las etiquetas de los hotspots quedan siempre visibles
     como fallback (ver styles.css, media pointer:coarse).
     --------------------------------------------------------- */
  var cursorEl = document.getElementById("custom-cursor");
  var cursorLabel = cursorEl ? cursorEl.querySelector(".cursor-label") : null;

  if (cursorEl && prefersFinePointer) {
    document.body.classList.add("has-custom-cursor");

    document.addEventListener("mousemove", function (e) {
      cursorEl.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px)";
    });

    document.addEventListener("mouseover", function (e) {
      var target = e.target.closest("[data-cursor-text]");
      if (target) {
        cursorEl.classList.add("is-active");
        if (cursorLabel) cursorLabel.textContent = target.getAttribute("data-cursor-text");
      }
    });

    document.addEventListener("mouseout", function (e) {
      var target = e.target.closest("[data-cursor-text]");
      if (target && !e.relatedTarget) {
        cursorEl.classList.remove("is-active");
      } else if (target && e.relatedTarget && !e.relatedTarget.closest("[data-cursor-text]")) {
        cursorEl.classList.remove("is-active");
      }
    });

    document.addEventListener("mouseleave", function () {
      cursorEl.classList.remove("is-active");
    });
  }

  /* ---------------------------------------------------------
     ESCENA POV: hotspots + paneles
     --------------------------------------------------------- */
  var panelOverlay = document.getElementById("panel-overlay");
  var hotspots = Array.prototype.slice.call(document.querySelectorAll(".hotspot[data-panel]"));
  var lastFocusedTrigger = null;

  function getPanel(id) {
    return document.getElementById(id);
  }

  function openPanel(panelId, trigger) {
    var panel = getPanel(panelId);
    if (!panel || !panelOverlay) return;

    lastFocusedTrigger = trigger || document.activeElement;

    Array.prototype.forEach.call(panelOverlay.querySelectorAll(".panel"), function (p) {
      p.hidden = p.id !== panelId;
      p.classList.toggle("is-current", p.id === panelId);
    });

    panelOverlay.hidden = false;
    // Forzar reflow para que la transición de apertura corra.
    void panelOverlay.offsetWidth;
    panelOverlay.classList.add("is-open");

    var heading = panel.querySelector("h2");
    (heading || panel).setAttribute("tabindex", "-1");
    (heading || panel).focus();

    document.addEventListener("keydown", onPanelKeydown);
  }

  function closePanel() {
    if (!panelOverlay || panelOverlay.hidden) return;
    panelOverlay.classList.remove("is-open");
    panelOverlay.hidden = true;
    Array.prototype.forEach.call(panelOverlay.querySelectorAll(".panel"), function (p) {
      p.hidden = true;
      p.classList.remove("is-current");
    });
    document.removeEventListener("keydown", onPanelKeydown);
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === "function") {
      lastFocusedTrigger.focus();
    }
  }

  function onPanelKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closePanel();
      return;
    }
    if (e.key === "Tab") {
      var currentPanel = panelOverlay.querySelector(".panel.is-current");
      if (!currentPanel) return;
      var focusable = currentPanel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  hotspots.forEach(function (hotspot) {
    hotspot.addEventListener("click", function () {
      openPanel(hotspot.getAttribute("data-panel"), hotspot);
    });
  });

  if (panelOverlay) {
    panelOverlay.addEventListener("click", function (e) {
      if (e.target === panelOverlay) closePanel();
    });
    Array.prototype.forEach.call(panelOverlay.querySelectorAll(".panel-close"), function (btn) {
      btn.addEventListener("click", closePanel);
    });
  }

  /* ---------------------------------------------------------
     Selector de mood musical (auriculares)
     Los IDs reales de playlist de Spotify se completan acá.
     Mientras estén vacíos, se muestra un placeholder en vez de
     intentar cargar un iframe hacia una URL inexistente
     (evita requests rotos y ruido en consola).
     --------------------------------------------------------- */
  var SPOTIFY_PLAYLISTS = {
    concentracion: { type: "playlist", id: "37i9dQZF1DX7EF8wVxBVhG" },
    creativa: { type: "album", id: "0LMOYhr8s4J84ALzWVGBa6" },
    tranquila: { type: "playlist", id: "37i9dQZF1DXaw68inx4UiN" }
  };

  var moodButtons = document.querySelectorAll(".mood-button");
  var moodEmbed = document.getElementById("mood-embed");

  function renderMood(mood, label) {
    if (!moodEmbed) return;
    var entry = SPOTIFY_PLAYLISTS[mood];
    if (entry && entry.id) {
      moodEmbed.innerHTML =
        '<iframe title="' +
        label +
        '" src="https://open.spotify.com/embed/' +
        entry.type +
        "/" +
        entry.id +
        '" height="152" loading="lazy" allow="encrypted-media"></iframe>';
    } else {
      moodEmbed.textContent =
        "Playlist “" + label + "” pendiente de enlace real de Spotify (ver TODO en main.js).";
    }
  }

  moodButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      moodButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
      });
      btn.setAttribute("aria-pressed", "true");
      renderMood(btn.getAttribute("data-mood"), btn.textContent.trim());
    });
  });

  /* ---------------------------------------------------------
     Transición POV -> Portfolio (click en pantalla)
     --------------------------------------------------------- */
  var screenHotspot = document.querySelector('.hotspot[data-action="enter-portfolio"]');
  var povScene = document.getElementById("pov-scene");
  var portfolio = document.getElementById("portfolio");
  var backToDeskButtons = Array.prototype.slice.call(document.querySelectorAll('[data-action="back-to-desk"]'));

  function enterPortfolio() {
    if (!portfolio) return;
    document.body.classList.add("state-portfolio");
    portfolio.hidden = false;
    var goTransition = function () {
      if (povScene) povScene.setAttribute("aria-hidden", "true");
      var navBrand = document.querySelector(".nav-brand");
      if (navBrand) navBrand.focus();
    };
    if (prefersReducedMotion) {
      goTransition();
    } else {
      window.setTimeout(goTransition, 600);
    }
  }

  function backToDeskScene() {
    document.body.classList.remove("state-portfolio");
    if (povScene) povScene.removeAttribute("aria-hidden");
    window.setTimeout(
      function () {
        if (portfolio) portfolio.hidden = true;
      },
      prefersReducedMotion ? 0 : 600
    );
  }

  if (screenHotspot) {
    screenHotspot.addEventListener("click", enterPortfolio);
  }
  backToDeskButtons.forEach(function (btn) {
    btn.addEventListener("click", backToDeskScene);
  });

  /* ---------------------------------------------------------
     Video POV: si en el futuro se agrega <video class="pov-video">
     con <source> reales (ver TODO en index.html), se muestra recién
     cuando puede reproducir; si falla, se mantiene el placeholder SVG.
     --------------------------------------------------------- */
  var povVideo = document.querySelector(".pov-video");
  if (povVideo) {
    povVideo.addEventListener("canplaythrough", function () {
      povVideo.classList.add("is-ready");
    });
    povVideo.addEventListener("error", function () {
      povVideo.remove();
    });
  }

  /* ---------------------------------------------------------
     PORTFOLIO: navegación por audiencia (radiogroup)
     --------------------------------------------------------- */
  var AUDIENCE_KEY = "tito-audience";
  var navTabs = Array.prototype.slice.call(document.querySelectorAll(".nav-tab"));
  var heroTitle = document.getElementById("hero-title");

  var AUDIENCE_COPY = {
    anyone: {
      lines: ["Hola, soy Nicolás.", "Diseño interfaces que ayudan", "a las personas sin", "hacerles pensar de más."]
    },
    recruiters: {
      lines: [
        "Diseñador UX/UI con",
        "proceso prolijo, de punta",
        "a punta, y buena comunicación",
        "con equipos de producto."
      ]
    },
    "design-leads": {
      lines: ["Pienso en sistemas,", "no en pantallas sueltas.", "Proceso claro: del research", "al detalle final."]
    },
    pm: {
      lines: [
        "Traduzco objetivos de negocio",
        "en flujos que la gente",
        "entiende a la primera.",
        "Trabajo mejor cerca del equipo."
      ]
    },
    designers: {
      lines: [
        "Dibujo a mano antes",
        "de abrir Figma. Me obsesiona",
        "el detalle, la lógica del motion",
        "y probar herramientas nuevas."
      ]
    }
  };

  function renderHero(audience, animate) {
    var data = AUDIENCE_COPY[audience] || AUDIENCE_COPY.anyone;
    var setContent = function () {
      if (heroTitle) {
        heroTitle.innerHTML = data.lines.map(function (line) {
          return "<span>" + line + "</span>";
        }).join("");
      }
    };

    if (!heroTitle || prefersReducedMotion || !animate) {
      setContent();
      if (heroTitle) heroTitle.classList.remove("is-swapping");
      return;
    }

    heroTitle.classList.add("is-swapping");
    window.setTimeout(function () {
      setContent();
      heroTitle.classList.remove("is-swapping");
    }, 180);
  }

  function selectAudience(audience, animate, persist) {
    navTabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-audience") === audience;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-checked", String(isActive));
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });
    renderHero(audience, animate);
    if (persist) {
      try {
        localStorage.setItem(AUDIENCE_KEY, audience);
      } catch (e) {
        /* sin persistencia disponible */
      }
    }
  }

  navTabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      selectAudience(tab.getAttribute("data-audience"), true, true);
    });

    tab.addEventListener("keydown", function (e) {
      var targetIndex = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") targetIndex = (index + 1) % navTabs.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") targetIndex = (index - 1 + navTabs.length) % navTabs.length;
      if (e.key === "Home") targetIndex = 0;
      if (e.key === "End") targetIndex = navTabs.length - 1;
      if (targetIndex !== null) {
        e.preventDefault();
        var nextTab = navTabs[targetIndex];
        nextTab.focus();
        selectAudience(nextTab.getAttribute("data-audience"), true, true);
      }
    });
  });

  var storedAudience = null;
  try {
    storedAudience = localStorage.getItem(AUDIENCE_KEY);
  } catch (e) {
    storedAudience = null;
  }
  selectAudience(storedAudience && AUDIENCE_COPY[storedAudience] ? storedAudience : "anyone", false, false);

  /* ---------------------------------------------------------
     Reproductor de audio narrado (accesible)
     El <audio> no tiene src en el HTML (preload="none" + data-src)
     para no disparar un request roto mientras no exista el archivo
     real; se asigna recién al primer play.
     --------------------------------------------------------- */
  var audioPlayers = Array.prototype.slice.call(document.querySelectorAll(".audio-player"));

  audioPlayers.forEach(function (player) {
    var audio = player.querySelector("audio");
    var playBtn = player.querySelector(".audio-play-toggle");
    var status = player.querySelector(".audio-status");
    var speedBtns = Array.prototype.slice.call(player.querySelectorAll(".speed-btn"));

    if (!audio || !playBtn) return;

    function setStatus(text) {
      if (status) status.textContent = text;
    }

    playBtn.addEventListener("click", function () {
      if (!audio.src) {
        var src = audio.getAttribute("data-src");
        if (!src) {
          setStatus("Narración todavía no disponible.");
          return;
        }
        audio.src = src;
      }

      if (audio.paused) {
        var playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise
            .then(function () {
              playBtn.setAttribute("aria-label", "Pausar narración");
              playBtn.classList.add("is-playing");
              setStatus("Reproduciendo…");
            })
            .catch(function () {
              setStatus("Narración todavía no disponible.");
            });
        }
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("pause", function () {
      playBtn.setAttribute("aria-label", "Reproducir narración");
      playBtn.classList.remove("is-playing");
      if (!audio.ended) setStatus("Pausado.");
    });

    audio.addEventListener("ended", function () {
      setStatus("Narración finalizada.");
      playBtn.setAttribute("aria-label", "Reproducir narración");
      playBtn.classList.remove("is-playing");
    });

    speedBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var rate = parseFloat(btn.getAttribute("data-rate"));
        audio.playbackRate = rate;
        speedBtns.forEach(function (b) {
          b.setAttribute("aria-pressed", "false");
        });
        btn.setAttribute("aria-pressed", "true");
      });
    });
  });
})();
