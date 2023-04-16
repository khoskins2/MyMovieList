using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Alexa.NET.Response;
using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Newtonsoft.Json;
using Alexa.NET;
using Amazon.Lambda.Core;
using System.Runtime.InteropServices;
using System.Web.Http;

namespace MyMovieList;
public class Helper
{ // my favorite of the many class names -dustin

    private static HttpClient _httpClient;
    public const string INVOCATION_NAME = "Helper";

    public Helper()
    {
        _httpClient = new HttpClient();
    }

    public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
    {

        var requestType = input.GetRequestType();
        if (requestType == typeof(IntentRequest))
        {
            var intentRequest = input.Request as IntentRequest;
            var askForHelp = intentRequest.Intent.Slots["Help"].Value;
            return MakeSkillResponse(
                    $"You would like more information on how to use this skill." +
                    $"If you want to create a new list, say create list." +
                    $"If you would like to delete a list, say delete list." +
                    $"If you would like to add an item to a list, say add item to list." +
                    $"If you would like to delete an item from a list, say remove item from list" +
                    $"If you would like to move an item from one list to another, say move item to a different list." +
                    $"If you would like me to read out a list, say read list.",
                    true);
        }
        else
        {
            return MakeSkillResponse(
                    $"I don't know how to handle this intent. Please say something like Alexa, {INVOCATION_NAME}",
                    true);
        }
    }


    private SkillResponse MakeSkillResponse(string outputSpeech,
        bool shouldEndSession,
        string repromptText = "Just say, tell me about Canada to learn more. To exit, say, exit.")
    {
        var response = new ResponseBody
        {
            ShouldEndSession = shouldEndSession,
            OutputSpeech = new PlainTextOutputSpeech { Text = outputSpeech }
        };

        if (repromptText != null)
        {
            response.Reprompt = new Reprompt() { OutputSpeech = new PlainTextOutputSpeech() { Text = repromptText } };
        }

        var skillResponse = new SkillResponse
        {
            Response = response,
            Version = "1.0"
        };
        return skillResponse;
    }
}