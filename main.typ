#import "lib.typ": typui-init, typui-inputs

#let fields = (
  a: 5,
  b: 6,

  window-width: 900,
  window-height: 900,
  cm: 38,
)
// inject
#set text(12pt, font: "DejaVu Sans Mono")
#set page(
  width: fields.window-width / fields.cm * 1cm,
  height: fields.window-height / fields.cm * 1cm,
)

#typui-init(fields)
#let (num: num) = typui-inputs(fields)

#num[a] #sym.times #num[b] = #(fields.a * fields.b)
