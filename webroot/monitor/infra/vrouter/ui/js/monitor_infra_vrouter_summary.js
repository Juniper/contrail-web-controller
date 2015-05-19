/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouters Summary Page
 */
monitorInfraComputeSummaryClass = (function() {
    var computeNodesGrid,vRoutersData = [];
    var vRouterDataWithStatusInfo = [];
    var filteredNodeNames = [];
    var vRouterCF;
    var dimensions = [];
    var self = this;
    var vRoutersResult = null;
    var vRoutersDataSource = null;
    var vRouterDeferredObj = null;
    var shouldRefresh = true;
    this.getvRouterCF = function() {
        return vRouterCF;
    }
    this.getvRoutersData = function() {
        return vRoutersData;
    }
    this.setvRoutersData = function(data) {
        vRoutersData = data;
    }
    this.getvRoutersDataWithStatus = function() {
        return vRouterDataWithStatusInfo;
    }
    this.setvRoutersDataWithStatus = function(data) {
        vRouterDataWithStatusInfo = data;
    }
    this.getCFDimensions = function() {
        return dimensions;
    }
    function updateGrid(result) {
        var selectedData = result['data'];
        //Update the grid
        filteredNodeNames = [];
        $.each(selectedData,function(idx,obj){
          //vRouters that match the filter criteria
          filteredNodeNames.push(obj['name']);
        });
        computeNodesGrid = $('#divcomputesgrid').data('contrailGrid');
        computeNodesGrid._dataView.setFilterArgs({
            filteredNodeNames:filteredNodeNames
        });
        computeNodesGrid._dataView.setFilter(function(item,args) {
            if($.inArray(item['name'],args['filteredNodeNames']) > -1)
                return true;
            return false;
        });
        
        //update the header
        var totalCnt = vRoutersDataSource.getItems().length;
        var filteredCnt = filteredNodeNames.length;
        updatevRouterLabel('#vrouter-header',filteredCnt,totalCnt);
    }
    
    function updateCrossFilter(result){
        var vRouterData = result['data'];
        var source = result['cfg']['source'];
        //Do not update crossfilters if the update request also came from crossfilter or because of a generator update
        if(source == 'crossfilter' || source == 'generator'){
            return;
        }
        $('.chart > svg').remove();
        
       var vRouterCF = manageCrossFilters.getCrossFilter('vRoutersCF');
       var intfDimension = manageCrossFilters.getDimension('vRoutersCF','intfCnt');
       var instDimension = manageCrossFilters.getDimension('vRoutersCF','instCnt');
       var vnDimension = manageCrossFilters.getDimension('vRoutersCF','vnCnt');
       
       dimensions.push(intfDimension,instDimension,vnDimension);
       //Set crossfilter bucket count based on number of max VNs/interfaces/instances on a vRouter
       var vnCnt = 24;
       var intfCnt = 24;
       var instCnt = 24;
       //Max bar value across all 3 cross-filter charts
       var vnMaxValue=0,instMaxValue=0,intfMaxValue=0;
       if(vnDimension.top(1).length > 0) {
           vnCnt = Math.max(vnCnt,d3.max(vnDimension.group().all(),function(d) { return d['key'] }));
           vnMaxValue = d3.max(vnDimension.group().all(),function(d) { return d['value'] });
       }
       if(instDimension.top(1).length > 0) {
           instCnt = Math.max(instCnt,d3.max(instDimension.group().all(),function(d) { return d['key'] })); 
           instMaxValue = d3.max(instDimension.group().all(),function(d) { return d['value'] }); 
       }
       if(intfDimension.top(1).length > 0) {
           intfCnt = Math.max(intfCnt,d3.max(intfDimension.group().all(),function(d) { return d['key'] })); 
           intfMaxValue = d3.max(intfDimension.group().all(),function(d) { return d['value'] }); 
       }
       var maxBarValue = Math.max(vnMaxValue,instMaxValue,intfMaxValue);
   
       //Initialize CrossFilter Charts
       charts = [
           barChart()
               .dimension(vnDimension)
               .group(vnDimension.group(Math.floor))
               .toolTip(false)
             .x(d3.scale.linear()
               .domain([0, vnCnt+(vnCnt/24)])
               .rangeRound([0, 10 * 26])) //Width
             .y(d3.scale.linear()
               .domain([0,maxBarValue])
               .range([50,0])),
   
           barChart()
               .dimension(instDimension)
               .group(instDimension.group())
               .toolTip(false)
             .x(d3.scale.linear()
               .domain([0, instCnt+(instCnt/24)])
               .rangeRound([0, 10 * 26]))
             .y(d3.scale.linear()
               .domain([0,maxBarValue])
               .range([50,0])),
   
           barChart()
               .dimension(intfDimension)
               .group(intfDimension.group())
               .toolTip(false)
             .x(d3.scale.linear()
               .domain([0, intfCnt+(intfCnt/24)])
               .rangeRound([0, 10 * 26]))
             .y(d3.scale.linear()
               .domain([0,maxBarValue])
               .range([50,0]))
           ];
        
         var chart = d3.selectAll(".chart")
             .data(charts)
             .each(function(currChart) { currChart.on("brushend", function(d) { 
                 manageCrossFilters.fireCallBacks('vRoutersCF',{source:'crossfilter'});
                 renderAll(chart);
             }); 
         });
         renderAll(chart);
         //Add reset listener
         $('.reset').unbind('click');
         $('.reset').bind('click',function() {
             var idx = $(this).closest('.chart').index();
             charts[idx].filter(null);
             manageCrossFilters.fireCallBacks('vRoutersCF',{source:'crossfilter'});
             renderAll(chart);
         });
         //End update to crossfilter
    }//updateCrossFilter
    
    function updatevRouterSummaryCharts(result){
        var filteredNodes = result['data'];
        var source = result['cfg']['source'];
        //if the callback is because of an update to generator then dont update the charts
        if(source == 'generator'){
            return;
        }
        updateChartsForSummary(filteredNodes,'compute');
    }
        
    this.populateComputeNodes = function () {
        infraMonitorUtils.clearTimers();
        var compNodesTemplate = contrail.getTemplate4Id("computenodes-template");
        $(pageContainer).html(compNodesTemplate({}));
        //Initialize widget header
        $('#vrouter-header').initWidgetHeader({title:'Virtual Routers',widgetBoxId:'recent'});
        //Create the managedDS
        var vRouterDS = new SingleDataSource('computeNodeDS');
        
        vRoutersResult = vRouterDS.getDataSourceObj();
        vRoutersDataSource = vRoutersResult['dataSource'];
        vRouterDeferredObj = vRoutersResult['deferredObj'];//gives the deferred object from managed datasource
       
        $(vRouterDS).on('change',function() {
            //TODO dono why its required will need to take a look later by removing it
            var filteredNodes = [];
            $.each(vRoutersDataSource.getItems(),function(i,item){
                filteredNodes.push(item);
            });
            setTimeout(function () {
                var cgrid = $('#divcomputesgrid').data('contrailGrid');
                if(cgrid != null) {
                    try{
                        cgrid._dataView.updateData(filteredNodes);
                    } catch(e) {
                        cgrid._dataView.setItems(filteredNodes);
                    }
                }
            }, 500);
            $.each(filteredNodes,function(idx,obj){
                    if(obj['xField'] != null)
                        obj['x'] = obj[obj['xField']];
                    if(obj['yField'] != null)
                        obj['y'] = obj[obj['yField']];
                });
            
            var source = 'datasource';
            //Set source accordingly,as certain UI widgets need no reload/refresh if updates comes from certain sources
            //Like populating generators information for vRouter nodes does not need refresh on scatter chart
            if(filteredNodes[0] != null && filteredNodes[0]['isGeneratorRetrieved'] == true){
                source = 'generator';
            }
            if(source != 'generator'){
                manageCrossFilters.updateCrossFilter('vRoutersCF',filteredNodes);
                //Add current crossfilters dimensions again as they will be lost on crossfilter reset
                manageCrossFilters.addDimension('vRoutersCF','intfCnt');
                manageCrossFilters.addDimension('vRoutersCF','instCnt');
                manageCrossFilters.addDimension('vRoutersCF','vnCnt');
                //Add crossfilter dimensions for charts ie x and y
                manageCrossFilters.addDimension('vRoutersCF','x');
                manageCrossFilters.addDimension('vRoutersCF','y');
                manageCrossFilters.addDimension('vRoutersCF','color');
                manageCrossFilters.addDimension('vRoutersCF','name');
            }
            manageCrossFilters.fireCallBacks('vRoutersCF',{source:source});
        });
        var emptyDataSource = new ContrailDataView();
        //register to listen to callbacks for updates on the crossfilter and update the 
        //components which are listening to changes on it. 
        manageCrossFilters.addCallBack('vRoutersCF','updatevRouterSummaryCharts',updatevRouterSummaryCharts);
        manageCrossFilters.addCallBack('vRoutersCF','updateCrossFilter',updateCrossFilter);
        manageCrossFilters.addCallBack('vRoutersCF','updateGrid',updateGrid);
        $('#divcomputesgrid').contrailGrid({
            header : {
                title : {
                    text : 'Virtual Routers'
                },
                showFilteredCntInHeader: true,
                customControls: []
            },
            body: {
                options: {
                    autoHeight : true,
                    enableAsyncPostRender:true,
                    forceFitColumns:true,
                    detail:{
                        template: $("#computenode-template").html(),
                        onExpand: function (e,dc) {
                            //scaling down the content
                            $('#compute_tabstrip_' + dc['name']).attr('style', 'margin:10px 150px 10px 150px');
                            cmpNodeView.populateComputeNode({name:dc['name'], ip:dc['ip'], detailView : true});
                            $('#divcomputesgrid > .grid-body > .slick-viewport > .grid-canvas > .slick-row-detail').addClass('slick-grid-detail-content-height');
                            $('#divcomputesgrid > .grid-body > .slick-viewport > .grid-canvas > .slick-row-detail > .slick-cell').addClass('slick-grid-detail-sub-content-height');
                        },
                        detailView : true,
                        onCollapse:function (e,dc) {
                        }
                    }
                },
                dataSource: {
                    dataView: emptyDataSource,
                },
                 statusMessages: {
                     loading: {
                         text: 'Loading Virtual Routers..',
                     },
                     empty: {
                         text: 'No Virtual Routers to display'
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
                        minWidth:110,
                        formatter:function(r,c,v,cd,dc) {
                           return cellTemplateLinks({cellText:'name',name:'name',statusBubble:true,rowData:dc});
                        },
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return dc.name;
            				}
            			},
                        events: {
                           onClick: function(e,dc){
                              onComputeNodeChange(dc);
                           }
                        },
                        cssClass: 'cell-hyperlink-blue',
                    },
                    {
                        field:"ip",
                        name:"IP Address",
                        formatter:function(r,c,v,cd,dc){
                            return summaryIpDisplay(dc['ip'],dc['summaryIps']);
                        },
                        minWidth:110,
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
                        minWidth:110
                    },
                    {
                        field:"status",
                        name:"Status",
                        formatter: function(r,c,v,cd,dc) {
                            return getNodeStatusContentForSummayPages(dc,'html');
                        },
                        searchFn: function(d) {
                            return getNodeStatusContentForSummayPages(dc,'text');
                        },
                        minWidth:150,
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return getNodeStatusContentForSummayPages(dc,'text');
            				}
            			},                    
            		},
            		{
                        field:"vRouterType",
                        name:"Type",
                        formatter: function(r,c,v,cd,dc) {
                            return getDisplayNameForVRouterType(v);
                        },
                        searchFn: function(d) {
                            return getDisplayNameForVRouterType(v);
                        },
                        minWidth:120
                    },
                    {
                        field:"cpu",
                        name:"CPU (%)",
                        minWidth:150,
                        formatter:function(r,c,v,cd,dc) {
                            return '<div class="gridSparkline display-inline"></div><span class="display-inline">'  + ifNotNumeric(dc['cpu'],'-') +  '</span>';
                        },
                        asyncPostRender: renderSparkLines,
                        searchFn:function(d){
                            return d['cpu'];
                        },
                        exportConfig: {
            				allow: true,
            				advFormatter: function(dc) {
            					return dc.cpu;
            				}
            			},
                    },
                    {
                        field:"memory",
                        name:"Memory",
                        minWidth:110
                    },
                    {
                        field:"vnCnt",
                        name:"Networks",
                        minWidth:100
                    },
                    {
                        field:"instCnt",
                        name:"Instances",
                        minWidth:100
                    },
                    {
                        field:"intfCnt",
                        name:"Interfaces",
                        formatter:function(r,c,v,cd,dc){
                            return contrail.format("{0} Total{1}",dc['intfCnt'],dc['errorIntfCntText']);
                        },
                        minWidth:150
                    },
                ],
            }
        });
        computeNodesGrid = $('#divcomputesgrid').data('contrailGrid');

        vRouterDeferredObj.done(function() {
           computeNodesGrid.removeGridLoading();
        });
        vRouterDeferredObj.fail(function() {
           computeNodesGrid.showGridMessage('errorGettingData');
        });
        if(vRoutersResult['lastUpdated'] != null && (vRoutersResult['error'] == null || vRoutersResult['error']['errTxt'] == 'abort')){
            triggerDatasourceEvents(vRouterDS);
        } else {
            computeNodesGrid.showGridMessage('loading');
        }
    }
    return {populateComputeNodes:populateComputeNodes};
})();

function getvRoutersDashboardDataForSummary(deferredObj,dataSource) {
    $.ajax({
        url: monitorInfraUrls['VROUTER_SUMMARY']
    }).done(function(result) {
        var r = infraMonitorUtils.parsevRoutersDashboardData(result);
        $.each(r,function(idx,obj){
            dataSource.add(obj);
        });
        deferredObj.resolve({dataSource:dataSource,response:r});
        
    }).fail(function(result) {
        showInfoWindow('Error in fetching vRouter Node details','Error');
        return([]);
    });
}

