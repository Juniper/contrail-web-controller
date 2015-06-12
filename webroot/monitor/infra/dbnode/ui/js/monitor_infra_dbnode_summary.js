/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Database Nodes Generators Page
 */
monitorInfraDatabaseSummaryClass = (function() {
    var dbNodesGrid;
    this.populateDbNodes = function() {
        infraMonitorUtils.clearTimers();
        var dbNodesTemplate = contrail.getTemplate4Id("dbnodes-template");
        $(pageContainer).html(dbNodesTemplate({}));
        var dbNodeDS = new SingleDataSource('dbNodeDS');
        var dbNodesResult = dbNodeDS.getDataSourceObj();
        var dbNodesDataSource = dbNodesResult['dataSource'];
        var dbDeferredObj = dbNodesResult['deferredObj'];
        var dbPurgeTemplate = contrail.getTemplate4Id('purge-action-template');
        //Initialize widget header
        $('#dbNodes-header').initWidgetHeader({title:'Database Nodes', widgetBoxId:'recent'});
        $('#db-nodes-grid').contrailGrid({
            header : {
                title : {
                    text : 'Database Nodes'
                },
                customControls: [dbPurgeTemplate()],
            },
            body: {
                options: {
                    autoHeight : true,
                    enableAsyncPostRender:true,
                    forceFitColumns:true
                },
                dataSource: {
                    dataView: dbNodesDataSource,
                },
                 statusMessages: {
                     loading: {
                         text: 'Loading Database Nodes..',
                     },
                     empty: {
                         text: 'No Database Nodes to display'
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
                              onDbNodeRowSelChange(dc);
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
                        name:"IP Address",
                        minWidth:110,
                        sorter : comparatorIP
                    },
                    {
                        field:"status",
                        id:"status",
                        name:"Status",
                        sortable:true,
                        formatter:function(r,c,v,cd,dc) {
                            return getNodeStatusContentForSummayPages(dc,'html');
                        },
                        searchFn:function(d) {
                            return getNodeStatusContentForSummayPages(d,'text');
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
                        field:"formattedAvailableSpace",
                        name:"Available Space",
                        minWidth:110,
                        sortField:"dbSpaceAvailable"
                    },
                    {
                        field:"formattedUsedSpace",
                        name:"Used Space",
                        minWidth:110,
                        sortField:"dbSpaceUsed"
                    },
                    {
                        field:"formattedAnalyticsDbSize",
                        name:"Analytics DB Size",
                        minWidth:110,
                        sortField:"analyticsDbSize"
                    },
                    
                ],
            }
        });
        dbNodesGrid = $('#db-nodes-grid').data('contrailGrid');
        dbDeferredObj.done(function() {
           dbNodesGrid.removeGridLoading();
        });
        dbDeferredObj.fail(function() {
           dbNodesGrid.showGridMessage('errorGettingData');
        });

        $(dbNodeDS).on("change",function(){
            updateChartsForSummary(dbNodesDataSource.getItems(),"db");
            //Revisit if required with opensourcing changes
            //updateCpuSparkLines(dbNodesGrid,dbNodesDataSource.getItems());
        });
        if(dbNodesResult['lastUpdated'] != null && (dbNodesResult['error'] == null || dbNodesResult['error']['errTxt'] == 'abort')){
         triggerDatasourceEvents(dbNodeDS);
        } else {
            dbNodesGrid.showGridMessage('loading');
        }
        //applyGridDefHandlers(dbNodesGrid, {noMsg:'No Db Nodes to display'});
    };
    return {populateDbNodes:populateDbNodes};
})();

function onDbNodeRowSelChange(dc) {
    databaseNodeView.load({name:dc['name'], ip:dc['ip']});
}

function purgeAnalyticsDB(purgePercentage) {
    var ajaxConfig = {
        type: "GET",
        url: "/api/analytics/db/purge?purge_input=" + purgePercentage
    };

    contrail.ajaxHandler(ajaxConfig, null, function(response) {
        if(response != null && response['status'] == 'started') {
            showInfoWindow("Analytics DB purge has been started.", "Success");
        } else {
            showInfoWindow(response, "Purge Response");
        }
    }, function(response){
        var errorMsg = contrail.parseErrorMsgFromXHR(response);
        showInfoWindow(errorMsg, "Error");
    });
}
