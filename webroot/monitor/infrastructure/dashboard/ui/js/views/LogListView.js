/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
],function(_,Backbone) {
    var LogListView = Backbone.View.extend({
        initialize: function(options) {
        },
        render: function() {
            var self = this;
            var logListTmpl = contrail.getTemplate4Id('logList-template');
            var logList = self.model.getItems();
            //Display only recent 3 log messages
            self.$el.find('.widget-body .widget-main').
                html(logListTmpl(logList.reverse().slice(0,3)));
            self.$el.find('.widget-header').initWidgetHeader({
                title: 'Logs'
            });
        }
    });
    return LogListView;
});
