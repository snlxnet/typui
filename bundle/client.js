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

  const requested = Array.from(typ.querySelectorAll("[data-typst-label]"))
    .map((el) => {
      try {
        el.querySelectorAll(".typst-text").forEach(obj => obj.remove())
        return {
          ...JSON.parse(el.dataset.typstLabel),
          bounds: el.getBoundingClientRect(),
        }
      } catch {
        return false
      }
    })
    .filter(Boolean)
    .map((el) => {

      return {
        ...el,
        defaultVal: defaultValues[el.variable],
      };
    });
  const real = Array.from(ui.children);

  real
    .filter(
      (element) =>
        !requested.map(({ variable }) => variable).includes(element.id),
    )
    .map((element) => element.remove());
  requested.map(updateUiElement);
}

function getUiValues() {
  const pairs = Array.from(ui.children)
    .map((element) => {
      const name = element.id;
      if (element.type === "number") {
        return [name, element.value || 0];
      } else if (element.type === "text") {
        return [name, '"' + (element.value || "") + '"'];
      } else if (element.type === "checkbox") {
        return [name, element.checked || false];
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

function updateUiElement(props) {
  const element =
    document.getElementById(props.variable) || createUiElement(props);
  element.style.color = props.color;
  element.style.top = props.bounds.top-2 + "px";
  element.style.left = props.bounds.left + "px";
  element.style.width = props.bounds.width + "px";
  element.style.height = props.bounds.height+4 + "px";
  element.style.fontFamily = props.font;
  element.style.fontSize = props.size;
  element.style.textAlign = props.align;
}

function createUiElement({kind, variable, defaultVal}) {
  const element = document.createElement("input");

  if (kind === "num") {
    element.type = "number";
    element.value = defaultVal;
  } else if (kind === "chk") {
    element.type = "checkbox";
    element.checked = defaultVal;
  } else if (kind === "txt") {
    element.type = "text";
    element.value = defaultVal;
  } else {
    alert("unknown element", kind)
  }

  element.id = variable;
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
