const fs = require('fs');
const path = require('path');

const reportPath = path.resolve('test-results/cucumber-report.json');
const outputFile = process.env.GITHUB_OUTPUT;

if (!fs.existsSync(reportPath)) {
  const defaults = { total: 0, passed: 0, failed: 0, skipped: 0, scenarios: 0, features: 0 };
  Object.entries(defaults).forEach(([k, v]) => fs.appendFileSync(outputFile, `${k}=${v}\n`));
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
let passed = 0, failed = 0, skipped = 0, scenarios = 0;

report.forEach(feature => {
  (feature.elements || []).forEach(element => {
    scenarios++;
    (element.steps || []).forEach(step => {
      if (step.hidden) return;
      if (step.result.status === 'passed') passed++;
      else if (step.result.status === 'failed') failed++;
      else skipped++;
    });
  });
});

const results = {
  features: report.length,
  scenarios,
  passed,
  failed,
  skipped,
  total: passed + failed + skipped
};

Object.entries(results).forEach(([k, v]) => fs.appendFileSync(outputFile, `${k}=${v}\n`));
