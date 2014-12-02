'use strict';

// JSONEditor settings
JSONEditor.defaults.options.theme='html'
JSONEditor.defaults.options.iconlib='fontawesome4';
JSONEditor.defaults.options.disable_collapse=true
JSONEditor.defaults.options.disable_edit_json=true
JSONEditor.defaults.options.disable_properties=true

var jsoneditor=function(args){
    var editor=new JSONEditor(document.getElementById('editor'),{schema:args});
    return editor;
}

