/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

configNodesView = function () {
    var self = this;
    var ctrlNodesGrid,configNodesData;
    this.setLocalDSData = function(data){
    	localDS.data(data);
    }
    this.getLocalDS = function(){
    	return localDS;
    }
    this.load = function (obj) {
    	layoutHandler.setURLHashParams({node:'Config Nodes'},{merge:false,triggerHashChange:false});
        populateConfigNodes();
       
    }

    this.getConfigNodesData = function() {
        return configNodesData;
    }
    this.setConfigNodesData = function(data) {
        configNodesData = data;
    }

    this.destroy = function () {
    	var kGrid = $('.contrail-grid').data('contrailGrid');
    	if(kGrid != null)
    		kGrid.destroy();
    }

    function populateConfigNodes() {
        infraMonitorView.clearTimers();
        summaryChartsInitializationStatus['configNode'] = false;
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
                    text : 'Config Nodes',
                    cssClass : 'blue',
                },
                customControls: []
            },
            body: {
                options: {
                    autoHeight : true,
                    enableAsyncPostRender:true,
                    forceFitColumns:true,
                    lazyLoading:true
                },
                dataSource: {
                    dataView: configNodesDataSource
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
                        minWidth:90
                    },
                    {
                        field:"ip",
                        name:"IP address",
                        minWidth:90,
                        formatter:function(r,c,v,cd,dc){
                            return summaryIpDisplay(dc['ip'],dc['summaryIps']);
                        },
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
                        minWidth:110
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
    }
}

function onConfigNodeRowSelChange(dc) {
    confNodeView.load({name:dc['name'], ip:dc['ip']});
}

