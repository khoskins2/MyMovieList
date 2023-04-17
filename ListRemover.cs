using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Alexa.NET.Response;
using Alexa.NET.Response.Directive;
using Amazon.Lambda.Core;

/// <summary>
/// Summary description for ListRemover
/// </summary>
/// 

namespace MyMovieList;
public class ListRemover
{
	public SkillResponse FunctionHandler(SkillRequest input, ILambdaContext context)
	{
		var intentRequest = input.Request as IntentRequest;
		var listName = intentRequest.Intent.Slots["ListName"].Value;

		//Check confirmation
		var confirmationStatus = intentRequest.Intent.ConfirmationStatus;
		if(intentRequest.DialogState == DialogState.Started || intentRequest.DialogState == DialogState.InProgress)
		{
			if(confirmationStatus == "CONFIRMED")
			{
                //checks if list exists
                var filePath = $"Lists/{listName}.json";
                if (File.Exists(filePath))
                {
                    //delete list
                    File.Delete(filePath);
                    var response = new SkillResponse
                    {
                        Version = "1.0",
                        Response = new ResponseBody
                        {
                            OutputSpeech = new PlainTextOutputSpeech { Text = $"The list, {listName} has been deleted." },
                            ShouldEndSession = true,
                        }
                    };
                    return response;
                }
                //list doesnt exist
                else
                {
                    var response = new SkillResponse
                    {
                        Version = "1.0",
                        Response = new ResponseBody
                        {
                            OutputSpeech = new PlainTextOutputSpeech { Text = $"The list, {listName} cannot be found." },
                            ShouldEndSession = true,
                        }
                    };
                    return response;
                }
            }
			else if(confirmationStatus == "DENIED")
			{
                var response = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"The list, {listName} was not deleted." },
                        ShouldEndSession = true,
                    }
                };
                return response;
            }
			
		}
		//check confirmation manually
		else
		{
			var response = new SkillResponse
			{
				Version = "1.0",
				Response = new ResponseBody
				{
					OutputSpeech = new PlainTextOutputSpeech { Text = $"Are you sure you want to delete the list, {listName}?" },
					ShouldEndSession = false,
					//Make Alexa prompt user before delete
					Directives = new List<IDirective>
					{
						new DialogDelegate
						{
							UpdatedIntent = new Intent
							{
								Name = intentRequest.Intent.Name,
								Slots =intentRequest.Intent.Slots
							}
						}
					}
				}
			};
			return response;
		}

        var errorResponse = new SkillResponse
        {
            Version = "1.0",
            Response = new ResponseBody
            {
                OutputSpeech = new PlainTextOutputSpeech { Text = $"I didn't understand that. Please try again" },
                ShouldEndSession = false
            }
        };
        return errorResponse;
	}
}
