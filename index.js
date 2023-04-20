// This sample demonstrates how to use the ListManagementClient through ASK SDK v2 to create and get custom lists.

const Alexa = require('ask-sdk-core');

//Take these out
const helpSpeech = 'To create a list, say create a list. To delete a list say, delete a list. To add to a list, say add to list. To delete from a list, say delete from list. To rate an item say rate. To review an item, say review.'
const STOP_MESSAGE = 'Goodbye!';
            
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        //change what this says
        const introSpeech = "Welcome to my media list",
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
                .speak("Your list must be given a name. Please try again")
                //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                .getResponse();
        }
        
        return handlerInput.responseBuilder
            .speak("List was successfully created.")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// allows user to add movie to a list 
const AddMovieIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddMovieListIntent';
    },
    async handle(handlerInput) {
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
        
        // Create an instance of the ListManagementServiceClient
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();
        // trying out Alexa.getSlot instead of getSlotValue
        const movieName = Alexa.getSlot(handlerInput.requestEnvelope, 'Movie');
        const listName = Alexa.getSlotValue(handlerInput.requestEnvelope, 'listName');
        
        // createListItem(listId: string, createListItemRequest: services.listManagement.CreateListItemRequest)
        //updateListItem(listId: string, itemId: string, updateListItemRequest: services.listManagement.UpdateListItemRequest): 
        
        try {
            const response = await listClient.createListItem(listName, );

        //To make it not catch this error you must invoke the intent with something like "create list dogs"
        } catch(error) {
            console.log(`~~~~ ERROR ${JSON.stringify(error)}`)
            return handlerInput.responseBuilder
                .speak("Your list must be given a name. Please try again")
                //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                .getResponse();
        }
        
        return handlerInput.responseBuilder
            .speak("Movie was successfully added.")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
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

        // Check if the user has granted permission to Alexa to access their lists
        const { permissions } = requestEnvelope.context.System.user;
        if (!permissions || !permissions.consentToken) {
            return handlerInput.responseBuilder
                .speak('You must grant permission to access your lists. Check your Alexa app for more details.')
                .withAskForPermissionsConsentCard(['read::alexa:household:list', 'write::alexa:household:list'])
                .getResponse();
        }
        
        // Create an instance of the ListManagementServiceClient
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();

        try {
            // Get the list ID for the list name provided
            const lists = await listClient.getListsMetadata({
                customerId: userId,
                name: listName,
            });
            const list = lists.lists.find(l => l.name.toLowerCase() === listName.toLowerCase());
            if (!list) {
                return handlerInput.responseBuilder
                    .speak(`I'm sorry, I couldn't find a list with the name ${listName}.`)
                    .getResponse();
            }

            // Delete the list with the list ID
            await listClient.deleteList({
                listId: list.listId,
                customerId: userId,
            });

            return handlerInput.responseBuilder
                .speak(`The ${listName} list has been deleted.`)
                .getResponse();
        } catch (error) {
            console.error(`Error deleting list: ${error.message}`);
            return handlerInput.responseBuilder
                .speak(`There was an error deleting the ${listName} list. Please try again later.`)
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
        // Check if permissions has been granted. If not request it.
        const { permissions } = handlerInput.requestEnvelope.context.System.user
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
                .getResponse();
        } catch(error) {
            console.log(`~~~~ ERROR ${JSON.stringify(error)}`)
            return handlerInput.responseBuilder
                .speak("An error occured. Please try again later.")
                .getResponse();    
        }
    }
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
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Thanks for checking out the custom list demo!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

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
        DeleteListIntentHandler,
        GetListIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .withApiClient(new Alexa.DefaultApiClient()) // Add it to the response builder to get access the to ListManagementClient
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();