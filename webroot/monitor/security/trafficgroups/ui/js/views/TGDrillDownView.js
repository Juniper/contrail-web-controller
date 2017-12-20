/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodashv4',
    'knockback',
    'contrail-view',
    'contrail-model',
    'monitor/security/trafficgroups/ui/js/views/TrafficGroupsHelpers'
], function (_, Knockback, ContrailView, ContrailModel, TgHelpersView, TgFormatters) {
    var TGDrillDownView = ContrailView.extend({
        el: $(contentContainer),
        tgHelpers: new TgHelpersView(),
        initialize: function(obj) {
            if(obj) {
                this.parentRender = obj.parentRender;
                this.ddData = obj.ddData;
                this.el = obj.el
            }
        },
        render: function (containerEle) {
            var self = this;
            if(containerEle) {
                if(!self.model) {
                    self.model = new (ContrailModel.extend({
                        defaultConfig: {
                            'Session_Endpoint' : 'endpoint1',
                            'remote_endpoints': null
                        },
                        onEndpointChanged: function(newVal) {
                            self.ddData.selectedEndpoint = newVal;
                            self.drillDown();
                            self.renderBreadcrumb();
                        },
                        onRemoteEndpointChanged: function(newVal) {
                            if(self.ddData.onRemoteEndpointChanged) {
                                self.ddData = self.ddData.onRemoteEndpointChanged(self.ddData, newVal);
                            }
                            self.drillDown();
                            self.renderBreadcrumb();
                        }
                    }))();
                }
                if($('#TG_Sessions_View').length) {
                    containerEle = $("#TG_Sessions_View");
                    containerEle.empty();
                }
                this.renderView4Config(containerEle, self.model,
                    this.getSessionsTabViewConfig(self.ddData.endpointNames, self.ddData.external), null, null, null,
                    function() {
                        self.renderBreadcrumb();
                        if(self.ddData.showEndpointSelection) {
                            $('#Session_Endpoint, #remote_endpoints').show();
                            if(!$._data($('#Session_Endpoint input')[0], 'events')) {
                                self.subscribeModelChangeEvents(self.model, ctwl.EDIT_ACTION);
                                Knockback.applyBindings(self.model,
                                    document.getElementById('Session_Endpoint'));
                                if(self.ddData.remoteEndpoints)
                                    Knockback.applyBindings(self.model,
                                        document.getElementById('remote_endpoints'));
                                kbValidation.bind(self);
                            }
                        } else {
                            $('#Session_Endpoint, #remote_endpoints').hide();
                        }
                    });
            }
        },
        subscribeModelChangeEvents: function(sessionModel) {
            sessionModel.__kb.view_model.model().on('change:Session_Endpoint',
                function(model, newValue){
                    sessionModel.onEndpointChanged(newValue);
                }
            );
            sessionModel.__kb.view_model.model().on('change:remote_endpoints',
                function(model, newValue){
                    sessionModel.onRemoteEndpointChanged(newValue);
                }
            );
        },
        getSessionsTabViewConfig1: function (names, external) {
                var configRows = [],
                    type = this.ddData.type == 'both' ? 'All' :
                            ((this.ddData.sessionType == 'client') ?
                                        'Client' : 'Server');
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
                    });
                  }
                  configRows.push({
                        columns: [{
                            elementId: 'TG_Sessions_View',
                            view: "SectionView",
                            viewConfig: {
                                rows: [{
                                 columns: [{
                                    elementId: type + "_Sessions",
                                    view: "TGDrillDownGridView",
                                    app: cowc.APP_CONTRAIL_CONTROLLER,
                                    viewPathPrefix: "monitor/security/trafficgroups/ui/js/views/",
                                    viewConfig: {
                                        data: this.curSessionData,
                                        tabid: type + "_Sessions",
                                        title: type + " Sessions",
                                        configTye: 'sessions'
                                    }
                                  }]
                                }]
                            }
                        }]
                   });
                return {
                    elementId: cowu.formatElementId([ctwl.TRAFFIC_GROUPS_SESSION_STATS + '-list']),
                    view: "SectionView",
                    viewConfig: {
                        rows: configRows
                    }
                }
        },
        getSessionsTabViewConfig: function (names, external) {
                var configRows = [],
                    type = this.ddData.type == 'both' ? 'All' :
                            ((this.ddData.sessionType == 'client') ?
                                        'Client' : 'Server');
                if(!$('#TG_Sessions_View').length) {
                    var dataObj = [
                        {value: 'endpoint1', label: names[0], cssClass: 'col-xs-11'}
                    ],
                    cssClassWidth = 'col-xs-6',
                    remoteEndpoints = this.ddData.remoteEndpoints,
                    label = 'Selected Endpoint';
                    if(!remoteEndpoints) {
                       dataObj[0].cssClass = 'col-xs-6';
                       dataObj.push({value: 'endpoint2', label: names[1], cssClass: 'col-xs-6'});
                       cssClassWidth = "col-xs-12",
                       label = 'Select Endpoint';
                    }
                    var configCols = [{
                        elementId: 'Session_Endpoint',
                        view: "FormRadioButtonView",
                        viewConfig: {
                            label: label,
                            class: cssClassWidth + ' iconFontStyle margin-10-0-0',
                            templateId: cowc.TMPL_RADIO_BUTTON_VIEW,
                            path: 'Session_Endpoint',
                            dataBindValue: 'Session_Endpoint',
                            disabled: external ? true : false,
                            elementConfig: {
                                dataObj: dataObj
                            }
                        }
                    }];
                    if(remoteEndpoints) {
                        var endpointData = [];
                        _.each(remoteEndpoints, function(obj) {
                            var external = (obj.externalProject == 'externalProject') ?
                                        ' (External Project)' : '';
                            endpointData.push({
                                id: obj.id + external,
                                text: obj.id + external,
                                html: obj.id + external
                            });
                        });
                        configCols.push({
                            elementId: 'remote_endpoints',
                            view: 'FormDropdownView',
                            viewConfig: {
                                label: 'Remote Endpoint',
                                class: 'col-xs-6 select2Noborder margin-10-0-0',
                                path: 'remote_endpoints',
                                dataBindValue: 'remote_endpoints',
                                elementConfig: {
                                    defaultValue: endpointData[0].text,
                                    defaultValueId: 0,
                                    dropdownAutoWidth: true,
                                    width: 'auto',
                                    data: endpointData,
                                    escapeMarkup: function(markup) {
                                        return markup;
                                    },
                                    templateResult: function(data) {
                                        return data.html;
                                    },
                                    templateSelection: function(data) {
                                        return data.text;
                                    }
                                }
                            }
                        });
                    }
                    configRows.push({
                        columns: configCols
                    });
                  }
                  configRows.push({
                        columns: [{
                            elementId: 'TG_Sessions_View',
                            view: "SectionView",
                            viewConfig: {
                                rows: [{
                                 columns: [{
                                    elementId: type + "_Sessions",
                                    view: "TGDrillDownGridView",
                                    app: cowc.APP_CONTRAIL_CONTROLLER,
                                    viewPathPrefix: "monitor/security/trafficgroups/ui/js/views/",
                                    viewConfig: {
                                        data: this.curSessionData,
                                        tabid: type + "_Sessions",
                                        title: type + " Sessions",
                                        configTye: 'sessions'
                                    }
                                  }]
                                }]
                            }
                        }]
                   });
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
                items = self.ddData.breadcrumb.slice(0);
                if(self.ddData.selectedEndpoint == 'endpoint2') {
                    items[1] = items[1].slice(0).reverse();
                }
                breadCrumbTmpl = contrail.getTemplate4Id('breadcrumb-template');
            $('#traffic-groups-radial-chart').prepend(breadCrumbTmpl({
                items : items,
                breadcrumbId : 'TGsessionsBreadcrumb'
            }));
            if(self.ddData.level > 1) {
                var endpointEle =  $('#TGsessionsBreadcrumb li')[1],
                    selectedEndpoint = $(endpointEle).find('a div')[0];
                $(selectedEndpoint).addClass('selected');
            }
            $('#TGsessionsBreadcrumb li:last').addClass('active');
            $('#TGsessionsBreadcrumb li a').on('click', function(e) {
                e.preventDefault();
                var curIndex = $(e.target).parents('li').index();
                if(self.ddData.level != curIndex) {
                    if(curIndex == 0) {
                    self.parentRender();
                    } else {
                        self.ddData.breadcrumb = self.ddData.breadcrumb.slice(0, curIndex+1);
                        self.ddData.where = self.ddData.where.slice(0, curIndex+1);
                        self.ddData.level = curIndex;
                        if(self.ddData.onBreadcrumbClick) {
                            self.ddData = self.ddData.onBreadcrumbClick(self.ddData);
                        }
                        self.drillDown();
                    }
                }
            });
        },
        drillDown: function() {
            $('#tg_settings_container, #filterByTagNameSec').hide();
            $('#traffic-groups-link-info').addClass('noSettings');
            var parentEle = $('#TG_Sessions_View').length ?
                $('#TG_Sessions_View') : $('#traffic-groups-radial-chart');
                parentEle.html('<h4 class="noStatsMsg">Loading...</h4>');
            $('#traffic-groups-legend-info').addClass('hidden');
            $('.tgChartLegend, .tgCirclesLegend').hide();
            var ddData = this.ddData,
                self = this,
                level = ddData.level,
                curLevelObj = ddData.levels[level-1],
                selectFields = ddData.commonFields.
                    concat(curLevelObj.select_fields);

            var commomWhere = ddData.commonWhere(ddData, level),
                whereClause = commomWhere.where,
                filter = commomWhere.filter;
            var addWhere = [];
            _.each(ddData.where, function(values) {
                _.each(values, function(value) {
                    addWhere.push(value);
                });
            });
            whereClause = whereClause.concat(addWhere);
            var reqObj = {
                selectFields : selectFields,
                whereClause : whereClause,
                filter: filter,
                type: ddData.type,
                level : level,
                sessionType: ddData.sessionType,
                callback : self.callRender,
                view : self
            };
            if(ddData.updateReqObj) {
                reqObj = ddData.updateReqObj(ddData, reqObj);
            }
            ddData.getData(reqObj);
        },
        callRender: function(resObj) {
            resObj.view.ddData.parseData(resObj);
            resObj.view.render(resObj.view.el);
            $('#traffic-groups-legend-info').removeClass('hidden');
        }
    });
    return TGDrillDownView;
});
