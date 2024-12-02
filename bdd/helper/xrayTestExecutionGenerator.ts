import * as fs from 'fs';
import path from 'path';

type XrayFields = {
  testPlanKey: string;
}

type Issue = {
  fields: {
    project: {
      key: string;
    };
    summary: string;
    issuetype: {
      id: string;
    };
  };
  xrayFields: XrayFields;
}

// Create the issue object
const testPlanID = () => process.env.XRAY_TESTPLAN_KEY ?? '';
const issueType = () => process.env.XRAY_ISSUETYPE_ID ?? '';
const environment = () => process.env.ENV ?? 'local';

export function xrayConfigFile(fileName: string) {
  const issue: Issue = {
    fields: {
      project: {
        key: 'QA',
      },
      summary: 'Test Execution for Platform BDD tests - ',
      issuetype: {
        id: '',
      },
    },
    xrayFields: {
      testPlanKey: '',
    },
  };

  // Append the environment to the summary field
  issue.fields.summary += ` ${environment()}`;
  const dateTime = new Date();
  const cleanedTime = dateTime//toString().split('GMT')[0].trim();
  // Append current date to the summary field
  issue.fields.summary += ` - ${cleanedTime}`;

  // Convert the object to a JSON string
  const jsonString = JSON.stringify(issue, null, 2);

  // Write the JSON string to a file

  try {
    fs.writeFileSync(path.join(__dirname, fileName), jsonString);
  } catch (error) {
    console.log('Error in creating Xray testExecution JSON file for ', environment());
  }
}
