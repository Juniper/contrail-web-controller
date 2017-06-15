/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'lodash',
    'contrail-view','contrail-model',
    'config/configEditor/ui/js/utils/ConfigObjectDetail.utils',
    'config/configEditor/ui/js/utils/ConfigObjectList.utils',
    'knockback'],
    function(lodash, ContrailView, ContrailModel, ConfigObjectDetailUtils, ConfigObjectListUtils, Knockback, AJV) {
    var self, objModel;
    var configObjectDetailsView = ContrailView.extend({
        el: $(contentContainer),
        render: function() {
            self = this;
            self.schema = {};
            var viewConfig = this.attributes.viewConfig;
            var configListTmpl = contrail.getTemplate4Id(ctwc.CONFIG_EDITOR_TEMPLATE);
            self.$el.html(configListTmpl);
            ConfigObjectDetailUtils.hideHeaderIcons($(contentContainer));
            self.loadConfigObject(viewConfig);
            $(contentContainer).find('.config-edit-refresh').on('click', function(){self.refreshObjectDetails(viewConfig)});
            $(contentContainer).find('.copy-config-object').on('click', ConfigObjectDetailUtils.getCopiedContent);
            $(contentContainer).find('.config-jSon-form-edit').on('click',function(){
            self.renderView4Config(null, null,{
                    elementId: 'config_edit_modal_view',
                    view: "ConfigEditorModalView",
                    viewPathPrefix: ctwc.CONFIG_EDITOR_PATH,
                    viewConfig: {
                    schema: self.schema,
                    json : objModel,
                    onSaveCB : function(){
                    self.loadConfigObject(viewConfig, true, true);
                    }
                    
                    }
                });
            });
            $(contentContainer).find('.delete-config-object').on('click', function(){ConfigObjectDetailUtils.deleteConformModal(viewConfig, function(viewConfig){
                        self.deleteConfigObjectDetail(viewConfig);
            })});
         },
         loadConfigObject: function(viewConfig, rawJosnSave, formSave){
         var self = this;
             var options = {type:viewConfig.hashParams.objName+'/'+viewConfig.hashParams.uuid};
             var ajaxConfig = {
                     url: ctwc.URL_GET_CONFIG_DETAILS,
                     type:'POST',
                     data:ConfigObjectListUtils.getPostDataForGet(options)
                 };
             contrail.ajaxHandler(ajaxConfig, null, function(json){
                 ConfigObjectDetailUtils.hideErrorPopup();
                 ConfigObjectDetailUtils.hideHeaderIcons($(contentContainer));
                 objModel = json[0];
                 var parentKey = ConfigObjectDetailUtils.parseParentKeyLowerToUpper(Object.keys(objModel)[0]);
                 $(contentContainer).find('#object-header-title').text(parentKey);
                 if(rawJosnSave == undefined && formSave == undefined){
                     self.loadBreadcrumb(viewConfig);
                 }
                 var getHtmlFormatJson = ConfigObjectListUtils.formatJSON2HTML(objModel, 10, undefined, true, false);
                 $(contentContainer).find('.object-json-view').empty();
                 $(contentContainer).find('.object-json-view').append(getHtmlFormatJson);
                 if(Object.keys(self.schema).length === 0){
                   self.getSchema(viewConfig);
                 }
                 if(formSave){
                 schema = {};
                     self.getSchema(viewConfig);
                 }
                 ConfigObjectDetailUtils.setContentInTextArea(objModel);
             },function(error){
                 contrail.showErrorMsg(error.responseText);
             });
          },
          getSchema: function(viewConfig){
          var self = this;
              var ajaxConfigForSchema = {
                      url: '/api/tenants/config/get-json-schema/'+viewConfig.hashParams.objName,
                      type:'GET'
              };
              contrail.ajaxHandler(ajaxConfigForSchema, null, function(schemaModel){
              self.schema = schemaModel;
              },function(error){
                  contrail.showErrorMsg(error.responseText);
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
                  objModel = json[0];
                  var getHtmlFormatJson = ConfigObjectListUtils.formatJSON2HTML(objModel, 10, undefined, true, false);
                  $(contentContainer).find('.object-json-view').empty();
                  $(contentContainer).find('.object-json-view').append(getHtmlFormatJson);
                  ConfigObjectDetailUtils.setContentInTextArea(objModel);
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
              if(objModel !== undefined){
                  pushBreadcrumb([{label:parentLabel,href:parentHref},
                                  {label:getValueByJsonPath(objModel,Object.keys(objModel)[0]+';fq_name').join(' : ')}]);
              }
          },
          deleteConfigObjectDetail: function(viewConfig){
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