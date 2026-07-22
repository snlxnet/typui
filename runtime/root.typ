#import "lib.typ": input as inp

= Dyno

#let number = 42
#let checkbox = false
#let text = "string"
#let toggle = [on\ off]
#let select = [
  first\
  second\
  third
]

/*
render input: #input(number)

get options: #options(toggle)
*/

- #inp(number)
- #inp(checkbox)
- #inp(width: 3cm, text)
- #inp(toggle, stroke: none)
- #inp(select)
