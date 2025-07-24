export default class View {
  constructor() {
    this.mainMenuModal = new bootstrap.Modal("#main-menu-modal");
    this.resultModal = new bootstrap.Modal("#result-modal");
  }

  el(selector) {
    return document.querySelector(selector);
  }

  els(selector) {
    return document.querySelectorAll(selector);
  }

  setInputStatus(state, text) {
    const el = this.el("#country-name-input-status");
    el.classList.remove("text-bg-success", "text-bg-danger", "text-bg-primary");

    if (state === "correct") {
      el.classList.add("text-bg-success");
    }

    if (state === "wrong") {
      el.classList.add("text-bg-danger");
    }

    if (state === "idle") {
      el.classList.add("text-bg-primary");
    }

    el.textContent = text;
  }

  resetAccordionHintsState() {
    const accordions = this.els(".accordion-collapse");
    const buttons = this.els(".accordion-button");

    accordions[0].classList.add("show");
    buttons[0].classList.remove("collapsed");

    for (let i = 1; i < accordions.length; i++) {
      accordions[i].classList.remove("show");
      buttons[i].classList.add("collapsed");
    }
  }

  startGameButtonState(gameStarted) {
    if (gameStarted) {
      this.el("#start-game-btn").textContent = "Stop Game";
      this.el("#start-game-btn").classList.replace("btn-success", "btn-danger");
    } else {
      this.el("#start-game-btn").textContent = "Start Game";
      this.el("#start-game-btn").classList.replace("btn-danger", "btn-success");
    }
  }

  reset() {
    this.startGameButtonState(false);
    this.setCurrentGameStateData({ level: 1, stage: "Easy", timer: 60 });
    this.setGameResultData("N/A", "N/A", "N/A");
    this.setCurrentCountryData("over");
    this.setViewState("over");
    this.setInputStatus("idle", "Waiting for an input");
  }

  setCurrentGameStateData({ level, stage, timer }) {
    if (level) this.el("#game-current-level").textContent = `Level ${level}`;
    if (stage) this.el("#game-current-stage").textContent = stage;
    if (timer) this.el("#game-current-timer").textContent = `${timer} sec`;
  }

  setGameResultData(stage, wrong, level) {
    this.el("#game-result-reached-stage").textContent = stage;
    this.el("#game-result-wrong-guess").textContent = wrong;
    this.el("#game-result-level").textContent = level;
  }

  setCurrentCountryData(iso, hint, landmark, food, continent) {
    if (iso === "over") {
      this.el("#output-current-flag").removeAttribute("src");
      this.el("#output-current-hint").textContent = "N/A";
      this.el("#output-current-landmark").textContent = "N/A";
      this.el("#output-current-food").textContent = "N/A";
      this.el("#output-current-continent").textContent = "N/A";

      this.el("#output-hint-food-img").removeAttribute("src");
      this.el("#output-hint-landmark-img").removeAttribute("src");
      return;
    }

    this.el("#output-current-flag").src = `./assets/flags/${iso.toLowerCase()}.png`;
    this.el("#output-current-hint").textContent = hint;
    this.el("#output-current-landmark").textContent = landmark;
    this.el("#output-current-food").textContent = food;
    this.el("#output-current-continent").textContent = continent;

    this.el("#output-hint-food-img").src = `./assets/hints/${iso}/food.jpeg`;
    this.el("#output-hint-landmark-img").src = `./assets/hints/${iso}/landmark.jpeg`;
  }

  setViewState(state) {
    document.body.classList.remove("game-state-on-landing", "game-state-on-started", "game-state-on-relanding");
    if (state !== "over") document.body.classList.add(state);
  }

  showModal(modalType, bool) {
    if (modalType === "main-menu") {
      bool ? this.mainMenuModal.show() : this.mainMenuModal.hide();
      return;
    }

    bool ? this.resultModal.show() : this.resultModal.hide();
  }

  async resetMap(callback) {
    await this.#resetViewBox();
    callback();
  }

  jumpToMap(countryISO, callback) {
    setTimeout(async () => {
      const el = this.mapSVGElement.querySelector(`#${countryISO}`);

      await this.#jumpToSpesificViewBox(el);
      callback();
    }, 2000);
  }

  async #jumpToSpesificViewBox(el) {
    if (!this.mapSVGElement || !el) {
      console.warn("Country is not found!");
      return;
    }

    this.mapSVGElement.querySelectorAll(".highlighted").forEach((e) => e.classList.remove("highlighted"));
    el.classList.add("highlighted");

    const bbox = el.getBBox();
    const padding = 10;

    const targetViewBox = {
      x: bbox.x - padding,
      y: bbox.y - padding,
      w: bbox.width + padding * 2,
      h: bbox.height + padding * 2,
    };

    await this.#animateViewBox(this.#getCurrentViewBox(), targetViewBox); // nunggu selesai dulu ya~
  }

  #getCurrentViewBox() {
    const v = this.mapSVGElement.viewBox.baseVal;
    return { x: v.x, y: v.y, w: v.width, h: v.height };
  }

  #animateViewBox(from, to, duration = 1500) {
    return new Promise((resolve) => {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const fps = isMobile ? 15 : 30;

      const interval = 1000 / fps;
      const easeInOutExpo = (t) => {
        return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
      };

      const start = performance.now();
      let lastFrame = start;

      const step = (now) => {
        const elapsed = now - start;
        const sinceLastFrame = now - lastFrame;

        if (sinceLastFrame >= interval) {
          lastFrame = now;

          const t = Math.min(elapsed / duration, 1);
          const ease = easeInOutExpo(t);

          const x = from.x + (to.x - from.x) * ease;
          const y = from.y + (to.y - from.y) * ease;
          const w = from.w + (to.w - from.w) * ease;
          const h = from.h + (to.h - from.h) * ease;

          this.mapSVGElement.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
        }

        if (elapsed < duration) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }

  async #resetViewBox() {
    if (!this.mapSVGElement || !this.defaultViewBox) return;

    this.mapSVGElement.querySelectorAll(".highlighted").forEach((e) => e.classList.remove("highlighted"));
    await this.#animateViewBox(this.#getCurrentViewBox(), this.defaultViewBox);
  }
}
