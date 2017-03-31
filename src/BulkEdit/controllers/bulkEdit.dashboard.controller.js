angular
    .module("umbraco")
    .controller("bulkEdit.dashboard.controller", function($scope, contentTypeResource, dialogService, bulkEditApi) {
        // Initialization Methods ////////////////////////////////////////////////////

        /**
        * @method init
        * @description Triggered on the controller loaded, kicks off any initialization functions.
        */
        $scope.init = function() {
            $scope.setVariables();
            $scope.buildDocTypeOptions();
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
            $scope.doctype = false;
            $scope.doctypes = [];
            $scope.results = [];
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
         * @method loadDocType
         * @returns {void}
         * @description Handles the doctype selection action, loading the doc type's 
         * details to build a list of selectable properties.
         */
        $scope.loadDocType = function() {
            console.info($scope.doctype);
            /*$scope.properties = [];
            $scope.getDocTypeFromAlias($scope.docType).then(function(type) {
                $scope.properties = $scope.buildPropertyListForDocType(type);
                $scope.selectedProperties = [];
                for (var i = 0; i < $scope.properties.length; i++) {
                    $scope.selectedProperties.push($scope.properties[i].id);
                }
            });*/
        };        

        /**
        * @method openStartNodePicker
        * @description Opens the content picker dialog for the start node, and sends
        * the data returned to $scope.handleStartNodePickerSelection.
        */
        $scope.openStartNodePicker = function() {
            dialogService.contentPicker({
                multipicker: false,
                callback: $scope.handleStartNodePickerSelection
            });
            dialogService.closeAll();
        };

        $scope.search = function() {
            $scope.getContent($scope.startNode, $scope.doctype);
            /*$scope.results = [
                {
                    name: "Golden Lion Hotel",
                    id: 1234
                },
                {
                    name: "Really Cool Hotel",
                    id: 1235
                },
                {
                    name: "Some Other Hotel",
                    id: 1236
                }
            ]*/
        };

        // Helper Methods ////////////////////////////////////////////////////////////

        /**
         * @method buildDocTypeOptions
         * @returns {void}
         * @description Builds an array of docTypes from what is available in the 
         * Umbraco back office. Will attempt to sort out non-docType content types, 
         * but must rely on naming conventions to do so as contentTypeResource.getAll()'s 
         * response has no indicator as to whether a contentType is a docType.
         * NOTE: Currently not being used as we've hard-wired selectable doctypes. --Kyle
         */
        $scope.buildDocTypeOptions = function() {
            contentTypeResource.getAll().then(function(types) {
                if (types && types.length > 0) {
                    $scope.doctypes = [];
                    for (var i = 0; i < types.length; i++) {
                        var type = types[i];
                        $scope.doctypes.push(types[i]);
                    }
                    // Sort types alphabetically.
                    $scope.doctypes = $scope.sortArrayAlphaByProp($scope.doctypes, 'name');
                    console.info('doctypes', $scope.doctypes);
                }
            });
        };

        $scope.getContent = function(node, doctypeAlias) {
            bulkEditApi.getMatchingContent(node.id, doctypeAlias).then(function(response) {
                if (response && response.data) {
                    $scope.results = response.data;
                    console.info($scope.results);
                }
                console.info(response);
            },function(error) {
                console.info('Error', error);
            })
        };

        /**
         * @method sortArrayAlphaByProp
         * @param {Object[]} array
         * @param {string} propName
         * @returns {Object[]}
         * @description Sorts the provided array alphabetically per the named 
         * property, and then returns the sorted array.
         */
        $scope.sortArrayAlphaByProp = function(array, propName) {
            array.sort(function(a, b) {
                var textA = a[propName].toUpperCase();
                var textB = b[propName].toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            return array;    
        };        

        // Call $scope.init() ////////////////////////////////////////////////////////

        $scope.init();
    });
