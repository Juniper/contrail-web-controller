/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'config/configEditor/ui/js/models/ConfigEditorModel'],
    function(_, ContrailView, ConfigEditorModel) {
        var configData = [];
        var configEditorView = ContrailView.extend({
        el: $(contentContainer),
        render: function(viewConfig) {
            var self = this;
            var hashParams = viewConfig.hashParams;
            if(viewConfig.hashParams.objName != undefined){
                if(viewConfig.hashParams.uuid == undefined){
                    var configEditorModel = new ConfigEditorModel();
                    self.renderView4Config(this.$el, configEditorModel,{
                        elementId: ctwc.CONFIG_OBJECT_LIST_VIEW,
                        view: "ConfigObjectListView",
                        viewPathPrefix : ctwc.CONFIG_PATH,
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            hashParams: hashParams
                        }
                    });
                }else{
                    var configEditorModel = new ConfigEditorModel();
                    self.renderView4Config(this.$el, configEditorModel,{
                        elementId: ctwc.CONFIG_OBJECT_DETAILS_VIEW,
                        view: "ConfigObjectDetailsView",
                        viewPathPrefix : ctwc.CONFIG_PATH,
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            hashParams: hashParams
                        }
                    });
                }
             }else{
                 self.renderView4Config(this.$el, null,{
                     elementId: ctwc.CONFIG_API_LIST_VIEW,
                     view: "ConfigApiListView",
                     viewPathPrefix : ctwc.CONFIG_PATH,
                     app: cowc.APP_CONTRAIL_CONTROLLER,
                     viewConfig: {
                         hashParams: hashParams
                     }
                 });
            }
        }
    });
    return configEditorView;
});