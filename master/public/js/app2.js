    $scope.task={
        name:'exclusive'
      , count:1
      , interval:1000
    };

    $scope.refresh=function(){
        Planners.query(function(data){
            for(var i=0;i<data.length;i++){
                $scope.planners[data[i].id]={
                    host:data[i].host
                  , port:data[i].port
                  , status:'unknown'
                  , action:'unknown'
                  , tasks:new Array()
                };
            }
        });
    };
    if(!$scope.sessionStorage.planners){
        $scope.sessionStorage.planners={};
        $scope.refresh();
    }
    $scope.planners=$scope.sessionStorage.planners;
    $scope.add=function(){
        $scope.prepare('new','config');
        $scope.current='';
    };
    $scope.get=function(planner){
        $scope.prepare('view','view');
        $scope.current=planner;
    };
    $scope.save=function(){
        to_waiting();
        var connection=new Planners({
            host:$scope.planner.host
          , port:$scope.planner.port
        });
        if($scope.env.panel=='new'){
            connection.id=$scope.planner.id;
            connection.$save(function(data){
                $scope.planners[data.id]={
                    host:data.host
                  , port:data.port
                  , status:'unknown'
                  , action:'unknown'
                  , tasks:new Array()
                };
                show_alert('success','Planner added');
                to_hide('ok','');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }else if($scope.env.panel=='view'){
            connection.$update({planner:$scope.current},function(data){
                $scope.planners[$scope.current]={
                    host:data.host
                  , port:data.port
                  , status:'unknown'
                  , action:'unknown'
                  , tasks:new Array()
                };
                show_alert('success','Connection updated');
                to_hide('ok','');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }
    };
    $scope.remove=function(){
        to_waiting();
        if($scope.env.panel=='view'){
            Planners.delete({planner:$scope.current},function(data){
                delete $scope.planners[$scope.current];
                $scope.current='';
                $scope.prepare('index','index');
                show_alert('success','Connection removed');
            },function(error){
                show_alert('danger',error.data.message);
                to_hide('fail','');
            });
        }
    };
    $scope.check=function(){
        to_waiting();
        if($scope.env.type=='config'){
            var connection=new Planners({
                host:$scope.planner.host
              , port:$scope.planner.port
            });
            connection.$check({},function(data){
                to_hide('ok','ok');
            },function(error){
                to_hide('fail','fail');
            });
        }else if($scope.env.type=='view'){
            Planners.check({planner:$scope.current},
            function(data){
                $scope.planners[$scope.current].status=data.status;
                to_hide('ok',data.status);
            },function(error){
                $scope.planners[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
    };
    $scope.status=function(){
        to_waiting();
        if($scope.env.type=='view'){
            Planners.status({planner:$scope.current},
            function(data){
                $scope.planners[$scope.current].action=data.status;
                to_hide('ok',data.status);
            },function(error){
                $scope.planners[$scope.current].status='offline';
                to_hide('fail','fail');
            });
        }
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
    $scope.view=function(){
        if($scope.env.type!='view'){
            $scope.prepare('view','view');
        }
    };
    $scope.edit=function(){
        if($scope.env.type!='config'){
            $scope.prepare('view','config');
            $scope.planner={
                id:$scope.current
              , host:$scope.planners[$scope.current].host
              , port:parseInt($scope.planners[$scope.current].port)
            };
        }
    };
    $scope.delete=function(){
        if($scope.env.type!='delete'){
            $scope.prepare('view','delete');
        }
    };
    $scope.prepare=function(panel,type){
        to_hide('fail','');
        hide_alert();
        $scope.env={panel:panel,type:type};
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

