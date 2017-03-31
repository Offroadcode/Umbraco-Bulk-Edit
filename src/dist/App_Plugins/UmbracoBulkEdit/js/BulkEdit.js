angular.module("umbraco.resources").factory("bulkEditApi", function($http) {
    return {
        getCsvExport: function(nodeId, doctypeAlias) {
            return $http.get("/Umbraco/backoffice/ORCCsv/CsvExport/GetPublishedContent?format=Csv&contentTypeAlias=" + doctypeAlias + "&rootId=" + nodeId);         },
        getMatchingContent: function(nodeId, doctypeAlias) {
            return $http.get("/Umbraco/backoffice/ORCCsv/CsvExport/GetPublishedContent?format=json&contentTypeAlias=" + doctypeAlias + "&rootId=" + nodeId); 
        }
    };
});

angular
    .module("umbraco")
    .controller("bulkEdit.dashboard.controller", function($scope, contentTypeResource, dataTypeResource, dialogService, bulkEditApi) {
        // Initialization Methods ////////////////////////////////////////////////////

        /**
        * @method init
        * @description Triggered on the controller loaded, kicks off any initialization functions.
        */
        $scope.init = function() {
            $scope.setVariables();
            $scope.buildDocTypeOptions();
            console.info('init');
            console.info('dataTypeResource', dataTypeResource);
        };

        /**
        * @method setVariables
        * @description Sets up the initial variables for the view.
        */
        $scope.setVariables = function() {
            $scope.doctypes = [{name: '-Select Doctype-', alias: '', id: 0}];
            $scope.doctype = $scope.doctypes[0];
            $scope.isSelectingProperty = false;
            $scope.properties = [{label: '-Select Property-', id: 0}];
            $scope.resultProperties = [];
            $scope.propertiesToEdit = [];
            $scope.propertyEditors = [];
            $scope.propertyToAdd = $scope.properties[0];
            $scope.results = [];
            $scope.startNode = {
                icon: '',
                id: 0,
                key: '',
                name: ''                
            };
        };

        // Event Handler Methods /////////////////////////////////////////////////////

        $scope.addPropertyToEditList = function() {
            $scope.propertiesToEdit.push($scope.propertyToAdd);
            console.info('propertiesToEdit', $scope.propertiesToEdit);
           /*dataTypeResource.getById($scope.propertyToAdd.dataTypeId).then(function(dataType) {
                for (var i = 0; i < $scope.results.length; i++) {
                    if ($scope.propertyEditors.length < (i + 1)) {
                        $scope.propertyEditors.push([]);
                        $scope.propertyEditors[i].push({
                            alias: dataType.selectedEditor + '-' + i,
                            label: '',
                            view: dataType.
                        })
                    }
                }
                console.info($scope.propertyToAdd.editor, result);
            });*/
            $scope.isSelectingProperty = false;
        };  

        /**
         * @method exportAsCsv
         * @returns {void}
         * @description Called when the 'Export as CSV' button is clicked. Builds 
         * a CSV file and downloads it.
         */
        $scope.exportAsCsv = function() {
            var csvUrl = "/Umbraco/backoffice/ORCCsv/CsvExport/GetPublishedContent";
            var data = {
                format: "Csv",
                contentTypeAlias: $scope.doctype.alias,
                rootId: $scope.startNode.id
            };
            $scope.openPage('GET', csvUrl, data);
        };

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
            console.info('doctype', $scope.doctype);
            if ($scope.doctype.id !== 0) {
                contentTypeResource.getById($scope.doctype.id).then(function(response) {
                    $scope.properties = $scope.buildPropertiesForDoctype(response);
                    $scope.properties = $scope.sortArrayAlphaByProp($scope.properties, 'label');
                    $scope.properties.unshift({label: '-Select Property-',id: 0});
                    console.info('properties', $scope.properties);
                });
            }
        };

        $scope.openPropertySelection = function() {
            $scope.isSelectingProperty = true;
        };

        /**
        * @method openStartNodePicker
        * @returns {void}
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

        /**
         * @method search
         * @returns {void}
         * @description Called when 'Search' button is clicked. Requests a list of 
         * matching content.
         */
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

        /**
         * @method buildPropertiesForDoctype
         * @param {JSON} doctype
         * @returns {Object[]}
         * @description Builds an array of properties in the provided doctype.
         */
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

        /**
         * @method getContent
         * @param {Object} node
         * @param {string} doctypeAlias
         * @returns {void}
         * @description Calls API for list of content with matching doctype alias 
         * that is beneath the node.
         */
        $scope.getContent = function(node, doctypeAlias) {
            bulkEditApi.getMatchingContent(node.id, doctypeAlias).then(function(response) {
                if (response && response.data) {
                    $scope.results = response.data;
                    $scope.propertiesToEdit = [];
                    $scope.propertyEditors = [];
                    $scope.resultProperties = $scope.properties;
                    $scope.propertyToAdd = $scope.resultProperties[0];
                    console.info('content results', $scope.results);
                }
            },function(error) {
                console.error('Error with getContent() in bulkEdit.dashboard.controller.js: ', error);
            })
        };

        /**
         * @method openPage
         * @param {string} verb - must be 'GET or 'POST'
         * @param {string} url
         * @param {JSON} data
         * @param {string} target (can be a name or "_blank", defaults to "_self")
         */
        $scope.openPage = function(verb, url, data, target) {
            var form = document.createElement("form");
            form.action = url;
            form.method = verb;
            form.target = target || "_self";
            if (data) {
                for (var key in data) {
                    var input = document.createElement("textarea");
                    input.name = key;
                    input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
                    form.appendChild(input);
                }
            }
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
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
