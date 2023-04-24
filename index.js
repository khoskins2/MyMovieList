/** 
 * Katie Hoskins's and Dustin Bailey's Alexa skills app "MyMediaList"
 * This app works Alexa, AWS, and Amazons product database.
 * This app allows users to manipulate Alexa's built in household lists. It checks for input type 
 * (either Movie or TVseries) and lets the user organize lists composed of items. The user can add, delete, movie, and review 
 * thier chosen media items as well as add and delete custom Alexa lists. 
 * 
 * This code is written by Katie and Dustin based off code retrieved from:
 * https://github.com/alexa/alexa-cookbook/blob/master/feature-demos/list-api/skill-demo-create-get-custom-list/lambda/index.js
 */

const Alexa = require('ask-sdk-core');
const { services } = require('ask-sdk-model');
//Take these out
const helpSpeech = 'To create a list, say create list name. To delete a list say, delete list name. To add to a list, say add movie or tv show. To delete from a list, say delete movie or tv show. To get all of your custom lists, say tell me my media lists.'
            
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const { permissions } = handlerInput.requestEnvelope.context.System.user
        // Check if permissions has been granted. If not request it.
        if (!permissions) {
          const permissions = [
              'write::alexa:household:list',
              'read::alexa:household:list'
          ];
          return handlerInput.responseBuilder
            .speak('Alexa List permissions are missing. You can grant permissions within the Alexa app.')
            .withAskForPermissionsConsentCard(permissions)
            .getResponse();
        }
        //change what this says
        const introSpeech = "Welcome to my media list!",
            speakOutput = `${introSpeech}.`
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CreateListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreateListIntent';
    },
    async handle(handlerInput) {
        
        // Create an instance of the ListManagementServiceClient
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();
        
        const listName = Alexa.getSlotValue(handlerInput.requestEnvelope, 'listName');
        
        // Make use listClient to make an async HTTP request to create the list
        try {
            const response = await listClient.createList({
                "name": listName,
                "state": "active"
            }, "")
            
        //To make it not catch this error you must invoke the intent with something like "create list dogs"
        } catch(error) {
            console.log(`~~~~ ERROR ${JSON.stringify(error)}`)
            return handlerInput.responseBuilder
                .speak(`You already have a list with the name, ${listName}.`)
                //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                .getResponse();
        }
        
        return handlerInput.responseBuilder
            .speak(`Your list, ${listName}, has been created.`)
            .reprompt('The list was created. What else would you like to do?')
            .withShouldEndSession(false)
            .getResponse();
    }
};



// allows user to add movie to a list 
const AddTVShowIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddTVShowIntent';
    },
    async handle(handlerInput) {
        // Prompt user for list name
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const TVShow = Alexa.getSlotValue(handlerInput.requestEnvelope, 'TVShow')
        sessionAttributes.TVShow = TVShow;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        return handlerInput.responseBuilder
                    .speak(`Okay, to which list do you want to add the TV show, ${TVShow}?`)
                    .reprompt(`Which list would you like to add, ${TVShow}?`)
                    .withShouldEndSession(false)
                    .getResponse();
    },
};

// allows user to add movie to a list 
const AddMovieIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddMovieIntent';
    },
    async handle(handlerInput) {
        // Prompt user for list name
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const Movie = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Movie')
        sessionAttributes.Movie = Movie;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        return handlerInput.responseBuilder
                    .speak(`Okay, to which list do you want to add the movie, ${Movie}?`)
                    .reprompt(`Which list would you like to add, ${Movie}?`)
                    .withShouldEndSession(false)
                    .getResponse();
    },
};

const AddMovieToListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddMovieToListIntent';
    },
    async handle(handlerInput) {
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();
        const listName = Alexa.getSlotValue(handlerInput.requestEnvelope, 'listName');

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        try {
            const lists = await listClient.getListsMetadata();
            const list = lists.lists.find(l => l.name.toLowerCase() === listName.toLowerCase()
      );
      
            if (!list) {
                return handlerInput.responseBuilder
                    .speak(`I'm sorry, I couldn't find a list with the name, ${listName}.`)
                    .withShouldEndSession(false)
                    .getResponse();
            }
            const createListItemRequest = {
                'value': sessionAttributes.Movie,
                'status': 'active'
            };
            
            
        await listClient.createListItem(list.listId, createListItemRequest);

        } catch(error) {
            console.log(`~~~~ ERROR ${JSON.stringify(error)}`)
            return handlerInput.responseBuilder
                .speak("Cant do that").withShouldEndSession(false)
                .getResponse();
        }
        
        return handlerInput.responseBuilder
            .speak(`The movie, ${sessionAttributes.Movie}, has been added to the list, ${listName}.`)
            .reprompt(`The movie was added. What else would you like to do?`)
            .withShouldEndSession(false)
            .getResponse();
    },
};


