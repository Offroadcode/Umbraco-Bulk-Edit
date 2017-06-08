using System;
using System.Net.Http;
using System.Net.Http.Headers;
using Umbraco.Core;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using UmbracoBulkEdit.Models;

namespace UmbracoBulkEdit.Controllers
{
    [PluginController("ORCCsv")]
    public class DatabaseController : UmbracoAuthorizedApiController
    {

        [System.Web.Http.AcceptVerbs("GET", "POST")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage DeleteSavedSearchByGuid(string guid)
        {
            var db = ApplicationContext.Current.DatabaseContext.Database;
            db.Execute("DELETE FROM BulkSavedSearch WHERE Guid=@0", guid); 
            var response = buildSerializedResponse(new
            {
                success = true 
            });
            return response;
        }

        [System.Web.Http.AcceptVerbs("GET", "POST")]
        [System.Web.Http.HttpGet]
        public HttpResponseMessage GetAllSavedSearches()
        {
            var db = ApplicationContext.Current.DatabaseContext.Database;
            var results = db.Fetch<BulkSavedSearch>("SELECT * from BulkSavedSearch");
            var response = buildSerializedResponse(new
            { 
                results = results
            }); 
            return response;
        }

        [System.Web.Http.AcceptVerbs("GET", "POST")]
        [System.Web.Http.HttpGet] 
        public HttpResponseMessage GetSavedSearchByGuid(string guid)
        {
            var db = ApplicationContext.Current.DatabaseContext.Database;
            var results = db.FirstOrDefault<BulkSavedSearch>("SELECT * from BulkSavedSearch WHERE Guid=@0", guid);
            var response = buildSerializedResponse(new
            {
                results = results
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

        private string saveSearch(string name, string options)
        {
            var db = ApplicationContext.Current.DatabaseContext.Database;
            Guid g = Guid.NewGuid();
            var guid = g.ToString();
            var bulkSavedSearch = new BulkSavedSearch
            {
                Guid = guid,
                Name = name,
                Options = options
            };
            db.Insert(bulkSavedSearch);
            return guid;
        }

        [System.Web.Http.AcceptVerbs("GET", "POST")]
        [System.Web.Http.HttpPost]
        public HttpResponseMessage PostSavedSearch(BulkSavedSearch search)
        {
            var guid = saveSearch(search.Name, search.Options);
            search.Guid = guid;
            var response = buildSerializedResponse(new
            {
                search = search,
                submitted = true
            });
            return response;
        }
    }
}