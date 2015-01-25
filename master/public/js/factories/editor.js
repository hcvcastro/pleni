'use strict';

pleni.factory('Editor',['$sessionStorage',
    function($sessionStorage){
        var editor;

        return {
            create:function(name,schema){
                if(editor){
                    editor.destroy();
                }
                if(schema.properties._dbserver){
                    schema.properties._dbserver.enum=
                        $sessionStorage.dbservers.map(function(dbserver){
                            return dbserver.id;
                        });
                }
                if(schema.properties._repository){
                    schema.properties._repository.enum=
                        $sessionStorage.repositories.map(function(repository){
                            return repository.id;
                        });
                }

                editor=jsoneditor(name,schema);
                return editor;
            }
          , validate:function(){
                return editor.validate();
            }
          , is_valid:function(){
                return (this.validate().length==0);
            }
          , values:function(){
                return editor.getValue();
            }
        };
}]);