// allows user to add tv shows to their list 
const AddTVShowToListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddTVShowToListIntent';
    },
    async handle(handlerInput) {
        // Create an instance of the ListManagementServiceClient
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();
        const listName = Alexa.getSlotValue(handlerInput.requestEnvelope, 'listName');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        try {
            const lists = await listClient.getListsMetadata();
            const list = lists.lists.find(l => l.name.toLowerCase() === listName.toLowerCase());
            if (!list) {
                return handlerInput.responseBuilder
                    .speak(`I'm sorry, I couldn't find a list with the name, ${listName}.`)
                    .withShouldEndSession(false)
                    .getResponse();
            }
            
            const createListItemRequest = {
                "value": sessionAttributes.TVShow,
                "status": "active"
            };
        
        await listClient.createListItem(list.listId, createListItemRequest);

        } catch(error) {
            console.log(`~~~~ ERROR ${JSON.stringify(error)}`)
            return handlerInput.responseBuilder
                .speak("Cant do that")
                .withShouldEndSession(false)
                .getResponse();
        }
        
        return handlerInput.responseBuilder
            .speak(`The TV show, ${sessionAttributes.TVShow}, has been added to the list, ${listName}.`)
            .reprompt(`The TV show was added. What else would you like to do?`)
            .withShouldEndSession(false)
            .getResponse();
    },
};


const DeleteListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteListIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope } = handlerInput;
        const { userId } = requestEnvelope.session.user;
        const listName = Alexa.getSlotValue(requestEnvelope, 'listName');
        
        // Create an instance of the ListManagementServiceClient
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();

        try {
           // Get the list ID for the list name provided, getListsMetadata() call required
            const lists = await listClient.getListsMetadata();

            const list = lists.lists.find(l => l.name.toLowerCase() === listName.toLowerCase());

            //if list doesnt exist
            if (!list) {
                return handlerInput.responseBuilder
                    .speak(`I'm sorry, I couldn't find a list with the name, ${listName}.`)
                    .withShouldEndSession(false)
                    .getResponse();
            }
            
            // Delete the list with the list ID
            await listClient.deleteList(list.listId);

            return handlerInput.responseBuilder
                .speak(`The list, ${listName}, has been deleted.`)
                .reprompt(`The list was deleted. What else would you like to do?`)
                .withShouldEndSession(false)
                .getResponse();
        } catch (error) {
            console.error(`Error deleting list: ${error.message}`);
            return handlerInput.responseBuilder
                .speak(`There was an error deleting the list, ${listName}. Please try again later.`)
                .withShouldEndSession(false)
                .getResponse();
        }
    },
};


const GetListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetListIntent';
    },
    async handle(handlerInput) {
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();
        
        try {
            // Use the listClient to retrieve lists for user's account
            const response = await listClient.getListsMetadata()
            
            // Remove the default lists to get only the custom lists
            const customLists = response.lists.splice(2)
            
            // Map to get only the list names from the object and join them separated by a comma
            const listStr = customLists.map((list) => list.name).join(',')
            
            // Speak out the custom lists on the user's account
            return handlerInput.responseBuilder
                .speak(`You have ${customLists.length} custom lists: ${listStr}`)
                .reprompt(`If you would like me to read the lists again, repeat the interaction.`)
                .withShouldEndSession(false)
                .getResponse();
        } catch(error) {
            console.log(`~~~~ ERROR ${JSON.stringify(error)}`)
            return handlerInput.responseBuilder
                .speak("An error occured. Please try again later.")
                .withShouldEndSession(false)
                .getResponse();    
        }
    }
};

//delete tvshow from list
const DeleteTVShowIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteTVShowIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope } = handlerInput;
        
        //like a variable
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const TVShow = Alexa.getSlotValue(handlerInput.requestEnvelope, 'TVShow')
        sessionAttributes.TVShow = TVShow;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        return handlerInput.responseBuilder
                    .speak(`Okay, from which list do you want to delete the TV show, ${TVShow}?`)
                    .reprompt(`Which list would you like to delete the TV show, ${TVShow}, from?`)
                    .withShouldEndSession(false)
                    .getResponse();
    },
};
   
