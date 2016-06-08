/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'config/configEditor/ui/js/utils/ConfigObjectList.utils'],
    function(_, ContrailView, ConfigObjectListUtils) {
        var configList;
        var configObjectListView = ContrailView.extend({
            el: $(contentContainer),
            render: function() {
                self = this;
                self.viewConfig = this.attributes.viewConfig;
                contrail.ajaxHandler(ConfigObjectListUtils.getObjListUrl(self.viewConfig), null, function(model) {
                       configList = model[0];
                       pushBreadcrumb([{label:Object.keys(configList)[0],href:''}]);
                       var template = contrail.getTemplate4Id(ctwc.CONFIG_EDITOR_TEMPLATE);
                       self.$el.html(template);
                       ConfigObjectListUtils.hideHeaderIcons($(contentContainer));
                       self.loadObjList();
                       $(contentContainer).find('.create-config-object').on('click',self.createNewConfigObj);
                       $(contentContainer).find('.cancel-config-edit').on('click',self.cancelConfigEditor);
                       $(contentContainer).find('.save-config-object').on('click',function(){
                          try{
                               var data = JSON.parse(document.getElementById('jsonTextArea').value);
                               var model = { data : [{ data : data, reqUrl: '/'+ Object.keys(configList)[0]}]};
                               self.model.addEditConfigData (data, '/'+ Object.keys(configList)[0], false, 
                                       {
                                           init: function () {
                                           },
                                           success: function () {
                                               self.refreshConfigObjList();
                                           },
                                           error: function (error) {
                                               contrail.showErrorMsg(error.responseText);
                                           }
                                       }
                               );
                             }catch(err){
                                   contrail.showErrorMsg(err);
                             }
                       });
                       $(contentContainer).find('#jsonTextArea').removeClass('config-scroll-color');
                       $(contentContainer).find('.copy-config-object').on('click',ConfigObjectListUtils.getCopiedContent);
                   },function(error){
                       contrail.showErrorMsg(error.responseText);
                   }); 
            },
            loadObjList: function(){
                var rowJson = ConfigObjectListUtils.formatJSON2HTML(configList, 10, undefined, true);
                $(contentContainer).find('.object-json-view').empty();
                $(contentContainer).find('.object-json-view').append(rowJson);
                ConfigObjectListUtils.setContentInTextArea(configList);
            },
            createNewConfigObj: function(){
                ConfigObjectListUtils.setTextAreaHeight(configList, $(contentContainer));
                ConfigObjectListUtils.hideIconForNewConfigObj($(contentContainer));
            },
            cancelConfigEditor: function(){
                ConfigObjectListUtils.showIconsAfterCancel($(contentContainer));
                contrail.hideErrorPopup();
            },
            refreshConfigObjList: function(){
                contrail.ajaxHandler(ConfigObjectListUtils.getObjListUrl(self.viewConfig), null, function(model) {
                    configList = model;
                    self.loadObjList();
                    contrail.hideErrorPopup();
                    ConfigObjectListUtils.showIconsAfterSave($(contentContainer));
                 });
            },
        });
    return configObjectListView;
});