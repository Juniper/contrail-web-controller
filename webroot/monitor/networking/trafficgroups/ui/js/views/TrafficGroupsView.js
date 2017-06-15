/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'lodashv4', 'contrail-view',
         'contrail-charts-view', 'contrail-list-model'],
        function(_, ContrailView, ContrailChartsView, ContrailListModel) {
            var TrafficGroupsView = ContrailView.extend({
                resetTrafficStats: function(e) {
                    e.preventDefault();
                    var statsTime = '';
                   if($(e.currentTarget).hasClass('clear-traffic-stats')) {
                        statsTime = '0';
                    }
                    self.renderTrafficChart(statsTime);
                    $(self.el).find('svg g').empty();
                },
                showSessionsInfo: function() {
                    require(['monitor/networking/trafficgroups/ui/js/views/TrafficGroupsEPSTabsView'], function(EPSTabsView) {
                        var linkInfo = self.getLinkInfo(self.selectedLinkData),
                            linkData = {
                                endpointNames: [linkInfo.srcTags, linkInfo.dstTags],
                                endpointStats: []
                            }
                            epsTabsView = new EPSTabsView();
                        _.each(linkInfo.links, function(link) {
                            var namePath = link.data.currentNode ? link.data.currentNode.names : '',
                                epsData = _.filter(link.data.dataChildren,
                                    function(session) {
                                        return self.isRecordMatched(namePath, session, link.data);
                                    });
                            linkData.endpointStats.push(epsData);
                        });
                        epsTabsView.render(linkData);
                    });
                },
                showLinkInfo(d,el,e,chartScope) {
                    var ruleUUIDs = [], ruleKeys = [], level = 1;
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
                    var srcSessionObjArr = _.chain(childData)
                            .filter(function (val, idx) {
                                var namePath = _.result(srcNodeData, '0.data.currentNode.names');
                                return self.isRecordMatched(namePath, val, d.link[0].data);
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
                                return {
                                    'eps.__key': uuid,
                                    'session_responded': _.sumBy(objs, 'SUM(eps.traffic.responder_session_count)'),
                                    'session_initiated': _.sumBy(objs, 'SUM(eps.traffic.initiator_session_count)')
                                }
                            }).value();
                    var dstSessionObjArr, dstSessionObj;
                    //If it is intralink no need to calculate endpoint2 sessions
                    if (srcId != dstId) {
                        dstSessionObjArr = _.chain(childData)
                            .filter(function (val, idx) {
                                var namePath = _.result(dstNodeData, '0.data.currentNode.names');
                                return self.isRecordMatched(namePath, val, d.link[0].data);
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
                                return {
                                    'eps.__key': uuid,
                                    'session_responded': _.sumBy(objs, 'SUM(eps.traffic.responder_session_count)'),
                                    'session_initiated': _.sumBy(objs, 'SUM(eps.traffic.initiator_session_count)')
                                }
                            }).value();
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
                    _.each(chartScope.ribbons, function (ribbon) {
                       ribbon.selected = false;
                       ribbon.active = false;
                    });
                    d.selected = true;
                    d.active = true;
                    chartScope._render();
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
                                                //policy_name: _.result(ruleDetailsObj, 'firewall_policy_back_refs.0.to.3', '-') +':'+
                                                  //          _.result(ruleDetailsObj, 'display_name'),
                                                policy_name: policy_name,
                                                srcId: srcId,
                                                src_session_initiated: _.result(srcSessionObj, ruleUUID+'.0.session_initiated', 0),
                                                src_session_responded: _.result(srcSessionObj, ruleUUID+'.0.session_responded', 0),
                                                dstId: dstId,
                                                dst_session_initiated: _.result(dstSessionObj, ruleUUID+'.0.session_initiated', 0),
                                                dst_session_responded: _.result(dstSessionObj, ruleUUID+'.0.session_responded', 0),
                                                rule_name: rule_name,
                                                implicitRule: '',
                                                simple_action: simple_action,
                                                service: serviceStr,
                                                direction: direction == '>' ? 'uni': 'bi',
                                                srcType: srcType,
                                                dstType: dstType,
                                                src: src,
                                                dst: dst
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
                                                dst_session_initiated: _.result(dstSessionObj, uuid+'.0.session_initiated', 0),
                                                dst_session_responded: _.result(dstSessionObj, uuid+'.0.session_responded', 0),
                                            });
                                        }
                                    });
                                    TrafficGroupsView.ruleMap = ruleMap;
                                    data.srcId = srcId;
                                    data.dstId = dstId;
                                    data.policyRules = formattedRuleDetails;
                                    if (formattedRuleDetails.length) {
                                        var ruleDetailsTemplate = contrail.getTemplate4Id('traffic-rule-template');
                                        $('#traffic-groups-link-info').html(ruleDetailsTemplate(data));
                                        if($('#traffic-groups-radial-chart').hasClass('showLinkInfo')) {
                                            $('.trafficGroups_sidePanel').
                                                removeClass('animateLinkInfo');
                                        } else {
                                            $('.trafficGroups_sidePanel').
                                                addClass('animateLinkInfo');
                                            $('#traffic-groups-radial-chart')
                                            .addClass('showLinkInfo');
                                        }
                                        $('.allSessionInfo').on('click', self.showSessionsInfo);
                                        $('#traffic-groups-radial-chart')
                                         .on('click','',{ thisChart:chartScope,thisRibbon:d },
                                          function(ev){
                                            if(ev.data.thisChart && $(ev.target)
                                              .parents('#'+ev.data.thisChart.id).length == 0){
                                                _.each(ev.data.thisChart.ribbons,
                                                 function (ribbon) {
                                                   ribbon.selected = false;
                                                   ribbon.active = false;
                                                });
                                                $('#traffic-groups-radial-chart')
                                                .removeClass('showLinkInfo');
                                                $('#traffic-groups-link-info').html('');
                                                ev.data.thisChart._render();
                                            }
                                        });
                                    }
                                    return ruleDetails;
                                }
                            }
                        }
                        var ruleDetailsModel = new ContrailListModel(listModelConfig);
                    }
                },
                updateChart: function(cfg) {
                    var extendConfig = {}
                    if(_.isEmpty(cfg)) {
                        cfg = {};
                    }
                    if(cfg['levels']) {
                        extendConfig['drillDownLevel'] = cfg['levels'];
                    } else if(cfg) {
                        extendConfig = cfg;
                    }
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
                                colorScale: function (item) {
                                    var levelKey = 'TRAFFIC_GROUP_COLOR_LEVEL'+item.level,
                                        unassignedColors = _.difference(cowc[levelKey], _.values(TrafficGroupsView.colorMap[item.level])),
                                        itemName = item.displayLabels[item.level-1],
                                        extraColors = TrafficGroupsView.colorArray;
                                    if(unassignedColors.length == 0) {
                                        if(!extraColors[item.level] || extraColors[item.level].length == 0) {
                                            extraColors[item.level] = cowc[levelKey].slice(0);
                                        }
                                        unassignedColors = extraColors[item.level];
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
                                // levels: levels,
                                hierarchyConfig: {
                                    parse: function (d) {
                                        var srcDeployment = d['deployment'],
                                            dstDeployment = d['eps.traffic.remote_deployment_id'],
                                            srcHierarchy = [d['app']],
                                            dstHierarchy = [d['eps.traffic.remote_app_id']],
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
                                        if(cfg['levels'] == 2) {
                                            srcHierarchy = [d['app'], d['tier']],
                                            dstHierarchy = [d['eps.traffic.remote_app_id'], d['eps.traffic.remote_tier_id']];
                                        }

                                        if(typeof d['eps.__key'] == 'string' &&
                                            d['eps.__key'].indexOf(implicitDenyKey) > -1) {
                                            d.linkCssClass = 'implicitDeny';
                                        }
                                        if(typeof d['eps.__key'] == 'string' &&
                                            d['eps.__key'].indexOf(implicitAllowKey) > -1) {
                                            d.linkCssClass = 'implicitAllow';
                                        }
                                        $.each(srcHierarchy, function(idx) {
                                            srcDisplayLabel.push(self.formatLabel(srcHierarchy,
                                                              idx, srcDeployment));
                                        });

                                        if(remoteVN && remoteVN.indexOf(':') > 0) {
                                            var remoteProject = remoteVN.split(':')[1];
                                            if(currentProject != remoteProject) {
                                                externalType = 'externalProject';
                                            }
                                        } else {
                                            externalType = 'external';
                                        }

                                        $.each(dstHierarchy, function(idx) {
                                            dstDisplayLabel.push(self.formatLabel(dstHierarchy,
                                                              idx, dstDeployment));
                                            if(externalType) {
                                                if(externalType == 'external') {
                                                    dstHierarchy[idx] = 'External_external';
                                                    dstDisplayLabel[idx] = 'External';
                                                } else {
                                                    dstHierarchy[idx] += '_' + externalType;
                                                }
                                            }
                                        });
                                        var src = {
                                            names: srcHierarchy,
                                            labelAppend: '',
                                            displayLabels: srcDisplayLabel,
                                            id: srcHierarchy.join('-'),
                                            value: d['SUM(eps.traffic.in_bytes)'] + d['SUM(eps.traffic.out_bytes)'],
                                            inBytes: d['SUM(eps.traffic.in_bytes)'],
                                            outBytes: d['SUM(eps.traffic.out_bytes)']
                                        };
                                        //If remote_vn project doesn't match with current project
                                        //set type = external
                                        //append '_external' to names [only for 1st-level app field]
                                        var dst = {
                                            names: dstHierarchy,
                                            labelAppend: '',
                                            displayLabels: dstDisplayLabel,
                                            id: dstHierarchy.join('-'),
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
                    self.chartInfo = viewInst.getChartViewInfo(config,
                                "dendrogram-chart-id", self.addtionalEvents());
                    var data = self.trafficData ? JSON.parse(JSON.stringify(self.trafficData))
                                 : viewInst.model.getItems();
                    viewInst.render(data, self.chartInfo.chartView);
                },
                addtionalEvents: function() {
                    return [{
                            event: 'click',
                            selector: 'node',
                            handler: self._onClickNode,
                            handlerName: '_onClickNode'
                        },
                        {
                            event: 'click',
                            selector: 'link',
                            handler: self._onClickLink,
                            handlerName: '_onClickLink'
                        },
                        {
                            event: 'mousemove',
                            selector: 'link',
                            handler: self._onMousemoveLink,
                            handlerName: '_onMousemoveLink'
                        },
                        {
                            event: 'mouseout',
                            selector: 'link',
                            handler: self._onMouseoutLink,
                            handlerName: '_onMouseoutLink'
                        }
                    ];
                },
                _onClickNode: function(d, el ,e) {
                    var chartScope = self.chartInfo.component;
                    if(chartScope.config.attributes.
                        expandLevels == 'disable') {
                      return;
                    }
                    if(chartScope.clearArcTootltip) {
                      clearTimeout(chartScope.clearArcTootltip);
                    }
                    var levels = 2;
                    //If clicked on 2nd level arc,collapse to 1st level
                    if(d.depth == 2 || d.height == 2)
                        levels = 1;
                        self.updateChart({levels: levels});
                    el.classList.remove(chartScope.selectorClass('active'));
                },
                _onClickLink: function(d, el ,e) {
                    var chartScope = self.chartInfo.component;
                    if(chartScope.config.attributes.showLinkInfo) {
                        self.showLinkInfo(d, el, e, chartScope);
                    }
                },
                _onMousemoveLink: function(d, el ,e) {
                    var chartScope = self.chartInfo.component,
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
                    var chartScope = self.chartInfo.component;
                    if(chartScope.clearLinkTooltip) {
                      clearTimeout(chartScope.clearLinkTooltip);
                    }
                    chartScope.actionman.fire('HideComponent', 'tooltip-id');
                },
                getLinkInfo: function(links) {
                    var srcTags = self.removeEmptyTags(_.result(links, '0.data.currentNode.displayLabels')),
                        dstTags = self.removeEmptyTags(_.result(links, '1.data.currentNode.displayLabels')),
                        dstIndex = _.findIndex(links, function(link) { return link.data.type == 'dst' });
                    if((srcTags == dstTags) || _.includes(links[dstIndex].data.arcType, 'externalProject')
                         || _.includes(links[dstIndex].data.arcType, 'external')) {
                        links = links.slice(0,1);
                    }
                    return {links, srcTags, dstTags};
                },
                formatLabel: function(labels, idx, deployment) {
                    var labelMap = [
                        {'type': 'application', 'icon': cowc.APPLICATION_ICON},
                        {'type': 'tier', 'icon': cowc.TIER_ICON}
                    ],
                    displayLabel = '';
                    if(labels) {
                        displayLabel = labels[idx].replace(labelMap[idx].type, labelMap[idx].icon);
                    }
                    deployment = deployment ? ('-' + deployment) : '';
                    labels[idx] += deployment;
                    if(idx == 0) {
                        displayLabel += deployment.replace('deployment', cowc.DEPLOYMENT_ICON);
                    }
                    return displayLabel;
                },
                removeEmptyTags: function(names) {
                    return ((names && names.length > 1 && names[1] &&  names[1] != 'External')
                            ? names.join('-') : names[0]);
                },
                isRecordMatched: function(names, record, data) {
                    var deployment = record['deployment'] ? '-' + record['deployment'] : '',
                        arcType = data.arcType ? '_' + data.arcType : '';
                    return ((names.length == 1 && (record.app + deployment + arcType) == names[0]) ||
                            (names.length == 2 && (record.app + deployment + arcType) == names[0]
                             && (record.tier + deployment + arcType) == names[1]));
                },
                renderTrafficChart: function(statsTime) {
                    var statsTimeDuration = '120',
                        displayTime = '2 Hrs',
                        lastStatsTime = localStorage.traffic_stats_time,
                        curDomainProject = contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' +
                                           contrail.getCookie(cowc.COOKIE_PROJECT);
                    if(statsTime) {
                        displayTime = statsTime + ' Mins';
                        statsTimeDuration = statsTime;
                        if(!lastStatsTime) {
                            localStorage.setItem("traffic_stats_time", JSON.stringify({}));
                        }
                        lastStatsTime = JSON.parse(localStorage.getItem('traffic_stats_time'));
                        lastStatsTime[curDomainProject] = new Date().getTime();
                        localStorage.setItem("traffic_stats_time", JSON.stringify(lastStatsTime));
                    } else if(lastStatsTime && JSON.parse(lastStatsTime)
                             && JSON.parse(lastStatsTime)[curDomainProject]) {
                        var timeDiff = new Date().getTime() - JSON.parse(lastStatsTime)[curDomainProject];
                        statsTimeDuration = Math.round(timeDiff / (1000 * 60));
                        var statsTimeHrs = Math.floor(statsTimeDuration / 60),
                            statsTimeMins = statsTimeDuration % 60;
                        if(statsTimeHrs < 2) {
                            displayTime = (statsTimeHrs > 0 ? statsTimeHrs +' Hrs ' : '') +
                                          (statsTimeMins > 0 ? statsTimeMins +' Mins' : '');
                        } else {
                            statsTimeDuration = '120';
                        }
                    }
                    $(self.el).find('.statsTimeDuration').text((displayTime ? displayTime : '0 Mins'));
                    var postData = {
                        "async": false,
                        "formModelAttrs": {
                            "from_time_utc": "now-" + (statsTimeDuration+'m'),
                            "to_time_utc": "now",
                            "select": "eps.traffic.remote_app_id, eps.traffic.remote_tier_id, eps.traffic.remote_site_id,"+
                                 "eps.traffic.remote_deployment_id, eps.traffic.remote_prefix, eps.traffic.remote_vn, eps.__key,"+
                                 " app, tier, site, deployment, vn, name, SUM(eps.traffic.in_bytes),"+
                                 " SUM(eps.traffic.out_bytes), SUM(eps.traffic.in_pkts), SUM(eps.traffic.initiator_session_count)," +
                                 " SUM(eps.traffic.responder_session_count), SUM(eps.traffic.out_pkts)",
                            "table_type": "STAT",
                            "table_name": "StatTable.EndpointSecurityStats.eps.traffic",
                            "where": "(name Starts with " + contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' + contrail.getCookie(cowc.COOKIE_PROJECT) + ")",
                            "where_json": []
                        }
                    };
                    var listModelConfig = {
                        remote : {
                            ajaxConfig : {
                                url: monitorInfraConstants.monitorInfraUrls['QUERY'],
                                type: 'POST',
                                data: JSON.stringify(postData)
                            },
                            dataParser : function (response) {
                                if(false || response['data'].length == 0) {
                                    var curDomain = contrail.getCookie(cowc.COOKIE_DOMAIN)
                                        + ':' + contrail.getCookie(cowc.COOKIE_PROJECT);
                                    return [{
                                            "app": curDomain,
                                            "eps.traffic.remote_app_id": "",
                                            "eps.traffic.remote_vn": curDomain,
                                            "SUM(eps.traffic.in_bytes)": 0,
                                            "SUM(eps.traffic.out_bytes)": 0,
                                            'nodata': true
                                        }];
                                } else {
                                    return response['data'];
                                }
                            }
                        },
                        vlRemoteConfig: {
                            vlRemoteList: [{
                                getAjaxConfig: function() {
                                    return {
                                        url: 'api/tenants/config/get-config-details',
                                        type:'POST',
                                        data:JSON.stringify({data:[{type: 'tags'}]})
                                    }
                                },
                                successCallback: function(response, contrailListModel) {
                                    TrafficGroupsView.tagMap = _.groupBy(_.map(_.result(response, '0.tags', []), 'tag'), 'tag_id');
                                    var tagMap = {};
                                    var tagRecords = _.result(response,'0.tags',[]);
                                    tagRecords.forEach(function(val,idx) {
                                        var currTag = val['tag'];
                                        tagMap[currTag.tag_id] = currTag.name;
                                    });
                                    var data = contrailListModel.getItems();
                                    contrailListModel.onAllRequestsComplete.subscribe(function() {
                                        var data = contrailListModel.getItems();
                                        if(data && data.length == 1 && data[0].nodata) {
                                            self.updateChart({
                                                'expandLevels': 'disable',
                                                'showLinkInfo': false
                                            });
                                        }
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
                                        function formatVN(vnName) {
                                            return vnName.replace(/([^:]*):([^:]*):([^:]*)/,'$3 ($2)');
                                        }
                                        //If app is empty, put vn name in app
                                        if(_.isEmpty(value['app']) || value['app'] == '0') {
                                            value['app'] = formatVN(value['vn']);
                                        }
                                        if(value['eps.traffic.remote_app_id'] == '' || value['eps.traffic.remote_app_id'] == '0') {
                                            // if(value['eps.traffic.remote_vn'] != '') {
                                                value['eps.traffic.remote_app_id'] = formatVN(value['eps.traffic.remote_vn']);
                                            // } else {
                                            //     value['eps.traffic.remote_app_id'] = value['vn'];
                                            // }
                                        }
                                        //Strip-off the domain and project form FQN
                                        $.each(['app','site','tier','deployment'],function(idx,tagName) {
                                            if(typeof(value[tagName]) == 'string' && value[tagName].split(':').length == 3)
                                                value[tagName] = value[tagName].split(':').pop();
                                        });
                                    });
                                    // cowu.populateTrafficGroupsData(data);
                                    self.trafficData = JSON.parse(JSON.stringify(data));
                                    return data;
                                }
                            }]
                        },
                        cacheConfig : {

                        }
                    };
                    viewInst = new ContrailChartsView({
                        el: this.$el.find('#traffic-groups-radial-chart'),
                        model: new ContrailListModel(listModelConfig)
                    });
                    this.updateChart({
                        levels:1
                    });
                },
                render: function() {
                    if(!($('#breadcrumb li:last a').text() == ctwc.TRAFFIC_GROUPS_ALL_APPS)){
                        pushBreadcrumb([ctwc.TRAFFIC_GROUPS_ALL_APPS]);
                    }
                    var trafficGroupsTmpl = contrail.getTemplate4Id('traffic-groups-template');
                    self = this;
                    self.$el.html(trafficGroupsTmpl({widgetTitle:'Traffic Groups'}));
                    self.$el.addClass('traffic-groups-view');
                    $('.clear-traffic-stats, .refresh-traffic-stats').on('click', self.resetTrafficStats);
                    TrafficGroupsView.colorMap = {};
                    TrafficGroupsView.colorArray = [];
                    TrafficGroupsView.tagMap = {};
                    TrafficGroupsView.ruleMap = {};
                    /**
                     * @levels  #Indicates no of levels to be drawn
                     */
                    this.renderTrafficChart();
                }
            });
            return TrafficGroupsView;
        });
