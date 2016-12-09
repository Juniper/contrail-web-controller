/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'lodash',
    'contrail-view','contrail-model',
    'config/configEditor/ui/js/utils/ConfigObjectDetail.utils',
    'config/configEditor/ui/js/utils/ConfigObjectList.utils',
    'jdorn-jsoneditor','knockback','jquery-linedtextarea'],
    function(lodash, ContrailView, ContrailModel, ConfigObjectDetailUtils, ConfigObjectListUtils, JsonEditor, Knockback, JqueryLinedTextArea, AJV) {
    var configList, formJson, jsoneditor, keep_value = undefined, schema, formRadioFlag = true, oldFormData, textAreaModel;
    var modelRefs = [];
    var configObjectDetailsView = ContrailView.extend({
        el: $(contentContainer),
        render: function() {
            self = this;
            schema = {};
            var viewConfig = this.attributes.viewConfig;
            var configListTmpl = contrail.getTemplate4Id(ctwc.CONFIG_EDITOR_TEMPLATE);
            self.$el.html(configListTmpl);
            if(window.optionsList == undefined){
                window.optionsList = [];
            }
            ConfigObjectDetailUtils.hideHeaderIcons($(contentContainer));
            self.loadConfigObject(viewConfig);
            $(contentContainer).find('.config-edit-refresh').on('click', function(){self.refreshObjectDetails(viewConfig)});
            $(contentContainer).find('.copy-config-object').on('click', ConfigObjectDetailUtils.getCopiedContent);
            $(contentContainer).find('.config-jSon-form-edit').on('click',function(){
                var disableKeys = ['security_group_id','parent_href','uuid','href','fq_name','owner','creator','created','last_modified','timer','parent_uuid','parent_type'];
                ConfigObjectDetailUtils.loadConfigEditorModal(schema, formJson, viewConfig, disableKeys, modelRefs, configList, []);
            });
            $(contentContainer).find('.delete-config-object').on('click', function(){ConfigObjectDetailUtils.deleteConformModal(viewConfig)});
         },
         loadConfigObject: function(viewConfig, rawJosnSave, formSave){
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
                 var getHtmlFormatJson = ConfigObjectListUtils.formatJSON2HTML(configList, 10, undefined, true, false);
                 $(contentContainer).find('.object-json-view').empty();
                 $(contentContainer).find('.object-json-view').append(getHtmlFormatJson);
                 if(Object.keys(schema).length === 0){
                   self.getGenerateDsSchema(viewConfig);
                 }
                 if(formSave){
                     schema = {};
                     self.getGenerateDsSchema(viewConfig);
                 }
                 ConfigObjectDetailUtils.setContentInTextArea(configList);
             },function(error){
                 contrail.showErrorMsg(error.responseText);
             });
          },
          getGenerateDsSchema: function(viewConfig){
              var options = {type:viewConfig.hashParams.objName+'/'+viewConfig.hashParams.uuid+'?exclude_back_refs=true&exclude_children=true'};
              var ajaxConfigForSchema = {
                      url: '/api/tenants/config/get-json-schema/'+viewConfig.hashParams.objName,
                      type:'GET'
                  };
              var ajaxConfigForJson = {
                      url: ctwc.URL_GET_CONFIG_DETAILS,
                      type:'POST',
                      data:ConfigObjectListUtils.getPostDataForGet(options)
                  };
              contrail.ajaxHandler(ajaxConfigForSchema, null, function(dsschema){
                  schema = dsschema;
                  contrail.ajaxHandler(ajaxConfigForJson, null, function(model){
                      formJson = model[0];
                      var obj = formJson[Object.keys(formJson)[0]];
                      for(var i in obj){
                          if(i.substring(i.length-5,i.length) === '_refs'){
                              modelRefs.push(i);
                              modelRefs.push(obj[i]);
                          }
                      }
                      self.getHrefUrlOptions();
                  },function(error){
                      contrail.showErrorMsg(error.responseText);
                  });
              },function(error){
                  contrail.showErrorMsg(error.responseText);
              });
          },
          getHrefUrlOptions: function(){
              var refsOrder = 50,list=[];
              schemaProperties = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
              for(var j in schemaProperties){
                  if(j.substring(j.length-5,j.length) === '_refs'){
                     list.push(j+':'+schemaProperties[j].url);
                  }
                  if(j == 'parent_type'){
                      delete schemaProperties[j].enum;
                      schema.properties[Object.keys(schema.properties)[0]].properties[j] = schemaProperties[j];
                  }
              }
              $.each(list, function (i, item) {
                  var url = item.split(':');
                  var options = {type:url[1].substring(1, url[1].length)};
                  var ajaxConfig = {
                          url: ctwc.URL_GET_CONFIG_LIST,
                          type:'POST',
                          data:ConfigObjectListUtils.getPostDataForGet(options)
                       };
                  contrail.ajaxHandler(ajaxConfig, null, function(model) {
                      var optionsList = [];
                      refsOrder++;
                      var objList = model[0][Object.keys(model[0])[0]];
                      for(var k = 0; k < objList.length; k++){
                          optionsList.push(objList[k].fq_name.join(':'));
                      }
                      //ToDo for without 's' keys s.split('-').join('_')
                      var objKey = Object.keys(model[0])[0].split('-').join('_');
                      var updatedKey = objKey.substring(0,objKey.length - 1) + '_refs';
                      schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey]= {
                              "type": "array",
                              "format": "select",
                              "propertyOrder": refsOrder,
                              "uniqueItems": true,
                              "items": {
                                 "type": "string",
                                 "enum": optionsList
                               }
                      }
                  },function(error){
                      contrail.showErrorMsg(error.responseText);
                  });
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
                  var getHtmlFormatJson = ConfigObjectListUtils.formatJSON2HTML(configList, 10, undefined, true, false);
                  $(contentContainer).find('.object-json-view').empty();
                  $(contentContainer).find('.object-json-view').append(getHtmlFormatJson);
                  ConfigObjectDetailUtils.setContentInTextArea(configList);
                  $('.config-edit-refresh').children().removeClass('fa fa-spin fa fa-spinner').addClass('fa fa-repeat');
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
          saveObjectDetails: function(data, viewConfig, formSaved ,utilSelf){
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
                              self.loadConfigObject(viewConfig, false, formSaved);
                          },
                          error: function (error) {
                              utilSelf.showConfigErrorMsg(error.responseText);
                          }
                      }
              );
           },
          deleteConfigObjectDetails: function(viewConfig){
              var currentHashObj = layoutHandler.getURLHashObj();
              var objectDeleteConfig = {
                      url: '/api/tenants/config/delete-config-data?type='+viewConfig.hashParams.objName+'&uuid='+viewConfig.hashParams.uuid,
                      type:'DELETE'
                  };
              contrail.ajaxHandler(objectDeleteConfig, null, function(projects){
                  $("#config-object-details-modal").modal('hide');
                  loadFeature({p: currentHashObj['p'], q: {'objName': currentHashObj.q.objName+'s'}});
              },function(error){
                  contrail.showErrorMsg(error.responseText);
              });
          }
     });
    return configObjectDetailsView;
});
