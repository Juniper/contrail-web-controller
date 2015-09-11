define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var PRouterInterfaceView = ContrailView.extend({
        render : function () {
            var self = this, viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, null, monitorInfraUtils.
                 getUnderlayPRouterInterfaceTabViewConfig(viewConfig));
        }
    });
    return PRouterInterfaceView;
});