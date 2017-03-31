angular.module("umbraco.resources").factory("bulkEditApi", function($http) {
    return {
        getMatchingContent: function(nodeId, doctypeAlias) {
            return $http.get("/Umbraco/backoffice/ORCCsv/CsvExport/GetPublishedContent?format=json&contentTypeAlias=" + doctypeAlias + "&rootId=" + nodeId); 
        }
    };
});
