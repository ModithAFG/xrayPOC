export default async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log('\nBeginning End to End test teardown');
  process.env.AUTHENTICATION_TOKEN = undefined;
  process.env.USER_ACCESS_TOKEN = undefined;
};
