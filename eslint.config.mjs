import js from '@eslint/js';
import globals from 'globals';
export default [
 {ignores:['.next/**','public/**','test-results/**','playwright-report/**']},
 {files:['**/*.{js,mjs}'],languageOptions:{globals:{...globals.browser,...globals.node},
 parserOptions:{ecmaFeatures:{jsx:true}}},rules:{...js.configs.recommended.rules,'no-unused-vars':'off'}}
];
