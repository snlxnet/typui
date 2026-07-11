#let root = sys.inputs.root

#context {
  let answers = read(root)
  let question = query(<varname-typui>)
    .map(input => input.body.text + "=#" + input.body.text)
    .join("\;")

  let source = answers + "\n#place(hide[#box[" + question + "]<typui-default-values>])"
  eval(source, mode: "markup")
}

#context {
  let result = query(<typui-default-values>)
    .first()
    .body
    .children
    .map(child => if child == [ ] { " " } else { child.text })
    .join()

  place(hide[#box()[get result from here]#label(result)])
}
