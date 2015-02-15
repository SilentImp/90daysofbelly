(function() {

    var app = angular.module("BellyDays", ['angularFileUpload']);

    app.controller("AppController", ['$scope', '$upload', function($scope, $upload) {

        $scope.page = 'list';
        $scope.weight = null;
        $scope.uploading = false;
        $scope.progress = 0;

        $scope.$watch('files', function() {
            $scope.upload($scope.files);
        });

        $scope.upload = function(files, event) {
            if (files && files.length) {
                $scope.uploading = true;
                $upload.upload({
                        url: 'http://178.79.181.157:8080/photo/',
                        method: 'PUT',
                        fields: {
                            'username': $scope.username
                        },
                        file: files[0]
                    }).progress(function(evt) {
                        $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                    })
                    .success(uploadEnd)
                    .error(uploadEnd);
            }
        };

        function uploadEnd() {
            $scope.progress = 0;
            $scope.uploading = false;
        }

        $scope.isWeight = function() {
            return $scope.weight === null;
        };

        $scope.show = function(page) {
            console.log('show page: ', page);
            if ($scope.page == 'weight-form') {
                $('.weight-form')[0].reset();
            }
            if ($scope.page == 'note-form') {
                $('.note-form')[0].reset();
            }
            $scope.page = page;
        };

        $scope.openWeightForm = function() {
            $scope.show('weight-form');
            document.querySelector('.weight-form input').focus();
        };

        $scope.openNoteForm = function() {
            $scope.show('note-form');
            document.querySelector('.note-form textarea').focus();
        };

        // console.log('app', arguments);

    }]);

    app.controller("NoteController", function($scope) {
        // console.log('note', arguments);
    });

    app.controller("NoteFormController", function($scope) {
        // console.log('note-form', arguments);
    });

    app.controller("WeightFormController", [$http, function($scope, $http) {
        $scope.addWeight = function() {
            $scope.$parent.weight = $scope.weight;
            document.querySelector('.weight-form').reset();
            $scope.show('list');
            $http.post('http://178.79.181.157:8080/weight/', {
                weight: $scope.$parent.weight
            });
        };
        // console.log('weight-form', arguments);
    }]);

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRheXNDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHQuanMifQ==