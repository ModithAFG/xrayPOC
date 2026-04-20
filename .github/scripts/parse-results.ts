import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

interface StepResult {
  status: string;
  duration?: number;
}

interface Step {
  hidden?: boolean;
  result: StepResult;
}

interface Element {
  steps?: Step[];
}

interface Feature {
  elements?: Element[];
}

interface Results {
  features: number;
  scenarios: number;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}

// --- Parse cucumber results ---
const reportPath = path.resolve('test-results/cucumber-report.json');
let results: Results = { features: 0, scenarios: 0, passed: 0, failed: 0, skipped: 0, total: 0 };

if (fs.existsSync(reportPath)) {
  const report: Feature[] = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
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

  results = { features: report.length, scenarios, passed, failed, skipped, total: passed + failed + skipped };
}

// --- Write outputs for other steps if needed ---
const githubOutput = process.env.GITHUB_OUTPUT;
if (githubOutput) {
  Object.entries(results).forEach(([k, v]) =>
    fs.appendFileSync(githubOutput, `${k}=${v}\n`)
  );
}

// --- Send Teams notification ---
const webhookUrl = process.env.WEBHOOK_URL;
if (!webhookUrl) {
  console.log('No WEBHOOK_URL set, skipping notification');
  process.exit(0);
}

const jobStatus = process.env.JOB_STATUS || 'failure';
const isSuccess = jobStatus === 'success';
const color = isSuccess ? '28a745' : 'dc3545';
const icon = isSuccess ? '✅' : '❌';
const status = isSuccess ? 'PASSED' : 'FAILED';
const shortSha = (process.env.SHA || '').substring(0, 7);
const repo = process.env.REPO || '';
const runId = process.env.RUN_ID || '';

const payload = JSON.stringify({
  "@type": "MessageCard",
  "@context": "http://schema.org/extensions",
  themeColor: color,
  text: [
    `**${icon} BDD Test Run: ${status}** | Env: ${process.env.ENV_NAME || ''} | Branch: ${process.env.BRANCH || ''}`,
    '',
    `📊 **Features:** ${results.features} | **Scenarios:** ${results.scenarios}`,
    `✅ **Passed:** ${results.passed} | ❌ **Failed:** ${results.failed} | ⏭️ **Skipped:** ${results.skipped} | **Total Steps:** ${results.total}`,
    '',
    `👤 **Triggered by:** ${process.env.ACTOR || ''} | **Commit:** ${shortSha}`,
    '',
    `[View Workflow Run](https://github.com/${repo}/actions/runs/${runId}) | [View Commit](https://github.com/${repo}/commit/${process.env.SHA || ''})`
  ].join('<br>')
});

const url = new URL(webhookUrl);
const transport = url.protocol === 'https:' ? https : http;

const req = transport.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('Teams notification sent:', res.statusCode, body));
});
req.on('error', (err) => { console.error('Failed to send notification:', err.message); process.exit(1); });
req.write(payload);
req.end();
