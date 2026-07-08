const typ = document.getElementById("typ");
const err = document.getElementById("err");
const ui = document.getElementById("ui");
const cm = document.getElementById("cm");

replaceTyp().then(replaceUi).then(rebuild);
document.addEventListener("input", rebuild);
window.addEventListener("resize", rebuild);
document.addEventListener("scroll", replaceUi);

function rebuild() {
  replaceTyp(getUiValues()).then(replaceUi);
}

function getDefaultValues() {
  const element = Array.from(
    typ.querySelectorAll("[data-typst-label]"),
  ).find((el) => el.dataset.typstLabel.startsWith("typui.init:"));
  return JSON.parse(
    element.dataset.typstLabel.replace("typui.init:", ""),
  );
}

async function replaceUi() {
  const defaultValues = getDefaultValues();

  const requested = Array.from(typ.querySelectorAll("[data-typst-label]"))
    .filter((el) => el.dataset.typstLabel.startsWith("typui-"))
    .map((el) => {
      const label = el.dataset.typstLabel.replace("typui-", "");
      const text = Array.from(el.querySelectorAll(".typst-text"));
      const color = text[0]?.firstElementChild?.getAttribute("fill") || undefined;

      if (label.slice(0, 3) !== "chk") {
        text.forEach(el => el.remove())
      }

      return {
        bounds: el.getBoundingClientRect(),
        label,
        color,
        defaultVal: defaultValues[label.slice(4)],
      };
    });
  const real = Array.from(ui.children);

  real
    .filter(
      (element) =>
        !requested.map(({ label }) => label).includes(element.id),
    )
    .map((element) => element.remove());
  requested.map(updateUiElement);
}

function getUiValues() {
  const pairs = Array.from(ui.children)
    .map((element) => {
      const name = element.id.slice(4);
      if (element.type === "number") {
        return `${name}: ${element.value || "0"}`;
      } else if (element.type === "checkbox") {
        return `${name}: ${element.checked || false}`;
      } else if (element.tagName === "TEXTAREA") {
        return `${name}: "${element.value || ""}"`;
      } else {
        return false;
      }
    })
    .filter(Boolean);

  const system = [
    `window-width: ${window.innerWidth}`,
    `window-height: ${window.innerHeight}`,
    `cm: ${cm.clientWidth}`,
  ]

  return (
    "#let fields = (\n" +
    "  ..fields,\n" +
    pairs.map((line) => "  " + line).join(",\n") +
    ",\n" +
    system.map((line) => "  " + line).join(",\n") +
    "\n)"
  );
}

function updateUiElement({ label, bounds, defaultVal, color }) {
  const element =
    ui.querySelector("#" + label) || createUiElement(label, defaultVal);
  element.style.position = "fixed";
  if (color) {
    element.style.color = color;
  }
  element.style.top = bounds.top + "px";
  element.style.left = bounds.left + "px";
  element.style.width = bounds.width + "px";
  if (label.startsWith("txt")) {
    element.style.minHeight = bounds.height + "px";
  } else {
    element.style.height = bounds.height + "px";
  }
  const lines = element.value?.split("\n")?.length || 1
  const correction = lines === 1 ? 0.7 : lines
  element.style.fontSize = bounds.height / correction + "px";
}

function createUiElement(id, value) {
  const kind = id.slice(0, 3);
  let element;

  if (kind === "num") {
    element = document.createElement("input");
    element.type = "number";
    element.value = value;
  } else if (kind === "chk") {
    element = document.createElement("input");
    element.type = "checkbox";
    element.checked = value;
  } else if (kind === "txt") {
    element = document.createElement("textarea");
    element.value = value;
  } else {
    element = document.createElement("input");
    element.type = "text";
    element.value = value;
  }

  element.id = id;
  ui.appendChild(element);
  return element;
}

async function replaceTyp(body) {
  const response = await fetch("/compile", {
    method: "POST",
    body: body || "// typui: no input provided",
  });
  const text = await response.text();

  if (text.startsWith("<pre>")) {
    err.innerHTML = text
  } else {
    typ.innerHTML = text
  }
}
