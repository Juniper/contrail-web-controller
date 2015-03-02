/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Analytics Nodes Summary Page
 */
monitorInfraAnalyticsSummaryClass = (function() {
    var aNodesGrid;
    var disabledFeat = globalObj['webServerInfo']['disabledFeatures'].disabled;
    var showDetails = disabledFeat != null && disabledFeat.indexOf('disable_expand_details') !== -1 ? false : true;
    this.populateAnalyticsNodes = function() {
        infraMonitorUtils.clearTimers();
        var aNodesTemplate = contrail.getTemplate4Id("analyticsnodes-template");
        $(pageContainer).html(aNodesTemplate({}));
        var analyticsNodeDS = new SingleDataSource('analyticsNodeDS');
        var analyticsNodesResult = analyticsNodeDS.getDataSourceObj();
        var analyticsNodesDataSource = analyticsNodesResult['dataSource'];
        var analyticsDeferredObj = analyticsNodesResult['deferredObj'];
        //Initialize widget header
        $('#analyticNodes-header').initWidgetHeader({title:'Analytics Nodes', widgetBoxId:'recent'});
        $('#analytics-nodes-grid').contrailGrid({
            header : {
                title : {
                    text : 'Analytics Nodes'
                },
                customControls: []
            },
            body: {
                options: {
                    autoHeight : true,
                    enableAsyncPostRender: true,
                    forceFitColumns:true,
                    detail:(showDetails ? {
                        template: $("#analyticsnode-template").html(),
                        onExpand: function (e,dc) {
                            $('#analytics_tabstrip_' + dc['name']).attr('style', 'margin:10px 10% 10px 10%');
                            //aNodeView.populateAnalyticsNode({name:dc['name'], ip:dc['ip'], detailView : true});
                            dc.detailView = true;
                            onAnalyticsNodeRowSelChange(dc);
                            $('#analytics-nodes-grid > .grid-body > .slick-viewport > .grid-canvas > .slick-row-detail').addClass('slick-grid-detail-content-height');
                            $('#analytics-nodes-grid > .grid-body > .slick-viewport > .grid-canvas > .slick-row-detail > .slick-cell').addClass('slick-grid-detail-sub-content-height');                           
                        },
                        onCollapse:function (e,dc) {
                        }
                    } : false)
                },
                dataSource: {
                    dataView: analyticsNodesDataSource,
                },
                 statusMessages: {
                     loading: {
                         text: 'Loading Analytics Nodes..',
                     },
                     empty: {
                         text: 'No Analytics Nodes to display'
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
                        id:"displayName",
                        name:"Host name",
                        formatter:function(r,c,v,cd,dc) {
                           return cellTemplateLinks({cellText:'displayName',name:'displayName',statusBubble:true,rowData:dc});
                        },
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return dc.displayName;
            				}
            			},
                        events: {
                           onClick: function(e,dc){
                              dc.detailView = undefined;
                              onAnalyticsNodeRowSelChange(dc);
                           }
                        },
                        cssClass: 'cell-hyperlink-blue',
                        minWidth:110,
                        sortable:true
                    },
                    {
                        field:"ip",
                        id:"ip",
                        name:"IP address",
                        minWidth:110,
                        sortable:true,
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
                        id:"version",
                        name:"Version",
                        sortable:true,
                        minWidth:110
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
                        field:"cpu",
                        id:"analyticsCpu",
                        name:"CPU (%)",
                        formatter:function(r,c,v,cd,dc) {
                            return '<div class="gridSparkline display-inline"></div><span class="display-inline">' + dc['cpu'] + '</span>';
                        },
                        asyncPostRender: renderSparkLines,
                        searchFn:function(d){
                            return d['cpu'];
                        },
                        minWidth:120,
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return dc.cpu
            				}
            			}
                    },
                    {
                        field:"memory",
                        id:"analyticsMem",
                        sortable:true,
                        name:"Memory",
                        minWidth:150
                    },
                    {
                        field:"genCount",
                        id:"genCount",
                        sortable:true,
                        name:"Generators",
                        minWidth:85
                    }
                ],
            }
        });
        aNodesGrid = $('#analytics-nodes-grid').data('contrailGrid');
        analyticsDeferredObj.done(function() {
           aNodesGrid.removeGridLoading();
        });
        analyticsDeferredObj.fail(function() {
           aNodesGrid.showGridMessage('errorGettingData');
        });
        $(analyticsNodeDS).on('change',function(){
            //add display name
            var rowItems = analyticsNodesDataSource.getItems();
            for(var i = 0; i < rowItems.length;i++) {
                 rowItems[i].displayName = rowItems[i].displayName != null ? rowItems[i].displayName : rowItems[i].name;
                 rowItems[i].name = constructValidDOMId(rowItems[i].name);
            }        
            updateChartsForSummary(analyticsNodesDataSource.getItems(),"analytics");
        });
        if(analyticsNodesResult['lastUpdated'] != null && (analyticsNodesResult['error'] == null || analyticsNodesResult['error']['errTxt'] == 'abort')){
           triggerDatasourceEvents(analyticsNodeDS);
        } else {
            aNodesGrid.showGridMessage('loading');
        }
    }
    return {populateAnalyticsNodes:populateAnalyticsNodes};
})();

function getGeneratorsInfoForAnalyticsNodes(analyticsDS) {
    $.ajax({
        url:TENANT_API_URL,
        type:'post',
        data:{"data":[{"type":"collector","cfilt":"CollectorState"}]}
    }).done(function(result) {
        var aNodesMap = {};
        $.each(result[0]['value'],function(idx,collectorObj) {
            var name = collectorObj['name'];
            aNodesMap[name] = {
                generators: getValueByJsonPath(collectorObj,'value;CollectorState;generator_infos')
            }
        });
        var currData;
        if(analyticsDS != null) {
            currData = analyticsDS.data();
            $.each(currData,function(idx,currObj) {
                if(aNodesMap[currObj['name']] != null)
                    currObj['generators'] = aNodesMap[currObj['name']]['generators'];
            });
            analyticsDS.data(currData);
        }
    });
}

function onAnalyticsNodeRowSelChange(dc) {
    aNodeView.load({name:dc['name'], ip:dc['ips'], displayName : dc['displayName'], detailView : dc['detailView']});
}

function mergeCollectorDataAndPrimaryData(collectorData,primaryDS){
    var collectors = ifNull(collectorData.value,[]);
    if(collectors.length == 0){
        return;
    }
    var primaryData = primaryDS.getItems();
    var updatedData = [];
    $.each(primaryData,function(i,d){
        var idx=0;
        while(collectors.length > 0 && idx < collectors.length){
            if(collectors[idx]['name'] == d['name']){
                var genInfos = ifNull(jsonPath(collectors[idx],"$.value.CollectorState.generator_infos")[0],[]);
                d['genCount'] = genInfos.length;
                collectors.splice(idx,1);
                break;
            }
            idx++;
        };
        updatedData.push(d);
    });
    primaryDS.updateData(updatedData);
    return primaryDS;
}

function startFetchingCollectorStateGenInfos(deferredObj,primaryDS,dsName){
    var retArr = [];
    var cfilts = 'CollectorState:generator_infos';
    var postData = getPostData("analytics-node",'','',cfilts,'');
    $.ajax({
        url:TENANT_API_URL,
        type:'POST',
        data:postData
    }).done(function(result) {
        if(result != null && result [0] != null){
            primaryDS =  mergeCollectorDataAndPrimaryData(result[0],primaryDS);
            deferredObj.resolve({dataSource:primaryDS});
        }
    }).fail(function(result) {
        //nothing to do..the generators numbers will not be updated
    });
}
