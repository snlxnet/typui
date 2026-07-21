import { serve } from "@hono/node-server";
import { exec } from "child_process";
import { readFile, writeFile } from "fs/promises";
import { Hono } from "hono";
import client from "./dist/index.html";
import { buildLSP } from "./lsp.js";
import path from "path";
import { fileURLToPath } from "url";

const app = new Hono();

const WORKDIR = "/Users/alex/repos/dyno/runtime/"; // (process.env.DYNO_DIR || "./") + "/";
const PORT = +(process.env.DYNO_PORT || 3000);

const lsp = buildLSP(WORKDIR);
lsp.subscribe(console.log);

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

type Location = {
  uri: string;
  range: Range;
};

type Range = {
  start: Position;
  end: Position;
};

type Position = {
  line: number;
  character: number;
};

async function explore() {
  const fileUri = `file://${WORKDIR}root.typ`;
  const LIB_URI = `file://${WORKDIR}lib.typ`;

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

  lsp.request("textDocument/references", {
    context: {
      includeDeclaration: true,
    },
    textDocument: {
      uri: LIB_URI,
    },
    position: {
      line: 0,
      character: 6,
    },
  });

  lsp.subscribe((message) => {
    if (!Array.isArray(message?.result)) {
      return;
    }
    if (!message.result[0]?.range || !message.result[0]?.uri) {
      return;
    }

    const allReferences: Location[] = message.result;
    const references = allReferences
      .filter((ref) => ref.uri === fileUri)
      .map((ref) => ref.range);
    const refLineNumbers = references.map((ref) => ref.end.line);

    const triggers = fileBody
      .split("\n")
      .map((line, idx) => {
        const ref = references.find((ref) => ref.end.line === idx);

        if (!ref) {
          return null;
        }

        const nextChar = line.at(ref.end.character);
        if (nextChar !== "(") {
          return null;
        }

        return ref.end;
      })
      .filter((pos) => pos !== null);

    let x = 0;
    let y = 0;
    let bracketDepth = 0;
    let weCare = false;

    let starts: number[] = [];
    let ends: number[] = [];

    fileBody.split("").forEach((char, idx) => {
      if (char === "\n") {
        x = 0;
        y++;
        return;
      }

      if (triggers.find((pos) => pos.character === x && pos.line === y)) {
        bracketDepth = 0;
        weCare = true;
        starts.push(idx + 1);
      }

      if (char === "(") bracketDepth++;
      if (char === ")") bracketDepth--;

      if (bracketDepth === 0 && weCare) {
        ends.push(idx);
        weCare = false;
      }

      x++;
    });

    const ranges: [number, number][] = starts.map((start, idx) => [
      start,
      ends[idx],
    ]);

    const variables = ranges
      .map((range) =>
        fileBody
          .slice(...range)
          .split(",")
          .find((arg) => !arg.includes(":"))
          ?.replace(/\s+/, ""),
      )
      .filter((v) => v !== undefined);

    console.log(variables);
  });
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
