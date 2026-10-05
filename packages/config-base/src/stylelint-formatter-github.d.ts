// The formatter ships JSDoc types but no declaration file.
declare module "@csstools/stylelint-formatter-github" {
  const githubFormatter: import("stylelint").Formatter;
  export default githubFormatter;
}
