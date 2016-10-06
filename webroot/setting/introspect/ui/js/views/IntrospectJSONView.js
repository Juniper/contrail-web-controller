/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-view"
], function (_, ContrailView) {
    var IntrospectJSONView = ContrailView.extend({
        el: $(window.contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                jsonData = viewConfig.jsonData;

            $(self.$el).html(contrail.formatJSON2HTML(jsonData, 5, ["toString"]));
        }
    });

    return IntrospectJSONView;
});
