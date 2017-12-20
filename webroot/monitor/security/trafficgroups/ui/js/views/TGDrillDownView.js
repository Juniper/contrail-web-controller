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
                if($('#TG_Sessions_View').length) {
                    containerEle = $("#TG_Sessions_View");
                    containerEle.empty();
                }
                this.renderView4Config(containerEle, null,
                    this.getSessionsTabViewConfig(self.ddData.endpointNames, self.ddData.external),
                    null, null, null, function() {
                        self.renderBreadcrumb();
                    });
            }
        },
        getSessionsTabViewConfig: function (names, external) {
                var configRows = [],
                    type = this.ddData.type == 'both' ? 'All' :
                            ((this.ddData.sessionType == 'client') ?
                                        'Client' : 'Server');
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
                endpoints = [],
                items = self.ddData.breadcrumb.slice(0);
                if(self.ddData.selectedEndpoint == 'endpoint2') {
                    items[0] = items[0].slice(0).reverse();
                }
                breadCrumbTmpl = contrail.getTemplate4Id('breadcrumb-template');
            $('#tgBackBtn').remove();
            $('#traffic-groups-radial-chart').prepend(breadCrumbTmpl({
                items : items,
                breadcrumbId : 'TGsessionsBreadcrumb',
                backBtnId : 'tgBackBtn',
                showBackBtn: true
            }));
            var breadcrumbEndpts = self.ddData.breadcrumb[0],
                endpointSeperator = '<i class="fa fa-long-arrow-right tgSeperator"></i>';
            if(self.ddData.remoteEndpoints) {
                _.each(self.ddData.remoteEndpoints, function(obj) {
                    var external = (obj.externalProject == 'externalProject') ?
                                ' (External Project)' : '';
                    endpoints.push({
                        id: obj.id + external,
                        text: obj.id + external,
                        html: obj.id + external
                    });
                });
            } else {
                endpoints.push({
                    'id': 'endpoint1',
                    'text': breadcrumbEndpts[0] + endpointSeperator + breadcrumbEndpts[1]
                });
                if(breadcrumbEndpts[1] != 'External' && breadcrumbEndpts[1] != 'externalProject'
                   && breadcrumbEndpts[1] != breadcrumbEndpts[0]) {
                    endpoints.push({
                        'id': 'endpoint2',
                        'text': breadcrumbEndpts[1] + endpointSeperator + breadcrumbEndpts[0]
                    });
                }
            }
            if(self.ddData.remoteEndpoints)
                $('#TGsessionsBreadcrumb li:eq(0)')
                    .prepend('<span>'+breadcrumbEndpts[0]+endpointSeperator+'</span>')
            $('#TGsessionsBreadcrumb li:eq(0) a').select2({
                dataTextField:"text",
                dataValueField:"id",
                dropdownAutoWidth: true,
                minimumResultsForSearch: 5,
                escapeMarkup: function(markup) {return markup;},
                templateResult: function(data) {return data.html;},
                templateSelection: function(data) {return data.text;},
                width: 'auto',
                data: endpoints
            }).on("change",function(endpoint) {
                if(self.ddData.remoteEndpoints && self.ddData.onRemoteEndpointChanged) {
                    self.ddData = self.ddData.onRemoteEndpointChanged(
                                        self.ddData, endpoint.added.id);
                }
                self.ddData.selectedEndpoint = endpoint.added.id;
                self.onbreacrumbChange(0);
            });
            $('#TGsessionsBreadcrumb li:eq(0)').addClass('select2Noborder');
            $("#TGsessionsBreadcrumb li:eq(0) a").select2("val", self.ddData.selectedEndpoint);
            $('#TGsessionsBreadcrumb li:last').addClass('active');
            $('#TGsessionsBreadcrumb li a').on('click', function(e) {
                e.preventDefault();
                var curIndex = $(e.target).parents('li').index();
                if(self.ddData.level != curIndex) {
                    self.onbreacrumbChange(curIndex);
                }
            });
            $('#tgBackBtn a').on('click', function(e) {
                e.preventDefault();
                self.parentRender();
            });
        },
        onbreacrumbChange: function(curIndex) {
            this.ddData.level = curIndex;
            if(this.ddData.onBreadcrumbClick) {
                this.ddData = this.ddData.onBreadcrumbClick(this.ddData);
            }
            this.ddData.breadcrumb = this.ddData.breadcrumb.slice(0, this.ddData.level+1);
            this.ddData.where = this.ddData.where.slice(0, this.ddData.level);
            this.renderBreadcrumb();
            this.drillDown();
        },
        drillDown: function() {
            $('#tg_settings_view, #tg_settings_sec_edit, #filterByTagNameSec').hide();
            $('#tg_selected_tags').removeClass('hidden');
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
