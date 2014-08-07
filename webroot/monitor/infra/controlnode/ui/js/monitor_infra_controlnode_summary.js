/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Control Nodes Summary Page
 */
monitorInfraControlSummaryClass = (function() {
    this.populateControlNodes = function() {
        infraMonitorUtils.clearTimers();
        var ctrlNodesTemplate = contrail.getTemplate4Id("controlnodes-template");
        $(pageContainer).html(ctrlNodesTemplate({}));
        var controlNodeDS = new SingleDataSource('controlNodeDS');
        var controlNodesResult = controlNodeDS.getDataSourceObj();
        var controlNodesDataSource = controlNodesResult['dataSource'];
        var controlDeferredObj = controlNodesResult['deferredObj'];
        //Initialize widget header
        $('#controlNodes-header').initWidgetHeader({title:'Control Nodes',widgetBoxId :'recent'});
        $(controlNodeDS).on('change',function() {
            updateChartsForSummary(controlNodesDataSource.getItems(),'control');
        });
        
        $('#gridControlNodes').contrailGrid({
            header : {
                title : {
                    text : 'Control Nodes'
                },
                customControls: []
            },
            body: {
                options: {
                    rowHeight : 30,
                    autoHeight : true,
                    forceFitColumns:true,
                    enableAsyncPostRender: true,
                    lazyLoading:true
                },
                dataSource: {
                    dataView: controlNodesDataSource,
                },
                 statusMessages: {
                     loading: {
                         text: 'Loading Control Nodes..',
                     },
                     empty: {
                         text: 'No Control Nodes to display'
                     }, 
                     errorGettingData: {
                         type: 'error',
                         iconClasses: 'icon-warning',
                         text: 'Error in getting Data.'
                     }
                 }
            },
            columnHeader: {
                columns:[
                    {
                        field:"name",
                        name:"Host name",
                        sortable : {
                            sortBy: 'formattedValue'
                        },
                        formatter:function(r,c,v,cd,dc) {
                           return cellTemplateLinks({cellText:'name',name:'name',statusBubble:true,rowData:dc});
                        },
                        events: {
                           onClick: function(e,dc){
                              onCtrlNodeRowSelChange(dc);
                           }
                        },
                        cssClass: 'cell-hyperlink-blue',
                        minWidth:175,
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
                            return summaryIpDisplay(dc['ip'],dc['summaryIps']);
                        },
                        minWidth:90,
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return dc.ip;
            				}
            			}
                    },
                    {
                        field:"status",
                        name:"Status",
                        sortable:true,
                        formatter:function(r,c,v,cd,dc) {
                            return getNodeStatusContentForSummayPages(dc,'html');
                        },
                        searchFn:function(d) {
                            return getNodeStatusContentForSummayPages(dc,'text');
                        },
                        minWidth:150
                    },
                    {
                        field:"establishedPeerCount",
                        name:"BGP Peers",
                        minWidth:100,
                        formatter:function(r,c,v,cd,dc){
                            return contrail.format("{0} Total {1}",ifNull(dc['totalBgpPeerCnt'],0),dc['downBgpPeerCntText']);
                        }
                    },
                    {
                        field:"activevRouterCount",
                        name:"vRouters",
                        formatter:function(r,c,v,cd,dc){
                            return contrail.format("{0} Total {1}",dc['totalXMPPPeerCnt'],dc['downXMPPPeerCntText']);
                        },
                        minWidth:100
                    },
                    {
                        field:"version",
                        name:"Version",
                        minWidth:110
                    },
                    {
                        field:"cpu",
                        name:"CPU (%)",
                        formatter:function(r,c,v,cd,dc) {
                            return '<div class="gridSparkline display-inline"></div><span class="display-inline">' + dc['cpu'] + '</span>';
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
                        minWidth:110
                    },
                ],
            }
        });
        ctrlNodesGrid = $('#gridControlNodes').data('contrailGrid');
        controlDeferredObj.done(function() {
           ctrlNodesGrid.removeGridLoading();
        });
        controlDeferredObj.fail(function() {
           ctrlNodesGrid.showGridMessage('errorGettingData');
        });
        if(controlNodesResult['lastUpdated'] != null && (controlNodesResult['error'] == null || controlNodesResult['error']['errTxt'] == 'abort')){
            triggerDatasourceEvents(controlNodeDS);
        } else {
            ctrlNodesGrid.showGridMessage('loading');
        }
        //applyGridDefHandlers(ctrlNodesGrid, {noMsg:'No Control Nodes to display'});
    }
    return {populateControlNodes:populateControlNodes}
})();

function onCtrlNodeRowSelChange(dc) {
    ctrlNodesGrid = $('#gridControlNodes').data('contrailGrid');
    ctrlNodeView.load({name:dc['name'], ip:dc['ip']});
 }
