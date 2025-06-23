
import { Given, Then, When } from '@cucumber/cucumber';

import expect from 'expect';

const pass = true;

Given('an application is created with application ID', async function () {
    // Write code here that turns the phrase above into concrete actions
    console.log('Given: an application is created with application ID');
    console.log('pass:', pass);
});
Given('receives a successful response for create', async function () {
    // Write code here that turns the phrase above into concrete actions
    console.log('Given: receives a successful response for create');
});
Then('the response is saved', async function () {
    // Write code here that turns the phrase above into concrete actions
    console.log('Then: the response is saved');
  //expect(pass).toBe(false);
    
});

Given('there is an application', async function () {
           // Write code here that turns the phrase above into concrete actions
           console.log('Given: there is an application');
         });

Given('recieves a negative response for create', async function () {
           // Write code here that turns the phrase above into concrete actions
           console.log('Given: receives a negative response for create');
           expect(pass).toBe(true);
         });
Then('the response checked', async function () {
           // Write code here that turns the phrase above into concrete actions
           expect(pass).toBe(true);
           console.log('Then: the response checked');});

