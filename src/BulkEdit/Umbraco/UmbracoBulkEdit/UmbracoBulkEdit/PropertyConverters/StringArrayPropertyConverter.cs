using Orc.CsvExport.ContentExporters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orc.CsvExport.PropertyConverters
{
    public class StringArrayPropertyConverter : BasePropertyConverter
    {
        public override List<ExportEntry> TryConvert(PropertyEntry entry)
        {
            var val = entry.Value as string[];
            if (val != null)
            {
                var stringValue = string.Join(",", val);

                return new List<ExportEntry>()
           {
               new ExportEntry()
               {
                   ColumnAlias = entry.PropertyAlias,
                   Value = stringValue
               }
           };
            }
            return null;
        }
        
    }
}
