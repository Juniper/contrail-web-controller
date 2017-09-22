/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'knockback',
    'contrail-view',
    'contrail-list-model',
    'contrail-model'
], function (_, Knockback, ContrailView, ContrailListModel, ContrailModel) {
    var TrafficGroupsSessionsView = ContrailView.extend({
        el: $(contentContainer),
        render: function (sessionData, containerEle) {
            var self = this;
            this.sessionData = sessionData;
            if(containerEle) {
                if(!self.model) {
                    self.model = new (ContrailModel.extend({
                        defaultConfig: {
                            'group_by_columns' : null,
                            'Session_Endpoint' : 'endpoint1'
                        },
                        onEndpointChanged: function(newVal) {
                            sessionData.selectedEndpoint = newVal;
                            self.sessionDrilldown(sessionData);
                            self.renderBreadcrumb();
                        },
                        onGroupByChanged: function(newVal) {
                            sessionData.groupBy = newVal;
                            self.sessionDrilldown(sessionData);
                            self.renderBreadcrumb();
                        }
                    }))();
                }
                if($('#TG_Sessions_View').length) {
                    containerEle = $("#TG_Sessions_View");
                    containerEle.empty();
                }
                this.renderView4Config(containerEle, self.model,
                    this.getSessionsTabViewConfig(sessionData.endpointNames), null, null, null,
                    function() {
                        self.renderBreadcrumb();
                        if(sessionData.level == 1) {
                            $('#Session_Endpoint').show();
                            sessionData.sessionType = $('#Client_Sessions-tab-link')
                                .parent().hasClass('ui-tabs-active')
                                                       ? 'client' : 'server';
                            if(!$._data($('#Session_Endpoint input')[0], 'events')) {
                                self.subscribeModelChangeEvents(self.model, ctwl.EDIT_ACTION);
                                Knockback.applyBindings(self.model,
                                    document.getElementById('Session_Endpoint'));
                                Knockback.applyBindings(self.model,
                                    document.getElementById('TG_Sessions_View'));
                                kbValidation.bind(self);
                            }
                        } else {
                            $('#Session_Endpoint').hide();
                        }
                    });
            } else {
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
            $('#'+ modalId).on('shown.bs.modal', function () {
               self.renderView4Config($("#" + modalId).find('#' + formId), null,
                                         self.getEndpointsTabsViewConfig());
            });
            }
        },
        subscribeModelChangeEvents: function(sessionModel) {
            sessionModel.__kb.view_model.model().on('change:Session_Endpoint',
                function(model, newValue){
                    sessionModel.onEndpointChanged(newValue);
                }
            );
            sessionModel.__kb.view_model.model().on('change:group_by_columns',
                function(model, newValue){
                    sessionModel.onGroupByChanged(newValue);
                }
            );
        },
        getEndpointStatsTabs: function() {
            return {
                theme: 'default',
                active: 0,
                tabs: this.getEndpointTabConfig()
            };
        },
        getEndpointTabConfig: function() {
            var self = this,
                tabConfig = [],
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
        getEndpointsTabsViewConfig: function () {
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
        },
        getSessionTabConfig: function() {
            var self = this,
                tabConfig = [],
                sessionData = this.sessionData;
            _.each(sessionData.endpointStats, function(endpoint, idx) {
                var title = (idx == 0) ? 'Client' : 'Server';
                tabConfig.push({
                    elementId: title + "_Sessions",
                    title: title + ' Sessions',
                    view: "TrafficGroupsEPSGridView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "monitor/networking/trafficgroups/ui/js/views/",
                    viewConfig: {
                        data: endpoint,
                        tabid: title + "_Sessions",
                        configTye: 'sessions'
                    },
                    tabConfig: {
                       activate: function(event, ui) {
                           self.sessionData.sessionType = (idx == 0) ?
                                                    'client' : 'server';
                           var gridId = $("#" + title + "_Sessions");
                           if (gridId.data('contrailGrid')) {
                               gridId.data('contrailGrid').refreshView();
                           }
                       }
                    }
                });
             });
            return tabConfig;
        },
        getSessionsTabViewConfig: function (names) {
                var configRows = [];
                if(!$('#TG_Sessions_View').length) {
                    configRows.push({
                        columns:[{
                            elementId: 'Session_Endpoint',
                            view: "FormRadioButtonView",
                            viewConfig: {
                                label: 'Select Endpoint',
                                class: 'col-xs-12 iconFontStyle margin-10-0-0',
                                templateId: cowc.TMPL_RADIO_BUTTON_VIEW,
                                path: 'Session_Endpoint',
                                dataBindValue: 'Session_Endpoint',
                                elementConfig: {
                                    dataObj: [
                                        {value: 'endpoint1', label: names[0]},
                                        {value: 'endpoint2', label: names[1]}
                                    ]
                                }
                            }
                        }],
                    }, /*{
                        columns: [{
                            elementId: 'group_by_columns',
                            view: 'FormDropdownView',
                            viewConfig: {
                                label: 'Group By',
                                class: 'col-xs-6',
                                path: 'group_by_columns',
                                dataBindValue: 'group_by_columns',
                                elementConfig: {
                                    defaultValue: 'Protocol (Server Port)',
                                    defaultValueId: 0,
                                    data:[{
                                        id:'protocol',
                                        text:'Protocol (Server Port)'
                                    },{
                                        id:'policy',
                                        text:'Policy (Rule)'
                                    }]
                                }
                            }
                        }]
                    }, */{
                        columns: [{
                            elementId: 'TG_Sessions_View',
                            view: "SectionView",
                            viewConfig: {
                                rows: [
                                {
                                    columns:[{
                                        elementId: ctwl.TRAFFIC_GROUPS_SESSION_STATS + '-tabs',
                                        view: 'TabsView',
                                        viewConfig: {
                                            theme: 'default',
                                            active: 0,
                                            tabs: this.getSessionTabConfig()
                                        }
                                    }]
                                 }]
                            }
                        }]
                    });
                }  else if(this.sessionData.level == 1) {
                    configRows.push({
                        columns: [{
                            elementId: ctwl.TRAFFIC_GROUPS_SESSION_STATS + '-tabs',
                            view: 'TabsView',
                            viewConfig: {
                                theme: 'default',
                                active: 0,
                                tabs: this.getSessionTabConfig()
                            }
                        }]
                    });
                  } else {
                    var type = (this.sessionData.sessionType == 'client') ?
                                        'Client' : 'Server';
                    configRows.push({
                        columns: [{
                            elementId: type + "_Sessions",
                            view: "TrafficGroupsEPSGridView",
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            viewPathPrefix: "monitor/networking/trafficgroups/ui/js/views/",
                            viewConfig: {
                                data: this.curSessionData,
                                tabid: type + "_Sessions",
                                title: type + " Sessions",
                                configTye: 'sessions'
                            }
                        }]
                    });
                  }
                return {
                    elementId: cowu.formatElementId([ctwl.TRAFFIC_GROUPS_SESSION_STATS + '-list']),
                    view: "SectionView",
                    viewConfig: {
                        rows: configRows
                    }
                }
        },
        renderBreadcrumb: function() {
            $('#TGsessionsBreadcrumb').remove();
            var self = this,
                items = self.sessionData.breadcrumb.slice(0);
                if(self.sessionData.selectedEndpoint == 'endpoint2') {
                    items[1] = items[1].slice(0).reverse();
                }
                breadCrumbTmpl = contrail.getTemplate4Id('breadcrumb-template');
            $('#traffic-groups-radial-chart').prepend(breadCrumbTmpl({
                items : items,
                breadcrumbId : 'TGsessionsBreadcrumb'
            }));
            $('#TGsessionsBreadcrumb li:last').addClass('active');
            $('#TGsessionsBreadcrumb li').on('click', function(e) {
                e.preventDefault();
                var curIndex = $(e.target).parents('li').index();
                if(curIndex == 0) {
                    self.parentView.render();
                } else {
                    self.sessionData.breadcrumb = self.sessionData.breadcrumb.slice(0, curIndex+1);
                    self.sessionData.where = self.sessionData.where.slice(0, curIndex+1);
                    self.sessionData.level = curIndex;
                    self.sessionDrilldown(self.sessionData, $('#traffic-groups-radial-chart'));
                }
            });
        },
        sessionDrilldown: function(sessionData) {
            $('.tgChartLegend, .tgCirclesLegend').hide();
            var sessionData = this.sessionData,
                self = this,
                selectFields = ["SUM(forward_sampled_bytes)", "SUM(reverse_sampled_bytes)"];
                if(sessionData.level == 1) {
                    if(self.model && self.model.model()
                            .attributes['group_by_columns'] == 'policy') {
                        selectFields.push("policy", "rule");
                    } else {
                        selectFields.push("protocol", "server_port");
                    }
                }
                if(sessionData.level == 2) {
                    selectFields.push("local_ip", "vn");
                }
                if(sessionData.level == 3) {
                    selectFields.push("remote_ip", "vn", 'remote_vn', 'client_port', 'forward_action', 'reverse_action');
                }
            var whereClause = [],
                whereTags = sessionData.tags.slice(0);
            if(sessionData.selectedEndpoint == 'endpoint2') {
                whereTags = whereTags.reverse();
            }
            _.each(whereTags[0], function(tag) {
                whereClause.push({
                    "suffix": null, "value2": null, "name": tag.name, "value": tag.value, "op": 1
                });
            });
           _.each(whereTags[1], function(tag) {
                whereClause.push({
                    "suffix": null, "value2": null, "name": "remote_" + tag.name, "value": tag.value, "op": 1
                });
            });

            var addWhere = [];
            _.each(sessionData.where, function(values) {
                _.each(values, function(value) {
                    addWhere.push(value);
                });
            });
            whereClause = whereClause.concat(addWhere);
            var selectedTime = self.parentView.getSelectedTime();

            var clientPostData = {
                "session_type": "client",
                "start_time": "now-" + (selectedTime.fromTime + 'm'),
                "end_time": "now-" + (selectedTime.toTime + 'h'),
                "select_fields": selectFields,
                "table": "SessionSeriesTable",
                "where": [whereClause]
            };

            var serverPostData = {
                "session_type": "server",
                "start_time": "now-" + (selectedTime.fromTime + 'm'),
                "end_time": "now-" + (selectedTime.toTime + 'm'),
                "select_fields": selectFields,
                "table": "SessionSeriesTable",
                "where": [whereClause]
            };

            var clientModelConfig = {
                remote : {
                    ajaxConfig : {
                        url:monitorInfraConstants.monitorInfraUrls['ANALYTICS_QUERY'],
                        type:'POST',
                        data:JSON.stringify(clientPostData)
                    },
                    dataParser : function (response) {
                        self.clientData = cowu.getValueByJsonPath(response, 'value', []);
                        self.curSessionData = self.clientData;
                        return self.clientData;
                    }
                }
            };

            var serverModelConfig = {
                remote : {
                    ajaxConfig : {
                        url:monitorInfraConstants.monitorInfraUrls['ANALYTICS_QUERY'],
                        type:'POST',
                        data:JSON.stringify(serverPostData)
                    },
                    dataParser : function (response) {
                        self.serverData = cowu.getValueByJsonPath(response, 'value', []);
                        self.curSessionData = self.serverData;
                        return self.serverData;
                    }
                }
            };

            if(sessionData.level == 1) {
                var clientModel = new ContrailListModel(clientModelConfig),
                    serverModel = new ContrailListModel(serverModelConfig),
                    reqCount = 0;
                clientModel.onAllRequestsComplete.subscribe(function() {
                   reqCount++;
                   bothRequestDone(reqCount);
                });
                serverModel.onAllRequestsComplete.subscribe(function() {
                    reqCount++;
                    bothRequestDone(reqCount);
                });
            } else if(sessionData.sessionType == 'client') {
                var clientModel = new ContrailListModel(clientModelConfig);
                clientModel.onAllRequestsComplete.subscribe(function() {
                   callRender();
                });
            } else {
                var serverModel = new ContrailListModel(serverModelConfig);
                serverModel.onAllRequestsComplete.subscribe(function() {
                   callRender();
                });
            }
            function bothRequestDone(reqCount) {
                if(reqCount == 2) {
                    callRender();
                }
            }
            function callRender() {
                if(sessionData.level == 1) {
                    sessionData.endpointStats = [self.clientData, self.serverData];
                }
                self.render(sessionData, $('#traffic-groups-radial-chart'));
            }
        }
    });
    return TrafficGroupsSessionsView;
});
