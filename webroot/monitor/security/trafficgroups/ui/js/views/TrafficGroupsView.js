/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'lodashv4', 'contrail-view',
         'contrail-charts-view', 'contrail-list-model',
         'monitor/security/trafficgroups/ui/js/views/TrafficGroupsSettingsView',
         'monitor/security/trafficgroups/ui/js/models/TrafficGroupsSettingsModel',
         'monitor/security/trafficgroups/ui/js/models/TrafficGroupsFilterModel',
         "core-basedir/js/views/ContainerSettingsView"],
        function(_, ContrailView, ContrailChartsView,
                ContrailListModel, settingsView, settingsModel, filterModel, ContainerSettings) {
            var tgView,
                TrafficGroupsView = ContrailView.extend({
                tagTypeList: {
                    'app': [],
                    'tier': [],
                    'deployment': [],
                    'site': []
                },
                showOtherProjectTraffic: false,
                combineEmptyTags: false,
                matchArcsColorByCategory: false,
                enableSessionDrilldown: false,
                sliceByProjectOnly: true,
                // Provide colours list for top level arcs
                topLevelArcColors: cowc['TRAFFIC_GROUP_COLOR_LEVEL1'].slice(0,1),
                filterdData: null,
                resetTrafficStats: function(e) {
                    e.preventDefault();
                    tgView.renderTrafficChart();
                },
                showSessionsInfo: function() {
                    require(['monitor/security/trafficgroups/ui/js/views/TrafficGroupsEPSTabsView'], function(EPSTabsView) {
                        var linkInfo = tgView.getLinkInfo(tgView.selectedLinkData),
                            linkData = {
                                endpointNames: [linkInfo.srcTags, linkInfo.dstTags],
                                endpointStats: []
                            }
                            epsTabsView = new EPSTabsView();
                        _.each(linkInfo.links, function(link) {
                            var namePath = link.data.currentNode ? link.data.currentNode.names : '',
                                epsData = _.filter(link.data.dataChildren,
                                    function(session) {
                                        return tgView.isRecordMatched(namePath, session, link.data);
                                    });
                            linkData.endpointStats.push(epsData);
                        });
                        epsTabsView.render(linkData);
                    });
                },
                showLinkSessions: function() {
                    require(['monitor/security/trafficgroups/ui/js/views/TrafficGroupsEPSTabsView'], function(EPSTabsView) {
                        var linkInfo = tgView.getLinkInfo(tgView.selectedLinkData),
                            endpoint1Data = [], endpoint2Data = [],
                            curSession = linkInfo.links[0].data.dataChildren[0];
                        _.each(tgView.getCategorizationObj(), function(tags) {
                            _.each(tags.split('-'), function(tag) {
                                tag = tag.trim();
                                endpoint1Data.push({
                                    'name' : (tag == 'app' ? 'application' : tag),
                                    'value' : curSession[tag].split('=')[1]
                                });
                                endpoint2Data.push({
                                    'name' : (tag == 'app' ? 'application' : tag),
                                    'value' : curSession['eps.traffic.remote_' + tag + '_id'].split('=')[1]
                                });
                            });
                        });
                        var linkData = {
                                endpointNames: [linkInfo.srcTags, linkInfo.dstTags],
                                endpointStats: [],
                                tags: [endpoint1Data, endpoint2Data],
                                breadcrumb: [['All'], [linkInfo.srcTags,linkInfo.dstTags]],
                                where: [[], []],
                                selectedEndpoint: 'endpoint1',
                                sessionType: 'client',
                                level : 1
                            },
                            epsTabsView = new EPSTabsView();
                            epsTabsView.parentView = tgView;
                            epsTabsView.sessionData = linkData;
                        epsTabsView.sessionDrilldown(linkData);
                    });
                },
                getSessionData: function(childData, endpointData, d) {
                    var sessionData = _.chain(childData)
                    .filter(function (val, idx) {
                        var namePath = _.result(endpointData, '0.data.currentNode.names');
                        return tgView.isRecordMatched(namePath, val, d.link[0].data);
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
                            'session_responded_active': _.sumBy(serverObjs, 'SUM(eps.server.active)'),
                            'session_initiated_active': _.sumBy(clientObjs, 'SUM(eps.client.active)'),
                            'session_responded': _.sumBy(serverObjs, 'SUM(eps.server.added)'),
                            'session_initiated': _.sumBy(clientObjs, 'SUM(eps.client.added)')
                        }
                    }).value();
                    return sessionData;
                },
                showLinkInfo(d,el,e) {
                    var self = this,
                        ruleUUIDs = [], ruleKeys = [], level = 1;
                    if (_.result(d, 'innerPoints.length') == 4)
                        level = 2;
                    var srcNodeData = _.filter(d.link, function (val, idx){
                            return _.result(val, 'data.type') == 'src';
                    });
                    var dstNodeData = _.filter(d.link, function (val, idx){
                            return _.result(val, 'data.type') == 'dst';
                    });
                    var srcId = self.removeEmptyTags(_.result(srcNodeData, '0.data.currentNode.displayLabels')),
                        dstId = self.removeEmptyTags(_.result(dstNodeData, '0.data.currentNode.displayLabels'));
                    self.selectedLinkData = d.link;
                    var childData = _.result(d, 'link.0.data.dataChildren', []);
                    var srcSessionObjArr = self.getSessionData(childData, srcNodeData, d);
                    var dstSessionObjArr, dstSessionObj;
                    //If it is intralink no need to calculate endpoint2 sessions
                    if (srcId != dstId) {
                        dstSessionObjArr = self.getSessionData(childData, dstNodeData, d);
                        dstSessionObj = _.groupBy(dstSessionObjArr, 'eps.__key');
                    }
                    var srcSessionObj = _.groupBy(srcSessionObjArr, 'eps.__key');
                    _.each(d.link, function(link) {
                        ruleKeys = _.uniq(_.map(link['data']['dataChildren'], 'eps.__key'));
                        $.each(ruleKeys, function (idx, key) {
                            if (key != null) {
                                var uuid = key.split(':').pop();
                                ruleUUIDs.push(uuid);
                            }
                        });
                    });
                    ruleUUIDs = _.uniq(ruleUUIDs);
                    _.each(self.chartInfo.component.ribbons, function (ribbon) {
                       ribbon.selected = false;
                       ribbon.active = false;
                    });
                    d.selected = true;
                    d.active = true;
                    self.chartInfo.component._render();
                    if (ruleUUIDs.length > 0) {
                        var listModelConfig = {
                            remote: {
                                ajaxConfig: {
                                    url: "/api/tenants/config/get-config-details",
                                    type: "POST",
                                    data: JSON.stringify(
                                        {data: [{type: 'firewall-rules',obj_uuids: ruleUUIDs, fields: ['firewall_policy_back_refs',
                                         'service', 'service_group_refs']}]})
                                },
                                dataParser: function (data) {
                                    var ruleDetails = _.result(data, '0.firewall-rules', []),
                                        ruleMap = {}, formattedRuleDetails = [];
                                    $.each(ruleDetails, function (idx, detailsObj) {
                                        if (detailsObj['firewall-rule'] != null) {
                                            var ruleDetailsObj = detailsObj['firewall-rule'],
                                                ruleUUID = detailsObj['firewall-rule']['uuid'];
                                            ruleMap[detailsObj['firewall-rule']['uuid']] = ruleDetailsObj;
                                            var src = _.result(ruleDetailsObj, 'endpoint_1.tags', []);
                                                srcType = '';
                                                src = src.join(' && ')
                                            if (src.length == 0) {
                                                src = _.result(ruleDetailsObj, 'endpoint_1.address_group', '-');
                                                srcType = 'address_group';
                                            }
                                            if (!src || src == '-') {
                                                src = _.result(ruleDetailsObj, 'endpoint_1.any', '-');
                                                if (src == true) {
                                                    src = 'any';
                                                }
                                                srcType = ''
                                            }
                                            if (!src || src == '-') {
                                                src = _.result(ruleDetailsObj, 'endpoint_1.virtual_network', '-');
                                                srcType = 'virtual_network';
                                            }
                                            var dst = _.result(ruleDetailsObj, 'endpoint_2.tags', []),
                                                dstType = '';
                                                dst = dst.join(' && ');
                                            if (!dst || dst.length == 0) {
                                                dst = _.result(ruleDetailsObj, 'endpoint_2.address_group', '-');
                                                dstType = 'address_group';
                                            }
                                            if (!dst || dst == '-') {
                                                dst = _.result(ruleDetailsObj, 'endpoint_2.any', '-');
                                                if (dst == true)
                                                    dst = 'any';
                                                dstType = ''
                                            }
                                            if (!dst || dst == '-') {
                                                dst = _.result(ruleDetailsObj, 'endpoint_2.virtual_network', '-');
                                                dstType = 'virtual_network';
                                            }
                                            if(!src || src == '-' || src.length == 0) {
                                                srcType = '';
                                                src = '-';
                                            }
                                            if(!dst || dst == '-' || dst.length == 0) {
                                                dstType = '';
                                                dst = '-';
                                            }
                                            var policy_name_arr = _.result(ruleDetailsObj, 'firewall_policy_back_refs.0.to', []),
                                                service = _.result(ruleDetailsObj, 'service'),
                                                service_group_refs = _.result(ruleDetailsObj, 'service_group_refs'),
                                                serviceStr,
                                                service_dst_port_obj = _.result(ruleDetailsObj, 'service.dst_ports'),
                                                service_dst_port = '-',
                                                service_protocol = _.result(ruleDetailsObj, 'service.protocol'),
                                                policy_name = _.result(policy_name_arr.slice(-1), '0', '-'),
                                                rule_name = _.result(ruleDetailsObj, 'display_name'),
                                                direction = cowu.deSanitize(_.result(ruleDetailsObj, 'direction'));
                                            if (service_dst_port_obj != null && service_dst_port_obj['start_port'] != null &&
                                                service_dst_port_obj['end_port'] != null) {
                                                if (service_dst_port_obj['start_port'] == service_dst_port_obj['end_port']) {
                                                    service_dst_port = service_dst_port_obj['start_port'];
                                                } else {
                                                    service_dst_port = contrail.format('{0}-{1}', service_dst_port_obj['start_port'], service_dst_port_obj['end_port']);
                                                }
                                                service_dst_port == '-1' ? 'any' : service_dst_port;
                                                serviceStr = contrail.format('{0}: {1}', service_protocol, service_dst_port);
                                            }
                                            if (service_group_refs != null) {
                                                serviceStr = _.result(service_group_refs, '0.to.1');
                                            }
                                            var simple_action = _.result(ruleDetailsObj, 'action_list.simple_action', '-');
                                            if (simple_action == 'pass') {
                                                simple_action = 'permit';
                                            }
                                            formattedRuleDetails.push({
                                                policy_name: policy_name,
                                                srcId: srcId,
                                                src_session_initiated: _.result(srcSessionObj, ruleUUID+'.0.session_initiated', 0),
                                                src_session_responded: _.result(srcSessionObj, ruleUUID+'.0.session_responded', 0),
                                                src_session_initiated_active: _.result(srcSessionObj, ruleUUID+'.0.session_initiated_active', 0),
                                                src_session_responded_active: _.result(srcSessionObj, ruleUUID+'.0.session_responded_active', 0),
                                                dstId: dstId,
                                                dst_session_initiated: _.result(dstSessionObj, ruleUUID+'.0.session_initiated', 0),
                                                dst_session_responded: _.result(dstSessionObj, ruleUUID+'.0.session_responded', 0),
                                                dst_session_initiated_active: _.result(dstSessionObj, ruleUUID+'.0.session_initiated_active', 0),
                                                dst_session_responded_active: _.result(dstSessionObj, ruleUUID+'.0.session_responded_active', 0),
                                                rule_name: rule_name,
                                                implicitRule: '',
                                                simple_action: simple_action,
                                                service: serviceStr,
                                                direction: direction == '>' ? 'uni': 'bi',
                                                srcType: srcType,
                                                dstType: dstType,
                                                src: src == '-' ? 'any' : src,
                                                dst: dst == '-' ? 'any' : dst
                                            });
                                        }
                                    });
                                    var defaultRuleUUIDs = _.keys(cowc.DEFAULT_FIREWALL_RULES);
                                    $.each(defaultRuleUUIDs, function (idx, uuid) {
                                        if (ruleUUIDs.indexOf(uuid) > -1) {
                                            var defaultRuleDetails = cowc.DEFAULT_FIREWALL_RULES[uuid];
                                            formattedRuleDetails.push({
                                                policy_name: _.result(defaultRuleDetails, 'name'),
                                                rule_name: uuid,
                                                srcId: srcId,
                                                dstId: dstId,
                                                implicitRule: 'implicitRuleStyle',
                                                src_session_initiated: _.result(srcSessionObj, uuid+'.0.session_initiated', 0),
                                                src_session_responded: _.result(srcSessionObj, uuid+'.0.session_responded', 0),
                                                src_session_initiated_active: _.result(srcSessionObj, uuid+'.0.session_initiated_active', 0),
                                                src_session_responded_active: _.result(srcSessionObj, uuid+'.0.session_responded_active', 0),
                                                dst_session_initiated: _.result(dstSessionObj, uuid+'.0.session_initiated', 0),
                                                dst_session_responded: _.result(dstSessionObj, uuid+'.0.session_responded', 0),
                                                dst_session_initiated_active: _.result(dstSessionObj, uuid+'.0.session_initiated_active', 0),
                                                dst_session_responded_active: _.result(dstSessionObj, uuid+'.0.session_responded_active', 0)
                                            });
                                        }
                                    });
                                    TrafficGroupsView.ruleMap = ruleMap;
                                    data.srcId = srcId;
                                    data.dstId = dstId;
                                    data.policyRules = formattedRuleDetails;
                                    if(!formattedRuleDetails.length) {
                                        data.rules = ruleUUIDs;
                                    }
                                    var ruleDetailsTemplate = contrail.getTemplate4Id('traffic-rule-template');
                                    $('#traffic-groups-link-info').html(ruleDetailsTemplate(data));
                                    if(!self.enableSessionDrilldown) {
                                        if($('#traffic-groups-radial-chart').hasClass('showLinkInfo')) {
                                           $('.trafficGroups_sidePanel').
                                                removeClass('animateLinkInfo');
                                        } else {
                                            $('.trafficGroups_sidePanel').
                                                addClass('animateLinkInfo');
                                            $('#traffic-groups-radial-chart')
                                            .addClass('showLinkInfo');
                                        }
                                    }
                                    $('.allSessionInfo').on('click', self.showSessionsInfo);
                                    $('#traffic-groups-radial-chart')
                                     .on('click', function(ev) {
                                        if($(ev.target)
                                            .parents('#'+self.chartInfo.component.id).length == 0) {
                                            _.each(self.chartInfo.component.ribbons,
                                             function (ribbon) {
                                               ribbon.selected = false;
                                               ribbon.active = false;
                                            });
                                            if(!self.enableSessionDrilldown) {
                                                $('#traffic-groups-radial-chart')
                                                        .removeClass('showLinkInfo');
                                                $('#traffic-groups-link-info').html('');
                                                self.chartInfo.component._render();
                                            }
                                        }
                                    });
                                    return ruleDetails;
                                }
                            }
                        }
                        var ruleDetailsModel = new ContrailListModel(listModelConfig);
                    }
                },
                showEndPointStatsInGrid: function () {
                    var self = this,
                        data = self.handleUntaggedEndpoints(self.filterdData);
                    $('#traffic-groups-link-info').html('');
                    $('.tgChartLegend, .tgCirclesLegend').hide();
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
                getTagHierarchy: function(d) {
                    var srcHierarchy = [],
                        dstHierarchy = [],
                        srcLabels = [],
                        dstLabels = [],
                        selectedTagTypes = this.getCategorizationObj(),
                        level = selectedTagTypes.length,
                        sliceByProject =
                            this.getSettingValue('sliceByProject', false);
                        self = this;
                    _.each(selectedTagTypes, function(tags, idx) {
                        if(idx < level) {
                            var tagTypes = tags.split('-');
                            var srcNames = _.compact(_.map(tagTypes, function(tag) {
                                var tagVal = d[tag.trim()];
                                return tagVal ? tagVal : self.getTagLabel(tag, d);
                            }));
                            srcLabels.push(srcNames);
                            srcHierarchy.push(srcNames.join('-'));
                            var dstNames = _.compact(_.map(tagTypes, function(tag) {
                                var tagVal = d['eps.traffic.remote_' + tag.trim() + '_id'];
                                return tagVal ? tagVal : self.getTagLabel(tag,
                                                d, d['eps.traffic.remote_vn']);
                            }));
                            dstLabels.push(dstNames);
                            dstHierarchy.push(dstNames.join('-'));
                        }
                    });
                    if(sliceByProject) {
                        var vn = d['vn'] ? self.formatVN(d['vn'], self.sliceByProjectOnly) : ' ',
                            remoteVN = d['eps.traffic.remote_vn'] ?
                                self.formatVN(d['eps.traffic.remote_vn'], self.sliceByProjectOnly) : ' '
                        srcHierarchy[0] += vn;
                        dstHierarchy[0] += remoteVN;
                        srcLabels[0].push(vn);
                        dstLabels[0].push(remoteVN);
                    }
                    return {
                        srcHierarchy: srcHierarchy,
                        dstHierarchy: dstHierarchy,
                        srcLabels: srcLabels,
                        dstLabels: dstLabels
                    };
                },
                getTagLabel: function(tagType, d, vn) {
                    var label = '',
                        tagObj = _.find(cowc.TRAFFIC_GROUP_TAG_TYPES,
                            function(tag) {
                                return tag.value == tagType;
                        });
                    if(tagObj) {
                        if(tagObj.showIcononEmpty) {
                            label += tagObj.text.toLowerCase();
                        }
                        if(tagObj.showVNonEmpty && !this.combineEmptyTags) {
                            label += (label ? ' ' : '') +
                                this.formatVN(vn ? vn : d['vn']);
                        }
                    }
                    return label ? label : ' ';
                },
                isImplictRule: function(d, key) {
                    return (typeof d['eps.__key'] == 'string' &&
                           d['eps.__key'].indexOf(key) > -1) &&
                           (d['SUM(eps.traffic.in_bytes)'] ||
                           d['SUM(eps.traffic.out_bytes)']);
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
                                linkCssClasses: ['implicitDeny', 'implicitAllow'],
                                arcLabelXOffset: 0,
                                arcLabelYOffset: [-12,-6],
                                showLinkDirection: true,
                                isEndpointMatched: self.isRecordMatched,
                                colorScale: function (item) {
                                    var colorList = cowc['TRAFFIC_GROUP_COLOR_LEVEL'+item.level];
                                    if(self.matchArcsColorByCategory) {
                                        colorList = cowc['TRAFFIC_GROUP_COLOR_LEVEL1']
                                            .concat(cowc['TRAFFIC_GROUP_COLOR_LEVEL2']);
                                    }
                                    if(item.level == 1 && self.topLevelArcColors
                                        && self.getCategorizationObj().length > 1) {
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
                                drillDownLevel: self.getCategorizationObj().length,
                                expandLevels: 'disable',
                                hierarchyConfig: {
                                    parse: function (d) {
                                        var hierarchyObj = self.getTagHierarchy(d),
                                            srcHierarchy = hierarchyObj.srcHierarchy
                                            dstHierarchy = hierarchyObj.dstHierarchy,
                                            currentProject = contrail.getCookie(cowc.COOKIE_PROJECT),
                                            externalType = '',
                                            srcDisplayLabel = [],
                                            dstDisplayLabel = [],
                                            remoteVN = d['eps.traffic.remote_vn'],
                                            implicitDenyKey = ifNull(_.find(cowc.DEFAULT_FIREWALL_RULES, function(rule) {
                                                return rule.name == 'Implicit Deny';
                                            }), '').uuid,
                                            implicitAllowKey = ifNull(_.find(cowc.DEFAULT_FIREWALL_RULES, function(rule) {
                                                return rule.name == 'Implicit Allow';
                                            }), '').uuid;
                                        if(self.isImplictRule(d, implicitDenyKey)) {
                                            d.linkCssClass = 'implicitDeny';
                                        }
                                        if(self.isImplictRule(d, implicitAllowKey)) {
                                            d.linkCssClass = 'implicitAllow';
                                        }
                                        $.each(srcHierarchy, function(idx) {
                                            srcDisplayLabel.push(self.formatLabel(hierarchyObj.srcLabels, idx));
                                        });

                                        if(remoteVN && remoteVN.indexOf(':') > 0) {
                                            var remoteProject = remoteVN.split(':')[1];
                                            if(!self.showOtherProjectTraffic &&
                                               currentProject != remoteProject) {
                                                externalType = 'externalProject';
                                            }
                                        } else {
                                            externalType = 'external';
                                        }

                                        $.each(dstHierarchy, function(idx) {
                                            dstDisplayLabel.push(self.formatLabel(hierarchyObj.dstLabels, idx));
                                            if(externalType) {
                                                if(externalType == 'external') {
                                                    dstHierarchy[idx] = 'External_external';
                                                    dstDisplayLabel[idx].fill('');
                                                    dstDisplayLabel[idx][dstDisplayLabel[idx].length-1] = 'External';
                                                } else {
                                                    dstHierarchy[idx] += '_' + externalType;
                                                }
                                            }
                                        });
                                        var src = {
                                            names: srcHierarchy,
                                            displayLabels: srcDisplayLabel,
                                            id: _.compact(srcHierarchy).join('-'),
                                            value: d['SUM(eps.traffic.in_bytes)'] + d['SUM(eps.traffic.out_bytes)'],
                                            inBytes: d['SUM(eps.traffic.in_bytes)'],
                                            outBytes: d['SUM(eps.traffic.out_bytes)']
                                        };
                                        //If remote_vn project doesn't match with current project
                                        //set type = external
                                        //append '_external' to names [only for 1st-level app field]
                                        var dst = {
                                            names: dstHierarchy,
                                            displayLabels: dstDisplayLabel,
                                            id: _.compact(dstHierarchy).join('-'),
                                            type: externalType,
                                            value: d['SUM(eps.traffic.out_bytes)'] + d['SUM(eps.traffic.in_bytes)'],
                                            inBytes: d['SUM(eps.traffic.in_bytes)'],
                                            outBytes: d['SUM(eps.traffic.out_bytes)']
                                        };
                                        return [src, dst];
                                    }
                                }
                            },extendConfig)
                        },{
                            id: 'tooltip-id',
                            type: 'Tooltip',
                            config: {
                                formatter: function formatter(data) {
                                    if(data.level) {
                                        var arcTitle = data.displayLabels.slice(0);
                                        var content = { title: self.removeEmptyTags(arcTitle), items: [] };
                                        content.title += '<hr/>'

                                        var childrenArr = data['children'];
                                        //data is nested on hovering 1st-level arc while showing 2-level arcs
                                        //For intra-app traffic, there will be 2 children with same linkId
                                        //Remove 2nd-level duplicate intra links
                                        if(childrenArr[0].children != null) {
                                            childrenArr = jsonPath(data,'$.children[*].children[*]');
                                            childrenArr = _.flatten(childrenArr);
                                        }
                                        if(childrenArr[0].linkId != null) {
                                            childrenArr = _.uniqWith(childrenArr,function(a,b) {
                                                return a.linkId == b.linkId;
                                            });
                                        }

                                        var dataChildren = jsonPath(childrenArr,'$.[*].dataChildren');
                                        if(dataChildren == false)
                                            dataChildren = jsonPath(data,'$.children[*].children[*].dataChildren');
                                        dataChildren = _.flatten(dataChildren);

                                        content.items.push({
                                            label: 'Traffic In',
                                            value:  formatBytes(_.sumBy(dataChildren,function(currSession) {
                                                if(self.isRecordMatched(data.namePath, currSession, data))
                                                    return _.result(currSession,'SUM(eps.traffic.in_bytes)',0);
                                                 else
                                                    return 0;
                                            }))
                                        }, {
                                            label: 'Traffic Out',
                                            value: formatBytes(_.sumBy(dataChildren,function(currSession) {
                                                if(self.isRecordMatched(data.namePath, currSession, data))
                                                    return _.result(currSession,'SUM(eps.traffic.out_bytes)',0);
                                                 else
                                                    return 0;
                                            }))
                                        });
                                    } else {
                                        var linkInfo = self.getLinkInfo(data.link),
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
                                                        if(self.isRecordMatched(namePath, bytes, link.data))
                                                            return _.result(bytes,'SUM(eps.traffic.in_bytes)',0);
                                                         else
                                                            return 0;

                                                    })),
                                                trafficOut: formatBytes(_.sumBy(link.data.dataChildren,
                                                    function(bytes) {
                                                        if(self.isRecordMatched(namePath, bytes, link.data))
                                                            return _.result(bytes,'SUM(eps.traffic.out_bytes)',0);
                                                        else
                                                            return 0
                                                    }))
                                            };
                                            linkData.items.push({
                                                name: self.removeEmptyTags(_.result(link, 'data.currentNode.displayLabels')),
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
                    .removeClass('showLinkInfo');
                    $('#traffic-groups-link-info').html('');
                    self.chartInfo = self.viewInst.getChartViewInfo(config,
                                "dendrogram-chart-id", self.addtionalEvents());
                    if(cfg['freshData']) {
                        self.viewInst.model.onAllRequestsComplete.subscribe(function() {
                           var data = self.clientData.concat(self.serverData);
                           data = self.updateRemoteIds(data);
                           self.viewInst.model.setData(data);
                           self.trafficData = JSON.parse(JSON.stringify(data));
                           self.filterDataByEndpoints();
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
                             : this.viewInst.model.getItems(),
                        data = this.handleUntaggedEndpoints(data);
                    if($('#traffic-groups-radial-chart:visible').length) {
                        if(data && data.length == 0) {
                            $('#traffic-groups-radial-chart').empty();
                            var noData = "<h4 class='noStatsMsg'>"
                                + ctwl.TRAFFIC_GROUPS_NO_DATA + "</h4>"
                            $('#traffic-groups-radial-chart').html(noData);
                        } else {
                            this.viewInst.render(data, this.chartInfo.chartView);
                        }
                        $('.tgChartLegend, .tgCirclesLegend').show();
                    } else {
                        this.showEndPointStatsInGrid();
                    }
                    this.updateCircleLegends();
                    this.showHideLegendInfo(data);
                    $('#traffic-groups-options').removeClass('hidden');
                },
                showHideLegendInfo: function(data) {
                    if(data && data.length) {
                        $('#traffic-groups-legend-info').removeClass('hidden');
                    } else {
                        $('#traffic-groups-legend-info').addClass('hidden');
                    }
                },
                handleUntaggedEndpoints: function (data) {
                    var showUntagged = this.getSettingValue('untaggedEndpoints', false),
                        tgData = data ? data.slice(0) : data;
                    if(!showUntagged && tgData) {
                        tgData = _.filter(tgData, function(session) {
                            var remoteVN = session['eps.traffic.remote_vn'];
                            var srcTags = false,
                                dstTags = false;
                            _.each(cowc.TRAFFIC_GROUP_TAG_TYPES, function(tag) {
                                if(session[tag.value]) {
                                    srcTags = true;
                                }
                                if(session['eps.traffic.remote_' + tag.value + '_id']) {
                                    dstTags = true;
                                }
                            });
                            return srcTags && (dstTags || !remoteVN);
                        });
                    }
                    return tgData;
                },
                addtionalEvents: function() {
                    return [{
                            event: 'click',
                            selector: 'node',
                            handler: this._onClickNode,
                            handlerName: '_onClickNode'
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
                        }
                    ];
                },
                _onClickNode: function(d, el ,e) {
                    var chartScope = tgView.chartInfo.component;
                    if(chartScope.config.attributes.
                        expandLevels == 'disable' && el && d) {
                      return;
                    }
                    if(chartScope.clearArcTootltip) {
                      clearTimeout(chartScope.clearArcTootltip);
                    }
                    var levels = 2;
                    //If clicked on 2nd level arc,collapse to 1st level
                    if(!d || d.depth == 2 || d.height == 2)
                        levels = 1;
                    tgView.updateChart({levels: levels});
                },
                _onClickLink: function(d, el ,e) {
                    var chartScope = tgView.chartInfo.component;
                    if(chartScope.config.attributes.showLinkInfo) {
                        tgView.showLinkInfo(d, el, e, chartScope);
                        if(tgView.enableSessionDrilldown) {
                            $('#traffic-groups-radial-chart')
                                .addClass('showLinkInfo');
                            tgView.showLinkSessions();
                        }
                    }
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
                            'tooltip-id', {left, top}, d);
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
                getLinkInfo: function(links) {
                    var srcTags = this.removeEmptyTags(_.result(links, '0.data.currentNode.displayLabels')),
                        dstTags = this.removeEmptyTags(_.result(links, '1.data.currentNode.displayLabels')),
                        dstIndex = _.findIndex(links, function(link) { return link.data.type == 'dst' });
                    if((srcTags == dstTags) || _.includes(links[dstIndex].data.arcType, 'externalProject')
                         || _.includes(links[dstIndex].data.arcType, 'external')) {
                        links = links.slice(0,1);
                    }
                    return {links, srcTags, dstTags};
                },
                formatLabel: function(labels, idx) {
                    var displayLabels = [];
                    if(labels && labels.length > 0) {
                        _.each(labels[idx], function(label) {
                            displayLabels.push(label
                                 .replace('application', cowc.APPLICATION_ICON)
                                 .replace('tier', cowc.TIER_ICON)
                                 .replace('site', cowc.SITE_ICON)
                                 .replace('deployment', cowc.DEPLOYMENT_ICON)
                                 .replace('=', ' '));
                        });
                    }
                    return displayLabels;
                },
                removeEmptyTags: function(names) {
                    var displayNames = names.slice(0);
                    displayNames = _.map(displayNames, function(name) {
                        return _.compact(name).join('-')
                    });
                    displayNames = _.remove(displayNames, function(name, idx) {
                        return !(name == 'External' && idx > 0);
                    });
                    return _.compact(displayNames).join('-');
                },
                isRecordMatched: function(names, record, data) {
                    var arcType = data.arcType ? '_' + data.arcType : '',
                        isMatched = true,
                        selectedTagTypes = tgView.getCategorizationObj(),
                        sliceByProject =
                            tgView.getSettingValue('sliceByProject', false);
                    for(var i = 0; i < names.length; i++) {
                        var tagTypes = selectedTagTypes[i].split('-'),
                            tagName =  _.compact(_.map(tagTypes, function(tag) {
                                            return record[tag] ? record[tag]
                                            : tgView.getTagLabel(tag, record)
                                    })).join('-');
                       if(i == 0 && sliceByProject) {
                        tagName += tgView.formatVN(record['vn'], tgView.sliceByProjectOnly);
                       }
                       tagName += arcType;
                       isMatched = isMatched && (tagName == names[i]);
                    }
                    return isMatched;
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
                filterDataByEndpoints: function() {
                    var self = this;
                    self.filterdData =  _.filter(self.trafficData, function(d) {
                        var isClientEP = true,
                            isServerEP = true;
                        _.each(self.getTGSettings().filterByEndpoints,
                            function(endPoint) {
                            if(endPoint) {
                                isClientEP = isServerEP = true;
                                _.each(endPoint.split(','), function(tag) {
                                  var tagObj = tag
                                        .split(cowc.DROPDOWN_VALUE_SEPARATOR),
                                      tagType = tagObj[1],
                                      tagName = tagObj[0];
                                  isClientEP = isClientEP &&
                                    (d[tagType] == tagName);
                                  isServerEP = isServerEP &&
                                    (d['eps.traffic.remote_' + tagType + '_id']
                                         == tagName);
                                });
                                if(isClientEP || isServerEP) return false;
                            }
                        });
                        return (isClientEP || isServerEP);
                    });
                },
                applySelectedFilter: function(modelObj) {
                    var oldTimeRange = tgView.getTGSettings().time_range,
                        oldFromTime = tgView.getTGSettings().from_time,
                        oldToTime = tgView.getTGSettings().to_time;
                    tgView.settingsModelObj = modelObj;

                    //To retain applied categorization, adding to session storage
                    sessionStorage.TG_CATEGORY = modelObj.get('groupByTagType');
                    sessionStorage.TG_SUBCATEGORY = modelObj
                                                    .get('subGroupByTagType');

                    tgView.filterDataByEndpoints();
                    tgView.updateCircleLegends();
                    var newTimeRange = tgView.getTGSettings().time_range,
                        newFromTime = tgView.getTGSettings().from_time,
                        newToTime = tgView.getTGSettings().to_time;
                    if(oldTimeRange != newTimeRange || ((oldTimeRange == -1  ||
                        oldTimeRange == -2) && (oldFromTime != newFromTime ||
                        oldToTime != newToTime))) {
                        tgView.renderTrafficChart();
                    } else {
                        tgView.updateContainerSettings('', false);
                    }
                },
                updateCircleLegends: function() {
                    var trafficChartLegendTmpl =
                        contrail.getTemplate4Id('traffic-chart-legend-template'),
                        outerLegends = [],
                        innerLegends = [],
                        sliceByProject =
                            this.getSettingValue('sliceByProject', false);
                    _.map(this.getCategorizationObj()[0].split('-'), function(tag) {
                        outerLegends.push(_.find(cowc.TRAFFIC_GROUP_TAG_TYPES,
                            function(obj) {
                            return obj.value == tag
                        }).text);
                    });
                    if(sliceByProject) {
                        outerLegends.push(this.sliceByProjectOnly ? 'Project'
                                            : 'VN (Project)');
                    }
                    if(this.getCategorizationObj()[1]) {
                        _.map(this.getCategorizationObj()[1].split('-'), function(tag) {
                            innerLegends.push(_.find(cowc.TRAFFIC_GROUP_TAG_TYPES,
                                function(obj) {
                                return obj.value == tag
                            }).text);
                        });
                    }
                    $('#traffic-groups-legend-info .tgCirclesLegend').html(
                        trafficChartLegendTmpl({
                            outerTags: outerLegends,
                            innerTags: innerLegends.length ? innerLegends : ['-']
                        })
                    );
                },
                removeFilter: function(e) {
                    var curElem = $(e.currentTarget).parent('li').find('div'),
                        tag = curElem.attr('data-tag'),
                        val = curElem.html(),
                        index = curElem.attr('data-index');
                    if(tgView.settingsModelObj) {
                        var filterObj = tgView.settingsModelObj
                                            .get('endpoints'),
                            curFilter = filterObj.models[index];
                        if(curFilter && curFilter.get('endpoint')) {
                            curFilter = _.filter(curFilter.get('endpoint')()
                                        .split(','), function(tagName) {
                                        return tagName != (val + ";" + tag);
                                    });
                            curFilter = curFilter.join(',');
                        }
                        filterObj.remove(filterObj.models[index]);
                        if(curFilter) {
                            filterObj.add([new filterModel({
                                endpoint: curFilter
                            })],{at: index});
                        }
                        tgView.applySelectedFilter(tgView.settingsModelObj);
                    }
                },
                updateTGFilterSec: function() {
                    var filterByTags = [];
                    if(this.getTGSettings().filterByEndpoints.length > 0) {
                        _.each(this.getTGSettings().filterByEndpoints,
                            function(endpoint, idx) {
                            if(endpoint) {
                                var endpointObj = {
                                    'tags': []
                                };
                                _.each(endpoint.split(','), function(tag) {
                                    var tagObj = tag
                                        .split(cowc.DROPDOWN_VALUE_SEPARATOR);
                                    endpointObj.tags.push({
                                        tag: tagObj[1],
                                        value: tagObj[0],
                                        index: idx,
                                    });
                                });
                                if(endpointObj.tags.length > 0)
                                    filterByTags.push(endpointObj);
                            }
                        });
                    }
                    var filterViewTmpl =
                        contrail.getTemplate4Id('traffic-filter-view-template');
                    $('#filterByTagNameSec .dropdown-menu')
                        .html(filterViewTmpl({
                            endpoints : filterByTags
                    }));
                    var filterIconEle =  $('#filterByTagNameSec a');
                    if(filterByTags.length) {
                        filterIconEle.removeClass('noFiltersApplied')
                        filterIconEle.attr('data-action', 'clear');
                        filterIconEle.find('.filterCount').removeClass('hidden')
                                        .html(filterByTags.length);
                    } else {
                        filterIconEle.addClass('noFiltersApplied');
                        filterIconEle.removeAttr('data-action');
                        filterIconEle.find('.filterCount').addClass('hidden')
                                        .html('');
                    }
                    $('.tgRemoveFilter').on('click', this.removeFilter);
                    $('#filterByTagNameSec .dropdown-menu')
                        .on('click', function(e) {
                            e.stopPropagation();
                    });
                },
                showFilterOptions: function() {
                    tgView.settingsView.model = new settingsModel(tgView.getTGSettings());
                    tgView.settingsView.editFilterOptions(tgView.tagTypeList,
                        tgView.applySelectedFilter);
                },
                getTGSettings: function() {
                    var filterByEndpoints = [],
                        groupByTagType = null,
                        subGroupByTagType = null,
                        time_range = 3600,
                        from_time = null,
                        to_time = null;
                        if(tgView.settingsModelObj) {
                            groupByTagType = tgView.settingsModelObj
                                              .get('groupByTagType').split(',');
                            subGroupByTagType = tgView.settingsModelObj
                                              .get('subGroupByTagType');
                            subGroupByTagType = subGroupByTagType ?
                                    subGroupByTagType.split(',') : null;
                            _.each(
                                tgView.settingsModelObj.get('endpoints').toJSON(),
                                function(model) {
                                   filterByEndpoints.push(model.endpoint());
                            });
                            time_range = tgView.settingsModelObj.get('time_range');
                            from_time = tgView.settingsModelObj.get('from_time');
                            to_time = tgView.settingsModelObj.get('to_time');
                        } else {
                            if(sessionStorage.TG_CATEGORY) {
                                groupByTagType = sessionStorage
                                                .TG_CATEGORY.split(',');
                                if(sessionStorage.TG_SUBCATEGORY) {
                                    subGroupByTagType = sessionStorage
                                                .TG_SUBCATEGORY.split(',');
                                }
                            } else {
                                groupByTagType = ['app','deployment'];
                                subGroupByTagType = ['tier'];
                            }
                        }
                    return {
                        groupByTagType: groupByTagType,
                        subGroupByTagType: subGroupByTagType,
                        filterByEndpoints: filterByEndpoints,
                        time_range: time_range,
                        from_time: from_time,
                        to_time: to_time
                    };
                },
                getCategorizationObj: function() {
                    var categorization = [this.getTGSettings().groupByTagType
                                            .join('-')],
                        showInnerCircle = this.getSettingValue('showInnerCircle', true);
                    if(this.getTGSettings().subGroupByTagType && showInnerCircle) {
                        categorization.push(this.getTGSettings()
                                        .subGroupByTagType.join('-'));
                    }
                    return categorization;
                },
                updateStatsTimeSec: function() {
                    var fromTime = this.getTGSettings().time_range;
                    if(fromTime == -1 || fromTime == -2) {
                        var toTime = (fromTime == -1) ?
                            this.getTGSettings().to_time : 'now';
                        fromTime = this.getTGSettings().from_time;
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
                formatVN: function(value, sliceProjectOnly) {
                    var vnName = '';
                    if(value && value != cowc.UNKNOWN_VALUE) {
                        if(sliceProjectOnly) {
                            vnName = value.split(':')[1];
                        } else {
                            vnName = value
                                .replace(/([^:]*):([^:]*):([^:]*)/,'$3 ($2)');
                        }
                    }
                    return vnName;
                },
                updateRemoteIds: function (data) {
                    data = cowu.ifNull(data, []);
                    var tagMap = {}, tagsResponse = TrafficGroupsView.tagsResponse;
                    var tagRecords = _.result(tagsResponse,'0.tags',[]);
                    tagRecords.forEach(function(val,idx) {
                        var currTag = val['tag'];
                        tagMap[currTag.tag_id] = currTag.name;
                    });
                    $.each(data, function (idx, value) {
                        $.each(['eps.traffic.remote_app_id', 'eps.traffic.remote_deployment_id',
                            'eps.traffic.remote_prefix', 'eps.traffic.remote_site_id',
                            'eps.traffic.remote_tier_id'], function (idx, val) {
                                if(value[val] == '0')
                                    value[val] = '';
                                if(!_.isEmpty(tagMap[parseInt(value[val])])) {
                                    value[val] = tagMap[parseInt(value[val])];
                                }
                        });
                        //Strip-off the domain and project form FQN
                        $.each(['app','site','tier','deployment'],function(idx,tagName) {
                            if(typeof(value[tagName]) == 'string' && value[tagName].split(':').length == 3)
                                value[tagName] = value[tagName].split(':').pop();
                        });
                    });
                    return data;
                },
                resetChartView: function() {
                   $('#traffic-groups-legend-info').addClass('hidden');
                   $(this.el).find('svg g').empty();
                   $('#traffic-groups-grid-view').empty();
                },
                getSettingValue: function(option, defaultValue) {
                    var curSettings = localStorage
                        .getItem('container_' + layoutHandler.getURLHashObj().p
                                   + '_settings'),
                        selectedValue = defaultValue;
                    if(curSettings) {
                        curSettings = JSON.parse(curSettings);
                        selectedValue = curSettings[option];
                    }
                    return selectedValue;
                },
                updateContainerSettings: function(newObj, isFreshData) {
                    var curSettings = localStorage
                        .getItem('container_' + layoutHandler.getURLHashObj().p
                                   + '_settings');
                    if(curSettings) {
                        curSettings = JSON.parse(curSettings);
                        if(typeof newObj.showLegend != 'undefined' || !newObj) {
                            curSettings.showLegend ?
                                $('#traffic-groups-legend-info').show()
                                : $('#traffic-groups-legend-info').hide();
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
                                        'levels': curSettings.showInnerCircle ? 2 : 1
                                    });
                                } else {
                                    this.showEndPointStatsInGrid();
                                }
                            } else {
                                $('#traffic-groups-radial-chart').show();
                                $('#traffic-groups-grid-view').hide();
                                this.updateChart({
                                    'freshData': isFreshData,
                                    'levels': curSettings.showInnerCircle ? 2 : 1
                                });
                            }
                        }
                    } else {
                        this.updateChart({
                            'freshData': isFreshData
                        });
                    }
                },
                getContainerViewConfig : function() {
                    return {
                        rows: [
                            {
                                columns:[{
                                    elementId: 'view_type',
                                    view: "FormRadioButtonView",
                                    default: 'chart-stats',
                                    viewConfig: {
                                        label: 'View',
                                        path: 'view_type',
                                        class: 'col-xs-12',
                                        default: 'chart-stats',
                                        dataBindValue: 'view_type',
                                        templateId: cowc.TMPL_OPTNS_WITH_ICONS_RADIO_BUTTON_VIEW,
                                        elementConfig: {
                                            dataObj: [
                                                {value: 'grid-stats', icon: 'fa-table'},
                                                {value: 'chart-stats', icon: 'fa-bar-chart-o'}
                                            ]
                                        }
                                    }
                                }],
                            },
                            {
                                columns: [{
                                    elementId: 'showInnerCircle',
                                    view: 'FormCheckboxView',
                                    viewConfig: {
                                        label: 'Inner Circle',
                                        path: 'showInnerCircle',
                                        dataBindValue: 'showInnerCircle',
                                        templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                        class: 'showicon col-xs-6'
                                    }
                                }]
                            }, {
                                columns: [{
                                    elementId: 'showLegend',
                                    view: 'FormCheckboxView',
                                    viewConfig: {
                                        label: 'Legends',
                                        path: 'showLegend',
                                        dataBindValue: 'showLegend',
                                        templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                        class: 'showicon col-xs-6'
                                    }
                                }]
                            }, {
                                columns: [{
                                    elementId: 'untaggedEndpoints',
                                    view: 'FormCheckboxView',
                                    default: false,
                                    viewConfig: {
                                        label: 'Untagged Endpoints',
                                        path: 'untaggedEndpoints',
                                        dataBindValue: 'untaggedEndpoints',
                                        templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                        class: 'showicon col-xs-12'
                                    }
                                }]
                            }, {
                                columns: [{
                                    elementId: 'sliceByProject',
                                    view: 'FormCheckboxView',
                                    default: false,
                                    viewConfig: {
                                        label: 'Slice By Project',
                                        path: 'sliceByProject',
                                        dataBindValue: 'sliceByProject',
                                        templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                        class: 'showicon col-xs-12'
                                    }
                                }]
                            }
                        ]
                    }
                },
                getSelectedTime: function() {
                    var fromTime = this.getTGSettings().time_range,
                        toTime = 0;
                    if(fromTime == -1 || fromTime == -2) {
                        if(fromTime == -1) {
                            toTime = (new Date().getTime() - new Date(
                                    this.getTGSettings().to_time).getTime());
                            toTime = Math.round(toTime / (1000 * 60));
                        }
                        fromTime = (new Date().getTime() - new Date(
                                this.getTGSettings().from_time).getTime());
                        fromTime = Math.round(fromTime / (1000 * 60));
                    } else {
                        fromTime /= 60;
                    }
                    return {
                        fromTime : fromTime,
                        toTime : toTime
                    }
                },
                renderTrafficChart: function(option) {
                    this.resetChartView();
                    var self = this,
                        selctedTime = self.getSelectedTime();
                    self.updateStatsTimeSec();
                    var configTagDefObj = $.ajax({
                        url: 'api/tenants/config/get-config-details',
                        type: 'POST',
                        data: {data:[{type: 'tags'}]}
                    }).done(function(response) {
                        TrafficGroupsView.tagsResponse = response;
                        TrafficGroupsView.tagMap = _.groupBy(_.map(_.result(response, '0.tags', []), 'tag'), 'tag_id');
                    });
                    var currentProject = '';
                    if(contrail.getCookie(cowc.COOKIE_PROJECT) != 'undefined') {
                        currentProject = contrail.getCookie(cowc.COOKIE_PROJECT);
                    }
                    var clientPostData = {
                        "async": false,
                        "formModelAttrs": {
                            "from_time_utc": "now-" + (selctedTime.fromTime+ 'm'),
                            "to_time_utc": "now-" + (selctedTime.toTime + 'm'),
                            "select": "eps.client.remote_app_id, eps.client.remote_tier_id, eps.client.remote_site_id,"+
                                 "eps.client.remote_deployment_id, eps.client.remote_prefix, eps.client.remote_vn, eps.__key,"+
                                 " eps.client.app, eps.client.tier, eps.client.site, eps.client.deployment, eps.client.local_vn, name, SUM(eps.client.in_bytes),"+
                                 " SUM(eps.client.out_bytes), SUM(eps.client.in_pkts), SUM(eps.client.out_pkts), SUM(eps.client.added), SUM(eps.client.active)",
                            "table_type": "STAT",
                            "table_name": "StatTable.EndpointSecurityStats.eps.client",
                            "where": "(name Starts with " + contrail.getCookie(cowc.COOKIE_DOMAIN) + (currentProject ? ':' : '') + currentProject + ")",
                            "where_json": []
                        }
                    };

                    var serverPostData = {
                        "async": false,
                        "formModelAttrs": {
                            "from_time_utc": "now-" + (selctedTime.fromTime + 'm'),
                            "to_time_utc": "now-" + (selctedTime.toTime + 'm'),
                            "select": "eps.server.remote_app_id, eps.server.remote_tier_id, eps.server.remote_site_id,"+
                                 "eps.server.remote_deployment_id, eps.server.remote_prefix, eps.server.remote_vn, eps.__key,"+
                                 " eps.server.app, eps.server.tier, eps.server.site, eps.server.deployment, eps.server.local_vn, name, SUM(eps.server.in_bytes),"+
                                 " SUM(eps.server.out_bytes), SUM(eps.server.in_pkts), SUM(eps.server.out_pkts), SUM(eps.server.added), SUM(eps.server.active)",
                            "table_type": "STAT",
                            "table_name": "StatTable.EndpointSecurityStats.eps.server",
                            "where": "(name Starts with " + contrail.getCookie(cowc.COOKIE_DOMAIN) + (currentProject ? ':' : '') + currentProject + ")",
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
                        monitorInfraUtils.getContainerSettingsConfig(this.getContainerViewConfig));
                }
            });
            return TrafficGroupsView;
        });
