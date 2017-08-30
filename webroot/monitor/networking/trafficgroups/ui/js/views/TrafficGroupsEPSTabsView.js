/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var TrafficGroupsSessionsView = ContrailView.extend({
        el: $(contentContainer),
        render: function (sessionData) {
            var self = this,
                modalTemplate =contrail.getTemplate4Id('core-modal-template'),
                prefixId = ctwl.TRAFFIC_GROUPS_ENDPOINT_STATS,
                modalId = prefixId + '-modal',
                modalLayout = modalTemplate({prefixId: prefixId, modalId: modalId}),
                modalConfig = {
                   'modalId': modalId,
                   'className': 'modal-980',
                   'body': modalLayout,
                   'title': ctwl.TITLE_TRAFFIC_GROUPS_ENDPOINT_STATS,
                   'onCancel': function() {
                       $("#" + modalId).modal('hide');
                   }
                },
                formId = prefixId + '_modal';
            cowu.createModal(modalConfig);
            self.sessionData = sessionData;
            $('#'+ modalId).on('shown.bs.modal', function () {
               self.renderView4Config($("#" + modalId).find('#' + formId), null, self.getSessionsTabsViewConfig());
            });
        },
        getEndpointStatsTabs: function() {
            return {
                theme: 'default',
                active: 0,
                tabs: this.getEndpointTabConfig()
            };
        },
        getEndpointTabConfig: function() {
            var tabConfig = [],
                sessionData = this.sessionData
            _.each(sessionData.endpointStats, function(endpoint, idx) {
                var targetIdx = (idx == 0) ? 1 : 0;
                var names = [sessionData.endpointNames[idx], sessionData.endpointNames[targetIdx]];
                tabConfig.push({
                    elementId: "Endpoint_" + idx + "_Stats",
                    title: 'Endpoint' + (idx + 1),
                    view: "TrafficGroupsEPSGridView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "monitor/networking/trafficgroups/ui/js/views/",
                    viewConfig: {
                        data: endpoint,
                        tabid: "Endpoint_" + idx + "_Stats",
                        names: names,
                        title: names.join(' ' + cowc.ARROW_RIGHT_ICON + ' ')
                    },
                    tabConfig: {
                       activate: function(event, ui) {
                           var gridId = $("#Endpoint_" + idx + "_Stats");
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       }
                    }
                });
             });
            return tabConfig;
        },
        getSessionsTabsViewConfig: function () {
            return {
                elementId: cowu.formatElementId([ctwl.TRAFFIC_GROUPS_ENDPOINT_STATS + '-list']),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: ctwl.TRAFFIC_GROUPS_ENDPOINT_STATS + '-tabs',
                            view: 'TabsView',
                            viewConfig: this.getEndpointStatsTabs()
                        }]
                    }]
                }
            }
        }
    });
    return TrafficGroupsSessionsView;
});
