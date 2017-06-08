using Umbraco.Core.Persistence;
using Umbraco.Core.Persistence.DatabaseAnnotations;

namespace UmbracoBulkEdit.Models
{
    [TableName("BulkSavedSearch")]
    [PrimaryKey("guid", autoIncrement = false)]
    [ExplicitColumns]
    public class BulkSavedSearch
    {
        [Column("guid")]
        [PrimaryKeyColumn(AutoIncrement = false)]
        public string Guid { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("options")]
        public string Options {get; set;}
    }
}
