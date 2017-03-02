/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
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
             dataObjectCnt = getValueByJsonPath(model.getItems()[0], 'data', null);
             this.$el.append(objectCountViewTemplate({dataObjectCnt}));
        }
    });
    return ObjectCountView;
});