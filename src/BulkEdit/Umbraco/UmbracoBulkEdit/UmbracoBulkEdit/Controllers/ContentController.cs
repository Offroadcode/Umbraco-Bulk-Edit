using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using UmbracoBulkEdit.Models;

namespace UmbracoBulkEdit.Controllers
{
    [PluginController("ORCCsv")] 
    public class ContentController : UmbracoAuthorizedApiController
    {

        [System.Web.Http.AcceptVerbs("GET", "POST")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage SavePropertyForNode(int nodeId, string propertyName, string propertyValue)
        {
            SaveNodeProperty(nodeId, propertyName, propertyValue);

            var responseObject = new {
                submitted = true
            };

            var serialized = Newtonsoft.Json.JsonConvert.SerializeObject(responseObject);

            var response = new HttpResponseMessage()
            {
                Content = new StringContent(serialized)
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            return response;
            
        }

        private bool SaveNodeProperty(int nodeId, string alias, string value)
        {
            var node = Services.ContentService.GetById(nodeId);

            node.SetValue(alias, value);

            Services.ContentService.SaveAndPublishWithStatus(node);

            return true;
        }

        [System.Web.Http.AcceptVerbs("GET", "POST")]
        [System.Web.Http.HttpPost]
        public HttpResponseMessage SaveNodes(IEnumerable<Node> nodes)
        {
            foreach (Node node in nodes)
            {
                foreach (Property prop in node.Properties)
                {
                    SaveNodeProperty(node.Id, prop.Alias, prop.Value);
                }
            }
            var responseObject = new
            {
                submitted = true
            };

            var serialized = Newtonsoft.Json.JsonConvert.SerializeObject(responseObject);

            var response = new HttpResponseMessage()
            {
                Content = new StringContent(serialized)
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            return response;
        }
    }
}