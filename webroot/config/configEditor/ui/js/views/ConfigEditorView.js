/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'],
    function(_, ContrailView) {
        var configData = [];
        var configEditorView = ContrailView.extend({
        el: $(contentContainer),
        render: function(viewConfig) {
            var self = this;
            var hashParams = viewConfig.hashParams;
            if(viewConfig.hashParams.objName != undefined){
                if(viewConfig.hashParams.uuid == undefined){
                    self.renderView4Config(this.$el, null,{
                        elementId: ctwc.CONFIG_OBJECT_LIST_VIEW,
                        view: "ConfigObjectListView",
                        viewPathPrefix : ctwc.CONFIG_PATH,
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            hashParams: hashParams
                        }
                    });
                }else{
                    self.renderView4Config(this.$el, null,{
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