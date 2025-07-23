const mainMenuModal = new bootstrap.Modal("#main-menu-modal");
const startGameButton = document.getElementById("start-game-btn");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let svgRoot = null;
let initialViewBox = null;

async function startPingEffect(finalTargetId) {
  await sleep(2000);

  const el = svgRoot.querySelector(`#${finalTargetId}`);
  goJump(el);

  await sleep(1500);
  document.body.classList.replace("game-state-on-landing", "game-state-on-started");
}

function getCurrentViewBox() {
  const v = svgRoot.viewBox.baseVal;
  return { x: v.x, y: v.y, w: v.width, h: v.height };
}

function easeInOutExpo(t) {
  return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
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

startGameButton.addEventListener("click", async (e) => {
  mainMenuModal.hide();
  document.body.classList.add("game-state-on-landing");

  startPingEffect("ID");
});

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

async function reZoom(reset) {
  document.body.classList.replace("game-state-on-started", "game-state-on-relanding");
  await sleep(500);
  resetZoom();
  await sleep(1500);

  if (reset) {
    document.body.classList.remove("game-state-on-relanding");
    mainMenuModal.show();
  } else {
    document.body.classList.replace("game-state-on-relanding", "game-state-on-landing");
  }
}

setTimeout(() => {
  reZoom(true);
}, 10000);
