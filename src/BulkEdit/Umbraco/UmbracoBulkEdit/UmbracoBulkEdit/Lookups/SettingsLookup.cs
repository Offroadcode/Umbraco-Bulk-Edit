using System.Collections.Generic;
using System.Xml;
using Umbraco.Core.Logging;

namespace UmbracoBulkEdit.Lookups
{
    public class SettingsLookup : BaseLookup<Dictionary<string, string>>
    {

        public IEnumerable<string> AllowedPropertyTypes
        {
            get { return GetSetting("allowedPropertyTypes").Split(','); }
        }

        private string GetSetting(string name)
        {
            var setting = this.GetData();

            if (setting == null)
            {
                LogHelper.Warn<string>(Filename + " does not exist.");
                return string.Empty;
            }

            var containsKey = setting.ContainsKey(name);

            if (!containsKey)
            {
                LogHelper.Warn<string>("Setting " + name + " is not defined in " + Filename);
            }

            return setting[name];
        }

        internal override string Filename { get { return "~/Config/umbracoBulkEdit.config"; } }
        internal override Dictionary<string, string> Convert(XmlDocument doc)
        {
            var settings = doc.SelectNodes("/umbracoBulkEdit/*");
            var entries = new Dictionary<string, string>();

            foreach (XmlElement setting in settings)
            {
                var name = setting.Name;
                var text = setting.InnerText;

                entries.Add(name, text);
            }

            return entries;
        }
    }
}
