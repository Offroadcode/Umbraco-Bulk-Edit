angular.module("umbraco.resources").factory("bulkEditApi", function($http) {
    return {
        deleteSavedSearchByGuid: function(guid) {
            return $http.get('/Umbraco/backoffice/ORCCsv/Database/DeleteSavedSearchByGuid/?guid=' + guid);
        },
        getAllSavedSearches: function() {
            return $http.get("/Umbraco/backoffice/ORCCsv/Database/getAllSavedSearches");
        },
        getCsvExport: function(nodeId, doctypeAlias) {
            return $http.get(
                "/Umbraco/backoffice/ORCCsv/CsvExport/GetPublishedContent?format=Csv&contentTypeAlias=" +
                    doctypeAlias +
                    "&rootId=" +
                    nodeId
            );
        },
        getDataTypeById: function(id) {
            return $http.get("backoffice/ORCCsv/DataType/GetById?id=" + id);
        },
        getMatchingContent: function(nodeId, doctypeAlias) {
            return $http.get(
                "/Umbraco/backoffice/ORCCsv/CsvExport/GetPublishedContent?format=json&contentTypeAlias=" +
                    doctypeAlias +
                    "&rootId=" +
                    nodeId
            );
        },
        getSavedSearchByGuid: function(guid) {
            return $http.get('/Umbraco/backoffice/ORCCsv/Database/GetSavedSearchById/?guid=' + guid);
        },
        postSavedSearch: function(name, rootId, alias) {
            var data = {
                name: name,
                options: JSON.stringify({rootId: rootId, alias: alias})
            };
            return $http.post('/Umbraco/backoffice/ORCCsv/Database/PostSavedSearch', data);
        },
        savePropertyForNode: function(nodeId, propertyName, propertyValue) {
            var data = {
                nodeId: nodeId,
                propertyName: propertyName,
                propertyValue: propertyValue
            };
            return $http.get('/umbraco/backoffice/ORCCsv/Content/SavePropertyForNode/?nodeId=' + nodeId + '&propertyName=' + propertyName + '&propertyValue=' + propertyValue);
        },
        saveNodes: function(nodes) {
            var data = nodes;
            return $http.post('/umbraco/backoffice/ORCCsv/Content/SaveNodes', data);
        }
    };
});
