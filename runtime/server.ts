import { serve } from "@hono/node-server";
import { exec } from "child_process";
import { readFile, writeFile } from "fs/promises";
import { Hono } from "hono";
import client from "./dist/index.html";
import { buildLSP } from "./lsp.js";
import { fileURLToPath } from "url";
import { getVars } from "./getVars.ts";
import { getValueDefinition as getValueSlice } from "./getDefition.ts";
import type { Slice } from "./common.ts";
import { getType, type DynoType } from "./getType.ts";

const app = new Hono();

const WORKDIR = "/Users/alex/repos/dyno/runtime/"; // (process.env.DYNO_DIR || "./") + "/";
const PORT = +(process.env.DYNO_PORT || 3000);

const lsp = buildLSP(WORKDIR);
lsp.subscribe((msg) => console.log(JSON.stringify(msg, null, 4)));

const system = `#let window-width = 1280
#let window-height = 720
#let cm = 38
#let focus = ""
`;

app.get("/", (c) => c.html(client));
app.get("/font", async (c) => {
  const name = new URL(c.req.url).searchParams.get("name")!;
  const otf = await readFile(WORKDIR + name + ".otf").catch(() => null);
  const ttf = await readFile(WORKDIR + name + ".ttf").catch(() => null);
  const font = otf || ttf || "not found";
  const mime = otf ? "font/otf" : "font/ttf";

  return new Response(font, { headers: { "Content-Type": mime } });
});
app.post("/compile", async (c) => {
  const variables = await c.req.text();
  const tempFileName = crypto.randomUUID();
  const tempFile = WORKDIR + tempFileName;

  const sourcePath =
    WORKDIR + (new URL(c.req.url).searchParams.get("root") || "main.typ");
  const source = await readFile(sourcePath, { encoding: "utf8" });

  const replaced = variables ? source.replace("// ui", variables) : source;

  await writeFile(`${tempFile}.typ`, system + replaced);

  const compilerResponse = await sh(
    `typst compile ${WORKDIR + "defaults.typ"} --font-path=${WORKDIR} --input root="${tempFileName}.typ" ${tempFile}-page{0p}.svg`,
  )
    .catch(() => sh(`typst compile ${tempFile}.typ ${tempFile}-page{0p}.svg`))
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
  await sh(`ls ${tempFile}-page* | sort | xargs cat > ${tempFile}.svg`);

  const output = await readFile(`${tempFile}.svg`, { encoding: "utf8" });
  setTimeout(async () => {
    await sh(`rm ${tempFile}*`);
  }, 1000);
  return new Response(compilerResponse || output);
});
app.get("/explore", async (c) => {
  const response = {};

  return c.json(response);
});

setTimeout(explore, 1000);

type FieldInfo = {
  valueSlice: Slice;
  value: string;

  argsSlice: Slice;
  args: string;

  type: DynoType;
};

async function explore() {
  const fileUri = `file://${WORKDIR}root.typ`;
  const libUri = `file://${WORKDIR}lib.typ`;

  const filePath = fileURLToPath(fileUri);
  const fileBody = await readFile(filePath, { encoding: "utf-8" });

  lsp.notify("textDocument/didOpen", {
    textDocument: {
      languageId: "typst",
      text: fileBody,
      uri: fileUri,
      version: 1,
    },
  });

  await lsp.request("workspace/executeCommand", {
    command: "tinymist.doStartBrowsingPreview",
    arguments: [["--data-plane-host", "127.0.0.1:4343", filePath]],
  });

  const vars = await getVars({
    fileUri,
    fileBody,
    libUri,
    lsp,
  });

  const fields: Map<string, FieldInfo> = new Map();

  for (let { variable, range, slice } of vars) {
    const valueSlice = await getValueSlice({
      fileUri,
      fileBody,
      lsp,
      target: range.start,
    });

    const args = fileBody.slice(...slice);
    const value = fileBody.slice(...valueSlice);

    fields.set(variable, {
      valueSlice,
      value,
      argsSlice: slice,
      args,
      type: getType(value),
    });
  }

  console.log(fields);

  // Insert labels
  const replaced = applySlices(
    fileBody,
    fields
      .entries()
      .toArray()
      .map(([name, field]) => {
        return [field.argsSlice, `label: "dyno-${name}", ${field.args}`];
      }),
  );
  console.log(replaced);
}

function applySlices(source: string, sliceValues: [Slice, string][]) {
  const chars = Array.from(source);
  let lenDiff = 0;

  sliceValues.forEach(([slice, value]) => {
    const sliceLen = slice[1] - slice[0];
    chars.splice(slice[0] + lenDiff, sliceLen, ...value.split(""));
    lenDiff += value.length - sliceLen;
  });
  return chars.join("");
}

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server is running on port ${info.port}`);
  },
);

async function sh(command: string): Promise<string> {
  console.log("$ " + command);
  return new Promise((resolve, reject) => {
    exec(command, (exitCode, stdout, stderr) => {
      if (exitCode) {
        reject({ exitCode, stdout, stderr });
        return;
      }
      resolve(stdout);
    });
  });
}
