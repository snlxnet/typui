// lib to get the values out

#let _input(kind, var, prefix: [], suffix: [], ..args) = [
  #context text.font
  #box(inset: 0mm, outset: 0mm, stroke: 0mm)[
    #box(inset: 0mm, outset: 0mm, stroke: none, fill: none, var.text)
    #label("typui")
  ]
  #label("typui-whatever")
]

#let txt(var, ..args) = _input("txt", var, ..args)
#let num(var, ..args) = _input("num", var, ..args)
#let chk(var, ..args) = _input("chk", var, ..args)
