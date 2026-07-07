#import "lib.typ": typui-init, typui-inputs

#let fields = (
  выс-накл: 20,
  шир-накл: 30,
  шир-рулона: 1200,
  количество: 20,
  отступ: 6,

  window-width: 900,
  window-height: 900,
  cm: 38,
)
// inject
#set text(12pt, font: "DejaVu Sans Mono")
#set page(
  width: fields.window-width / fields.cm * 1cm,
  height: fields.window-height / fields.cm * 1cm * 2,
  columns: 2,
)

#typui-init(fields)
#let (num: num) = typui-inputs(fields)

= Расчет наклеек
#let п = fields

#let выс = п.выс-накл + п.отступ
#let шир = п.шир-накл + п.отступ
#let столбцы = calc.floor(п.шир-рулона / п.шир-накл)
#let строки = calc.ceil(п.количество / столбцы)
#let длин-рулона = ((150 + строки * п.выс-накл) / 100)

#table(
  columns: 2,
  [Размеры наклейки], [#num[выс-накл]мм #sym.times #num[шир-накл]мм],
  [Ширина рулона], [#num[шир-рулона]м],
  [Количество наклеек], num[количество],
  [Длина рулона], text(fill: green)[#длин-рулона м/п],
)

#colbreak()

#let scale = 0.2mm
#box(width: п.шир-рулона*scale, height: длин-рулона*scale*10, fill: rgb("#eee"))[
  #for i in range(п.количество) {
    box(width: п.шир-накл*scale, height: п.выс-накл*scale, inset: calc.floor(п.отступ / 2) * scale)[
      #box(width: 100%, height: 100%, fill: green)
    ]
  }
]
