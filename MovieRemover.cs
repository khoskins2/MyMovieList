using Alexa.NET.Request.Type;
using Alexa.NET.Request;
using Alexa.NET.Response.Directive;
using Alexa.NET.Response;
using Amazon.Lambda.Core;

/// <summary>
/// Summary description for ItemRemover
/// </summary>
/// 

namespace MyMovieList;
public class MovieRemover
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
        var itemNameSlot = intentRequest.Intent.Slots["movie"];
        if (listNameSlot == null || itemNameSlot == null)
        {
            return new SkillResponse
            {
                Version = "1.0",
                Response = new ResponseBody
                {
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"Sorry, I couldn't find the item you mentioned" },
                    ShouldEndSession = true,
                }
            };
        }

        var listName = listNameSlot.Value;
        var itemToDelete = itemNameSlot.Value;

        //Check confirmation
        var confirmationStatus = intentRequest.Intent.ConfirmationStatus;
        if (intentRequest.DialogState == DialogState.Started || intentRequest.DialogState == DialogState.InProgress)
        {
            if (confirmationStatus == "CONFIRMED")
            {
                //checks if list exists
                var filePath = $"Lists/{listName}.json";
                if (File.Exists(filePath))
                {
                    //delete movie from list
                    var listItems = new List<string>(File.ReadAllLines(filePath));

                    if(listItems.Contains(itemToDelete))
                    {
                        listItems.Remove(itemToDelete);
                        File.WriteAllLines(filePath, listItems);
                    }

                    var response = new SkillResponse
                    {
                        Version = "1.0",
                        Response = new ResponseBody
                        {
                            OutputSpeech = new PlainTextOutputSpeech { Text = $"The movie, {itemToDelete} has been deleted from the list, {listName}" },
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
            else if (confirmationStatus == "DENIED")
            {
                var response = new SkillResponse
                {
                    Version = "1.0",
                    Response = new ResponseBody
                    {
                        OutputSpeech = new PlainTextOutputSpeech { Text = $"The movie, {itemToDelete} was not deleted." },
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
                    OutputSpeech = new PlainTextOutputSpeech { Text = $"Are you sure you want to delete the item, {itemToDelete}?" },
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