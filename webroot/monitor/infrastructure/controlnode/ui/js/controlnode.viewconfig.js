
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'monitor-infra-controlnode-model', 'node-color-mapping'],
        function(_, ContrailView,  ControlNodeListModel, NodeColorMapping) {
    var ControlNodeViewConfig = function () {
        var nodeColorMapping = new NodeColorMapping(),
        colorFn = nodeColorMapping.getNodeColorMap,
        controlNodeListModel = new ControlNodeListModel();
        var self = this;
        self.viewConfig = {
            'controlnode-sent-updates': function (){
                return {
                    modelCfg: {
                        modelId: ctwl.CONTROLNODE_SENT_UPDATES,
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.PeerStatsData.tx_update_stats',
                            select: 'T=, Source, SUM(tx_update_stats.reach), SUM(tx_update_stats.unreach)'
                        }
                    },
                    viewCfg:{
                        elementId : ctwl.CONTROLNODE_SENT_UPDATES_SCATTER_CHART_ID,
                        view : "StackedAreaChartView",
                        viewConfig : {
                            class: 'mon-infra-chart chartMargin',
                            chartOptions:{
                                title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                                subTitle:"Reach/Unreach Route Updates (in 3 mins)",
                                valueText:"",
                                xAxisLabel: '',
                                yAxisLabel: 'Updates sent per Control Node',
                                groupBy: 'Source',
                                yField: 'SUM(tx_update_stats.reach)',
                                colors: colorFn,
                                failureLabel:'Unreach Updates (Total)',
                                failureCheckFn: function (d) {
                                    return ifNull(d['SUM(tx_update_stats.unreach)'],0);
                                },
                            }
                        }
                    },
                    itemAttr: {
                        title: ctwl.CONTROL_NODE_SENT_UPDATES
                    }
                }
            },
            'controlnode-received-updates': function (){
                return {
                    modelCfg: {
                        modelId: ctwl.CONTROLNODE_RECEIVED_UPDATES,
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.PeerStatsData.rx_update_stats',
                            select: 'T=, Source, SUM(rx_update_stats.reach), SUM(rx_update_stats.unreach)'
                        }
                    },
                    viewCfg: {
                        elementId : ctwl.CONTROLNODE_RECEIVED_UPDATES_SCATTER_CHART_ID,
                        view : "StackedAreaChartView",
                        viewConfig : {
                            chartOptions:{
                                xAxisLabel: '',
                                yAxisLabel: 'Updates received per Control Node',
                                subTitle:"Reach/Unreach Route Updates (in 3 mins)",
                                title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                                groupBy: 'Source',
                                yField: 'SUM(rx_update_stats.reach)',
                                colors: colorFn,
                                failureLabel:'Unreach Updates (Total)',
                                failureCheckFn: function (d) {
                                    return ifNull(d['SUM(rx_update_stats.unreach)'],0);
                                },
                                defaultZeroLineDisplay: true
                            }
                        }
                    },
                    itemAttr: {
                        title: ctwl.CONTROL_NODE_RECEIVED_UPDATES
                    }
                }
            },
            'controlnode-cpu-share': function (){
                return {
                     modelCfg: {
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.ControlCpuState.cpu_info',
                            select: 'T=, name, MAX(cpu_info.cpu_share), MAX(cpu_info.mem_res)',
                            where:'cpu_info.module_id = contrail-control'
                        }
                    },
                     viewCfg: {
                         elementId : ctwl.CONTROLNODE_CPU_SHARE_LINE_CHART_ID,
                         view: 'LineWithFocusChartView',
                         viewConfig: {
                             chartOptions: {
                                yAxisLabel: 'Control CPU Share (%)',
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                groupBy: 'name',
                                yField: 'MAX(cpu_info.cpu_share)',
                                colors: colorFn,
                                title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                                yFormatter : function(d){
                                    return d;
                                },
                                xFormatter: xCPUChartFormatter,
                             }
                         }
                     },
                     itemAttr: {
                          title: ctwl.CONTROL_NODE_CPU_SHARE
                    }
                }
            },
            'controlnode-system-logs': function () {
                return {
                    modelCfg: {
                        modelId: ctwl.CONTROLNODE_CONSOLE_LOGS_MODEL,
                        source:'STATTABLE',
                        config: {
                            table_name: 'MessageTable',
                            table_type: 'LOG',
                            select: 'Source,ModuleId,MessageTS,Messagetype,Level,Category,Xmlmessage',
                            where:'ModuleId=contrail-control'
                        }
                    },
                    viewCfg: {
                        view : "eventDropsView",
                        viewConfig: {
                        }
                    },
                    itemAttr: {
                        title: ctwl.CONTROLNODE_CONSOLE_LOGS,
                        width: 2
                    }
                }
            },
            'controlnode-memory': function (){
                return {
                    modelCfg: {
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.ControlCpuState.cpu_info',
                            select: 'T=, name, MAX(cpu_info.cpu_share), MAX(cpu_info.mem_res)',
                            where:'cpu_info.module_id = contrail-control'
                        }
                    },
                     viewCfg: {
                         view: 'LineWithFocusChartView',
                         elementId : ctwl.CONTROLNODE_MEM_SHARE_LINE_CHART_ID,
                         viewConfig: {
                             chartOptions: {
                                yAxisLabel: 'BGP Memory Usage',
                                subTitle:ctwl.CPU_SHARE_PERCENTAGE,
                                groupBy: 'name',
                                yField: 'MAX(cpu_info.mem_res)',
                                colors: colorFn,
                                title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                                margin: {
                                    left: 60,
                                    top: 20,
                                    right: 15,
                                    bottom: 50
                                },
                                yFormatter : function(d){
                                    return formatBytes(d * 1024, true);
                                },
                                xFormatter: xCPUChartFormatter,
                             }
                         }
                     },
                     itemAttr: {
                          title: ctwl.CONTROL_NODE_MEMORY
                    }
                }
            },
            'controlnode-control': function (){
                return {
                    modelCfg:{
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where:'process_mem_cpu_usage.__key = contrail-control'
                        }
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
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.CONTROL_NODE_CONTROL_CPU_SHARE
                    }
                }
            },
            'controlnode-nodemgr': function (){
                return {
                    modelCfg:{
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where:'process_mem_cpu_usage.__key = contrail-control-nodemgr'
                        }
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
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.CONTROL_NODE_NODE_MANAGER_CPU_SHARE
                    }
                }
            },
            'controlnode-dns': function (){
                return {
                    modelCfg:{
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where:'process_mem_cpu_usage.__key = contrail-dns'
                        }
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
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.CONTROL_DNS_CPU_SHARE
                    }
                }
            },
            'controlnode-named': function (){
                return {
                    modelCfg:{
                        source:'STATTABLE',
                        config: {
                            table_name: 'StatTable.NodeStatus.process_mem_cpu_usage',
                            select: 'name, T=, MAX(process_mem_cpu_usage.cpu_share)',
                            where:'process_mem_cpu_usage.__key = contrail-named'
                        }
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
                                colors: colorFn,
                                yField: 'MAX(process_mem_cpu_usage.cpu_share)',
                                title: ctwl.CONTROLNODE_SUMMARY_TITLE,
                            }
                        }
                    },itemAttr: {
                        title: ctwl.CONTROL_NAMED_CPU_SHARE
                    }
                }
            },
            'controlnode-grid-view': function () {
                return {
                    modelCfg:{
                        modelId: ctwl.CONTROLNODE_GRID_VIEW,
                        listModel: controlNodeListModel
                    },
                    viewCfg: {
                        elementId : ctwl.CONTROLNODE_SUMMARY_GRID_ID,
                        title : ctwl.CONTROLNODE_SUMMARY_TITLE,
                        view : "GridView",
                        viewConfig : {
                            elementConfig :
                                getControlNodeSummaryGridConfig(controlNodeListModel, colorFn)
                        }
                    },
                    itemAttr: {
                        width: 2
                    }
                }
            },
        };
        function getControlNodeSummaryGridConfig(model, colorFn) {
            var columns = [
                           {
                               field:"name",
                               name:"Host name",
                               formatter:function(r,c,v,cd,dc) {
                                  return cellTemplateLinks({cellText:'name',
                                      name:'name',
                                      statusBubble:true,
                                      rowData:dc,
                                      tagColorMap:colorFn(_.pluck(model.getItems(), 'name'))});
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
