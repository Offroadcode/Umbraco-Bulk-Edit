using System.Collections.Generic;
using Umbraco.Web.Models;
using UmbracoBulkEdit.ContentExporters;

namespace UmbracoBulkEdit.PropertyConverters
{
    public class MediaReferenceConverter : BasePropertyConverter
    {
        public override List<ExportEntry> TryConvert(PropertyEntry entry)
        {
            if (entry.Value is PublishedContentBase)
            {
                var val = entry.Value as PublishedContentBase;
                if (val.ItemType == Umbraco.Core.Models.PublishedItemType.Media)
                {


                    return new List<ExportEntry>()
                       {
                           new ExportEntry()
                           {
                               ColumnAlias = entry.PropertyAlias,
                               Value = val.Id
                           }
                       };
                }
            }
            return null;
        }
        
    }
}
