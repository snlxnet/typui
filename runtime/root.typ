#import "lib.typ": num as num-input

= Hello, world

#let answer = 42

#num-input(answer)

The answer is #answer

#let var2 = 10

#num-input(
  fill: none,
  var2,
)
