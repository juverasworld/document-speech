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
     "env": { "browser": true, "es2021": true },
  "extends": ["plugin:react/recommended", "plugin:@typescript-eslint/recommended"],
  "rules": { "react/no-unescaped-entities": "off", "@typescript-eslint/no-explicit-any": "off", "react-hooks/exhaustive-deps": "off" ,"@next/next/no-img-element": "off" ,"@typescript-eslint/ban-ts-comment": "off", "react/prop-types": "off" ,"@typescript-eslint/no-non-null-assertion": "off" , 
"@typescript-eslint/explicit-module-boundary-types": "off" , 'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off', "@typescript-eslint/no-unused-vars": ['warn', { argsIgnorePattern: '^_' }],

},
  },
];

export default eslintConfig;
