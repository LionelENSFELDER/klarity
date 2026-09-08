// Stub for "@mui/icons-material" used only in tests.
//
// The real package's barrel entry re-exports ~10 000 individual icon
// modules. Loading it at all (even for a single named import) forces
// Node/Vite to open every one of those files, which reliably hits
// Windows' low concurrent-file-handle limit and crashes Vitest with
// EMFILE. Icon rendering isn't what these tests verify, so every real
// icon name (listed via a single directory read, no file content is
// ever opened) resolves here to the same lightweight stub component.
const fs = require("fs");
const path = require("path");
const React = require("react");

const pkgDir = path.join(__dirname, "..", "node_modules", "@mui", "icons-material");

const iconNames = fs
  .readdirSync(pkgDir)
  .filter((f) => f.endsWith(".js"))
  .map((f) => f.slice(0, -3));

const cache = new Map();
function getIcon(name) {
  if (!cache.has(name)) {
    const Icon = (props) => React.createElement("svg", { "data-icon": name, ...props });
    Icon.displayName = name;
    cache.set(name, Icon);
  }
  return cache.get(name);
}

const iconsModule = { __esModule: true };
for (const name of iconNames) {
  Object.defineProperty(iconsModule, name, {
    enumerable: true,
    get: () => getIcon(name),
  });
}
Object.defineProperty(iconsModule, "default", {
  enumerable: true,
  get: () => getIcon("default"),
});

module.exports = iconsModule;
