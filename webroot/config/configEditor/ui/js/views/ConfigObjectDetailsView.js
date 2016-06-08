/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view','contrail-model',
    'config/configEditor/ui/js/utils/ConfigObjectDetail.utils',
    'config/configEditor/ui/js/utils/ConfigObjectList.utils'],
    function(_, ContrailView, ContrailModel, ConfigObjectDetailUtils, ConfigObjectListUtils) {
    var configList;
    var configObjectDetailsView = ContrailView.extend({
        el: $(contentContainer),
        render: function() {
            self = this;
            var viewConfig = this.attributes.viewConfig;
            var configListTmpl = contrail.getTemplate4Id(ctwc.CONFIG_EDITOR_TEMPLATE);
            self.$el.html(configListTmpl);
            self.loadConfigObject(viewConfig);
            self.loadBreadcrumb(viewConfig);
            $(contentContainer).find('.config-object-edit').on('click',self.editObject);
            $(contentContainer).find('#jsonTextArea').removeClass('config-scroll-color');
            $(contentContainer).find('.cancel-config-edit').on('click',function(){self.cancelEditor(viewConfig)});
            $(contentContainer).find('.reset-object').on('click',self.resetTextArea);
            $(contentContainer).find('.copy-config-object').on('click', ConfigObjectDetailUtils.getCopiedContent);
            $(contentContainer).find('.save-config-object').on('click', function() {
                try{
                    var json = JSON.parse(document.getElementById('jsonTextArea').value);
                    self.saveObjectDetails(self,json,viewConfig);
                }catch(err){
                    contrail.showErrorMsg(err);
                }
             });
         },
         loadConfigObject: function(viewConfig,hideFiled){
             var options = {type:viewConfig.hashParams.objName+'/'+viewConfig.hashParams.uuid};
             var ajaxConfig = {
                     url: ctwc.URL_GET_CONFIG_DETAILS,
                     type:'POST',
                     data:ConfigObjectListUtils.getPostDataForGet(options),
                     async: false
                  };
             contrail.hideErrorPopup();
             ConfigObjectDetailUtils.hideHeaderIcons($(contentContainer));
             contrail.ajaxHandler(ajaxConfig, null, function(json){
                 configList = json[0];
                 var getHtmlFormatJson = ConfigObjectListUtils.formatJSON2HTML(configList, 10, undefined, true);
                 $(contentContainer).find('.object-json-view').empty();
                 $(contentContainer).find('.object-json-view').append(getHtmlFormatJson);
                 if(hideFiled){
                     ConfigObjectDetailUtils.hideTextAreaAfterSave($(contentContainer));
                 }
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
              self.loadConfigObject(viewConfig);
          },
          saveObjectDetails: function(self, data, viewConfig){
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
                              self.loadConfigObject(viewConfig,true);
                          },
                          error: function (error) {
                              contrail.showErrorMsg(error.responseText);
                          }
                      }
              );
           }
     });
    return configObjectDetailsView;
});