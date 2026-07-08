#let typui-inputs(fields) = {
  let inputs = (
    txt: (var) => [
      #box(inset: 0mm, outset: 0mm, stroke: 0mm)[
        #eval(var.text, scope: fields)~
      ]
      #label("typui-txt-"+var.text)
    ],
    num: (var) => [
      #box(inset: 0mm, outset: 0mm, stroke: 0mm)[
        #eval(var.text, scope: fields)
      ]
      #label("typui-num-"+var.text)
    ],
    chk: (var, checked: sym.checkmark, unchecked: [~], ..args) => [
      #box(inset: 0mm, outset: 0mm, stroke: 0mm, ..args)[
        #let state = eval(var.text, scope: fields)
        #if state { checked } else { unchecked }
      ]
      #label("typui-chk-"+var.text)
    ]
  )
  inputs
}
