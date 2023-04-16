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
{
    private static HttpClient _httpClient;
    public const string INVOCATION_NAME = "Country Info";

    public Helper()
    {
        _httpClient = new HttpClient();
    }

    public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
    {

        var requestType = input.GetRequestType();
        if (requestType == typeof(IntentRequest))
        {
            return MakeSkillResponse(
                    $"Sure. Here is some information about this skill." + $"If you would like to create a list say, create list." + $"If you would like to delete a list, say delete list." + $"If you would like to add an item to a list, say add item to list." + $"If you would like to remove an item from a list, say remove item from list." + $"If you would like to move an item to a different list, say move item" + $"If you would like me to read the contents of a list, say read list.",
                    true);
        }
        else
        {
            return MakeSkillResponse(
                    $"I don't know how to handle this intent.",
                    true);
        }
    }


    private SkillResponse MakeSkillResponse(string outputSpeech,
        bool shouldEndSession,
        string repromptText = "If you need help just say, help!")
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
