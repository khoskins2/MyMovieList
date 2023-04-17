﻿using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Alexa.NET.Response;
using Amazon.Lambda.Core;
using System.IO;

namespace MyMovieList
{
    public class ListRenamer
    {
        public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
        {
            var intentRequest = input.Request as IntentRequest;

            var oldListName = intentRequest.Intent.Slots["OldListName"].Value;
            var newListName = intentRequest.Intent.Slots["NewListName"].Value;

            var oldFilePath = $"Lists/{oldListName}.json";
            if (!File.Exists(oldFilePath))
            {
                var errorResponse = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"The list, {oldListName} cannot be found." },
                        ShouldEndSession = true,
                    }
                };
                return errorResponse;
            }

            var newFilePath = $"Lists/{newListName}.json";
            if (File.Exists(newFilePath))
            {
                var errorResponse = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"A list with the name {newListName} already exists." },
                        ShouldEndSession = true,
                    }
                };
                return errorResponse;
            }

            var list = ListManagement.LoadListFromFile(oldListName);

            ListManagement.SaveListToFile(newListName, list);

            File.Delete(oldFilePath);

            var response = new SkillResponse
            {
                Version = "1.0",
                Response = new ResponseBody
                {
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"{oldListName} has been renamed to {newListName}" },
                    ShouldEndSession = true
                }
            };
            return response;
        }
    }
}