configNodeView = function () {
    var peersGrid, routesGrid, consoleGrid;
    var configNodeTabStrip = "config_tabstrip";
    var generatorsGrid;
    var confNodeInfo = {}, self = this;
    var confNodeData = {};
    /*Selenium Testing*/
    var confNodeDetailsData;
    this.getConfNodeDetailsData = function(){
        return confNodeDetailsData; 
    } 
    /*End of Selenium Testing*/
    this.load = function (obj) {
        pushBreadcrumb([obj['name']]);
        /*confNodeInfo = obj;
        //Select tab
        self.populateConfigNode(obj);
        //Update URL Hashparams only if tab is empty*/
        confNodeInfo = obj;
    	if((confNodeInfo == null || confNodeInfo.ip ==  null ||  confNodeInfo.ip == '') && confNodeInfo.tab != null){
			//issue details call and populate ip
			var configNodeDeferredObj = $.Deferred();
			self.getConfigNodeDetails(configNodeDeferredObj,confNodeInfo);
			configNodeDeferredObj.done(function(data) {
				try{
					confNodeInfo['ip'] = data.configNode.ModuleCpuState.config_node_ip[0];
				} catch(e){}
    	        self.populateConfigNode(confNodeInfo);
            });
		} else {
	        self.populateConfigNode(confNodeInfo);
		}
    }

    this.destroy = function () {
        //contView.destroy();
    }

    this.getConfigNodeDetails = function(deferredObj,obj) {
        $.ajax({
            url: contrail.format(monitorInfraUrls['CONFIG_DETAILS'] , obj['name'])
        }).done(function(result) {
            deferredObj.resolve(result);
        });
    }
    
    function populateDetailsTab(obj) {
        var endTime = getCurrentTime4MemCPUCharts(), startTime = endTime - 600000;
        var slConfig = {startTime: startTime, endTime: endTime};
        var nodeIp,iplist;
        //Compute the label/value pairs to be displayed in dashboard pane
        //As details tab is the default tab,don't update the tab state in URL
        layoutHandler.setURLHashParams({tab:'', node:'Config Nodes:' + obj['name']},{triggerHashChange:false});
        startWidgetLoading('config-sparklines');
        toggleWidgetsVisibility(['apiServer-chart-box'], ['serviceMonitor-chart-box', 'schema-chart-box']);
        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#confignode-dashboard').html(dashboardTemplate({title:'Configuration Node',colCount:2, showSettings:true, widgetBoxId:'dashboard'}));
        startWidgetLoading('dashboard');
        $.ajax({
            url: contrail.format(monitorInfraUrls['CONFIG_DETAILS'] , obj['name'])
        }).done(function (result) {
        		var noDataStr = "--";
                $('#apiServer-sparklines').initMemCPUSparkLines(result.configNode, 'parseMemCPUData4SparkLines', {'ModuleCpuState':[{name: 'api_server_cpu_share', color: 'blue-sparkline'}, {name: 'api_server_mem_virt', color: 'green-sparkline'}]}, slConfig);
                $('#serviceMonitor-sparklines').initMemCPUSparkLines(result.configNode, 'parseMemCPUData4SparkLines', {'ModuleCpuState':[{name: 'service_monitor_cpu_share', color: 'blue-sparkline'}, {name: 'service_monitor_mem_virt', color: 'green-sparkline'}]}, slConfig);
                $('#schema-sparklines').initMemCPUSparkLines(result.configNode, 'parseMemCPUData4SparkLines', {'ModuleCpuState':[{name: 'schema_xmer_cpu_share', color: 'blue-sparkline'}, {name: 'schema_xmer_mem_virt', color: 'green-sparkline'}]}, slConfig);
                endWidgetLoading('config-sparklines');
                confNodeData = result;
                var parsedData = infraMonitorView.parseConfigNodesDashboardData([{name:obj['name'],value:confNodeData}])[0];
                var cpu = "N/A",
                    memory = "N/A",
                    confNodeDashboardInfo, oneMinCPU, fiveMinCPU, fifteenMinCPU,
                    usedMemory, totalMemory;
                var procStateList, overallStatus = noDataStr;
                var configProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                try{
                    overallStatus = getOverallNodeStatusForDetails(parsedData);
                }catch(e){overallStatus = "<span> "+statusTemplate({sevLevel:sevLevels['ERROR'],sevLevels:sevLevels})+" Down</span>";}
                try{
                	procStateList = jsonPath(confNodeData,"$..process_state_list")[0];
                	if(!(procStateList instanceof Array)){
            			procStateList = [procStateList];
            		}
                	configProcessStatusList = getStatusesForAllConfigProcesses(procStateList);
                }catch(e){}
                confNodeDashboardInfo = [
                 	{lbl:'Hostname', value:obj['name']},
                    {lbl:'IP Address', value:(function (){
                    	var ips = '';
                        try{
                        	iplist = ifNull(jsonPath(confNodeData,'$..config_node_ip')[0],noDataStr);
                        	if(iplist instanceof Array){
                    			nodeIp = iplist[0];//using the first ip in the list for status
                    		} else {
                    			nodeIp = iplist;
                    		}
                        } catch(e){return noDataStr;}
                        if(iplist != null && iplist != noDataStr && iplist.length>0){
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
                	{lbl:INDENT_RIGHT+'API Server', value:(function(){
                    	try{
                    		return configProcessStatusList['contrail-api'];
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'Schema Transformer', value:(function(){
                    	try{
                    		return configProcessStatusList['contrail-schema'];
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'Service Monitor', value:(function(){
                    	try{
                    		return configProcessStatusList['contrail-svc-monitor'];
                    	}catch(e){return noDataStr;}
                    })()},
                    /*{lbl:INDENT_RIGHT+'Config Node Manager', value:(function(){
                    	try{
                    		return ifNull(configProcessStatusList['contrail-config-nodemgr'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},*/
                    {lbl:INDENT_RIGHT+'Discovery', value:(function(){
                    	try{
                    		return ifNull(configProcessStatusList['contrail-discovery'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                   /* {lbl:INDENT_RIGHT+'Zookeeper', value:(function(){
                    	try{
                    		return ifNull(configProcessStatusList['contrail-zookeeper'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},*/
                    {lbl:INDENT_RIGHT+'Ifmap', value:(function(){
                    	try{
                    		return ifNull(configProcessStatusList['ifmap'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'Redis Config', value:(function(){
                    	try{	
                    		return ifNull(configProcessStatusList['redis-config'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:'Analytics Node', value:(function(){
                    	var anlNode = noDataStr; 
                    	var secondaryAnlNode, status;
                    	try{
                    		//anlNode = ifNull(computeNodeData.VrouterAgent.collector,noDataStr);
                    		anlNode = jsonPath(confNodeData,"$..ModuleClientState..primary")[0].split(':')[0];
                    		status = jsonPath(confNodeData,"$..ModuleClientState..status")[0];
                    		secondaryAnlNode = ifNull(jsonPath(confNodeData,"$..ModuleClientState..secondary")[0],"").split(':')[0];
                    	}catch(e){
                    		anlNode = "--";
                    	}
                    	try{
                    		if(anlNode != null && anlNode != noDataStr && status.toLowerCase() == "established")
                    			anlNode = anlNode.concat(' (Up)');
                    	}catch(e){
                    		if(anlNode != null && anlNode != noDataStr) {
                    			anlNode = anlNode.concat(' (Down)');
                    		}
                    	}
                    	if(secondaryAnlNode != null && secondaryAnlNode != "" && secondaryAnlNode != "0.0.0.0"){
                    		anlNode.concat(', ' + secondaryAnlNode);
                    	}
                    	return ifNull(anlNode,noDataStr);
                	})()},
                  //  {lbl:'Analytics Messages', value:(function(){return (parseInt(confNodeData.ApiServer.ModuleServerState["generator_info"]["connect_time"]) 
                  //    > parseInt(confNodeData.ModuleServerState["generator_info"]["reset_time"]))?"Up":"Down"})()},
                	{lbl:'CPU', value:$.isNumeric(parsedData['cpu']) ? parsedData['cpu'] + ' %' : noDataStr},
                	{lbl:'Memory', value:parsedData['memory'] != '-' ? parsedData['memory'] : noDataStr},
                	{lbl:'Last Log', value: (function(){
                		var lmsg;
                		lmsg = getLastLogTimestamp(confNodeData,"config");
                		if(lmsg != null){
                			try{
                				return new Date(parseInt(lmsg)/1000).toLocaleString();	
                			}catch(e){return noDataStr;}
                		} else return noDataStr;
                		})()}
                ]
                /*Selenium Testing*/
                confNodeDetailsData = confNodeDashboardInfo;
                /*End of Selenium Testing*/                				
                var cores=getCores(confNodeData);
                for(var i=0;i<cores.length;i++)
                	confNodeDashboardInfo.push(cores[i]);
                //showProgressMask('#confignode-dashboard');
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#confignode-dashboard .widget-body').html(dashboardBodyTemplate({colCount:2, d:confNodeDashboardInfo, nodeData:confNodeData, showSettings:true, ip:nodeIp}));
                var ipDeferredObj = $.Deferred();
                getReachableIp(iplist,"8084",ipDeferredObj);
                ipDeferredObj.done(function(nodeIp){
	                if(nodeIp != null && nodeIp != noDataStr) {
	                	$('#linkIntrospect').unbind('click');
	                    $('#linkIntrospect').click(function(){
	                        window.open('/proxy?proxyURL=http://'+nodeIp+':8084&indexPage', '_blank');
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
                initWidget4Id('#apiServer-chart-box');
                initWidget4Id('#serviceMonitor-chart-box');
                initWidget4Id('#schema-chart-box');
            }).fail(displayAjaxError.bind(null, $('#confignode-dashboard')));
        $('#apiServer-chart').initMemCPULineChart($.extend({url:function() {
            return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'ApiServer', '30', '10', obj['name'], endTime);
        }, parser: "parseProcessMemCPUData", parser: "parseProcessMemCPUData", plotOnLoad: true, showWidgetIds: ['apiServer-chart-box'], hideWidgetIds: ['serviceMonitor-chart-box', 'schema-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
        $('#serviceMonitor-chart').initMemCPULineChart($.extend({url:function() {
            return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'ServiceMonitor', '30', '10', obj['name'], endTime);
        }, parser: "parseProcessMemCPUData", plotOnLoad: false, showWidgetIds: ['serviceMonitor-chart-box'], hideWidgetIds: ['apiServer-chart-box', 'schema-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
        $('#schema-chart').initMemCPULineChart($.extend({url:function() {
            return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'Schema', '30', '10', obj['name'], endTime);
        }, parser: "parseProcessMemCPUData", plotOnLoad: false, showWidgetIds: ['schema-chart-box'], hideWidgetIds: ['apiServer-chart-box', 'serviceMonitor-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
    }

    this.populateConfigNode = function (obj) {
        //Render the view only if URL HashParam doesn't match with this view
        //Implies that we are already in config node details page
        if (!isInitialized('#config_tabstrip')) {
            var confNodeTemplate = Handlebars.compile($("#confignode-template").html());
            $(pageContainer).html(confNodeTemplate(confNodeInfo));
            //Set the height of all tabstrip containers to viewheight - tabstrip
            var tabContHeight = layoutHandler.getViewHeight() - 42;
          //  $('#config_tabstrip > div').height(tabContHeight);

            $("#config_tabstrip").contrailTabs({
                activate:function (e, ui) {
                    infraMonitorView.clearTimers();
                    var selTab = $(ui.newTab.context).text();
                    if (selTab == 'Console') {
                        infraMonitorView.populateMessagesTab('config', {source:confNodeInfo['name']}, confNodeInfo);
                    } else if (selTab == 'Details') {
                        populateDetailsTab(confNodeInfo);
                    }
                }
            }).data('contrailTabs');
        }
        var tabIdx = $.inArray(obj['tab'], configNodeTabs);
        if (tabIdx == -1){
            tabIdx = 0;
            populateDetailsTab(confNodeInfo);
        }
        //If any tab is stored in URL,select it else select the first tab
        selectTab(configNodeTabStrip,tabIdx);
    }
}

confNodesView = new configNodesView();
confNodeView = new configNodeView();

function getStatusesForAllConfigProcesses(processStateList){
	var ret = [];
	if(processStateList != null){
		for(var i=0; i < processStateList.length; i++){
			var currProc = processStateList[i];
			if(currProc.process_name == "contrail-discovery:0"){
				ret['contrail-discovery'] = getProcessUpTime(currProc);
			} else if(currProc.process_name == "contrail-discovery"){
				ret['contrail-discovery'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "contrail-api:0"){
				ret['contrail-api'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "contrail-api"){
				ret['contrail-api'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "redis-config"){
				ret['redis-config'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "contrail-config-nodemgr"){
				ret['contrail-config-nodemgr'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "contrail-svc-monitor"){
				ret['contrail-svc-monitor'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "ifmap"){
				ret['ifmap'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == "contrail-schema"){
				ret['contrail-schema'] = getProcessUpTime(currProc);
			} else if (currProc.process_name == 'contrail-zookeeper') {
                ret['contrail-zookeeper'] = getProcessUpTime(currProc);
            }
		}
	}
	return ret;
}
