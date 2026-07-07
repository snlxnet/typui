import { $ } from "bun";

const server = Bun.serve({
  routes: {
    "/": Bun.file("./index.html"),
    "/main.css": Bun.file("./main.css"),
    "/compile": async (req) => {
      const variables = await req.text();
      const id = crypto.randomUUID();
      const source = await Bun.file("main.typ").text();
      const replaced = variables
        ? source.replace("// inject here", variables)
        : source;
      Bun.write(`${id}.typ`, replaced);

      const compilerResponse = await $`typst compile ${id}.typ ${id}.svg`
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
      const output = Bun.file(`./${id}.svg`);
      setTimeout(async () => {
        console.log("cleanup", id);
        await $`rm ${id}.*`;
      }, 1000);
      return new Response(compilerResponse || output);
    },
  },
});

console.log("TypUI server running...");
console.log(server.url);
