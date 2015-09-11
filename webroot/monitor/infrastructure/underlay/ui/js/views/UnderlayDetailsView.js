define([
    'underscore',
    'contrail-view',
    'underlay-graph-model',
    'graph-view'
], function (_, ContrailView, UnderlayGraphModel, GraphView) {
    var UnderlayDetailsView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, null,
                monitorInfraUtils.getUnderlayDetailsTabViewConfig(viewConfig));
        }
    });
    return UnderlayDetailsView;
});