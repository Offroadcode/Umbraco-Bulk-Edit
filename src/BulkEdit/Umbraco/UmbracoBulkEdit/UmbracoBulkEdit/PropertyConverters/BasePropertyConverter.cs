using Orc.CsvExport.ContentExporters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orc.CsvExport.PropertyConverters
{
    public abstract class BasePropertyConverter
    {
        public abstract List<ExportEntry> TryConvert(PropertyEntry entry);
    }
    public class ExportEntry
    {
        public string ColumnAlias { get; set; }
        public object Value { get; set; }
    }
}
