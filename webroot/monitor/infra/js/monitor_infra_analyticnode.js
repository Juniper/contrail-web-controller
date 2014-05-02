analyticsNodesView = function () {
    var self = this,analyticNodesData;
    var aNodesGrid;
    this.load = function (obj) {
    	layoutHandler.setURLHashParams({node:'Analytics Nodes'},{merge:false,triggerHashChange:false});
        populateAnalyticsNodes();
    }
    this.getAnalyticNodesData = function() {
        return analyticNodesData;
    }
    this.setAnalyticNodesData = function(data) {
        analyticNodesData = data;
    }

    this.destroy = function () {
    	var kGrid = $('.contrail-grid').data('contrailGrid');
    	if(kGrid != null)
    		kGrid.destroy();
    	analyticsNodesDataSource.unbind("change",syncAnalyticsNodeLocalDataSource);
    }

    function populateAnalyticsNodes() {
        infraMonitorView.clearTimers();
        summaryChartsInitializationStatus['analyticsNode'] = false;
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
                    text : 'Analytics Nodes',
                    cssClass : 'blue',
                },
                customControls: []
            },
            body: {
                options: {
                    autoHeight : true,
                    enableAsyncPostRender: true,
                    forceFitColumns:true,
                    lazyLoading:true
                },
                dataSource: {
                    dataView: analyticsNodesDataSource
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
            footer : {
                pager : {
                    options : {
                        pageSize : 50,
                        pageSizeSelect : [10, 50, 100, 200, 500 ]
                    }
                }
            },
            columnHeader: {
                columns:[
                    {
                        field:"name",
                        id:"name",
                        name:"Host name",
                        formatter:function(r,c,v,cd,dc) {
                           return cellTemplateLinks({cellText:'name',name:'name',statusBubble:true,rowData:dc});
                        },
                        events: {
                           onClick: function(e,dc){
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
                            return getNodeStatusContentForSummayPages(dc,'text');
                        },
                        minWidth:110
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
                        minWidth:120
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
        })
        analyticsDeferredObj.fail(function() {
           aNodesGrid.showGridMessage('errorGettingData');
        })
        $(analyticsNodeDS).on('change',function(){
        	updateChartsForSummary(analyticsNodesDataSource.getItems(),"analytics");
        	//updateCpuSparkLines(aNodesGrid,analyticsNodesDataSource.getItems());
        });
        if(analyticsNodesResult['lastUpdated'] != null && (analyticsNodesResult['error'] == null || analyticsNodesResult['error']['errTxt'] == 'abort')){
           triggerDatasourceEvents(analyticsNodeDS);
        } else {
            aNodesGrid.showGridMessage('loading');
        }
        //applyGridDefHandlers(aNodesGrid, {noMsg:'No Analytics Nodes to display'});
    }
}

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
	    aNodeView.load({name:dc['name'], ip:dc['ips']});
	}

analyticsNodeView = function () {
    var peersGrid, routesGrid, consoleGrid ;
    var aNodeTabStrip = "analytics_tabstrip";
    var generatorsGrid;
    var aNodeInfo = {}, self = this;
    var aNodeData = {};
    /*Selenium Testing*/
    var aNodeDetailsData;
    this.getaNodeDetailsData = function(){
        return aNodeDetailsData; 
    } 
    /*End of Selenium Testing*/
    this.load = function (obj) {
        pushBreadcrumb([obj['name']]);
        aNodeInfo = obj;
    	if((aNodeInfo == null || aNodeInfo.ip ==  null ||  aNodeInfo.ip == '') && aNodeInfo.tab != null){
			//issue details call and populate ip
			var analyticsNodeDeferredObj = $.Deferred();
			self.getAnalyticsNodeDetails(analyticsNodeDeferredObj,aNodeInfo);
			analyticsNodeDeferredObj.done(function(data) {
				try{
					aNodeInfo['ip'] = data.CollectorState.self_ip_list[0];
				} catch(e){}
    	        self.populateAnalyticsNode(aNodeInfo);
            });
		} else {
	        self.populateAnalyticsNode(aNodeInfo);
		}
    }

    this.destroy = function () {
        //contView.destroy();
    }

    this.getAnalyticsNodeDetails = function(deferredObj,obj) {
        $.ajax({
            url:'/api/admin/monitor/infrastructure/analyticsnode/details?hostname=' + obj['name']
        }).done(function(result) {
            deferredObj.resolve(result);
        });
    }
    
    this.processGenInfo = function(response)
    {
        var ret = [];
        if(response != null &&  response.value != null){ 
            response = response.value;
            $.each(response,function(i,d){
                var name = d.name;
                var status = noDataStr;
                var rawJson = d;
                try {
                    var generatorInfo = jsonPath(d,"$.value.ModuleServerState.generator_info")[0];
                    var collectorName = jsonPath(d,"$.value.ModuleClientState.client_info.collector_name")[0];
                    var strtTime = jsonPath(d,"$.value.ModuleClientState.client_info.start_time")[0];
                    status = getStatusForGenerator(generatorInfo,collectorName,strtTime);
                } catch(e){}
                
                
                
                var msgStats;
                try { 
                    msgStats= d['value']["ModuleServerState"]["msg_stats"][0]["msgtype_stats"];
                }catch(e){}
                var msgsBytes = 0;
                var messages = 0;
                if(msgStats != null){
                    for (var i = 0; i < msgStats.length; i++) { 
                        msgsBytes += parseInt(msgStats[i]["bytes"]);
                        messages += parseInt(msgStats[i]["messages"]); 
                    }
                } 
                msgsBytes = formatBytes(msgsBytes);
                
                ret.push({name:name,
                    status:status,
                    messages:messages,
                    bytes:msgsBytes,
                    raw_json:rawJson});
            });
        }
        return ret;
    }
    
    this.parseQEQueries = function(response){

    	var retArr = [];
    	try {
    		retArr =  response.QueryStats.queries_being_processed;
    	} catch(e) {retArr = [];}
    	try {
    		var pendingQueries = response.QueryStats.pending_queries;
    		//Set the progress to pending for pending queries.
    		pendingQueries = $.each(pendingQueries,function(idx,obj) {
    			obj['progress'] = "Pending in queue";
    			return obj;
    		});
    		//Merge the 2 lists for display
    		retArr = retArr.concat(pendingQueries);
    	} catch(e) { retArr = [];} 
    	var ret = [];
    	$.each(retArr,function(idx,obj) {
    	  var rawJson = obj;
          var enqtime = jsonPath(obj,'$..enqueue_time');
          var progress = '-';
          if(enqtime != null && enqtime) {
        	  enqtime = new XDate(enqtime/1000).toString('M/d/yy h:mm:ss');
          } else { 
        	  enqtime = '-';
          }
          if(obj['progress'] != "Pending in queue") {
        	  progress = obj['progress'] + ' %';
          }
          ret.push({
        	 time:enqtime,
        	 query:obj['query'],
        	 progress:progress,
        	 raw_json:rawJson
          });
        });
    	return ret;
    }

    function populateDetailsTab(obj) {
        var endTime = getCurrentTime4MemCPUCharts(), startTime = endTime - 600000;
        var slConfig = {startTime: startTime, endTime: endTime};
        var nodeIp,iplist;
        //Compute the label/value pairs to be displayed in dashboard pane
        //As details tab is the default tab,don't update the tab state in URL
        layoutHandler.setURLHashParams({tab:'',ip:obj['ip'], node:'Analytics Nodes:' + obj['name']},{triggerHashChange:false});
        //showProgressMask('#analyticsnode-dashboard', true);
        //Destroy chart if it exists
        startWidgetLoading('analytics-sparklines');
        toggleWidgetsVisibility(['collector-chart-box'], ['queryengine-chart-box', 'opServer-chart-box']);
        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#analyticsnode-dashboard').html(dashboardTemplate({title:'Analytics Node',colCount:2, showSettings:true, widgetBoxId:'dashboard'}));
        startWidgetLoading('dashboard');

        $.ajax({
            url:'/api/admin/monitor/infrastructure/analyticsnode/details?hostname=' + obj['name']
        }).done(function (result) {
                aNodeData = result;
                var parsedData = infraMonitorView.parseAnalyticNodesDashboardData([{name:obj['name'],value:result}])[0];
                var noDataStr = "--";
                var cpu = "N/A",
                    memory = "N/A",
                    aNodeDashboardInfo, oneMinCPU, fiveMinCPU, fifteenMinCPU,
                    usedMemory, totalMemory;
                $('#collector-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'ModuleCpuState':[{name: 'collector_cpu_share', color: 'blue-sparkline'}, {name: 'collector_mem_virt', color: 'green-sparkline'}]}, slConfig);
                $('#queryengine-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'ModuleCpuState':[{name: 'queryengine_cpu_share', color: 'blue-sparkline'}, {name: 'queryengine_mem_virt', color: 'green-sparkline'}]}, slConfig);
                $('#opServer-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'ModuleCpuState':[{name: 'opserver_cpu_share', color: 'blue-sparkline'}, {name: 'opserver_mem_virt', color: 'green-sparkline'}]}, slConfig);
                endWidgetLoading('analytics-sparklines');
                var procStateList, overallStatus = noDataStr;
                var analyticsProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                try{
                    overallStatus = getOverallNodeStatusForDetails(parsedData);
                }catch(e){overallStatus = "<span> "+statusTemplate({sevLevel:sevLevels['ERROR'],sevLevels:sevLevels})+" Down</span>";}
                try{
                	procStateList = jsonPath(aNodeData,"$..process_state_list")[0];
                	analyticsProcessStatusList = getStatusesForAllAnalyticsProcesses(procStateList);
                }catch(e){}
                aNodeDashboardInfo = [
                    {lbl:'Hostname', value:obj['name']},
                    {lbl:'IP Address', value:(function(){
                        var ips = '';
                        try{
                        	iplist = aNodeData.CollectorState.self_ip_list;
                        } catch(e){return noDataStr;}
                        if(iplist != null && iplist.length>0){
                            for (var i=0; i< iplist.length;i++){
                                if(i+1 == iplist.length) {
                                    ips = ips + iplist[i];
                                } else {
                                    ips = ips + iplist[i] + ', ';
                                }
                            }
                        } else {
                        	ips = noDataStr;
                        }
                        return ips;
                    })()},
                    {lbl:'Version', value:parsedData['version'] != '-' ? parsedData['version'] : noDataStr},
                    {lbl:'Overall Node Status', value:overallStatus},
                    {lbl:'Processes', value:" "},
                    /*{lbl:INDENT_RIGHT+'Analytics Node Manager', value:(function(){
                    	try{
                    		return ifNull(analyticsProcessStatusList['contrail-analytics-nodemgr'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},*/
                    {lbl:INDENT_RIGHT+'Collector', value:(function(){
                    	try{
                    		return ifNull(analyticsProcessStatusList['contrail-collector'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'Query Engine', value:(function(){
                    	try{
                    		return ifNull(analyticsProcessStatusList['contrail-qe'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'OpServer', value:(function(){
                    	try{
                    		return ifNull(analyticsProcessStatusList['contrail-opserver'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'Redis Query', value:(function(){
                    	try{
                    		return ifNull(analyticsProcessStatusList['redis-query'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'Redis Sentinel', value:(function(){
                    	try{
                    		return ifNull(analyticsProcessStatusList['redis-sentinel'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'Redis UVE', value:(function(){
                    	try{
                    		return ifNull(analyticsProcessStatusList['redis-uve'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:'CPU', value:$.isNumeric(parsedData['cpu']) ? parsedData['cpu'] + ' %' : noDataStr},
                    {lbl:'Memory', value:parsedData['memory'] != '-' ? parsedData['memory'] : noDataStr},
                    {lbl:'Messages', value:(function(){
                    	var msgs = getAnalyticsMessagesCountAndSize(aNodeData,['Collector']);
                        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
                    })()},
                    {lbl:'Generators', value:(function(){
                        var ret='';
                        //ret = ret + 'Total ';
                        var genno;
                        try{
	                        if(aNodeData.CollectorState["generator_infos"]!=null){
	                            genno = aNodeData.CollectorState["generator_infos"].length;
	                        };
	                        ret = ret + ifNull(genno,noDataStr);
                    	}catch(e){ return noDataStr;}
                        return ret;
                    })()},
                    {lbl:'Last Log', value: (function(){
                    	var lmsg;
                		lmsg = getLastLogTimestamp(aNodeData,"analytics");
                		if(lmsg != null){
                			try{
                				return new Date(parseInt(lmsg)/1000).toLocaleString();	
                			}catch(e){return noDataStr;}
                		} else return noDataStr;
                        })()}
                    //'vRouters ' + aNodeData['establishedPeerCount'] + ', ' +
                    //'Collectors ' + aNodeData['activevRouterCount'] + ', ' +
                    //'Analytics Nodes ' + aNodeData['activevRouterCount'] + ', ' +
                    //'Config Nodes ' + aNodeData['activevRouterCount']},
                ]
                /*Selenium Testing*/
                aNodeDetailsData = aNodeDashboardInfo;
                /*End of Selenium Testing*/				
                var cores=getCores(aNodeData);
                for(var i=0;i<cores.length;i++)
                	aNodeDashboardInfo.push(cores[i]);
                //showProgressMask('#analyticsnode-dashboard');
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#analyticsnode-dashboard .widget-body').html(dashboardBodyTemplate({colCount:2, d:aNodeDashboardInfo, nodeData:aNodeData, showSettings:true, ip:nodeIp}));
                var ipDeferredObj = $.Deferred();
                getReachableIp(iplist,"8089",ipDeferredObj);
                ipDeferredObj.done(function(nodeIp){
	                if(nodeIp != null && nodeIp != noDataStr) {
	                	$('#linkIntrospect').unbind('click');
	                    $('#linkIntrospect').click(function(){
	                        window.open('/proxy?proxyURL=http://'+nodeIp+':8089&indexPage', '_blank');
	            	    });
	                    $('#linkStatus').unbind('click');
	                    $('#linkStatus').on('click', function(){
	                        showStatus(nodeIp);
	                    });
	                    $('#linkLogs').unbind('click');
	                    $('#linkLogs').on('click', function(){
	                        showLogs(nodeIp);
	                    });	
	                }
                });
                endWidgetLoading('dashboard');
                initWidget4Id('#collector-chart-box');
                initWidget4Id('#queryengine-chart-box');
                initWidget4Id('#opServer-chart-box');
            }).fail(displayAjaxError.bind(null, $('#analyticsnode-dashboard')));
        $('#collector-chart').initMemCPULineChart($.extend({url:function() {
            return '/api/tenant/networking/flow-series/cpu?moduleId=Collector&minsSince=30&sampleCnt=10&source=' + obj['name'] + '&endTime=' + endTime;
        }, parser: "parseProcessMemCPUData", plotOnLoad: true, showWidgetIds: ['collector-chart-box'], hideWidgetIds: ['queryengine-chart-box', 'opServer-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
        $('#queryengine-chart').initMemCPULineChart($.extend({url:function() {
            return '/api/tenant/networking/flow-series/cpu?moduleId=QueryEngine&minsSince=30&sampleCnt=10&source=' + obj['name'] + '&endTime=' + endTime;
        }, parser: "parseProcessMemCPUData", plotOnLoad: false, showWidgetIds: ['queryengine-chart-box'], hideWidgetIds: ['collector-chart-box', 'opServer-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
        $('#opServer-chart').initMemCPULineChart($.extend({url:function() {
            return '/api/tenant/networking/flow-series/cpu?moduleId=OpServer&minsSince=30&sampleCnt=10&source=' + obj['name'] + '&endTime=' + endTime;
        }, parser: "parseProcessMemCPUData", plotOnLoad: false, showWidgetIds: ['opServer-chart-box'], hideWidgetIds: ['collector-chart-box', 'queryengine-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
    }

    function populateGeneratorsTab(obj) {
        layoutHandler.setURLHashParams({tab:'generators',ip:aNodeInfo['ip'], node:'Analytics Nodes:' + obj['name']},{triggerHashChange:false});
        var transportCfg = {
            url:'/api/admin/monitor/infrastructure/analyticsnode/generators?hostname=' + obj['name'] + '&count=' + 50,
        };
        var generatorDS; 
        //Intialize the grid only for the first time
        if (!isGridInitialized('#gridGenerators')) {
            generatorDS = new ContrailDataView();
            getOutputByPagination(generatorDS,{transportCfg:transportCfg,parseFn:self.processGenInfo});
            $("#gridGenerators").contrailGrid({
                header : {
                    title : {
                        text : 'Generators',
                        cssClass : 'blue'
                    },
                    defaultControls: {
                        collapseable: true,
                        exportable: false,
                        refreshable: false,
                        searchable: true
                    }
                },
                columnHeader : {
                    columns:[
                         {
                             field:"name",
                             name:"Name",
                             width:110
                             //template:cellTemplate({cellText:'#=  name.split(":")  #', tooltip:true})
                         },
                         {
                             field:"status",
                             name:"Status",
                             width:210
                         },
                         {
                             field:'messages',
                             headerAttributes:{style:'min-width:160px;'},
                             width:160,
                             name:"Messages"
                         },
                         {
                             field:"bytes",
                             name:"Bytes",
                             width:140
                         }
                     ],
                },
                body : {
                    options : {
                        //checkboxSelectable: true,
                        forceFitColumns: true,
                        detail:{
                            template: $("#gridsTemplateJSONDetails").html()
                        }
                    },
                    dataSource : {
                        dataView : generatorDS
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading Generators..',
                        },
                        empty: {
                            text: 'No Generators to display'
                        }, 
                        errorGettingData: {
                            type: 'error',
                            iconClasses: 'icon-warning',
                            text: 'Error in getting Data.'
                        }
                    }
                },
                footer : {
                    pager : {
                        options : {
                            pageSize : 50,
                            pageSizeSelect : [10, 50, 100, 200, 500 ]
                        }
                    }
                }
            });
            generatorsGrid = $("#gridGenerators").data("contrailGrid");
            generatorsGrid.showGridMessage('loading');
        } else {
            //reloadGrid(generatorsGrid);
        }

        function onGeneratorRowSelChange() {
            var selRowDataItem = generatorsGrid.dataItem(generatorsGrid.select());
            if (currView != null) {
                currView.destroy();
            }
            currView = generatorNodeView;
            generatorNodeView.load({name:selRowDataItem['address']});
        }
    }

    function populateQEQueriesTab(obj) {
        layoutHandler.setURLHashParams({tab:'qequeries', node:'Analytics Nodes:' + obj['name']},{triggerHashChange:false});
        //Intialize the grid only for the first time
        if (!isGridInitialized('#gridQEQueries')) {
        	$("#gridQEQueries").contrailGrid({
                header : {
                    title : {
                        text : 'QE Queries',
                        cssClass : 'blue'
                    },
                    defaultControls: {
                        collapseable: true,
                        exportable: false,
                        refreshable: false,
                        searchable: true
                    },
                },
                columnHeader : {
                	columns:[
	                    {
	                        field:"time",
	                        id:"time",
	                        name:"Enqueue Time",
	                        width:200,
	                        sortable:true
	                    },
	                    {
	                        field:"query",
	                        id:"query",
	                        name:"Query",
	                        width:500,
	                        sortable:true
	                    },
	                    {
	                        field:"progress",
	                        id:"progress",
	                        name:"Progress",
	                        width:200,
	                        sortable:true
	                    }
	                ],
                },
        		body : {
        			options : {
        				//checkboxSelectable: true,
        				//forceFitColumns: true,
        				detail:{
        					template: $("#gridsTemplateJSONDetails").html()
        				}
        			},
        			dataSource : {
        				remote: {
	        		        ajaxConfig: {
		                        url: '/api/admin/monitor/infrastructure/analyticsnode/details?hostname=' + aNodeInfo['name'],
		                        //timeout: timeout,
		                        type: 'GET'
		                    },
                            dataParser: self.parseQEQueries
	        			}
        			},
        			statusMessages: {
        				loading: {
        					text: 'Loading Queries..',
        				},
        				empty: {
        					text: 'No Queries to display'
        				}, 
        				errorGettingData: {
        					type: 'error',
        					iconClasses: 'icon-warning',
        					text: 'Error in getting Data.'
        				}
        			}
        		},
    			footer : {
    				pager : {
    					options : {
    						pageSize : 50,
    						pageSizeSelect : [10, 50, 100, 200, 500 ]
    					}
    				}
    			}
        	});
        	qequeriesGrid = $("#gridQEQueries").data("contrailGrid");
        	qequeriesGrid.showGridMessage('loading');
        } else {
            reloadGrid(qequeriesGrid);
        }
        function onGeneratorRowSelChange() {
            var selRowDataItem = qequeriesGrid.dataItem(qequeriesGrid.select());
            if (currView != null) {
                currView.destroy();
            }
            currView = generatorNodeView;
            generatorNodeView.load({name:selRowDataItem['address']});
        }
    }

    this.populateAnalyticsNode = function (obj) {
        //Render the view only if URL HashParam doesn't match with this view
        //Implies that we are already in analytics node details page
        if (!isInitialized('#analytics_tabstrip')) {
            var aNodeTemplate = Handlebars.compile($("#analyticsnode-template").html());
            $(pageContainer).html(aNodeTemplate(aNodeInfo));
            //Set the height of all tabstrip containers to viewheight - tabstrip
            var tabContHeight = layoutHandler.getViewHeight() - 42;
          //  $('#analytics_tabstrip > div').height(tabContHeight);

            $("#analytics_tabstrip").contrailTabs({
                activate:function (e, ui) {
                    infraMonitorView.clearTimers();
                    var selTab = ui.newTab.context.innerText;
                    if (selTab == 'Generators') {
                        populateGeneratorsTab(aNodeInfo);
                        $('#gridGenerators').data('contrailGrid').refreshView();
                    } else if (selTab == 'QE Queries') {
                        populateQEQueriesTab(aNodeInfo);
                        $('#gridQEQueries').data('contrailGrid').refreshView();
                    } else if (selTab == 'Console') {
                        infraMonitorView.populateMessagesTab('analytics', {source:aNodeInfo['name']}, aNodeInfo);
                    } else if (selTab == 'Details') {
                        populateDetailsTab(aNodeInfo);
                    }
                }
            }).data('contrailTabs');
        }
        var tabIdx = $.inArray(obj['tab'], analyticsNodeTabs);
        if (tabIdx == -1){
            tabIdx = 0;
            populateDetailsTab(aNodeInfo);
        }
        selectTab(aNodeTabStrip,tabIdx);
    }
}

function getAnalyticsNodeProcessDetails(deferredObj,obj) {
	var cfilt = "ModuleClientState:client_info";
	var kfilt = "*:Collector,*:QueryEngine,*:OpServer,*:Contrail-Analytics-Nodemgr,*:ConfigNode"
    var analyticsProcessPostData = getPostData("generator","",obj['name'],cfilt,kfilt);
    $.ajax({
    	url:TENANT_API_URL,
        type:"post",
        data:analyticsProcessPostData,
        dataType:'json'
    }).done(function(result) {
        deferredObj.resolve(result);
    });
}

function getGeneratorsListForAnalyticsNode(deferredObj,postData) {
    $.ajax({
    	url:TENANT_API_URL,
        type:"post",
        data:postData,
        dataType:'json'
    }).done(function(result) {
        deferredObj.resolve(result);
    });
}

aNodesView = new analyticsNodesView();
aNodeView = new analyticsNodeView();

function getStatusesForAllAnalyticsProcesses(processStateList){
	var ret = [];
	if(processStateList != null){
		for(var i=0; i < processStateList.length; i++){
			var currProc = processStateList[i];
			if(currProc.process_name == "redis-query"){
				ret['redis-query'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "contrail-qe"){
				ret['contrail-qe'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "redis-sentinel"){
				ret['redis-sentinel'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "contrail-analytics-nodemgr"){
				ret['contrail-analytics-nodemgr'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "redis-uve"){
				ret['redis-uve'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "contrail-opserver"){
				ret['contrail-opserver'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "contrail-collector"){
				ret['contrail-collector'] = getProcessUpTime(currProc);
			} 
		}
	}
	return ret;
}

function mergeCollectorDataAndPrimaryData(collectorData,primaryDS){
    var collectors = ifNull(collectorData.value,[]);
    if(collectors.length == 0){
        return;
    }
    var primaryData = primaryDS.data();
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
    primaryDS.data(updatedData);
}

function startFetchingCollectorStateGenInfos(primaryDS){
    var retArr = [];
    var cfilts = 'CollectorState:generator_infos';
    var postData = getPostData("collector",'','',cfilts,'');
    $.ajax({
        url:TENANT_API_URL,
        type:'POST',
        data:postData
    }).done(function(result) {
        if(result != null && result [0] != null){
            mergeCollectorDataAndPrimaryData(result[0],primaryDS);
        }
    }).fail(function(result) {
        //nothing to do..the generators numbers will not be updated
    });
}

function getStatusForGenerator(data,collectorName,strtTime){
    if(data != null) {
        var maxConnectTimeGenerator = getMaxGeneratorValueInArray(data,"connect_time");
        var maxResetTime = jsonPath(maxConnectTimeGenerator,"$..reset_time")[0];
        var maxConnectTime = jsonPath(maxConnectTimeGenerator,"$..connect_time")[0];
        var statusString = '--';
        var resetTime = new XDate(maxResetTime/1000);
        var connectTime = new XDate(maxConnectTime/1000);
        var startTime;
        var maxGeneratorHostName = jsonPath(maxConnectTimeGenerator,"$..hostname")[0];
        if(strtTime != null){
            startTime = new XDate(strtTime/1000);
        }
        var currTime = new XDate();
        if(maxResetTime > maxConnectTime){//Means disconnected
            statusString = 'Disconnected since ' + diffDates(resetTime,currTime);
        } else {
            if(maxGeneratorHostName != collectorName){
                statusString = "Connection Error since " + diffDates(connectTime,currTime);
            } else {
                statusString = "Up since " + diffDates(startTime,currTime) + " , Connected since " + diffDates(connectTime,currTime);
            }
        }
        return statusString;
    } else {
        return "-";
    }
}

