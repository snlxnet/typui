#import "lib.typ": typui-init, typui-inputs

#set page(paper: "a5")
#set text(12pt, font: "DejaVu Sans Mono")

#let fields = (
  a: 5,
  b: 6,
)

#typui-init(fields)
#let (num: num) = typui-inputs(fields)

#num[a] #sym.times #num[b] = #(fields.a * fields.b)
