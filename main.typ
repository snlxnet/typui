#import "lib.typ": typui-builder

#let fields = (
  выс-накл: 20,
  шир-накл: 30,
  шир-рулона: 1200,
  количество: 20,
  отступ: 6,

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
)

#let input = typui-builder(fields)

= Расчет наклеек
#let п = fields

#let выс = п.выс-накл + п.отступ
#let шир = п.шир-накл + п.отступ
#let столбцы = calc.floor(п.шир-рулона / шир)
#let строки = calc.ceil(п.количество / столбцы)
#let длин-рулона = строки * выс + 200

#table(
  columns: 2,
  [Размеры наклейки], [#input[шир-накл]мм #sym.times #input[выс-накл]мм],
  [Ширина рулона], [#input[шир-рулона]м],
  [Количество наклеек], input[количество],
  [Длина рулона], text(fill: green)[#(длин-рулона/1000) м/п],
)

#colbreak()

#layout(size => {
  let scale = size.width / п.шир-рулона
  set par(spacing: 0mm, leading: 0mm)
  box(width: п.шир-рулона*scale, height: длин-рулона*scale, fill: rgb("#eee"))[
    #set align(center + horizon)
    #for i in range(п.количество) {
      box(width: шир*scale, height: выс*scale, inset: calc.floor(п.отступ / 2) * scale)[
        #box(width: 100%, height: 100%, fill: green)
      ]
    }
  ]
})

