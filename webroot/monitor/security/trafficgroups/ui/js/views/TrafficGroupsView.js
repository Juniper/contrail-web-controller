/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'lodashv4', 'contrail-view',
         'contrail-charts-view', 'contrail-list-model',
         'monitor/security/trafficgroups/ui/js/views/TrafficGroupsSettingsView',
         'monitor/security/trafficgroups/ui/js/models/TrafficGroupsSettingsModel',
         'monitor/security/trafficgroups/ui/js/models/TrafficGroupsFilterModel',
         'monitor/security/trafficgroups/ui/js/views/TrafficGroupsHelpers',
         'monitor/security/trafficgroups/ui/js/views/TrafficGroupsSubViews',
         'monitor/security/trafficgroups/ui/js/views/TrafficGroupsEPSTabsView',
         "core-basedir/js/views/ContainerSettingsView"],
        function(_, ContrailView, ContrailChartsView,
                ContrailListModel, settingsView, settingsModel, filterModel,
                TgHelpersView, TgSubViews, EPSTabsView, ContainerSettings) {
            var tgView,
                tgHelpers = new TgHelpersView(),
                TrafficGroupsView = ContrailView.extend({
                tagTypeList: {
                    'app': [],
                    'tier': [],
                    'deployment': [],
                    'site': []
                },
                clientData: [],
                serverData: [],
                showOtherProjectTraffic: false,
                combineEmptyTags: false,
                matchArcsColorByCategory: false,
                enableSessionDrilldown: true,
                // Provide colours list for top level arcs
                topLevelArcColors: cowc['TRAFFIC_GROUP_COLOR_LEVEL1'].slice(0,1),
                filterdData: null,
                resetTrafficStats: function(e) {
                    e.preventDefault();
                    tgView.renderTrafficChart();
                },
                showSessionsInfo: function() {
                    require(['monitor/security/trafficgroups/ui/js/views/TrafficGroupsEPSTabsView'], function(EPSTabsView) {
                        var linkInfo = tgHelpers.getLinkInfo(tgView.selectedLinkData, tgView.tgSetObj),
                            linkData = {
                                endpointNames: [linkInfo.srcTags, linkInfo.dstTags],
                                endpointStats: []
                            }
                            epsTabsView = new EPSTabsView();
                        _.each(linkInfo.links, function(link) {
                            var namePath = link.data.currentNode ? link.data.currentNode.names : '',
                                epsData = _.filter(link.data.dataChildren,
                                    function(session) {
                                        return tgHelpers.isRecordMatched(namePath, session, link.data, tgView.tgSetObj);
                                    });
                            linkData.endpointStats.push(epsData);
                        });
                        epsTabsView.render(linkData);
                    });
                },
                showLinkSessions: function(e, option) {
                    var obj = {
                       linkData : tgView.selectedLinkData,
                       renderFn :  tgView.render.bind(tgView),
                       tgSetObj : tgView.tgSetObj,
                       option : option
                    };
                    if(option == 'policy') {
                        var ele = $(e.currentTarget);
                        obj.policyObj = {
                            fqn: ele.attr('data-policyFQN'),
                            name: ele.find('.ruleName').text(),
                            uuid: ele.attr('data-ruleId')
                        };
                    }
                    $('#traffic-groups-radial-chart').empty();
                    var linkDDView = new TgSubViews.linkDrillDownView();
                    linkDDView.render(obj);
                },
                showArcSessions: function(e, option) {
                    var obj = {
                       arcData : tgView.selectedArcData,
                       renderFn :  tgView.render.bind(tgView),
                       tgSetObj : tgView.tgSetObj,
                       showOtherProjectTraffic: tgView.showOtherProjectTraffic,
                       option : option
                    };
                    if(option == 'policy') {
                        var ele = $(e.currentTarget);
                        obj.policyObj = {
                            fqn: ele.attr('data-policyFQN'),
                            name: ele.find('.ruleName').text(),
                            uuid: ele.attr('data-ruleId')
                        };
                    }
                    $('#traffic-groups-radial-chart').empty();
                    var arcDDView = new TgSubViews.arcDrillDownView();
                    arcDDView.render(obj);
                },
                getSessionData: function(childData, namePath, data) {
                    var sessionData = _.chain(childData)
                    .filter(function (val, idx) {
                        //var namePath = _.result(endpointData, '0.data.currentNode.names');
                        return tgHelpers.isRecordMatched(namePath, val, data, tgView.tgSetObj);
                    })
                    .groupBy("eps.__key")
                    .map(function (objs, key) {
                        var uuid;
                        if (key != null) {
                            try {
                                uuid = key.split(':').slice(-1)[0];
                            } catch(e) {
                                uuid = '-'
                            }
                        }
                        var clientObjs = _.filter(objs, function(obj) {
                            return obj.isClient; }),
                            serverObjs = _.filter(objs, function(obj) {
                            return obj.isServer; });
                        return {
                            'eps.__key': uuid,
                            'session_responded_active': _.sumBy(serverObjs, 'MAX(eps.server.active)'),
                            'session_initiated_active': _.sumBy(clientObjs, 'MAX(eps.client.active)'),
                            'session_responded_min_active': _.sumBy(serverObjs, 'MIN(eps.server.active)'),
                            'session_initiated_min_active': _.sumBy(clientObjs, 'MIN(eps.client.active)'),
                            'session_responded_max_active': _.sumBy(serverObjs, 'MAX(eps.server.active)'),
                            'session_initiated_max_active': _.sumBy(clientObjs, 'MAX(eps.client.active)'),
                            'session_responded_deleted': _.sumBy(serverObjs, 'SUM(eps.server.deleted)'),
                            'session_initiated_deleted': _.sumBy(clientObjs, 'SUM(eps.client.deleted)'),
                            'session_initiated_in_bytes': _.sumBy(clientObjs, 'SUM(eps.traffic.in_bytes)'),
                            'session_responded_in_bytes': _.sumBy(serverObjs, 'SUM(eps.traffic.in_bytes)'),
                            'session_initiated_out_bytes': _.sumBy(clientObjs, 'SUM(eps.traffic.out_bytes)'),
                            'session_responded_out_bytes': _.sumBy(serverObjs, 'SUM(eps.traffic.out_bytes)'),
                            'session_responded': _.sumBy(serverObjs, 'SUM(eps.server.added)'),
                            'session_initiated': _.sumBy(clientObjs, 'SUM(eps.client.added)')
                        }
                    }).value();
                    return sessionData;
                },
                showLinkInfo: function(d,el,e, option) {
                    tgView.selectedLinkData = d.link;
                    var children = _.result(d.link, '0.data.dataChildren'),
                        appList = [],
                        matchedRuleUUIDs = [],
                        srcNodeData = _.filter(d.link, function (val, idx){
                            return _.result(val, 'data.type') == 'src';
                        }),
                        dstNodeData = _.filter(d.link, function (val, idx){
                            return _.result(val, 'data.type') == 'dst';
                        }),
                        srcId = tgHelpers.getFormatedName(_.result(srcNodeData,
                            '0.data.currentNode.displayLabels'), tgView.tgSetObj),
                        dstId = tgHelpers.getFormatedName(_.result(dstNodeData,
                            '0.data.currentNode.displayLabels'), tgView.tgSetObj),
                        namePath = _.result(srcNodeData, '0.data.currentNode.names'),
                        childData = _.result(d, 'link.0.data.dataChildren', []),
                        srcSessionObjArr = tgView.getSessionData(childData, namePath, d.link[0].data),
                        dstSessionObjArr, dstSessionObj;
                    //If it is intralink no need to calculate endpoint2 sessions
                    if (srcId != dstId) {
                        namePath = _.result(dstNodeData, '0.data.currentNode.names');
                        dstSessionObjArr = tgView.getSessionData(childData, namePath, d.link[0].data);
                        dstSessionObj = _.groupBy(dstSessionObjArr, 'eps.__key');
                    }
                    var srcSessionObj = _.groupBy(srcSessionObjArr, 'eps.__key');

                    // Matched Rules only
                    _.each(d.link, function(link) {
                        ruleKeys = _.uniq(_.map(link['data']['dataChildren'], 'eps.__key'));
                        $.each(ruleKeys, function (idx, key) {
                            if (key != null) {
                                var uuid = key.split(':').pop();
                                matchedRuleUUIDs.push(uuid);
                            }
                         });
                    });
                    matchedRuleUUIDs = _.uniq(matchedRuleUUIDs);

                    appList = _.map(children, 'app_fqn');
                    appList.concat(_.map(children, 'eps.traffic.remote_app_id_fqn'));
                    appList.push('all');
                    appList = _.uniq(appList);
                    var obj = {
                        app: appList[0],
                        d: d,
                        appList: appList,
                        srcId: srcId,
                        dstId: dstId,
                        srcSessionObj: srcSessionObj,
                        dstSessionObj: dstSessionObj,
                        option: 'linkInfo',
                        matchedRuleUUIDs: matchedRuleUUIDs
                    };
                    tgView.showTGSidePanel(obj, option);
                },
                renderPolicyRuleDetails: function(resObj) {
                    var ruleUUIDs = resObj.ruleUUIDs,
                        policyContainer = $('.trafficGroups_sidePanel #tg_policy_rules');
                     if (ruleUUIDs.length > 0) {
                        var listModelConfig = {
                            remote: {
                                ajaxConfig: {
                                    url: ctwc.URL_GET_CONFIG_DETAILS,
                                    type: "POST",
                                    data: JSON.stringify(
                                        {data: [{type: 'firewall-rules',obj_uuids: ruleUUIDs, fields: ['firewall_policy_back_refs',
                                         'service', 'service_group_refs']}]})
                                },
                                dataParser: function (data) {
                                    var defaultRuleUUIDs = _.keys(cowc.DEFAULT_FIREWALL_RULES);
                                        ruleDetails = _.result(data, '0.firewall-rules', []),
                                        formattedRuleDetails = [];
                                    resObj.ruleDetails = ruleDetails;
                                    resObj.formattedRuleDetails = formattedRuleDetails;
                                    resObj.ruleUUIDs = ruleUUIDs;
                                    var fPolicyRuleObj =
                                        tgHelpers.parseAndSortPolicyDetailObj(resObj);
                                    TrafficGroupsView.ruleMap = fPolicyRuleObj.ruleMap;
                                    data.policyRules = fPolicyRuleObj.formattedRuleDetails;
                                    if(!data.policyRules.length) {
                                        data.rules = ruleUUIDs;
                                    }
                                    var ruleTemplate = contrail.getTemplate4Id('tg-policy-rule-template');
                                    policyContainer.html(ruleTemplate(data));
                                    tgView.policyRenderComplete(resObj, policyContainer);
                                    return ruleDetails;
                                }
                            }
                        }
                        var ruleDetailsModel = new ContrailListModel(listModelConfig);
                    } else {
                        policyContainer.html('No policy details found.');
                        tgView.policyRenderComplete(resObj, policyContainer);
                    }
                },
                renderMatchedRuleDetails: function(resObj) {
                    var resObj = $.extend({}, resObj)
                    resObj.showImplicitRules = true;
                    resObj.showSessionData = true;
                    var ruleUUIDs = resObj.matchedRuleUUIDs,
                        policyContainer = $('.trafficGroups_sidePanel #tg_matched_rules');
                     if (ruleUUIDs.length > 0) {
                        var listModelConfig = {
                            remote: {
                                ajaxConfig: {
                                    url: ctwc.URL_GET_CONFIG_DETAILS,
                                    type: "POST",
                                    data: JSON.stringify(
                                        {data: [{type: 'firewall-rules',obj_uuids: ruleUUIDs, fields: ['firewall_policy_back_refs',
                                         'service', 'service_group_refs']}]})
                                },
                                dataParser: function (data) {
                                    var defaultRuleUUIDs = _.keys(cowc.DEFAULT_FIREWALL_RULES);
                                        ruleDetails = _.result(data, '0.firewall-rules', []),
                                        formattedRuleDetails = [];
                                    resObj.ruleDetails = ruleDetails;
                                    resObj.formattedRuleDetails = formattedRuleDetails;
                                    resObj.ruleUUIDs = ruleUUIDs;
                                    var fPolicyRuleObj =
                                        tgHelpers.parseAndSortPolicyDetailObj(resObj);
                                    TrafficGroupsView.ruleMap = fPolicyRuleObj.ruleMap;
                                    data.policyRules = fPolicyRuleObj.formattedRuleDetails;
                                    if(!data.policyRules.length) {
                                        data.rules = ruleUUIDs;
                                    }
                                    var ruleTemplate = contrail.getTemplate4Id('tg-policy-rule-template');
                                    policyContainer.html(ruleTemplate(data));
                                    tgView.policyRenderComplete(resObj, policyContainer, true);
                                    return ruleDetails;
                                }
                            }
                        }
                        var ruleDetailsModel = new ContrailListModel(listModelConfig);
                    } else {
                        policyContainer.html('No matched rules found.');
                        tgView.policyRenderComplete(resObj, policyContainer);
                    }
                },
                policyRenderComplete: function(obj, selector, policyClick) {
                    var tooltipConfig = {
                        selector: $('.trafficGroups_sidePanel .showMoreInfo'),
                        container:  $('.traffic-groups-view')
                    };
                    cowu.createTooltip(tooltipConfig);
                    if(!obj.data) {
                        $('.allSessionInfo').on('click', tgView.showSessionsInfo);
                    }
                    if(selector && policyClick) {
                        selector.find('.policyRules .policyName')
                          .off('click.policyDrilldown');
                        selector.find('.policyName').on('click.policyDrilldown',
                          function(e) {
                            e.preventDefault();
                            if(obj.data) {
                                tgView.showArcSessions(e, 'policy');
                            } else {
                                tgView.showLinkSessions(e, 'policy');
                            }
                        });
                    }
                },
                renderAppDropdown: function(resObj) {
                    var appList = [];
                    _.each(resObj.appList, function(app) {
                        var appName = app.indexOf('=') > -1 ? app.split('=')[1] :
                                    (app == 'all') ? 'All Apps' : app;
                        appList.push({
                            'id': app,
                            'text': appName
                        });
                    });
                    $('#tg_app_select').prev().removeClass('hidden');
                    $('#tg_app_select').select2({
                        dataTextField:"text",
                        dataValueField:"id",
                        dropdownAutoWidth: true,
                        width: 'auto',
                        dropdownCssClass: 'tg_app_select',
                        data: appList
                    }).on("change",function(appObj) {
                        resObj.app = appObj.added.id,
                        resObj.callback = tgView.renderPolicyRuleDetails;
                        tgHelpers.getPolicyInfoByApp(resObj);
                    });
                    $("#tg_app_select").select2("val", appList[0].id);
                },
                showTGSidePanel: function(resObj, option) {
                    if(resObj.data)
                    this.selectedLink = resObj.data.title;
                    var self = tgView,
                        tmplData =  resObj.data ? resObj.data : resObj,
                        sidePanelTemplate = contrail.getTemplate4Id('tg-sidepanel-template');
                    $('#traffic-groups-link-info').html(sidePanelTemplate(tmplData));
                    if(!resObj.updateData) {
                        $('#traffic-groups-link-info').removeClass('hidden')
                        _.each(self.chartInfo.component.ribbons, function (ribbon) {
                           ribbon.selected = false;
                           ribbon.active = false;
                        });
                        _.each(self.chartInfo.component.arcs, function (arc) {
                           arc.selected = false;
                           arc.active = false;
                        });
                        resObj.d.selected = true;
                        resObj.d.active = true;
                        self.chartInfo.component._render();
                        if(option != 'drill-down') {
                            $('#traffic-groups-radial-chart').addClass('addAnimation');
                            if($('#traffic-groups-radial-chart').hasClass('showTgSidePanel')) {
                               $('.trafficGroups_sidePanel').
                                    removeClass('animateLinkInfo');
                            } else {
                                $('.trafficGroups_sidePanel').
                                    addClass('animateLinkInfo');
                                $('#traffic-groups-radial-chart')
                                .addClass('showTgSidePanel');
                            }
                        } else {
                            $('#traffic-groups-radial-chart').removeClass('addAnimation');
                        }
                        $('#traffic-groups-radial-chart')
                                      .off('click.showSidePanelEvent');
                        $('#traffic-groups-radial-chart')
                         .on('click.showSidePanelEvent', function(ev) {
                            if($('#'+self.chartInfo.component.id).length &&  $(ev.target)
                                .parents('#'+self.chartInfo.component.id).length == 0) {
                                _.each(self.chartInfo.component.ribbons, function (ribbon) {
                                   ribbon.selected = false;
                                   ribbon.active = false;
                                });
                                _.each(self.chartInfo.component.arcs, function (arc) {
                                   arc.selected = false;
                                   arc.active = false;
                                });
                                if(resObj.option != 'drill-down') {
                                    $('#traffic-groups-radial-chart')
                                            .removeClass('showTgSidePanel');
                                    $('#traffic-groups-link-info').addClass('hidden');
                                    self.chartInfo.component._render();
                                }
                            }
                        });
                    }
                    if(resObj.data) {
                        self.renderView4Config($('#arcTabsSection'), tmplData,
                            tgHelpers.getTabsViewConfig('arcInfoSection', ['vmi-details-tab', 'matched-rules-tab']),
                            null, null, null, function() {
                                if(resObj.appList) {
                                    resObj.app = resObj.appList[0];
                                    resObj.callback = tgView.renderPolicyRuleDetails;
                                    resObj.callback2 = tgView.renderMatchedRuleDetails;
                                    tgHelpers.getPolicyInfoByApp(resObj);
                                    self.renderAppDropdown(resObj);
                                }
                        });
                    } else {
                        self.renderView4Config($('#linkTabsSection'), tmplData,
                            tgHelpers.getTabsViewConfig('linkInfoSection', ['matched-rules-tab']), null, null, null,
                        function() {
                            if(resObj.appList) {
                                resObj.app = resObj.appList[0];
                                resObj.callback = tgView.renderPolicyRuleDetails;
                                resObj.callback2 = tgView.renderMatchedRuleDetails;
                                tgHelpers.getPolicyInfoByApp(resObj);
                                self.renderAppDropdown(resObj);
                            }
                        });
                    }
                },
                hideTgSidePanel: function() {
                    $('#traffic-groups-radial-chart')
                            .removeClass('showTgSidePanel');
                    $('#traffic-groups-link-info').addClass('hidden');
                },
                showEndPointStatsInGrid: function () {
                    var self = this,
                        data = tgHelpers.handleUntaggedEndpoints(self.filterdData);
                    $('#traffic-groups-link-info').addClass('hidden');
                    self.showHideLegendInfo(data);
                    self.renderView4Config($('#traffic-groups-grid-view'), null, {
                        elementId: 'traffic-groups-grid-view',
                        view: "TrafficGroupsEPSGridView",
                        viewPathPrefix:
                        "monitor/security/trafficgroups/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            data: data,
                            title: 'Endpoint Statistics',
                            elementId: 'traffic-groups-grid-view'
                        }
                    })
                },
                updateChart: function(cfg) {
                    var self = this,
                        extendConfig = {}
                    if(_.isEmpty(cfg)) {
                        cfg = {};
                    }
                    if(cfg['levels']) {
                        extendConfig['drillDownLevel'] = cfg['levels'];
                    } else if(cfg) {
                        extendConfig = cfg;
                    }
                    TrafficGroupsView.colorMap = {};
                    var config = {
                        id: 'chartBox',
                        //levels : levels,
                        components: [{
                            id: 'dendrogram-chart-id',
                            type: 'RadialDendrogram',
                            config: $.extend({},{
                                arcWidth: [11,12],
                                showArcLabels: true,
                                parentSeparationShrinkFactor: 0.02,
                                arcLabelLetterWidth: 6,
                                labelDuration:0,
                                labelFlow: 'along-arc',
                                linkCssClasses: ['implicitDeny', 'implicitAllow', 'notEvaluated'],
                                arcLabelXOffset: 0,
                                arcLabelYOffset: [-12,-6],
                                showLinkDirection: true,
                                getLinkDirection: self.getLinkDirection,
                                formatDisplayLabel: tgHelpers.formatLabel,
                                colorScale: function (item) {
                                    var colorList = cowc['TRAFFIC_GROUP_COLOR_LEVEL'+item.level];
                                    if(self.matchArcsColorByCategory) {
                                        colorList = cowc['TRAFFIC_GROUP_COLOR_LEVEL1']
                                            .concat(cowc['TRAFFIC_GROUP_COLOR_LEVEL2']);
                                    }
                                    if(item.level == 1 && self.topLevelArcColors
                                        && tgHelpers.getCategorizationObj(tgView.tgSetObj).length > 1) {
                                        colorList = self.topLevelArcColors;
                                    }
                                    var unassignedColors = _.difference(colorList, _.values(TrafficGroupsView.colorMap[item.level])),
                                        itemName = item.displayLabels[item.level-1],
                                        extraColors = TrafficGroupsView.colorArray;
                                    if(unassignedColors.length == 0) {
                                        if(!extraColors[item.level] || extraColors[item.level].length == 0) {
                                            extraColors[item.level] = colorList.slice(0);
                                        }
                                        unassignedColors = extraColors[item.level];
                                    }
                                    if(self.matchArcsColorByCategory && item.level > 1) {
                                        var upperLevelColors = TrafficGroupsView.colorMap[item.level-1];
                                        return upperLevelColors[item.displayLabels[0]];
                                    }
                                    if ( TrafficGroupsView.colorMap[item.level] == null) {
                                        TrafficGroupsView.colorMap[item.level] = {};
                                        TrafficGroupsView.colorMap[item.level][itemName] = unassignedColors.pop();
                                    } else if (TrafficGroupsView.colorMap[item.level][itemName] == null) {
                                        TrafficGroupsView.colorMap[item.level][itemName] = unassignedColors.pop();
                                    }
                                    return TrafficGroupsView.colorMap[item.level][itemName];
                                },
                                showLinkInfo: self.showLinkInfo,
                                drillDownLevel: tgHelpers.getCategorizationObj(tgView.tgSetObj).length,
                                expandLevels: 'disable',
                                hierarchyConfig: {
                                    parse: function(d) {
                                        var project = contrail.getCookie(cowc.COOKIE_PROJECT);
                                        return tgHelpers.parseHierarchyConfig(d, tgView.tgSetObj, project, self.showOtherProjectTraffic)
                                    }
                                }
                            },extendConfig)
                        },{
                            id: 'tooltip-id',
                            type: 'Tooltip',
                            config: {
                                formatter: function formatter(data) {
                                    if(data.level) {
                                        var arcData = tgHelpers.getArcData(data, tgView.tgSetObj),
                                            content = { title: arcData.title, items: [] };
                                        content.title += '<hr/>';
                                        content.title = content.title.replace(/<Untagged>/g, '&lt;untagged>')
                                        if(data.arcType == 'external' || data.arcType == 'externalProject') {
                                            content.items.push({
                                                label: 'Traffic In',
                                                value:  '-'
                                            }, {
                                                label: 'Traffic Out',
                                                value: '-'
                                            }, {
                                                label: ctwl.VMI_LABEL,
                                                value: '-'
                                            });
                                        } else {
                                            var matchedChilds = _.filter(arcData.dataChildren,function(currSession) {
                                                return tgHelpers.isRecordMatched(data.namePath, currSession, data, tgView.tgSetObj);
                                            });
                                            content.items.push({
                                                label: 'Traffic In',
                                                value:  formatBytes(_.sumBy(matchedChilds, function(currSession) {
                                                        return _.result(currSession,'SUM(eps.traffic.in_bytes)',0);
                                                }))
                                            }, {
                                                label: 'Traffic Out',
                                                value: formatBytes(_.sumBy(matchedChilds, function(currSession) {
                                                        return _.result(currSession,'SUM(eps.traffic.out_bytes)',0);
                                                }))
                                            }, {
                                                label: ctwl.VMI_LABEL,
                                                value: _.uniqBy(matchedChilds, 'name').length
                                            });
                                        }
                                    } else {
                                        var linkInfo = tgHelpers.getLinkInfo(data.link, tgView.tgSetObj),
                                            trafficLinkTooltipTmpl = contrail.getTemplate4Id('traffic-link-tooltip-template'),
                                            links = linkInfo.links,
                                            content = { title : '', items: [] },
                                            linkData = {
                                                src: linkInfo.srcTags,
                                                dst: linkInfo.dstTags
                                            };
                                        linkData.items = [];
                                        _.each(links, function(link) {
                                            var namePath = link.data.currentNode ? link.data.currentNode.names : '',
                                                trafficData = {
                                                trafficIn: formatBytes(_.sumBy(link.data.dataChildren,
                                                    function(bytes) {
                                                        if(tgHelpers.isRecordMatched(namePath, bytes, link.data, tgView.tgSetObj))
                                                            return _.result(bytes,'SUM(eps.traffic.in_bytes)',0);
                                                         else
                                                            return 0;

                                                    })),
                                                trafficOut: formatBytes(_.sumBy(link.data.dataChildren,
                                                    function(bytes) {
                                                        if(tgHelpers.isRecordMatched(namePath, bytes, link.data, tgView.tgSetObj))
                                                            return _.result(bytes,'SUM(eps.traffic.out_bytes)',0);
                                                        else
                                                            return 0
                                                    }))
                                            };
                                            linkData.items.push({
                                                name: tgHelpers.getFormatedName(
                                                    _.result(link, 'data.currentNode.displayLabels'),  tgView.tgSetObj),
                                                trafficIn: trafficData.trafficIn,
                                                trafficOut: trafficData.trafficOut
                                            });
                                            var linkTooltipHtml = trafficLinkTooltipTmpl(linkData);
                                            content.title = linkTooltipHtml;
                                        });
                                    }
                                    return content;
                                }
                            }
                        }]
                    }
                    $('#traffic-groups-radial-chart')
                    .removeClass('showTgSidePanel');
                    $('#traffic-groups-link-info').addClass('hidden');
                    self.chartInfo = self.viewInst.getChartViewInfo(config,
                                "dendrogram-chart-id", self.addtionalEvents());
                    if(cfg['freshData']) {
                        self.viewInst.model.onAllRequestsComplete.subscribe(function() {
                           var data = self.clientData.concat(self.serverData);
                           data = self.updateRemoteIds(data);
                           self.viewInst.model.setData(data);
                           self.trafficData = JSON.parse(JSON.stringify(data));
                           self.filterdData = tgHelpers.filterDataByEndpoints(tgView.trafficData, tgView.tgSetObj);
                           self.prepareTagList();
                           self.chartRender();
                        });
                    } else {
                        self.chartRender();
                    }
                    self.updateTGFilterSec();
                },
                chartRender: function() {
                    var data = this.filterdData ? JSON.parse(JSON.stringify(this.filterdData))
                             : this.viewInst.model.getItems();
                    data = tgHelpers.handleUntaggedEndpoints(data);
                    this.showHideLegendInfo(data);
                    if($('#traffic-groups-legend-info:visible').length) {
                        $('#traffic-groups-radial-chart #chartBox').removeClass('noLegend');
                    } else {
                        $('#traffic-groups-radial-chart #chartBox').addClass('noLegend');
                    }
                    if($('#traffic-groups-radial-chart:visible').length) {
                        if(data && data.length == 0) {
                            $('#traffic-groups-radial-chart').empty();
                            var noData = "<h4 class='noStatsMsg'>"
                                + ctwl.TRAFFIC_GROUPS_NO_DATA + "</h4>"
                            $('#traffic-groups-radial-chart').html(noData);
                        } else {
                            this.viewInst.render(data, this.chartInfo.chartView);
                        }
                    } else {
                        this.showEndPointStatsInGrid();
                    }
                    $('#traffic-groups-options').removeClass('hidden');
                },
                showHideLegendInfo: function(data) {
                    var selectors = '#traffic-groups-legend-info,'+
                                ' #tg_settings_container, #filterByTagNameSec';
                     if(data && data.length) {
                        $(selectors).removeClass('hidden');
                     } else {
                        $(selectors).addClass('hidden');
                     }
                },
                addtionalEvents: function() {
                    return [{
                            event: 'click',
                            selector: 'node',
                            handler: this._onClickNode,
                            handlerName: '_onClickNode'
                        },
                        {
                            event: 'dblclick',
                            selector: 'node',
                            handler: this._onDoubleClickNode,
                            handlerName: '_onDoubleClickNode'
                        },
                        {
                            event: 'dblclick',
                            selector: 'link',
                            handler: this._onDoubleClickLink,
                            handlerName: '_onDoubleClickLink'
                        },
                        {
                            event: 'click',
                            selector: 'link',
                            handler: this._onClickLink,
                            handlerName: '_onClickLink'
                        },
                        {
                            event: 'mousemove',
                            selector: 'link',
                            handler: this._onMousemoveLink,
                            handlerName: '_onMousemoveLink'
                        },
                        {
                            event: 'mouseout',
                            selector: 'link',
                            handler: this._onMouseoutLink,
                            handlerName: '_onMouseoutLink'
                        },
                        {
                            event: 'mousemove',
                            selector: 'node',
                            handler: this._onMousemove
                        },
                        {
                            event: 'mouseout',
                            selector: 'node',
                            handler: this._onMouseout
                        }
                    ];
                },
                _onClickNode: function(d, el ,e) {
                  if(d.data && d.data.arcType != "externalProject"
                            && d.data.arcType != 'external') {
                    tgView.selectedArcData = d;
                    setTimeout(function() {
                        if(tgView.arcClicks) {
                            tgView.arcClicks--;
                            if(tgView.arcClicks == 1) {
                                $('#traffic-groups-radial-chart')
                                            .addClass('showTgSidePanel');
                                tgView.showArcSessions(e);
                            }
                        }
                        var chartScope = tgView.chartInfo.component,
                            matchedRuleUUIDs = [];
                        if(chartScope.clearArcTootltip) {
                          clearTimeout(chartScope.clearArcTootltip);
                        }
                        var arcData = tgHelpers.getArcData(d.data, tgView.tgSetObj),
                            srcId = tgHelpers.getFormatedName(d.data.displayLabels, tgView.tgSetObj),
                            childData = _.filter(arcData.dataChildren, function(children) {
                                return tgHelpers.isRecordMatched(d.data.namePath, children, d.data, tgView.tgSetObj);
                            });
                            srcSessionObjArr = tgView.getSessionData(childData, d.data.namePath, d.data),
                            srcSessionObj = _.groupBy(srcSessionObjArr, 'eps.__key');
                        // Matched Rules only
                        var ruleKeys = _.uniq(_.map(childData, 'eps.__key'));
                        $.each(ruleKeys, function (idx, key) {
                            if (key != null) {
                                var uuid = key.split(':').pop();
                                matchedRuleUUIDs.push(uuid);
                            }
                        });
                        matchedRuleUUIDs = _.uniq(matchedRuleUUIDs);
                        var appList = _.map(childData, 'app_fqn');
                        appList.push('all');
                        appList = _.uniq(appList);
                        var reqObj = {
                            callback : tgView.renderVMIDetails,
                            vmiObj: {},
                            app: appList[0],
                            srcId: srcId,
                            dstId: srcId,
                            srcSessionObj: srcSessionObj,
                            dstSessionObj: '',
                            matchedRuleUUIDs: matchedRuleUUIDs,
                            appList: appList,
                            data : {
                                data : 'nodata',
                                title : arcData.title,
                                vmiLabel: ctwl.VMI_LABEL,
                                vmiCount: ''
                            },
                            d : d
                        };
                        if(childData.length) {
                            var vmNames = [];
                            var data = _.groupBy(childData, 'name_fqn'),
                                vmiObj = {};
                            reqObj.data.data = [];
                            _.each(data, function(session, key) {
                                vmNames.push(key);
                                var inBytes = formatBytes(_.sumBy(session, function(bytes) {
                                        return _.result(bytes,'SUM(eps.traffic.in_bytes)', '-');
                                    })),
                                    outBytes = formatBytes(_.sumBy(session,function(bytes) {
                                        return _.result(bytes,'SUM(eps.traffic.out_bytes)', '-');
                                    })),
                                    vn = tgHelpers.formatVN(session[0]['vn']);
                                reqObj.data.data.push({
                                    uuid: tgHelpers.getFormattedValue(key),
                                    sampledIn : inBytes,
                                    sampledOut : outBytes,
                                    vn: vn ? vn : '-',
                                    vrouter: '-',
                                    name: '-'
                                });
                            });
                            reqObj.vmNames = vmNames;
                            tgHelpers.queryUveVmis(reqObj, tgView.tgSetObj);
                        } else {
                            tgView.showTGSidePanel(reqObj);
                        }
                    }, 300);
                  }
                },
                renderVMIDetails: function(resObj) {
                    var data = resObj.vmiData,
                        vmiDetails = resObj.data.data;
                    if(data.length) {
                        resObj.data.vmiCount = data.length;
                        $.each(data, function (idx, obj) {
                            var vmiObj = _.result(obj, 'value.UveVMInterfaceAgent', {}),
                                vrouter = '-',
                                curVMObj = _.find(resObj.vmData, function(vmObj) {
                                    return vmObj.name == vmiObj.vm_uuid
                                }),
                                vmiDetOb = _.find(vmiDetails, function(vmDet) {
                                return vmDet.uuid == tgHelpers.getFormattedValue(obj.name)
                            });
                            if(curVMObj) {
                               vrouter = _.result(curVMObj, 'value.UveVirtualMachineAgent.vrouter', '-');
                            }
                            if(vmiDetOb) {
                                vmiDetOb.name = vmiObj.vm_name ? vmiObj.vm_name : '-';
                                vmiDetOb.vrouter = vrouter;
                            }
                        });
                        tgView.showTGSidePanel(resObj);
                    } else {
                        resObj.data.data = 'nodata';
                        tgView.showTGSidePanel(resObj);
                    }
                },
                _onDoubleClickLink: function(d, el ,e) {
                    e.preventDefault();
                    tgView.linkClicks = 2 ;
                },
                _onDoubleClickNode: function(d, el ,e) {
                    e.preventDefault();
                    tgView.arcClicks = 2 ;
                },
                _onClickLink: function(d, el ,e) {
                    tgView.updateTgSettingsView('viewMode');
                    setTimeout(function() {
                        if(tgView.linkClicks) {
                            tgView.linkClicks--;
                            if(tgView.linkClicks == 1) {
                                $('#traffic-groups-radial-chart').removeClass('addAnimation');
                                var chartScope = tgView.chartInfo.component;
                                if(chartScope.config.attributes.showLinkInfo) {
                                    tgView.showLinkInfo(d, el, e, 'drill-down');
                                    if(tgView.enableSessionDrilldown) {
                                        $('#traffic-groups-radial-chart')
                                            .addClass('showTgSidePanel');
                                        tgView.showLinkSessions();
                                    }
                                }
                            }
                        } else
                            tgView.showLinkInfo(d, el, e);
                    }, 300);
                },
                _onMousemoveLink: function(d, el ,e) {
                    var chartScope = tgView.chartInfo.component,
                        [left, top] = chartScope.d3Selection.
                                            mouse(chartScope._container);
                      if(chartScope.clearLinkTooltip) {
                        clearTimeout(chartScope.clearLinkTooltip);
                      }
                      chartScope.clearLinkTooltip = setTimeout(function() {
                        chartScope.actionman.fire('ShowComponent',
                            'tooltip-id', {left,top}, d);
                        if(left > (chartScope._container.offsetWidth / 2)) {
                          $('#tooltip-id').css({'right':0, 'left':'auto'});
                        } else {
                          $('#tooltip-id').css('right','auto');
                        }
                      } , 300);
                },
                _onMouseoutLink: function(d, el ,e) {
                    var chartScope = tgView.chartInfo.component;
                    if(chartScope.clearLinkTooltip) {
                      clearTimeout(chartScope.clearLinkTooltip);
                    }
                    chartScope.actionman.fire('HideComponent', 'tooltip-id');
                },
                _onMousemove: function(d, el ,e) {
                    var chartScope = tgView.chartInfo.component;
                    _.each(chartScope.arcs, function(arc) {
                        arc.active = Boolean(arc.data.namePath && arc.data.namePath.join('-') == e.target.id)
                                        || arc.selected;
                    });
                    chartScope._render();
                },
                _onMouseout: function(d, el ,e) {
                    var chartScope = tgView.chartInfo.component;
                  _.each(chartScope.arcs, function(arc) {
                        arc.active = arc.selected;
                  });
                  chartScope._render();
                },
                getLinkDirection: function(src, dst) {
                    return tgHelpers.getLinkDirection(src, dst, tgView.tgSetObj);
                },
                prepareTagList: function() {
                    var self = this;
                    _.each(self.tagTypeList, function(tagName, tagType, obj) {
                        obj[tagType] = _.compact(_.uniq(_.flatMap(self.trafficData,
                            function(a) {
                                return [a[tagType],a['eps.traffic.remote_' + tagType + '_id']];
                            })));
                    });
                },
                applySelectedFilter: function(modelObj) {
                    var tgSettings = tgHelpers.getTGSettings(tgView.tgSetObj),
                        oldTimeRange = tgSettings.time_range,
                        oldFromTime = tgSettings.from_time,
                        oldToTime = tgSettings.to_time;
                    tgView.tgSetObj = JSON.parse(JSON.stringify(modelObj.attributes));

                    //To retain applied categorization, adding to session storage
                    sessionStorage.TG_CATEGORY = tgView.tgSetObj.group_by_tag_type;
                    sessionStorage.TG_SUBCATEGORY = tgView.tgSetObj.sub_group_by_tag_type;

                    tgView.filterdData = tgHelpers.filterDataByEndpoints(tgView.trafficData, tgView.tgSetObj);
                    var newTGSettings = tgHelpers.getTGSettings(tgView.tgSetObj);
                    sessionStorage.TG_TIME_RANGE = newTGSettings.time_range,
                    sessionStorage.TG_FROM_TIME = newTGSettings.from_time,
                    sessionStorage.TG_TO_TIME = newTGSettings.to_time;
                    if(oldTimeRange != sessionStorage.TG_TIME_RANGE ||
                        ((oldTimeRange == -1  || oldTimeRange == -2) &&
                        (oldFromTime != sessionStorage.TG_FROM_TIME ||
                        oldToTime != sessionStorage.TG_TO_TIME))) {
                        tgView.renderTrafficChart();
                    } else {
                        tgView.updateContainerSettings('', false);
                    }
                },
                removeFilter: function(e) {
                    var curElem = $(e.currentTarget).parent('li').find('div'),
                        tag = curElem.attr('data-tag'),
                        val = curElem.html(),
                        index = curElem.attr('data-index');
                    if(tgView.tgSetObj) {
                        var filterObj = tgView.tgSetObj.endpoints,
                            curFilter = filterObj[index];
                        if(curFilter && curFilter.endpoint) {
                            curFilter = _.filter(curFilter.endpoint
                                        .split(','), function(tagName) {
                                        return tagName != (val + ";" + tag);
                                    });
                            curFilter = curFilter.join(',');
                        }
                        if(curFilter) {
                            filterObj[index] = {
                                endpoint: curFilter
                            };
                        } else {
                            filterObj.splice(index,1);
                        }
                        tgView.applySelectedFilter(tgView.tgSetObj);
                    }
                },
                updateTGFilterSec: function() {
                    $('#filterByTagNameSec .dropdown-menu')
                        .on('click', function(e) {
                            e.stopPropagation();
                    });
                    if(tgView.tgSetObj) {
                        var filterIconEle =  $('#filterByTagNameSec a'),
                            endpoints = _.filter(tgView.tgSetObj.endpoints,
                                            function(obj) {
                                                return obj.endpoint;
                                            });
                        if(endpoints.length) {
                            filterIconEle.find('.filterCount').removeClass('hidden')
                                            .html(endpoints.length);
                        } else {
                            filterIconEle.find('.filterCount').addClass('hidden')
                                            .html('');
                        }
                    }
                },
                showFilterOptions: function() {
                    tgView.settingsView.model = new settingsModel(
                                    tgHelpers.getTGSettings(tgView.tgSetObj));
                    tgView.settingsView.editFilterOptions(tgView.tagTypeList,
                        tgView.applySelectedFilter);
                },
                updateStatsTimeSec: function() {
                    var tgSettings = tgHelpers.getTGSettings(tgView.tgSetObj),
                        fromTime = tgSettings.time_range;
                    if(fromTime == -1 || fromTime == -2) {
                        var toTime = (fromTime == -1) ?
                            tgSettings.to_time : 'now';
                        fromTime = tgSettings.from_time;
                        $(this.el).find('#statsFromOnly').addClass('hidden');
                        $(this.el).find('#statsFromTo').removeClass('hidden')
                        $(this.el).find('#statsFromTo .statsFromTime').text(fromTime);
                        $(this.el).find('#statsFromTo .statsToTime').text(toTime);
                    } else {
                        fromTime = _.find(ctwc.TIMERANGE_DROPDOWN_VALUES,
                            function(timeMap) {
                                return timeMap.id == fromTime;
                        });
                        $(this.el).find('#statsFromOnly').removeClass('hidden')
                            .find('.statsFromTime').text(fromTime.text);
                        $(this.el).find('#statsFromTo').addClass('hidden');
                    }
                },
                updateRemoteIds: function (data) {
                    data = cowu.ifNull(data, []);
                    var tagMap = {}, tagIDMap = {}, tagsResponse = TrafficGroupsView.tagsResponse;
                    var tagRecords = _.result(tagsResponse,'0.tags',[]);
                    tagRecords.forEach(function(val,idx) {
                        var currTag = val['tag'];
                        tagMap[currTag.tag_id] = {
                            name :currTag.name,
                            fqn : currTag.fq_name ? currTag.fq_name.join(':') : ''
                        }
                        tagIDMap[currTag.name] = currTag.tag_id;
                    });
                    $.each(data, function (idx, value) {
                        $.each(['eps.traffic.remote_app_id', 'eps.traffic.remote_deployment_id',
                            'eps.traffic.remote_prefix', 'eps.traffic.remote_site_id',
                            'eps.traffic.remote_tier_id'], function (idx, val) {
                                var remoteFQN = '',
                                    currentTagMap = tagMap[value[val]];
                                if(!_.isEmpty(currentTagMap) && !_.isEmpty(currentTagMap.name)
                                    && value[val] != '0x00000000' && value[val] != '0') {
                                    value[val + '_id'] = value[val];
                                    value[val] = currentTagMap.name;
                                    remoteFQN = currentTagMap.fqn;
                                } else {
                                    value[val] = '';
                                }
                                value[val + '_fqn'] = remoteFQN;
                        });
                        //Strip-off the domain and project form FQN
                        $.each(['app','site','tier','deployment', 'name'],function(idx,tagName) {
                            var currentTagId = tagIDMap[value[tagName]];
                            value[tagName + '_id'] = currentTagId;
                            value[tagName + '_fqn'] = value[tagName];
                            value[tagName] = tgHelpers.getFormattedValue(value[tagName]);
                        });
                    });
                    return data;
                },
                editTgSettings: function() {
                    tgView.hideTgSidePanel();
                    tgView.settingsView.model = new settingsModel(tgHelpers.getTGSettings(tgView.tgSetObj));
                    var options = {
                        tagTypeList: tgView.tagTypeList,
                        callback: tgView.applySelectedFilter,
                        tgView: tgView
                    };
                    tgView.settingsView.editTgSettings(options);
                },
                editTgFilters: function() {
                    tgView.settingsView.model = new settingsModel(tgHelpers.getTGSettings(tgView.tgSetObj));
                    var options = {
                        tagTypeList: tgView.tagTypeList,
                        callback: tgView.applySelectedFilter,
                        tgView: tgView
                    };
                    tgView.settingsView.editTgFilters(options);
                },
                updateTgSettingsView: function(option) {
                    var category = [], subCategory = [];
                    if(option == 'viewMode' || (option && option.currentTarget)) {
                        $('#tg_settings_sec_edit').addClass('hidden');
                        $('#tg_settings_sec_view').removeClass('hidden');
                    }
                    if(option == 'edit') {
                        $('#tg_settings_sec_edit').removeClass('hidden');
                        $('#tg_settings_sec_view').addClass('hidden');
                    }
                    if(option != 'edit') {
                        var sliceByProject = tgHelpers.getSettingValue('sliceByProject'),
                            catObj = tgHelpers.getCategorizationObj(tgView.tgSetObj, true);
                        _.each(catObj[0].split('-'), function(tag) {
                            category.push(_.find(cowc.TRAFFIC_GROUP_TAG_TYPES,
                                function(obj) {
                                return obj.value == tag
                            }).text);
                        });
                        if(catObj[1]) {
                            _.each(catObj[1].split('-'), function(tag) {
                                subCategory.push(_.find(cowc.TRAFFIC_GROUP_TAG_TYPES,
                                    function(obj) {
                                    return obj.value == tag
                                }).text);
                            });
                        } else {
                            subCategory = ["-"];
                        }
                        var tagsSelected = category;
                        if(subCategory[0] != '-') {
                            tagsSelected = tagsSelected.concat(subCategory).join('/');
                        }
                        var projectTxt = '';
                        if(sliceByProject) {
                            projectTxt = tgHelpers.sliceByProjectOnly
                                                ? 'Project' : 'VN (Project)';
                            tagsSelected += ' (' + projectTxt + ')';
                        }
                        if(!$('#tg_selected_tags:visible').length)
                            $('#tg_tags_view').html(tagsSelected);
                        if(sliceByProject)
                            category.push(projectTxt);
                        $('#tgCategory').html(category.join(', '));
                        $('#tgSubCategory').html(subCategory.join(', '));
                    }
                },
                resetChartView: function() {
                   $('#traffic-groups-legend-info').addClass('hidden');
                   $(this.el).find('svg g').empty();
                   $('#traffic-groups-grid-view').empty();
                },
                updateContainerSettings: function(newObj, isFreshData) {
                    var curSettings = localStorage
                        .getItem('container_' + layoutHandler.getURLHashObj().p
                                   + '_settings');
                    if(curSettings) {
                        curSettings = JSON.parse(curSettings);
                        var level = (curSettings.showInnerCircle &&
                            tgHelpers.getCategorizationObj(tgView.tgSetObj).length == 2) ? 2 : 1;
                        curSettings.showLegend ?
                                $('#traffic-groups-legend-info').show()
                                : $('#traffic-groups-legend-info').hide();
                        if(typeof newObj.showLegend != 'undefined') {
                                if($('#traffic-groups-radial-chart svg').length)
                                    this.updateChart({
                                        'levels': level
                                    });
                        }
                        if(typeof newObj.view_type != 'undefined' ||
                         typeof newObj.untaggedEndpoints != 'undefined'
                         || typeof newObj.showInnerCircle != 'undefined'
                         || typeof newObj.sliceByProject != 'undefined' || !newObj) {
                            if(curSettings.view_type == 'grid-stats') {
                                $('#traffic-groups-radial-chart').hide();
                                $('#traffic-groups-grid-view').show();
                                if(isFreshData) {
                                    this.updateChart({
                                        'freshData': isFreshData,
                                        'levels': level
                                    });
                                } else {
                                    this.showEndPointStatsInGrid();
                                }
                            } else {
                                $('#traffic-groups-radial-chart').show();
                                $('#traffic-groups-grid-view').hide();
                                if(!newObj || newObj.view_type || $('#traffic-groups-radial-chart svg').length)
                                this.updateChart({
                                    'freshData': isFreshData,
                                    'levels': level
                                });
                            }
                        }
                    } else {
                        this.updateChart({
                            'freshData': isFreshData
                        });
                    }
                    tgView.updateTgSettingsView('viewMode');
                },
                renderTrafficChart: function(option) {
                    this.resetChartView();
                    var self = this,
                        selectedTime = tgHelpers.getSelectedTime(tgView.tgSetObj, 'update');
                    self.updateStatsTimeSec();
                    var configTagDefObj = $.ajax({
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: 'POST',
                        data: {data:[{type: 'tags'}]}
                    }).done(function(response) {
                        TrafficGroupsView.tagsResponse = response;
                        TrafficGroupsView.tagMap = _.groupBy(_.map(_.result(response, '0.tags', []), 'tag'), 'tag_id');
                    });
                    var projectPrefix = tgHelpers.getProjectPrefix(),
                        clientPostData = {
                        "async": false,
                        "formModelAttrs": {
                            "from_time_utc": selectedTime.fromTime,
                            "to_time_utc": selectedTime.toTime,
                            "use_absolute_time": true,
                            "select": "eps.client.remote_app_id, eps.client.remote_tier_id, eps.client.remote_site_id,"+
                                 "eps.client.remote_deployment_id, eps.client.remote_prefix, eps.client.remote_vn, eps.__key,"+
                                 " eps.client.app, eps.client.tier, eps.client.site, eps.client.deployment, eps.client.local_vn, name, SUM(eps.client.in_bytes),"+
                                 " SUM(eps.client.out_bytes), SUM(eps.client.in_pkts), SUM(eps.client.out_pkts), SUM(eps.client.added), SUM(eps.client.deleted),"+
                                 " MIN(eps.client.active), MAX(eps.client.active)",
                            "table_type": "STAT",
                            "table_name": "StatTable.EndpointSecurityStats.eps.client",
                            "where": "(name Starts with " + projectPrefix + ")",
                            "where_json": []
                        }
                    };

                    var serverPostData = {
                        "async": false,
                        "formModelAttrs": {
                            "from_time_utc": selectedTime.fromTime,
                            "to_time_utc": selectedTime.toTime,
                            "select": "eps.server.remote_app_id, eps.server.remote_tier_id, eps.server.remote_site_id,"+
                                 "eps.server.remote_deployment_id, eps.server.remote_prefix, eps.server.remote_vn, eps.__key,"+
                                 " eps.server.app, eps.server.tier, eps.server.site, eps.server.deployment, eps.server.local_vn, name, SUM(eps.server.in_bytes),"+
                                 " SUM(eps.server.out_bytes), SUM(eps.server.in_pkts), SUM(eps.server.out_pkts), SUM(eps.server.added), SUM(eps.server.deleted),"+
                                 " MIN(eps.server.active), MAX(eps.server.active)",
                            "table_type": "STAT",
                            "table_name": "StatTable.EndpointSecurityStats.eps.server",
                            "where": "(name Starts with " + projectPrefix + ")",
                            "where_json": []
                        }
                    };

                    var listModelConfig = {
                        remote : {
                            ajaxConfig : {
                                url:monitorInfraConstants.monitorInfraUrls['QUERY'],
                                type:'POST',
                                data:JSON.stringify(clientPostData)
                            },
                            dataParser : function (response) {
                                var clientData = cowu.getValueByJsonPath(response, 'data', []);
                                var selectedTimeRange = cowu.getValueByJsonPath(response, 'queryJSON', {});
                                sessionStorage.tg_from_time = selectedTimeRange.start_time;
                                sessionStorage.tg_to_time = selectedTimeRange.end_time;
                                serverPostData.formModelAttrs.from_time_utc = sessionStorage.tg_from_time;
                                serverPostData.formModelAttrs.to_time_utc = sessionStorage.tg_to_time;
                                var modifiedClientData = [];
                                    _.each(clientData, function (val, idx) {
                                        if(val['SUM(eps.client.in_bytes)'] || val['SUM(eps.client.out_bytes)']) {
                                            val['isClient'] = true;
                                            val['eps.traffic.remote_app_id'] = val['eps.client.remote_app_id'];
                                            val['eps.traffic.remote_deployment_id'] = val['eps.client.remote_deployment_id'];
                                            val['eps.traffic.remote_site_id'] = val['eps.client.remote_site_id'];
                                            val['eps.traffic.remote_tier_id'] = val['eps.client.remote_tier_id'];
                                            val['eps.traffic.remote_deployment_id'] = val['eps.client.remote_deployment_id'];
                                            val['eps.traffic.remote_vn'] = val['eps.client.remote_vn'];
                                            val['SUM(eps.traffic.in_bytes)'] = val['SUM(eps.client.in_bytes)'];
                                            val['SUM(eps.traffic.out_bytes)'] = val['SUM(eps.client.out_bytes)'];
                                            val['SUM(eps.traffic.in_pkts)'] = val['SUM(eps.client.in_pkts)'];
                                            val['SUM(eps.traffic.out_pkts)'] = val['SUM(eps.client.out_pkts)'];
                                            val['eps.traffic.remote_prefix'] = val['eps.client.remote_prefix'];
                                            val['app'] = val['eps.client.app'];
                                            val['tier'] = val['eps.client.tier'];
                                            val['site'] = val['eps.client.site'];
                                            val['deployment'] = val['eps.client.deployment'];
                                            val['vn'] = val['eps.client.local_vn'];
                                            var updateVal = _.omit(val, ['eps.client.remote_app_id', 'eps.client.remote_deployment_id',
                                             'eps.client.remote_site_id', 'eps.client.remote_tier_id', 'eps.client.remote_deployment_id',
                                             'eps.client.remote_vn', 'eps.client.app', 'eps.client.tier', 'eps.client.site', 'eps.client.deployment',
                                             'eps.client.local_vn', 'SUM(eps.client.in_bytes)', 'SUM(eps.client.out_bytes)',
                                             'SUM(eps.client.in_pkts)', 'SUM(eps.client.out_pkts)']);
                                            modifiedClientData.push(updateVal);
                                        }
                                    });
                                self.clientData = modifiedClientData;
                                return modifiedClientData;
                            }
                        },
                        vlRemoteConfig: {
                            vlRemoteList: [{
                                getAjaxConfig: function() {
                                    return {
                                        url: monitorInfraConstants.monitorInfraUrls['QUERY'],
                                        type: 'POST',
                                        data: JSON.stringify(serverPostData)
                                    }
                                },
                                successCallback: function(response, contrailListModel) {
                                    var serverData = cowu.getValueByJsonPath(response, 'data', []);
                                    var modifiedServerData = [];
                                    _.each(serverData, function (val, idx) {
                                        if(val['SUM(eps.server.in_bytes)'] || val['SUM(eps.server.out_bytes)']) {
                                            val['isServer'] = true;
                                            val['eps.traffic.remote_app_id'] = val['eps.server.remote_app_id'];
                                            val['eps.traffic.remote_deployment_id'] = val['eps.server.remote_deployment_id'];
                                            val['eps.traffic.remote_site_id'] = val['eps.server.remote_site_id'];
                                            val['eps.traffic.remote_tier_id'] = val['eps.server.remote_tier_id'];
                                            val['eps.traffic.remote_deployment_id'] = val['eps.server.remote_deployment_id'];
                                            val['eps.traffic.remote_vn'] = val['eps.server.remote_vn'];
                                            val['SUM(eps.traffic.in_bytes)'] = val['SUM(eps.server.in_bytes)'];
                                            val['SUM(eps.traffic.out_bytes)'] = val['SUM(eps.server.out_bytes)'];
                                            val['SUM(eps.traffic.in_pkts)'] = val['SUM(eps.server.in_pkts)'];
                                            val['SUM(eps.traffic.out_pkts)'] = val['SUM(eps.server.out_pkts)'];
                                            val['eps.traffic.remote_prefix'] = val['eps.server.remote_prefix'];
                                            val['app'] = val['eps.server.app'];
                                            val['tier'] = val['eps.server.tier'];
                                            val['site'] = val['eps.server.site'];
                                            val['deployment'] = val['eps.server.deployment'];
                                            val['vn'] = val['eps.server.local_vn'];
                                            var updateVal = _.omit(val, ['eps.server.remote_app_id', 'eps.server.remote_deployment_id',
                                             'eps.server.remote_site_id', 'eps.server.remote_tier_id', 'eps.server.remote_deployment_id',
                                             'eps.server.remote_vn', 'eps.server.app', 'eps.server.tier', 'eps.server.site', 'eps.server.deployment',
                                            'eps.server.local_vn', 'SUM(eps.server.in_bytes)', 'SUM(eps.server.out_bytes)',
                                             'SUM(eps.server.in_pkts)', 'SUM(eps.server.out_pkts)']);
                                            modifiedServerData.push(updateVal);
                                        }
                                    });
                                    self.serverData = modifiedServerData;
                                }
                            }]
                        },
                        cacheConfig : {

                        }
                    };
                    configTagDefObj.done(function () {
                        self.viewInst = new ContrailChartsView({
                            el: self.$el.find('#traffic-groups-radial-chart'),
                            model: new ContrailListModel(listModelConfig)
                        });
                        self.updateContainerSettings('', true);
                    });
                },
                render: function() {
                    var trafficGroupsTmpl = contrail.getTemplate4Id('traffic-groups-template');
                    this.$el.html(trafficGroupsTmpl({widgetTitle:'Traffic Groups'}));
                    $('.refresh-traffic-stats').on('click', this.resetTrafficStats);
                    $('.settings-traffic-stats').on('click', this.showFilterOptions);
                    $('#editTgSettings').on('click', this.editTgSettings);
                    $('#filterByTagNameSec .dropdown-toggle').on('click', this.editTgFilters);
                    TrafficGroupsView.colorMap = {};
                    TrafficGroupsView.colorArray = [];
                    TrafficGroupsView.tagMap = {};
                    TrafficGroupsView.ruleMap = {};
                    tgView = this;
                    /**
                     * @levels  #Indicates no of levels to be drawn
                     */
                    this.settingsView = new settingsView();
                    if(contrail.getCookie(cowc.COOKIE_PROJECT) == 'undefined') {
                        this.showOtherProjectTraffic = true;
                        this.combineEmptyTags = true;
                    }
                    this.renderTrafficChart('onload');
                    //Render container settings
                    this.renderView4Config($('#traffic-groups-options'), '',
                        monitorInfraUtils.getContainerSettingsConfig(tgHelpers.getContainerViewConfig, 'traffic_groups_'));
                }
            });
            return TrafficGroupsView;
        });
