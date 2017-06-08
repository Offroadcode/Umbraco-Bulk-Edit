using System.Collections.Generic;
using UmbracoBulkEdit.ContentExporters;

namespace UmbracoBulkEdit.PropertyConverters
{
    public class SkybrudGridGrudPropertyConverter : BasePropertyConverter
    {
        public override List<ExportEntry> TryConvert(PropertyEntry entry)
        {
            if (entry.Value is Skybrud.Umbraco.GridData.GridDataModel)
            {
                var val = entry.Value as Skybrud.Umbraco.GridData.GridDataModel;
                var ctrls = val.GetAllControls();
                foreach(var item in ctrls)
                {
                    
                }
                
            }
            return null;
        }
        
    }
}
