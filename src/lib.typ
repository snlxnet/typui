#let _wrap(body, ..args) = box(
  inset: 0mm,
  outset: 0mm,
  stroke: 0mm, // not none, this is important
  fill: none,
  ..args,
  body,
)

#let _input(kind, var, ..args) = box(
  width: 4em,
  stroke: 1mm,
  inset: 2mm,
  ..args,
  [
    #place(hide[
      #_wrap(var)
      #label("varname-typui")
    ])
    #_wrap(kind, width: 100%, height: 1em)
    #label("typui-"+kind+"-"+var.text)
  ],
)

#let txt(var, ..args) = _input("txt", var, ..args)
#let num(var, ..args) = _input("num", var, ..args)
#let chk(var, ..args) = _input("chk", var, ..args)
