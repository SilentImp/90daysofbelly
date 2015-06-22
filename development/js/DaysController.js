(function(){

  var app = angular.module("BellyDays",['angularFileUpload'])
      , host = "http://localhost:8080";

  moment.locale('ru');
  // var host = "http://178.79.181.157:8080";

  app.controller("AppController", ['$timeout', '$rootScope', '$scope', '$upload', '$http', function ($timeout, $rootScope, $scope, $upload, $http) {

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

    $scope.login = function () {
      auth = !auth;
      return auth;
    };

    $scope.isAuth = function () {
      return auth;
    };

    requestData();

    $scope.$on('newdata', requestData);

    function requestData (event, type) {
      $http.get(host+'/day/').success(function (data, status, headers, config) {
        var index, today, day, last_weight = null;

        $scope.days = data;
        $scope.first_day = moment(data[0]._id);
        $scope.last_day = moment(data[0]._id).add(90, 'days');
        $scope.today_id = null;

        $scope.weight_total = [];
        $scope.time_total = [];

        today = moment();
        index = data.length;
        while(index--){
          day = data[index];
          if(typeof day.weight !== 'undefined'){
            $scope.time_total.push(moment(day._id).valueOf());
            $scope.weight_total.push(day.weight);
            last_weight = day.weight;
          }else if(last_weight !== null){
            $scope.time_total.push(moment(day._id).valueOf());
            $scope.weight_total.push(last_weight);
          }
          if(moment(day._id).diff(today, 'days')==0){
            $scope.today_id = day._id;
            if(typeof day.weight !== 'undefined'){
              $scope.weight = day.weight;
            }
          }
        }

        switch(type){
          case 'fitbit':

            break;
          case 'note':
            $timeout(function(){
              $scope.openNotes($scope.today_id);
            }, 300);
            break;
          case 'photo':
            $timeout(function(){
              $scope.openPhotos($scope.today_id);
            }, 300);
            break;
        }
      });
    }

    function scrollTopStep () {
      var diff = new Date().getTime() - $scope.scroll_start
          , pos = diff*$scope.scroll_y/$scope.scroll_time;
      window.scroll(0, $scope.scroll_y-Math.max(pos,0));
      if(document.querySelector('html').scrollTop > 0){
        window.requestAnimationFrame(scrollTopStep);
      }
    }

    $scope.scrollTop = function () {
      $scope.scroll_y = document.querySelector('html').scrollTop;
      $scope.scroll_start = new Date().getTime();
      $scope.scroll_step = $scope.scroll_y/$scope.scroll_time;
      window.requestAnimationFrame(scrollTopStep);
    }

    function getDayById (id) {
      var index = $scope.days.length;
      while (index--) {
        if($scope.days[index]._id === id){
          return $scope.days[index];
        }
      }
      return null;
    }

    function uploadEnd () {
      $timeout(function(){
        $scope.progress = 0;
        $scope.uploading = false;
        $rootScope.$broadcast('newdata', 'photo');
      }, 2000);
    }

    $scope.upload = function (files, event) {
      if (files && files.length) {
        $scope.uploading = true;
        $upload.upload({
          url: host+'/photo/',
          method: 'PUT',
          fields: {'username': $scope.username},
          file: files[0]
        }).progress(function (evt) {
          $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        }).success(uploadEnd).error(uploadEnd);
      }
    };

    $scope.$watch('files', function () {
      $scope.upload($scope.files);
    });

    $scope.nextPhoto = function () {
      $scope.photos_index = Math.min($scope.photos.length-1, $scope.photos_index+1);
    };

    $scope.prevPhoto = function () {
      $scope.photos_index = Math.max(0, $scope.photos_index-1);
    };

    $scope.firstPhoto = function () {
      return ($scope.photos_index==0);
    };

    $scope.lastPhoto = function () {
      return ($scope.photos_index==($scope.photos.length-1));
    };

    $scope.closePhoto = function () {
      $scope.show('list');
    };

    $scope.isWeight = function () {
      return $scope.weight === null;
    };

    $scope.show = function (page) {
      var scroll = 0;
      switch($scope.page){
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

      if($scope.page == 'list'){

        scroll = $scope.scroll_top;
        $scope.scroll_top = 0;
        window.setTimeout(function(){
          window.scroll(0, scroll);
        }, 0);

      }else{
        $scope.scroll_top = document.querySelector('html').scrollTop;
      }
    };

    $scope.openWeightForm = function () {
      $scope.show('weight-form');
      document.querySelector('.weight-form input').focus();
    };

    $scope.openNoteForm = function () {
      $scope.show('note-form');
      document.querySelector('.note-form textarea').focus();
    };

    $scope.openNotes = function (id) {
      var day = getDayById(id);
      $scope.notes = day.notes;
      $scope.weight_this_day = day.weight;
      $scope.show('notes');
    };

    $scope.openPhotos = function (id) {
      var day = getDayById(id);
      $scope.day_time = moment(id).unix();
      $scope.photos = day.photos;
      $scope.show('photos');
    };

  }]);

  app.directive('graph',function(){
    return {
      restrict: 'C'
      , scope: false
      , link: function ($scope, element, attrs) {

        // var time = $scope.time_total
        //     , weight = $scope.weight_total
        //     , chart;
        //
        // chart = c3.generate({
        //       bindto: '.graph__chart',
        //       height: '100%',
        //       padding:{
        //         top: 80,
        //         left: 80,
        //         right: 80,
        //         bottom: 0
        //       },
        //       legend: {
        //           show: false
        //       },
        //       data: {
        //         x: 'x',
        //         columns: [
        //           time,
        //           weight
        //         ]
        //       },
        //       zoom: {
        //           enabled: true
        //       },
        //       interaction: {
        //         enabled: true
        //       },
        //       tooltip: {
        //         format: {
        //           title: function (d) {
        //             return moment(d).format('DD MMMM YYYY года');
        //           },
        //           value: function (value, ratio, id) {
        //             var format = function(d){
        //               return d + " кг.";
        //             }
        //             return format(value);
        //           }
        //         }
        //       },
        //       axis: {
        //         y: {
        //           show: true,
        //           label: {
        //             text: 'Масса, кг.',
        //             position: 'outer-middle'
        //           }
        //         },
        //         x: {
        //           type: 'timeseries',
        //           tick: {
        //             format: function (d) {
        //               return 91 - $scope.last_day.diff(moment(d), 'days');
        //             }
        //           },
        //           label: {
        //             text: 'Дни',
        //             position: 'outer-middle'
        //           }
        //         }
        //       }
        //   });
        //
        // $scope.$watch('weight_total', function(){
        //   var time = $scope.time_total
        //       , weight = $scope.weight_total;
        //
        //   time.unshift('x');
        //   weight.unshift('Масса');
        //
        //
        //   chart.load({
        //     columns: [
        //       time,
        //       weight
        //     ]
        //   });
        //
        // });

      }
    }
  });

  app.directive('notesTitle', function () {
    var startdate = null;
    return {
      restrict: 'C'
      , scope: false
      , link: function ($scope, element, attrs) {
        if(attrs.first=="true"){
          startdate = attrs.time;
          var weight = ', не взвешивался';
          if(typeof $scope.weight_this_day != 'undefined'){
            weight = ', вес '+$scope.weight_this_day+' кг.';
          }
          element.text(moment(attrs.time).format('D MMMM, HH:mm'+weight));
        }else{
          element.text(moment(attrs.time).from(startdate));
        }
      }
    };
  });

  app.directive('dayDate', function () {
    var dayfrom = 'xxx';
    return {
      restrict: 'C'
      , scope: false
      , template: '<time datetime="{{day._id}}"><b>'+dayfrom+'</b><span>день</span></time>'
      , link: function ($scope, element, attrs) {
        var today = moment(attrs.time);
        element.find('b').text(91 - $scope.last_day.diff(today, 'days'));
        element.find('time').attr('title', today.format('DD MMMM YYYY года'));
      }
    };
  });

  app.directive('photosPhoto', function () {
    return {
      restrict: 'C'
      , scope: false
      , link: function ($scope, element, attrs) {
        element.bind('load', function() {
            element.addClass('loaded');
          });
      }
    };
  });

  app.controller("NoteFormController", ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http){
    $scope.note = "";
    $scope.addNote = function(){
      $http.post(host+'/note/', {"note": $scope.note}).success(function () {
        $rootScope.$broadcast('newdata', 'note');
      });
      $scope.show('list');
      $scope.note = "";
    };
  }]);

  app.controller("WeightFormController", ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http){
    $scope.addWeight = function(){
      $scope.$parent.weight = $scope.weight;
      $http.post(host+'/day/', {"weight": $scope.$parent.weight}).success(function () {
        $rootScope.$broadcast('newdata', 'weight');
      });
      $scope.show('list');
      document.querySelector('.weight-form').reset();
    };
  }]);

})();
