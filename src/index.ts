import { serve } from '@hono/node-server'
import { exec } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import { Hono } from 'hono'

const app = new Hono()

const init = `#place(
  top+right,
  [#box[]#label("typui.init:" + json.encode(fields, pretty: false))]
)`

app.post('/compile', async (c) => {
  const root = c.req.param("root") || "main.typ"
  const variables = await c.req.text();
  const id = crypto.randomUUID();
  const source = await readFile(root, {encoding: "utf8"});
  const replaced = variables
    ? source.replace("// inject", variables)
    : source;
  await writeFile(`${id}.typ`, replaced + "\n" + init);

  const compilerResponse = await sh(`typst compile ${id}.typ ${id}-page{0p}.svg`)
    .then(async () => {await sh(`ls ${id}-page* | sort | xargs cat > ${id}.svg`)})
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
  const output = await readFile(`./${id}.svg`, { encoding: 'utf8' });
  setTimeout(async () => {
    console.log("cleanup", id);
    await sh(`rm ${id}*`);
  }, 1000);
  return new Response(compilerResponse || output);
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

async function sh(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, (exitCode, stdout, stderr) => {
      if (exitCode) {
        reject({exitCode, stdout, stderr})
        return
      }
      resolve(stdout)
    })
  })
}
