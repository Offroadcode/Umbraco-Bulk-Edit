angular
    .module("umbraco")
    .controller("bulkEdit.dashboard.controller", function($scope,
        appState, 
        bulkEditApi,
        contentTypeResource, 
        dataTypeResource, 
        dialogService, 
        navigationService,
        notificationsService) {
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
            $scope.config = {
                hideBreadcrumbs: false,
                hideIdCol: false,
                hideNav: true,
                itemsPerPage: 10
            };
            $scope.currentPage = 0;
            $scope.doctypes = [{name: '-Select Doctype-', alias: '', id: 0}];
            $scope.doctype = $scope.doctypes[0];
            $scope.haveSetEditorWatcher = false;
            $scope.isSelectingProperty = false;
            $scope.isRowDirty = [];
            $scope.isSaving = [];
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

        /**
         * @method addPropertyToEditList
         * @returns {void}
         * @description Adds the property selected to the edit list and creates 
         * a matching editor for each search result.
         */
        $scope.addPropertyToEditList = function() {
            var property = $scope.propertyToAdd;
            $scope.propertiesToEdit.push(property);
            console.info('propertiesToEdit', $scope.propertiesToEdit);
            // Get the property editor for the property.
            $scope.getPropertyEditor(property.dataTypeId).then(function(editor) {
                // Loop through all results.
                for (var i = 0; i < $scope.results.length; i++) {
                    // Add the editor to a list of editors for the result.
                    console.info('editor', editor);
                    var thisEditor = JSON.parse(JSON.stringify(editor));
                    $scope.addEditorForPropertyToResultItem(property.alias, thisEditor, i);
                }
            });
            // Start a watcher to see when the editor updates.
            $scope.startWatchingEditors();
            // Reset propertyToAdd to '-select property-' for select element.
            $scope.propertyToAdd = $scope.getFilteredAvailableProperties()[0];
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

        $scope.onConfigDialogConfirmation = function(data) {
            console.info('onConfigDialogConfirmation', data);
            if (data) {
                $scope.config = JSON.parse(JSON.stringify(data));
                if ($scope.config.hideNav) {
                    $scope.hideNav();
                } else {
                    $scope.showNav();
                }
            }
        };

        $scope.openConfigDialog = function() {
            dialogService.open({
                template: "/App_Plugins/UmbracoBulkEdit/views/configDialog.html",
                dialogData: JSON.parse(JSON.stringify($scope.config)),
                callback: $scope.onConfigDialogConfirmation
            });           
        }

        /**
         * @method openPropertySelection
         * @returns {void}
         * @description Toggles open the select element that contains the list of 
         * properties to potentially edit.
         */
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
         * @method saveAll
         * @returns {void}
         * @description Saves all nodes on the page via API.
         */
        $scope.saveAll = function() {
            notificationsService.info('Saving...', 'saving all nodes.');
            var nodesToSave = [];
            var perPage = $scope.config.itemsPerPage;
            for (var i = ($scope.currentPage * perPage); i < ($scope.currentPage + 1) * perPage; i++) {
                if ($scope.results[i]) {
                    var node = $scope.results[i];
                    var editors = $scope.propertyEditors[i];
                    var nodeToSave = {
                        id: node.Id,
                        properties: []
                    };
                    for (var j = 0; j < $scope.propertiesToEdit.length; j++) {
                        var propToEdit = $scope.propertiesToEdit[j];
                        var editor = editors[j];
                        nodeToSave.properties.push({
                            alias: propToEdit.alias,
                            value: editor.value
                        });
                        $scope.results[i][propToEdit.alias] = editor.value;
                    }
                    nodesToSave.push(nodeToSave);               
                }
            }
            bulkEditApi.SaveNodes(nodesToSave).then(function(result) {
                notificationsService.success('Saved!', 'All nodes were successfully saved.');
            });
        };

        /**
         * @method saveNode
         * @param {number} index - The index of the result to save.
         * @returns {void}
         * @description Saves the result node at the indicated index.
         */
        $scope.saveNode = function(index) {
            $scope.isSaving[index] = true;
            var node = $scope.results[index];
            notificationsService.info('Saving...', 'saving node ' + node.Id + '.');
            var editors = $scope.propertyEditors[index];
            for (var i = 0; i < $scope.propertiesToEdit.length; i++) {
                var propToEdit = $scope.propertiesToEdit[i];
                var editor = editors[i];
                var savedCount = 0;
                bulkEditApi.SavePropertyForNode(node.Id, propToEdit.alias, editor.value).then(function(result) {
                    $scope.isSaving[index] = false;
                    $scope.overwritePropValue(propToEdit.alias, editor.value, index);
                    savedCount += 1;
                    if (savedCount >= $scope.propertiesToEdit.length) {
                        notificationsService.success('Saved!', 'Node ' + node.Id + ' was successfully saved.');
                    }
                });
            }
        };

        /**
         * @method search
         * @returns {void}
         * @description Called when 'Search' button is clicked. Requests a list of 
         * matching content.
         */
        $scope.search = function() {
            $scope.getContent($scope.startNode, $scope.doctype.alias);
            if ($scope.config.hideNav) {
                $scope.hideNav();
            }
        };

        // Helper Methods ////////////////////////////////////////////////////////////

        /**
         * @method addEditorForPropertyToResultItem
         * @param {string} propertyAlias - the alias of the property the editor is for.
         * @param {JSON} edtior - the config data for the editor
         * @param {number} index - the index of the item to add.
         * @returns {void}
         * @description Assigns the property editor that matches the property alias 
         * onto a result item, assigning the applicable value to the editor from 
         * the result.
         */
        $scope.addEditorForPropertyToResultItem = function(propertyAlias, editor, index) {
            var result = $scope.results[index];
            var value = result[propertyAlias];
            editor.value = value;
            var editors = [];
            if ($scope.propertyEditors.length > index) {
                editors = $scope.propertyEditors[index];
            }
            editors.push(editor);
            $scope.propertyEditors[index] = editors;
            //$scope.isFieldDirty(i);
        };

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
                            var property = group.properties[j];
                            if (property.view.indexOf('grid') < 0) {
                                properties.push(property);
                            }
                        }
                    }
                }
            }
            return properties;
        };

        /**
         * @method checkIfResultRowsAreDirty
         * @returns {boolean[]}
         * @description Iterates through all result nodes, compares the state of 
         * their editors with their original values for edited properties, and 
         * determines if that row is "dirty" or not.
         */
        $scope.checkIfResultRowsAreDirty = function() {
            var allEditors = JSON.parse(JSON.stringify($scope.propertyEditors));
            var propsToEdit = JSON.parse(JSON.stringify($scope.propertiesToEdit));
            var results = JSON.parse(JSON.stringify($scope.results));
            for (var i = 0; i < results.length; i++) {
                var isDirty = false;
                var node = results[i];
                var editors = allEditors[i];
                if (editors && editors.length > 0) {
                    for (var j = 0; j < editors.length; j++) {
                        var propToEdit = propsToEdit[j];
                        var editor = editors[j];
                        if (node[propToEdit.alias] !== editor.value) {
                            isDirty = true;
                        }
                    }
                }
                $scope.isRowDirty[i] = isDirty;
            }
            return $scope.isRowDirty;
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
         * @method getCurrentPage
         * @returns {Object[]}
         * @description Returns an array of results for displaying on the 
         * current page. 
         */
        $scope.getCurrentPage = function() {
            var results = [];
            var perPage = $scope.config.itemsPerPage;
            if ($scope.results.length > $scope.currentPage * perPage) {
                for (var i = ($scope.currentPage * perPage); i < ($scope.currentPage + 1) * perPage; i++) {
                    if ($scope.results[i]) {
                        results.push($scope.results[i]);
                    }
                }
            }
            return results;
        };

        /**
         * @method getEditCellClass
         * @returns {string}
         * @description Returns a string for the cell class with the needed spans.
         */
        $scope.getEditCellClass = function(defaultClass) {
            var classes = "cell ";
            if (defaultClass && (typeof defaultClass) == "string") {
                classes += defaultClass + " ";
            }
            var length = $scope.propertiesToEdit.length;
            if (length < 2) {
                if ($scope.config.hideIdCol) {
                    classes += "span9"
                } else {
                    classes += "span8";
                }
            } else {
                classes += "span4-5";
            }
            return classes;
        };

        /**
         * @method getFilteredAvailableProperties
         * @returns {Array}
         * @description Returns a filtered selection of resultProperties that aren't 
         * already selected.
         */
        $scope.getFilteredAvailableProperties = function() {
            var available = [];
            var props = $scope.resultProperties;
            var selected = $scope.propertiesToEdit;
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                var propAlreadySelected = false;
                for (var j = 0; j < selected.length; j++) {
                    if (selected[j].id == prop.id) {
                        propAlreadySelected = true;
                    }
                }
                if (!propAlreadySelected) {
                    available.push(prop);
                }
            }
            return available;
        };

        /**
         * @method getPages
         * @returns {number[]}
         * @description returns an array of page numbers.
         */
        $scope.getPages = function() {
            var pages = [];
            var current = $scope.currentPage;
            var shouldAddFirst = false;
            var shouldAddLast = false;
            var maxPage = Math.ceil($scope.results.length / $scope.config.itemsPerPage);
            var max = 0;
            var min = 0;
            if (current < 6 && maxPage > 10) {
                max = 9;
                shouldAddLast = true;
            } else if (maxPage < 11) {
                max = maxPage - 1;
            } else {
                shouldAddFirst = true;
                if (maxPage - current > 5) {
                    shouldAddLast = true;
                    max = current + 5;
                    min = current - 4;
                } else {
                    min = maxPage - 10;
                    max = maxPage - 1;
                }
            }
            if (shouldAddFirst) {
                pages.push(1);
            }
            for (var i = min; i <= max; i++) {
                pages.push(i + 1);
            }
            if (shouldAddLast) {
                pages.push(maxPage);
            }
            return pages;
        };

        /**
         * @method getPropertyEditor
         * @param {number} id
         * @returns {promise} - JSON
         * @description Returns the editor config object for the datatype with 
         * the matching datatype after fetching it from the API.
         */
        $scope.getPropertyEditor = function(id) {
            return bulkEditApi.getDataTypeById(id).then(function(result) {
                if (result && result !== null) {
                    var data = result.data;
                    var editor = {
                        alias: 'propEditor',
                        config: data.config,
                        label: 'Placeholder',
                        view: data.view,
                        value: null
                    };
                    return editor;
                } else {
                    return false;
                }
            });
        };

        /**
         * @method getResultIndex
         * @param {Object} result
         * @returns {number}
         * @description Looks at the node result passed to it and determines its 
         * index in the array of $scope.results. Returns that number.
         */
        $scope.getResultIndex = function(result) {
            var index = 0;
            for (var i = 0; i < $scope.results.length; i++) {
                if (result.Id == $scope.results[i].Id) {
                    index = i;
                }
            }
            return index;
        };

        $scope.gotoPage = function(page) {
            page = Number(page);
            page = page - 1;
            $scope.currentPage = page;
        }

        /**
         * @method hideNav
         * @returns {void}
         * @description Hides the navigation panel so we have more space to work 
         * with.
         */
        $scope.hideNav = function() {
            // hide the tree.
            appState.setGlobalState("showNavigation", false);
            // get the width of the remaining left column.
            var lc = document.querySelector('#leftcolumn');
            var columnWidth = window.getComputedStyle(lc).width;
            // manually change the 'left' property of the #contentwrapper to 
            // hide the whitespace created by collapsing the menu.
            var cw = document.querySelector('#contentwrapper');
            var styles = cw.getAttribute('style');
            if (styles == null) {
                styles = "";
            }
            styles += " left: " + columnWidth + ";";
            cw.setAttribute('style', styles);
            // listen for resize because it'll auto-pop the sidebar.
            window.addEventListener('resize', $scope.resetWrapperOffsetOnResize);
        };

        $scope.isFieldDirty = function(index) {
            var isDirty = false;
            var result = $scope.results[index];
            var editors = $scope.propertyEditors[index];
            for (var i = 0; i < $scope.propertiesToEdit.length; i++) {
                var property = $scope.propertiesToEdit[i];
                var originalValue = result[property.alias];
                if (editors[i].value != originalValue) {
                    isDirty = true;
                }
            }
            console.info(index + ': ' + isDirty);
            return isDirty;
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

        $scope.overwritePropValue = function(alias, value, index) {
            $scope.results[index][alias] = value;
            console.info($scope.results);
        }

        /**
         * @method resetWrapperOffsetOnResize
         * @returns {void}
         * @description Removes the style we applied to the #contentwrapper div.
         * We call this when the page is resized because Umbraco re-activates 
         * the navigation menu, which will overlap.
         */
        $scope.resetWrapperOffsetOnResize = function() {
            var cw = document.querySelector('#contentwrapper');
            cw.setAttribute('style', '');
            window.removeEventListener('resize', $scope.resetWrapperOffsetOnResize);
        };

        $scope.showNav = function() {
            // hide the tree.
            appState.setGlobalState("showNavigation", true);
            $scope.resetWrapperOffsetOnResize();
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

        /**
         * @method startWatchingEditors
         * @returns {void}
         * @description Starts $scope.watch on propertyEditors to help the scope 
         * know when those are being touched.
         */
        $scope.startWatchingEditors = function() {
            if (!$scope.haveSetEditorWatcher) {
                $scope.$watch('propertyEditors', function () {
                    $scope.checkIfResultRowsAreDirty();
                }, true);
                $scope.$watch('results', function () {
                    $scope.checkIfResultRowsAreDirty();
                }, true);                                        
                $scope.haveSetEditorWatcher = true;
            }
        };

        // Call $scope.init() ////////////////////////////////////////////////////////

        $scope.init();
    });
