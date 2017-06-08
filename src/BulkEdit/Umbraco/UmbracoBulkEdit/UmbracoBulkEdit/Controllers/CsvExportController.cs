using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Excel;
using Newtonsoft.Json;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using UmbracoBulkEdit.ContentExporters;

namespace UmbracoBulkEdit.Controllers
{
    [PluginController("ORCCsv")]
    public class CsvExportController : UmbracoAuthorizedApiController
    {
            public HttpResponseMessage GetContent(ExportFormat format, string contentTypeAlias, int? rootId)
            {
                var data = ContentExportContext.Instance.GetData<AllContentExporter>(contentTypeAlias, rootId);

                return ReturnDataTableToFormat(format, data);
            }
        public HttpResponseMessage GetPublishedContent(ExportFormat format, string contentTypeAlias, int? rootId)
        {
            var data = ContentExportContext.Instance.GetData<PublishedContentExporter>(contentTypeAlias, rootId);
            return ReturnDataTableToFormat(format, data);

        }

        /*
        public HttpResponseMessage GetMedia(ExportFormat format, string contentTypeAlias, int? rootId)
        {
            var data = ContentExportContext.Instance.GetData<ContentExporters.MediaExporter>(contentTypeAlias, rootId);
            return ReturnDataTableToFormat(format, data);

        }*/

        private HttpResponseMessage ReturnDataTableToFormat(ExportFormat format, DataTable dt)
        {
            switch (format)
            {
                case ExportFormat.Excel:
                    return ToExcelFormat(dt);
                    break;
                case ExportFormat.Csv:
                    return ToCsvFormat(dt);
                    break;
                case ExportFormat.Json:
                    return ToJsonFormat(dt);
                    break;
                default:
                    throw new Exception("Unrecognized format");
                    break;
            }
        }

        private HttpResponseMessage ToExcelFormat(DataTable dt)
        {
            MemoryStream memoryStream = new MemoryStream();
            using (var workbook = new XLWorkbook(XLEventTracking.Disabled))
            {
                var worksheet = workbook.AddWorksheet("Export");

                WriteData(dt, new ExcelSerializer(worksheet));
                workbook.SaveAs(memoryStream);
            }
            memoryStream.Flush();
            memoryStream.Position = 0;
            var response = Request.CreateResponse(HttpStatusCode.OK);
            // response.Content = new StringContent(sw.ToString());
            response.Content = new StreamContent(memoryStream);
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = "Export.xlsx" };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.ms-excel");
            return response;

        }
        private HttpResponseMessage ToJsonFormat(DataTable dataTable)
        {
            List<dynamic> models = new List<dynamic>();
            for (int i = 0; i < dataTable.Rows.Count; i++)
            {
                DataRow myRow = dataTable.Rows[i];
                var model = new ExpandoObject();

                for (int j = 0; j < dataTable.Columns.Count; j++)
                {
                    var columnName = dataTable.Columns[j].ColumnName;
                    var value = myRow.ItemArray[j];
                    AddProperty(model, columnName, value);
                }
                models.Add(model);
            }
            List<string> errors = new List<string>();

            var jsonSerializerSettings = new JsonSerializerSettings();
            jsonSerializerSettings.Error = (serializer, err) => {
                err.ErrorContext.Handled = true;
            };

            var serialized = JsonConvert.SerializeObject(models, jsonSerializerSettings);

            var resp = new HttpResponseMessage()
            {
                Content = new StringContent(serialized)
            };
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            return resp;
        }
        private static void AddProperty(ExpandoObject expando, string propertyName, object propertyValue)
        {
            // ExpandoObject supports IDictionary so we can extend it like this
            var expandoDict = expando as IDictionary<string, object>;
            if (expandoDict.ContainsKey(propertyName))
                expandoDict[propertyName] = propertyValue;
            else
                expandoDict.Add(propertyName, propertyValue);
        }

        private HttpResponseMessage ToCsvFormat(DataTable dt)
        {
            MemoryStream ms = new MemoryStream();
            TextWriter sw = new StreamWriter(ms, new UTF8Encoding(false,true),1024,true);
            WriteData(dt, new CsvSerializer(sw));
            ms.Flush();
            ms.Position = 0;
            var response = Request.CreateResponse(HttpStatusCode.OK);
            // response.Content = new StringContent(sw.ToString());
            response.Content = new StreamContent(ms);
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = "Export.csv" };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/csv");
            return response;
        }

        private void WriteData(DataTable dt, ICsvSerializer ser)
        {
            using (var writer = new CsvWriter(ser))
            {
                foreach (DataColumn column in dt.Columns)
                {
                    writer.WriteField(column.ColumnName);
                }
                writer.NextRecord();

                foreach (DataRow row in dt.Rows)
                {
                    for (var i = 0; i < dt.Columns.Count; i++)
                    {
                        var value = row[i];
                        
                        writer.WriteField(value);
                    }
                    writer.NextRecord();
                }
            }
        }
    }

    public enum ExportFormat
    {
        Csv,
        Excel, 
        Json
    }

}
