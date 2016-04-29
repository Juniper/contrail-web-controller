define([
    'underscore',
    'contrail-view',
    'monitor/infrastructure/underlay/ui/js/underlay.utils'
], function (_, ContrailView, underlayUtils) {
    var PRouterInterfaceView = ContrailView.extend({
        render : function () {
            var self = this, viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, null, underlayUtils.
                 getUnderlayPRouterInterfaceTabViewConfig(viewConfig));
        }
    });
    return PRouterInterfaceView;
});