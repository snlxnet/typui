#set page(paper: "a5")
#set text(12pt, font: "DejaVu Sans Mono")

#let fields = (
  a: 5,
  b: 6,
)

#place(
  top+right,
  [
    #box[#set text(fill: rgb("#12345600")); intial values]
    #label("typui.init:" + json.encode(fields, pretty: false))
  ],
)
// inject here

#raw(json.encode(fields), lang: "json")

#let num(var, ..args) = [
  #box(
    stroke: 0.5mm,
    inset: 2mm,
    width: 2cm,
    ..args
  )[
    #eval(
      var.text,
      scope: fields,
    )
  ]
  #label("typui-num-"+var.text)
]

#num[a] #sym.times #num[b]

// replace with eqrun
#let hypotinuse = calc.sqrt(fields.a * fields.a + fields.b * fields.b)
