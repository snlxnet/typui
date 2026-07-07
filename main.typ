#set page(paper: "a5")
#set text(12pt, font: "DejaVu Sans Mono")

#let fields = (
  a: 5,
  b: 6,
)
#let num(var, ..args) = {
  box(
    stroke: 0.5mm,
    inset: 2mm,
    ..args
  )[
    #eval(
      var.text,
      scope: fields,
    )
  ]
}

#num[a]
#num[b]

// replace with eqrun
#let hypotinuse = calc.sqrt(fields.a * fields.a + fields.b * fields.b)
