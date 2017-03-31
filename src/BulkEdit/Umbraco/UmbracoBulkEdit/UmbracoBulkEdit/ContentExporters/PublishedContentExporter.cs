using Orc.CsvExport.ContentExporters;

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace Orc.CsvExport.ContentExporters
{
    public class PublishedContentExporter: BaseContentExporter<IPublishedContent>
    {
        public override DataTable GetData(string documentTypeAlias, int? rootId)
        {
            var entries = new List<IPublishedContent>();
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

        public override int GetId(IPublishedContent entry)
        {
            return entry.Id;
        }

        public override string GetName(IPublishedContent entry)
        {
            return entry.Name;
        }
        public override string GetType(IPublishedContent entry)
        {
            return entry.DocumentTypeAlias;
        }

        public override string GetUrl(IPublishedContent entry)
        {
            return entry.Url;
        }

        public override IEnumerable<PropertyEntry> GetPropertiesInEntry(IPublishedContent entry)
        {
            foreach(var item in entry.Properties)
            {
                if (item.HasValue)
                {
                    var property = new PropertyEntry()
                    {
                        Value = item.Value,
                        PropertyAlias = item.PropertyTypeAlias,
                        Type = item.Value.GetType()
                    };
                    yield return property;
                }
            }
        }

    

        private List<IPublishedContent> GetAllContentOfId(string documentTypeAlias)
        {
            return UmbracoContext.Current.ContentCache.GetByXPath("//" + documentTypeAlias).ToList();
        }

        private List<IPublishedContent> GetDescendantsOfId(string documentTypeAlias, int rootId)
        {
            //This may be faster with the xpath
            //      //*[@id=1213]//teamMember
            var root = UmbracoContext.Current.ContentCache.GetById(rootId);
            var descendants = root.Descendants(documentTypeAlias);
            return descendants.ToList();
        }
    }
}
