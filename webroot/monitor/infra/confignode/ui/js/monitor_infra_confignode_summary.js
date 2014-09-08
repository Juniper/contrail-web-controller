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
                    detail:{
                        template: $("#confignode-template").html(),
                        onExpand: function (e,dc) {
                            $('#config_tabstrip_' + dc['name']).attr('style', 'margin:10px 150px 10px 150px');
                            confNodeView.populateConfigNode({name:dc['name'], ip:dc['ip'], detailView : true});
                            $('#config-nodes-grid > .grid-body > .slick-viewport > .grid-canvas > .slick-row-detail').addClass('slick-grid-detail-content-height');
                            $('#config-nodes-grid > .grid-body > .slick-viewport > .grid-canvas > .slick-row-detail > .slick-cell').addClass('slick-grid-detail-sub-content-height');
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
                        minWidth:90,
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
            			},
            			sorter : comparatorIP
                    },
                    {
                        field:"version",
                        name:"Version",
                        minWidth:90
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
        });
        if(configNodesResult['lastUpdated'] != null && (configNodesResult['error'] == null || configNodesResult['error']['errTxt'] == 'abort')){
         triggerDatasourceEvents(configNodeDS);
        } else {
            confNodesGrid.showGridMessage('loading');
        }
    };
    return {populateConfigNodes:populateConfigNodes};
})();

function onConfigNodeRowSelChange(dc) {
    confNodeView.load({name:dc['name'], ip:dc['ip']});
}
