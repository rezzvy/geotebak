export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async init() {
    if (this.model.isOnMobileDevice()) document.body.classList.add("on-mobile");

    await this.#fetchDataset();
    await this.#fetchMapSVG();

    this.view.showModal("main-menu", true);
    this.view.els(".lang-switcher-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let currentActive = this.view.el(".lang-switcher-btn:not(.border-0)");
        if (currentActive && currentActive !== e.target) {
          currentActive.classList.add("border-0");
        }

        e.target.classList.remove("border-0");
        this.model.lang = e.target.dataset.lang;
      });
    });

    this.view.el("#gameplay-manu-btn").addEventListener("click", (e) => {
      this.model.isGamePaused = true;
      clearInterval(this.model.interval);

      this.view.showModal("main-menu", true);
    });

    this.view.mainMenuModal._element.addEventListener("hidden.bs.modal", () => {
      if (this.model.isGamePaused) {
        this.model.isGamePaused = false;
        this.model.interval = this.generateInterval();
      }
    });

    this.view.el("#play-again-btn").addEventListener("click", (e) => {
      this.view.showModal("result", false);

      this.reset(() => {
        this.view.setViewState("game-state-on-landing");
        this.jump();
      });
    });

    this.view.el("#go-back-to-main-menu-btn").addEventListener("click", (e) => {
      this.view.showModal("result", false);

      this.start(false);
    });

    this.view.el("#country-name-input").addEventListener("input", (e) => {
      if (!this.model.isGameStarted) return;

      const val = e.target.value.trim();

      if (val === "") {
        this.view.setInputStatus("idle", "Waiting for an input");
        return;
      }

      if (this.model.timer > 0 && this.model.isGivenCountryNameCorrect(val)) {
        clearInterval(this.model.interval);

        this.view.el("#country-name-input").blur();
        this.view.setInputStatus("correct", "The answer is correct");
        this.model.level += 1;

        this.view.setViewState("game-state-on-relanding");
        this.view.resetMap(() => {
          this.view.setViewState("game-state-on-landing");
          this.jump();
        });

        return;
      }

      this.view.setInputStatus("wrong", "The answer is wrong");
    });

    this.view.el("#start-game-btn").addEventListener("click", (e) => {
      this.start(!this.model.isGameStarted);
    });
  }

  jump() {
    this.model.timer = 60;
    this.view.setCurrentGameStateData({ timer: this.model.timer });
    this.view.resetAccordionHintsState();

    this.view.el("#country-name-input").value = "";
    this.view.el("#country-name-input").blur();

    const { iso, name, hint, landmark, food, continent } = this.model.getRandomCountry();
    this.view.setCurrentCountryData(iso, hint, landmark, food, continent);
    this.view.setCurrentGameStateData({ stage: this.model.stage, level: this.model.level });

    this.view.jumpToMap(iso, () => {
      this.model.country = name;

      this.view.setViewState("game-state-on-started");
      this.view.el("#country-name-input").focus();
      this.view.setInputStatus("idle", "Waiting for an input");

      this.model.interval = this.generateInterval();
    });
  }

  generateInterval() {
    if (this.model.interval) clearInterval(this.model.interval);

    return setInterval(() => {
      if (this.model.timer <= 0) {
        clearInterval(this.model.interval);

        this.view.setGameResultData(this.model.stage, this.model.country, this.model.level);
        this.view.showModal("result", true);

        return;
      }

      this.model.timer -= 1;
      this.view.setCurrentGameStateData({ timer: this.model.timer });
    }, 1000);
  }

  start(bool) {
    this.view.showModal("main-menu", false);
    this.view.showModal("result", false);

    if (bool) {
      this.model.isGameStarted = true;
      this.view.startGameButtonState(true);

      this.view.setViewState("game-state-on-landing");
      this.jump();
      return;
    }

    this.model.isGameStarted = false;
    this.reset(() => {
      this.model.reset();
      this.view.reset();
      this.view.showModal("main-menu", true);
    });
  }

  reset(callback) {
    this.model.reset();
    this.view.reset();
    this.view.setViewState("game-state-on-relanding");

    this.view.resetMap(() => {
      callback();
    });
  }

  async #fetchDataset() {
    const [dataset, stageCategory] = await Promise.all([
      fetch("./src/json/dataset.json").then((res) => res.json()),
      fetch("./src/json/stage.json").then((res) => res.json()),
    ]);

    this.model.dataset = dataset;
    this.model.stageCategory = stageCategory[0];
  }

  async #fetchMapSVG() {
    const res = await fetch("./assets/world.svg");
    const svgText = await res.text();

    this.view.el("#map-overlay").innerHTML = svgText;
    this.view.mapSVGElement = document.querySelector("#map-overlay svg");

    if (!this.view.mapSVGElement.hasAttribute("viewBox")) {
      const bbox = this.view.mapSVGElement.getBBox();
      this.view.mapSVGElement.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    }

    const [x, y, w, h] = this.view.mapSVGElement.getAttribute("viewBox").split(" ").map(Number);
    this.view.defaultViewBox = { x, y, w, h };
  }
}
