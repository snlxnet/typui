import { $ } from "bun";

const server = Bun.serve({
  routes: {
    "/": Bun.file("./index.html"),
    "/compile": async (req) => {
      // const variables = req.json()
      // console.log(variables)
      const compilerResponse = await $`typst compile main.typ main.svg`
        .text()
        .catch(
          (e) =>
            "<pre>" +
            [
              `exit code ${e.exitCode}`,
              e.stdout.toString(),
              e.stderr.toString(),
            ].join("<br>") +
            "</pre>",
        );
      const output = Bun.file("./main.svg");
      return new Response(compilerResponse || output);
    },
  },
});

console.log(server.url);
