import { codeToHtml } from "https://esm.sh/shiki@1.3.0";

const RENDER_ON_ERROR = true;
const ABORT_ON_ERROR = true;
const SVGNS = "http://www.w3.org/2000/svg";
const WIDTH = 512;
const HEIGHT = 512;
const STEPS = 256;

const $input = document.getElementById("code-input");
const $output = document.getElementById("code-output");
const $render = document.getElementById("render");
const $renderStatus = document.getElementById("render-status");
const $canvas = document.getElementById("canvas");
const $downloadSVG = document.getElementById("downloadSVG");
const $downloadPNG = document.getElementById("downloadPNG");

async function update() {
  let code = $input.value;

  // Trailing newlines are ingored by <pre><code>, and cause a scrollHeight miss-match
  if (code.endsWith("\n")) {
    code += " ";
  }

  $output.innerHTML = await codeToHtml(code, {
    lang: "javascript",
    theme: "synthwave-84"
  });

  syncScroll();
}

function syncScroll() {
  const $shiki = document.querySelector(".shiki");

  $shiki.scrollTop = $input.scrollTop;
  $shiki.scrollLeft = $input.scrollLeft;
}

function render() {
  $render.blur();

  const code = $input.value;
  const step = new Function("x", "y", "props", `"use strict";${code};return step(x, y, props);`);

  $renderStatus.innerHTML = "";
  while ($canvas.firstChild) {
    $canvas.removeChild($canvas.firstChild);
  }

  const $group = document.createElementNS(SVGNS, "g");
  $group.setAttribute("stroke", "none");
  $group.setAttribute("fill", "none");

  const hsize = WIDTH / STEPS;
  const vsize = HEIGHT / STEPS;

  let errors = [];

  outter: for (let y = 0; y < STEPS; y++) {
    for (let x = 0; x < STEPS; x++) {
      const $rect = document.createElementNS(SVGNS, "rect");
      $rect.setAttribute("x", x * hsize);
      $rect.setAttribute("y", y * vsize);
      $rect.setAttribute("width", hsize);
      $rect.setAttribute("height", vsize);

      try {
        const value = step(x, y, {
          width: WIDTH,
          height: HEIGHT,
          steps: STEPS
        });

        $rect.setAttribute("fill", value ? "black" : "darkorange");
      } catch (exception) {
        errors.push({x, y, exception});

        if (ABORT_ON_ERROR) {
          break outter;
        }
      }

      $group.appendChild($rect);
    }
  }

  if (errors.length === 0 || RENDER_ON_ERROR) {
    $canvas.appendChild($group);
  }

  if (errors.length === 0) {
    $renderStatus.innerHTML = ";; success";
  } else {
    $renderStatus.innerHTML = errors.map(({x, y, exception}) =>
    `;; error <-- { x: ${x}, y: ${y} }\n\n${exception}`
    ).join("\n\n");
  }
}

function downloadSVG() {
  $downloadSVG.blur();

  const svg = $canvas.outerHTML;
  const blob = new Blob([`<?xml version="1.0" encoding="utf-8"?>\n${svg}`], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const $a = document.createElement("a");
  $a.setAttribute("download", "output.svg");
  $a.setAttribute("href", url);
  $a.style.display = "none";
  $downloadSVG.insertAdjacentElement("afterend", $a);
  $a.click();
  $a.remove();
  URL.revokeObjectURL(url);
}

function downloadPNG() {
  $downloadPNG.blur();

  const svg = $canvas.outerHTML;
  const blob = new Blob([`<?xml version="1.0" encoding="utf-8"?>\n${svg}`], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image(WIDTH, HEIGHT);
  image.src = url;

  const $png = document.createElement("canvas");
  $png.width = WIDTH;
  $png.height = HEIGHT;
  const context = $png.getContext("2d");

  image.addEventListener("load", () => {
    context.drawImage(image, 0, 0, WIDTH, HEIGHT);
    $png.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const $a = document.createElement("a");
      $a.setAttribute("download", "output.png");
      $a.setAttribute("href", url);
      $a.style.display = "none";
      $downloadPNG.insertAdjacentElement("afterend", $a);
      $a.click();
      $a.remove();
      URL.revokeObjectURL(url);  
    });
    URL.revokeObjectURL(url);
  });
}

$input.addEventListener("input", update);
$input.addEventListener("scroll", syncScroll);
$render.addEventListener("click", render);
$downloadSVG.addEventListener("click", downloadSVG);
$downloadPNG.addEventListener("click", downloadPNG);

$canvas.setAttribute("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);
update();