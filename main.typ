#import "lib.typ": typui-init, typui-inputs

#let fields = (
  выс-накл: 20,
  шир-накл: 30,
  шир-рулона: 1200,
  количество: 20,
  отступ: 6,

  example-num: 42,
  example-txt: "test",
  example-chk: true,

  window-width: 900,
  window-height: 900,
  cm: 38,
)
// inject
#set text(12pt, font: "DejaVu Sans Mono")
#set page(
  width: fields.window-width / fields.cm * 1cm,
  height: fields.window-height / fields.cm * 1cm,
  columns: 2,
)

#typui-init(fields)
#let (txt: txt, num: num, chk: chk) = typui-inputs(fields)

= Примеры полей
#[
  #set box(stroke: 0.2mm, radius: 0.5em, inset: 1mm)

  #box(num[example-num]) = #box[#fields.example-num]\
  #box(txt[example-txt]) = #box(fields.example-txt)\
  #box(chk[example-chk]) = #box[#fields.example-chk]\
]

= Расчет наклеек
#let п = fields

#let выс = п.выс-накл + п.отступ
#let шир = п.шир-накл + п.отступ
#let столбцы = calc.floor(п.шир-рулона / шир)
#let строки = calc.ceil(п.количество / столбцы)
#let длин-рулона = строки * выс + 200

#table(
  columns: 2,
  [Размеры наклейки], [#num[шир-накл]мм #sym.times #num[выс-накл]мм],
  [Ширина рулона], [#num[шир-рулона]м],
  [Количество наклеек], num[количество],
  [Длина рулона], text(fill: green)[#(длин-рулона/1000) м/п],
)

#colbreak()

#layout(size => {
  let scale = size.width / п.шир-рулона
  block(width: п.шир-рулона*scale, height: длин-рулона*scale, fill: rgb("#eee"))[
    #set align(horizon + center)
    #for i in range(п.количество) {
      box(width: шир*scale, height: выс*scale, inset: calc.floor(п.отступ / 2) * scale)[
        #box(width: 100%, height: 100%, fill: green)
      ]
    }
  ]
})

