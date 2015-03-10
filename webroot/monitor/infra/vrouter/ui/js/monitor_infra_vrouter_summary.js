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
    updateCrossFilters = true;
    var dimensions = [],filterDimension;
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
    
    function updateView() {
        //Update the grid
        var selectedData = filterDimension.top(Infinity);
        var selectedDataWithStatus = [];
        filteredNodeNames = [];
        $.each(selectedData,function(idx,obj){
          filteredNodeNames.push(obj['name']);
        });
        computeNodesGrid = $('#divcomputesgrid').data('contrailGrid');
        computeNodesGrid._dataView.setFilterArgs({
            filteredNodeNames:filteredNodeNames
        });
        //Don't update crossfilters as updateView is triggered on change of crossfilter selection
        updateCrossFilters = false;
        computeNodesGrid._dataView.setFilter(function(item,args) {
            if($.inArray(item['name'],args['filteredNodeNames']) > -1)
                return true;
            return false;
        });
        //update the charts
        updateChartsForSummary(selectedData,"compute");
        
        //update the header
        var infoElem = $('#vrouter-header h4');
        var innerText = infoElem.text().split('(')[0].trim();
        var totalCnt = vRoutersDataSource.getItems().length;
        var filteredCnt = filteredNodeNames.length;
        //totalCnt = ifNull(options['totalCntFn'](), totalCnt);
        if (totalCnt == filteredCnt)
            innerText += ' (' + totalCnt + ')';
        else
            innerText += ' (' + filteredCnt + ' of ' + totalCnt + ')';
        infoElem.text(innerText);
    }
    
    function updateCrossFilter(vRouterData){
        $('.chart > svg').remove();
       //Start updating the crossfilter
       vRouterCF = crossfilter(vRouterData);
       var intfDimension = vRouterCF.dimension(function(d) { return d.intfCnt;});
       var instDimension = vRouterCF.dimension(function(d) { return d.instCnt;});
       var vnDimension = vRouterCF.dimension(function(d) { return d.vnCnt;});
       dimensions.push(intfDimension,instDimension,vnDimension);
       filterDimension = vRouterCF.dimension(function(d) { return d.intfCnt;});
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
               .toolTip(true)
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
        
         chart = d3.selectAll(".chart")
             .data(charts)
             .each(function(currChart) { currChart.on("brush", function() {
                 logMessage('bgpMonitor',filterDimension.top(10));
                 updateView();
                 renderAll(chart);
             }).on("brushend", function() { 
                 updateView();
                 renderAll(chart);
             }); 
         });
         renderAll(chart);
         //Add reset listener
         $('.reset').unbind('click');
         $('.reset').bind('click',function() {
             var idx = $(this).closest('.chart').index();
             charts[idx].filter(null);
             renderAll(chart);
             updateView();
         });
         //End update to crossfilter
    }//updateCrossFilter
    
    this.populateComputeNodes = function () {
        infraMonitorUtils.clearTimers();
        var compNodesTemplate = contrail.getTemplate4Id("computenodes-template");
        $(pageContainer).html(compNodesTemplate({}));
        //Initialize widget header
        $('#vrouter-header').initWidgetHeader({title:'vRouters',widgetBoxId:'recent'});
        //Create the managedDS
        var vRouterDS = new SingleDataSource('computeNodeDS');
        vRoutersResult = vRouterDS.getDataSourceObj();
        vRoutersDataSource = vRoutersResult['dataSource'];
        vRouterDeferredObj = vRoutersResult['deferredObj'];//gives the deferred object from managed datasource
       
        $(vRouterDS).on('change',function() {
            var filteredNodes = [];
            var rowItems = vRoutersDataSource.getItems();
            for(var i=0;i<rowItems.length;i++) {
                filteredNodes.push(rowItems[i]);
            }
            updateChartsForSummary(filteredNodes,'compute');
            if(updateCrossFilters == true) 
                updateCrossFilter(filteredNodes);
            else
                updateCrossFilters = true;
            
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
            
            //ToDo: Need to see issue with sparkLine update
            //updateCpuSparkLines(computeNodesGrid,localDS.data());
        });
        var emptyDataSource = new ContrailDataView();
        $('#divcomputesgrid').contrailGrid({
            header : {
                title : {
                    text : 'Virtual Routers'
                },
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
                            return '<div class="gridSparkline display-inline"></div><span class="display-inline">'  + dc['cpu'] +  '</span>';
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
       /* $(vRouterDS).on('change',function() {
            var infoElem = $('#vrouter-header h4');
            var innerText = infoElem.text().split('(')[0].trim();
            var totalCnt = vRoutersDataSource.getItems().length;
            var filteredCnt = vRoutersDataSource.getLength();
            //totalCnt = ifNull(options['totalCntFn'](), totalCnt);
            if (totalCnt == filteredCnt)
                innerText += ' (' + totalCnt + ')';
            else
                innerText += ' (' + filteredCnt + ' of ' + totalCnt + ')';
            infoElem.text(innerText);
        });*/
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

