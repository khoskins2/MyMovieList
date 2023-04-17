using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Alexa.NET.Response;
using Amazon.Lambda.Core;
using Newtonsoft.Json;
using System.IO;

namespace MyMovieList
{
    public class TVAdder
    {
        public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
        {
            var intentRequest = input.Request as IntentRequest;

            var listName = intentRequest.Intent.Slots["ListName"].Value;
            var tvShow = intentRequest.Intent.Slots["tv_show"].Value;

            // Check if list file exists
            var listFilePath = $"Lists/{listName}.json";
            if (!File.Exists(listFilePath))
            {
                var errorResponse = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"The list, {listName} cannot be found." },
                        ShouldEndSession = true,
                    }
                };
                return errorResponse;
            }

            //Load list from Json file in order to save added item
            var list = ListManagement.LoadListFromFile(listName);

            if (list.Contains(tvShow))
            {
                var errorResponse = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"You have already added {tvShow} to {listName}." },
                        ShouldEndSession = true
                    }
                };
                return errorResponse;
            }

            //Add item
            list.Add(tvShow);

            //Save list to Json file
            ListManagement.SaveListToFile(listName, list);

            //Returns response to user request
            var response = new SkillResponse
            {
                Version = "1.0",
                Response = new ResponseBody
                {
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"I've added {tvShow} items to the {listName} list." },
                    ShouldEndSession = true
                }
            };

            return response;
        }
    }
}
