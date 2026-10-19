import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Déstructurer une propriété uniquement pour l'exclure du rest
    // (`const { key, ...rest } = props`) n'est pas une variable oubliée :
    // c'est la seule façon de retirer `key` avant un spread JSX, que React
    // refuse. `ignoreRestSiblings` est l'option prévue pour ce cas.
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true },
      ],
    },
  },
  {
    // `require()` est la syntaxe d'un module CommonJS, pas un oubli de
    // modernisation : vitest-mocks/mui-icons-material.cjs construit ses
    // exports dans une boucle, ce qu'ESM ne permet pas — ses exports sont
    // statiques, fixés à l'analyse du module.
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
