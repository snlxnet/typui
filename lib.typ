#let typui-init(fields) = place(
  top+right,
  [
    #box[#set text(fill: rgb("#12345600")); intial values]
    #label("typui.init:" + json.encode(fields, pretty: false))
  ],
)

#let typui-inputs(fields) = (
  txt: (var) => [
    #box(inset: 0mm, outset: 0mm, stroke: 0mm, baseline: 20%)[
      #eval(var.text, scope: fields)~
    ]
    #label("typui-txt-"+var.text)
  ],
  num: (var) => [
    #box(inset: 0mm, outset: 0mm, stroke: 0mm, baseline: 20%)[
      #eval(var.text, scope: fields)
    ]
    #label("typui-num-"+var.text)
  ],
)
