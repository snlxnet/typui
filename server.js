// runs in bun

const server = Bun.serve({
  routes: {
    "/": Bun.file("./index.html"),
    "/compile": async req => {
      // const variables = req.json()
      // console.log(variables)
      const output = Bun.file("./main.svg")
      return new Response(output)
    },
  }
})

console.log(server.url)
