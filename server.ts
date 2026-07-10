import { serve } from '@hono/node-server'
import { exec } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import { Hono } from 'hono'

const app = new Hono()

const WORKDIR = (process.env.TYPUI_DIR || "../src") + "/"
const PORT = +(process.env.TYPUI_PORT || 3000)

const init = `#place(
  top+right,
  [#box[]#label("typui.init:" + json.encode(fields, pretty: false))]
)`

app.post('/compile', async (c) => {
  const variables = await c.req.text();
  const tempFile = WORKDIR + crypto.randomUUID();

  const sourcePath = WORKDIR + (new URL(c.req.url).searchParams.get("root") || "main.typ")
  const source = await readFile(sourcePath, {encoding: "utf8"});

  const replaced = variables
    ? source.replace("// inject", variables)
    : source;

  await writeFile(`${tempFile}.typ`, replaced + "\n" + init);

  const compilerResponse = await sh(`typst compile ${tempFile}.typ ${tempFile}-page{0p}.svg`)
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
  await sh(`ls ${tempFile}-page* | sort | xargs cat > ${tempFile}.svg`)

  const output = await readFile(`${tempFile}.svg`, { encoding: 'utf8' });
  setTimeout(async () => {
    await sh(`rm ${tempFile}*`);
  }, 1000);
  return new Response(compilerResponse || output);
})

serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server is running on port ${info.port}`)
})

async function sh(command: string): Promise<string> {
  console.log("$ " + command)
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
