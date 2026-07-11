#let evalled = context {
  let delpb = "#let pagebreak(..args) = []\n"
  let answers = delpb + read("main.typ").replace("#set ", "// ").replace("set ", "// ")
  let question = query(<typui>)
    .map(input => input.body.text + "=#" + input.body.text)
    .join("\;")

  let source = answers + "\n#box[" + question + "]<typui-results>"
  eval(source, mode: "markup")
}

#evalled

#pagebreak()

#context {
  let result = query(<typui-results>).first().body.children.map(child => {
    if child == linebreak() {
      " "
    } else if child == [ ] {
      " "
    } else {
      child.text
    }
  }).join()

  [#box()[get result from here]#label(result)]
}
