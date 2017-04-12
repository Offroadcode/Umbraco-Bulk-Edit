# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [v1.0.0](https://github.com/Offroadcode/Umbraco-Bulk-Edit/releases/tag/v1.0.0)

### Added

- Saves searches and allows you to see then select them.
- Now can build an Umbraco package running `grunt umbraco`.
- Breadcrumb on results to differentiate between result items with identical names.
- Style improvements.

### Fixed

- New API endpoint to wrap around `ContentTypeService` due to issue with Angular `contentTypeResource` triggering a logout when editor role users were on tab.

## [v1.0.0-beta.1](https://github.com/Offroadcode/Umbraco-Bulk-Edit/releases/tag/v1.0.0-beta.1)

### Added
- Ability to select a start node, a docType, and then search for and display a list of matching nodes.
- Ability to download the search results as a CSV file instead.
- Ability to edit non-grid properties on a content item in the search results and save.
- Ability to save all changed content items on a page of results.