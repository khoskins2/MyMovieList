using System.Net.Http;
using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Alexa.NET.Response;
using Amazon.Lambda.Core;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializerAttribute(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]


namespace MyMovieList;
public class MyMovieList
{
    private static HttpClient _httpClient;
    public const string INVOCATION_NAME = "Country Info";

    public MyMovieList()
    {
        _httpClient = new HttpClient();
    }

    public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
    {

        var requestType = input.GetRequestType();
        if (requestType == typeof(IntentRequest))
        {
            var intentRequest = input.Request as IntentRequest;
            var movieRequest = intentRequest.Intent.Slots["Movie"].Value;
            return MakeSkillResponse(
                   $"Did you ask about {movieRequest}",
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
