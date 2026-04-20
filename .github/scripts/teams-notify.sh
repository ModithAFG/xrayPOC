#!/bin/bash
set -e

# Required env vars: JOB_STATUS, WEBHOOK_URL, ENV_NAME, BRANCH, FEATURES, SCENARIOS,
# PASSED, FAILED, SKIPPED, TOTAL, ACTOR, SHA, REPO, RUN_ID

if [ "$JOB_STATUS" = "success" ]; then
  COLOR="28a745"
  ICON="✅"
  STATUS="PASSED"
else
  COLOR="dc3545"
  ICON="❌"
  STATUS="FAILED"
fi

SHORT_SHA=$(echo "$SHA" | cut -c1-7)
RUN_URL="https://github.com/${REPO}/actions/runs/${RUN_ID}"
COMMIT_URL="https://github.com/${REPO}/commit/${SHA}"

PAYLOAD=$(cat <<EOF
{
  "@type": "MessageCard",
  "@context": "http://schema.org/extensions",
  "themeColor": "${COLOR}",
  "text": "**${ICON} BDD Test Run: ${STATUS}** | Env: ${ENV_NAME} | Branch: ${BRANCH}<br><br>📊 **Features:** ${FEATURES} | **Scenarios:** ${SCENARIOS}<br>✅ **Passed:** ${PASSED} | ❌ **Failed:** ${FAILED} | ⏭️ **Skipped:** ${SKIPPED} | **Total Steps:** ${TOTAL}<br><br>👤 **Triggered by:** ${ACTOR} | **Commit:** ${SHORT_SHA}<br><br>[View Workflow Run](${RUN_URL}) | [View Commit](${COMMIT_URL})"
}
EOF
)

curl -s -H "Content-Type: application/json" -d "$PAYLOAD" "$WEBHOOK_URL"
