define([
    'underscore',
    'contrail-view',
    'monitor/infrastructure/underlay/ui/js/underlay.utils'
], function (_, ContrailView, underlayUtils) {
    var UnderlayDetailsView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, null,
                underlayUtils.getUnderlayDetailsTabViewConfig(viewConfig));
        }
    });
    return UnderlayDetailsView;
});