const report = require('multiple-cucumber-html-reporter');


report.generate({
  jsonDir: './tests/bdd/test-results/',
  reportPath: './tests/bdd/test-results/reports/',
  reportName: 'Platform API Automation Report - E2E',
  pageTitle: 'Platform API Automation Report',
  displayDuration: true,
  displayReportTime: true,
  customMetadata: true,
  metadata: [
    { name: 'Environment', value: 'environment' },
    { name: 'API', value: 'Platform API' },
  ],
  customData: {
    title: 'Test Info',

    data: [
      { label: 'Project', value: 'Platform API' },
      { label: 'Environment', value: 'environment' },
      { label: 'Test', value: 'E2E' },
    ],
  },
});
