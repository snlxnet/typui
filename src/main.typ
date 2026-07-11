#import "lib.typ" as typui

#let accent = green
#let neutral = rgb("#ddd")
#let border = neutral + 0.3mm

#set text(14pt, font: "JetBrainsMono NF")
#let num(var) = typui.num(var, outset: (x: 0.6em, y: 0.6em), stroke: border, radius: 0.3em)

#let sticker-h = 14
#let sticker-w = 24
#let roll-w = 1200
#let count = 20
#let margin = 6

// ui

#set page(height: auto, margin: 2em)
#let answer(expr) = str(expr)

#{
  sticker-h += margin
  sticker-w += margin
}
#let columns = calc.floor(roll-w / sticker-w)
#let rows = calc.ceil(count / columns)
#let roll-length = rows * sticker-h + 200

#grid(
  columns: 2,
  gutter: 2em,
  [Размеры наклейки, мм], [#num[sticker-w]~~#sym.times~~#num[sticker-h]],
  [Ширина рулона, м], num[roll-w],
  [Количество наклеек], num[count],
  [Длина рулона, м/п], answer(roll-length/1000),
)

#colbreak()

#layout(size => {
  let scale = size.width / roll-w
  set par(spacing: 0mm, leading: 0mm)
  box(width: roll-w*scale, height: roll-length*scale, stroke: border)[
    #set align(center + horizon)
    #for i in range(count) {
      box(width: sticker-w*scale, height: sticker-h*scale, inset: calc.floor(margin / 2) * scale)[
        #box(width: 100%, height: 100%, stroke: 0.25mm + accent)
      ]
    }
  ]
})

