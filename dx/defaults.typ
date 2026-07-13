#let root = sys.inputs.root

#context {
  let answers = read(root)
  let question = query(<varname-dyno>)
    .map(input => input.body.text + "=#" + input.body.text)
    .join("\;")

  let source = answers + "\n#place(hide[#box[" + question + "]<dyno-default-values>])"
  eval(source, mode: "markup")
}

#set page(height: 0mm)
#context {
  let result = query(<dyno-default-values>)
    .first()
    .body
    .children
    .map(child => if child == [ ] { " " } else { child.text })
    .join()

  [#box()#label("dyno.defaults:"+result)]
}
