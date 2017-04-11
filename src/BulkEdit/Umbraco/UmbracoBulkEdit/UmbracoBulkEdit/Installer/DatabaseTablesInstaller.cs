using System;
using System.Linq;
using Semver;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Persistence.Migrations;
using Umbraco.Web;

// https://cultiv.nl/blog/using-umbraco-migrations-to-deploy-changes/

namespace ORCCsv.Eventhandlers
{
    public class MigrationEvents : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            HandleBulkSavedSearchMigration();
        }

        private static void HandleBulkSavedSearchMigration()
        {
            const string productName = "BulkSavedSearch";
            var currentVersion = new SemVersion(0, 0, 0);

            // get all migrations for "BulkSavedSearch" already executed
            var migrations = ApplicationContext.Current.Services.MigrationEntryService.GetAll(productName);

            // get the latest migration for "BulkSavedSearch" executed
            var latestMigration = migrations.OrderByDescending(x => x.Version).FirstOrDefault();

            if (latestMigration != null)
                currentVersion = latestMigration.Version;

            var targetVersion = new SemVersion(1, 0, 0);
            if (targetVersion == currentVersion)
                return;

            var migrationsRunner = new MigrationRunner(
              ApplicationContext.Current.Services.MigrationEntryService,
              ApplicationContext.Current.ProfilingLogger.Logger,
              currentVersion,
              targetVersion,
              productName);

            try
            {
                migrationsRunner.Execute(UmbracoContext.Current.Application.DatabaseContext.Database);
            }
            catch (Exception e)
            {
                LogHelper.Error<MigrationEvents>("Error running BulkSavedSearch migration", e);
            }
        }
    }
}