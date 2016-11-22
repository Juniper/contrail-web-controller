define([
    'lodash','config/configEditor/ui/js/views/ConfigObjectDetailsView',
    'config/configEditor/ui/js/views/ConfigObjectListView'
], function (lodash, ConfigObjectDetailsView, ConfigObjectListView) {
    var ConfigObjectDetailUtils = function () {
        var self = this;
        self.objectDetailsView = new ConfigObjectDetailsView;
        self.objectListView = new ConfigObjectListView;
        self.previousObj = [];
        self.formRadioFlag = true;
        self.oldFormData = undefined;
        self.textAreaModel = undefined;
        self.schema = {};
        self.disableKeys = undefined;
        self.formJson = undefined;
        self.jsoneditor = undefined;
        self.keep_value = undefined;
        self.modelLayout = '<div id="config-error-container" class="alert-error clearfix">'+
                           '<div id="config-msg-container"><span class="error-font-weight">Error : </span><span id="config-error-msg-container"></span></div>'+
                           '<div id="error-remove-icon"><button id="remove-error-popup" class="btn btn-mini"><i class="fa fa-remove"></i></button></div></div>'+
                           '<div id="editorContainer"><div class="json-editor-form-view-header">'+
                           '<div><input type="radio" name="switchFormJson" id="configFormMode" checked="true"></input><label>Form</label><input type="radio" name="switchFormJson" id="configJsonMode"></input><label>JSON</label></div></div>'+
                           '<div id="jsonEditorContainer"></div><div id="rawJsonEdit" style="display:none;"><textarea id="rawJsonTextArea" spellcheck="false"></textarea></div>'+
                           '</div>';
        self.conformMsg = '<div>Are you sure you want to delete  <b></b>?</div>';
        self.unDeletableProp = ['uuid','href','fq_name','owner','creator','created','last_modified','timer','parent_uuid','parent_type'];
        self.getCopiedContent = function(){
            $('#hiddenTextArea').removeClass('hide-header-icon');
            document.getElementById('hiddenTextArea').select();
            document.execCommand('copy');
            contrail.successMsg(ctwc.COPIED_MSG);
            $('#hiddenTextArea').addClass('hide-header-icon');
        }
        self.hideHeaderIcons = function(template){
            template.find('.refresh-container').show();
            template.find('.create-config-object').hide();
            template.find('.delete-config-object').show();
        }
        self.setContentInTextArea = function(model) {
            document.getElementById('hiddenTextArea').value = '';
            document.getElementById('hiddenTextArea').value = JSON.stringify(model,null,2); 
        }
        self.getWindowHeight = function(){
            var outerHeight = window.outerHeight;
            var pageHeader = $("#pageHeader").height();
            var breadCrum = $("#breadcrumbs").height();
            return outerHeight - pageHeader - breadCrum - 133;
        }
        self.updateKeyValueBeforeSave = function(model){
            for (var i in model) {
                if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                       self.updateKeyValueBeforeSave(model[i]);
                }else if( model[i] !== null && model[i].constructor === Array){
                    for(var j = 0; j < model[i].length;){
                        if(model[i][j] === ''){
                            model[i].splice(j,1);
                         }else if(typeof model[i][j] === 'object'){
                            self.updateKeyValueBeforeSave(model[i][j]);
                            j++;
                        }else{
                            j++;
                        }
                    }
                }else if(typeof model[i] === 'string' || typeof model[i] === 'number'){
                    if(i === 'fq_name'){
                        var fqName = model[i].split(':');
                        model[i] = fqName;
                    }else if(i === 'to'){
                        var to = model[i].split(':');
                        model[i] = to;
                    }
                }
            }
          return model;
        }
        self.parseJsonKeyLowerToUpper = function(key){
            var splitedKey = key.split('_'); var strStack = [];
            for(var i = 0; i < splitedKey.length; i++){
                var captilizeStr = splitedKey[i].charAt(0).toUpperCase() + splitedKey[i].slice(1);
                strStack.push(captilizeStr);
            }
            return strStack.join(' ');
        }
        self.parseParentKeyLowerToUpper = function(key){
            var splitedKey = key.split('-'); var strStack = [];
            for(var i = 0; i < splitedKey.length; i++){
                var captilizeStr = splitedKey[i].charAt(0).toUpperCase() + splitedKey[i].slice(1);
                strStack.push(captilizeStr);
            }
            return strStack.join(' ');
        }
        self.cancelSchemaBasedForm = function(template){
            template.find('.refresh-container').show();
            template.find(".object-json-view").css({"height": "auto"});
            template.find("#jsonContainer").show();
            template.find("#jsonContainer").css('width', '100%');
            template.find(".object-json-view").css('width','100%');
            template.find(".object-text-area-view").hide();
            template.find(".object-json-view").show();
            template.find(".object-basic-view").hide();
            template.find(".update-config-object").hide();
        }
        self.showConfigErrorMsg = function(msg){
            var errorHolder = $("#config-error-msg-container");
            errorHolder.empty();
            errorHolder.text(msg);
            $('.modal-body').scrollTop(0);
            var errorContainer = $("#config-error-container");
            errorContainer.fadeIn(500);
            $("#remove-error-popup").on('click',function(){
                $("#config-error-container").css('display','none');
            });
        }
        self.hideErrorPopup = function(){
            $("#config-error-container").css('display','none');
        }
     //Config Editor Pop up
        self.loadConfigEditorModal = function(schema, json, viewConfig, disableKeys, refs){
            self.formRadioFlag = true;
            self.formJson = json;
            self.disableKeys = disableKeys;
            //self.getModelRefs(json);
            if(Object.keys(self.formJson).length == 0){
                self.schema = schema;
                var modelTitle = self.parseParentKeyLowerToUpper(Object.keys(schema.properties)[0]);
                self.generateConfigModal(modelTitle, viewConfig);
                self.loadSchemaBasedForm(self.formJson, self.schema, true);
                self.oldFormData = $.extend(true, {}, jsoneditor.getValue());
                self.textAreaModel = $.extend(true, {}, jsoneditor.getValue());
                document.getElementById('rawJsonTextArea').value = '';
                document.getElementById('rawJsonTextArea').value = JSON.stringify(self.textAreaModel,null,2);
            }else{
                var parentKey = Object.keys(schema.properties)[0];
                var property = self.setOrderOfModifedSchema(self.modifiedExistingSchema(schema, self.formJson));
                var childProperty = self.changeExistingOrder(property);
                self.schema.type = 'object';
                self.schema.properties = {};
                self.schema.properties[parentKey] = {};
                self.schema.properties[parentKey]['type'] = 'object';
                self.schema.properties[parentKey]['collapse'] = true;
                self.schema.properties[parentKey]['properties'] = {};
                self.schema.properties[parentKey].properties = childProperty;
                var areaModel = $.extend(true,{},self.formJson);
                var oldModel = $.extend(true,{},self.formJson);
                var modelTitle = self.parseParentKeyLowerToUpper(Object.keys(self.formJson)[0]);
                self.generateConfigModal(modelTitle, viewConfig);
                self.formJson = self.updateModelForSchema(self.formJson);
                self.loadSchemaBasedForm(self.formJson, self.schema, false);
                self.oldFormData = $.extend(true, self.formJson, jsoneditor.getValue());
                var newFormData = $.extend(true,{},self.formJson);
                document.getElementById('rawJsonTextArea').value = '';
                //var formModel = self.updateKeyValueBeforeSave(newFormData);
                self.textAreaModel = self.updateRefForTextArea(newFormData, refs);
                document.getElementById('rawJsonTextArea').value = JSON.stringify(self.textAreaModel,null,2);
            }
            $("input:radio[id=configJsonMode]").change(function() {
                var textAreaHeight = $('.modal-body').height() - 57 +'px';
                var updatedModel = self.updateRefForTextArea(jsoneditor.getValue(), refs);
                if(Object.keys(self.formJson).length == 0){
                    var model = updatedModel[Object.keys(updatedModel)[0]];
                    if(model['parent_type'] === ''){
                        for(var n = 0; n < optionsList.length; n++){
                           delete model[optionsList[n][1]];
                        }
                    }else {
                        for(var n = 0; n < optionsList.length; n++){
                            if(optionsList[n][0] !== model['parent_type']){
                                delete model[optionsList[n][1]];
                            }
                         }
                    }
                    updatedModel[Object.keys(updatedModel)[0]] = model;
                }
                document.getElementById('rawJsonTextArea').value = '';
                document.getElementById('rawJsonTextArea').value = JSON.stringify(updatedModel, null, 2);
                $("#rawJsonEdit").css({"display": "block"});
                $("#jsonEditorContainer").css("display", "none");
                self.hideErrorPopup();
                self.formRadioFlag = false;
                if($('#rawJsonTextArea').closest('.linedtextarea').length == 0) {
                    $("#rawJsonTextArea").css({"height": textAreaHeight,"resize":"none"});
                    $('#rawJsonTextArea').linedtextarea();
                }
             });
             $("input:radio[id=configFormMode]").change(function() {
               var json = JSON.parse(document.getElementById('rawJsonTextArea').value),fieldHide = false;
               var model = self.updateRefForForm(json);
               if(Object.keys(self.formJson).length == 0){
                   self.loadSchemaBasedForm(model, self.schema, true);
               }else{
                   self.loadSchemaBasedForm(model, self.schema, false);
               }
               $("#jsonEditorContainer").css("display", "block");
               $("#rawJsonEdit").css("display", "none");
               self.formRadioFlag = true;
               self.hideErrorPopup();
             });
        }
        // ToDo Move into the stack and compare
        self.changeExistingOrder = function(schema){
            for(var i in schema){
                if(i == 'display_name'){
                    schema[i].propertyOrder = 1;
                } 
                if(i == 'name'){
                    schema[i].propertyOrder = 2;
                }
                if(i == 'fq_name'){
                    schema[i].propertyOrder = 3;
                }
                if(i == 'uuid'){
                    schema[i].propertyOrder = 4;
                }
                if(i == 'parent_uuid'){
                    schema[i].propertyOrder = 5;
                }
            }
          return schema;
        }
        self.setOrderOfModifedSchema =  function(updatedSchema){
            var proOrder = 200, stringOrder = 5, booleanOrder = 150;
            for(var j in updatedSchema){
                if(j.substring(j.length-5,j.length) === '_refs'){}
                else if(updatedSchema[j].type === 'number' || updatedSchema[j].type === 'string'){
                    stringOrder++;
                    updatedSchema[j] = self.addEmptyValueForEnum(updatedSchema[j]);
                    updatedSchema[j].propertyOrder = stringOrder;
                }else if(updatedSchema[j].type === 'boolean'){
                    booleanOrder++;
                    updatedSchema[j].propertyOrder = booleanOrder;
                }else if(updatedSchema[j].type === 'array' || updatedSchema[j].type === 'object'){
                    proOrder++;
                    updatedSchema[j].propertyOrder = proOrder;
                }
            }
            return updatedSchema;
        }
        self.modifiedExistingSchema = function(schema, formJson){
            var json = getValueByJsonPath(formJson,Object.keys(formJson)[0]);
            var schema = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
            for (var i in json) {
                 for(var j in schema){
                      if(!schema.hasOwnProperty(i)){
                          if(typeof json[i] === 'number' || typeof json[i] === 'string'){
                              schema[i] = {type: typeof json[i]};
                          }else if(json[i] !== null){
                              if(json[i].constructor === Array){
                                  if(typeof json[i][0] !== 'object'){
                                      if(i=== 'fq_name'){
                                           schema[i] = {type: 'string'}
                                       }else{
                                           schema[i] = {type: 'array'}
                                       }
                                    }
                              }
                          }else if(typeof json[i] === 'boolean') {
                              schema[i] = {type: typeof json[i],format: 'checkbox'};
                          }
                        }
                   }
             }
            return schema;
        }
        self.addEmptyValueForEnum = function(schemaProp){
            if(schemaProp.enum !== undefined){
                if(typeof schemaProp.enum[0] == 'object'){
                    delete schemaProp.enum;
                }else{
                    if(schemaProp.enum[0] != ""){
                        schemaProp.enum.unshift("");
                    }
                }
            }
          return schemaProp;
        }
        self.generateConfigModal = function(title, viewConfig){
            cowu.createModal({
                'modalId': ctwc.MODAL_CONFIG_EDITOR_CONTAINER,
               'className': 'modal-980',
                 'title': title,
                'body': self.modelLayout,
                'onSave': function() {
                    if(self.formRadioFlag){
                        var editedJson = jsoneditor.getValue();
                        var oldKeys = self.oldFormData[Object.keys(self.oldFormData)[0]];
                        var updatedKeys = editedJson[Object.keys(editedJson)[0]];
                        var objDiff = lodash.diff(oldKeys, updatedKeys, false);
                        var updatedRefs = self.updateDiffRefsBeforSave(objDiff);
                        var updatedObj = {};
                        updatedObj[Object.keys(editedJson)[0]] = updatedRefs;
                        if(oldKeys.uuid !== undefined){
                            updatedObj[Object.keys(updatedObj)[0]].uuid = oldKeys.uuid;
                            self.objectDetailsView.saveObjectDetails(updatedObj, viewConfig, true, self);
                        }else{
                            self.objectListView.saveNewObject(updatedObj, self);
                        }
                    }else{
                        try{
                            var json = JSON.parse(document.getElementById('rawJsonTextArea').value);
                            var diff = lodash.diff(self.textAreaModel[Object.keys(self.textAreaModel)[0]], json[Object.keys(json)[0]], false);
                            var areaObj = {};
                            areaObj[Object.keys(self.textAreaModel)[0]] = diff;
                            if(self.textAreaModel[Object.keys(self.textAreaModel)[0]].uuid !== undefined){
                                areaObj[Object.keys(areaObj)[0]].uuid = self.textAreaModel[Object.keys(self.textAreaModel)[0]].uuid;
                                self.objectDetailsView.saveObjectDetails(areaObj, viewConfig, true, self);
                            }else{
                                self.objectListView.saveNewObject(areaObj, self);
                            }
                        }catch(err){
                            self.showConfigErrorMsg(err);
                        }
                    }
                },
                'onCancel': function() {
                    $("#json-editor-form-view").modal('hide');
                },
                'onReset': function() {
                    if(self.formRadioFlag){
                        self.hideErrorPopup();
                        if(Object.keys(self.formJson).length == 0){
                            self.loadSchemaBasedForm({}, self.schema, true);
                        }else{
                            self.loadSchemaBasedForm(self.formJson, self.schema, false);
                        }
                    }else{
                        self.resetTextArea();
                    }
                }
            });
        }
        self.updateModelForSchema = function(model){
            for (var i in model) {
                if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                       self.updateModelForSchema(model[i]);
                }else if( model[i] !== null && model[i].constructor === Array){
                    if(i.substring(i.length-5,i.length) === '_refs'){
                        model[i] = self.checkExistingRefs(model[i]);
                    }else if(typeof model[i][0] === 'object'){
                        for(var j = 0; j < model[i].length; j++){
                            self.updateModelForSchema(model[i][j]);
                        }
                    }else if(i === 'fq_name'){
                            var fqName = model[i].join(':');
                            model[i] = fqName;
                    }else if(i === 'to'){
                        var to = model[i].join(':');
                        model[i] = to;
                    }
                }
            }
          return model;
        }
        self.updateDiffRefsBeforSave = function(diffObj){
            for(var i in diffObj){
                if(i.substring(i.length-5,i.length) === '_refs'){
                    var arr = [];
                    for(var j=0; j < diffObj[i].length; j++){
                        var obj={};
                        var splitStr = diffObj[i][j].split(':');
                        obj.to = splitStr;
                        arr.push(obj);
                    }
                    diffObj[i] = arr;
                }
            }
            return diffObj;
        }
        self.resetTextArea = function(){
            document.getElementById('rawJsonTextArea').value = '';
            document.getElementById('rawJsonTextArea').value = JSON.stringify(self.textAreaModel,null,2);
            self.hideErrorPopup();
        }
        self.checkExistingRefs = function(model){
            var toList =[];
            for(var i = 0; i< model.length; i++){
                if(model[i].to !== undefined){
                    var to = model[i].to.join(':');
                    toList.push(to);
                }
            }
            if(toList.length == 0){
                return model;
            }else{
                return toList;
            }
        }
        self.loadSchemaBasedForm = function(formJson, schema, hideFlag){
            var startval = (self.jsoneditor && self.keep_value)? self.jsoneditor.getValue() : formJson;
            var rowJsonContainer = $('.object-json-view');
            var formContainer = document.getElementById('jsonEditorContainer');
            if(self.jsoneditor) self.jsoneditor.destroy();
            JSONEditor.defaults.options.theme = 'bootstrap2';
            self.jsoneditor = new JSONEditor(formContainer,{
                schema: schema,
                startval: startval,
                theme: 'bootstrap2',
                iconlib: 'fontawesome3',
                disable_edit_json: true,
                disable_properties: false,
                no_additional_properties :false,
                required_by_default : false,
                disable_array_delete:true,
                disable_array_delete_all_rows: true,
                disable_array_delete_last_row : true,
                disable_array_reorder:true,
                remove_empty_properties: false,
                unDeletableProperty : self.upperCaseUnEditableProp(self.disableKeys),
                fieldHide : hideFlag
             });
            window.jsoneditor = self.jsoneditor;
            rowJsonContainer.value = '';
        }
        self.upperCaseUnEditableProp = function(prop){
            var upperCaseProp = [];
            for(var i = 0; i < prop.length; i++){
                var updatedText = self.parseJsonKeyLowerToUpper(prop[i]);
                upperCaseProp.push(updatedText);
            }
            return upperCaseProp;
        }
        self.updateRefForTextArea = function(newModel, refs, formFlag){
            var formModel = newModel[Object.keys(newModel)[0]];
            var fileds, lastIndex, toFields;
            for(var j in formModel){
                if(j.substring(j.length-5,j.length) === '_refs'){
                    var refStack = [];
                    if(refs.indexOf(j) != -1){
                        var refVal = refs[refs.indexOf(j) + 1];
                        var preRefs = [];
                        for(var k =0; k < formModel[j].length; k++){
                            fileds = formModel[j][k].split(':');
                            lastIndex = fileds[fileds.length - 1];
                            for(var l = 0; l < refVal.length; l++){
                                toFields = refVal[l].to;
                                if(lastIndex === toFields[toFields.length - 1]){
                                    preRefs.push(toFields[toFields.length - 1]);
                                    refStack.push(refVal[l]);
                                }
                            }
                        }
                        for(var m = 0; m < formModel[j].length; m++){
                            fileds = formModel[j][m].split(':');
                            lastIndex = fileds[fileds.length - 1];
                            if(preRefs.indexOf(lastIndex) == -1){
                                var obj={};
                                obj.to = fileds;
                                refStack.push(obj);
                            }
                        }
                    }else if(formModel[j].length > 0){
                        for(var n = 0; n < formModel[j].length; n++){
                            var obj={};
                            obj.to = formModel[j][n].split(':');
                            refStack.push(obj);
                        }
                    }
                    formModel[j] = refStack;
                 }
             }
            if(formModel['fq_name'] !== undefined){
                if(formModel['fq_name'].constructor !== Array){
                    var fqName = formModel['fq_name'].split(':');
                    formModel['fq_name'] = fqName;
                }
            }
            newModel[Object.keys(newModel)[0]] = formModel;
         return newModel;
        }
        self.updateRefForForm = function(json){
            var data = json[Object.keys(json)[0]];
            var refStack = [];
            for(var i in data){
                if(i.substring(i.length-5,i.length) === '_refs'){
                   for(var j = 0; j < data[i].length; j++){
                       var toFields = data[i][j].to.join(':');
                       refStack.push(toFields);
                   }
                   data[i] = refStack;
                }
            }
            if(data['fq_name'] !== undefined){
                if(data['fq_name'].constructor === Array){
                    var fqName = data['fq_name'].join(':');
                    data['fq_name'] = fqName;
                }
            }
            json[Object.keys(json)[0]] = data;
            return json;
        }
        self.deleteConformModal = function(viewConfig){
            cowu.createModal({
                'modalId': 'config-object-details-modal',
                'className': 'modal-480',
                'title': 'Delete '+self.parseParentKeyLowerToUpper(viewConfig.hashParams.objName),
                'body': self.conformMsg,
                'btnName': 'Confirm',
                'onSave': function() {
                    self.objectDetailsView.deleteConfigObjectDetails(viewConfig);
                },
                'onCancel': function() {
                    $("#config-object-details-modal").modal('hide');
                }
            });
        }
    };
    return new ConfigObjectDetailUtils;
});
