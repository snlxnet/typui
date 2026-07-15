type InputProps = {
  kind: "txt" | "num" | "chk";
  variable: string;
  align: "start" | "left" | "center" | "right" | "end";
  size: string;
  font: string;
  color: string;
  bounds: DOMRect;
  element: Element;
  defaultVal: string;
};
type SwapButtonProps = {
  kind: "swp";
  variable: string;
  element: Element;
  bounds: DOMRect;
};
type Props = InputProps | SwapButtonProps;

const root =
  new URL(window.location.href).searchParams.get("root") || "main.typ";

const typ = createDiv("typ");
const err = createDiv("err");
const ui = createDiv("ui");
const cm = createDiv("cm");

function createDiv(id: string) {
  const element = document.createElement("div");
  element.id = id;
  document.body.appendChild(element);
  return element;
}

rebuild().then(loadFonts);
document.addEventListener("input", rebuild);
document.addEventListener("focuswithin", rebuild);
window.addEventListener("resize", rebuild);
document.addEventListener("scroll", replaceUi);

function rebuild() {
  return replaceTyp(getUiValues()).then(replaceUi);
}

function getDefaultValues() {
  const element = Array.from(
    typ.querySelectorAll<HTMLElement>("[data-typst-label]"),
  ).find((el) => el.dataset.typstLabel?.startsWith("dyno.defaults:"));

  if (!element?.dataset.typstLabel) {
    console.warn("Default values not provided by the server");
    return {};
  }

  const raw = element.dataset.typstLabel.replace("dyno.defaults:", "");
  const pairs = raw.split(";").map((pair) => pair.split("="));
  return Object.fromEntries(pairs);
}

function loadFonts() {
  const requestedWithDuplicates = Array.from(
    ui.children as Iterable<HTMLInputElement>,
  )
    .map((element) => element.style.fontFamily.replaceAll('"', ""))
    .filter(Boolean);
  const requested = [...new Set(requestedWithDuplicates)];

  const fonts = requested.map(
    (name) => new FontFace(name, `url("/font?name=${name}")`),
  );

  fonts.map((font) => document.fonts.add(font));
}

async function replaceUi() {
  const defaultValues = getDefaultValues();

  const requested = Array.from(
    typ.querySelectorAll<HTMLElement>("[data-typst-label]"),
  )
    .map((el) => {
      try {
        return {
          ...JSON.parse(el.dataset.typstLabel!),
          bounds: el.getBoundingClientRect(),
          element: el,
        };
      } catch {
        return false;
      }
    })
    .filter(Boolean)
    .map((el): Props => {
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
  const pairs = Array.from(ui.children as Iterable<HTMLInputElement>)
    .map(getInputValue)
    .filter((element) => element.length !== 0);

  const system = [
    ["window-width", window.innerWidth],
    ["window-height", window.innerHeight],
    ["cm", cm.clientWidth],
    ["focus", `"${document.activeElement?.id?.slice(4) || ""}"`],
  ];

  return (
    "#{\n" +
    [...pairs, ...system].map(([k, v]) => `  ${k} = ${v}`).join("\n") +
    "\n}"
  );
}

function getInputValue(element: HTMLInputElement) {
  const name = element.id;

  if (element.type === "number") {
    return [name, element.value || 0];
  } else if (element.type === "text") {
    return [name, '"' + (element.value || "") + '"'];
  } else if (element.type === "checkbox") {
    return [name, element.checked || false];
  } else {
    return [];
  }
}

function setInputValue(
  element: HTMLInputElement,
  value: number | string | boolean,
) {
  if (typeof value === "boolean") {
    element.checked = value;
  } else {
    element.value = String(value);
  }
}

function updateUiElement(props: Props) {
  const element =
    document.getElementById(props.variable) || createUiElement(props);

  element.style.left = props.bounds.left + "px";
  element.style.width = props.bounds.width + "px";

  if (props.kind === "txt" || props.kind === "num") {
    element.style.top = (props.bounds.bottom + props.bounds.top) / 2 + "px";

    props.element
      .querySelectorAll(".typst-text")
      .forEach((obj) => obj.remove());
  } else {
    element.style.top = props.bounds.top + "px";
    element.style.height = props.bounds.height + "px";
  }

  if (props.kind !== "swp") {
    element.style.color = props.color;
    element.style.fontFamily = props.font;
    element.style.fontSize = props.size;
    element.style.textAlign = props.align;
  }
}

function createUiElement(props: Props) {
  if (props.kind === "swp") {
    return createSwapButton(props);
  }

  return createInput(props);
}

function createSwapButton(props: SwapButtonProps) {
  const [a, b] = props.variable.split(";");

  const element = document.createElement("button");
  element.classList.add("swp");
  element.id = props.variable;

  element.addEventListener("click", () => {
    const input1 = document.getElementById(a) as HTMLInputElement;
    const input2 = document.getElementById(b) as HTMLInputElement;
    const [_key1, value1] = getInputValue(input1);
    const [_key2, value2] = getInputValue(input2);
    setInputValue(input1, value2);
    setInputValue(input2, value1);
    element.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  });

  ui.appendChild(element);

  return element;
}

function createInput({ kind, variable, defaultVal }: InputProps) {
  const element = document.createElement("input");

  if (kind === "num") {
    element.type = "number";
    element.value = defaultVal;
  } else if (kind === "chk") {
    element.type = "checkbox";
    element.checked = defaultVal === "true";
  } else if (kind === "txt") {
    element.type = "text";
    element.value = defaultVal;
  } else {
    console.warn("unknown element", kind);
  }

  element.id = variable;
  const sendFocusChange = () =>
    element.dispatchEvent(new CustomEvent("focuswithin", { bubbles: true }));
  element.onfocus = sendFocusChange;
  element.onblur = () => setTimeout(sendFocusChange, 100);
  ui.appendChild(element);
  return element;
}

async function replaceTyp(body: string) {
  const response = await fetch(`/compile?root=${root}`, {
    method: "POST",
    body: body || "// dyno: no input provided",
  });
  const text = await response.text();

  if (text.startsWith("<pre>")) {
    err.innerHTML = text;
  } else {
    err.innerHTML = "";
    typ.innerHTML = text;
  }
}
