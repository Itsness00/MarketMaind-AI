import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'marketmind-ai/**/*'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
