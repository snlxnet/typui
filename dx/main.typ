#import "lib.typ" as dyno

#let accent = green
#let neutral = rgb("#ddd")
#let border = neutral + 0.3mm
#let highlight = state("highlight", "")
#let field-style(var) = (
    inset: 0.6em,
    baseline: 0.6em,
    radius: 0.3em,
    stroke: 0.3mm + if highlight.get() == var { accent } else { neutral },
)

#set text(14pt, font: "Departure Mono")

#let num(var) = context dyno.num(var, ..field-style(var.text))
#let swp(a, b, body) = context dyno.swp(a, b, ..field-style(a+";"+b), align(horizon + center, body))
#let chk(var, body) = context dyno.chk(var, ..field-style(var.text), body)

#let sticker-h = 14
#let sticker-w = 24
#let roll-w = 1200
#let count = 20
#let margin = 6
#let checkbox = false

#let focus = ""

// ui
#context highlight.update((_) => focus)

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
  [Размеры наклейки, мм], grid(
    columns: 3,
    gutter: 1em,
    num[sticker-w],
    swp("sticker-w", "sticker-h")[#sym.arrow.l.r],
    num[sticker-h],
  ),
  [Ширина рулона, м], num[roll-w],
  [Количество наклеек], num[count],
  [Длина рулона, м/п], answer(roll-length/1000),
  [Галочка], chk([checkbox], if checkbox [#sym.checkmark] else [#sym.crossmark]),
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

