#let typui-builder(fields, checked: sym.checkmark, unchecked: hide(sym.checkmark)) = (var, ..args) => {
  let value = eval(var.text, scope: fields)
  
  if type(value) == str [
    #box(inset: 0mm, outset: 0mm, stroke: 0mm)[#value~]
    #label("typui-txt-"+var.text)
  ] else if type(value) == int or type(value) == float [
    #box(inset: 0mm, outset: 0mm, stroke: 0mm)[#value]
    #label("typui-num-"+var.text)
  ] else if type(value) == bool [
    #box(inset: 0mm, outset: 0mm, stroke: 0mm, ..args)[
      #let state = value
      #if state { checked } else { unchecked }
    ]
    #label("typui-chk-"+var.text)
  ] else [
    typui: unknown input type
  ]
}
