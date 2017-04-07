# Umbraco-Bulk-Edit &middot; ![version](https://img.shields.io/badge/version-1.0.0-green.svg)

An [Umbraco](https://umbraco.com/) package for the bulk editing and reporting of content.

### Install Dependencies

*Requires Node.js to be installed and in your system path. Go [here](https://docs.npmjs.com/getting-started/installing-node) for instructions to install node if needed.*

    npm install -g grunt-cli && npm install -g grunt
    npm install

### Build

You can build this project into a releasable distribition in the `/src/dist/` folder with either of the following commands:

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

If you want to build the package file (into a pkg folder), use:

    grunt umbraco

or

    npm run package

However, there is currently a problem with loading local package files in Umbraco and we'll need 7.5.8+ (which addresses this bug).
