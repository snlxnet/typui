#let typui-init(fields) = place(
  top+right,
  [
    #box[#set text(fill: rgb("#12345600")); intial values]
    #label("typui.init:" + json.encode(fields, pretty: false))
  ],
)

#let typui-inputs(fields) = (
  num: (var, ..args) => [
    #box(
      stroke: 0mm,
      height: 1.2em,
      baseline: 20%,
      ..args
    )[
      #eval(
        var.text,
        scope: fields,
      )
    ]
    #label("typui-num-"+var.text)
  ],
)
