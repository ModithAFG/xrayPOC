@application
Feature: Application Create/Read

    Feature Description : Creating and Reading  application

    @regression @sanity @QA-2428
    Scenario Outline: Verify if an application could be created in Flex
        Given an application is created with application ID
        And receives a successful response for create
        Then the response is saved