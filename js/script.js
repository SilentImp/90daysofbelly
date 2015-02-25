(function() {

    var app = angular.module("BellyDays", ['angularFileUpload']),
        host = "http://localhost:8080";

    moment.locale('ru');
    // var host = "http://178.79.181.157:8080";

    app.controller("AppController", ['$timeout', '$rootScope', '$scope', '$upload', '$http', function($timeout, $rootScope, $scope, $upload, $http) {

        $scope.photo_url = host + '/';
        $scope.page = 'list';
        $scope.weight = null;
        $scope.uploading = false;
        $scope.progress = 0;
        $scope.days = [];
        $scope.notes = [];
        $scope.photos = [];
        $scope.photos_index = 0;
        $scope.weight_this_day = null;
        $scope.day_time = null;
        $scope.scroll_top = 0;
        $scope.scroll_time = 250;
        $scope.weight_total = [];
        $scope.time_total = [];

        var auth = false;

        $scope.login = function() {
            auth = !auth;
            return auth;
        };

        $scope.isAuth = function() {
            return auth;
        };

        requestData();

        $scope.$on('newdata', requestData);

        function requestData(event, type) {
            $http.get(host + '/day/').success(function(data, status, headers, config) {
                var index, today, day, last_weight = null;

                $scope.days = data;
                $scope.first_day = moment(data[0]._id);
                $scope.last_day = moment(data[0]._id).add(90, 'days');
                $scope.today_id = null;

                $scope.weight_total = [];
                $scope.time_total = [];

                today = moment();
                index = data.length;
                while (index--) {
                    day = data[index];
                    if (typeof day.weight !== 'undefined') {
                        $scope.time_total.push(moment(day._id).valueOf());
                        $scope.weight_total.push(day.weight);
                        last_weight = day.weight;
                    } else if (last_weight !== null) {
                        $scope.time_total.push(moment(day._id).valueOf());
                        $scope.weight_total.push(last_weight);
                    }
                    if (moment(day._id).diff(today, 'days') == 0) {
                        $scope.today_id = day._id;
                        if (typeof day.weight !== 'undefined') {
                            $scope.weight = day.weight;
                        }
                    }
                }

                switch (type) {
                    case 'fitbit':

                        break;
                    case 'note':
                        $timeout(function() {
                            $scope.openNotes($scope.today_id);
                        }, 300);
                        break;
                    case 'photo':
                        $timeout(function() {
                            $scope.openPhotos($scope.today_id);
                        }, 300);
                        break;
                }
            });
        }

        function scrollTopStep() {
            var diff = new Date().getTime() - $scope.scroll_start,
                pos = diff * $scope.scroll_y / $scope.scroll_time;
            window.scroll(0, $scope.scroll_y - Math.max(pos, 0));
            if (document.querySelector('html').scrollTop > 0) {
                window.requestAnimationFrame(scrollTopStep);
            }
        }

        $scope.scrollTop = function() {
            $scope.scroll_y = document.querySelector('html').scrollTop;
            $scope.scroll_start = new Date().getTime();
            $scope.scroll_step = $scope.scroll_y / $scope.scroll_time;
            window.requestAnimationFrame(scrollTopStep);
        }

        function getDayById(id) {
            var index = $scope.days.length;
            while (index--) {
                if ($scope.days[index]._id === id) {
                    return $scope.days[index];
                }
            }
            return null;
        }

        function uploadEnd() {
            $timeout(function() {
                $scope.progress = 0;
                $scope.uploading = false;
                $rootScope.$broadcast('newdata', 'photo');
            }, 2000);
        }

        $scope.upload = function(files, event) {
            if (files && files.length) {
                $scope.uploading = true;
                $upload.upload({
                    url: host + '/photo/',
                    method: 'PUT',
                    fields: {
                        'username': $scope.username
                    },
                    file: files[0]
                }).progress(function(evt) {
                    $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                }).success(uploadEnd).error(uploadEnd);
            }
        };

        $scope.$watch('files', function() {
            $scope.upload($scope.files);
        });

        $scope.nextPhoto = function() {
            $scope.photos_index = Math.min($scope.photos.length - 1, $scope.photos_index + 1);
        };

        $scope.prevPhoto = function() {
            $scope.photos_index = Math.max(0, $scope.photos_index - 1);
        };

        $scope.firstPhoto = function() {
            return ($scope.photos_index == 0);
        };

        $scope.lastPhoto = function() {
            return ($scope.photos_index == ($scope.photos.length - 1));
        };

        $scope.closePhoto = function() {
            $scope.show('list');
        };

        $scope.isWeight = function() {
            return $scope.weight === null;
        };

        $scope.show = function(page) {
            var scroll = 0;
            switch ($scope.page) {
                case 'weight-form':
                    document.querySelector('.weight-form').reset();
                    break;
                case 'note-form':
                    document.querySelector('.note-form').reset();
                    break;
                case 'photos':
                    $scope.photos_index = 0;
                    break;
            }

            $scope.page = page;

            if ($scope.page == 'list') {

                scroll = $scope.scroll_top;
                $scope.scroll_top = 0;
                window.setTimeout(function() {
                    window.scroll(0, scroll);
                }, 0);

            } else {
                $scope.scroll_top = document.querySelector('html').scrollTop;
            }
        };

        $scope.openWeightForm = function() {
            $scope.show('weight-form');
            document.querySelector('.weight-form input').focus();
        };

        $scope.openNoteForm = function() {
            $scope.show('note-form');
            document.querySelector('.note-form textarea').focus();
        };

        $scope.openNotes = function(id) {
            var day = getDayById(id);
            $scope.notes = day.notes;
            $scope.weight_this_day = day.weight;
            $scope.show('notes');
        };

        $scope.openPhotos = function(id) {
            var day = getDayById(id);
            $scope.day_time = moment(id).unix();
            $scope.photos = day.photos;
            $scope.show('photos');
        };

    }]);

    app.directive('graph', function() {
        return {
            restrict: 'C',
            scope: false,
            link: function($scope, element, attrs) {

                var time = $scope.time_total,
                    weight = $scope.weight_total,
                    chart;

                chart = c3.generate({
                    bindto: '.graph__chart',
                    height: '100%',
                    padding: {
                        top: 80,
                        left: 80,
                        right: 80,
                        bottom: 0
                    },
                    legend: {
                        show: false
                    },
                    data: {
                        x: 'x',
                        columns: [
                            time,
                            weight
                        ]
                    },
                    zoom: {
                        enabled: true
                    },
                    interaction: {
                        enabled: true
                    },
                    tooltip: {
                        format: {
                            title: function(d) {
                                return moment(d).format('DD MMMM YYYY года');
                            },
                            value: function(value, ratio, id) {
                                var format = function(d) {
                                    return d + " кг.";
                                }
                                return format(value);
                            }
                        }
                    },
                    axis: {
                        y: {
                            show: true,
                            label: {
                                text: 'Масса, кг.',
                                position: 'outer-middle'
                            }
                        },
                        x: {
                            type: 'timeseries',
                            tick: {
                                format: function(d) {
                                    return 91 - $scope.last_day.diff(moment(d), 'days');
                                }
                            },
                            label: {
                                text: 'Дни',
                                position: 'outer-middle'
                            }
                        }
                    }
                });

                $scope.$watch('weight_total', function() {
                    var time = $scope.time_total,
                        weight = $scope.weight_total;

                    time.unshift('x');
                    weight.unshift('Масса');


                    chart.load({
                        columns: [
                            time,
                            weight
                        ]
                    });

                });

            }
        }
    });

    app.directive('notesTitle', function() {
        var startdate = null;
        return {
            restrict: 'C',
            scope: false,
            link: function($scope, element, attrs) {
                if (attrs.first == "true") {
                    startdate = attrs.time;
                    var weight = ', не взвешивался';
                    if (typeof $scope.weight_this_day != 'undefined') {
                        weight = ', вес ' + $scope.weight_this_day + ' кг.';
                    }
                    element.text(moment(attrs.time).format('D MMMM, HH:mm' + weight));
                } else {
                    element.text(moment(attrs.time).from(startdate));
                }
            }
        };
    });

    app.directive('dayDate', function() {
        var dayfrom = 'xxx';
        return {
            restrict: 'C',
            scope: false,
            template: '<time datetime="{{day._id}}"><b>' + dayfrom + '</b><span>день</span></time>',
            link: function($scope, element, attrs) {
                var today = moment(attrs.time);
                element.find('b').text(91 - $scope.last_day.diff(today, 'days'));
                element.find('time').attr('title', today.format('DD MMMM YYYY года'));
            }
        };
    });

    app.directive('photosPhoto', function() {
        return {
            restrict: 'C',
            scope: false,
            link: function($scope, element, attrs) {
                element.bind('load', function() {
                    element.addClass('loaded');
                });
            }
        };
    });

    app.controller("NoteFormController", ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
        $scope.note = "";
        $scope.addNote = function() {
            $http.post(host + '/note/', {
                "note": $scope.note
            }).success(function() {
                $rootScope.$broadcast('newdata', 'note');
            });
            $scope.show('list');
            $scope.note = "";
        };
    }]);

    app.controller("WeightFormController", ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
        $scope.addWeight = function() {
            $scope.$parent.weight = $scope.weight;
            $http.post(host + '/day/', {
                "weight": $scope.$parent.weight
            }).success(function() {
                $rootScope.$broadcast('newdata', 'weight');
            });
            $scope.show('list');
            document.querySelector('.weight-form').reset();
        };
    }]);

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRheXNDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKFwiQmVsbHlEYXlzXCIsWydhbmd1bGFyRmlsZVVwbG9hZCddKVxuICAgICAgLCBob3N0ID0gXCJodHRwOi8vbG9jYWxob3N0OjgwODBcIjtcblxuICBtb21lbnQubG9jYWxlKCdydScpO1xuICAvLyB2YXIgaG9zdCA9IFwiaHR0cDovLzE3OC43OS4xODEuMTU3OjgwODBcIjtcbiAgXG4gIGFwcC5jb250cm9sbGVyKFwiQXBwQ29udHJvbGxlclwiLCBbJyR0aW1lb3V0JywgJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJyR1cGxvYWQnLCAnJGh0dHAnLCBmdW5jdGlvbiAoJHRpbWVvdXQsICRyb290U2NvcGUsICRzY29wZSwgJHVwbG9hZCwgJGh0dHApIHtcbiAgICBcbiAgICAkc2NvcGUucGhvdG9fdXJsID0gaG9zdCArICcvJztcbiAgICAkc2NvcGUucGFnZSA9ICdsaXN0JztcbiAgICAkc2NvcGUud2VpZ2h0ID0gbnVsbDtcbiAgICAkc2NvcGUudXBsb2FkaW5nID0gZmFsc2U7XG4gICAgJHNjb3BlLnByb2dyZXNzID0gMDtcbiAgICAkc2NvcGUuZGF5cyA9IFtdO1xuICAgICRzY29wZS5ub3RlcyA9IFtdO1xuICAgICRzY29wZS5waG90b3MgPSBbXTtcbiAgICAkc2NvcGUucGhvdG9zX2luZGV4ID0gMDtcbiAgICAkc2NvcGUud2VpZ2h0X3RoaXNfZGF5ID0gbnVsbDtcbiAgICAkc2NvcGUuZGF5X3RpbWUgPSBudWxsO1xuICAgICRzY29wZS5zY3JvbGxfdG9wID0gMDtcbiAgICAkc2NvcGUuc2Nyb2xsX3RpbWUgPSAyNTA7XG4gICAgJHNjb3BlLndlaWdodF90b3RhbCA9IFtdO1xuICAgICRzY29wZS50aW1lX3RvdGFsID0gW107XG5cbiAgICB2YXIgYXV0aCA9IGZhbHNlO1xuXG4gICAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24gKCkge1xuICAgICAgYXV0aCA9ICFhdXRoO1xuICAgICAgcmV0dXJuIGF1dGg7XG4gICAgfTtcblxuICAgICRzY29wZS5pc0F1dGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gYXV0aDtcbiAgICB9O1xuXG4gICAgcmVxdWVzdERhdGEoKTtcblxuICAgICRzY29wZS4kb24oJ25ld2RhdGEnLCByZXF1ZXN0RGF0YSk7XG5cbiAgICBmdW5jdGlvbiByZXF1ZXN0RGF0YSAoZXZlbnQsIHR5cGUpIHtcbiAgICAgICRodHRwLmdldChob3N0KycvZGF5LycpLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgIHZhciBpbmRleCwgdG9kYXksIGRheSwgbGFzdF93ZWlnaHQgPSBudWxsO1xuXG4gICAgICAgICRzY29wZS5kYXlzID0gZGF0YTtcbiAgICAgICAgJHNjb3BlLmZpcnN0X2RheSA9IG1vbWVudChkYXRhWzBdLl9pZCk7XG4gICAgICAgICRzY29wZS5sYXN0X2RheSA9IG1vbWVudChkYXRhWzBdLl9pZCkuYWRkKDkwLCAnZGF5cycpO1xuICAgICAgICAkc2NvcGUudG9kYXlfaWQgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLndlaWdodF90b3RhbCA9IFtdO1xuICAgICAgICAkc2NvcGUudGltZV90b3RhbCA9IFtdO1xuXG4gICAgICAgIHRvZGF5ID0gbW9tZW50KCk7XG4gICAgICAgIGluZGV4ID0gZGF0YS5sZW5ndGg7XG4gICAgICAgIHdoaWxlKGluZGV4LS0pe1xuICAgICAgICAgIGRheSA9IGRhdGFbaW5kZXhdO1xuICAgICAgICAgIGlmKHR5cGVvZiBkYXkud2VpZ2h0ICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAkc2NvcGUudGltZV90b3RhbC5wdXNoKG1vbWVudChkYXkuX2lkKS52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgJHNjb3BlLndlaWdodF90b3RhbC5wdXNoKGRheS53ZWlnaHQpO1xuICAgICAgICAgICAgbGFzdF93ZWlnaHQgPSBkYXkud2VpZ2h0O1xuICAgICAgICAgIH1lbHNlIGlmKGxhc3Rfd2VpZ2h0ICE9PSBudWxsKXtcbiAgICAgICAgICAgICRzY29wZS50aW1lX3RvdGFsLnB1c2gobW9tZW50KGRheS5faWQpLnZhbHVlT2YoKSk7XG4gICAgICAgICAgICAkc2NvcGUud2VpZ2h0X3RvdGFsLnB1c2gobGFzdF93ZWlnaHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihtb21lbnQoZGF5Ll9pZCkuZGlmZih0b2RheSwgJ2RheXMnKT09MCl7XG4gICAgICAgICAgICAkc2NvcGUudG9kYXlfaWQgPSBkYXkuX2lkO1xuICAgICAgICAgICAgaWYodHlwZW9mIGRheS53ZWlnaHQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgJHNjb3BlLndlaWdodCA9IGRheS53ZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoKHR5cGUpe1xuICAgICAgICAgIGNhc2UgJ2ZpdGJpdCc6XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ25vdGUnOlxuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgJHNjb3BlLm9wZW5Ob3Rlcygkc2NvcGUudG9kYXlfaWQpO1xuICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3Bob3RvJzpcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRzY29wZS5vcGVuUGhvdG9zKCRzY29wZS50b2RheV9pZCk7XG4gICAgICAgICAgICB9LCAzMDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNjcm9sbFRvcFN0ZXAgKCkge1xuICAgICAgdmFyIGRpZmYgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtICRzY29wZS5zY3JvbGxfc3RhcnRcbiAgICAgICAgICAsIHBvcyA9IGRpZmYqJHNjb3BlLnNjcm9sbF95LyRzY29wZS5zY3JvbGxfdGltZTtcbiAgICAgIHdpbmRvdy5zY3JvbGwoMCwgJHNjb3BlLnNjcm9sbF95LU1hdGgubWF4KHBvcywwKSk7XG4gICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJykuc2Nyb2xsVG9wID4gMCl7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsVG9wU3RlcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJHNjb3BlLnNjcm9sbFRvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5zY3JvbGxfeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKS5zY3JvbGxUb3A7XG4gICAgICAkc2NvcGUuc2Nyb2xsX3N0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAkc2NvcGUuc2Nyb2xsX3N0ZXAgPSAkc2NvcGUuc2Nyb2xsX3kvJHNjb3BlLnNjcm9sbF90aW1lO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShzY3JvbGxUb3BTdGVwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXREYXlCeUlkIChpZCkge1xuICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLmRheXMubGVuZ3RoO1xuICAgICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgICAgaWYoJHNjb3BlLmRheXNbaW5kZXhdLl9pZCA9PT0gaWQpe1xuICAgICAgICAgIHJldHVybiAkc2NvcGUuZGF5c1tpbmRleF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwbG9hZEVuZCAoKSB7XG4gICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUucHJvZ3Jlc3MgPSAwO1xuICAgICAgICAkc2NvcGUudXBsb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbmV3ZGF0YScsICdwaG90bycpO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfVxuXG4gICAgJHNjb3BlLnVwbG9hZCA9IGZ1bmN0aW9uIChmaWxlcywgZXZlbnQpIHtcbiAgICAgIGlmIChmaWxlcyAmJiBmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgJHNjb3BlLnVwbG9hZGluZyA9IHRydWU7XG4gICAgICAgICR1cGxvYWQudXBsb2FkKHtcbiAgICAgICAgICB1cmw6IGhvc3QrJy9waG90by8nLFxuICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgZmllbGRzOiB7J3VzZXJuYW1lJzogJHNjb3BlLnVzZXJuYW1lfSxcbiAgICAgICAgICBmaWxlOiBmaWxlc1swXVxuICAgICAgICB9KS5wcm9ncmVzcyhmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgJHNjb3BlLnByb2dyZXNzID0gcGFyc2VJbnQoMTAwLjAgKiBldnQubG9hZGVkIC8gZXZ0LnRvdGFsKTtcbiAgICAgICAgfSkuc3VjY2Vzcyh1cGxvYWRFbmQpLmVycm9yKHVwbG9hZEVuZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS4kd2F0Y2goJ2ZpbGVzJywgZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLnVwbG9hZCgkc2NvcGUuZmlsZXMpO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLm5leHRQaG90byA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5waG90b3NfaW5kZXggPSBNYXRoLm1pbigkc2NvcGUucGhvdG9zLmxlbmd0aC0xLCAkc2NvcGUucGhvdG9zX2luZGV4KzEpO1xuICAgIH07XG5cbiAgICAkc2NvcGUucHJldlBob3RvID0gZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLnBob3Rvc19pbmRleCA9IE1hdGgubWF4KDAsICRzY29wZS5waG90b3NfaW5kZXgtMSk7XG4gICAgfTtcblxuICAgICRzY29wZS5maXJzdFBob3RvID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICgkc2NvcGUucGhvdG9zX2luZGV4PT0wKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmxhc3RQaG90byA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAoJHNjb3BlLnBob3Rvc19pbmRleD09KCRzY29wZS5waG90b3MubGVuZ3RoLTEpKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNsb3NlUGhvdG8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUuc2hvdygnbGlzdCcpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuaXNXZWlnaHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLndlaWdodCA9PT0gbnVsbDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNob3cgPSBmdW5jdGlvbiAocGFnZSkge1xuICAgICAgdmFyIHNjcm9sbCA9IDA7XG4gICAgICBzd2l0Y2goJHNjb3BlLnBhZ2Upe1xuICAgICAgICBjYXNlICd3ZWlnaHQtZm9ybSc6XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLndlaWdodC1mb3JtJykucmVzZXQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbm90ZS1mb3JtJzpcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubm90ZS1mb3JtJykucmVzZXQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGhvdG9zJzpcbiAgICAgICAgICAkc2NvcGUucGhvdG9zX2luZGV4ID0gMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnBhZ2UgPSBwYWdlO1xuICAgICAgXG4gICAgICBpZigkc2NvcGUucGFnZSA9PSAnbGlzdCcpe1xuICAgICAgICBcbiAgICAgICAgc2Nyb2xsID0gJHNjb3BlLnNjcm9sbF90b3A7XG4gICAgICAgICRzY29wZS5zY3JvbGxfdG9wID0gMDtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICB3aW5kb3cuc2Nyb2xsKDAsIHNjcm9sbCk7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICB9ZWxzZXtcbiAgICAgICAgJHNjb3BlLnNjcm9sbF90b3AgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJykuc2Nyb2xsVG9wO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUub3BlbldlaWdodEZvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUuc2hvdygnd2VpZ2h0LWZvcm0nKTtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53ZWlnaHQtZm9ybSBpbnB1dCcpLmZvY3VzKCk7XG4gICAgfTtcblxuICAgICRzY29wZS5vcGVuTm90ZUZvcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUuc2hvdygnbm90ZS1mb3JtJyk7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubm90ZS1mb3JtIHRleHRhcmVhJykuZm9jdXMoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLm9wZW5Ob3RlcyA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgdmFyIGRheSA9IGdldERheUJ5SWQoaWQpO1xuICAgICAgJHNjb3BlLm5vdGVzID0gZGF5Lm5vdGVzO1xuICAgICAgJHNjb3BlLndlaWdodF90aGlzX2RheSA9IGRheS53ZWlnaHQ7XG4gICAgICAkc2NvcGUuc2hvdygnbm90ZXMnKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLm9wZW5QaG90b3MgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHZhciBkYXkgPSBnZXREYXlCeUlkKGlkKTtcbiAgICAgICRzY29wZS5kYXlfdGltZSA9IG1vbWVudChpZCkudW5peCgpO1xuICAgICAgJHNjb3BlLnBob3RvcyA9IGRheS5waG90b3M7XG4gICAgICAkc2NvcGUuc2hvdygncGhvdG9zJyk7XG4gICAgfTtcblxuICB9XSk7XG5cbiAgYXBwLmRpcmVjdGl2ZSgnZ3JhcGgnLGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQydcbiAgICAgICwgc2NvcGU6IGZhbHNlXG4gICAgICAsIGxpbms6IGZ1bmN0aW9uICgkc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG5cbiAgICAgICAgdmFyIHRpbWUgPSAkc2NvcGUudGltZV90b3RhbFxuICAgICAgICAgICAgLCB3ZWlnaHQgPSAkc2NvcGUud2VpZ2h0X3RvdGFsXG4gICAgICAgICAgICAsIGNoYXJ0OyBcblxuICAgICAgICBjaGFydCA9IGMzLmdlbmVyYXRlKHtcbiAgICAgICAgICAgICAgYmluZHRvOiAnLmdyYXBoX19jaGFydCcsXG4gICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICBwYWRkaW5nOntcbiAgICAgICAgICAgICAgICB0b3A6IDgwLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDgwLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiA4MCxcbiAgICAgICAgICAgICAgICBib3R0b206IDBcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgICBzaG93OiBmYWxzZVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgeDogJ3gnLFxuICAgICAgICAgICAgICAgIGNvbHVtbnM6IFtcbiAgICAgICAgICAgICAgICAgIHRpbWUsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHRcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHpvb206IHtcbiAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaW50ZXJhY3Rpb246IHtcbiAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IHtcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9tZW50KGQpLmZvcm1hdCgnREQgTU1NTSBZWVlZINCz0L7QtNCwJyk7XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgcmF0aW8sIGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmb3JtYXQgPSBmdW5jdGlvbihkKXtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZCArIFwiwqDQutCzLlwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3JtYXQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgYXhpczoge1xuICAgICAgICAgICAgICAgIHk6IHtcbiAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgICAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn0JzQsNGB0YHQsCwg0LrQsy4nLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ291dGVyLW1pZGRsZSdcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHg6IHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICd0aW1lc2VyaWVzJyxcbiAgICAgICAgICAgICAgICAgIHRpY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA5MSAtICRzY29wZS5sYXN0X2RheS5kaWZmKG1vbWVudChkKSwgJ2RheXMnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICfQlNC90LgnLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ291dGVyLW1pZGRsZSdcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuJHdhdGNoKCd3ZWlnaHRfdG90YWwnLCBmdW5jdGlvbigpe1xuICAgICAgICAgIHZhciB0aW1lID0gJHNjb3BlLnRpbWVfdG90YWxcbiAgICAgICAgICAgICAgLCB3ZWlnaHQgPSAkc2NvcGUud2VpZ2h0X3RvdGFsO1xuXG4gICAgICAgICAgdGltZS51bnNoaWZ0KCd4Jyk7XG4gICAgICAgICAgd2VpZ2h0LnVuc2hpZnQoJ9Cc0LDRgdGB0LAnKTtcblxuICAgICAgICAgIFxuICAgICAgICAgIGNoYXJ0LmxvYWQoe1xuICAgICAgICAgICAgY29sdW1uczogW1xuICAgICAgICAgICAgICB0aW1lLFxuICAgICAgICAgICAgICB3ZWlnaHRcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgYXBwLmRpcmVjdGl2ZSgnbm90ZXNUaXRsZScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhcnRkYXRlID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdDJ1xuICAgICAgLCBzY29wZTogZmFsc2VcbiAgICAgICwgbGluazogZnVuY3Rpb24gKCRzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgaWYoYXR0cnMuZmlyc3Q9PVwidHJ1ZVwiKXtcbiAgICAgICAgICBzdGFydGRhdGUgPSBhdHRycy50aW1lO1xuICAgICAgICAgIHZhciB3ZWlnaHQgPSAnLCDQvdC1INCy0LfQstC10YjQuNCy0LDQu9GB0Y8nO1xuICAgICAgICAgIGlmKHR5cGVvZiAkc2NvcGUud2VpZ2h0X3RoaXNfZGF5ICE9ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHdlaWdodCA9ICcsINCy0LXRgSAnKyRzY29wZS53ZWlnaHRfdGhpc19kYXkrJyDQutCzLic7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsZW1lbnQudGV4dChtb21lbnQoYXR0cnMudGltZSkuZm9ybWF0KCdEIE1NTU0sIEhIOm1tJyt3ZWlnaHQpKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZWxlbWVudC50ZXh0KG1vbWVudChhdHRycy50aW1lKS5mcm9tKHN0YXJ0ZGF0ZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbiAgYXBwLmRpcmVjdGl2ZSgnZGF5RGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGF5ZnJvbSA9ICd4eHgnO1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0MnXG4gICAgICAsIHNjb3BlOiBmYWxzZVxuICAgICAgLCB0ZW1wbGF0ZTogJzx0aW1lIGRhdGV0aW1lPVwie3tkYXkuX2lkfX1cIj48Yj4nK2RheWZyb20rJzwvYj48c3Bhbj7QtNC10L3RjDwvc3Bhbj48L3RpbWU+J1xuICAgICAgLCBsaW5rOiBmdW5jdGlvbiAoJHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICB2YXIgdG9kYXkgPSBtb21lbnQoYXR0cnMudGltZSk7XG4gICAgICAgIGVsZW1lbnQuZmluZCgnYicpLnRleHQoOTEgLSAkc2NvcGUubGFzdF9kYXkuZGlmZih0b2RheSwgJ2RheXMnKSk7XG4gICAgICAgIGVsZW1lbnQuZmluZCgndGltZScpLmF0dHIoJ3RpdGxlJywgdG9kYXkuZm9ybWF0KCdERCBNTU1NIFlZWVkg0LPQvtC00LAnKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbiAgYXBwLmRpcmVjdGl2ZSgncGhvdG9zUGhvdG8nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQydcbiAgICAgICwgc2NvcGU6IGZhbHNlXG4gICAgICAsIGxpbms6IGZ1bmN0aW9uICgkc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIGVsZW1lbnQuYmluZCgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnbG9hZGVkJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbiAgYXBwLmNvbnRyb2xsZXIoXCJOb3RlRm9ybUNvbnRyb2xsZXJcIiwgWyckcm9vdFNjb3BlJywgJyRzY29wZScsICckaHR0cCcsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzY29wZSwgJGh0dHApe1xuICAgICRzY29wZS5ub3RlID0gXCJcIjtcbiAgICAkc2NvcGUuYWRkTm90ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAkaHR0cC5wb3N0KGhvc3QrJy9ub3RlLycsIHtcIm5vdGVcIjogJHNjb3BlLm5vdGV9KS5zdWNjZXNzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCduZXdkYXRhJywgJ25vdGUnKTtcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnNob3coJ2xpc3QnKTtcbiAgICAgICRzY29wZS5ub3RlID0gXCJcIjtcbiAgICB9O1xuICB9XSk7XG5cbiAgYXBwLmNvbnRyb2xsZXIoXCJXZWlnaHRGb3JtQ29udHJvbGxlclwiLCBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJyRodHRwJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHNjb3BlLCAkaHR0cCl7XG4gICAgJHNjb3BlLmFkZFdlaWdodCA9IGZ1bmN0aW9uKCl7XG4gICAgICAkc2NvcGUuJHBhcmVudC53ZWlnaHQgPSAkc2NvcGUud2VpZ2h0O1xuICAgICAgJGh0dHAucG9zdChob3N0KycvZGF5LycsIHtcIndlaWdodFwiOiAkc2NvcGUuJHBhcmVudC53ZWlnaHR9KS5zdWNjZXNzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCduZXdkYXRhJywgJ3dlaWdodCcpO1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUuc2hvdygnbGlzdCcpO1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLndlaWdodC1mb3JtJykucmVzZXQoKTtcbiAgICB9O1xuICB9XSk7XG5cbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9