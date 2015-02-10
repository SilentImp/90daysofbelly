(function(){

  var app = angular.module("BellyDays",[]);

  console.log($injector);

  app.controller("DaysController",function($scope){

    console.log('days', arguments);
  });

  app.controller("NoteController",function($scope){
    console.log('note', arguments);
  });

  app.controller("NoteFormController",function($scope){
    console.log('note-form', arguments);
  });

  app.controller("WeightFormController",function($scope){
    console.log('weight-form', arguments);
  });

})();