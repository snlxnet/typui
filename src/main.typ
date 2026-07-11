#import "theme.typ": *
#let fields = (
  sticker-h: 20,
  sticker-w: 30,
  roll-w: 1200,
  count: 20,
  margin: 6,

  en-packs: true,

  tab: [наклейки],
  ..sys,
)
// inject
#show: theme(fields)
#let input = mk-inputs(fields)

#let f = fields

#let h = f.sticker-h + f.margin
#let w = f.sticker-w + f.margin
#let columns = calc.floor(f.roll-w / w)
#let rows = calc.ceil(f.count / columns)
#let roll-length = rows * h + 200

#grid(
  [Размеры наклейки, мм], [#input[sticker-w] #box(inset: (y: 2mm), sym.times) #input[sticker-h]],
  [Ширина рулона, м], input[roll-w],
  [Количество наклеек], input[count],
  [Длина рулона, м/п], answer(roll-length/1000),
)

#colbreak()

#layout(size => {
  let scale = size.width / f.roll-w
  set par(spacing: 0mm, leading: 0mm)
  box(width: f.roll-w*scale, height: roll-length*scale, stroke: 0.5mm + border-normal)[
    #set align(center + horizon)
    #for i in range(f.count) {
      box(width: w*scale, height: h*scale, inset: calc.floor(f.margin / 2) * scale)[
        #box(width: 100%, height: 100%, stroke: 0.25mm + accent)
      ]
    }
  ]
})

