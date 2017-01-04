
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['lodash', 'contrail-view', 'monitor-infra-controlnode-model', 'node-color-mapping'],
        function(_, ContrailView,  controlNodeListModelCfg, NodeColorMapping) {
    var ControlNodeViewConfig = function () {
        var self = this;
        self.viewConfig = {
            'controlnode-sent-updates': {
                baseModel: 'CONTROLNODE_SENT_UPDATES_MODEL',
                modelCfg: {

                },
                viewCfg:{
                    elementId : ctwl.CONTROLNODE_SENT_UPDATES_SCATTER_CHART_ID,
                    view : "StackedAreaChartView",
                    viewConfig : {
                        class: 'mon-infra-chart chartMargin',
                        chartOptions:{
                            title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                            subTitle:"BGP, XMPP Reach/Unreach Route Updates (in 3 mins)",
                            valueText:"",
                            xAxisLabel: '',
                            yAxisLabel: 'Updates sent per Control Node',
                            groupBy: 'Source',
                            yField: 'SUM(tx_update_stats.reach)',
                            failureLabel:'Unreach Updates (Total)',
                            failureColor: '#ECECEC',
                            substractFailures: false,
                            failureCheckFn: function (d) {
                                return ifNull(d['SUM(tx_update_stats.unreach)'],0);
                            },
                        }
                    }
                },
                itemAttr: {
                    title: ctwl.CONTROL_NODE_SENT_UPDATES,
                    width: 1/2,
                }
            },
            'controlnode-received-updates': {
                baseModel: 'CONTROLNODE_RECEIVED_UPDATES_MODEL',
                modelCfg: {

                },
                viewCfg: {
                    elementId : ctwl.CONTROLNODE_RECEIVED_UPDATES_SCATTER_CHART_ID,
                    view : "StackedAreaChartView",
                    viewConfig : {
                        chartOptions:{
                            xAxisLabel: '',
                            yAxisLabel: 'Updates received per Control Node',
                            subTitle:"BGP, XMPP Reach/Unreach Route Updates (in 3 mins)",
                            title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                            groupBy: 'Source',
                            yField: 'SUM(rx_update_stats.reach)',
                            failureLabel:'Unreach Updates (Total)',
                            failureColor: '#ECECEC',
                            substractFailures: false,
                            failureCheckFn: function (d) {
                                return ifNull(d['SUM(rx_update_stats.unreach)'],0);
                            },
                            defaultZeroLineDisplay: true
                        }
                    }
                },
                itemAttr: {
                    title: ctwl.CONTROL_NODE_RECEIVED_UPDATES,
                    width: 1/2,
                }
            },
            'controlnode-system-cpu-share': {
                baseView: 'SYSTEM_CPU_SHARE_VIEW',
                baseModel: 'SYSTEM_CPU_MODEL',
                modelCfg : {
                    type: 'controlNode',
                    modelId: 'CONTROLNODE_SYSTEM_CPU_SHARE_MODEL',
                    config: {
                        where:'node-type = control-node'
                    }
                },
                itemAttr: {
                    width: 1/2,
                }
            },
            'controlnode-system-memory-usage': {
                baseModel: 'SYSTEM_MEMORY_MODEL',
                baseView:'SYSTEM_MEMORY_USAGE_VIEW',
                modelCfg : {
                    type: 'controlNode',
                    modelId: 'CONTROLNODE_SYSTEM_MEMORY_MODEL',
                    config: {
                        where:'node-type = control-node'
                    }
                },
                itemAttr: {
                    width: 1/2,
                }
            },
            'controlnode-disk-usage-info': {
                baseModel:'SYSTEM_DISK_USAGE_MODEL',
                baseView:'SYSTEM_DISK_USAGE_VIEW',
                modelCfg : {
                    type: 'controlNode',
                    modelId: 'CONTROLNODE_DISK_USAGE_MODEL',
                    config: {
                        where:'node-type = control-node'
                    }
                },
                itemAttr: {
                    width: 1/2,
                }
            },
            'controlnode-system-logs': {
                baseModel: 'CONTROLNODE_SYSTEM_LOGS_MODEL',
                modelCfg: {

                },
                viewCfg: {
                    view : "eventDropsView",
                    viewConfig: {
                        groupBy: 'MessageType',
                        title: 'Controlnode System Logs'
                    }
                },
                itemAttr: {
                    title: ctwl.CONTROLNODE_CONSOLE_LOGS,
                    width: 2
                }
            },
            'controlnode-objectbgprouter-logs': {
                baseModel: 'CONTROLNODE_OBJECT_BGPROUTER_MODEL',
                modelCfg: {

                },
                viewCfg: {
                    view : "eventDropsView",
                    viewConfig: {
                        // groupBy: 'MessageType',
                        title:'ObjectBgpRouter'
                    }
                },
                itemAttr: {
                    title: ctwl.CONTROLNODE_CONSOLE_LOGS,
                    width: 2
                }
            },
            'controlnode-objectxmpppeer-logs': {
                baseModel: 'CONTROLNODE_OBJECT_XMPPPEER_MODEL',
                modelCfg: {

                },
                viewCfg: {
                    view : "eventDropsView",
                    viewConfig: {
                        // groupBy: 'MessageType',
                        title:'ObjectXmppPeerInfo'
                    }
                },
                itemAttr: {
                    title: ctwl.CONTROLNODE_CONSOLE_LOGS,
                    width: 2
                }
            },
            'controlnode-objectbgppeer-logs': {
                baseModel: 'CONTROLNODE_OBJECT_BGPPEER_MODEL',
                modelCfg: {

                },
                viewCfg: {
                    view : "eventDropsView",
                    viewConfig: {
                        // groupBy: 'MessageType',
                        title:'ObjectBgpPeer'
                    }
                },
                itemAttr: {
                    title: ctwl.CONTROLNODE_CONSOLE_LOGS,
                    width: 2
                }
            },
            'controlnode-memory': {
                baseModel:'CONTROLNODE_MEMORY_MODEL',
                modelCfg: {

                },
                viewCfg: {
                    view: 'LineWithFocusChartView',
                    elementId : ctwl.CONTROLNODE_MEM_SHARE_LINE_CHART_ID,
                    viewConfig: {
                        chartOptions: {
                        yAxisLabel: 'BGP Memory Usage',
                        subTitle:"Memory usage per system (3 mins)",
                        groupBy: 'name',
                        yField: 'MAX(process_mem_cpu_usage.mem_res)',
                        title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                        yFormatter : function(d){
                            return formatBytes(d * 1024, true);
                        },
                        //xFormatter: xCPUChartFormatter,
                        }
                    }
                },
                itemAttr: {
                    title: ctwl.CONTROL_NODE_MEMORY,
                    width: 1/2
                }
            },
            'controlnode-control': {
                baseModel:'CONTROLNODE_CONTROL_CPU_MODEL',
                modelCfg:{

                },
                viewCfg:{
                    elementId : 'control_node_control',
                    view: 'LineWithFocusChartView',
                    viewConfig: {
                        chartOptions: {
                            yAxisLabel: ctwl.CONTROL_NODE_CONTROL_CPU_SHARE,
                            subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                            yFormatter: d3.format('.2f'),
                            groupBy: 'name',
                            yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                            title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                        }
                    }
                },itemAttr: {
                    title: ctwl.CONTROL_NODE_CONTROL_CPU_SHARE,
                    width: 1/2
                }
            },
            'controlnode-nodemgr': {
                baseModel: 'CONTROLNODE_NODEMGR_CPU_MODEL',
                modelCfg:{

                },
                viewCfg:{
                    elementId : 'control_node_nodemgr',
                    view: 'LineWithFocusChartView',
                    viewConfig: {
                        chartOptions: {
                            yFormatter: d3.format('.2f'),
                            yAxisLabel: "Node Manager CPU Share (%)",
                            subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                            groupBy: 'name',
                            yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                            title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                        }
                    }
                },itemAttr: {
                    title: ctwl.CONTROL_NODE_NODE_MANAGER_CPU_SHARE,
                    width: 1/2
                }
            },
            'controlnode-dns': {
                baseModel:'CONTROLNODE_DNS_CPU_MODEL',
                modelCfg:{

                },
                viewCfg:{
                    elementId : 'control_node_dns',
                    view: 'LineWithFocusChartView',
                    viewConfig: {
                        chartOptions: {
                            yFormatter: d3.format('.2f'),
                            subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                            yAxisLabel: ctwl.CONTROL_DNS_CPU_SHARE,
                            groupBy: 'name',
                            yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                            title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                        }
                    }
                },itemAttr: {
                    title: ctwl.CONTROL_DNS_CPU_SHARE,
                    width: 1/2
                }
            },
            'controlnode-named': {
                baseModel:'CONTROLNODE_NAMED_CPU_MODEL',
                modelCfg:{

                },
                viewCfg:{
                    elementId : 'control_node_named',
                    view: 'LineWithFocusChartView',
                    viewConfig: {
                        chartOptions: {
                            yFormatter: d3.format('.2f'),
                            subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                            yAxisLabel: ctwl.CONTROL_NAMED_CPU_SHARE,
                            groupBy: 'name',
                            yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                            title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                        }
                    }
                },itemAttr: {
                    title: ctwl.CONTROL_NAMED_CPU_SHARE,
                    width: 1/2
                }
            },
            'controlnode-grid-view': {
                baseModel: 'CONTROLNODE_LIST_MODEL',
                modelCfg:{

                },
                viewCfg: {
                    elementId : ctwl.CONTROLNODE_SUMMARY_GRID_ID,
                    title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                    view : "GridView",
                    viewConfig : {
                        elementConfig : getControlNodeSummaryGridConfig('controlnode-grid-view','controlNode')
                    }
                },
                itemAttr: {
                    height: 2,
                }
            }
        };
        function getControlNodeSummaryGridConfig(widgetId, type) {
            var columns = [
                           {
                               field:"name",
                               name:"Host name",
                               formatter:function(r,c,v,cd,dc) {
                                  return cellTemplateLinks({cellText:'name',
                                      name:'name',
                                      statusBubble:true,
                                      rowData:dc,
                                      tagColorMap: NodeColorMapping.getNodeColorMap(_.pluck(cowu.getGridItemsForWidgetId(widgetId), 'name'),null, type),
                                  })
                               },
                               events: {
                                  onClick: onClickHostName
                               },
                               cssClass: 'cell-hyperlink-blue',
                               minWidth:110,
                               exportConfig: {
                                   allow: true,
                                   advFormatter: function(dc) {
                                       return dc.name;
                                   }
                               }
                           },
                           {
                               field:"ip",
                               name:"IP Address",
                               formatter:function(r,c,v,cd,dc){
                                   return monitorInfraParsers.summaryIpDisplay(dc['ip'],dc['summaryIps']);
                               },
                               minWidth:90,
                               exportConfig: {
                                   allow: true,
                                   advFormatter: function(dc) {
                                       return dc.ip;
                                   }
                               },
                               sorter : comparatorIP
                           },
                           {
                               field:"version",
                               name:"Version",
                               minWidth:150
                           },
                           {
                               field:"status",
                               name:"Status",
                               sortable:true,
                               formatter:function(r,c,v,cd,dc) {
                                   return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,'html');
                               },
                               searchFn:function(d) {
                                   return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                               },
                               exportConfig: {
                                   allow: true,
                                   advFormatter: function(dc) {
                                       return monitorInfraUtils.getNodeStatusContentForSummayPages(dc,
                                           'text');
                                   }
                               },
                               sortable:{
                                   sortBy: function (d) {
                                       return monitorInfraUtils.getNodeStatusContentForSummayPages(d,'text');
                                   }
                               },
                               sorter:cowu.comparatorStatus,
                               minWidth:150
                           },
                           {
                               field:"cpu",
                               name: ctwl.TITLE_CPU,
                               formatter:function(r,c,v,cd,dc) {
                                   return '<div class="gridSparkline display-inline">'+
                                       '</div><span class="display-inline">'
                                       + ifNotNumeric(dc['cpu'],'-') + '</span>';
                               },
                               asyncPostRender: renderSparkLines,
                               searchFn:function(d){
                                   return d['cpu'];
                               },
                               minWidth:150,
                               exportConfig: {
                                   allow: true,
                                   advFormatter: function(dc) {
                                       return dc['cpu'];
                                   }
                               }
                           },
                           {
                               field:"memory",
                               name:"Memory",
                               minWidth:110,
                               sortField:"y"
                           },
                           {
                               field:"establishedPeerCount",
                               name:"BGP Peers",
                               minWidth:140,
                               formatter:function(r,c,v,cd,dc){
                                   return contrail.format("{0} Total {1}",
                                       ifNull(dc['totalBgpPeerCnt'],0),
                                       dc['downBgpPeerCntText']);
                               }
                           },
                           {
                               field:"activevRouterCount",
                               name:"vRouters",
                               formatter:function(r,c,v,cd,dc){
                                   return contrail.format("{0} Total {1}",
                                       dc['totalXMPPPeerCnt'],
                                       dc['downXMPPPeerCntText']);
                               },
                               minWidth:140
                           }
                        ];
                        var gridElementConfig = {
                            header : {
                                title : {
                                    text : ctwl.CONTROLNODE_SUMMARY_TITLE
                                }
                            },
                            columnHeader : {
                                columns : columns
                            },
                            body : {
                                options : {
                                  detail : false,
                                  checkboxSelectable : false,
                                  enableAsyncPostRender:true,
                                  fixedRowHeight: 30
                                },
                                dataSource : {
                                    remote : {
                                        ajaxConfig : {
                                            url : ctwl.CONTROLNODE_SUMMARY
                                        }
                                    },
                                    cacheConfig : {
                                        ucid: ctwl.CACHE_CONTROLNODE
                                    }
                                },
                                statusMessages: {
                                    loading: {
                                        text: 'Loading Control Nodes..'
                                    },
                                    empty: {
                                        text: 'No Control Nodes Found.'
                                    }
                                }
                            },
                            footer: {
                                pager: {
                                    options: {
                                        pageSize: 10,
                                    }
                                }
                            }
            };
            return gridElementConfig;
        }
        function onClickHostName(e, selRowDataItem) {
            var name = selRowDataItem.name, hashParams = null,
                triggerHashChange = true, hostName;

            hostName = selRowDataItem['name'];
            var hashObj = {
                    type: "controlNode",
                    view: "details",
                    focusedElement: {
                        node: name,
                        tab: 'details'
                    }
                };

            if(contrail.checkIfKeyExistInObject(true,
                            hashParams,
                            'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {
                p: "mon_infra_control",
                merge: false,
                triggerHashChange: triggerHashChange});
        };
        function xCPUChartFormatter(xValue, tickCnt) {
            var date = xValue > 1 ? new Date(xValue) : new Date();
            if (tickCnt != null) {
               var mins = date.getMinutes();
               date.setMinutes(Math.ceil(mins/15) * 15);
            }
            return d3.time.format('%H:%M')(date);
        }
        function cpuChartYTickFormat(value){
            return d3.format('.2f')(value);
        }
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new ControlNodeViewConfig()).viewConfig;
});
