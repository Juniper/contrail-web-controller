/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var UnderlayUtils = function () {
        var self = this;

        self.getUnderlayPRouterInterfaceTabViewConfig = function (viewConfig) {
            return {
                elementId: ctwc.UNDERLAY_PROUTER_INTERFACE_TAB_ID,
                title: ctwl.UNDERLAY_PROUTER_INTERFACES_TITLE,
                view: "GridView",
                viewConfig: {
                    elementConfig:{
                        header: {
                            title: {
                                text: contrail.format('Interfaces ( {0} )',
                                    viewConfig['hostName'])
                            },
                            defaultControls: {
                                collapseable: true,
                                exportable: true,
                                refreshable: false,
                                searchable: true
                            }
                        },
                        body: {
                            options: {
                                autoRefresh: false,
                                checkboxSelectable: false,
                                detail: ctwu.getDetailTemplateConfigToDisplayRawJSON(),
                                fixedRowHeight: 30
                            },
                            dataSource: {
                                data: viewConfig['data']
                            }
                        },
                        columnHeader: {
                            columns: [{
                                field:'ifDescr',
                                name:'Name',
                                minWidth: 150,
                            },{
                                field:'ifAdminStatus',
                                name:'Status',
                                minWidth: 100,
                                formatter:function(r,c,v,cd,dc) {
                                    var adminStatus =
                                        getValueByJsonPath(dc,'raw_json;ifAdminStatus','-'),
                                        operStatus =
                                        getValueByJsonPath(dc,'raw_json;ifOperStatus','-');
                                    if(adminStatus == 1 && operStatus == 1) {
                                        return 'Up';
                                    } else if (adminStatus == 1 && operStatus != 1) {
                                        return 'Oper Down';
                                    } else if (adminStatus != 1 && operStatus != 1) {
                                        return 'Admin Down';
                                    } else {
                                        return '-';
                                    }
                                }
                            },{
                                field:'ifPhysAddress',
                                name:'MAC Address',
                                minWidth:150,
                            },{
                                field:'ifIndex',
                                name:'Index',
                                minWidth: 150
                            },{
                                field:'bandwidth',
                                name:'Traffic (In/Out)',
                                minWidth:150,
                                formatter:function(r,c,v,cd,dc) {
                                    return contrail.format("{0} / {1}",formatBytes(dc['ifInOctets']),formatBytes(dc['ifOutOctets']));
                                }
                            }]
                        }
                    }
                },
            }
        };

        self.getUnderlayDetailsTabViewConfig = function(viewConfig) {
            return {
                elementId: ctwc.UNDERLAY_DETAILS_TAB_ID,
                title: ctwl.TITLE_DETAILS,
                view: "DetailsView",
                viewConfig: {
                    data: viewConfig.data,
                    templateConfig: self.
                        getUnderlayDetailsTabTemplateConfig(viewConfig.data),
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                },
            }
        };

        self.getUnderlayDetailsTabTemplateConfig = function(data) {
            return {
                advancedViewOptions: false,
                templateGenerator: 'RowSectionTemplateGenerator',
                templateGeneratorConfig: {
                    rows: [
                        {
                            templateGenerator: 'ColumnSectionTemplateGenerator',
                            templateGeneratorConfig: {
                                columns: [
                                    {
                                        class: 'col-xs-6',
                                        rows: [
                                            {
                                                title: contrail.format('{0} ( {1} )',
                                                   ctwl.UNDERLAY_PROUTER_DETAILS,
                                                   data.hostName),
                                                templateGenerator:
                                                    'BlockListTemplateGenerator',
                                                templateGeneratorConfig: [
                                                    {
                                                        key: 'hostName',
                                                        label: 'Hostname',
                                                        templateGenerator:
                                                            'TextGenerator'
                                                    },{
                                                        key: 'description',
                                                        templateGenerator:
                                                            'TextGenerator'
                                                    },{
                                                        key: 'intfCnt',
                                                        templateGenerator:
                                                            'TextGenerator',
                                                        valueClass: 'intfCnt',
                                                        templateGeneratorConfig: {
                                                            formatter: 'underlay-link',
                                                            params: {}
                                                        }
                                                    },{
                                                        key: 'managementIP',
                                                        label: 'Management IP',
                                                        templateGenerator:
                                                            'TextGenerator',
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                    ]
                }
            }
        };

        self.getTrafficStatisticsTabViewConfig = function (data) {
            var ajaxConfig = {};
            var endpoints = ifNull(data['endpoints'],[]);
            var sourceType = getValueByJsonPath(data,'sourceElement;node_type','-');
            var targetType = getValueByJsonPath(data,'targetElement;node_type','-');
            var view = 'LineWithFocusChartView', modelMap = null;
            var viewConfig = {}, viewPathPrefix, app;
            if(sourceType == ctwc.PROUTER && targetType == ctwc.PROUTER) {
                var postData = {
                        "data": {
                             "endpoints": endpoints,
                             "sampleCnt": 150,
                             "minsSince": 180
                    }
                };
                ajaxConfig = {
                    url: '/api/tenant/networking/underlay/prouter-link-stats',
                    type: 'POST',
                    "data": JSON.stringify(postData),
                };
                viewConfig.view = view;
                viewConfig.link = ctwc.PROUTER;
                viewConfig.modelConfig = {};
                viewConfig.modelConfig.remote = {
                    ajaxConfig: ajaxConfig,
                };
            } else if(sourceType == ctwc.PROUTER && targetType == ctwc.VROUTER) {
                var vrouter = (sourceType == ctwc.VROUTER) ?
                    data['sourceElement']['name']: data['targetElement']['name'];
                var params = {
                    minsSince: 60,
                    sampleCnt: 120,
                    useServerTime: true,
                    vrouter: vrouter,
                };
                ajaxConfig = {
                    url: '/api/tenant/networking/underlay/vrouter/stats?'+$.param(params)
                };
                viewConfig.view = view;
                viewConfig.link = ctwc.VROUTER;
                viewConfig.parseFn = ctwp.parseTrafficLineChartData;
                viewConfig.modelConfig = {};
                viewConfig.modelConfig.remote = {
                     ajaxConfig: ajaxConfig,
                     dataParser: function (response) {
                         return [response];
                     }
                };
                viewConfig.widgetConfig = {
                        view: 'WidgetView',
                        elementId: ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID+ '-widget',
                        viewConfig: {
                            header: {
                                title:
                                    contrail.format('Traffic Statistics of {0} -- {1}',
                                        data['sourceElement']['name'], vrouter)
                            },
                            controls: {
                                top: {
                                    default: {
                                        collapseable: true,
                                    }
                                }
                            }
                        }
                    }
            } else if(sourceType == ctwc.VIRTUALMACHINE ||
                    targetType == ctwc.VIRTUALMACHINE) {
                var instanceUUID = getValueByJsonPath(data, 'targetElement;name','-');
                var vmName = getValueByJsonPath(data,
                    'targetElement;more_attributes;vm_name','-');
                var modelKey = ctwc.get(ctwc.UMID_INSTANCE_UVE, instanceUUID);
                view = 'InstanceTrafficStatsView';
                app = cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix = 'monitor/networking/ui/js/views/';
                modelMap = {};
                modelMap[modelKey] =
                    ctwvc.getInstanceTabViewModelConfig(instanceUUID);
                viewConfig.modelKey = modelKey;
                viewConfig.parseFn = ctwp.parseTrafficLineChartData;
                viewConfig.link = ctwc.VIRTUALMACHINE;
                viewConfig.widgetConfig = {
                    view: 'WidgetView',
                    elementId: ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID+ '-widget',
                    viewConfig: {
                        header: {
                            title:
                                contrail.format('Traffic Statistics of {0}',vmName),
                        },
                        controls: {
                            top: {
                                default: {
                                    collapseable: true,
                                }
                            }
                        }
                    }
                }
            }
            return {
                view: view,
                app: app,
                viewPathPrefix: viewPathPrefix,
                elementId: ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID,
                title: ctwl.TITLE_TRAFFIC_STATISTICS,
                viewConfig: viewConfig,
                modelMap: modelMap
            };
        };

        self.parsePRouterLinkStats = function (response) {
            var result = [];
            for(var i = 0; i < response.length; i++) {
                var rawFlowData = response[i];
                var lclData = ifNull(rawFlowData[0],{});
                var rmtData = ifNull(rawFlowData[1],{});
                var lclFlows =
                    getValueByJsonPath(lclData,'flow-series;value',[]);
                var rmtFlows =
                    getValueByJsonPath(rmtData,'flow-series;value',[]),
                    chartTitle,
                    lclNodeName =
                        getValueByJsonPath(lclData,'summary;name','-'),
                    lclInfName =
                        getValueByJsonPath(lclData,'summary;if_name','-'),
                    lclInfIndex =
                            getValueByJsonPath(lclData,'summary;if_index','-'),
                    rmtNodeName =
                        getValueByJsonPath(rmtData,'summary;name','-'),
                    rmtIntfName =
                        getValueByJsonPath(rmtData,'summary;if_name','-');
                    rmtIntfIndex =
                        getValueByJsonPath(rmtData,'summary;if_index','-');

                chartTitle = contrail.format('Traffic Statistics of link {0}: {1} ({2}) -- {3}: {4} ({5})',
                                lclNodeName,lclInfName,lclInfIndex,rmtNodeName,rmtIntfName,rmtIntfIndex);
                var inPacketsLocal = {
                    key: contrail.format('{0} ({1})',lclNodeName,lclInfName),
                        values:[]
                },
                    inPacketsRemote = {
                        key: contrail.format('{0} ({1})',rmtNodeName,rmtIntfName),
                        values:[]
                };
                for(var j = 0; j < lclFlows.length; j++) {
                    var lclFlowObj = lclFlows[j];
                    inPacketsLocal['values'].push({
                        x: Math.floor(lclFlowObj['T=']/1000),
                        y: ifNull(lclFlowObj['SUM(ifStats.ifInPkts)'],0)
                    });
                }
                for(var j = 0; j < rmtFlows.length; j++) {
                    var rmtFlowObj = rmtFlows[j];
                    inPacketsRemote['values'].push({
                        x: Math.floor(rmtFlowObj['T=']/1000),
                        y: ifNull(rmtFlowObj['SUM(ifStats.ifInPkts)'],0)
                    });
                }
                var chartData = [inPacketsLocal,inPacketsRemote];

                options = {
                    height:300,
                    yAxisLabel: 'Packets per 72 secs',
                    y2AxisLabel: 'Packets per 72 secs',
                    defaultSelRange: 9 //(latest 9 samples)
                };
                result.push({
                   chartData: chartData,
                   options: options,
                   chartTitle: chartTitle
                });
                return result;
            }
        };

        self.getTraceFlowVrouterGridColumns = function () {
            var graphModel = self.getUnderlayGraphModel();
            computeNodes = graphModel.getVirtualRouters();
            return [
                {
                    field:"sip",
                    name:"Source IP",
                    minWidth:100,
                    formatter:function(r,c,v,cd,dc) {
                        return self.parseDestination(dc['sip']);
                    }
                },{
                    field:"src_port",
                    name:"Source Port",
                    minWidth:40
                },{
                    field:"src_vn",
                    name:"Source Network",
                    minWidth:110,
                    formatter: function (r,c,v,cd,dc) {
                        var srcVN = dc['src_vn'] != null ? dc['src_vn'] :
                            noDataStr;
                        return formatVN(srcVN);
                    }
                },{
                    field:"dip",
                    name:"Destination IP",
                    minWidth:100,
                    formatter:function(r,c,v,cd,dc) {
                        return self.parseDestination(dc['dip']);
                    }
                },{
                    field:"dst_port",
                    name:"Destination Port",
                    minWidth:40
                },{
                    field:"dst_vn",
                    name:"Destination Network",
                    minWidth:110,
                    formatter: function (r,c,v,cd,dc) {
                        var destVN = dc['dst_vn'] != null ? dc['dst_vn'] :
                            noDataStr;
                        return formatVN(destVN);
                    }
                },{
                    field:'peer_vrouter',
                    name:"Encapsulation Endpoint",
                    minWidth:170,
                    formatter: function(r,c,v,cd,dc){
                        var name = $.grep(computeNodes,function(value,idx){
                                        return (getValueByJsonPath(value.attributes.model().attributes,
                                            'more_attributes;VrouterAgent;control_ip','-') == dc['peer_vrouter']);
                                   });
                        if(name && name.length >= 1) {
                            name = name[0].attributes.name();
                            if (("string" === typeof name) && ("" === name.trim())) {
                                name = "-";
                            }
                        } else {
                            name = "-";
                        }
                        if(validateIPAddress(dc['peer_vrouter']))
                            return contrail.format('{0} ({1})',name ,dc['peer_vrouter']);
                        else
                            return '-';
                    }
                },{
                    field:"protocol",
                    name:"Protocol",
                    minWidth:30,
                    formatter:function(r,c,v,cd,dc){
                        return formatProtocol(dc['protocol']);
                    }
                },{
                    field:"stats_bytes",
                    name:"Bytes/Pkts",
                    minWidth:120,
                    formatter:function(r,c,v,cd,dc){
                        return contrail.format("{0}/{1}",
                            formatBytes(dc['stats_bytes']),dc['stats_packets']);
                    },
                    searchFn:function(d){
                        return d['stats_bytes']+ '/ ' +d['stats_packets'];
                    }
                }
            ];
        };

        self.getTraceFlowVMGridColumns = function () {
            return [
                    {
                        field:"sourceip",
                        name:"Source IP",
                        minWidth:100,
                        formatter:function(r,c,v,cd,dc) {
                            return self.parseDestination(dc['sourceip']);
                        }
                    },{
                        field:"sport",
                        name:"Source Port",
                        minWidth:40
                    },{
                        field:"formattedSrcVN",
                        name:"Source Network",
                        minWidth:110,
                    },{
                        field: 'formattedVrouter',
                        name: "Virtual Router",
                        minWidth:170,
                    },{
                        field:"destip",
                        name:"Destination IP",
                        minWidth:100,
                        formatter:function(r,c,v,cd,dc) {
                            return self.parseDestination(dc['destip']);
                        }
                    },{
                        field:"dport",
                        name:"Destination Port",
                        minWidth:40
                    },{
                        field:"formattedDestVN",
                        name:"Destination Network",
                        minWidth:110,
                        formatter: function (r,c,v,cd,dc) {
                            var destVN = dc['destvn'] != null ? dc['destvn'] :
                                noDataStr;
                            return formatVN(destVN);
                        }
                    },{
                        field: 'formattedOtherVrouter',
                        name: "Encapsulation Endpoint",
                        minWidth:170,
                    },{
                        field:"protocol",
                        name:"Protocol",
                        minWidth:30,
                        formatter:function(r,c,v,cd,dc){
                            return formatProtocol(dc['protocol']);
                        }
                    },{
                        field:"agg-bytes",
                        name:"Bytes/Pkts",
                        minWidth:120,
                        formatter:function(r,c,v,cd,dc){
                            return contrail.format("{0}/{1}",
                                formatBytes(dc['agg-bytes']),dc['agg-packets']);
                        },
                        searchFn:function(d){
                            return d['agg-bytes']+ '/ ' +d['agg-packets'];
                        }
                    }
                ];
        };

        self.getSearchFlowGridColumns = function () {
            return [
                {
                    field:"sourceip",
                    name:"Source IP",
                    minWidth:100,
                    formatter:function(r,c,v,cd,dc) {
                        return self.parseDestination(dc['sourceip']);
                    }
                },{
                    field:"sport",
                    name:"Source Port",
                    minWidth:40
                },{
                    field:"formattedSrcVN",
                    name:"Source Network",
                    minWidth:110,
                },{
                    field: 'formattedVrouter',
                    name: "Virtual Router",
                    minWidth:170,
                },{
                    field:"destip",
                    name:"Destination IP",
                    minWidth:100,
                    formatter:function(r,c,v,cd,dc) {
                        return self.parseDestination(dc['destip']);
                    }
                },{
                    field:"dport",
                    name:"Destination Port",
                    minWidth:40
                },{
                    field:"formattedDestVN",
                    name:"Destination Network",
                    minWidth:110,
                    formatter: function (r,c,v,cd,dc) {
                        var destVN = dc['destvn'] != null ? dc['destvn'] :
                            noDataStr;
                        return formatVN(destVN);
                    }
                },{
                    field: 'formattedOtherVrouter',
                    name: "Encapsulation Endpoint",
                    minWidth:170,
                },{
                    field:"protocol",
                    name:"Protocol",
                    minWidth:30,
                    formatter:function(r,c,v,cd,dc){
                        return formatProtocol(dc['protocol']);
                    }
                },{
                    field:"stats_bytes",
                    name:"Bytes/Pkts",
                    minWidth:120,
                    formatter:function(r,c,v,cd,dc){
                        return contrail.format("{0}/{1}",
                            formatBytes(dc['agg-bytes']),dc['agg-packets']);
                    },
                    searchFn:function(d){
                        return d['agg-bytes']+ '/ ' +d['agg-packets'];
                    }
                }
            ];
        };

        self.getUnderlayGraphModel = function () {
            return $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
        };
        self.parseDestination = function(ip) {
            if (validateIPAddress(ip)) {
                var vmName = self.getVMForIP(ip);
                if (vmName != "") {
                    return ip + " (" + vmName + ")";
                } else {
                    return ip;
                }
            } else {
                noDataStr;
            }
        };
        self.getVMForIP = function (ip) {
            var nodeModels =
            $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel').
                nodesCollection.models;
            var nm = _.filter(nodeModels, function(node) {
                return (_.pluck(node.attributes.more_attributes().interface_list,
                    'ip_address').indexOf(ip) != -1);
                });
            if(nm && nm.length == 1) {
                nm = nm[0];
                return nm.attributes.label()
            }
            return "";
        };
        /*self.showFlowPath = function (connectionWrapIds, offsetWidth, graphView) {
            if(offsetWidth == null)
                offsetWidth = 5;
            if(!(connectionWrapIds instanceof Array))
                return;
            var hopLength = connectionWrapIds.length;
            for(var i=0;i<hopLength;i++) {
                var isDirectionCrt =
                    self.checkLinkDirection(connectionWrapIds[i], graphView);
                self.addOffsetPath(connectionWrapIds[i], offsetWidth, isDirectionCrt);
            }
        };

        self.checkLinkDirection = function (connectionWrapId, graphView) {
            var connectionWrapElem = $('#' + connectionWrapId),
                flowPath = graphView['flowPath'];
            if(connectionWrapElem.length > 0) {
                connectionWrapElem = $(connectionWrapElem[0]);
            } else {
                return;
            }
            var linkId = $(connectionWrapElem).parent().attr('model-id');
            var linkAttrs = graphView.getCell(linkId).attributes;
            var sourceId = linkAttrs.source.id;
            var destId = linkAttrs.target.id;
            var srcEl = graphView.getCell(sourceId);
            var destEl = graphView.getCell(destId);
            var srcNodeName = getValueByJsonPath(srcEl,'attributes;nodeDetails;name','-');
            var destNodeName = getValueByJsonPath(destEl,'attributes;nodeDetails;name','-');
            var isDirectionCrt = false,links = flowPath.get('links');
            for(var i = 0; i < links.length; i ++) {
                if(srcNodeName == getValueByJsonPath(links[i],'endpoints;0','-') &&
                        destNodeName == getValueByJsonPath(links[i],'endpoints;1','-')) {
                    isDirectionCrt = true
                    break;
                }
            }
            return isDirectionCrt;
        };

        self.addOffsetPath = function (connectionWrapId, offsetWidth, isDirectionCrt) {
            var connectionWrapElem = $('#' + connectionWrapId);
            if(connectionWrapElem.length > 0) {
                connectionWrapElem = $(connectionWrapElem[0]);
            } else {
                return;
            }
            var path = connectionWrapElem.attr('d');
            var pathCoords;
            if(typeof(path) == 'string') {
                pathCoords = path.match(/M ([\d.]+) ([\d.]+) C ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)/);
                if((pathCoords instanceof Array) && pathCoords.length == 9) {
                    pathCoords.shift();
                    pathCoords = $.map(pathCoords,function(val) {
                        return parseFloat(val);
                    });
                    var offsetPath;
                    if(offsetWidth < 0) {
                        offsetPath = connectionWrapElem.clone().prop('id',connectionWrapId + '_down');
                    } else {
                        offsetPath = connectionWrapElem.clone().prop('id',connectionWrapId + '_up');
                    }
                    var curve = new Bezier(pathCoords);
                    var inclinedVerticalLine = false;
                    if(curve._linear != true) {
                        if(!isDirectionCrt) {
                            offsetWidth = -offsetWidth;
                            offsetPath.attr('marker-start',"url(#bezierUp)");
                        } else {
                            offsetPath.attr('marker-end',"url(#bezierDown)");
                        }
                        //Hack,till we fix the issue,links b/w TOR and SPINES are not vertical
                        if(Math.abs(pathCoords[pathCoords.length - 2] - pathCoords[0]) <= 10) {
                            inclinedVerticalLine = true;
                            if(!isDirectionCrt) {
                                offsetPath.attr('marker-start','url(#upDeviated)');
                            } else {
                                offsetPath.attr('marker-end','url(#downDeviated)');
                            }
                        }
                        var offsetPathStr = self.getOffsetBezierPath(pathCoords,offsetWidth);
                        var offsetPathCords = offsetPathStr.split(' ');
                        var offsetPathCordsLen = offsetPathCords.length;
                        var lastX = offsetPathCords[offsetPathCords.length - 2];
                        if(!isDirectionCrt && !inclinedVerticalLine) {
                            lastX = parseFloat(lastX) + 10;
                            offsetPathCords[offsetPathCords.length - 2] = lastX;
                        } else if (isDirectionCrt && !inclinedVerticalLine)  {
                            lastX = parseFloat(lastX) - 10;
                            offsetPathCords[offsetPathCords.length - 2] = lastX;
                        }
                        offsetPath.attr('d',offsetPathCords.join(' '));
                    } else {
                        //Vertical line
                        if(pathCoords[0] == pathCoords[6]) {
                            //Pointing upwards/downwards
                            if(!isDirectionCrt) {
                                offsetPath.attr('transform','translate(' + offsetWidth + ',0)');
                                offsetPath.attr('marker-start',"url(#up)");
                            } else {
                                offsetPath.attr('transform','translate(-' + offsetWidth + ',0)');
                                offsetPath.attr('marker-end',"url(#down)");
                            }
                        }
                        //Horizontal line
                        if(pathCoords[1] == pathCoords[7]) {
                            offsetPath.attr('transform','translate(0,' + offsetWidth + ')');
                        }
                    }

                    if(!isDirectionCrt) {
                        offsetPath.attr('class','connection-wrap-up');
                    } else {
                        offsetPath.attr('class','connection-wrap-down');
                    }
                    offsetPath.insertAfter(connectionWrapElem);
                }
            }
        };

        self.getOffsetBezierPath = function(pathCoords, offsetWidth) {
            var curve = new Bezier(pathCoords);
            if(curve._linear == true) {
            }
            var offsetCurve = curve.offset(offsetWidth);
            var offsetCurvePath = "";
            for(var i=0;i<offsetCurve.length;i++) {
                offsetCurvePath += " " + offsetCurve[i].toSVG();
            }
            return offsetCurvePath;
        };*/

        /*
         * Function, checks the flag isUnderlayPage in viewConfig
         * In case of true
         *      Appends the hostName in the widget header title
         */

        /*self.getMarkersForUnderlay = function () {
            var marker =
                document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'head');
            marker.setAttribute('orient', 'auto');
            marker.setAttribute('markerWidth', '30');
            marker.setAttribute('markerHeight', '30');
            marker.setAttribute('refX', '2.5');
            marker.setAttribute('refY', '3');

            var path =
                document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', "M0,0 L0,3 L3,0");
            path.setAttribute('style', "stroke:#85b9dd; fill:#85b9dd;");
            marker.appendChild(path);

            var marker1 =
                document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker1.setAttribute('id', 'up');
            marker1.setAttribute('orient', 'auto');
            marker1.setAttribute('markerWidth', '30');
            marker1.setAttribute('markerHeight', '30');
            marker1.setAttribute('refX', '0');
            marker1.setAttribute('refY', '0');

            var path1 =
                document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', "M0,0 L3,3 L0,3");
            path1.setAttribute('style', "stroke:#85b9dd; fill:#85b9dd;");
            marker1.appendChild(path1);

            var marker2 =
                document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker2.setAttribute('id', 'down');
            marker2.setAttribute('orient', 'auto');
            marker2.setAttribute('markerWidth', '30');
            marker2.setAttribute('markerHeight', '30');
            marker2.setAttribute('refX', '3');
            marker2.setAttribute('refY', '3');

            var path2 =
                document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', "M0,0 L3,3 L3,0");
            path2.setAttribute('style', "stroke:#85b9dd; fill:#85b9dd;");
            marker2.appendChild(path2);

            var marker3 =
                document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker3.setAttribute('id', 'bezierUp');
            marker3.setAttribute('orient', 'auto');
            marker3.setAttribute('markerWidth', '30');
            marker3.setAttribute('markerHeight', '30');
            marker3.setAttribute('refX', '.5');
            marker3.setAttribute('refY', '3.7');

            var path3 =
                document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path3.setAttribute('d', "M0,4 L4,0 L4,4");
            path3.setAttribute('style', "stroke-width:0px;fill:#85b9dd;");
            marker3.appendChild(path3);

            var marker4 =
                document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker4.setAttribute('id', 'upDeviated');
            marker4.setAttribute('orient', 'auto');
            marker4.setAttribute('markerWidth', '30');
            marker4.setAttribute('markerHeight', '30');
            marker4.setAttribute('refX', '-1');
            marker4.setAttribute('refY', '1');

            var path4 =
                document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path4.setAttribute('d', "M0,0 L3,3 L0,3");
            path4.setAttribute('style', "stroke:#85b9dd; fill:#85b9dd;");
            marker4.appendChild(path4);

            var marker5 =
                document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker5.setAttribute('id', 'bezierDown');
            marker5.setAttribute('orient', 'auto');
            marker5.setAttribute('markerWidth', '30');
            marker5.setAttribute('markerHeight', '30');
            marker5.setAttribute('refX', '2.5');
            marker5.setAttribute('refY', '.5');

            var path5 =
                document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path5.setAttribute('d', "M0,0 L0,3 L3,0");
            path5.setAttribute('style', "stroke:#85b9dd; fill:#85b9dd;");
            marker5.appendChild(path5);

            var marker6 =
                document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker6.setAttribute('id', 'downDeviated');
            marker6.setAttribute('orient', 'auto');
            marker6.setAttribute('markerWidth', '30');
            marker6.setAttribute('markerHeight', '30');
            marker6.setAttribute('refX', '5.5');
            marker6.setAttribute('refY', '3');

            var path6 =
                document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path6.setAttribute('d', "M0,0 L3,3 L3,0");
            path6.setAttribute('style', "stroke:#85b9dd; fill:#85b9dd;");
            marker6.appendChild(path6);

            return [marker, marker1, marker2, marker3, marker4, marker5, marker6];
        };*/

        self.showUnderlayPaths = function (data, graphModel, deferredObj) {
            var currentUrlHashObj = layoutHandler.getURLHashObj(),
                currentPage = currentUrlHashObj.p,
                currentParams = currentUrlHashObj.q;
                var params = {};
                params.action = 'Map Flow';
                params.srcIP = data.sourceip;
                params.destIP = data.destip;
                params.srcVN = data.sourcevn;
                params.destVN = data.destvn;
                params.srcPort = data.sport;
                params.destPort = data.dport;
                params.protocol = data.protocol;
                params.startAt = data.startAt;
                if(data.direction_ing === 0) {
                    params.direction = 'egress';
                    params.nodeIP = data.other_vrouter_ip;
                } else {
                    params.direction = 'ingress';
                    params.nodeIP = data.vrouter_ip;
                }
                if(currentPage == 'mon_infra_underlay' &&
                    !graphModel.checkIPInVrouterList(params)) {
                    if(deferredObj != null) {
                        deferredObj.resolve(true);
                    }
                    showInfoWindow(
                        "Cannot Map the path for the selected flow", "Info");
                    return;
                }
                if(data.hasOwnProperty('startTime') &&
                    data.hasOwnProperty('endTime')) {
                    params['startTime'] = data['startTime'];
                    params['endTime'] = data['endTime'];
                } else {
                    params['minsSince'] = 300;
                }
                switch(currentPage) {
                    case 'mon_infra_underlay':
                        graphModel.underlayPathReqObj(params);
                        $.ajax({
                            url: "/api/tenant/networking/underlay-path",
                            type    : "POST",
                            data    : {data: params},
                        }).done (function (response) {
                            if(params['startAt'] != null &&
                                graphModel.lastInteracted > params['startAt']) {
                                if (deferredObj != null) {
                                    deferredObj.resolve(false);
                                }
                                return;
                            }
                            graphModel.model().attributes.flowPath.set({
                                'nodes': ifNull(response['nodes'], []),
                                'edges': ifNull(response['links'], [])
                            }, {silent:true});
                            graphModel.model().attributes.flowPath.trigger('change:nodes');
                            if (ifNull(response['nodes'], []).length == 0 ||
                                ifNull(response['links'], []).length == 0) {
                            } else {
                                /*self.addUnderlayFlowInfoToBreadCrumb({
                                    action: 'Map Flow',
                                    sourceip: params['srcIP'],
                                    destip: params['destIP'],
                                    sport: params['sport'],
                                    dport: params['dport']
                                });*/
                            }
                            $('html,body').animate({scrollTop:0}, 500);
                        }).fail (function (xhr, state, err) {
                            if(state !== 'timeout') {
                            if(params['startAt'] != null &&
                                graphModel.lastInteracted > params['startAt']) {
                                if (deferredObj != null) {
                                    deferredObj.resolve(false);
                                }
                                return;
                            }
                            var postData =
                            graphModel.underlayPathReqObj();
                            showInfoWindow(
                                "Error in mapping flow from [" +
                                postData.srcIP + "]:" + postData.srcPort +
                                " to [" + postData.destIP + "]:" +
                                postData.destPort, "Error");
                            }
                            //showInfoWindow('Error in fetching details','Error');
                        }).always (function (xhr, state, err) {
                            if(state == 'timeout') {
                                var postData =
                                graphModel.underlayPathReqObj();
                                showInfoWindow(
                                    "Timeout in mapping flow from [" +
                                    postData.srcIP + "]:" + postData.srcPort +
                                    " to [" + postData.destIP + "]:" +
                                    postData.destPort, "Timeout");
                                //showInfoWindow('Timeout in fetching details','Error');
                            }
                            if(deferredObj != null) {
                                deferredObj.resolve(true);
                            }
                        });
                        break;
                    case 'query_flow_records':
                        layoutHandler.setURLHashParams(params,{p:'mon_infra_underlay',merge:false});
                        break;
                }
        };

        self.addUnderlayFlowInfoToBreadCrumb = function (data) {
            // Removing the last flow info in the breadcrumb
            self.removeUndelrayFlowInfoFromBreadCrumb();
            // Adding the current flow info to the breadcrumb
            pushBreadcrumb([
                 contrail.getTemplate4Id(ctwc.UNDERLAY_FLOW_INFO_TEMPLATE)(data)
            ]);
        };

        self.removeUndelrayFlowInfoFromBreadCrumb = function () {
            if ($("#breadcrumb li").last().find('div#flow-info').length > 0) {
                $("#breadcrumb li").last().remove();
                $('#breadcrumb li').last().children('span').remove();
            }
        };

        self.removeUnderlayTabs = function (underlayTabView, deferredObj) {
            var tabCnt = $('#'+ctwc.UNDERLAY_TAB_ID +'> ul li:visible').length;
            for (var i = (tabCnt - 1); i >= 2; i--) {
                underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].removeTab(i);
            }
            if(deferredObj != undefined) {
                deferredObj.resolve()
            }
        };
        self.tabsRendered = function(tabView, deferredObj) {
            var allTabsRendered = false;
            while(allTabsRendered == false) {
                var tabs = _.result(tabView, 'childViewMap.'+ctwc.UNDERLAY_TAB_ID+'.tabs', []),
                    tabRendered = _.pluck(tabs, '_rendered');
                if (tabRendered.indexOf(false) == -1) {
                    allTabsRendered = true;
                    return true;
                }
            }
        };
    }
    return new UnderlayUtils();
});
