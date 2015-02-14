(function() {

    var app = angular.module("BellyDays", ['angularFileUpload']);

    app.controller("AppController", ['$scope', '$upload', function($scope, $upload) {

        $scope.page = 'list';
        $scope.weight = null;

        $scope.$watch('files', function() {
            $scope.upload($scope.files);
        });

        $scope.upload = function(files, event) {
            if (files && files.length) {
                console.log('files changed', arguments);
                var file = files[0];
                $upload.upload({
                    url: 'http://178.79.181.157:8080/photo/',
                    method: 'PUT',
                    fields: {
                        'username': $scope.username
                    },
                    file: file
                }).progress(function(evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $('.upload__progress').css({
                        height: progressPercentage + '%'
                    });
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function(data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                });
            }
        };

        $scope.isWeight = function() {
            return $scope.weight === null;
        };

        $scope.show = function(page) {
            console.log('show page: ', page);
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

    app.controller("WeightFormController", function($scope) {
        $scope.addWeight = function() {
            $scope.$parent.weight = $scope.weight;
            document.querySelector('.weight-form').reset();
            $scope.show('list');
        };
        // console.log('weight-form', arguments);
    });

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRheXNDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdC5qcyJ9