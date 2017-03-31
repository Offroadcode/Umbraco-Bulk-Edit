angular.module("umbraco.resources").factory("bulkEditApi", function($http) {
    return {
        getCsvExport: function(nodeId, doctypeAlias) {
            return $http.get("/Umbraco/backoffice/ORCCsv/CsvExport/GetPublishedContent?format=Csv&contentTypeAlias=" + doctypeAlias + "&rootId=" + nodeId);         },
        getMatchingContent: function(nodeId, doctypeAlias) {
            return $http.get("/Umbraco/backoffice/ORCCsv/CsvExport/GetPublishedContent?format=json&contentTypeAlias=" + doctypeAlias + "&rootId=" + nodeId); 
        }
    };
});
