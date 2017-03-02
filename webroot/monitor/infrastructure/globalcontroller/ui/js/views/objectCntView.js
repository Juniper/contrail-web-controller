/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ObjectCountView = ContrailView.extend({
        render: function () {
            var self = this,
             objectCountViewTemplate = contrail.getTemplate4Id("objectCntView-template"),
             model = this.model,
             dataObjectCnt = model.getItems()[0].data;
             this.$el.append(objectCountViewTemplate({dataObjectCnt}));
        }
    });
    return ObjectCountView;
});