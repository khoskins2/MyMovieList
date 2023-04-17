using Alexa.NET.Request.Type;
using Alexa.NET.Request;
using Alexa.NET.Response;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.Json;
using System.IO;

namespace MyMovieList
{
    public class ListCreator
    {
        [assembly: LambdaSerializerAttribute(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]
        public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
        {
            // Parse the intent request from the input
            var intentRequest = input.Request as IntentRequest;

            // Extract the list name from the intent request
            var listName = intentRequest.Intent.Slots["ListName"].Value;

            // Check if a list with the same name already exists
            var filePath = $"Lists/{listName}.json";
            if (File.Exists(filePath))
            {
                var response = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"Sorry, a list with the name {listName} already exists." },
                        ShouldEndSession = true
                    }
                };
                return response;
            }

            // Create an empty list
            var list = new List<string>();

            // Save the list to a file
            ListManagement.SaveListToFile(listName, list);

            // Create a response to send back to Alexa
            var successResponse = new SkillResponse
            {
                Version = "1.0",
                Response = new ResponseBody
                {
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"I've saved the {listName}." },
                    ShouldEndSession = true
                }
            };

            return successResponse;
        }
    }
}
