/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view','contrail-model',
    'config/configEditor/ui/js/utils/ConfigObjectDetail.utils',
    'config/configEditor/ui/js/utils/ConfigObjectList.utils',
    'jdorn-jsoneditor'],
    function(_, ContrailView, ContrailModel, ConfigObjectDetailUtils, ConfigObjectListUtils, JsonEditor) {
    var configList, jsoneditor, keep_value = undefined, schema, scrollTop = false;
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
            $(contentContainer).find('.config-object-edit').on('click',self.editObject);
            $(contentContainer).find('#jsonTextArea').removeClass('config-scroll-color');
            $(contentContainer).find('.cancel-config-edit').on('click',function(){self.cancelEditor(viewConfig)});
            $(contentContainer).find('.reset-object').on('click',self.resetTextArea);
            $(contentContainer).find('.copy-config-object').on('click', ConfigObjectDetailUtils.getCopiedContent);
            $(contentContainer).find('.cancel-config-form').on('click',function(){self.cancelSchemaForm(viewConfig)});
            $(contentContainer).find('.save-config-object').on('click', function() {
                try{
                    var json = JSON.parse(document.getElementById('jsonTextArea').value);
                    self.saveObjectDetails(self,json,viewConfig);
                }catch(err){
                    contrail.showErrorMsg(err);
                }
             });
            $(contentContainer).find('.save-form-object').on('click',function() {
                var updatedJson = ConfigObjectDetailUtils.modelBeforeSaved(jsoneditor.getValue());
                self.saveObjectDetails(self, updatedJson, viewConfig, true);
            });
            $(contentContainer).find('.reset-config-form').on('click',function(){
                contrail.hideErrorPopup();
                self.loadSchemaBasedForm(configList,schema);
            });
            $(contentContainer).find('.config-jSon-form-edit').on('click',function(){
                self.showSchemaBasedForm();
                configList = self.updateModelForSchema(configList);
                self.loadSchemaBasedForm(configList,schema);
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
                 contrail.hideErrorPopup();
                 ConfigObjectDetailUtils.hideHeaderIcons($(contentContainer));
                 configList = json[0];
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
                 contrail.showErrorMsg(error.responseText);
             });
          },
          refreshObjectDetails: function(viewConfig){
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
              },function(error){
                  contrail.showErrorMsg(error.responseText);
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
          editObject: function(){
              ConfigObjectDetailUtils.setTextAreaHeight(configList);
              ConfigObjectDetailUtils.hideIconsForObjectEdit($(contentContainer))
              ConfigObjectDetailUtils.setContentInTextArea(configList);
          },
          resetTextArea: function(){
              document.getElementById('jsonTextArea').value = '';
              document.getElementById('jsonTextArea').value = JSON.stringify(configList,null,2);
              contrail.hideErrorPopup();
          },
          cancelEditor: function(viewConfig){
              ConfigObjectDetailUtils.showIconsAfterCancel($(contentContainer));
              document.getElementById('jsonTextArea').value = '';
              contrail.hideErrorPopup();
              self.loadConfigObject(viewConfig, false);
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
                              if(formSaved){
                                  self.loadConfigObject(viewConfig, false, formSaved);
                              }else{
                                  self.loadConfigObject(viewConfig, true, false);
                              }
                          },
                          error: function (error) {
                              contrail.showErrorMsg(error.responseText);
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
                 topOrder++;
                 bottomOrder++;
                 if(typeof jsonKey[i] === 'number' || typeof jsonKey[i] === 'string'){
                     schemaKey[i] = { propertyOrder: topOrder, type: typeof jsonKey[i], collapse:true };
                 }else if(typeof jsonKey[i] === 'boolean'){
                     schemaKey[i] = {propertyOrder: topOrder, type: typeof jsonKey[i] ,format: 'checkbox', collapse:true}
                 }else if(jsonKey[i] == null || (typeof jsonKey[i] === 'object' && jsonKey[i].constructor !== Array)){
                     schemaKey[i] = ConfigObjectDetailUtils.getChildKeyOfSchema(jsonKey[i],bottomOrder);
                 }else if(jsonKey[i].constructor === Array){
                     if(typeof jsonKey[i][0] !== 'object'){
                         if(i === 'fq_name' || i === 'to'){
                             schemaKey[i] = { propertyOrder: topOrder, type: 'string', collapse:true}
                         }else{
                              schemaKey[i] = { propertyOrder: bottomOrder, type: 'array' , collapse:true}
                         }
                       }else{
                           schemaKey[i] = {
                                   propertyOrder: bottomOrder,
                                   type: 'array',
                                   collapse:true,
                                   items: ConfigObjectDetailUtils.getChildKeyOfSchema(jsonKey[i][0])
                           }
                       }
                  }
               }
              return schemaKey;
           },
           updateModelForSchema: function(model){
               for (var i in model) {
                   if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                          self.updateModelForSchema(model[i]);
                   }else if( model[i] !== null && model[i].constructor === Array){
                       if(typeof model[i][0] === 'object'){
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
           },
           updateModelForJson: function(model){
               for (var i in model) {
                   if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                          self.updateModelForJson(model[i]);
                   }else if( model[i] !== null && model[i].constructor === Array){
                       if(typeof model[i][0] === 'object'){
                           for(var j = 0; j < model[i].length; j++){
                               self.updateModelForJson(model[i][j]);
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
           },
           showSchemaBasedForm: function(){
               ConfigObjectDetailUtils.setContainerScrollHeight($(contentContainer));
               ConfigObjectDetailUtils.showSchemaRelatedIcons($(contentContainer));
               self.setScrollInContainer();
           },
           setScrollInContainer: function(){
               var subCatContainer = document.getElementsByClassName("scroll-container");
               $(".scroll-container").scroll(function() {
                   for(var i =0; i < subCatContainer.length; i++){
                       if(i !== undefined){
                           $(subCatContainer[i]).scrollTop($(this).scrollTop());
                       }
                   }
               });
           },
           getJsonSchema: function(configList){
               schema.type = 'object';
               schema.properties = {};
               schema.properties[Object.keys(configList)[0]] = {};
               schema.properties[Object.keys(configList)[0]]['type'] = 'object';
               schema.properties[Object.keys(configList)[0]]['collapse'] = true;
               schema.properties[Object.keys(configList)[0]]['properties'] = {};
               var childProperty = self.getParentKeyOfSchema(schema);
               schema.properties[Object.keys(schema.properties)[0]].properties = childProperty;
           },
           loadSchemaBasedForm: function(configList,schema){
               var unDeletableProp;
               scrollTop = true;
               var startval = (jsoneditor && keep_value)? jsoneditor.getValue() : configList;
               var rowJsonContainer = $('.object-json-view');
               var formContainer = document.getElementById('jsonEditorContainer');//only works with getElementById
               if(jsoneditor) jsoneditor.destroy();
               JSONEditor.defaults.options.theme = 'bootstrap2';
               unDeletableProp = ['uuid','href','fq_name','owner','creator','created','last_modified','timer','parent_uuid'];
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
                   unDeletableProperty : unDeletableProp
                });
               window.jsoneditor = jsoneditor;
               // When the value of the editor changes, update the JSON output and validation message
               jsoneditor.on('change',function() {
                   var getHtmlFormatJson = contrail.formatJSON2HTML(ConfigObjectDetailUtils.setJsonOrder(jsoneditor.getValue(), configList), 10, undefined, true, '');
                   rowJsonContainer.empty();
                   rowJsonContainer.append(getHtmlFormatJson);
                   document.getElementById('jsonTextArea').style.width = '98.7%';
                   document.getElementById('jsonTextArea').value = '';
                   document.getElementById('jsonTextArea').value = JSON.stringify(jsoneditor.getValue(),null,2);
                   self.setFormContainerHeight();
                   ConfigObjectDetailUtils.setContentInTextArea(ConfigObjectDetailUtils.setJsonOrder(jsoneditor.getValue(), configList));
               });
               rowJsonContainer.value = '';
           },
           setFormContainerHeight: function(){
               ConfigObjectDetailUtils.setScrollHeight();
               if(scrollTop){
                   document.getElementById('jsonEditorContainer').scrollTop = 0;
                   scrollTop = false;
               }
           },
           cancelSchemaForm: function(viewConfig){
               contrail.hideErrorPopup();
               ConfigObjectDetailUtils.cancelSchemaBasedForm($(contentContainer));
               //configList = self.updateModelForJson(configList);
               self.loadConfigObject(viewConfig, false);
           }
     });
    return configObjectDetailsView;
});