
using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Alexa.NET.Response;
using Amazon.Lambda.Core;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

public class ReadReviewMovie
{
    public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
    {
        var intentRequest = input.Request as IntentRequest;

        if (intentRequest == null)
        {
            return new SkillResponse
            {
                Version = "1.0",
                Response = new ResponseBody
                {
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"Sorry, I didn't understand your request" },
                    ShouldEndSession = true,
                }
            };
        }

        var listNameSlot = intentRequest.Intent.Slots["ListName"];
        var itemNameSlot = intentRequest.Intent.Slots["Movie"];

        if (listNameSlot == null || itemNameSlot == null)
        {
            return new SkillResponse
            {
                Version = "1.0",
                Response = new ResponseBody
                {
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"Sorry, I couldn't find the list or item you mentioned" },
                    ShouldEndSession = true,
                }
            };
        }

        var listName = listNameSlot.Value;
        var itemName = itemNameSlot.Value;

        var filePath = $"Lists/{listName}.json";
        if (!File.Exists(filePath))
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

        //Load list from file
        var listItems = JsonConvert.DeserializeObject<List<ListItem>>(File.ReadAllText(filePath));

        //Find item in list
        var item = listItems.FirstOrDefault(x => x.Name == itemName);
        if (item == null)
        {
            var errorResponse = new SkillResponse
            {
                Version = "1.0",
                Response = new ResponseBody
                {
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"The item, {itemName} cannot be found in the list, {listName}" },
                    ShouldEndSession = true,
                }
            };
            return errorResponse;
        }

        //Read out rating
        var responseMessage = $"The rating for {itemName} in the list, {listName} is {item.Rating} out of 5 stars.";

        var response = new SkillResponse
        {
            Version = "1.0",
            Response = new ResponseBody
            {
                OutputSpeech = new PlainTextOutputSpeech { Text = responseMessage },
                ShouldEndSession = true,
            }
        };
        return response;
    }

    public class ListItem
    {
        public string Name { get; set; }
        public int Rating { get; set; }

        public ListItem(string name, int rating)
        {
            Name = name;
            Rating = rating;
        }

        public ListItem()
        {
            // Parameterless constructor for deserialization from JSON
        }
    }
}
