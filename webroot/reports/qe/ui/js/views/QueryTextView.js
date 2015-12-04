/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-form-view',
], function (_, QueryFormView) {

    var QueryTextView = QueryFormView.extend({
        render: function () {
            var self = this,
                elId = self.attributes.elementId,
                queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_TEXT),
                viewConfig = self.attributes.viewConfig,
                queryFormAttributes = contrail.checkIfExist(viewConfig.queryFormAttributes) ? viewConfig.queryFormAttributes : {};

            self.$el.append(queryPageTmpl);

            self.$el.find('.queryText').append(qewu.formatEngQuery(queryFormAttributes.engQueryStr));
        }
    });

    return QueryTextView;
});