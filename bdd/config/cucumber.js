module.exports = {
  default: {
    formatOptions: {
      snippetInterface: 'async-await',
      colorsEnabled: true,
    },
    plugin: 'pretty',
    monochrome: true,
    paths: ['bdd/features/*/*.feature', 'bdd/features/*.feature'],
    dryRun: false,
    require: ['bdd/steps/*.ts', 'bdd/steps/*/*.ts', 'bdd/hooks/hooks.ts'],
    requireModule: ['ts-node/register'],
    format: ['html:test-results/cucumber-report.html', 'json:test-results/cucumber-report.json','rerun:@rerun.txt'],
  },
  rerun: {
    formatOptions: {
      snippetInterface: 'async-await',
      colorsEnabled: true,
    },
    plugin: 'pretty',
    monochrome: true,
    dryRun: false,
    require: ['bdd/steps/*.ts', 'bdd/steps/*/*.ts', 'bdd/hooks/hooks.ts'],
    requireModule: ['ts-node/register'],
    format: ['html:test-results/cucumber-report.html', 'json:test-results/cucumber-report.json','rerun:@rerun.txt'],
  },
};
