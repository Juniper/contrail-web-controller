/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-view-model'
], function (_, ContrailView, ContrailViewModel) {
    var InstanceTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                instanceUUID = viewConfig.instanceUUID,
                modelMap = contrail.handleIfNull(this.modelMap, {}),
                modelKey = ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID);

            modelMap[modelKey] = ctwvc.getInstanceTabViewModelConfig(instanceUUID);
            self.renderView4Config(self.$el, null, ctwvc.getInstanceTabViewConfig(viewConfig), null, null, modelMap);
        }
    });
    
    return InstanceTabView;
});
