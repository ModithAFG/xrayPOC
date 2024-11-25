/* eslint-disable no-console */
import { AfterAll, Before, BeforeAll } from '@cucumber/cucumber';
import GlobalSetup from '../config/GlobalSetup';
import GlobalTeardown from '../config/GlobalTeardown';

BeforeAll(async () => {
  console.log('Before All: Setup');
  await GlobalSetup();
});

Before(async ({ pickle }) => {
  console.log('\nExecuting : ' + pickle.name + ' - ' + pickle.steps[pickle.steps.length - 1].text);
});

AfterAll(async function () {
  console.log('After All: Teardown');
  await GlobalTeardown();
});
