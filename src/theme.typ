#import "tabs.typ": tabs
#import "lib.typ": typui-builder

#let accent = green
#let border-normal = rgb("#ddd")

#let sys = (
  window-width: 900,
  window-height: 900,
  cm: 38,
  focus: "",
)

#let theme(fields) = {
  (doc) => {
    set text(12pt, font: "DejaVu Sans Mono")

    set grid(
      columns: 2,
      gutter: 2em,
      align: horizon,
    )

    set page(
      width: fields.window-width / fields.cm * 1cm,
      height: auto,
    )

    // I'll get back to tabs[#fields.tab]
    doc
  }
}

#let mk-inputs(fields) = {
  let raw-input = typui-builder(
    fields,
    checked: text(fill: accent, size: 9pt)[#sym.checkmark Да],
    unchecked: text(fill: gray, size: 9pt)[#sym.crossmark Нет],
  )

  let input(var, unit: none) = box(
    height: 2em,
    width: 4em,
    inset: (x: 0.6em),
    radius: 0.618em,
    stroke: 0.5mm + if fields.focus == var.text { accent } else { border-normal },
    grid(
      columns: (1fr, auto),
      raw-input(var, width: 3em),
      if unit == none {} else { unit }
    )
  )

  input
}

// 42
#let answer(body) = text(fill: accent, str(body))
