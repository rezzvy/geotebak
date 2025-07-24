const mainMenuModal = new bootstrap.Modal("#main-menu-modal");
const resultModal = new bootstrap.Modal("#result-modal");
const startGameButton = document.getElementById("start-game-btn");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

document.querySelectorAll(".lang-switcher-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let currentActive = document.querySelector(".lang-switcher-btn:not(.border-0)");
    if (currentActive && currentActive !== e.target) {
      currentActive.classList.add("border-0");
    }

    e.target.classList.remove("border-0");

    currentLang = e.target.dataset.lang;
  });
});

mainMenuModal._element.addEventListener("hidden.bs.modal", () => {
  if (document.body.classList.contains("game-state-on-started") && interval === null) {
    interval = setInterval(() => {
      intervalCallback();
    }, 500);
  }
});

const currentFlagElement = document.getElementById("output-current-flag");
const currentHintElement = document.getElementById("output-current-hint");
const currentLandmarkElement = document.getElementById("output-current-landmark");
const currentFoodElement = document.getElementById("output-current-food");
const currentContinentElement = document.getElementById("output-current-continent");

const gameTimerElement = document.getElementById("game-current-timer");
const gameLevelElement = document.getElementById("game-current-level");
const gameStageElement = document.getElementById("game-current-stage");

const gameResultReachedStageElement = document.getElementById("game-result-reached-stage");
const gameResultWrongGuessElement = document.getElementById("game-result-wrong-guess");
const gameResultLevelElement = document.getElementById("game-result-level");

const foodHintImgElement = document.getElementById("output-hint-food-img");
const landmarkHintImgElement = document.getElementById("output-hint-landmark-img");

const countryNameInputElement = document.getElementById("country-name-input");
const countryNameInputStatus = document.getElementById("country-name-input-status");

const gamePlayMenuButton = document.getElementById("gameplay-manu-btn");

gamePlayMenuButton.addEventListener("click", (e) => {
  clearInterval(interval);
  interval = null;
  mainMenuModal.show();
});

const goBackToMainMenuButton = document.getElementById("go-back-to-main-menu-btn");
const playAgainButton = document.getElementById("play-again-btn");
playAgainButton.addEventListener("click", async (e) => {
  resultModal.hide();
  reZoom(true, "", async () => {
    document.body.classList.add("game-state-on-landing");
    currentCountry = getRandomDatasetItem();

    if (currentCountry) {
      updateCurrentCountryInfo;

      foodHintImgElement.src = `./assets/hints/${currentCountry.iso}/food.jpeg`;
      landmarkHintImgElement.src = `./assets/hints/${currentCountry.iso}/landmark.jpeg`;

      startPingEffect(currentCountry.iso);
    }
  });
});

goBackToMainMenuButton.addEventListener("click", (e) => {
  resultModal.hide();
  reZoom(true, "", () => {
    mainMenuModal.show();
  });
});

countryNameInputElement.addEventListener("input", (e) => {
  if (currentCountry === null) return;

  const currentName = currentCountry.name[currentLang];
  document.title = currentName;
  const val = e.target.value.trim();

  if (currentName.toLowerCase() === val.toLowerCase()) {
    if (interval) clearInterval(interval);
    timer = 60;
    countryNameInputStatus.classList.replace("text-bg-danger", "text-bg-success");
    countryNameInputStatus.classList.replace("text-bg-primary", "text-bg-success");
    countryNameInputStatus.textContent = "CORRECT";
    level++;
    gameLevelElement.textContent = `Level ${level}`;
    gameStageElement.textContent = `${stage}`;
    currentCountry = getRandomDatasetItem();
    reZoom(false, currentCountry.iso);
  } else {
    countryNameInputStatus.classList.replace("text-bg-primary", "text-bg-danger");
    countryNameInputStatus.textContent = "WRONG";
  }

  if (val === "") {
    countryNameInputStatus.classList.replace("text-bg-danger", "text-bg-primary");
    countryNameInputStatus.classList.replace("text-bg-primary", "text-bg-primary");
    countryNameInputStatus.textContent = "N/A";
  }
});

let svgRoot = null;
let initialViewBox = null;
let currentCountry = null;
let currentLang = "en";

let level = 1;
let stage = "easy";
let timer = 60;
let interval = null;

