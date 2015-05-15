/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Control Nodes Summary Page
 */
monitorInfraControlSummaryClass = (function() {
    var disabledFeat = globalObj['webServerInfo']['disabledFeatures'].disabled;
    var showDetails = disabledFeat != null && disabledFeat.indexOf('disable_expand_details') !== -1 ? false : true;
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
            //add display name
            var rowItems = controlNodesDataSource.getItems();
            for(var i = 0; i < rowItems.length;i++) {
                 rowItems[i].displayName = rowItems[i].displayName != null ? rowItems[i].displayName : rowItems[i].name;
                 rowItems[i].name = constructValidDOMId(rowItems[i].name);
            }
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
                    detail: (showDetails ? {
                        template: $("#controlnode-template").html(),
                        onExpand: function (e,dc) {
                            $('#control_tabstrip_' + dc['name']).attr('style', 'margin:10px 10% 10px 10%');
                            //zoom out detail content
                           /* $('#control_tabstrip_' + dc['name']).panzoom({
                                increment: 0.15
                            });
                            $('#control_tabstrip_' + dc['name']).panzoom("zoom",true);*/
                            //ctrlNodeView.populateControlNode({name:dc['name'], ip:dc['ip'], detailView : true});
                            dc.detailView = true;
                            onCtrlNodeRowSelChange(dc);
                            $('#gridControlNodes > .grid-body > .slick-viewport > .grid-canvas > .slick-row-detail').addClass('slick-grid-detail-content-height');
                            $('#gridControlNodes > .grid-body > .slick-viewport > .grid-canvas > .slick-row-detail > .slick-cell').addClass('slick-grid-detail-sub-content-height');
                        },
                        onCollapse:function (e,dc) {
                        }
                    } : false)
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
                        field:"displayName",
                        name:"Host name",
                        formatter:function(r,c,v,cd,dc) {
                           return cellTemplateLinks({cellText:'displayName',name:'displayName',statusBubble:true,rowData:dc});
                        },
                        events: {
                           onClick: function(e,dc){
                              dc.detailView = undefined;
                              onCtrlNodeRowSelChange(dc);
                           }
                        },
                        cssClass: 'cell-hyperlink-blue',
                        minWidth:110,
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return dc.displayName;
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
                            return getNodeStatusContentForSummayPages(dc,'html');
                        },
                        searchFn:function(d) {
                            return getNodeStatusContentForSummayPages(d,'text');
                        },
                        minWidth:150
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
                    {
                        field:"establishedPeerCount",
                        name:"BGP Peers",
                        minWidth:140,
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
                        minWidth:140
                    }
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
    ctrlNodeView.load({name:dc['name'], ip:dc['ip'], displayName : dc['displayName'], detailView : dc['detailView']});
 }
