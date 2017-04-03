namespace Orc.CsvExport.Controllers
{
    using Umbraco.Web.Mvc;
    using Umbraco.Web.WebApi;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Web.Http;
    /// <summary>
    /// The content api controller.
    /// </summary>
    [PluginController("ORCCsv")] 
    public class ContentController : UmbracoAuthorizedApiController
    {

        [System.Web.Http.AcceptVerbs("GET", "POST")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage SavePropertyForNode(int nodeId, string propertyName, string propertyValue)
        {
            var node = Services.ContentService.GetById(nodeId);

            node.SetValue(propertyName, propertyValue);

            Services.ContentService.SaveAndPublishWithStatus(node);

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
    }
}