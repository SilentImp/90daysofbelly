(function() {

    var app = angular.module("BellyDays", ['angularFileUpload']);

    app.controller("AppController", ['$scope', '$upload', function($scope, $upload) {

        $scope.page = 'list';
        $scope.weight = null;
        $scope.uploading = false;
        $scope.progress = 0;

        $http.get('http://178.79.181.157:8080/day/').success(function(data, status, headers, config) {
            console.dir(data);
            console.log(status, headers, config);
            $scope.days = data;
        });

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

    }]);

    app.controller("NoteFormController", ['$scope', '$http', function($scope, $http) {
        $scope.note = "";
        $scope.addNote = function() {
            $http.post('http://178.79.181.157:8080/note/', {
                "note": $scope.note
            });
            $scope.show('list');
            document.querySelector('.note-form').reset();
        };
    }]);

    app.controller("WeightFormController", ['$scope', '$http', function($scope, $http) {
        $scope.addWeight = function() {
            $scope.$parent.weight = $scope.weight;
            $http.post('http://178.79.181.157:8080/day/', {
                "weight": $scope.$parent.weight
            });
            $scope.show('list');
            document.querySelector('.weight-form').reset();
        };
    }]);

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRheXNDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdC5qcyJ9