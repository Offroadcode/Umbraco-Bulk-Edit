angular.module("umbraco.resources").factory("bulkEditApi", function($http) {
    return {
        getMatchingContent: function(nodeId, docTypeId) {
            return $http.get("url"); 
        }
    };
});
