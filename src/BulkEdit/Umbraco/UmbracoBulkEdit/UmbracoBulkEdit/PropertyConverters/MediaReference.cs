using Orc.CsvExport.ContentExporters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Web.Models;
using Umbraco.Web.PublishedCache;

namespace Orc.CsvExport.PropertyConverters
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
