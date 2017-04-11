angular.module('umbraco').controller('config.dialog.controller',
    function($scope) {
        
        $scope.init = function() {
            $scope.model = {};
            $scope.options = {
                perPage: [5, 10, 25]
            };
            if ($scope.dialogData) {
                $scope.model = $scope.dialogData;
            }
        };

        $scope.init();

    });
