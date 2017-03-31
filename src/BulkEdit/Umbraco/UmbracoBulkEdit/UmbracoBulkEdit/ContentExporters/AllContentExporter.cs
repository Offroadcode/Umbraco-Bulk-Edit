using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace Orc.CsvExport.ContentExporters
{
    public class AllContentExporter: BaseContentExporter<IContent>
    {
        public override int GetId(IContent entry)
        {
            return entry.Id;
        }

        public override string GetName(IContent entry)
        {
            return entry.Name; 
        }
        public override string GetType(IContent entry)
        {
            return entry.ContentType.Name;
        }

        public override string GetUrl(IContent entry)
        {
            if (entry.Published)
            {
                var item = UmbracoContext.Current.ContentCache.GetById(entry.Id);
                return item.Url;
            }
            return null;
        }

        public override DataTable GetData(string documentTypeAlias, int? rootId)
        {
            var entries = new List<IContent>();
            if (rootId.HasValue)
            {
                entries = GetDescendantsOfId(documentTypeAlias, rootId.Value);
            }
            else
            {
                entries = GetAllContentOfId(documentTypeAlias);
            }

            return ToDataTable(entries);
        }
        private List<IContent> GetAllContentOfId(string documentTypeAlias)
        {
            var contentType= ApplicationContext.Current.Services.ContentTypeService.GetContentType(documentTypeAlias);

            return ApplicationContext.Current.Services.ContentService.GetContentOfContentType(contentType.Id).ToList();
        }

        private List<IContent> GetDescendantsOfId(string documentTypeAlias, int rootId)
        {
            var contentType = ApplicationContext.Current.Services.ContentTypeService.GetContentType(documentTypeAlias);

            return ApplicationContext.Current.Services.ContentService.GetById(rootId).Descendants().Where(x => x.ContentTypeId == contentType.Id).ToList();
        }

        public override IEnumerable<PropertyEntry> GetPropertiesInEntry(IContent entry)
        {
            yield return new PropertyEntry()
            {
                Value = entry.HasPublishedVersion,
                PropertyAlias = "HasPublishedVersion",
                Type = typeof(string)
            };
            foreach (var item in entry.Properties)
            {
                
                    var property = new PropertyEntry()
                    {
                        Value = item.Value,
                        PropertyAlias = item.PropertyType.Alias,
                        Type = item.Value.GetType()
                    };
                    yield return property;
                
            }
        }
    }
}
