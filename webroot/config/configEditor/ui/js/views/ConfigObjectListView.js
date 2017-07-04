/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'config/configEditor/ui/js/utils/ConfigObjectList.utils'],
    function(_, ContrailView, ConfigObjectListUtils) {
        var self, configList, schema = {}, enumKeys;
        var configObjectListView = ContrailView.extend({
            el: $(contentContainer),
            render: function() {
                self = this;
                self.viewConfig = this.attributes.viewConfig;
                contrail.ajaxHandler(ConfigObjectListUtils.getObjListUrl(self.viewConfig), null, function(model) {
                       configList = model[0];
                       var parentKey = ConfigObjectListUtils.parseParentJsonKeyToLabel(Object.keys(configList)[0]);
                       pushBreadcrumb([{label:Object.keys(configList)[0],href:''}]);
                       var template = contrail.getTemplate4Id(ctwc.CONFIG_EDITOR_TEMPLATE);
                       self.$el.html(template);
                       $(contentContainer).find('#object-header-title').text(parentKey);
                       ConfigObjectListUtils.hideHeaderIcons($(contentContainer));
                       self.loadObjList();
                       $(contentContainer).find('.config-edit-refresh').on('click', self.refreshConfigObjectList);
                       $(contentContainer).find('.create-config-object').on('click', function(){
                       self.renderView4Config(null, null,{
                            elementId: 'config_create_modal_view',
                            view: "ConfigEditorModalView",
                            viewPathPrefix: ctwc.CONFIG_EDITOR_PATH,
                            viewConfig: {
                            schema: schema,
                            onSaveCB : function(){
                            self.updateObjList();
                            }
                            }
                        });
                       });
                       $(contentContainer).find('.copy-config-object').on('click',ConfigObjectListUtils.getCopiedContent);
                   },function(error){
                       contrail.showErrorMsg(error.responseText);
                   });
            },
            refreshConfigObjectList: function(){
                $('.config-edit-refresh').children().removeClass('fa fa-repeat').addClass('fa fa-spin fa fa-spinner');
                contrail.ajaxHandler(ConfigObjectListUtils.getObjListUrl(self.viewConfig), null, function(model){
                      configList = model[0];
                      self.loadObjList();
                      $('.config-edit-refresh').children().removeClass('fa fa-spin fa fa-spinner').addClass('fa fa-repeat');
                    },function(error){
                      contrail.showErrorMsg(error.responseText);
                });
            },
            loadObjList: function(){
                var rowJson = ConfigObjectListUtils.formatJSON2HTML(configList, 10, undefined, true, true);
                $(contentContainer).find('.object-json-view').empty();
                $(contentContainer).find('.object-json-view').append(rowJson);
                ConfigObjectListUtils.setContentInTextArea(configList);
                self.getSchema(self.viewConfig);
            },
            updateObjList: function(){
            var self = this;
                contrail.ajaxHandler(ConfigObjectListUtils.getObjListUrl(self.viewConfig), null, function(model) {
                    configList = model;
                    self.loadObjList();
                    contrail.hideErrorPopup();
                    ConfigObjectListUtils.showIconsAfterSave($(contentContainer));
                });
            },
            getSchema: function(viewConfig){
                var strParam = viewConfig.hashParams.objName;
                if(strParam.substring(strParam.length,strParam.length-1) == 's'){
                    var str = strParam.substring(0,strParam.length-1);
                }
                var ajaxConfigForSchema = {
                        url: '/api/tenants/config/get-json-schema/'+str,
                        type:'GET'
                    };
                contrail.ajaxHandler(ajaxConfigForSchema, null, function(schemaModel){
                schema = schemaModel;
                },function(error){
                    contrail.showErrorMsg(error.responseText);
                });
            }
        });
    return configObjectListView;
});