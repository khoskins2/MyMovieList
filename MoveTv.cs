using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Alexa.NET.Response;
using Amazon.Lambda.Core;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;

namespace MyMovieList
{
    public class MoveTv
    {
        public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
        {
            var intentRequest = input.Request as IntentRequest;

            var tvShow = intentRequest.Intent.Slots["TvShow"].Value;
            var sourceListName = intentRequest.Intent.Slots["SourceListName"].Value;
            var targetListName = intentRequest.Intent.Slots["TargetListName"].Value;

            // Check if source list file exists
            var sourceListFilePath = $"Lists/{sourceListName}.json";
            if (!File.Exists(sourceListFilePath))
            {
                var errorResponse = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"The source list, {sourceListName} cannot be found." },
                        ShouldEndSession = true,
                    }
                };
                return errorResponse;
            }

            // Check if target list file exists
            var targetListFilePath = $"Lists/{targetListName}.json";
            if (!File.Exists(targetListFilePath))
            {
                var errorResponse = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"The target list, {targetListName} cannot be found." },
                        ShouldEndSession = true,
                    }
                };
                return errorResponse;
            }

            // Load source list from Json file
            var sourceList = ListManagement.LoadListFromFile(sourceListName);

            // Check if item exists in source list
            if (!sourceList.Contains(tvShow))
            {
                var errorResponse = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"The item, {tvShow} cannot be found in {sourceListName}." },
                        ShouldEndSession = true,
                    }
                };
                return errorResponse;
            }

            // Load target list from Json file
            var targetList = ListManagement.LoadListFromFile(targetListName);

            // Move item from source to target list
            sourceList.Remove(tvShow);
            targetList.Add(tvShow);

            // Save source list to Json file
            ListManagement.SaveListToFile(sourceListName, sourceList);

            // Save target list to Json file
            ListManagement.SaveListToFile(targetListName, targetList);

            // Return success response
            var response = new SkillResponse
            {
                Version = "1.0",
                Response = new ResponseBody
                {
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"I've moved {tvShow} from {sourceListName} to {targetListName}." },
                    ShouldEndSession = true
                }
            };
            return response;
        }
    }
}
