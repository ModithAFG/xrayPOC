import fs from 'fs';
import path from 'path';
import https from 'https';
import { URL } from 'url';

// ── Types ──────────────────────────────────────────────────

interface CucumberReport {
  elements?: Scenario[];
}

interface Scenario {
  steps?: Step[];
  tags?: { name: string }[];
}

interface Step {
  hidden?: boolean;
  result: { status: string };
}

interface TestResults {
  features: number;
  scenarios: number;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  tags: string[];
}

// ── Helpers ────────────────────────────────────────────────

const env = (key: string, fallback = ''): string => process.env[key] || fallback;

function parseReport(reportPath: string): TestResults {
  const empty: TestResults = { features: 0, scenarios: 0, passed: 0, failed: 0, skipped: 0, total: 0, tags: [] };

  if (!fs.existsSync(reportPath)) return empty;

  const report: CucumberReport[] = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const tags = new Set<string>();
  let passed = 0, failed = 0, skipped = 0, scenarios = 0;

  for (const feature of report) {
    for (const scenario of feature.elements ?? []) {
      scenarios++;
      scenario.tags?.forEach(t => tags.add(t.name));

      for (const step of scenario.steps ?? []) {
        if (step.hidden) continue;
        const { status } = step.result;
        if (status === 'passed') passed++;
        else if (status === 'failed') failed++;
        else skipped++;
      }
    }
  }

  return {
    features: report.length,
    scenarios,
    passed,
    failed,
    skipped,
    total: passed + failed + skipped,
    tags: [...tags],
  };
}

function writeGitHubOutputs(results: TestResults): void {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;

  const { tags, ...outputs } = results;
  for (const [key, value] of Object.entries(outputs)) {
    fs.appendFileSync(outputPath, `${key}=${value}\n`);
  }
}

function buildTeamsCard(results: TestResults): object {
  const isSuccess = env('JOB_STATUS') === 'success';
  const repo = env('REPO');
  const runId = env('RUN_ID');
  const sha = env('SHA');

  return {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: isSuccess ? '28a745' : 'dc3545',
    text: [
      `**${isSuccess ? '✅' : '❌'} BDD Test Run: ${isSuccess ? 'PASSED' : 'FAILED'}** | Env: ${env('ENV_NAME')} | Branch: ${env('BRANCH')}`,
      '',
      `🏷️ **Tags:** ${results.tags.join(', ') || 'none'}`,
      `📊 **Features:** ${results.features} | **Scenarios:** ${results.scenarios}`,
      `✅ **Passed:** ${results.passed} | ❌ **Failed:** ${results.failed} | ⏭️ **Skipped:** ${results.skipped} | **Total Steps:** ${results.total}`,
      '',
      `👤 **Triggered by:** ${env('ACTOR')} | **Commit:** ${sha.substring(0, 7)}`,
      '',
      `[View Workflow Run](https://github.com/${repo}/actions/runs/${runId}) | [View Commit](https://github.com/${repo}/commit/${sha}) | [Download Artifacts](https://github.com/${repo}/actions/runs/${runId}#artifacts)`,
    ].join('<br>'),
  };
}

function sendNotification(webhookUrl: string, card: object): Promise<void> {
  const url = new URL(webhookUrl);
  const payload = JSON.stringify(card);

  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        console.log(`Teams notification sent: ${res.statusCode} ${body}`);
        resolve();
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Main ───────────────────────────────────────────────────

async function main(): Promise<void> {
  const reportPath = path.resolve('test-results/cucumber-report.json');
  const results = parseReport(reportPath);

  writeGitHubOutputs(results);

  const webhookUrl = env('WEBHOOK_URL');
  if (!webhookUrl) {
    console.log('No WEBHOOK_URL set, skipping notification');
    return;
  }

  const card = buildTeamsCard(results);
  await sendNotification(webhookUrl, card);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
