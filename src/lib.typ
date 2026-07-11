#let _input(kind, var, prefix: [], suffix: [], ..args) = box(
  ..args,
  stroke: 1mm,
  inset: 2mm,
  stack(
    dir: ltr,
    prefix,
    [
      #box(inset: 0mm, outset: 0mm, stroke: 0mm, kind)
      #label("typui-"+kind+"-"+var.text)
    ],
    suffix
  )
)

#let txt(var, ..args) = _input("txt", var, ..args)
#let num(var, ..args) = _input("num", var, ..args)
#let chk(var, ..args) = _input("chk", var, ..args)