const STAGE_ORDER = ["easy", "medium", "insane", "hardcore"];
let stageCategory = {
  easy: [
    "ID",
    "MY",
    "SG",
    "JP",
    "CN",
    "IN",
    "TH",
    "VN",
    "KR",
    "KP",
    "PH",
    "SA",
    "AE",
    "TR",
    "IR",
    "IQ",
    "IL",
    "RU",
    "GB",
    "FR",
    "DE",
    "IT",
    "ES",
    "PT",
    "NL",
    "US",
    "CA",
    "MX",
    "BR",
    "AR",
    "AU",
    "EG",
    "PK",
    "BD",
  ],
  medium: [
    "AF",
    "MM",
    "NP",
    "LK",
    "LA",
    "KH",
    "QA",
    "JO",
    "KZ",
    "UZ",
    "GE",
    "AM",
    "AZ",
    "LB",
    "OM",
    "YE",
    "SY",
    "KW",
    "PS",
    "CY",
    "BT",
    "MV",
    "BN",
    "MN",
    "TL",
    "PL",
    "UA",
    "GR",
    "RO",
    "HU",
    "CZ",
    "SE",
    "CH",
    "NO",
    "DK",
    "FI",
    "AT",
    "BE",
    "IE",
    "NZ",
    "CO",
    "CL",
    "PE",
    "EC",
    "ZA",
    "MA",
    "NG",
    "KE",
    "TZ",
    "DZ",
    "LY",
    "ZW",
    "CU",
    "DO",
  ],
  insane: [
    "TJ",
    "KG",
    "TM",
    "LU",
    "SI",
    "SK",
    "HR",
    "RS",
    "MK",
    "ME",
    "MD",
    "BA",
    "MT",
    "IS",
    "EE",
    "LV",
    "LT",
    "AD",
    "SM",
    "VA",
    "BB",
    "BS",
    "TT",
    "PA",
    "HN",
    "GT",
    "NI",
    "CR",
    "SV",
    "UY",
    "PY",
    "BO",
    "GY",
    "SR",
    "PG",
    "FJ",
    "WS",
    "SB",
    "FM",
    "PW",
    "MH",
    "KI",
    "TV",
    "VU",
  ],
  hardcore: [
    "KM",
    "DJ",
    "ER",
    "SZ",
    "GA",
    "GN",
    "GW",
    "GQ",
    "ST",
    "BF",
    "BJ",
    "TG",
    "TD",
    "CF",
    "LS",
    "MW",
    "MR",
    "SC",
    "SL",
    "SS",
    "SD",
    "ZM",
    "RW",
    "LR",
    "GM",
    "NE",
    "ML",
    "NA",
    "BW",
    "CV",
    "MZ",
    "AO",
    "CD",
    "CG",
    "AG",
    "DM",
    "HT",
    "KN",
    "LC",
    "VC",
    "NR",
    "BZ",
    "MC",
    "LI",
    "TL",
  ],
};

function getRandomDatasetItem() {
  const availableISO = stageCategory[stage];
  const remaining = availableISO.filter((iso) => !NOT_AVAILABLE_DATASET.includes(iso));

  if (remaining.length === 0) {
    const currentStageIndex = STAGE_ORDER.indexOf(stage);
    const nextStage = STAGE_ORDER[currentStageIndex + 1];

    if (nextStage) {
      stage = nextStage;

      return getRandomDatasetItem();
    } else {
      return null;
    }
  }

  const randomIndex = Math.floor(Math.random() * remaining.length);
  const pickedISO = remaining[randomIndex];
  NOT_AVAILABLE_DATASET.push(pickedISO);

  const countryData = DATASET.find((item) => item.iso === pickedISO);
  return countryData;
}

async function startPingEffect(finalTargetId) {
  await sleep(2000);

  const el = svgRoot.querySelector(`#${finalTargetId}`);
  goJump(el);

  await sleep(1500);

  updateCurrentCountryInfo();
  document.body.classList.replace("game-state-on-landing", "game-state-on-started");

  gameTimerElement.textContent = `${timer} sec`;
  interval = setInterval(() => {
    intervalCallback();
  }, 100);
}

function resetState() {
  gameLevelElement.textContent = `Level 1`;
  gameStageElement.textContent = `Easy`;

  timer = 60;
  level = 1;
  stage = "easy";

  currentCountry = null;
  test(false);
}

function intervalCallback() {
  if (timer <= 0) {
    clearInterval(interval);
    gameResultLevelElement.textContent = level;
    gameResultReachedStageElement.textContent = stage;
    gameResultWrongGuessElement.textContent = currentCountry.name[currentLang];
    resultModal.show();
    resetState();

    return;
  }

  timer -= 1;
  gameTimerElement.textContent = `${timer} sec`;
}

function getCurrentViewBox() {
  const v = svgRoot.viewBox.baseVal;
  return { x: v.x, y: v.y, w: v.width, h: v.height };
}

