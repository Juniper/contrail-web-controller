/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-view-model'
], function (_, Backbone, ContrailViewModel) {
    var InstanceTabView = Backbone.View.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                instanceUUID = viewConfig.instanceUUID,
                modelMap = contrail.handleIfNull(this.modelMap, {}),
                modelKey = ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID);
            modelMap[modelKey] = ctwu.getInstanceTabViewModelConfig(instanceUUID);
            cowu.renderView4Config(self.$el, null, ctwu.getInstanceTabViewConfig(viewConfig), null, null, modelMap);
        }
    });
    
    return InstanceTabView;
});
