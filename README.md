# Umbraco-Bulk-Edit &middot; ![version](https://img.shields.io/badge/version-1.0.1-green.svg)

An [Umbraco](https://umbraco.com/) package for the bulk editing and reporting of content. This allows you to update a field on multiple content items in one place/screen at once, think about how you want to increase stock levels on products after a delivery of new stock for instance. Now you can do it in one place. 

Have paging built in so you can update a sensible amount of content in one go. 

Export content too! Ever had a client say "it would be great if we could get this out as a spreadsheet" well...now you can. PLEASE NOTE: export only allows certain fields (ie the useful ones that you might want in a spreadsheet so no JSON blobs) which currently are boolean, string or HtmlString. You can add more in the config file, have a dig around if so.

You can create custom views (ie which fields from which doctypes would you like to see) and save them which is super handy for checking meta description, prices, teaser text etc.

Check the issues for any quirks and and feel free to raise an issue or even better a PR. Currently this package solves the problems we needed for our clients so if you want to extend it fork it and submit a pull request or we can discuss hiring us to add it in for you :)

## Install Dependencies

*Requires Node.js to be installed and in your system path. Go [here](https://docs.npmjs.com/getting-started/installing-node) for instructions to install node if needed.*

    npm install -g grunt-cli && npm install -g grunt
    npm install

## Build

### Umbraco Package

If you want to build the package file (into the `/pkg/` folder) into a package zip to load with Umbraco's package installer, use:

    grunt umbraco

or

    npm run package

### Distrubition

You can build this project into a releasable distribution in the `/src/dist/` folder with either of the following commands:

    grunt

or

    npm run build

These files can be dropped into an Umbraco 7 site, or you can build directly to a site using:

    grunt --target="D:\inetpub\mysite"

But if you do build directly into a site, you'll need to add the following to its `/Config/Dashboard.config` file so the custom section's dashboard will show:

    <section alias="UmbracoBulkEdit">
        <areas>
            <area>content</area>
        </areas>
        <tab caption="Bulk Edit">
            <control>/App_Plugins/UmbracoBulkEdit/views/dashboard.html</control>
        </tab>  
    </section>

You can also watch for changes using:

    grunt watch
    grunt watch --target="D:\inetpub\mysite"

**IMPORTANT!:** In order to build the DLLs required by this project, you will need the MSBuild executable on your system. The easiest way to do this is to install [Visual Studio](https://www.visualstudio.com/), which will install MSbuild as well.


