const root = new URL(window.location.href).searchParams.get("root") || "main.typ"

const typ = document.getElementById("typ");
const err = document.getElementById("err");
const ui = document.getElementById("ui");
const cm = document.getElementById("cm");

rebuild()
document.addEventListener("input", rebuild);
document.addEventListener("focuswithin", rebuild);
window.addEventListener("resize", rebuild);
document.addEventListener("scroll", replaceUi);

function rebuild() {
  replaceTyp(getUiValues()).then(replaceUi);
}

function getDefaultValues() {
  const element = Array.from(
    typ.querySelectorAll("[data-typst-label]"),
  ).find((el) => el.dataset.typstLabel.startsWith("typui.defaults:"));

  const raw = element.dataset.typstLabel.replace("typui.defaults:", "")
  const pairs = raw.split(";").map(pair => pair.split("="))
  return Object.fromEntries(pairs)
}

async function replaceUi() {
  const defaultValues = getDefaultValues();
  console.log(defaultValues)

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
  console.log(requested)
  requested.map(updateUiElement);
}

function getUiValues() {
  const pairs = Array.from(ui.children)
    .map((element) => {
      const name = element.id.slice(4);
      if (element.type === "number") {
        return [name, element.value || 0];
      } else if (element.type === "checkbox") {
        return [name, element.checked || false];
      } else if (element.tagName === "TEXTAREA") {
        return [name, `"${element.value || ""}"`];
      } else {
        return false;
      }
    })
    .filter(Boolean);

  const system = [
    ["window-width", window.innerWidth],
    ["window-height", window.innerHeight],
    ["cm", cm.clientWidth],
    ["focus", `"${document.activeElement?.id?.slice(4) || ""}"`],
  ]

  return "#{\n" + [
    ...pairs,
    // ...system,
  ].map(([k, v]) => `  ${k} = ${v}`)
    .join("\n") + "\n}";
}

function updateUiElement({ label, bounds, defaultVal, color }) {
  const element =
    document.getElementById(label) || createUiElement(label, defaultVal);
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
  const sendFocusChange = () => element.dispatchEvent(new CustomEvent("focuswithin", { bubbles: true }))
  element.onfocus = sendFocusChange
  element.onblur = () => setTimeout(sendFocusChange, 100)
  ui.appendChild(element);
  return element;
}

async function replaceTyp(body) {
  const response = await fetch(`/compile?root=${root}`, {
    method: "POST",
    body: body || "// typui: no input provided",
  });
  const text = await response.text();

  if (text.startsWith("<pre>")) {
    err.innerHTML = text
  } else {
    err.innerHTML = ""
    typ.innerHTML = text
  }
}
