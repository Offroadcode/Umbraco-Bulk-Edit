using System;
using System.Data;
using UmbracoBulkEdit.ContentExporters;

namespace UmbracoBulkEdit
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
