using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Alexa.NET.Response;
using Alexa.NET.Response.Directive;
using Amazon.Lambda.Core;
using Newtonsoft.Json;
using System;

/// <summary>
/// Summary description for MediaRater
/// </summary>
/// 

namespace MyMovieList;
public class MovieRater
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
        var ratingSlot = intentRequest.Intent.Slots["Rating"];
        if (listNameSlot == null || itemNameSlot == null || ratingSlot == null)
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
        int rating = 0;

        if(!int.TryParse(ratingSlot.Value, out rating))
        {
            return new SkillResponse
            {
                Version = "1.0",
                Response = new ResponseBody
                {
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"I didn't understand your rating." },
                    ShouldEndSession = true,
                }
            };
        }

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

        //Update item rating
        item.Rating = rating;

        //Save updated list to file
        File.WriteAllText(filePath, JsonConvert.SerializeObject(listItems));

        var responseMessage = $"The item, {itemName} in the list, {listName} has been rated {rating} out of 5 stars.";
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