function easeInOutExpo(t) {
  return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

function animateViewBox(from, to, duration = 800) {
  const start = performance.now();

  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = easeInOutExpo(t);

    const x = from.x + (to.x - from.x) * ease;
    const y = from.y + (to.y - from.y) * ease;
    const w = from.w + (to.w - from.w) * ease;
    const h = from.h + (to.h - from.h) * ease;

    svgRoot.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);

    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function animateViewBox(from, to, duration = 1500) {
  const startTime = performance.now();

  function animate(time) {
    const t = Math.min((time - startTime) / duration, 1);
    const ease = easeInOutExpo(t);

    const x = from.x + (to.x - from.x) * ease;
    const y = from.y + (to.y - from.y) * ease;
    const w = from.w + (to.w - from.w) * ease;
    const h = from.h + (to.h - from.h) * ease;

    svgRoot.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);

    if (t < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function goJump(el) {
  if (!svgRoot || !el) {
    console.warn("Negara tidak ditemukan.");
    return;
  }

  svgRoot.querySelectorAll(".highlighted").forEach((e) => e.classList.remove("highlighted"));
  el.classList.add("highlighted");

  const bbox = el.getBBox();
  const padding = 10;

  const targetViewBox = {
    x: bbox.x - padding,
    y: bbox.y - padding,
    w: bbox.width + padding * 2,
    h: bbox.height + padding * 2,
  };

  animateViewBox(getCurrentViewBox(), targetViewBox);
}

function resetZoom() {
  if (!svgRoot || !initialViewBox) return;

  svgRoot.querySelectorAll(".highlighted").forEach((e) => e.classList.remove("highlighted"));
  animateViewBox(getCurrentViewBox(), initialViewBox);
}

function test(gameStarted) {
  if (gameStarted) {
    startGameButton.textContent = "Stop Game";
    startGameButton.classList.replace("btn-success", "btn-danger");
  } else {
    startGameButton.textContent = "Start Game";
    startGameButton.classList.replace("btn-danger", "btn-success");
  }
}

startGameButton.addEventListener("click", async (e) => {
  const currentState = document.body.classList.contains("game-state-on-started");
  test(!currentState);
  if (!currentState) {
    mainMenuModal.hide();
    document.body.classList.add("game-state-on-landing");

    currentCountry = getRandomDatasetItem();

    if (currentCountry) {
      updateCurrentCountryInfo;

      foodHintImgElement.src = `./assets/hints/${currentCountry.iso}/food.jpeg`;
      landmarkHintImgElement.src = `./assets/hints/${currentCountry.iso}/landmark.jpeg`;

      startPingEffect(currentCountry.iso);
    }

    return;
  }

  resetState();
  clearInterval(interval);
  mainMenuModal.hide();
  reZoom(true, "", () => {
    mainMenuModal.show();
  });
});

function updateCurrentCountryInfo() {
  currentFlagElement.src = `./assets/flags/${currentCountry.iso.toLowerCase()}.png`;
  currentHintElement.textContent = currentCountry.hint[currentLang];
  currentLandmarkElement.textContent = currentCountry.landmark[currentLang];
  currentFoodElement.textContent = currentCountry.food[currentLang];
  currentContinentElement.textContent = currentCountry.continent[currentLang];

  foodHintImgElement.src = `./assets/hints/${currentCountry.iso}/food.jpeg`;
  landmarkHintImgElement.src = `./assets/hints/${currentCountry.iso}/landmark.jpeg`;

  countryNameInputElement.value = "";
  countryNameInputStatus.textContent = "N/A";
  countryNameInputStatus.classList.replace("text-bg-success", "text-bg-primary");
  countryNameInputStatus.classList.replace("text-bg-danger", "text-bg-primary");
}

document.addEventListener("DOMContentLoaded", (e) => {
  mainMenuModal.show();
  fetch("./assets/world.svg")
    .then((res) => res.text())
    .then((svgText) => {
      document.getElementById("map-overlay").innerHTML = svgText;
      svgRoot = document.querySelector("#map-overlay svg");

      if (!svgRoot.hasAttribute("viewBox")) {
        const bbox = svgRoot.getBBox();
        svgRoot.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
      }

      const viewBoxAttr = svgRoot.getAttribute("viewBox").split(" ").map(Number);
      initialViewBox = {
        x: viewBoxAttr[0],
        y: viewBoxAttr[1],
        w: viewBoxAttr[2],
        h: viewBoxAttr[3],
      };
    });
});

async function reZoom(reset, destination, onReset) {
  document.body.classList.replace("game-state-on-started", "game-state-on-relanding");
  await sleep(500);
  resetZoom();
  await sleep(1500);

  if (reset) {
    document.body.classList.remove("game-state-on-relanding");
    onReset();
  } else {
    document.body.classList.replace("game-state-on-relanding", "game-state-on-landing");
    startPingEffect(destination);
  }
}
