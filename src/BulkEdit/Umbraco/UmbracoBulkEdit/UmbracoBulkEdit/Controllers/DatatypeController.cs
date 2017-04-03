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
    public class DataTypeController : UmbracoAuthorizedApiController
    {
        /// <summary>
        /// The get by name.
        /// </summary>
        /// <param name="name">
        /// The name.
        /// </param>
        /// <returns>
        /// The <see cref="DataTypeDisplay"/>.
        /// </returns>       
        public HttpResponseMessage GetById(int id) 
        {
            var all = this.Services.DataTypeService.GetAllDataTypeDefinitions().ToList();
            var found = all.FirstOrDefault(x => x.Id == id);
            if (found == null)
            {
                throw new System.Exception("Datatype " + id + "not found");
            }
            var formatted = FormatDataType(found);
            if (formatted == null)
            {
                throw new System.Exception("Datatype " + id + "not found");
            }
            var serialized = Newtonsoft.Json.JsonConvert.SerializeObject(formatted);

            var resp = new HttpResponseMessage()
            {
                Content = new StringContent(serialized)
            };
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            return resp;

            //return ;
        }

        /// <summary>
        /// The format data type.
        /// </summary>
        /// <param name="dtd">
        /// The dtd.
        /// </param>
        /// <returns>
        /// The <see cref="object"/>.
        /// </returns>
        /// <exception cref="HttpResponseException">
        /// </exception>
        protected object FormatDataType(IDataTypeDefinition dtd)
        {
            if (dtd == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var dataTypeDisplay = Mapper.Map<IDataTypeDefinition, DataTypeDisplay>(dtd);
            var propEditor = PropertyEditorResolver.Current.GetByAlias(dtd.PropertyEditorAlias);

            var configDictionairy = new Dictionary<string, object>();

            foreach (var pv in dataTypeDisplay.PreValues)
            {
                configDictionairy.Add(pv.Key, pv.Value);
            }

            return new
            {
                guid = dtd.Key,
                propertyEditorAlias = dtd.PropertyEditorAlias,
                config = configDictionairy,
                view = propEditor.ValueEditor.View
            };
        }
    }
}