/**
 * now we get user list and delete the stuff
 * 
**/
const DeleteTVShowFromListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteTVShowFromListIntent';
    },
    async handle(handlerInput) {
        // Create an instance of the ListManagementServiceClient
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();
        const listName = Alexa.getSlotValue(handlerInput.requestEnvelope, 'listName');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        
        try {
            
            const lists = await listClient.getListsMetadata();
            const list = lists.lists.find(l => l.name.toLowerCase() === listName.toLowerCase());
            if (!list) {
                return handlerInput.responseBuilder
                    .speak(`I'm sorry, I couldn't find a list with the name, ${listName}.`)
                    .withShouldEndSession(false)
                    .getResponse();
            }
            
            // the name is items.value, we need access to items.id.
            // get name
            const TVShow = sessionAttributes.TVShow;
            //call .getList(list) to return the list, gaining access to items[] inside list.
            const itemsArray = await listClient.getList(list.listId, "active");
            //work through items Array 
            const TVShowId = itemsArray.items.find(l => l.value.toLowerCase() === TVShow.toLowerCase());
            
            await listClient.deleteListItem(list.listId, TVShowId.id, sessionAttributes.apiAccessToken);
            
            const speechOutput = `The tv show, ${TVShow}, has been deleted from your list, ${listName}.`;
            return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(`The TV show was deleted. What else would you like to do?`)
                    .withShouldEndSession(false)
                    .getResponse();

        } catch (error) {
            console.log(`~~~~ ERROR ${JSON.stringify(error)}`)
            const speechOutput = `Sorry, I could not find the tv show, ${sessionAttributes.TVShow}, on your the list, ${listName}.`;
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .withShouldEndSession(false)
                .getResponse();
    }
  },
};

//delete movie from list
const DeleteMovieIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteMovieIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope } = handlerInput;
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const Movie = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Movie')
        sessionAttributes.Movie = Movie;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        return handlerInput.responseBuilder
                    .speak(`Okay, from which list do you want to delete the movie, ${Movie}?`)
                    .reprompt(`Which list would you like to delete the movie, ${Movie}, from?`)
                    .withShouldEndSession(false)
                    .getResponse();
    },
};
   
/**
 * now we get user list and delete the stuff
 * 
**/
const DeleteMovieFromListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DeleteMovieFromListIntent';
    },
    async handle(handlerInput) {
        // Create an instance of the ListManagementServiceClient
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();
        const listName = Alexa.getSlotValue(handlerInput.requestEnvelope, 'listName');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        
        try {
            //gets list
            const lists = await listClient.getListsMetadata();
            const list = lists.lists.find(l => l.name.toLowerCase() === listName.toLowerCase());
            if (!list) {
                return handlerInput.responseBuilder
                    .speak(`I'm sorry, I couldn't find a list with the name, ${listName}.`)
                    .withShouldEndSession(false)
                    .getResponse();
            }
            // the name is items.value, we need access to items.id.
            // get name
            const Movie = sessionAttributes.Movie;
            //call .getList(list) to return the list, gaining access to items[] inside list.
            const itemsArray = await listClient.getList(list.listId, "active");
            //work through items Array 
            const MovieId = itemsArray.items.find(i => i.value.toLowerCase() === Movie.toLowerCase());
            
            await listClient.deleteListItem(list.listId, MovieId.id, sessionAttributes.apiAccessToken);
        
        } catch(error) {
            console.log(`~~~~ ERROR ${JSON.stringify(error)}`)
            return handlerInput.responseBuilder
                .speak(`Sorry I could not find the movie, ${sessionAttributes.Movie}, on your list, ${listName}.`)
                .withShouldEndSession(false)
                .getResponse();
        }
        
        return handlerInput.responseBuilder
            .speak(`The movie, ${sessionAttributes.Movie}, has been deleted`)
            .reprompt(`The movie was deleted. What else would you like to do?`)
            .withShouldEndSession(false)
            .getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = `${helpSpeech}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const CancelIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
    },
    handle(handlerInput) {
        const speakOutput = 'Action cancelled.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const StopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Thanks for using my media list!'
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();   
    }
}

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CreateListIntentHandler,
        AddMovieIntentHandler,
        AddMovieToListIntentHandler,
        DeleteListIntentHandler,
        DeleteTVShowIntentHandler,
        DeleteTVShowFromListIntentHandler,
        DeleteMovieIntentHandler,
        DeleteMovieFromListIntentHandler,
        GetListIntentHandler,
        AddTVShowIntentHandler,
        AddTVShowToListIntentHandler,
        HelpIntentHandler,
        CancelIntentHandler,
        StopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .withApiClient(new Alexa.DefaultApiClient()) // Add it to the response builder to get access the to ListManagementClient
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();