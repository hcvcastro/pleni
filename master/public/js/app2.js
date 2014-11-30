    $scope.task={
        name:'exclusive'
      , count:1
      , interval:1000
    };

    $scope.api=function(){
        to_waiting();
        if($scope.env.panel=='view'){
            Planners.api({planner:$scope.current},
            function(data){
                $scope.planners[$scope.current].tasks=data;
                to_hide('ok','complete');
            },function(error){
                $scope.planners[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
    };
    $scope.editor=function(value){
        if(value!==''&&$scope.planners[$scope.current].status=='taken'){
            var tasks=$scope.planners[$scope.current].tasks
              , name=$scope.planners[$scope.current].task
              , args=tasks.filter(function(element){
                    if(element.name==name){
                        return true;
                    }
                })
            
            if($scope.jsoneditor){
                $scope.jsoneditor.destroy();
            }
            $scope.jsoneditor=build_jsoneditor(args[0]);
        }
    };
    $scope.$watch('current',$scope.editor);
    $scope.settask=function(){
        to_waiting();
        if($scope.env.panel=='view'){
            Planners.set({planner:$scope.current},$scope.task,
            function(data){
                $scope.planners[$scope.current].status='taken';
                $scope.planners[$scope.current].task=$scope.task.name;
                $scope.editor($scope.current);
                to_hide('ok','task established');
            },function(error){
                to_hide('fail',error.data.message);
            });
        }
    };
    $scope.removetask=function(){
        to_waiting();
        if($scope.env.panel=='view'){
            Planners.remove({planner:$scope.current},
            function(data){
                $scope.planners[$scope.current].status='online';
                delete $scope.planners[$scope.current].task;
                to_hide('ok','task removed');
            },function(error){
                to_hide('fail','fail');
            });
        }
    };
    $scope.runtask=function(){
        if($scope.env.panel=='view'){
            Planners.run({planner:$scope.current},$scope.jsoneditor.getValue(),
            function(data){
                $scope.planners[$scope.current].action='running';
                to_hide('ok','running...');
            },function(error){
                to_hide('fail','fail');
            });
        }
    };
    $scope.stoptask=function(){
        if($scope.env.panel=='view'){
            Planners.stop({planner:$scope.current},
            function(data){
                $scope.planners[$scope.current].action='stopped';
                to_hide('ok','...stopped');
            },function(error){
                to_hide('fail','fail');
            });
        }
    };
}]);

