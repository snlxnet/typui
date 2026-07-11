#import "lib.typ" as typui

#let accent = green
#let neutral = rgb("#ddd")
#let border = neutral + 0.3mm

#set text(14pt, font: "JetBrainsMono NF")
#let num(var) = typui.num(var, outset: (x: 0.6em, y: 0.6em), stroke: border, radius: 0.3em)

#let fields = (
  sticker-h: 20,
  sticker-w: 30,
  roll-w: 1200,
  count: 20,
  margin: 6,
)
#let f = fields

// ui

#set page(height: auto, margin: 2em)
#let answer(expr) = str(expr)

#let h = f.sticker-h + f.margin
#let w = f.sticker-w + f.margin
#let columns = calc.floor(f.roll-w / w)
#let rows = calc.ceil(f.count / columns)
#let roll-length = rows * h + 200

#grid(
  columns: 2,
  gutter: 2em,
  [Размеры наклейки, мм], [#num[f.sticker-w]~~#sym.times~~#num[f.sticker-h]],
  [Ширина рулона, м], num[f.roll-w],
  [Количество наклеек], num[f.count],
  [Длина рулона, м/п], answer(roll-length/1000),
)

#colbreak()

#layout(size => {
  let scale = size.width / f.roll-w
  set par(spacing: 0mm, leading: 0mm)
  box(width: f.roll-w*scale, height: roll-length*scale, stroke: border)[
    #set align(center + horizon)
    #for i in range(f.count) {
      box(width: w*scale, height: h*scale, inset: calc.floor(f.margin / 2) * scale)[
        #box(width: 100%, height: 100%, stroke: 0.25mm + accent)
      ]
    }
  ]
})

