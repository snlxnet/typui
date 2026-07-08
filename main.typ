#import "lib.typ": typui-builder
#import "tabs.typ": tabs

#let fields = (
  выс-накл: 20,
  шир-накл: 30,
  шир-рулона: 1200,
  количество: 20,
  отступ: 6,
  checkable: false,

  window-width: 900,
  window-height: 900,
  cm: 38,
  focus: "",
)
// inject

#let accent = green
#let border-normal = gray

#set text(12pt, font: "DejaVu Sans Mono")
#set page(
  width: fields.window-width / fields.cm * 1cm,
  height: fields.window-height / fields.cm * 1cm,
  columns: 2,
  header: tabs[наклейки],
)

#let raw-input = typui-builder(
  fields,
  checked: text(fill: accent)[#sym.checkmark Вкл],
  unchecked: text(fill: gray)[#sym.crossmark Выкл],
)
#let input(var) = box(
  width: 6em,
  inset: 2mm,
  stroke: 0.5mm + if fields.focus == var.text { accent } else { border-normal },
  raw-input(var, width: 100%),
)

#let п = fields

#let выс = п.выс-накл + п.отступ
#let шир = п.шир-накл + п.отступ
#let столбцы = calc.floor(п.шир-рулона / шир)
#let строки = calc.ceil(п.количество / столбцы)
#let длин-рулона = строки * выс + 200

#grid(
  columns: 2,
  gutter: 2em,
  align: horizon,
  [Размеры наклейки, мм], [#input[шир-накл] #box(inset: (y: 2mm), sym.times) #input[выс-накл]],
  [Ширина рулона, м], input[шир-рулона],
  [Количество наклеек], input[количество],
  [Длина рулона, м/п], text(fill: green)[#(длин-рулона/1000)],
  [...], input[checkable]
)

#colbreak()

#layout(size => {
  let scale = size.width / п.шир-рулона
  set par(spacing: 0mm, leading: 0mm)
  box(width: п.шир-рулона*scale, height: длин-рулона*scale, stroke: 0.5mm + border-normal)[
    #set align(center + horizon)
    #for i in range(п.количество) {
      box(width: шир*scale, height: выс*scale, inset: calc.floor(п.отступ / 2) * scale)[
        #box(width: 100%, height: 100%, stroke: 0.25mm + accent)
      ]
    }
  ]
})

