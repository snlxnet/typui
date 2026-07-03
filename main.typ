// inputs
#let sticker-w = 20
#let sticker-h = 30
#let material-width = 1200
#let count = 1
#let price-per-sqm = 200

// outputs
#let margin = 6
#sticker-w += margin
#sticker-h += margin
#let columns = calc.floor(material-width / sticker-w)
#let rows = calc.ceil(count / columns)
#let material-length = (150 + rows * sticker-h) / 100

// display
#let num(..args) = []
#let val(name) = []

#table(
  columns: 2,
  [Sticker size (mm)], [#num[sticker-w] #sym.times #num[sticker-h]],
  [Material width (mm)], num[material-width],
  [Number of stickers], num[count],
  [Material length], str(material-length),
  [Price per $m^2$], num[price-per-sqm],
  [Price], str(calc.ceil(material-width / 1000 * material-length * price-per-sqm)),
)
