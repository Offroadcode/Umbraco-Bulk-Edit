using Orc.CsvExport.ContentExporters;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orc.CsvExport
{
    public class ContentExportContext
    {
        private static ContentExportContext _instance;
        public static ContentExportContext Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new ContentExportContext();
                }
                return _instance;
            }
        }


        public DataTable GetData<T>(string contentTypeAlias, int? rootNode)  where T : BaseContentExporter
        {
            T exporter = Activator.CreateInstance<T>();

            var rawData = exporter.GetData(contentTypeAlias, rootNode);


            return rawData;
        }

    }
}
