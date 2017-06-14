/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'lodashv4', 'contrail-view',
         'contrail-charts-view', 'contrail-list-model'],
        function(_, ContrailView, ContrailChartsView, ContrailListModel) {
            var TrafficGroupsView = ContrailView.extend({
                render : function() {
                    if(!($('#breadcrumb li:last a').text() == ctwc.TRAFFIC_GROUPS_ALL_APPS)){
                        pushBreadcrumb([ctwc.TRAFFIC_GROUPS_ALL_APPS]);
                    }
                    var trafficGroupsTmpl = contrail.getTemplate4Id('traffic-groups-template'),
                        trafficLinkInfoTmpl = contrail.getTemplate4Id('traffic-link-info-template'),
                        trafficLinkTooltipTmpl = contrail.getTemplate4Id('traffic-link-tooltip-template'),
                        collapsableWidgetTmpl = contrail.getTemplate4Id('collapsable-widget-template');
                    self = this;
                    self.$el.html(trafficGroupsTmpl());
                    self.$el.addClass('traffic-groups-view');

                    self.$el.find('[name="search-form"]').wrapCollapsibleWidget({
                        title: 'Traffic Groups'
                    });
                    self.$el.find('.widget-box').addClass('collapsed');

                    TrafficGroupsView.colorMap = {};
                    TrafficGroupsView.colorArray = [];
                    TrafficGroupsView.tagMap = {};
                    TrafficGroupsView.ruleMap = {};
                    function formatAppLabel(label,type) {
                        if(type && label) {
                            label = label.replace(new RegExp('_'+ type, 'g'), '');
                        }
                        return label;
                    }
                    function removeEmptyTags(names) {
                        return ((names && names.length > 1 && names[1] &&  names[1] != 'External')
                                ? names.join('-') : names[0]);
                    }
                    function showLinkInfo(d,el,e,chartScope){
                        var data = {
                                'src': formatAppLabel(_.result(d, 'link.0.data.id'), _.result(d, 'link.0.data.arcType')),
                                'dest': formatAppLabel(_.result(d, 'link.1.data.id'), _.result(d, 'link.1.data.arcType')),
                                'linkData':[]
                            }, ruleUUIDs = [], ruleKeys = [], level = 1;
                        if (_.result(d, 'innerPoints.length') == 4)
                            level = 2;
                        var srcNodeData = _.filter(d.link, function (val, idx){
                                return _.result(val, 'data.type') == 'src';
                        });
                        var dstNodeData = _.filter(d.link, function (val, idx){
                                return _.result(val, 'data.type') == 'dst';
                        });
                        var srcId = formatAppLabel(_.result(srcNodeData, '0.data.currentNode.names.0'), d.link[0].data.arcType),
                            dstId = formatAppLabel(_.result(dstNodeData, '0.data.currentNode.names.0'), d.link[1].data.arcType);
                        if (level == 2) {
                            srcId += ' && ' + formatAppLabel(_.result(srcNodeData, '0.data.currentNode.names.1'), d.link[0].data.arcType);
                            dstId += ' && ' + formatAppLabel(_.result(dstNodeData, '0.data.currentNode.names.1'), d.link[1].data.arcType);
                        }
                        var childData = _.result(d, 'link.0.data.dataChildren', []);
                        var srcSessionObjArr = _.chain(childData)
                                .filter(function (val, idx) {
                                    var app = formatAppLabel(_.result(srcNodeData, '0.data.currentNode.names.0'), d.link[0].data.arcType);
                                    if (level == 1) {
                                        return val['app'] == app;
                                    } else if (level == 2) {
                                        return val['app'] == app &&
                                        val['tier'] == formatAppLabel(_.result(srcNodeData, '0.data.currentNode.names.1'), d.link[0].data.arcType);
                                    }
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
                                    var app = formatAppLabel(_.result(dstNodeData, '0.data.currentNode.names.0'), d.link[1].data.arcType);
                                    if (level == 1) {
                                        return val['app'] == app;
                                    } else if (level == 2) {
                                        return val['app'] == app &&
                                        val['tier'] == formatAppLabel(_.result(dstNodeData, '0.data.currentNode.names.1'), d.link[1].data.arcType);
                                    }
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
                        $('#traffic-groups-link-info')
                            .html(trafficLinkInfoTmpl(data));
                        if($('#traffic-groups-radial-chart').hasClass('showLinkInfo')) {
                            $('.trafficGroups_sidePanel').
                                removeClass('animateLinkInfo');
                        } else {
                            $('.trafficGroups_sidePanel').
                                addClass('animateLinkInfo');
                            $('#traffic-groups-radial-chart')
                            .addClass('showLinkInfo');
                        }
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
                                                    src_session_initiated: _.result(srcSessionObj, uuid+'.0.session_initiated', 0),
                                                    src_session_responded: _.result(srcSessionObj, uuid+'.0.session_responded', 0),
                                                    dst_session_initiated: _.result(dstSessionObj, uuid+'.0.session_initiated', 0),
                                                    dst_session_responded: _.result(dstSessionObj, uuid+'.0.session_responded', 0),
                                                });
                                            }
                                        });
                                        TrafficGroupsView.ruleMap = ruleMap;
                                        data.policyRules = formattedRuleDetails;
                                        if (formattedRuleDetails.length) {
                                            var ruleDetailsTemplate = contrail.getTemplate4Id('traffic-rule-template');
                                            $('.traffic-rules').html(ruleDetailsTemplate(data));
                                        }
                                        return ruleDetails;
                                    }
                                }
                            }
                            var ruleDetailsModel = new ContrailListModel(listModelConfig);    
                        }
                    }

                    /**
                     * @levels  #Indicates no of levels to be drawn
                     */
                    this.updateChart = function(cfg) {
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
                                    linkCssClasses: ['implicitDeny'],
                                    arcLabelXOffset: 0,
                                    arcLabelYOffset: [-12,-6],
                                    colorScale: function (item) {
                                        var levelKey = 'TRAFFIC_GROUP_COLOR_LEVEL'+item.level,
                                            unassignedColors = _.difference(cowc[levelKey], _.values(TrafficGroupsView.colorMap[item.level])),
                                            itemName = (item.level == 1) ? item.name : formatAppLabel(item.name,item.arcType),
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
                                    showLinkTooltip:true,
                                    showLinkInfo: showLinkInfo,
                                    updateChart: this.updateChart,
                                    // levels: levels,
                                    hierarchyConfig: {
                                        parse: function (d) {
                                            var srcHierarchy = [d['app'], d['tier']],
                                                dstHierarchy = [d['eps.traffic.remote_app_id'], d['eps.traffic.remote_tier_id']],
                                                currentProject = contrail.getCookie(cowc.COOKIE_PROJECT),
                                                externalProject = '';
                                                // console.info(srcHierarchy,dstHierarchy);
                                            if(cfg['levels'] == 1) {
                                                srcHierarchy = [d['app']];
                                                dstHierarchy = [d['eps.traffic.remote_app_id']];
                                            } else if(cfg['levels'] == 2) {
                                                srcHierarchy = [d['app'], d['tier']],
                                                dstHierarchy = [d['eps.traffic.remote_app_id'], d['eps.traffic.remote_tier_id']];
                                            }
                                            var defaultRuleUUIDs = _.keys(cowc.DEFAULT_FIREWALL_RULES);
                                            if(typeof d['eps.__key'] == 'string' &&
                                                d['eps.__key'].indexOf(defaultRuleUUIDs[0]) > -1) {
                                                d.linkCssClass = 'implicitDeny';
                                            }
                                            var remoteVN = d['eps.traffic.remote_vn'],
                                                srcDeployment = d['deployment'],
                                                dstDeployment = d['eps.traffic.remote_deployment_id'];
                                            if(remoteVN && remoteVN.indexOf(':') > 0){
                                                var remoteProject = remoteVN.split(':')[1];
                                                if(currentProject != remoteProject) {
                                                    externalProject = 'externalProject';
                                                }
                                                if(dstDeployment) {
                                                    externalProject += ' '+dstDeployment;
                                                }
                                            } else {
                                                externalProject = 'external';
                                            }
                                            if(srcDeployment) {
                                                $.each(srcHierarchy, function(i) {
                                                    srcHierarchy[i] += '_ '+srcDeployment;
                                                });
                                            }
                                            if(externalProject) {
                                                $.each(dstHierarchy, function(i) {
                                                    if(externalProject == 'external'){
                                                        dstHierarchy[i] = 'External_external';
                                                    } else {
                                                        dstHierarchy[i] += '_'+externalProject;
                                                    }
                                                });
                                            }
                                            var src = {
                                                names: srcHierarchy,
                                                labelAppend: d['deployment'],
                                                id: srcHierarchy.join('-'),
                                                type: ' '+srcDeployment,
                                                value: d['SUM(eps.traffic.in_bytes)'] + d['SUM(eps.traffic.out_bytes)'],
                                                inBytes: d['SUM(eps.traffic.in_bytes)'],
                                                outBytes: d['SUM(eps.traffic.out_bytes)']
                                            };
                                            //If remote_vn project doesn't match with current project
                                            //set type = external
                                            //append '_external' to names [only for 1st-level app field]
                                            var dst = {
                                                names: dstHierarchy,
                                                labelAppend: d['eps.traffic.remote_deployment_id'],
                                                id: dstHierarchy.join('-'),
                                                type: externalProject,
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
                                            var arcTitle = data.namePath.slice(0);
                                            $.each(arcTitle, function(i) {
                                                arcTitle[i] = formatAppLabel(data.namePath[i],data.arcType);
                                            });
                                            var content = { title: removeEmptyTags(arcTitle), items: [] };
                                            content.title += '<hr/>'

                                            var childrenArr = data['children'],
                                                nameLevel1 = formatAppLabel(data.namePath[0], data.arcType),
                                                nameLevel2 = formatAppLabel(data.namePath[1], data.arcType);
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
                                                    if((data.namePath.length == 1 && currSession.app == nameLevel1) ||
                                                        (data.namePath.length == 2 && currSession.app == nameLevel1 && currSession.tier == nameLevel2)) {
                                                        if (currSession != null && currSession['nodata']) {
                                                            return 0;
                                                        }
                                                        return _.result(currSession,'SUM(eps.traffic.in_bytes)',0);
                                                    } else
                                                        return 0;
                                                }))
                                            }, {
                                                label: 'Traffic Out',
                                                value: formatBytes(_.sumBy(dataChildren,function(currSession) {
                                                    if((data.namePath.length == 1 && currSession.app == nameLevel1) ||
                                                        (data.namePath.length == 2 && currSession.app == nameLevel1 && currSession.tier == nameLevel2)) {
                                                        if (currSession != null && currSession['nodata']) {
                                                            return 0;
                                                        }
                                                        return _.result(currSession,'SUM(eps.traffic.out_bytes)',0);
                                                    } else
                                                        return 0;
                                                }))
                                            });
                                        } else {
                                            var d = data,
                                                links = d.link,
                                                srcNames = d.link[0].data.currentNode.names.slice(0),
                                                dstNames = d.link[1].data.currentNode.names.slice(0);
                                            $.each(srcNames, function(i) {
                                                srcNames[i] = formatAppLabel(srcNames[i],d.link[0].data.arcType);
                                            });
                                            $.each(dstNames, function(i) {
                                                dstNames[i] = formatAppLabel(dstNames[i],d.link[1].data.arcType);
                                            });
                                            var srcTags = removeEmptyTags(srcNames),
                                                dstTags = removeEmptyTags(dstNames),
                                                dstIndex = _.findIndex(links, function(link) { return link.data.type == 'dst' });
                                            if((srcTags == dstTags) || _.includes(d.link[dstIndex].data.arcType, 'externalProject')
                                                 || _.includes(d.link[dstIndex].data.arcType, 'external')) {
                                                links = d.link.slice(0,1);
                                            }
                                            var content = { title : '', items: [] },
                                                linkData = {
                                                    src: srcTags,
                                                    dst: dstTags
                                                };
                                            linkData.items = [];
                                            _.each(links, function(link) {
                                                var namePath = link.data.currentNode ? link.data.currentNode.names : '',
                                                    nameLevel1 = formatAppLabel(namePath[0], link.data.arcType),
                                                    nameLevel2 = formatAppLabel(namePath[1], link.data.arcType),
                                                    data = {
                                                    trafficIn: formatBytes(_.sumBy(link.data.dataChildren,
                                                        function(bytes) {
                                                            if((namePath.length == 1 && bytes.app ==  nameLevel1)
                                                                || namePath.length == 2 && bytes.app ==  nameLevel1 && bytes.tier ==  nameLevel2) {
                                                                if (bytes != null && bytes['nodata']) {
                                                                    return 0;
                                                                }
                                                                return _.result(bytes,'SUM(eps.traffic.in_bytes)',0);
                                                            } else
                                                                return 0;

                                                        })),
                                                    trafficOut: formatBytes(_.sumBy(link.data.dataChildren,
                                                        function(bytes) {
                                                            if((namePath.length == 1 && bytes.app ==  nameLevel1)
                                                                || namePath.length == 2 && bytes.app ==  nameLevel1 && bytes.tier ==  nameLevel2) {
                                                                if (bytes != null && bytes['nodata']) {
                                                                    return 0;
                                                                }
                                                                return _.result(bytes,'SUM(eps.traffic.out_bytes)',0);
                                                            } else
                                                                return 0
                                                        }))
                                                };
                                                var curLinkNames = link.data.currentNode.names.slice(0);
                                                $.each(curLinkNames, function(i) {
                                                    curLinkNames[i] = formatAppLabel(curLinkNames[i],link.data.arcType);
                                                });
                                                linkData.items.push({
                                                    name: removeEmptyTags(curLinkNames),
                                                    trafficIn: data.trafficIn,
                                                    trafficOut: data.trafficOut
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
                        viewInst.updateConfig(config);
                        var data = self.trafficData ? JSON.parse(JSON.stringify(self.trafficData))
                                     : viewInst.model.getItems();
                        //data = self.formatEmptyBytes(data,(cfg.levels ? cfg.levels : 1));
                        viewInst.render(data);
                    },
                    this.formatEmptyBytes = function(data, level) {
                        // If sum of in-bytes and out-bytes of a link is 0, making in-bytes and out-bytes
                        // of first record of link to 1 to plot the link
                        self.level = level;
                        var dataTrafficMap = _.groupBy(data, function(d) {
                            if(self.level == 1) {
                                return d.app + d['eps.traffic.remote_app_id'] +
                                       d['deployment'] + d['eps.traffic.remote_deployment_id'];
                            } else {
                                return d.app + d.tier + d['eps.traffic.remote_app_id'] +
                                       d['eps.traffic.remote_tier_id'] + d['deployment'] + d['eps.traffic.remote_deployment_id'];
                            }
                        });
                        _.each(dataTrafficMap, function(link) {
                            var linkSum = _.reduce(link, function(sum,value,key) {
                                return sum+value['SUM(eps.traffic.in_bytes)']+value['SUM(eps.traffic.out_bytes)'];
                            }, 0);
                            if(linkSum == 0) {
                                _.each(link, function(rec,idx) {
                                    if(idx ==0) {
                                        rec['SUM(eps.traffic.in_bytes)'] =
                                        rec['SUM(eps.traffic.out_bytes)'] = 1;
                                    }
                                    rec.nodata = true;
                                });
                            }
                        });
                        return data;
                    }
                    var postData = {
                        "async": false,
                        "formModelAttrs": {
                            "time_granularity_unit": "secs",
                            "from_time_utc": "now-2h",
                            "to_time_utc": "now",
                            "time_granularity": 600*2,
                            "select": "T=, eps.traffic.remote_app_id, eps.traffic.remote_tier_id, eps.traffic.remote_site_id,"+
                                 "eps.traffic.remote_deployment_id, eps.traffic.remote_prefix, eps.traffic.remote_vn, eps.__key,"+
                                 " app, tier, site, deployment, vn, name, SUM(eps.traffic.in_bytes),"+
                                 " SUM(eps.traffic.out_bytes), SUM(eps.traffic.in_pkts), SUM(eps.traffic.initiator_session_count)," +
                                 " SUM(eps.traffic.responder_session_count), SUM(eps.traffic.out_pkts)",
                            "table_type": "STAT",
                            "table_name": "StatTable.EndpointSecurityStats.eps.traffic",
                            "where": "(name Starts with " + contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' + contrail.getCookie(cowc.COOKIE_PROJECT) + ")",
                            "where_json": []
                        }
                    }
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
                                            "SUM(eps.traffic.in_bytes)": 1,
                                            "SUM(eps.traffic.out_bytes)": 1,
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
                                    var chartData = [];
                                    $.each(data, function (idx, value) {
                                        if (value['SUM(eps.traffic.out_bytes)'] + value['SUM(eps.traffic.in_bytes)'] == 0) {
                                            value['SUM(eps.traffic.in_bytes)'] = value['SUM(eps.traffic.out_bytes)'] = 1;
                                            value.nodata = true;
                                        }
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
                                    //data = self.formatEmptyBytes(data,1);
                                    return data;
                                }
                            }]
                        },
                        cacheConfig : {

                        }
                    };

                    var viewInst = new ContrailChartsView({
                        el: this.$el.find('#traffic-groups-radial-chart'),
                        model: new ContrailListModel(listModelConfig)
                    });
                    this.updateChart({
                        levels:1
                    });
                }
            });
            return TrafficGroupsView;
        });
