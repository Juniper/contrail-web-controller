/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodashv4',
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
                    this.getSessionsTabViewConfig(sessionData.endpointNames, sessionData.external), null, null, null,
                    function() {
                        self.renderBreadcrumb();
                        if(sessionData.level == 1) {
                            $('#Session_Endpoint, #group_by_columns').show();
                            sessionData.sessionType = $('#Client_Sessions-tab-link')
                                .parent().hasClass('ui-tabs-active')
                                                       ? 'client' : 'server';
                            if(!$._data($('#Session_Endpoint input')[0], 'events')) {
                                self.subscribeModelChangeEvents(self.model, ctwl.EDIT_ACTION);
                                Knockback.applyBindings(self.model,
                                    document.getElementById('Session_Endpoint'));
                                Knockback.applyBindings(self.model,
                                    document.getElementById('group_by_columns'));
                                kbValidation.bind(self);
                            }
                        } else {
                            $('#Session_Endpoint, #group_by_columns').hide();
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
                    viewPathPrefix: "monitor/security/trafficgroups/ui/js/views/",
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
                    viewPathPrefix: "monitor/security/trafficgroups/ui/js/views/",
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
        getSessionsTabViewConfig: function (names, external) {
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
                                disabled: external ? true : false,
                                elementConfig: {
                                    dataObj: [
                                        {value: 'endpoint1', label: names[0]},
                                        {value: 'endpoint2', label: names[1]}
                                    ]
                                }
                            }
                        }],
                    }, {
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
                    }, {
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
                            viewPathPrefix: "monitor/security/trafficgroups/ui/js/views/",
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
            $('#TGsessionsBreadcrumb li a').on('click', function(e) {
                e.preventDefault();
                var curIndex = $(e.target).parents('li').index();
                if(self.sessionData.level != curIndex) {
                    if(curIndex == 0) {
                    self.parentView.render();
                    } else {
                        self.sessionData.breadcrumb = self.sessionData.breadcrumb.slice(0, curIndex+1);
                        self.sessionData.where = self.sessionData.where.slice(0, curIndex+1);
                        self.sessionData.level = curIndex;
                        self.sessionDrilldown(self.sessionData, $('#traffic-groups-radial-chart'));
                    }
                }
            });
        },
        sessionDrilldown: function(sessionData) {
            var parentEle = $('#TG_Sessions_View').length ?
                $('#TG_Sessions_View') : $('#traffic-groups-radial-chart');
                parentEle.html('<h4 class="noStatsMsg">Loading...</h4>');
            $('#traffic-groups-legend-info').addClass('hidden');
            $('.tgChartLegend, .tgCirclesLegend').hide();
            var sessionData = this.sessionData,
                self = this,
                filterApplied = self.isFilterApplied(sessionData),
                groupByOption = sessionData.groupBy == 'policy' ?
                                'policy' : 'protocol',
                level = sessionData.level,
                selectFields = ['SUM(forward_logged_bytes)', 'SUM(reverse_logged_bytes)'];
                if(level == 1 || (level == 2 && groupByOption == 'policy')) {
                    if(groupByOption != 'policy' || level == 2) {
                        selectFields.push("protocol", "server_port");
                    } else {
                        selectFields.push("security_policy_rule");
                    }
                }
                if(groupByOption == 'policy')
                    level--;
                if(level == 2) {
                    selectFields.push("local_ip", "vn");
                }
                if(level == 3) {
                    selectFields.push('remote_ip', 'remote_vn', 'client_port',
                        'SUM(forward_sampled_bytes)', 'SUM(reverse_sampled_bytes)');
                }
            if(filterApplied)
                selectFields.push('remote_vn');

            var whereClause = [], filter = [],
                whereTags = sessionData.tags.slice(0);
            if(sessionData.selectedEndpoint == 'endpoint2') {
                whereTags = whereTags.reverse();
            }
            _.each(whereTags[0], function(tag) {
                if (tag.value && (tag.name != 'vn' || level < 3)) {
                    whereClause.push({
                        "suffix": null, "value2": null, "name": tag.name,
                        "value": tag.value, "op": tag.operator ? tag.operator : 1
                    });
                }
            });
           _.each(whereTags[1], function(tag) {
                if (tag.value) {
                    whereClause.push({
                        "suffix": null, "value2": null, "name": "remote_" + tag.name,
                        "value": tag.value, "op": tag.operator ? tag.operator : 1
                    });
                 }
            });
           if(filterApplied) {
               _.each(sessionData.filter, function(tag) {
                    if (tag.value) {
                        filter.push({
                            "suffix": null, "value2": null, "name": "remote_" + tag.name,
                            "value": tag.value, "op": tag.operator ? tag.operator : 1
                        });
                     }
                });
            }
            var addWhere = [];
            _.each(sessionData.where, function(values) {
                _.each(values, function(value) {
                    addWhere.push(value);
                });
            });
            whereClause = whereClause.concat(addWhere);
            var reqObj = {
                selectFields : selectFields,
                whereClause : whereClause,
                filter: filter,
                level : sessionData.level,
                type: sessionData.sessionType,
                callback : self.callRender,
                view : self
            };
            self.parentView.querySessionSeries(reqObj);
        },
        isFilterApplied: function(data) {
            var level = (data.groupBy == 'policy') ? data.level-1 : data.level;
            if(data.external == 'externalProject' && !data.sliceByProject
                && level !=3) {
                return true;
            } else return false;
        },
        grouByColumns: function(columns, data) {
            data = _.groupBy(data, function(d) {
                var groupBy = [];
                _.each(columns, function(key) {
                    groupBy.push(d[key]);
                });
                return groupBy.join('-');
            });
            data = _.map(data, function(objs, keys) {
                objs[0]['SUM(forward_logged_bytes)'] = _.sumBy(objs, 'SUM(forward_logged_bytes)');
                objs[0]['SUM(reverse_logged_bytes)'] = _.sumBy(objs, 'SUM(reverse_logged_bytes)');
                return objs[0];
            });
            return data;
        },
        callRender: function(resObj) {
            var view = resObj.view;
            if(view.isFilterApplied(view.sessionData)) {
                var columns = _.without(resObj.selectFields,
                    'remote_vn',"SUM(forward_logged_bytes)", "SUM(reverse_logged_bytes)")
                if(resObj.level == 1) {
                    resObj.clientData = view.grouByColumns(columns, resObj.clientData);
                    resObj.serverData = view.grouByColumns(columns, resObj.serverData);
                } else {
                    resObj.curSessionData =
                        resObj.view.grouByColumns(columns, resObj.curSessionData);
                }
            }
            if(resObj.level == 1) {
                view.sessionData.endpointStats =
                        [resObj.clientData, resObj.serverData];
            }
            view.curSessionData = resObj.curSessionData;
            view.render(resObj.view.sessionData, $('#traffic-groups-radial-chart'));
            $('#traffic-groups-legend-info').removeClass('hidden');
        }
    });
    return TrafficGroupsSessionsView;
});
