using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Alexa.NET.Response;
using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Newtonsoft.Json;
using Alexa.NET;
using Amazon.Lambda.Core;
using System.Runtime.InteropServices;
using System.Web.Http;

namespace MyMovieList;
public class Helper { // my favorite of the many class names -dustin

    public Helper(){
        //constuctor goes here

    }

    [HttpPost, Route("api/alexa/demo")]
    public dynamic HelperClass(dynamic request)
    {
        return new
        {
            version = "1.0",
            sessionAttributes = new { },
            response = new
            {
                outputSpeech = new
                {
                    //What Alexa will read out to you
                    type = "PlainText",
                    text = "Whatever Alexa says"
                },
                card = new
                {
                    type = "Simple",
                    title = "Helper Class",
                    content = "Whatever Alexa says"
                },
                //shouldEndSession property of the response object in a skill that requires multiple interactions with Alexa, you set this to false
                shouldEndSession = false
            }
        };
    }
}