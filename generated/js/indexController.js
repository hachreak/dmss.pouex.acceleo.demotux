var PouexApp = angular.module("PouexApp", [ 'ngStorage' ]);

PouexApp.factory('PouexDataService', [ '$http', '$localStorage', '$q', function($http, $localStorage, $q) {

    var getData = function() {
        var deferred = $q.defer();

        $http({method:"GET", url:"model/index.json"}).success(function(data){
            // init local storage
            $storage = $localStorage.$default({
              game: data
            });
            // resolve data
            deferred.resolve($storage);
        });

        return deferred.promise;
    };

    var reset = function(){
      delete $storage.game;
    };

    return { getData: getData, reset: reset };
}]);

PouexApp.controller('CtrlMenu', [ '$scope', '$http', 'PouexDataService', function($scope, $http, PouexDataService){
  
  // load model
  var myDataPromise = PouexDataService.getData();

  myDataPromise.then(function(result){
    $scope.$storage = result;

    // if not set, set birthday
    $scope.$storage.game.pouex.birthday = $scope.$storage.game.pouex.birthday || new Date();

      // state's activation
      $scope.$watchCollection("[ $storage.game.pouex.features['Happiness'].value ]", function(newValues, oldValues){
        if(typeof $scope.$storage.game != "undefined"){
          var i = 0;
          if(newValues[ i++ ] > 7.0){
            // set in model the activation
            $scope.$storage.game.pouex.states.Happy.active = true;
          }else{
           // set in model the activation
           $scope.$storage.game.pouex.states.Happy.active = false;
          }
        }
      });

      $scope.$watch("$storage.game.pouex.states['Happy'].active", function(newValue, oldValue){
        if(typeof $scope.$storage.game != "undefined"){
          if(newValue){
            	$scope.$storage.game.pouex.body.body.subparts.mouth.default = $scope.$storage.game.pouex.body.body.subparts.mouth.imageUrl;
              // state animation 
              $scope.$storage.game.pouex.body.body.subparts.mouth.imageUrl = 'imgs/mouth_happy.png'; 
          }else{
              // restore animation 
              $scope.$storage.game.pouex.body.body.subparts.mouth.imageUrl = $scope.$storage.game.pouex.body.body.subparts.mouth.default;
          }
        }
      });

      
      // state's activation
      $scope.$watchCollection("[ $storage.game.pouex.features['Weight'].value, $storage.game.pouex.features['Happiness'].value, $storage.game.pouex.features['Age'].value, $storage.game.pouex.states['Hungry'].active, $storage.game.pouex.states['Dirty'].active, $storage.game.pouex.features['Hungry'].value ]", function(newValues, oldValues){
        if(typeof $scope.$storage.game != "undefined"){
          var i = 0;
          if(newValues[ i++ ] > 80.0 || newValues[ i++ ] < 1.0 || newValues[ i++ ] > 99.0 || ( newValues[ i++ ] && newValues[ i++ ] ) || newValues[ i++ ] > 99.0){
            // set in model the activation
            $scope.$storage.game.pouex.states.TheEnd.active = true;
          }else{
           // set in model the activation
           $scope.$storage.game.pouex.states.TheEnd.active = false;
          }
        }
      });

      $scope.$watch("$storage.game.pouex.states['TheEnd'].active", function(newValue, oldValue){
        if(typeof $scope.$storage.game != "undefined"){
          if(newValue){
          }else{
          }
        }
      });

        // catch state activation
        $scope.$watch("$storage.game.pouex.states['TheEnd'].active", function(){
          // if dead 
          if(this.last){
            // reset memory
            PouexDataService.reset();
            // end the game
            $('#state-dead').modal();
          }
        });  
      	
      // state's activation
      $scope.$watchCollection("[ $storage.game.pouex.features['Dirty'].value ]", function(newValues, oldValues){
        if(typeof $scope.$storage.game != "undefined"){
          var i = 0;
          if(newValues[ i++ ] > 80.0){
            // set in model the activation
            $scope.$storage.game.pouex.states.Dirty.active = true;
          }else{
           // set in model the activation
           $scope.$storage.game.pouex.states.Dirty.active = false;
          }
        }
      });

      $scope.$watch("$storage.game.pouex.states['Dirty'].active", function(newValue, oldValue){
        if(typeof $scope.$storage.game != "undefined"){
          if(newValue){
            	$scope.$storage.game.pouex.body.body.default = $scope.$storage.game.pouex.body.body.imageUrl;
              // state animation 
              $scope.$storage.game.pouex.body.body.imageUrl = 'imgs/body_dirty.png'; 
          }else{
              // restore animation 
              $scope.$storage.game.pouex.body.body.imageUrl = $scope.$storage.game.pouex.body.body.default;
          }
        }
      });

      
      // state's activation
      $scope.$watchCollection("[ $storage.game.pouex.features['Hungry'].value ]", function(newValues, oldValues){
        if(typeof $scope.$storage.game != "undefined"){
          var i = 0;
          if(newValues[ i++ ] > 80.0){
            // set in model the activation
            $scope.$storage.game.pouex.states.Hungry.active = true;
          }else{
           // set in model the activation
           $scope.$storage.game.pouex.states.Hungry.active = false;
          }
        }
      });

      $scope.$watch("$storage.game.pouex.states['Hungry'].active", function(newValue, oldValue){
        if(typeof $scope.$storage.game != "undefined"){
          if(newValue){
          }else{
          }
        }
      });

      

    // execute a action: manipupate feature value
    $scope.executeAction = function(name){
      if(typeof $scope.$storage.game != "undefined"){
        angular.forEach($scope.$storage.game.pouex.actions[ name ], function(value, key){
          var operation = value.operation;
          var operator = value.operator; 
          var fname = value.feature;
          var fvalue = $scope.$storage.game.pouex.features[ fname ].value;
          var fmax = $scope.$storage.game.pouex.features[ fname ].maximum;
          var fmin = $scope.$storage.game.pouex.features[ fname ].minimum;

          var ret = eval(fvalue + operator + operation);

          if(ret > fmax){
            ret = fmax;
          }
          if(ret < fmin){
            ret = fmin;
          }

          $scope.$storage.game.pouex.features[ fname ].value = ret;
        });
      }
    };

    // implement a repeated event
      var happy_birthday_timer = setInterval(function(){
        $scope.executeAction('happy_birthday');
        $scope.$apply();
      }, 10000);
      var each_1s_timer = setInterval(function(){
        $scope.executeAction('each_1s');
        $scope.$apply();
      }, 1000);
    

    // Compute a feature value transformation: from number to percetual value
    $scope.getFeaturePercValue = function(name){
      if(typeof($scope.$storage.game) === "undefined") return 0;
      return ($scope.$storage.game.pouex.features[name].value - $scope.$storage.game.pouex.features[name].minimum) * 100 / ($scope.$storage.game.pouex.features[name].maximum - $scope.$storage.game.pouex.features[name].minimum);
    };

  });

  $scope.PouexNewGame = function(){
    // reset memory
    PouexDataService.reset();
    // reload page
    $('#state-dead').modal();
  };
}]);
	
