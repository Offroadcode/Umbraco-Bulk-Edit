using Orc.CsvExport.PropertyConverters;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Orc.CsvExport.ContentExporters
{
    public abstract class BaseContentExporter
    {
        public abstract DataTable GetData(string contentTypeAlias, int? rootId);
    }
    public abstract class BaseContentExporter<T> : BaseContentExporter
    {

        const string ID_KEY = "Id";
        const string TYPE_KEY = "Type";
        const string NAME_KEY = "Name";
        const string URL_KEY = "Url";
        const string PATH_KEY = "Path";
        public static List<BasePropertyConverter> PropertyConverters = new List<BasePropertyConverter>()
        {
            new StringArrayPropertyConverter(),new MediaReferenceConverter(), new SkybrudGridGrudPropertyConverter()

        };

        public abstract IEnumerable<PropertyEntry> GetPropertiesInEntry(T entry);
        public abstract int GetId(T entry);
        public abstract string GetName(T entry);
        public abstract string GetType(T entry);
        public abstract string GetUrl(T entry);
        public abstract string GetPath(T entry);
        public DataTable ToDataTable(List<T> entries)
        {
            var table = new DataTable();
            table.Columns.Add(ID_KEY);
            table.Columns.Add(TYPE_KEY);
            table.Columns.Add(NAME_KEY);
            table.Columns.Add(URL_KEY);
            table.Columns.Add(PATH_KEY);

            foreach (var entry in entries)
            {
                var row = table.NewRow();
                var items = GetPropertiesInEntry(entry);
                row[ID_KEY] = GetId(entry);
                row[TYPE_KEY] = GetType(entry);
                row[NAME_KEY] = GetName(entry);
                row[URL_KEY] = GetUrl(entry);
                row[PATH_KEY] = GetPath(entry);
                foreach (var item in items)
                {
                    var props = GetProps(item);

                    foreach (var prop in props)
                    {
                        if (!table.Columns.Contains(prop.ColumnAlias))
                        {
                            table.Columns.Add(prop.ColumnAlias, prop.Value.GetType());
                        }

                        row[item.PropertyAlias] = prop.Value;
                    }
                }
                table.Rows.Add(row);
            }
            return table;
        }

        private List<ExportEntry> GetProps(PropertyEntry item)
        {
            List<ExportEntry> props = null;
            foreach (var converter in PropertyConverters)
            {
                var result = converter.TryConvert(item);
                if (result != null)
                {
                    props = result;
                    break;
                }
            }

            if (props == null)
            {
                return new List<ExportEntry>() { new ExportEntry() { ColumnAlias = item.PropertyAlias, Value = item.Value } };
            }
            else
            {
                return props;
            }
        }
    }
    public class PropertyEntry
    {
        public object Value { get; set; }
        public string PropertyAlias { get; set; }
        public Type Type { get; set; }
    }
}
