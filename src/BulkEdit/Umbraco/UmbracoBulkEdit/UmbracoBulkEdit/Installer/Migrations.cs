using ORCCsv.Models;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Persistence;
using Umbraco.Core.Persistence.Migrations;
using Umbraco.Core.Persistence.SqlSyntax;

// https://cultiv.nl/blog/using-umbraco-migrations-to-deploy-changes/
namespace ORCCsv.Migrations
{
    [Migration("1.0.0", 1, "BulkSavedSearch")]
    public class CreateBulkSavedSearchTable : MigrationBase
    {
        private readonly UmbracoDatabase _database = ApplicationContext.Current.DatabaseContext.Database;
        private readonly DatabaseSchemaHelper _schemaHelper;

        public CreateBulkSavedSearchTable(ISqlSyntaxProvider sqlSyntax, ILogger logger)
          : base(sqlSyntax, logger)
        {
            _schemaHelper = new DatabaseSchemaHelper(_database, logger, sqlSyntax);
        }

        public override void Up()
        {
            _schemaHelper.CreateTable<BulkSavedSearch>(false);

            // Remember you can execute ANY code here and in Down().. 
            // Anything you can think of, go nuts (not really!)
        }

        public override void Down()
        {
            _schemaHelper.DropTable<BulkSavedSearch>();
        }
    }
}