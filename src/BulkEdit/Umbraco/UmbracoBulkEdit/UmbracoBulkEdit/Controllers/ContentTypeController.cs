namespace Orc.CsvExport.Controllers
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Web.Http;

    using AutoMapper;

    using Umbraco.Core.Models;
    using Umbraco.Core.PropertyEditors;
    using Umbraco.Web.Models.ContentEditing;
    using Umbraco.Web.Mvc;
    using Umbraco.Web.WebApi;
    using System.Net.Http;
    using System.Net.Http.Headers;    /// <summary>
                                      /// The data type controller.
                                      /// </summary>
    [PluginController("ORCCsv")]
    public class ContentTypeController : UmbracoAuthorizedApiController
    {

        [System.Web.Http.HttpGet]
        public HttpResponseMessage GetAll() 
        {
            IEnumerable<IContentType> types = Services.ContentTypeService.GetAllContentTypes().OrderBy(x => x.SortOrder).Select(x => x);
            var response = buildSerializedResponse(new
            {
                results = types
            });
            return response;
        }

        private HttpResponseMessage buildSerializedResponse(object objectToReturn)
        {
            var serialized = Newtonsoft.Json.JsonConvert.SerializeObject(objectToReturn);
            var response = new HttpResponseMessage()
            {
                Content = new StringContent(serialized)
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            return response;
        }

    }
}