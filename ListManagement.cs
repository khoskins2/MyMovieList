using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyMovieList
{
    public class ListManagement
    {
        public static List<string> LoadListFromFile(string listName)
        {
            var filePath = $"Lists/{listName}.json";
            if (!File.Exists(filePath))
            {
                return new List<string>();
            }
            using (var streamReader = new StreamReader(filePath))
            {
                var json = streamReader.ReadToEnd();
                return JsonConvert.DeserializeObject<List<string>>(json);
            }
        }

        public static void SaveListToFile(string listName, List<string> list)
        {
            var serializer = new JsonSerializer();
            var stream = new MemoryStream();
            var writer = new StreamWriter(stream);
            serializer.Serialize(writer, list);
            writer.Flush();
            stream.Position = 0;
            var reader = new StreamReader(stream);
            var json = reader.ReadToEnd();
            var filePath = $"Lists/{listName}.json";
            File.WriteAllText(filePath, json);
        }

    }
}
