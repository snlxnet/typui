with (import <nixpkgs> {});
mkShell {
  buildInputs = [
    tinymist
    typescript-language-server
    nodejs_24
  ];
}
