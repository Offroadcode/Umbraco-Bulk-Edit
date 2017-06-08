using System.Collections.Generic;
using UmbracoBulkEdit.ContentExporters;

namespace UmbracoBulkEdit.PropertyConverters
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
