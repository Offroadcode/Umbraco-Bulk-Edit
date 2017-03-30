angular
    .module("umbraco")
    .controller("olympic.welcome.controller", function($scope, dialogService) {
        // Initialization Methods ////////////////////////////////////////////////////

        /**
        * @method init
        * @description Triggered on the controller loaded, kicks off any initialization functions.
        */
        $scope.init = function() {
            $scope.setVariables();
        };

        /**
        * @method setVariables
        * @description Sets up the initial variables for the view.
        */
        $scope.setVariables = function() {
            // We've got nothing going on right now.
        };

        // Event Handler Methods /////////////////////////////////////////////////////

        // Helper Methods ////////////////////////////////////////////////////////////

        // Call $scope.init() ////////////////////////////////////////////////////////

        $scope.init();
    });
