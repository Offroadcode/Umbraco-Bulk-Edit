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
        };

        /**
        * @method setVariables
        * @description Sets up the initial variables for the view.
        */
        $scope.setVariables = function() {
            $scope.doctypes = [{
                name: '-Select Doctype-',
                alias: '',
                id: 0
            }];
            $scope.doctype = $scope.doctypes[0];
            $scope.properties = [];
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
            if ($scope.doctype.id !== 0) {
                $scope.getDoctype($scope.doctype.id).then(function(response) {
                    $scope.properties = $scope.buildPropertiesForDoctype(response);
                    console.info($scope.properties);
                });
            }
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
            $scope.getContent($scope.startNode, $scope.doctype.alias);
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
                    $scope.doctypes.unshift({
                        name: '-Select Doctype-',
                        alias: '',
                        id: 0
                    });
                    $scope.doctype = $scope.doctypes[0];
                    console.info('doctypes', $scope.doctypes);
                }
            });
        };

        $scope.buildPropertiesForDoctype = function(doctype) {
            var properties = [];
            if (doctype && doctype.groups && doctype.groups.length > 0) {
                for (var i = 0; i < doctype.groups.length; i++) {
                    var group = doctype.groups[i];
                    if (group && group.properties && group.properties.length > 0) {
                        for (var j = 0; j < group.properties.length; j++) {
                            properties.push(group.properties[j]);
                        }
                    }
                }
            }
            return properties;
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

        $scope.getDoctype = function(id) {
            return contentTypeResource.getById(id);
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
