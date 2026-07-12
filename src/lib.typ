#let _wrap(body, ..args) = box(
  inset: 0mm,
  outset: 0mm,
  stroke: 0mm, // not none, this is important
  fill: none,
  ..args,
  body,
)

#let _input(kind, var, width: 4em, ..args) = box(
  ..args,
  context [
    #let props = (
      kind: kind,
      variable: var.text,
      align: align.alignment.x,
      size: text.size,
      font: text.font,
      color: text.fill.to-hex(),
    )
    #place(hide[
      #_wrap(var)
      #label("varname-typui")
    ])
    #_wrap(kind, width: width)
    #label(json.encode(props, pretty: false))
  ],
)

#let txt(var, ..args) = _input("txt", var, ..args)
#let num(var, ..args) = _input("num", var, ..args)
#let chk(var, ..args) = _input("chk", var, ..args)
