define([
    'lodash','config/configEditor/ui/js/views/ConfigObjectDetailsView',
    'config/configEditor/ui/js/views/ConfigObjectListView'
], function (lodash, ConfigObjectDetailsView, ConfigObjectListView) {
    var ConfigObjectDetailUtils = function () {
        var self = this;
        self.objectDetailsView = new ConfigObjectDetailsView;
        self.objectListView = new ConfigObjectListView;
        self.previousObj = [];
        self.deletedKeyStack = [];
        self.formRadioFlag = true;
        self.oldFormData = undefined;
        self.textAreaModel = undefined;
        self.oldAreaModel = undefined;
        self.schema = {};
        self.disableKeys = undefined;
        self.formJson = undefined;
        self.jsoneditor = undefined;
        self.keep_value = undefined;
        self.resetTextAreaModel = undefined;
        self.isDirty = false;
        self.modelLayout = '<div id="config-error-container" class="alert-error clearfix">'+
                           '<div id="config-msg-container"><span class="error-font-weight">Error : </span><span id="config-error-msg-container"></span></div>'+
                           '<div id="error-remove-icon"><button id="remove-error-popup" class="btn btn-mini"><i class="fa fa-remove"></i></button></div></div>'+
                           '<div id="editorContainer"><div class="json-editor-form-view-header">'+
                           '<div><input type="radio" name="switchFormJson" id="configFormMode" checked="true"></input><label>Form</label><input type="radio" name="switchFormJson" id="configJsonMode"></input><label>JSON</label></div></div>'+
                           '<div id="jsonEditorContainer"></div><div id="rawJsonEdit" style="display:none;"><textarea id="rawJsonTextArea" spellcheck="false"></textarea></div>'+
                           '</div>';
        self.conformMsg = '<div>Are you sure you want to delete  <b></b>?</div>';
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
        self.loadConfigEditorModal = function(schema, json, viewConfig, disableKeys, refs, oldJson, enumKeys){
            self.formRadioFlag = true;
            self.formJson = json;
            self.deletedKeyStack = [];
            self.disableKeys = disableKeys;
            var schemaProp = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
            var updatedProp = self.setEmptyForChildEnum(schemaProp, schemaProp);
            schema.properties[Object.keys(schema.properties)[0]].properties = updatedProp;
            if(Object.keys(self.formJson).length == 0){
                self.schema = schema;
                var modelTitle = self.parseParentKeyLowerToUpper(Object.keys(schema.properties)[0]);
                self.generateConfigModal(modelTitle, viewConfig, oldJson, enumKeys, refs);
                self.loadSchemaBasedForm(self.formJson, self.schema, true);
                self.oldFormData = $.extend(true, {}, jsoneditor.getValue()[0]);
                var rawJson = $.extend(true, {}, jsoneditor.getValue()[0]);
                document.getElementById('rawJsonTextArea').value = '';
                self.resetTextAreaModel = rawJson;
                self.oldAreaModel = rawJson;
                document.getElementById('rawJsonTextArea').value = JSON.stringify(rawJson,null,2);
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
                self.generateConfigModal(modelTitle, viewConfig, oldJson, enumKeys, refs);
                self.formJson = self.updateModelForSchema(self.formJson,false);
                self.loadSchemaBasedForm(self.formJson, self.schema, false);
                self.oldFormData = $.extend(true, self.formJson, jsoneditor.getValue()[0]);
                var oldCopy = self.updateModelForSchema(jsoneditor.getValue()[0],true);
                self.resetTextAreaModel = $.extend(true,{},oldCopy);
                var newFormData = $.extend(true,{},self.formJson);
                document.getElementById('rawJsonTextArea').value = '';
                var rawJson = self.updateRefForTextArea(newFormData, refs);
                self.oldAreaModel = rawJson;
                document.getElementById('rawJsonTextArea').value = JSON.stringify(rawJson ,null,2);
            }
            $("input:radio[id=configJsonMode]").change(function() {
                var textAreaHeight = $('.modal-body').height() - 57 +'px';
                if(jsoneditor.getValue()[1].length > 0){
                    for(var i = 0; i < jsoneditor.getValue()[1].length; i++){
                        if(self.deletedKeyStack.indexOf(jsoneditor.getValue()[1][i]) == -1){
                            self.deletedKeyStack.push(jsoneditor.getValue()[1][i]);
                        }
                    }
                }
                var updatedData = self.removeDeletedItem(jsoneditor.getValue()[0], self.deletedKeyStack);
                var resetToFiled = self.resetToField(updatedData[Object.keys(updatedData)[0]]);
                updatedData[Object.keys(updatedData)[0]] = resetToFiled;
                var updatedModel = self.updateRefForTextArea(updatedData, refs);
                var prop = self.schema.properties[Object.keys(self.schema.properties)[0]].properties;
                if(Object.keys(self.formJson).length == 0){
                    var model = updatedModel[Object.keys(updatedModel)[0]];
                    if(model['parent_type'] === undefined){
                        model['parent_type'] = prop['parent_type'].enum[0];
                        if(model['parent_type'] !== undefined){
                            var child = model['parent_type'].split('-').join('_');
                            model[child] = prop[child].enum[0];
                            var parentStack = prop['parent_type'].enum;
                            for(var i = 0; i < parentStack.length; i++){
                                if(parentStack[i] != "" && parentStack[i] != model['parent_type']){
                                    var key = parentStack[i].split('-').join('_');
                                    delete model[key];
                                }
                            }
                        }
                   }else {
                        var child = model['parent_type'].split('-').join('_');
                        if(model[child] === undefined){
                            model[child] = prop[child].enum[0];
                            var parentStack = prop['parent_type'].enum;
                            for(var i = 0; i < parentStack.length; i++){
                                if(parentStack[i] != "" && parentStack[i] != model['parent_type']){
                                    var key = parentStack[i].split('-').join('_');
                                    delete model[key];
                                }
                            }
                        }else{
                            var parentStack = prop['parent_type'].enum;
                            for(var i = 0; i < parentStack.length; i++){
                                if(parentStack[i] != "" && parentStack[i] != model['parent_type']){
                                    var key = parentStack[i].split('-').join('_');
                                    delete model[key];
                                }
                            }
                        }
                    }
                    updatedModel[Object.keys(updatedModel)[0]] = model;
                }
                self.textAreaModel = updatedModel;
                document.getElementById('rawJsonTextArea').value = '';
                document.getElementById('rawJsonTextArea').value = JSON.stringify(self.textAreaModel, null, 2);
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
              try{
                  var json = JSON.parse(document.getElementById('rawJsonTextArea').value);
                  var fieldHide = false;
                  var model = self.updateRefForForm(json);
                  var prop = self.schema.properties[Object.keys(self.schema.properties)[0]].properties;
                  if(Object.keys(self.formJson).length == 0){
                      if(model[Object.keys(model)[0]]['parent_type'] == ""){
                          model[Object.keys(model)[0]]['parent_type'] = prop['parent_type'].enum[0];
                          var child = model[Object.keys(model)[0]]['parent_type'].split('-').join('_');
                          model[Object.keys(model)[0]][child] = prop[child].enum[0];
                      }else if(model[Object.keys(model)[0]]['parent_type'] !== undefined){
                          var child = model[Object.keys(model)[0]]['parent_type'].split('-').join('_');
                          if(model[Object.keys(model)[0]][child] == ""){
                              model[Object.keys(model)[0]][child] = prop[child].enum[0];
                          }
                      }
                      self.loadSchemaBasedForm(model, self.schema, true);
                  }else{
                      self.loadSchemaBasedForm(model, self.schema, false);
                  }
                  $("#jsonEditorContainer").css("display", "block");
                  $("#rawJsonEdit").css("display", "none");
                  self.formRadioFlag = true;
                  self.hideErrorPopup();
              }catch(err){
                  document.getElementById('configJsonMode').checked = true;
                  self.showConfigErrorMsg(err);
              }
             });
        }
        self.dirtyCheckForObj = function(model){
            var self = this;
            for(var i in model){
                if(typeof model[i] === 'number' || typeof model[i] === 'string' || typeof model[i] === 'boolean'){
                        if(model[i] !== '' && model[i] !== 0 && model[i] !== false){
                            self.isDirty = true;
                        }
                    }else if(typeof model[i] === 'object'){
                        if(model[i].constructor !== Array){
                            self.dirtyCheckForObj(model[i]);
                        }else{
                            if(typeof cowu.checkArrayContainsObject(model[i]) === 'object'){
                                for(var j = 0; j < model[i].length; j++){
                                    self.dirtyCheckForObj(model[i][j]);
                                }
                            }else if(typeof cowu.checkArrayContainsString(model[i]) === 'string'){
                                for(var k = 0; k < model[i].length; k++){
                                    if(model[i][k] !== '' || model[i][k] !== 0){
                                        self.isDirty = true;
                                    }
                                }
                            }
                        }
                    }
            }
            return model;
        }
        self.removeSelectedKeys = function(model, deletedItem, adjecentParentKey, parentKey, keyHierarchy, directChild){
            var self = this;
            for (var i in model) {
                 if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                        currentObj = i;
                        if(i == deletedItem){
                            if(directChild){
                                self.dirtyCheckForObj(model[i]);
                                if(!self.isDirty){
                                   model[i] = null;
                                }
                                self.isDirty = false;
                                directChild = false;
                            }else{
                                delete model[i];
                            }
                        }else{
                            self.removeSelectedKeys(model[i], deletedItem, adjecentParentKey, parentKey, keyHierarchy, directChild);
                        }
                 }else if(model[i] !== undefined && model[i] !== null){
                        if(model[i].constructor === Array){
                           if(model[i].length == 0 && i == deletedItem){
                               if(directChild){
                                   model[i] = [];
                                   directChild = false;
                               }else{
                                   delete model[i];
                               }
                           }else if(typeof cowu.checkArrayContainsObject(model[i]) === 'object' && i == parentKey){
                                if(keyHierarchy.length == 0){
                                    delete model[i][deletedItem];
                                }else{
                                    for(var k = 0; k < model[i].length; k++){
                                       for(var c = 0; c < keyHierarchy.length; c++){
                                            if(isNumber(keyHierarchy[c])){
                                               var  key = parseInt(keyHierarchy[c]);
                                               break;
                                            }
                                        }
                                        if(key == k){
                                            self.removeSelectedKeys(model[i][k], deletedItem, adjecentParentKey, parentKey, keyHierarchy, directChild);
                                        }
                                    }
                                }
                             }else if(keyHierarchy.length == 0 && i == deletedItem && directChild){
                                 self.dirtyCheckForObj(model[i]);
                                 if(!self.isDirty){
                                     model[i] = [];
                                 }
                                 self.isDirty = false;
                                 directChild = false;
                             }else if(typeof cowu.checkArrayContainsObject(model[i]) !== 'object'){
                                if(isNumber(deletedItem) && i === adjecentParentKey){
                                     delete  model[i][deletedItem];
                                }
                            }else if(typeof cowu.checkArrayContainsObject(model[i]) === 'object' && isNumber(deletedItem) && i === adjecentParentKey){
                                delete  model[i][deletedItem];
                            }else if((typeof cowu.checkArrayContainsObject(model[i]) === 'object' && (isNumber(deletedItem) || !isNumber(deletedItem))) && (keyHierarchy.indexOf(adjecentParentKey) != -1)){
                                for(var m = 0; m < model[i].length; m++){
                                    if(keyHierarchy.indexOf(i) != -1){
                                        var index = keyHierarchy.indexOf(i) + 1;
                                        var indexData = keyHierarchy[index];
                                        if(m == parseInt(indexData)){
                                            self.removeSelectedKeys(model[i][m], deletedItem, adjecentParentKey, parentKey, keyHierarchy, directChild);
                                        }
                                    }
                                }
                            }
                        }else if(currentObj === adjecentParentKey || isNumber(adjecentParentKey)){
                            if(i === deletedItem){
                                if(model[i] === '' || model[i] === false){
                                    delete model[i];
                                }
                            }
                        }else if(i == deletedItem && directChild){
                            if(model[i] === '' || model[i] === false){
                                model[i] = null;
                            }
                            directChild = false;
                        }
                   }
             }
            return model;
        }
        self.removeUndefinedFromModel = function(model){
            var self = this;
            for (var i in model) {
                 if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                        self.removeUndefinedFromModel(model[i]);
                 }else if(model[i] !== undefined && model[i] !== null){
                        if(model[i].constructor === Array){
                            model[i] = model[i].filter(function(n){ return n != undefined });
                            if(model[i].length > 0){
                                if(typeof cowu.checkArrayContainsObject(model[i]) == 'object'){
                                    for(var j = 0; j < model[i].length; j++){
                                        self.removeUndefinedFromModel(model[i][j]);
                                    }
                                }
                            }
                        }
                  }
             }
            return model;
        }
        self.removeDeletedItem = function(model, deletedKeyPath){
            var directChild = false;
            for(var i = 0; i < deletedKeyPath.length; i++){
                var keys = deletedKeyPath[i].split(';');
                if(keys.length == 2){
                    directChild = true;
                }
                var lastKeys = keys[keys.length - 1];
                var deletedItem = keys.splice(keys.length - 1, 1);
                    var adjecentParentKey = keys[keys.length - 1];
                    var parentKey = keys[1];
                    keys.shift();
                    keys.shift();
                    model = self.removeSelectedKeys(model, deletedItem[0], adjecentParentKey, parentKey, keys, directChild);
           }
           self.changeIndexOfDeletedKey(model);
           var newModel = self.removeUndefinedFromModel(model);
          return newModel;
        }
        self.changeIndexOfDeletedKey = function(updatedModel){
            var deletedKeys = [];
            for(var i = 0;i < self.deletedKeyStack.length; i++){
                var keys = self.deletedKeyStack[i].split(';');
                var lastKeys = keys.pop();
                var path = keys.join(';');
                if(isNumber(lastKeys[0])){
                    if(getValueByJsonPath(updatedModel, path).length != 0){
                        deletedKeys.push(self.deletedKeyStack[i]);
                        delete self.deletedKeyStack[i];
                    }
                }
            }
            self.deletedKeyStack = self.deletedKeyStack.filter(function(n){ return n != undefined });
            deletedKeys.sort();
            for(var j = 0; j < deletedKeys.length; j++){
                var keys = [];
                var deletedKey  = deletedKeys[j].split(';');
                var lastItem = deletedKey.pop();
                var str = deletedKey.join(';');
                for(var k = 0; k < self.deletedKeyStack.length; k++){
                    if(self.deletedKeyStack[k].search(str) != -1){
                        var subStr = self.deletedKeyStack[k].substring(str.length+1);
                        var intKey = subStr.split(';')[0];
                        if(parseInt(lastItem) < parseInt(intKey)){
                            var keyIndex = parseInt(lastItem) + (parseInt(intKey) - parseInt(lastItem)) - 1;
                            var strArr = subStr.split(';');
                           strArr[0] = keyIndex;
                           var newStr = str +';'+ strArr.join(';');
                           self.deletedKeyStack[k] = newStr;
                        }
                    }
                }
            }
          return deletedKeys;
        }
        self.resetToField = function(model){
            var schemaProp = getValueByJsonPath(self.schema,'properties;'+Object.keys(self.schema.properties)[0]+';properties');
            for(var i in model){
                if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format == undefined){
                    for(var m = 0; m < model[i].length; m++){
                        if(model[i][m].to != undefined && typeof model[i][m].to != 'string'){
                            model[i][m].to = model[i][m].to.join(':');
                        }
                    }
                }
            }
            return model;
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
            var proOrder = 220, stringOrder = 5, booleanOrder = 150, arrayOrder = 200;
            for(var j in updatedSchema){
                if(j.substring(j.length-5,j.length) === '_refs' && updatedSchema[j].format == 'select'){}
                else if(updatedSchema[j].type === 'number' || updatedSchema[j].type === 'string'){
                    stringOrder++;
                    updatedSchema[j] = self.addEmptyValueForEnum(updatedSchema[j]);
                    updatedSchema[j].propertyOrder = stringOrder;
                }else if(updatedSchema[j].type === 'boolean'){
                    booleanOrder++;
                    updatedSchema[j].propertyOrder = booleanOrder;
                }else if(updatedSchema[j].type === 'object'){
                    proOrder++;
                    updatedSchema[j].propertyOrder = proOrder;
                }else if(updatedSchema[j].type === 'array'){
                    arrayOrder++;
                    updatedSchema[j].propertyOrder = arrayOrder;
                }
            }
            return updatedSchema;
        }
        self.setEmptyForChildEnum = function(properties, oldProperties){
            var self = this;
            for(var i in properties){
                if(properties[i].type == 'object'){
                    if(properties[i].properties !== undefined){
                        self.setEmptyForChildEnum(properties[i].properties, oldProperties);
                    }
                }else if(properties[i].type == 'array'){
                    if(properties[i].items !== undefined && properties[i].format === undefined){
                        if(properties[i].items.properties !== undefined){
                            self.setEmptyForChildEnum(properties[i].items.properties, oldProperties);
                        }else if(properties[i].items.type === 'string' && properties[i].items.enum !== undefined){
                              if(properties[i].items.enum[0] != ''){
                                  properties[i].items.enum.unshift('');
                              }
                        }
                    }
                }else if(properties[i].type == 'string' && properties[i].enum !== undefined){
                    if(!oldProperties.hasOwnProperty(i)){
                        if(properties[i].enum[0] != ''){
                            properties[i].enum.unshift('');
                        }
                    }
                }
            }
            return properties;
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
        self.generateConfigModal = function(title, viewConfig, oldJson, enumKeys, refs){
            cowu.createModal({
                'modalId': ctwc.MODAL_CONFIG_EDITOR_CONTAINER,
               'className': 'modal-980',
                 'title': title,
                'body': self.modelLayout,
                'onSave': function() {
                    self.deletedKeyStack = [];
                    if(self.formRadioFlag){
                        var editedJson = jsoneditor.getValue()[0];
                        var oldKeys = self.oldFormData[Object.keys(self.oldFormData)[0]];
                        var updatedKeys = editedJson[Object.keys(editedJson)[0]];
                        if(updatedKeys.fq_name != undefined){
                            if(typeof updatedKeys.fq_name != 'string'){
                                var fqName = updatedKeys.fq_name.join(':');
                                updatedKeys.fq_name = fqName;
                            }
                        }
                        var objDiff = lodash.diff(oldKeys, updatedKeys, false, oldJson, enumKeys);
                        var schemaProp = self.schema.properties[Object.keys(editedJson)[0]].properties;
                        var updatedRefs = self.updateModelRefsForForm(objDiff, schemaProp, refs);
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
                            var diff = lodash.diff(self.oldAreaModel[Object.keys(self.oldAreaModel)[0]], json[Object.keys(json)[0]], false, oldJson, enumKeys);
                            var schemaProp = self.schema.properties[Object.keys(json)[0]].properties;
                            diff = self.updatedRefsForTextArea(diff, schemaProp);
                            var areaObj = {};
                            areaObj[Object.keys(self.oldAreaModel)[0]] = diff;
                            if(self.oldAreaModel[Object.keys(self.oldAreaModel)[0]].uuid !== undefined){
                                areaObj[Object.keys(areaObj)[0]].uuid = self.oldAreaModel[Object.keys(self.oldAreaModel)[0]].uuid;
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
                    self.deletedKeyStack = [];
                    $("#json-editor-form-view").modal('hide');
                },
                'onReset': function() {
                    self.deletedKeyStack = [];
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
        self.updateModelForSchema = function(model,isString){
            var schemaProp = self.schema.properties[Object.keys(self.schema.properties)[0]].properties;
            for (var i in model) {
                if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                       self.updateModelForSchema(model[i], isString);
                }else if( model[i] !== null && model[i] !== undefined){
                    if(model[i].constructor === Array){
                        if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format !== undefined){
                            model[i] = self.checkExistingRefs(model[i]);
                        }else if(typeof model[i][0] === 'object'){
                            for(var j = 0; j < model[i].length; j++){
                                self.updateModelForSchema(model[i][j], isString);
                            }
                        }else if(i === 'fq_name' || i === 'to'){
                            var item = model[i].join(':');
                            model[i] = item;
                        }
                    }else if((i === 'fq_name' || i === 'to') && typeof model[i] == 'string'){
                        if(isString){
                            var item = model[i].split(':');
                            model[i] = item;
                        }
                    }
                }
            }
          return model;
        }
        self.updateModelRefsForForm = function(diffObj, schemaProp, refs){
            var oldRefs = [];
            for(var i in diffObj){
                if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format !== undefined){
                    var arr = [], refCount = -1;
                    if(refs.indexOf(i) != -1){
                        var oldVal = refs[refs.indexOf(i)+1];
                    }
                    if(oldVal !== undefined){
                        for(var l = 0; l < oldVal.length; l++){
                            var toData = oldVal[l].to.join(':');
                            oldRefs.push(toData);
                            oldRefs.push(oldVal[l]);
                        }
                    }
                    for(var j=0; j < diffObj[i].length; j++){
                        if(i == 'network_policy_refs'){
                            var obj={},attrObj = {},sequenceObj = {};
                            if(oldRefs.indexOf(diffObj[i][j]) != -1){
                                refCount++;
                                var refObj = oldRefs[oldRefs.indexOf(diffObj[i][j])+1];
                                refObj.attr.sequence.major = refCount;
                                arr.push(oldRefs[oldRefs.indexOf(diffObj[i][j])+1]);
                            }else{
                                refCount++;
                                var splitStr = diffObj[i][j].split(':');
                                obj.to = splitStr;
                                attrObj.timer = null;
                                sequenceObj.major = refCount;
                                sequenceObj.minor = 0;
                                attrObj.sequence = sequenceObj;
                                obj.attr = attrObj;
                                arr.push(obj);
                            }
                         }else{
                            var obj={};
                            var splitStr = diffObj[i][j].split(':');
                            obj.to = splitStr;
                            arr.push(obj);
                        }
                    }
                    diffObj[i] = arr;
                }else if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format == undefined){
                    for(var m = 0; m < diffObj[i].length; m++){
                        if(typeof diffObj[i][m].to == 'string'){
                            diffObj[i][m].to = diffObj[i][m].to.split(':');
                        }
                    }
                }
            }
            return diffObj;
        }
        self.updatedRefsForTextArea = function(diffObj, schemaProp){
            var refCount = -1;
            for(var i in diffObj){
                if(i == 'network_policy_refs'){
                    for(var j = 0; j < diffObj[i].length; j++){
                        if(diffObj[i][j].attr == undefined){
                            var attrObj = {},sequenceObj = {};
                            refCount++;
                            attrObj.timer = null;
                            sequenceObj.major = refCount;
                            sequenceObj.minor = 0;
                            attrObj.sequence = sequenceObj;
                            diffObj[i][j].attr = attrObj;
                        }else{
                            refCount++;
                            diffObj[i][j].attr.sequence.major  = refCount;
                        }
                    }
                }else if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format == undefined){
                    for(var m = 0; m < diffObj[i].length; m++){
                        diffObj[i][m].to = diffObj[i][m].to.split(':');
                    }
                }
            }
            return diffObj;
        }
        self.resetTextArea = function(){
            document.getElementById('rawJsonTextArea').value = '';
            document.getElementById('rawJsonTextArea').value = JSON.stringify(self.resetTextAreaModel , null, 2);
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
            var startval;
            if(self.jsoneditor !== undefined){
                startval = (self.jsoneditor && self.keep_value)? self.jsoneditor.getValue()[0] : formJson;
            }else{
                startval = (self.jsoneditor && self.keep_value)? self.jsoneditor.getValue() : formJson;
            }
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
        self.updateRefForTextArea = function(newModel, refs){
            var formModel = newModel[Object.keys(newModel)[0]];
            var fileds, lastIndex, toFields;
            for(var j in formModel){
                if(j.substring(j.length-5,j.length) === '_refs'){
                    var refStack = [];
                    if(refs.indexOf(j) != -1 && refs[refs.indexOf(j) + 1] !== undefined){
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
                    }else if(formModel[j].length > 0 && refs.indexOf(j) == -1){
                        for(var n = 0; n < formModel[j].length; n++){
                            var obj={};
                            if(typeof formModel[j][n] =='string'){
                                obj.to = formModel[j][n].split(':');
                                refStack.push(obj);
                            }else{
                                refStack.push(formModel[j][n]);
                            }
                        }
                    }
                    if(refs[refs.indexOf(j) + 1] === undefined && refs[refs.indexOf(j)] == j){
                        formModel[j] = formModel[j];
                    }else{
                        formModel[j] = refStack;
                    }
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
            var schemaProp = self.schema.properties[Object.keys(self.schema.properties)[0]].properties;
            var refStack = [];
            for(var i in data){
                if(i.substring(i.length-5,i.length) === '_refs'){
                  if(schemaProp[i].format !== undefined){
                      for(var j = 0; j < data[i].length; j++){
                          var toFields = data[i][j].to.join(':');
                          refStack.push(toFields);
                      }
                      data[i] = refStack;
                  }
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