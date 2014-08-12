/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Config Nodes Generators Page
 */
monitorInfraConfigSummaryClass = (function() {
    var ctrlNodesGrid;
    this.populateConfigNodes = function() {
        infraMonitorUtils.clearTimers();
        var confNodesTemplate = contrail.getTemplate4Id("confignodes-template");
        $(pageContainer).html(confNodesTemplate({}));
        var configNodeDS = new SingleDataSource('configNodeDS');
        var configNodesResult = configNodeDS.getDataSourceObj();
        var configNodesDataSource = configNodesResult['dataSource'];
        var configDeferredObj = configNodesResult['deferredObj'];
        //Initialize widget header
        $('#configNodes-header').initWidgetHeader({title:'Config Nodes', widgetBoxId:'recent'});
        $('#config-nodes-grid').contrailGrid({
            header : {
                title : {
                    text : 'Config Nodes'
                },
                customControls: []
            },
            body: {
                options: {
                    autoHeight : true,
                    enableAsyncPostRender:true,
                    forceFitColumns:true,
                    lazyLoading:true,
                    detail:{
                        template: $("#gridDetailTemplate").html(),
                        onExpand: function (e,dc) {
                            var detailTemplate = contrail.getTemplate4Id('infra-summary-details-template');
                            var rowData = e.data;
                            var grid = $(e['target']).closest('div.contrail-grid');
                            var dataItem = dc;
                            var data = getConfigNodeLblValuePairs(dc);
                            data = {d:data};
                            //Issue a call for fetching the details
                            if(data != null) {
                                e.detailRow.find('.row-fluid.advancedDetails').html('<div><pre style="background-color:white">' + syntaxHighlight(dc.raw_json) + '</pre></div>');
                                //DataItem consists of row data,passing it as a parameter to the parsefunction
                                e.detailRow.find('.row-fluid.basicDetails').html(detailTemplate(data));
                                $(grid).data('contrailGrid').adjustDetailRowHeight(dataItem['id']);
                            } else {
                                e.detailRow.find('.row-fluid.basicDetails').html(detailTemplate(data));
                            }
                        },
                        onCollapse:function (e,dc) {
                        }
                    }
                },
                dataSource: {
                    dataView: configNodesDataSource,
                },
                 statusMessages: {
                     loading: {
                         text: 'Loading Config Nodes..',
                     },
                     empty: {
                         text: 'No Config Nodes to display'
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
                        field:"hostName",
                        name:"Host name",
                        sortable : {
                            sortBy: 'formattedValue'
                        },
                        formatter:function(r,c,v,cd,dc) {
                           return cellTemplateLinks({cellText:'name',name:'name',statusBubble:true,rowData:dc});
                        },
                        events: {
                           onClick: function(e,dc){
                              onConfigNodeRowSelChange(dc);
                           }
                        },
                        cssClass: 'cell-hyperlink-blue',
                        searchFn:function(d) {
                            return d['name'];
                        },
                        minWidth:175,
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return dc.name;
            				}
            			},
                    },
                    {
                        field:"ip",
                        name:"IP address",
                        minWidth:90,
                        formatter:function(r,c,v,cd,dc){
                            return summaryIpDisplay(dc['ip'],dc['summaryIps']);
                        },
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
                        formatter:function(r,c,v,cd,dc) {
                            return getNodeStatusContentForSummayPages(dc,'html');
                        },
                        searchFn:function(d) {
                            return getNodeStatusContentForSummayPages(dc,'text');
                        },
                        minWidth:110,
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return getNodeStatusContentForSummayPages(dc,'text');
            				}
            			}
                    },
                    {
                        field:"version",
                        name:"Version",
                        minWidth:90
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
                        minWidth:110,
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return dc.cpu;
            				}
            			}
                    },
                    {
                        field:"memory",
                        name:"Memory",
                        minWidth:150
                    }
                ],
            }
        });
        confNodesGrid = $('#config-nodes-grid').data('contrailGrid');
        configDeferredObj.done(function() {
           confNodesGrid.removeGridLoading();
        });
        configDeferredObj.fail(function() {
           confNodesGrid.showGridMessage('errorGettingData');
        });

        $(configNodeDS).on("change",function(){
            updateChartsForSummary(configNodesDataSource.getItems(),"config");
            //Revisit if required with opensourcing changes
            //updateCpuSparkLines(confNodesGrid,configNodesDataSource.getItems());
        });
        if(configNodesResult['lastUpdated'] != null && (configNodesResult['error'] == null || configNodesResult['error']['errTxt'] == 'abort')){
         triggerDatasourceEvents(configNodeDS);
        } else {
            confNodesGrid.showGridMessage('loading');
        }
        //applyGridDefHandlers(confNodesGrid, {noMsg:'No Config Nodes to display'});
    };
    return {populateConfigNodes:populateConfigNodes};
})();

function onConfigNodeRowSelChange(dc) {
    confNodeView.load({name:dc['name'], ip:dc['ip']});
}
