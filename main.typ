// fine I'll do the reactjs thing
#let num(init, key, ..args) = {
  (
    input: [#box(..args)#label(key)],
    value: init, // or get env
  )
}

#let sticker-w = num(20, "sw")
#let sticker-h = num()
#table(
  columns: 2,
  [Sticker size (mm)], [#num("sticker-w", 20) #sym.times #num("sticker-h", 30)],
  [Material width (mm)], num("roll-w", 1200),
  [Number of stickers], num("count", 1),
)

#let margin = 6
#sticker-w += margin
#sticker-h += margin
#let columns = calc.floor(roll-w / sticker-w)
#let rows = calc.ceil(count / columns)
#let material-length = (150 + rows * sticker-height) / 100

#table(
  columns: 2,
  [Material length], material-length,
  [Price per $m^2$], num("price-per-sqm", 200),
)

#table(
  [Price], 
  calc.ceil(
    material-width / 1000 * material-length * price-per-sqm,
  ),
)

