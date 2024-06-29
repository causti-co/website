import { codeToHtml } from "https://esm.sh/shiki@1.3.0";

const HASH_LABEL = "#code=";

const $input = document.getElementById("code-input");
const $output = document.getElementById("code-output");
const $render = document.getElementById("render");
const $renderStatus = document.getElementById("render-status");
const $canvasParent = document.getElementById("graph-output");
const $share = document.getElementById("share");

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

let p5instance;

function render() {
  $render.blur();

  const code = $input.value;
  const sketch = new Function("p", `"use strict";${code};`);

  $renderStatus.innerHTML = "";

  if (p5instance) p5instance.remove();
  p5instance = new p5(sketch, $canvasParent);

  $renderStatus.innerHTML = ";; success";
}

function error(event) {
  
  $renderStatus.innerHTML = `;; error <-- { ln: ${event.lineno}, cn: ${event.colno} }\n\n${event.error}`;

  console.log(event)
  
  event.preventDefault();
}

function loadFromURL() {
  const hash = location.hash;

  if (hash.startsWith(HASH_LABEL)) {
    const lzCode = hash.slice(HASH_LABEL.length);

    $input.value = LZString.decompressFromEncodedURIComponent(lzCode);

    render();

    $renderStatus.innerHTML = ";; loaded code from clipboard";
  }
}

function share() {
  const code = $input.value;
  const lzCode = LZString.compressToEncodedURIComponent(code);

  location.hash = `${HASH_LABEL}${lzCode}`;
  navigator.clipboard.writeText(location.href);

  $renderStatus.innerHTML = ";; url copied to clipboard";
}

$input.addEventListener("input", update);
$input.addEventListener("scroll", syncScroll);
$render.addEventListener("click", render);
$share.addEventListener("click", share);
window.addEventListener("unhandledrejection", error);
window.addEventListener("error", error);

loadFromURL();
update();