import { spawn } from "child_process";

export type LSP = {
  request<T extends object | any[]>(method: string, params?: T): Promise<void>;
  notify<T extends object | any[]>(method: string, params?: T): void;
  subscribe(handler: (message: any) => any): void;
  exit(): void;
};

export function buildLSP(cwd: string): LSP {
  const lspServer = spawn("tinymist", ["lsp", "--ignore-system-fonts"], {
    env: { ...process.env, TYPST_FONT_PATHS: cwd, cwd },
  });
  const decoder = new TextDecoder();

  let contentLength = 0;
  let buffer = "";

  const subscribers: Set<(message: any) => any> = new Set();

  let resolveFunction: () => void = () => {};

  lspServer.stdout.on("data", (chunk) => {
    const response = decoder.decode(chunk);
    const [headers, _, body] = response.split("\n");
    const contentLengthHeader = headers
      .split("\n")
      .find((line) => line.startsWith("Content-Length: "));

    if (contentLengthHeader) {
      contentLength = +contentLengthHeader.split(":")[1];
      if (body.length === contentLength) {
        const data = JSON.parse(body) as object;
        resolveFunction();
        subscribers.forEach((sub) => sub(data));
        resolveFunction = () => {};
        return;
      }
      buffer = body;
    }

    buffer += response;
    try {
      const data = JSON.parse(buffer);
      resolveFunction();
      subscribers.forEach((sub) => sub(data));
      resolveFunction = () => {};
      buffer = "";
    } catch {
      // waiting, nothing to catch
    }
  });

  async function send(data: object) {
    const body = JSON.stringify(data);
    const request = `Content-Length: ${body.length}\r\n\r\n${body}`;
    lspServer.stdin.write(request);

    return new Promise<void>((resolve) => {
      resolveFunction = resolve;
    });
  }

  let id = 1;

  async function init() {
    const initParams = {
      processId: null,
      rootUri: "file://" + cwd,
      capabilities: {
        workspace: {
          fileOperations: { didCreate: true },
          diagnostics: { refreshSupport: true },
          executeCommand: { dynamicRegistration: true },
        },
        textDocument: {
          publishDiagnostics: {
            dataSupport: true,
            versionSupport: false,
          },
          diagnostic: { relatedInformation: true, dataSupport: true },
        },
      },
    };

    await send({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: initParams,
    });

    send({ jsonrpc: "2.0", method: "initialized" });
  }

  init();

  return {
    request(method, params?) {
      return send({
        jsonrpc: "2.0",
        id: id++,
        method,
        params,
      });
    },
    notify(method, params?) {
      send({ jsonrpc: "2.0", method, params });
    },
    subscribe(handler) {
      subscribers.add(handler);
    },
    exit() {
      lspServer.kill();
    },
  };
}
