angular.module('umbraco').controller('config.dialog.controller',
    function($scope) {
        
        $scope.init = function() {
            $scope.model = {};
            if ($scope.dialogData) {
                $scope.model = $scope.dialogData;
            }
        };

        $scope.init();

    });
