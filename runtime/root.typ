#import "lib.typ": input as inp

= Hello, world

#let answer = 42

#inp(answer)

The answer is #answer

#let var2 = false

#inp(
  fill: none,
  var2,
)

/*
Doc for the future:

#let number = 42
#let checkbox = false
#let text = "string"
#let toggle = [on\ off]
#let select = [
  first\
  second\
  third
]

render input: #input(number)

get options: #options(toggle)
*/
