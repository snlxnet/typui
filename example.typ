#import "lib.typ": typui-builder
#import "tabs.typ": tabs

#let fields = (
  example-num: 42,
  example-txt: "test",
  example-chk: true,

  window-width: 900,
  window-height: 900,
  cm: 38,
  focus: "",
)
// inject

#set text(12pt, font: "DejaVu Sans Mono")
#set page(
  width: fields.window-width / fields.cm * 1cm,
  height: fields.window-height / fields.cm * 1cm,
  columns: 2,
  header: tabs[поля],
)

#let input = typui-builder(fields)

#let frame(var) = {
  let focused = fields.focus == var.text

  box(
    stroke: 0.5mm + if focused { blue } else { black },
    radius: 0.5em,
    inset: 1mm,
    input(var),
  )
}

= Примеры полей
#[
  #set box(stroke: 0.2mm, radius: 0.5em, inset: 1mm)

  #frame[example-num] = #box[#fields.example-num]\
  #frame[example-txt] = #box(fields.example-txt)\
  #frame[example-chk] = #box[#fields.example-chk]\
]
