using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Umbraco.Core.Logging;
using Umbraco.Core.Models;
using Umbraco.Web;
using UmbracoBulkEdit.Lookups;

namespace UmbracoBulkEdit.ContentExporters
{
    public class PublishedContentExporter : BaseContentExporter<IPublishedContent>
    {
        private readonly SettingsLookup SettingsLookup = new SettingsLookup();
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

            var allowed = new List<string> { "String", "Boolean", "HtmlString" };

            if (SettingsLookup.AllowedPropertyTypes != null && SettingsLookup.AllowedPropertyTypes.Any())
            {
                allowed = SettingsLookup.AllowedPropertyTypes.ToList();
            }

            var properties = new List<PropertyEntry>();
            foreach (var item in entry.Properties)
            {
                if (item.HasValue)
                {
                    try
                    {
                        var type = item.Value != null ? item.Value.GetType() : null;
                        if (type != null && allowed.Contains(type.Name))
                        {
                            var property = new PropertyEntry()
                            {
                                Value = item.Value,
                                PropertyAlias = item.PropertyTypeAlias,
                                Type = item.Value.GetType()
                            };
                            properties.Add(property);
                        }
                    }
                    catch (Exception e)
                    {
                        LogHelper.Error<PropertyEntry>("Could not import property", e);
                    }
                }
            }
            return properties;
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

        public override string GetPath(IPublishedContent entry)
        {
            var ancestorsWithSelf = entry.Ancestors().ToList();

            var names = ancestorsWithSelf.OrderBy(x => x.Level).Select(x => x.Name);

            var str = string.Join(", ", names);

            return str;

        }
    }
}
