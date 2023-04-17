using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Alexa.NET.Response;
using Amazon.Lambda.Core;
using MyMovieList;
using System;

/// <summary>
/// Summary description for ListSearcher
/// </summary>
public class ListSearcherMovie
{
	public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
	{
		var intentRequest = input.Request as IntentRequest;
		var listName = intentRequest.Intent.Slots["ListName"].Value;
		var movie = intentRequest.Intent.Slots["Movie"].Value;

		//load saved list
		var list = ListManagement.LoadListFromFile(listName);
        //set response text to nothing so we can build string based on answer
        var responseText = "";

        if (list == null)
        {
            responseText = $"The list {listName} does not exist.";
        }
		else if (list.Contains(movie))
		{
			responseText = $"{movie} is in the list {listName}.";
		}
		else
		{
			responseText = $"{movie} is not in the list {listName}. Try a different list.";
		}

		var response = new SkillResponse
		{
			Version = "1.0",
			Response = new ResponseBody
			{
				OutputSpeech = new PlainTextOutputSpeech { Text = responseText },
				ShouldEndSession = true,
			}
		};
		return response;
	}
}
