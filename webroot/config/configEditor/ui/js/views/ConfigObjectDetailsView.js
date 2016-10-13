/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view','contrail-model',
    'config/configEditor/ui/js/utils/ConfigObjectDetail.utils',
    'config/configEditor/ui/js/utils/ConfigObjectList.utils',
    'jdorn-jsoneditor','knockback','jquery-linedtextarea'],
    function(_, ContrailView, ContrailModel, ConfigObjectDetailUtils, ConfigObjectListUtils, JsonEditor, Knockback, JqueryLinedTextArea, AJV) {
    var configList, jsoneditor, keep_value = undefined, schema, formRadioFlag = true;
    var configObjectDetailsView = ContrailView.extend({
        el: $(contentContainer),
        render: function() {
            self = this;
            schema = {};
            var viewConfig = this.attributes.viewConfig;
            var configListTmpl = contrail.getTemplate4Id(ctwc.CONFIG_EDITOR_TEMPLATE);
            self.$el.html(configListTmpl);
            ConfigObjectDetailUtils.hideHeaderIcons($(contentContainer));
            self.loadConfigObject(viewConfig);
            $(contentContainer).find('.config-edit-refresh').on('click', function(){self.refreshObjectDetails(viewConfig)});
            $(contentContainer).find('.copy-config-object').on('click', ConfigObjectDetailUtils.getCopiedContent);
            $(contentContainer).find('.config-jSon-form-edit').on('click',function(){
                formRadioFlag = true;
                var modelTitle = ConfigObjectDetailUtils.parseParentKeyLowerToUpper(Object.keys(configList)[0]);
                self.generateConfigModel(modelTitle, viewConfig);
                if(Object.keys(configList)[0].search('-') != -1 || Object.keys(configList)[0][0].toUpperCase() != Object.keys(configList)[0][0]){
                    configList = self.updateModelForSchema(configList,0);
                }
                self.loadSchemaBasedForm(configList,schema);
                $("input:radio[id=configJsonMode]").change(function() {
                   $("#rawJsonEdit").css("display", "block");
                   $("#jsonEditorContainer").css("display", "none");
                   ConfigObjectDetailUtils.hideErrorPopup();
                   formRadioFlag = false;
                   if($('#rawJsonTextArea').closest('.linedtextarea').length == 0) {
                       $('#rawJsonTextArea').linedtextarea();
                   }
                });
                $("input:radio[id=configFormMode]").change(function() {
                   $("#jsonEditorContainer").css("display", "block");
                   $("#rawJsonEdit").css("display", "none");
                   formRadioFlag = true;
                   ConfigObjectDetailUtils.hideErrorPopup();
                });
                document.getElementById('rawJsonTextArea').value = '';
                var model = ConfigObjectDetailUtils.updateKeyValueBeforeSave(configList);
                var updatedJson = ConfigObjectDetailUtils.changeJsonKeyUpperToLower(model, 0);
                document.getElementById('rawJsonTextArea').value = JSON.stringify(updatedJson,null,2);
            });
         },
         generateConfigModel: function(title, viewConfig){
             cowu.createModal({
                 'modalId': ctwc.MODAL_CONFIG_EDITOR_CONTAINER,
                 'className': 'modal-980',
                 'title': title,
                 'body': ConfigObjectDetailUtils.modelLayout,
                 'onSave': function() {
                     if(formRadioFlag){
                         var updatedJson, editedJson = jsoneditor.getValue();
                         if(Object.keys(editedJson)[0].search('-') == -1){
                             var model = ConfigObjectDetailUtils.updateKeyValueBeforeSave(editedJson);
                             updatedJson = ConfigObjectDetailUtils.changeJsonKeyUpperToLower(model, 0);
                         }else{
                             var updatedJson = editedJson;
                         }
                         self.saveObjectDetails(self, updatedJson, viewConfig, true);
                     }else{
                         try{
                             var json = JSON.parse(document.getElementById('rawJsonTextArea').value);
                             self.saveObjectDetails(self,json,viewConfig);
                         }catch(err){
                             ConfigObjectDetailUtils.showConfigErrorMsg(err);
                         }
                     }
                 },
                 'onCancel': function() {
                     $("#json-editor-form-view").modal('hide');
                 },
                 'onReset': function() {
                     if(formRadioFlag){
                         ConfigObjectDetailUtils.hideErrorPopup();
                         var parentKey = Object.keys(configList)[0];
                         if(parentKey.search('_') != -1 || parentKey.search('-') != -1 || parentKey[0].toUpperCase() != parentKey[0]){
                             configList = self.updateModelForSchema(configList,0);
                         }
                         self.loadSchemaBasedForm(configList,schema);
                     }else{
                         self.resetTextArea();
                     }
                 }
             });
         },
         loadConfigObject: function(viewConfig,rawJosnSave, formSave){
             var options = {type:viewConfig.hashParams.objName+'/'+viewConfig.hashParams.uuid};
             var ajaxConfig = {
                     url: ctwc.URL_GET_CONFIG_DETAILS,
                     type:'POST',
                     data:ConfigObjectListUtils.getPostDataForGet(options)
                 };
             contrail.ajaxHandler(ajaxConfig, null, function(json){
                 ConfigObjectDetailUtils.hideErrorPopup();
                 ConfigObjectDetailUtils.hideHeaderIcons($(contentContainer));
                 configList = json[0];
                 var parentKey = ConfigObjectDetailUtils.parseParentKeyLowerToUpper(Object.keys(configList)[0]);
                 $(contentContainer).find('#object-header-title').text(parentKey);
                 if(rawJosnSave == undefined && formSave == undefined){
                     self.loadBreadcrumb(viewConfig);
                 }
                 var getHtmlFormatJson = ConfigObjectListUtils.formatJSON2HTML(configList, 10, undefined, true);
                 $(contentContainer).find('.object-json-view').empty();
                 $(contentContainer).find('.object-json-view').append(getHtmlFormatJson);
                 if(rawJosnSave){
                     ConfigObjectDetailUtils.hideTextAreaAfterSave($(contentContainer));
                 }
                 if(Object.keys(schema).length === 0){
                     self.getJsonSchema(configList)
                 }
                 if(formSave){
                     ConfigObjectDetailUtils.cancelSchemaBasedForm($(contentContainer));
                     schema = {};
                     self.getJsonSchema(configList)
                 }
                 ConfigObjectDetailUtils.setContentInTextArea(configList);
             },function(error){
                 ConfigObjectDetailUtils.showConfigErrorMsg(error.responseText);
             });
          },
          refreshObjectDetails: function(viewConfig){
              $('.config-edit-refresh').children().removeClass('fa fa-repeat').addClass('fa fa-spin fa fa-spinner');
              var options = {type:viewConfig.hashParams.objName+'/'+viewConfig.hashParams.uuid};
              var ajaxConfig = {
                      url: ctwc.URL_GET_CONFIG_DETAILS,
                      type:'POST',
                      data:ConfigObjectListUtils.getPostDataForGet(options)
                  };
              contrail.ajaxHandler(ajaxConfig, null, function(json){
                  configList = json[0];
                  var getHtmlFormatJson = ConfigObjectListUtils.formatJSON2HTML(configList, 10, undefined, true);
                  $(contentContainer).find('.object-json-view').empty();
                  $(contentContainer).find('.object-json-view').append(getHtmlFormatJson);
                  ConfigObjectDetailUtils.setContentInTextArea(configList);
                  $('.config-edit-refresh').children().removeClass('fa fa-spin fa fa-spinner').addClass('fa fa-repeat');
              },function(error){
                  ConfigObjectDetailUtils.showConfigErrorMsg(error.responseText);
              });
          },
          loadBreadcrumb: function(viewConfig){
              var parentLabel;
              if(viewConfig.hashParams.objName[viewConfig.hashParams.objName.length-1] !='s'){
                  parentLabel = viewConfig.hashParams.objName+'s';  
              }else{
                  parentLabel = viewConfig.hashParams.objName; 
              }
              var parentHref = ctwc.CONFIG_HASH_PATH + parentLabel;
              if(configList !== undefined){
                  pushBreadcrumb([{label:parentLabel,href:parentHref},
                                  {label:getValueByJsonPath(configList,Object.keys(configList)[0]+';fq_name').join(' : ')}]); 
              }
          },
          resetTextArea: function(){
              document.getElementById('rawJsonTextArea').value = '';
              document.getElementById('rawJsonTextArea').value = JSON.stringify(configList,null,2);
              ConfigObjectDetailUtils.hideErrorPopup();
          },
          saveObjectDetails: function(self, data, viewConfig, formSaved){
              var reqUrlHash;
              if (viewConfig.hashParams.objName[viewConfig.hashParams.objName.length - 1] == 's') {
                  reqUrlHash = viewConfig.hashParams.objName.slice(0, -1);
              } else {
                  reqUrlHash = viewConfig.hashParams.objName;
              }
              self.model.addEditConfigData (data, 
                      '/'+reqUrlHash+'/'+data[Object.keys(data)[0]]['uuid'] , 
                      true, 
                      {
                          init: function () {
                          },
                          success: function () {
                              $("#json-editor-form-view").modal('hide');
                              if(formSaved){
                                  self.loadConfigObject(viewConfig, false, formSaved);
                              }else{
                                  self.loadConfigObject(viewConfig, true, false);
                              }
                          },
                          error: function (error) {
                              ConfigObjectDetailUtils.showConfigErrorMsg(error.responseText);
                          }
                      }
              );
           },
           getParentKeyOfSchema: function(schema){
               var jsonKey = getValueByJsonPath(configList,Object.keys(configList)[0]);
               var schemaKey = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
               var topOrder = 0;
               var bottomOrder = 1000;
               for (var i in jsonKey){
                 bottomOrder++;
                 if(typeof jsonKey[i] === 'number' || typeof jsonKey[i] === 'string'){
                     topOrder++;
                     var obj = { propertyOrder: topOrder, type: typeof jsonKey[i], collapse:true };
                     var key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                     schemaKey[key] = obj;
                 }else if(typeof jsonKey[i] === 'boolean'){
                     topOrder++;
                     var obj = { propertyOrder: topOrder, type: typeof jsonKey[i] ,format: 'checkbox', collapse:true };
                     var key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                     schemaKey[key] = obj;
                 }else if(jsonKey[i] == null || (typeof jsonKey[i] === 'object' && jsonKey[i].constructor !== Array)){
                     var obj = ConfigObjectDetailUtils.getChildKeyOfSchema(jsonKey[i], bottomOrder);
                     var key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                     schemaKey[key] = obj;
                 }else if(jsonKey[i].constructor === Array){
                     if(typeof jsonKey[i][0] !== 'object'){
                         if(i === 'fq_name' || i === 'to'){
                             topOrder++;
                             var key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                             schemaKey[key] = { propertyOrder: topOrder, type: 'string', collapse:true};
                         }else{
                             var key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                             schemaKey[key] = { propertyOrder: bottomOrder, type: 'array' , collapse:true};
                         }
                       }else{
                           var obj = {
                                   propertyOrder: bottomOrder,
                                   type: 'array',
                                   collapse:true,
                                   items: ConfigObjectDetailUtils.getChildKeyOfSchema(jsonKey[i][0])
                           };
                           var key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                           schemaKey[key] = obj;
                       }
                  }
               }
              return schemaKey;
           },
           updateModelForSchema: function(model,count){
               var key,preKeyValue;
               for (var i in model) {
                   if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                          var oldModel = model[i];
                          if(count == 0){
                             key = ConfigObjectDetailUtils.parseParentKeyLowerToUpper(i);
                           }else{
                             key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                           }
                          count++;
                          model[key] = oldModel;
                          delete model[i];
                          self.updateModelForSchema(oldModel, count);
                   }else if( model[i] !== null && model[i].constructor === Array){
                       if(typeof model[i][0] === 'object'){
                           preKeyValue = model[i];
                           key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                           model[key] = preKeyValue;
                           delete model[i];
                           for(var j = 0; j < preKeyValue.length; j++){
                               self.updateModelForSchema(preKeyValue[j]);
                           }
                       }else if(model[i].length == 0){
                           preKeyValue = model[i];
                           key= ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                           model[key] = preKeyValue;
                           delete model[i];
                       }else if(i === 'fq_name'){
                               var fqName = model[i].join(':');
                               key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                               delete model[i];
                               model[key] = fqName;
                       }else if(i === 'to'){
                           var to = model[i].join(':');
                           key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                           delete model[i];
                           model[key] = to;
                       }
                   }else{
                       key = ConfigObjectDetailUtils.parseJsonKeyLowerToUpper(i);
                       model[key] = model[i];
                       delete model[i];
                   }
               }
             return model;
           },
           getJsonSchema: function(configList){
               schema.type = 'object';
               schema.properties = {};
               var parentKey = ConfigObjectDetailUtils.parseParentKeyLowerToUpper(Object.keys(configList)[0]);
               schema.properties[parentKey] = {};
               schema.properties[parentKey]['type'] = 'object';
               schema.properties[parentKey]['collapse'] = true;
               schema.properties[parentKey]['properties'] = {};
               var childProperty = self.getParentKeyOfSchema(schema);
               schema.properties[parentKey].properties = childProperty;
           },
           loadSchemaBasedForm: function(configList,schema){
               var startval = (jsoneditor && keep_value)? jsoneditor.getValue() : configList;
               var rowJsonContainer = $('.object-json-view');
               var formContainer = document.getElementById('jsonEditorContainer');
               if(jsoneditor) jsoneditor.destroy();
               JSONEditor.defaults.options.theme = 'bootstrap2';
               jsoneditor = new JSONEditor(formContainer,{
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
                   unDeletableProperty : ConfigObjectDetailUtils.unDeletableProp
                });
               window.jsoneditor = jsoneditor;
               rowJsonContainer.value = '';
           }
     });
    return configObjectDetailsView;
});