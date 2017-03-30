angular.module("umbraco.resources").factory("bulkEditApi", function($http) {
    return {
        getMatchingContent: function(nodeId, docTypeId) {
            return $http.get("url");
        }
    };
});

angular
    .module("umbraco")
    .controller("bulkEdit.dashboard.controller", function($scope, dialogService, bulkEditApi) {
        // Initialization Methods ////////////////////////////////////////////////////

        /**
        * @method init
        * @description Triggered on the controller loaded, kicks off any initialization functions.
        */
        $scope.init = function() {
            $scope.setVariables();
            console.info('init');
            /*bulkEditApi.getMatchingContent().then(function(response){
                console.info('response', response);
            }, function(error) {
                console.info('error', error);
            });*/
        };

        /**
        * @method setVariables
        * @description Sets up the initial variables for the view.
        */
        $scope.setVariables = function() {
            $scope.startNode = {
                icon: '',
                id: 0,
                key: '',
                name: ''                
            };
        };

        // Event Handler Methods /////////////////////////////////////////////////////

        /**
         * @method handleStartNodePickerSelection
         * @param {Object} data - modal object returned by dialogService.contentPicker()
         * @description Event handler triggered by a content picker dialog. If there 
         * is a node selected, updates $scope.startNode with the node's information.
         */
        $scope.handleStartNodePickerSelection = function (data) {
            if (data) {
                $scope.startNode = data;
            }
        };

        /**
        * @method openStartNodePicker
        * @description Opens the content picker dialog for the start node, and sends
        * the data returned to $scope.handleStartNodePickerSelection.
        */
        $scope.openStartNodePicker = function() {
            //$scope.docType = $scope.getAllowedDocTypes()[0].alias;
            dialogService.contentPicker({
                multipicker: false,
                callback: $scope.handleStartNodePickerSelection
            });
            dialogService.closeAll();
        };

        // Helper Methods ////////////////////////////////////////////////////////////

        // Call $scope.init() ////////////////////////////////////////////////////////

        $scope.init();
    });
