/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var nodesCntView = ContrailView.extend({
        render: function () {
            var self = this,
                nodesCountViewTemplate = contrail.getTemplate4Id("nodeCntView-template"),
                model = this.model,
                regionsInfo = model.getItems()[0];
                this.$el.append(nodesCountViewTemplate({regionsInfo}));
        }
    });
    return nodesCntView;
});