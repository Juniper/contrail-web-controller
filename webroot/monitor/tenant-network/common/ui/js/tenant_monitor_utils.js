/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var instanceDS = new ContrailDataView();
var durationStr = ' (last 30 mins)';
var durationTitle = 'Last 30 mins';
var FLOW_QUERY_TIMEOUT = 310000;
var TOP_IN_LAST_MINS = 10;
var NUM_DATA_POINTS_FOR_FLOW_SERIES = 240;

function ObjectListView() {
    //Context & type 
    this.load = function(obj) {
        var listTemplate = $("#list-template").html();
        var context = obj['context'];
        //If context is all,set fqName = *
        var objectType = obj['type'];
        if(objectType == 'flowdetail') {
            layoutHandler.setURLHashParams(obj,{merge:false,triggerHashChange:false});
        } else if(context == 'instance') {
            layoutHandler.setURLHashParams({fqName:obj['fqName'],view:'list',type:obj['type'],context:obj['context'],ip:obj['ip'],vnName:obj['vnName']},
                {p:'mon_net_instances',merge:false,triggerHashChange:false});
        } else if(obj['selector'] != null)  {
        } else 
            layoutHandler.setURLHashParams({fqName:obj['fqName'],view:'list',type:obj['type'],source:obj['source'],context:obj['context']},{merge:false,triggerHashChange:false});
        if(objectType == 'network') {
            obj['detailParseFn'] = tenantNetworkMonitorUtils.parseNetworkDetails;
            if((obj['fqName'] == null) || (obj['fqName'] == '') || obj['fqName'] == '*')
                obj['title'] = contrail.format('Networks Summary');
            else
                obj['title'] = contrail.format('Networks Summary for {0} ({1})',capitalize(context),obj['fqName'].split(':').pop());
            if((obj['source'] != null) && obj['source'] == 'uve')
                obj['subTitle'] = '';
            columns = [{
                field:'name',
                name:'Network',
                formatter:function(r,c,v,cd,dc){
                    return cellTemplateLinks({cellText:'name',name:'network',rowData:dc});  
                },
                events:{
                    onClick:onClickGridLink
                },
                minWidth: 400,
                searchFn: function(d) {
                    return d['name'];
                },
                searchable: true,
                cssClass: 'cell-hyperlink-blue',
            },{
                field:'instCnt',
                name:'Instances',
                minWidth: 150
            },{
                field:'inBytes',
                name:'Traffic (In/Out)',
                minWidth:150,
                formatter:function(r,c,v,cd,dc) {
                    return contrail.format("{0} / {1}",formatBytes(dc['inBytes']),formatBytes(dc['outBytes']));
                }
            },{
                field:'outBytes',
                name:'Throughput (In/Out)',
                minWidth:150,
                formatter: function(r,c,v,cd,dc) {
                    return contrail.format("{0} / {1}",formatThroughput(dc['inThroughput']),formatThroughput(dc['outThroughput']));
                }
            }];
        } else if(objectType == 'instance') { 
            obj['title'] = 'Instances Summary';
            obj['subTitle'] = '';
            obj['detailParseFn'] = tenantNetworkMonitorUtils.parseInstDetails; 
            columns = [{
                field:'vmName',
                name:'Instance',
                formatter:function(r,c,v,cd,dc){
                    return cellTemplateLinks({cellText:'vmName',tooltip:true,name:'instance',rowData:dc});
                },
                minWidth:150,
                searchable: true,
                events:{
                    onClick:onClickGridLink
                },
                cssClass: 'cell-hyperlink-blue',
            },{
                field:'name',
                name:'UUID',
                minWidth:260,
                searchable: true
            },{
                field:'intfCnt',
                name:'Interfaces',
                minWidth:80
            },{
                field:'vRouter',
                name:'vRouter',
                formatter:function(r,c,v,cd,dc){
                    return cellTemplateLinks({cellText:'vRouter',tooltip:true,name:'vRouter',rowData:dc});
                },
                minWidth:80,
                events:{
                    onClick:onClickGridLink
                },
                cssClass: 'cell-hyperlink-blue',
            },{
                field:'ip',
                name:'IP Address',
                formatter:function(r,c,v,cd,dc){
                    return getMultiValueStr(dc['ip']);
                },
                minWidth:100
            },{
                field:'floatingIP',
                name:'Floating IPs (In/Out)',
                formatter:function(r,c,v,cd,dc){
                    return getMultiValueStr(dc['floatingIP']);
                },
                minWidth:100
            },{
                field:'inBytes',
                name:'Traffic (In/Out)',
                formatter:function(r,c,v,cd,dc){
                    return formatBytes(dc['inBytes']) + ' / ' + formatBytes(dc['outBytes']);
                },
                minWidth:150
            }];
            if((context == null) || (context == '') || (context == 'project')) {
                columns.splice(2,0,{
                    field:'vn',
                    name:'Virtual Network',
                    formatter:function(r,c,v,cd,dc){
                        return getMultiValueStr(dc['vn']);
                    },
                    minWidth: 220,
                    searchable:true
                });
            }
        } else if(objectType == 'project') {
            if(obj['fqName'] == null || obj['fqName'] == '' || obj['fqName'] == '*')
                obj['title'] = contrail.format('Projects Summary');
            else
                obj['title'] = contrail.format('Top Projects for Domain ({0})',obj['fqName']);
            if((obj['source'] != null) && obj['source'] == 'uve')
                obj['subTitle'] = '';
            columns = [{
                field:'name',
                name:'Project',
                formatter: function(r,c,v,cd,dc){
                    return cellTemplateLinks({cellText:'name',tooltip:true,name:'project',rowData:dc});
                },
                minWidth: 300,
                searchable:true,
                events:{
                    onClick:onClickGridLink
                },
                cssClass: 'cell-hyperlink-blue',
            },{
                field:'vnCnt',
                name:'Networks',
                minWidth: 150
            },{
                field:'inBytes',
                name:'Traffic (In/Out)',
                minWidth:150,
                formatter:function(r,c,v,cd,dc){
                    return contrail.format("{0} / {1}",formatBytes(dc['inBytes']),formatBytes(dc['outBytes']));
                }
            },{
                field:'outBytes',
                name:'Throughput (In/Out)',
                minWidth:150,
                formatter:function(r,c,v,cd,dc){
                    return contrail.format("{0} / {1}",formatThroughput(dc['inThroughput']),formatThroughput(dc['outThroughput']));
                }
            }];
        }
        var listContainer;
        if(obj['selector'] == null) 
            listContainer = pageContainer;
        else
            listContainer = obj['selector'];
        $(listContainer).html(listTemplate);
        obj['columns'] = columns;
        obj['context'] = context;
        obj['objectType'] = objectType;
        if(objectType == 'network') {
            var networkDS = new SingleDataSource('networkDS');
            var result = networkDS.getDataSourceObj();
            obj['dataSource'] = result['dataSource'];
            obj['deferredObj'] = result['deferredObj'];
            obj['error'] = result['error'];
            obj['idField'] = 'uuid';
            obj['isAsyncLoad'] = true;
        } else if(objectType == 'project') {
            var projectDataSource = new ContrailDataView();
            if(globalObj['dataSources']['projectDS'] != null)
                globalObj['dataSources']['projectDS']['dataSource'] = projectDataSource;
            else
                globalObj['dataSources']['projectDS'] = {dataSource:projectDataSource};
            var networkDS = new SingleDataSource('networkDS');
            var result = networkDS.getDataSourceObj();
            var projData = getProjectData(result['dataSource'].getItems(),ifNull(globalObj['dataSources']['projectDS'],{}))['projectsData'];
            projectDataSource.setData(projData);
            //projectDataSource.pageSize(50); 
            //result['dataSource'].unbind("change");
            $(networkDS).on("change",function(){
                objListView.refreshProjectSummaryGrid(result['dataSource']);
            });
            obj['dataSource'] = projectDataSource;
            obj['deferredObj'] = result['deferredObj'];
            obj['error'] = result['error'];
            obj['isAsyncLoad'] = true;
        } else if(objectType == 'instance') { 
            var instCfilts = ['UveVirtualMachineAgent:interface_list','UveVirtualMachineAgent:vrouter',
                              'UveVirtualMachineAgent:fip_stats_list','VirtualMachineStats'];
            if(ifNull(obj['fqName'],'') == '') {
                var instDS = new SingleDataSource('instDS');
                var result = instDS.getDataSourceObj('instDS');
                obj['dataSource'] = result['dataSource'];
                obj['deferredObj'] = result['deferredObj'];
                obj['error'] = result['error'];
                obj['idField'] = 'name';
                //result['dataSource'].unbind("change");
                obj['isAsyncLoad'] = true;
            } else if($.inArray(context,['project','network']) > -1) {
                var contextType = context == 'project' ? 'project' : 'vn';
                obj['transportCfg'] = { 
                                url:'/api/tenant/networking/virtual-machines/details?fqnUUID=' + obj['uuid']  + '&count=' + INST_PAGINATION_CNT + '&type=' + contextType,
                                type:'POST',
                                data:{data:[{"type":"virtual-machine","cfilt":instCfilts.join(',')}]}
                            }
                instanceDS = new ContrailDataView();
                //instDeferredObj is resolved when the instances tab of projects and the networks is clicked 
                var instDeferredObj = $.Deferred();
                //deferredObj is resolved when all instances are loaded, rejected if any ajax call fails
                var loadedDeferredObj = $.Deferred();
                getOutputByPagination(instanceDS,{transportCfg:obj['transportCfg'],parseFn:tenantNetworkMonitorUtils.instanceParseFn,deferredObj:instDeferredObj,
                                        loadedDeferredObj:loadedDeferredObj});
                obj['dataSource'] = instanceDS;
                obj['loadedDeferredObj'] = instDeferredObj;
                obj['isAsyncLoad'] = true;
                //Passing the deferredObj to initGrid such that is hides loading icon in Grid/displays error message if ajax call fails
                obj['deferredObj'] = loadedDeferredObj;
            }
        } else
            obj['url'] = constructReqURL(obj);
        var contextObj = getContextObj(obj);
        obj['parseFn'] = chartsParseFn.bind(null,{fqName:obj['fqName'],source:obj['source'],objectType:obj['type'],view:'list'});
        obj['config'] = {searchToolbar: true, widgetGridTitle: obj['title']};
        if(objectType == 'instance') {
            //Keep autoBind as true for Instances page
            if(layoutHandler.getURLHashObj()['p'] != 'mon_net_instances')
                obj['config']['autoBind'] = false;
        }
        $(listContainer).find('.list-view').initListTemplate(obj);
    }

    /**
     * Whenever we get new set of networks with pagination
     * 1. Add new project, if it doesn't exist
     * 2. Update byte/througput fields of existing project 
     */
    this.refreshProjectSummaryGrid = function(networkdataSource) {
        //Get the latest project's data and merge into projectDataSource
        var projData = getProjectData(networkdataSource.getItems(),ifNull(globalObj['dataSources']['projectDS'],{}))['projectsData'];
        var projectDataSource = globalObj['dataSources']['projectDS']['dataSource'];
        //projectDataSource.setData(projData);
        for(var i = 0;i < projData.length; i++){
            var datum = projectDataSource.getItemById(projData[i]['id']);
            if(datum == undefined) {
               projectDataSource.addItem(projData[i]);
            } else {
               datum['inBytes'] = projData[i]['inBytes'];
               datum['inThroughput'] = projData[i]['inThroughput'];
               datum['outBytes'] = projData[i]['outBytes'];
               datum['outThroughput'] = projData[i]['outThroughput'];
               datum['vnCnt'] = projData[i]['vnCnt'];
               projectDataSource.updateItem(projData[i]['id'],datum);
            }
         }
        /*
        projectDataSource.fetch(function(){
            for(var i = 0;i < projData.length; i++){
                var datum = projectDataSource.get(projData[i]['id']);
                if(datum == undefined) {
                   projectDataSource.add(projData[i]);
                } else {
                   datum.set('inBytes',projData[i]['inBytes']);
                   datum.set('inThroughput',projData[i]['inThroughput']);
                   datum.set('outBytes',projData[i]['outBytes']);
                   datum.set('outThroughput',projData[i]['outThroughput']);
                   datum.set('vnCnt',projData[i]['vnCnt']);
                }
             }
         });*/
      }

}
var objListView = new ObjectListView();

function ObjectSummaryView() {
    var statsDataSource,template;
    var self = this;
    this.load = function(obj) {
        var data = {stats:{},charts:{},grids:{}};
        if($.inArray(obj['type'],['domain','project','network']) > -1) {
            data['stats']['parseFn']  = tenantNetworkMonitorUtils.statsParseFn;
        }
        var context = obj['type'];
        var objType = obj['type'];
        data['context'] = context;
        //Domain
        if(objType == 'domain') {
            domainSummaryView.load($.extend({container:pageContainer},obj));
        } else if(objType == 'project') { //Project
            projSummaryView.load($.extend({container:pageContainer},obj));
        } else if(objType == 'network') {  //Network
            networkSummaryView.load($.extend({container:pageContainer},obj));
        } else if(objType == 'connected-nw') {  //Connected Network
            connectedNetworkView.load($.extend({container:pageContainer},obj));
        } else if(objType == 'instance') {  //Instance
            instSummaryView.load($.extend({container:pageContainer},obj));
        } else if(objType=='portRangeDetail') {
            portSummaryView.load($.extend({container:pageContainer},obj));
        }
        var contextObj = getContextObj(obj);
        $.extend(data,contextObj);
        //Load the data for the components not handled by initTemplates
        //Also, feed the data if same dataSource URL is used for multiple components
    }
}
var objSummaryView = new ObjectSummaryView();

function tenantNetworkMonitorClass() {
    var self = this;
    this.timeObj = {};
    var treeView = null,currView = null;
    
    //Pass on the window resize event to the respective view
    this.onWindowResize = function() {
        return;
    }

    this.destroy = function() {
        //To unload dynamically loaded javascript,ensure that you define it inside a closure 
        //so that there will be only one handle to that closure execution context and can be
        //removed easily.
        if($('.contrail-grid').data('contrailGrid') != undefined)
            $('.contrail-grid').data('contrailGrid').destroy();
        delete contView;
        delete contentView;
        //Revert back ajax defaultTimeout
        $.ajaxSetup({
            timeout:30000
        });
    }

    this.updateViewByHash = function(hashObj,lastHashObj) {
        var dataItem;
        //If there is any hash string present in the URL,select that node accordingly
        if((hashObj != null) && (hashObj != '') && typeof(hashObj) == 'object') {
            if(currView != null)
                currView.destroy();
            if((hashObj['fqName'] != null) && hashObj['view'] == null) {
                var fqNameLen = hashObj['fqName'].split(':').length;
                if(hashObj['srcVN'] != null)  { //Connected Network
                    if(hashObj['fqName'].match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)) {
                        objSummaryView.load({type:'instance',vmName:hashObj['vmName'],fqName:hashObj['fqName'],srcVN:hashObj['srcVN']}); 
                    } else
                        objSummaryView.load({context:'connected-nw',type:'connected-nw',fqName:hashObj['fqName'],srcVN:hashObj['srcVN']}); 
                } else {
                    if(fqNameLen == 1) {     //Domain
                        //Enable hard refresh for applicable views
                        showHardRefresh();
                        objSummaryView.load({context:'domain',type:'domain',fqName:hashObj['fqName']}); 
                    } else if(fqNameLen == 2) {    //Project
                        hideHardRefresh();
                        if(hashObj['portType']!=null && hashObj['port']!=null){
                            objSummaryView.load({context:'project',type:'portRangeDetail',startTime:hashObj['startTime'],endTime:hashObj['endTime'],
                                fqName:hashObj['fqName'],port:hashObj['port'],protocol:hashObj['protocol'],portType:hashObj['portType']})}
                        else
                            objSummaryView.load({context:'project',type:'project',fqName:hashObj['fqName'],uuid:hashObj['uuid']}); 
                    } else if(fqNameLen == 3) { //Network
                        hideHardRefresh();
                        if(hashObj['portType']!=null && hashObj['port']!=null) {
                            objSummaryView.load({context:'network',type:'portRangeDetail',startTime:hashObj['startTime'],endTime:hashObj['endTime'],
                                fqName:hashObj['fqName'],port:hashObj['port'],protocol:hashObj['protocol'],portType:hashObj['portType']})}
                        else
                            objSummaryView.load({context:'network',type:'network',fqName:hashObj['fqName'],uuid:hashObj['uuid']}); 
                    } else if(fqNameLen > 2) {   //Instance
                        var matchArr = hashObj['fqName'].match(/(.*):Instances:(.*)/);
                        objSummaryView.load({type:'instance',fqName:matchArr[2],srcVN:matchArr[1]}); 
                    }
                }
            } else if(hashObj['view'] != null) {
                showHardRefresh();
                subViews[hashObj['view']].load(hashObj);
            } 
        }
    }

    this.load = function() {
        //Change ajax defaultTimeout for this screen
        $.ajaxSetup({
            timeout:60000
        });
        self.updateViewByHash(layoutHandler.getURLHashParams());
        initializeRefreshBtn();
    }

    var subViews = {list:objListView,summary:objSummaryView};
    this.loadSubView = function(obj) {
        if(obj['view'] != "") {
            subViews[obj['view']].load(obj); 
            //subViews[obj['view']].load({fqName:'default-domain',type:'network'}); 
        }
    }
  //This method is invoked whenever the refresh icon of monitoring network is clicked on the header and refreshes the 
  //correspoding datasource in the cache object.
    this.onHardRefresh = 
        //Currently this function not in use
        /* istanbul ignore next */
        function(hashObj) {
            function parsePortDistributionData(response,url) {
                var result = {};
                var portDistributionParams = $.deparamURLArgs(url);
                var sportData = tenantNetworkMonitorUtils.parsePortDistribution(response['sport'],{startTime:portDistributionParams['startTime'],
                    endTime:portDistributionParams['endTime'],bandwidthField:'outBytes',flowCntField:'outFlowCount',portField:'sport'});
                sportData = updateCharts.setUpdateParams(sportData);
                var dportData = tenantNetworkMonitorUtils.parsePortDistribution(response['dport'],{startTime:portDistributionParams['startTime'],
                    endTime:portDistributionParams['endTime'],bandwidthField:'inBytes',flowCntField:'inFlowCount',portField:'dport'});
                dportData = updateCharts.setUpdateParams(dportData);
                result['data'] = [{key:'Source Port',values:sportData},
                       {key:'Destination Port',values:dportData}];
                return result;
            }
            if(hashObj['p'] == 'mon_net_networks') {
                if(hashObj['q']['view'] == 'list') {
                    manageDataSource.refreshDataSource('networkDS')
                } else if(hashObj['q']['fqName'] != null) {
                    var selectedTab = getSelectedTab();
                    if(selectedTab != null){
                        if(selectedTab == 0){
                            //Summary tab
                            topologyView.drawTopology(hashObj['q']['fqName']);
                            var obj = {};
                            var url = constructReqURL({fqName:hashObj['q']['fqName'],context:'network',type:'network',widget: "flowseries"});
                            obj['url'] = url;
                            obj['type'] = 'timeseriescharts'
                            obj['parseFn'] = parseTSChartData;
                            obj['selector'] = $(contentContainer).find('div.ts-chart > svg').first()[0];
                            updateCharts.getResponse(obj);
                        } else if(selectedTab == 1) {
                            //Port map tab
                            var uveDeferredObj = $.Deferred();
                            $.ajax({
                                url:'/api/tenant/networking/virtual-network/summary?fqNameRegExp=' + hashObj['q']['fqName']
                            }).done(function(result) {
                                $("#uve-information").html(syntaxHighlight(result));
                                uveDeferredObj.resolve(result);
                            });
                            initPortMapCharts(uveDeferredObj);
                            
                        } else if(selectedTab == 2) {
                            //Port distribution
                            var url = constructReqURL({fqName:hashObj['q']['fqName'],context:'network',type:'port'});
                            var obj = {};
                            obj['url'] = url;
                            obj['type'] = 'bubblechart';
                            obj['selector'] = $(contentContainer).find('div.stack-chart > svg').first()[0];
                            obj['axisformatFn'] = 'formatByteAxis';
                            obj['yLbl'] = 'Bandwidth';
                            obj['parseFn'] = parsePortDistributionData;
                            updateCharts.getResponse(obj);
                        } else if(selectedTab == 3) {
                            //Instances tab
                            var obj = {};
                            var instCfilts = ['UveVirtualMachineAgent:interface_list','UveVirtualMachineAgent:vrouter','UveVirtualMachineAgent:if_stats_list'];
                            obj['transportCfg'] = { 
                                    url:'/api/tenant/networking/virtual-machines/details?fqnUUID=' + hashObj['q']['uuid']  + '&count=' + INST_PAGINATION_CNT + '&type=vn',
                                    type:'POST',
                                    data:{data:[{"type":"virtual-machine","cfilt":instCfilts.join(',')}]}
                                }
                            var contrailGrid = $('div.contrail-grid').data('contrailGrid');
                            if(contrailGrid != null) {
                                getOutputByPagination(contrailGrid._dataView,{transportCfg:obj['transportCfg'],parseFn:tenantNetworkMonitorUtils.instanceParseFn});
                            }
                        } else if(selectedTab == 4) {
                            //UVE Response (Details) tab
                            var uveDeferredObj = $.Deferred();
                            $.ajax({
                                url:'/api/tenant/networking/virtual-network/summary?fqNameRegExp=' + hashObj['q']['fqName']
                            }).done(function(result) {
                                $("#uve-information").html(syntaxHighlight(result));
                                uveDeferredObj.resolve(result);
                            }).always(function(){
                                manageDataSource.setTimestampInCacheObjAndDisplay('network_'+selectedTab,new Date().getTime(),'done');
                            });
                            initPortMapCharts(uveDeferredObj);
                        }
                    }
                }
            } else if (hashObj['p'] == 'mon_net_projects') {
                if(hashObj['q']['view'] == 'list') {
                    manageDataSource.refreshDataSource('networkDS')
                } else if(hashObj['q']['fqName'] != null) {
                    var selectedTab = getSelectedTab();
                    if(selectedTab != null){
                        if(selectedTab == 0){
                            topologyView.drawTopology(hashObj['q']['fqName']);
                            var obj = {};
                            var url = constructReqURL({fqName:hashObj['q']['fqName'],context:'project',type:'port'});
                            obj['url'] = url;
                            obj['type'] = 'bubblechart';
                            obj['selector'] = $(contentContainer).find('div.stack-chart > svg').first()[0];
                            obj['axisformatFn'] = 'formatAxis';
                            obj['yLbl'] = 'Bandwidth';
                            obj['parseFn'] = parsePortDistributionData;
                            updateCharts.getResponse(obj);
                        } else if(selectedTab == 1) {
                            var obj = {};
                            var instCfilts = ['UveVirtualMachineAgent:interface_list','UveVirtualMachineAgent:vrouter','UveVirtualMachineAgent:if_stats_list'];
                            obj['transportCfg'] = { 
                                    url:'/api/tenant/networking/virtual-machines/details?fqnUUID=' + hashObj['q']['uuid']  + '&count=' + INST_PAGINATION_CNT + '&type=project',
                                    type:'POST',
                                    data:{data:[{"type":"virtual-machine","cfilt":instCfilts.join(',')}]}
                                }
                            var contrailGrid = $('div.contrail-grid').data('contrailGrid');
                            if(contrailGrid != null) {
                                getOutputByPagination(contrailGrid._dataView,{transportCfg:obj['transportCfg'],parseFn:tenantNetworkMonitorUtils.instanceParseFn});
                            }
                        }
                    }
                }
            } else if(hashObj['p'] == 'mon_net_dashboard') {
                manageDataSource.refreshDataSource('networkDS');
            } else if(hashObj['p'] == 'mon_net_instances') {
                if(hashObj['q']['view'] == 'list') {
                    manageDataSource.refreshDataSource('instDS');
                } else if(hashObj['q']['fqName'] != null) {
                    
                }
            }
    }
}
var tenantNetworkMonitorView = new tenantNetworkMonitorClass();

function constructReqURL(obj) {
    var url = "";
    var length = 0;
    if(obj['fqName'] != null)
        length = obj['fqName'].split(':').length;
    else
        obj['fqName'] = "*";
    var context = obj['context'];
    //Decide context based on fqName length
    if((context == null) && (length > 0)) {
        var contextMap = ['domain','project'];
        context = contextMap[length-1];
    }

    //Pickup the correct URL in this if loop
    if(context == 'domain') {
        url = "/api/tenant/networking/domain/stats/top"
        if(obj['type'] == 'summary') 
            url = "/api/tenant/networking/domain/summary"
    } else if(context == 'project') {
        url = "/api/tenant/networking/network/stats/top"
        if(obj['type'] == 'summary') 
            url = "/api/tenant/networking/project/summary"
        else if(obj['type']=='portRangeDetail') 
            url="/api/admin/reports/query";
    } else if(context == 'network') {
        url = "/api/tenant/networking/network/stats/top"
        if(obj['type']=='portRangeDetail') 
            url="/api/admin/reports/query";
        var urlMap = {  summary: '/api/tenant/networking/vn/summary',
                        flowseries:'/api/tenant/networking/flow-series/vn',
                        details:'/api/tenant/networking/network/details'
                    }
        if(ifNull(obj['widget'],obj['type']) in urlMap)
            url = urlMap[ifNull(obj['widget'],obj['type'])];
    } else if(context == 'connected-nw') { 
        url = "/api/tenant/networking/network/connected/stats/top"
        var urlMap = {  flowseries:'/api/tenant/networking/flow-series/vn',
                        summary:'/api/tenant/networking/network/connected/stats/summary'
                    }
        if(ifNull(obj['widget'],obj['type']) in urlMap)
            url = urlMap[ifNull(obj['widget'],obj['type'])];
    } else if(context == 'instance') { //Instance
        url = "/api/tenant/networking/vm/stats/top"
        var urlMap = {  flowseries:'/api/tenant/networking/flow-series/vm',
                        summary:'/api/tenant/networking/vm/stats/summary'
                    }
        if(ifNull(obj['widget'],obj['type']) in urlMap)
            url = urlMap[ifNull(obj['widget'],obj['type'])];
    } 
    //End - pick the correct URL
    if((obj['type'] == 'instance') && (obj['context'] != 'instance')) {
        url = "/api/tenant/networking/virtual-machines"
    }
    //If need statistics from the beginning
    if(obj['source'] == 'uve') {
        if($.inArray(obj['type'],['project','network']) > -1)
            url = '/api/tenant/networking/virtual-network/summary'
    }
    var reqParams = { };
    //No time range required as summary stats are from the beginning
    if(obj['type'] != 'summary') {
        //Retrieve only top 5 if it's not the entire list
        //Exclude list where limit is not applicable
        if($.inArray(obj['view'],['list','flowseries']) == -1) {
            if(obj['widget'] != 'flowseries')
                obj['limit'] = ifNull(obj['limit'],5); 
        }
        //Time-related queries
        if(obj['fromUTC'] != null) {
        } else if(obj['time'] == null) {
            obj['time'] = '10m';
        }
        if(obj['time'] != null) {
            var startEndUTC = tenantNetworkMonitorUtils.getFromToUTC(obj['time']);
            delete obj['time'];
            obj['fromUTC'] = startEndUTC[0];
            obj['toUTC'] = startEndUTC[1];
        }
        $.extend(reqParams,{minsSince : TOP_IN_LAST_MINS});
    }
    if(obj['limit'] != null)
        $.extend(reqParams,{limit:obj['limit']});
    else 
        $.extend(reqParams,{limit:100});    //Hack
    //Rename fqName variable as per NodeJS API requirement 
    if(obj['fqName'] != null) {
        //For flow-series,need to pass fqName as srcVN
        if(context == 'connected-nw') {
            $.extend(reqParams,{'srcVN':obj['srcVN'],'destVN':obj['fqName']});
        } else if(obj['widget'] == 'flowseries') {
            if(context == 'instance') {
                $.extend(reqParams,{'fqName':ifNull(obj['vnName'],obj['fqName']),'ip':obj['ip']});
            } else 
                $.extend(reqParams,{'fqName':obj['fqName']});        //change queryParameter to fqName
        } else if(obj['type'] == 'details') {
            if(context == 'network')
                $.extend(reqParams,{'uuid':obj['uuid']});
        } else if(context == 'instance') {
            $.extend(reqParams,{'fqName':obj['vnName'],'ip':obj['ip']});
        } else
            $.extend(reqParams,{'fqName':obj['fqName']});
    }

    //If port argument is present,just copy it..arguments that need to be copied to reqParams as it is
    $.each(['port','protocol','vmName','vmVnName','useServerTime'],function(idx,field) {
        if(obj[field] != null) {
            //$.extend(reqParams,{port:obj[field]});
            reqParams[field] = obj[field];
        }
    });
    if(obj['type']=='portRangeDetail') {
        var fqName=obj['fqName'],protocolCode;
        reqParams['timeRange']=600;
        reqParams['table']='FlowSeriesTable';
        if(obj['startTime'] != null) {
            reqParams['fromTimeUTC']=obj['startTime'];
            reqParams['toTimeUTC']=obj['endTime'];
        } else {
            reqParams['fromTimeUTC']=new XDate().addMinutes(-10).getTime();
            reqParams['toTimeUTC']=new XDate().getTime();
        }
        var protocolMap = {tcp:6,icmp:1,udp:17};
        var protocolCode = [];
        $.each(obj['protocol'],function(idx,value) {
            protocolCode.push(protocolMap[value]);
        });
        if(fqName.split(':').length==2) {
            fqName+=':*';//modified the fqName as per the flow series queries
        }
        var portType = obj['portType'] == 'src' ? 'sport' : 'dport';
        var whereArr = [];
        $.each(protocolCode,function(idx,currProtocol) {
            whereArr.push(contrail.format("({3}={0} AND sourcevn={1} AND protocol={2})",obj['port'],fqName,currProtocol,portType));
        });
        reqParams['select'] = "sourcevn, destvn, sourceip, destip, protocol, sport, dport, sum(bytes), sum(packets),flow_count";
        reqParams['where'] = whereArr.join(' OR ');
        delete reqParams['fqName'];
        delete reqParams['protocol'];
    }
    //Strip-off type if not required
    if(obj['type'] != null && ($.inArray(obj['type'],['summary','flowdetail','portRangeDetail']) == -1) && 
            ($.inArray(obj['widget'],['flowseries']) == -1))
        $.extend(reqParams,{type:obj['type']});

    //Add extra parameters for flowseries
    if(obj['widget'] == 'flowseries') {
        $.extend(reqParams,{'sampleCnt':NUM_DATA_POINTS_FOR_FLOW_SERIES});
        //If useServerTime flag is true then the webserver timeStamps will be send in startTime and endTime to query engine
        $.extend(reqParams,{'minsSince':30,'useServerTime':true});
    }
    //Don't append startTime/endTime if minsSince is provided as need to use realtive times 
    /*Always send the startTime and endTime instead of minsSince
    if(reqParams['minsSince'] != null) {
        reqParams['endTime'] = new Date().getTime();
        reqParams['startTime'] = new Date(new XDate().addMinutes(-reqParams['minsSince'])).getTime();
        //delete reqParams['minsSince'];
    }*/

    //Strip-off limit & minsSince if not required
    if(((obj['type'] == 'instance') && (obj['context'] != 'instance')) || (obj['source'] == 'uve') || obj['type'] == 'portRangeDetail') {
        delete reqParams['limit'];
        delete reqParams['minsSince'];
        delete reqParams['endTime'];
        delete reqParams['startTime'];
    }
    if(obj['source'] == 'uve') {
        if(obj['type'] != 'instance') {
            delete reqParams['fqName'];
            if(obj['fqName'] == '' || obj['fqName'] == '*')
                reqParams['fqNameRegExp'] = '*';
            else
                reqParams['fqNameRegExp'] = '*' + obj['fqName'] + ':*';
        } else {
            reqParams['fqName'] = '';
        }
    }

    if((obj['portType'] != null) && (obj['port'].toString().indexOf('-') > -1)) {
        //As NodeJS API expects same URL for project & network and only fqName will be different
        if(url.indexOf('/top') > -1) {
            url = '/api/tenant/networking/network/stats/top';
            reqParams['portRange'] = obj['port'];
            if(obj['startTime'] != null)
                reqParams['startTime'] = obj['startTime'];
            if(obj['endTime'] != null)
                reqParams['endTime'] = obj['endTime'];
            delete reqParams['port'];
        }
    }
    //reqParams['limit'] = 100;
    delete reqParams['limit'];

    return url + '?' + $.param(reqParams);
}

/*
 * Onclick event handler for links within the grid cell
 */
function onClickGridLink(e,selRowDataItem){
    var name = $(e.target).attr('name');
    var reqObj = {};
    if ($.inArray(name, ['network', 'project']) > -1) {
        layoutHandler.setURLHashParams({fqName:selRowDataItem['name']},{merge:false});
    } else if($.inArray(name,['instance']) > -1) {
        layoutHandler.setURLHashParams({vmName:selRowDataItem['vmName'],fqName:selRowDataItem['name'],srcVN:selRowDataItem['vn'][0]},{merge:false,p:'mon_net_instances'});
    } else if($.inArray(name,['vRouter']) > -1) {
        layoutHandler.setURLHashParams({node: selRowDataItem['vRouter'], tab:''}, {p:'mon_infra_vrouter',merge:false});
    }
}



/**
 * Common utility functions for tenant network monitoring page
 */
var tenantNetworkMonitorUtils = {
    networkParseFn:function(response) {
        var retArr = $.map(ifNull(response['value'], response), function (currObj, idx) {
            currObj['rawData'] = $.extend(true,{},currObj);
            currObj['url'] = '/api/tenant/networking/virtual-network/summary?fqNameRegExp=' + currObj['name'];
            currObj['inBytes'] = ifNull(jsonPath(currObj, '$..in_bytes')[0], 0);
            currObj['outBytes'] = ifNull(jsonPath(currObj, '$..out_bytes')[0], 0);
            currObj['instCnt'] = ifNull(jsonPath(currObj, '$..virtualmachine_list')[0], []).length;
            currObj['inThroughput'] = ifNull(jsonPath(currObj, '$..in_bandwidth_usage')[0], 0);
            currObj['outThroughput'] = ifNull(jsonPath(currObj, '$..out_bandwidth_usage')[0], 0);
            return currObj;
        });
        return retArr;
    },
    instanceParseFn: function(response) {
        var retArr = $.map(ifNull(response['value'],response), function (obj, idx) {
            var currObj = obj['value'];
            var intfStats = getValueByJsonPath(currObj,'VirtualMachineStats;if_stats;0;StatTable.VirtualMachineStats.if_stats',[]);
            obj['rawData'] = $.extend(true,{},currObj);
            obj['inBytes'] = 0;
            obj['outBytes'] = 0;
            // If we append * wildcard stats info are not there in response,so we changed it to flat
            obj['url'] = '/api/tenant/networking/virtual-machine/summary?fqNameRegExp=' + obj['name'] + '?flat';
            obj['vmName'] = ifNull(jsonPath(currObj, '$..vm_name')[0], '-');
            obj['vRouter'] = ifNull(jsonPath(currObj, '$..vrouter')[0], '-');
            obj['intfCnt'] = ifNull(jsonPath(currObj, '$..interface_list')[0], []).length;
            obj['vn'] = ifNull(jsonPath(currObj, '$..interface_list[*].virtual_network'),[]);
            obj['vn'] = $.map(obj['vn'],function(value,idx) {
                var fqNameArr = value.split(':');
                if(fqNameArr.length == 3)
                    return fqNameArr[2] + ' (' + fqNameArr[1] + ')';
                else
                    return value;
            });
            obj['ip'] = ifNull(jsonPath(currObj, '$..interface_list[*].ip_address'), []);
            var floatingIPs = ifNull(jsonPath(currObj, '$..fip_stats_list')[0], []);
              obj['floatingIP'] = [];
            $.each(floatingIPs, function(idx, fipObj){
                obj['floatingIP'].push(contrail.format('{0}<br/> ({1}/{2})', fipObj['ip_address'],formatBytes(ifNull(fipObj['in_bytes'],'-')),
                        formatBytes(ifNull(fipObj['out_bytes'],'-'))));
            });
            $.each(intfStats, function (idx, value) {
                obj['inBytes'] += ifNull(value['SUM(if_stats.in_bytes)'],0);
            });
            $.each(intfStats, function (idx, value) {
                obj['outBytes'] += ifNull(value['SUM(if_stats.out_bytes)'],0);
            });
            return obj;
        });
        return retArr;
    },
    parsePortDistribution: function(result,cfg) {
        var portCF = crossfilter(result);
        var portField = ifNull(cfg['portField'],'sport');
        var portType = cfg['portType'];
        if(portType == null) 
            portType = (portField == 'sport') ? 'src' : 'dst';
        var flowCntField = ifNull(cfg['flowCntField'],'outFlowCnt');
        var bandwidthField = ifNull(cfg['bandwidthField'],'outBytes');
        var portDim = portCF.dimension(function(d) {return d[cfg['portField']];});
        var PORT_LIMIT = 65536;
        var PORT_STEP = 256;
        var startPort = ifNull(cfg['startPort'],0);
        var endPort = ifNull(cfg['endPort'],PORT_LIMIT);
        if(endPort - startPort == 255)
            PORT_STEP = 1;
        //var PORT_LIMIT = 33400;
        var color;
        if(portType == 'src') {
            color = d3Colors['green'];
            color = '#1f77b4';
        } else  {
            color = d3Colors['blue'];
            color = '#aec7e8';
        }

        var portArr = [];
        //Have a fixed port bucket range of 256
        for(var i=startPort;i<=endPort;i=i+PORT_STEP) {
            var name,range;
            if(PORT_STEP == 1) {
                portDim.filter(i);
                name =  i;
                range = i;
            } else {
                portDim.filter([i,Math.min(i+PORT_STEP-1,65536)]);
                name =  i + ' - ' + Math.min(i+PORT_STEP-1,65536);
                range = i + '-' + Math.min(i+PORT_STEP-1,65536);
            }
            var totalBytes = 0;
            var flowCnt = 0;
            $.each(portDim.top(Infinity),function(idx,obj) {
                totalBytes += obj[bandwidthField];
                flowCnt += obj[flowCntField];
            });
            var x = Math.floor(i + Math.min(i+PORT_STEP-1,65536))/2
            if(portDim.top(Infinity).length > 0)
                portArr.push({
                    startTime:cfg['startTime'],
                    endTime:cfg['endTime'],
                    x:x,
                    y:totalBytes,
                    name: name,
                    type:portType == 'src' ? 'sport' : 'dport',
                    range: range,
                    flowCnt:flowCnt,
                    size:flowCnt + 1,
                    color:color,
                    //type:portField
                });
        }
        return portArr;
    },
    parsePortMap: function(data) {
        var response=data['res'];
        var result={};
        var value = 0;
        var portMap = [0,0,0,0,0,0,0,0];

        //If portmap received from multiple vRouters
        if((response instanceof Array) && (response[0] instanceof Array)) {
            $.each(response,function(idx,obj) {
                for(var i=0;i<8;i++) {
                    portMap[i] |= parseInt(obj[0][i]);
                }
            });
        } else if(response instanceof Array)
            portMap = response;
        if(portMap != null) {
            var strPortMap = [];
            $.each(portMap,function(idx,value) {
                strPortMap.push(reverseString(get32binary(parseInt(value))));
            });
            //console.info(strPortMap);
        }
        //To plot in 4 rows
        var stringPortMap = [];
        for(var i=0,j=0;j<4;i+=2,j++)
            stringPortMap[j] = strPortMap[i] + strPortMap[i+1]
        var chartData = [];
        for(var i=0;i<64;i++) {
          for(var j=0;j<4;j++) {
              chartData.push({
                  x:i,
                  y:j,
                  value:(response == null) ? 0 : parseInt(stringPortMap[j][i])
              });
          }
        }
        result['res'] = chartData;
        result['type'] = data['type'];
        result['pType'] = data['pType'];
        return result;
    },
    parseInstDetails: function(data,rowData) {
        var d = data;
        var interfaces = ifNullOrEmptyObject(jsonPath(d,'$..interface_list')[0],[]);
        var intfStr = [];
        var retArr = [],interfaceDetails = [],fipDetails = [];
        var ifStatsList = getValueByJsonPath(d,'VirtualMachineStats;if_stats;0;StatTable.VirtualMachineStats.if_stats',[]);
        var fipObjArr = ifNullOrEmptyObject(jsonPath(d,'$..fip_stats_list')[0],[]);
        var spanWidths = ['span2','span1','span2','span2','span2','span1','span1'];
        var throughputIn = 0;
        var throughputOut = 0;
        spanWidths = [235,105,35,190,110,110,95,55]
        //retArr.push({lbl:'vRouter',value:ifNull(jsonPath(d,'$..vrouter')[0],'-')});
        var spanWidthsForFip = [95,250,300,110];
        retArr.push({lbl:'UUID',value:ifNull(rowData['name'],'-')});
        retArr.push({lbl:'CPU',value:jsonPath(d,'$..cpu_one_min_avg')[0] != null ? jsonPath(d,'$..cpu_one_min_avg')[0].toFixed(2) : '-'});
        var usedMemory = ifNullOrEmptyObject(jsonPath(d,'$..rss')[0],'-');
        var totalMemory = ifNullOrEmptyObject(jsonPath(d,'$..vm_memory_quota')[0],'-');
        if(usedMemory != '-' && totalMemory != '-') {
            if(usedMemory > totalMemory)
                usedMemory = totalMemory;
        }
        retArr.push({lbl:'Memory (Used/Total)',value:formatBytes(usedMemory*1024) + ' / ' + 
            formatBytes(totalMemory*1024)});
        if(fipObjArr.length > 0) {
            fipDetails.push({lbl:'Floating IPs',value:['IP Address','Floating IP Network','Interface UUID','Traffic (In/Out)'],
                span:spanWidthsForFip,config:{labels:true}});
        }
        $.each(fipObjArr,function(idx,fipObj){
            var ipAddress = ifNull(fipObj['ip_address'],'-');
            var fipPool = ifNull(fipObj['virtual_network'],'-');
            var intfObj = $.grep(interfaces,function(intfObj,idx) {
                if(intfObj['name'] == fipObj['iface_name'])
                    return true;
                else
                    return false;
            });
            var interfaceName = getValueByJsonPath(intfObj,'0;uuid','-');
            var intfInBytes = formatBytes(ifNull(fipObj['in_bytes'],'-'));
            var intfOutBytes = formatBytes(ifNull(fipObj['out_bytes'],'-'));
            fipDetails.push({lbl:'',value:[ipAddress, fipPool, interfaceName,intfInBytes+"/"+intfOutBytes],span:spanWidthsForFip});
        });
        //Add the header
        if(interfaces.length > 0) {
          //Here the Ip Address/Mac Address wraps to next line so to avoid the background color in second line 
          //the height property set to 40px
            interfaceDetails.push({lbl:'Interfaces',value:['Interface UUID','IP Address /<br/> Mac Address','Label','Network','Traffic (In/Out)','Throughput (In/Out)','Gateway','Status'],
                                    span:spanWidths,config:{labels:true,minHeight:'40px'}});
        }
        $.each(interfaces,function(idx,obj) {
            var name = obj['name'];
            var currIfStatObj = $.grep(ifStatsList,function(statObj,idx) {
                if(statObj['if_stats.name'] == obj['name'])
                    return true;
                else
                    return false;
            });
            var intfStatus = '-';
            var intfInBytes = getValueByJsonPath(currIfStatObj,'0;SUM(if_stats.in_bytes)','-');
            var intfOutBytes = getValueByJsonPath(currIfStatObj,'0;SUM(if_stats.out_bytes)','-');
            var intfInBw = getValueByJsonPath(currIfStatObj,'0;SUM(if_stats.in_bw_usage)','-');
            var intfOutBw = getValueByJsonPath(currIfStatObj,'0;SUM(if_stats.out_bw_usage)','-');
            throughputIn += getValueByJsonPath(currIfStatObj,'0;SUM(if_stats.in_bw_usage)',0);
            throughputOut += getValueByJsonPath(currIfStatObj,'0;SUM(if_stats.out_bw_usage)',0);
            var uuid = ifNull(obj['uuid'],'-');
            if(obj['active'] != null && obj['active'] == true)
                intfStatus = 'Active';
            else if(obj['active'] != null && obj['active'] == false)
                intfStatus = 'InActive';
            intfStr[idx] = [uuid, ifNull(obj['ip_address'],'-')+" /<br/> "+ifNull(obj['mac_address'],'-'), ifNull(obj['label'],'-'),
                           ifNull(obj['virtual_network'],'-'), formatBytes(intfInBytes) + '/' + formatBytes(intfOutBytes),
                           formatBytes(intfInBw) + '/' + formatBytes(intfOutBw),ifNull(obj['gateway'],"-"),intfStatus]; 
            interfaceDetails.push({lbl:'',value:intfStr[idx],span:spanWidths});
        });
        retArr.push({lbl:'Throughput (In/Out)',value:formatBytes(throughputIn) + '/' +formatBytes(throughputOut)});
        retArr = $.merge($.merge(retArr,interfaceDetails),fipDetails);
        return retArr;
    },
    parseNetworkDetails: function(data) {
        var d = data['value'];
        var retArr = [];
        var connectedNetworks = ifNull(jsonPath(d,'$..UveVirtualNetworkConfig.connected_networks')[0],[]);
        var instanes = ifNull(jsonPath(d,'$.UveVirtualNetworkAgent.virtualmachine_list')[0],[]);
        var ingressFlowCount = ifNull(jsonPath(d,'$.UveVirtualNetworkAgent.ingress_flow_count')[0],0);
        var egressFlowCount = ifNull(jsonPath(d,'$.UveVirtualNetworkAgent.egress_flow_count')[0],0);
        /*var flowCnt = ifNullOrEmptyObject(jsonPath(d,'$..flow_count')[0],0);
        //If flow count is reported from multiple vRouters,take the first one
        if(flowCnt instanceof Object)
            flowCnt = flowCnt[0][0];*/
        var policies = ifNullOrEmptyObject(jsonPath(d,'$..attached_policies')[0],[]);
        var policyArr = [];
        $.each(policies,function(idx,obj) {
            policyArr.push(obj['vnp_name']);
        });
        //var partiallyConnectedNetworks = ifNull(jsonPath(d,'$..UveVirtualNetworkConfig.connected_networks')[0],[]);
        retArr.push({lbl:'Connected Networks',value:connectedNetworks.join(', ')});
        //retArr.push({lbl:'Flows',value:flowCnt});
        retArr.push({lbl:'Ingress Flows',value:ingressFlowCount});
        retArr.push({lbl:'Egress Flows',value:egressFlowCount});
        retArr.push({lbl:'ACL',value:ifNullOrEmptyObject(jsonPath(d,'$..acl')[0],'')});
        retArr.push({lbl:'ACL Rules',value:ifNullOrEmptyObject(jsonPath(d,'$..total_acl_rules')[0],0)});
        retArr.push({lbl:'Interfaces',value:ifNullOrEmptyObject(jsonPath(d,'$..interface_list')[0],[]).length});
        //retArr.push({lbl:'Instances',value:ifNull(jsonPath(d,'$..virtualmachine_list')[0],[]).length});
        retArr.push({lbl:'VRF',value:ifNullOrEmptyObject(jsonPath(d,'$..vrf_stats_list[0].name')[0],'')});
        retArr.push({lbl:'Policies',value:policyArr.join(', ')});
        retArr.push({lbl:'Instances',value:instanes.join(', ')})
        //Remove the label/values where value is empty
        retArr = $.map(retArr,function(obj,idx) {
            if(obj['value'] !== '')
                return obj;
            else
                return null;
        });
        return retArr;
    },
    //Add the missing VNs from API server in UVE response
    //Currently this code is not in use
    
    filterVNsNotInCfg: 
        /* istanbul ignore next */
        function(uveData,fqName) {
            var filteredVNs = [];
            var cfgVNListURL = '/api/tenants/config/virtual-networks';
            if(fqName == null || fqName == '' || fqName == '*') {
            } else if(fqName.split(':').length == 2)  //Project
                cfgVNListURL += '?tenant_id='  + fqName;
            $.ajax({
                    url:cfgVNListURL,
                    async:false
            }).done(function(configData) {
                var configVNs = [],uveVNs = [];
                var excludeVNs = ['svc-vn-left','svc-vn-right','svc-vn-mgmt'];
                $.each(configData['virtual-networks'],function(idx,obj) {
                    configVNs.push(obj['fq_name'].join(':'));
                });
                filteredVNs = $.map(uveData,function(obj,idx) {
                    if($.inArray(obj['name'].split(':')[2],excludeVNs) > -1)
                        return null;
                    if($.inArray(obj['name'],configVNs) > -1) {
                        uveVNs.push(obj['name']);
                        return obj;
                    } else
                        return null;
                });
                //If VN form api server is missing in opserver list,then add it
                $.each(configVNs,function(idx,vnName) {
                    if($.inArray(vnName,uveVNs) == -1 && $.inArray(vnName.split(':')[2],excludeVNs) == -1) {
                        filteredVNs.push({name:vnName,value:{}});
                    }
                });
            });
            return filteredVNs;
        },
    //str will be [0-9]+(m|h|s|d)
    //Returns an array of current time and end time such that the difference beween them will be given str
    getFromToUTC: function(str) {
        var startDt = new XDate(true);
        var endDt = new XDate(true);
        var fnMap = {d:'addDays',m:'addMinutes',s:'addSeconds',h:'addHours'}
        var unit = str.charAt(str.length-1);
        var value = parseInt(str);
        //If unit is not specified,take it as secs
        if($.inArray(unit,['d','m','s','h']) == -1)
            unit = 's';
        endDt[fnMap[unit]](value);
        return [startDt.getTime(),endDt.getTime()];
    },
    //Currently this code is not in use
    statsParseFn: 
        /* istanbul ignore next */
        function(response) {
            //If response in Array,sumup inBytes/outBytes/interVNInBytes/interVNOutBytes across all elements
            var obj = {inBytes:0,outBytes:0,interVNInBytes:0,interVNOutBytes:0};
            if(response instanceof Array) {
                $.each(response,function(idx,value) {
                    $.each(['inBytes','outBytes','interVNInBytes','interVNOutBytes'],function(idx,field) {
                        obj[field] += parseInt(value[field]);
                    });
                });
            } else
                obj = response;
            $.each(obj,function(key,value) {
                if($.inArray(key,['inBytes','outBytes','interVNInBytes','interVNOutBytes']) > -1)
                    obj[key] = formatBytes(value);
            });
            return [obj];
        }
}

//Default tooltip contents to show for infra nodes
function getNetworkTooltipContents(obj) {
    var tooltipContents = [
        {lbl:'Name', value:obj['name']},
        {lbl:'Interfaces', value:obj['x']},
        {lbl:'Networks', value:obj['y']},
        {lbl:'Throughput', value:formatThroughput(obj['throughput'])}
    ];
    return tooltipContents;
}
var tenantNetworkMonitor = {
        projectTooltipFn : function(obj) {
            return getNetworkTooltipContents(obj);
        },
        networkTooltipFn : function(obj) {
            return getNetworkTooltipContents(obj);
        },
        portTooltipFn: function(obj) {
            if(obj['type'] == 'sport')
                titlePrefix = 'Source';
            else if(obj['type'] == 'dport')
                titlePrefix = 'Destination';
            if(obj['name'].toString().indexOf('-') > -1)
                name = titlePrefix + ' Port Range (' + obj['name'] + ')';
            else
                name = titlePrefix + ' Port ' + obj['name'];
            var tooltipContents = [
                {lbl:'Port Range', value:name},
                {lbl:'Flows', value:obj['flowCnt']},
                {lbl:'Bandwidth', value:formatBytes(ifNull(obj['origY'],obj['y']))},
                //{lbl:'Type', value:e['point']['type']}
            ];
            return tooltipContents;
        }
}

function getUUIDByName(fqName) {
    var context,retUUID; 
    var fqNameLength = fqName.split(':').length; 
    if(fqNameLength == 2) 
        context = 'project' 
    else
        context = 'network';
    if(context == 'project') {
        $.ajax({
            url:'/api/tenants/projects/default-domain',
            async:false
        }).done(function(response) {
            $.each(response['projects'],function(idx,projObj) {
                if(projObj['fq_name'].join(':') == fqName) {
                    retUUID = projObj['uuid'];
                    return false;
                }
            });
        });
    }
    if(context == 'network') {
        $.ajax({
            url:'/api/tenants/config/virtual-networks',
            async:false
        }).done(function(response) {
            $.each(response['virtual-networks'],function(idx,vnObj) {
                if(vnObj['fq_name'].join(':') == fqName) {
                    retUUID = vnObj['uuid'];
                    return false;
                }
            });
        });
    }
    return retUUID;
}

function getSelectedTab(){
    var selTabIndex;
    if($("#content-container").find('div.ui-tabs').length > 0){
        selTabIndex = $("#content-container").find('div.ui-tabs li').filter(function(){
            return $(this).attr('tabindex') == 0;
        })
    }
    return selTabIndex;
}

var portSummaryView = new portSummaryRenderer();
function portSummaryRenderer() {
    this.load = function(cfg) {
        var obj = $.extend({},cfg);
        var data = {stats:{},charts:{},grids:{}};
        var portTitle = (obj['portType'] == 'src') ? 'Source Port' : 'Destination Port'
        var portRange = [];
        var startPort,endPort;
        if(obj['port'].indexOf('-') > -1) {
            portRange = obj['port'].split("-") 
            startPort = parseInt(portRange[0]);
            endPort= parseInt(portRange[1]);
            pushBreadcrumb([obj['fqName'],portTitle + 's (' + obj['port'] + ')']);
        } else {
            portRange = [obj['port'],obj['port']];
            pushBreadcrumb([obj['fqName'],portTitle + ' ' + obj['port']]);
        }

        //Initialize bubble chart only if portRange is provided
        if(obj['port'].indexOf('-') > -1) {
            //Issue port distribution query.
            var portDeferredObj = $.Deferred();
            var portDistributionURL = constructReqURL($.extend({},obj,{type:'port'}));
            var portDistributionParams = $.deparamURLArgs(portDistributionURL);
            data['charts']['chartType'] = 'bubble';
            data['charts']['colCount'] = 1;
            data['charts']['d'] = [
                {deferredObj:portDeferredObj,title:'Port Distribution',parseFn:function(response) {
                    var portData,valueField,flowCntField,portType;
                    portData = response;
                    portType = 'port';
                    flowCntField = 'flowCnt';
                    portData = $.map(portData,function(currObj,idx) {
                        if(currObj[portType] >= portRange[0] && currObj[portType] <= parseInt(portRange[1]))
                            return currObj;
                        else
                            return null;
                    });
                    portData = tenantNetworkMonitorUtils.parsePortDistribution(portData,$.extend({startTime:portDistributionParams['startTime'],endTime:portDistributionParams['endTime'],
                        bandwidthField:'bytes',flowCntField:'flowCnt',portField:'port',startPort:startPort,endPort:endPort},{portType:obj['portType']}));

                    var retObj = {d:[{key:'Source Port',values:portData}],fqName:obj['fqName'],
                        link:{hashParams:{q:{view:'list',type:'project',fqName:obj['fqName'],context:'domain'}}},
                        chartOptions:{tooltipFn:tenantNetworkMonitor.portTooltipFn,forceX:[startPort,endPort],xLblFormat:d3.format(''),
                            yDataType:'bytes',yLbl:'Bandwidth',xLbl:'Port'},title:'Port Distribution'};
                    return retObj;
                    }
                }];
        }
        if(obj['port'].indexOf('-') > -1)
            template='portRangeDetail-template';
        else
            template = 'portDetail-template';
        var lcolumns=[];
        var columns=[
            {
                field:"sourceip",
                name:"Source IP",
                minWidth: 100
            },{
                field:"destip",
                name:"Destination IP",
                minWidth: 100
            },{
                field:"protocol",
                name:"Protocol",
                formatter:function(r,c,v,cd,dc){
                    return getProtocolName(dc['protocol']);
                },
                minWidth: 60
            },{
                field:"sport",
                name:"Source Port",
                minWidth: 80
            },{
                field:"dport",
                name:"Destination Port",
                minWidth: 110
            },{
                field:"sum_bytes",
                name:"Sum(Bytes)",
                minWidth: 80
            },{
                field:"sum_packets",
                name:"Sum(Packets)",
                minWidth: 90
            },{
                field:"flow_count",
                name:"Flow Count",
                minWidth: 90
            }
        ];
        if(obj['fqName'].split(':').length==2)
            lcolumns=[
                {
                    field:'sourcevn',
                    name:'Source VN',
                    minWidth: 215,
                    searchable:true
                },{
                    field:'destvn',
                    name:'Destination VN',
                    minWidth: 215,
                    searchable:true
                }];
        else if(obj['fqName'].split(':').length==3 && obj['portType']=='src')
            lcolumns=[
                {   field:'destvn',
                    name:'Destination VN',
                    minWidth: 215,
                    searchable:true
                }];
        else if(obj['fqName'].split(':').length==3 && obj['portType']=='dst')
            lcolumns=[
                {
                    field:'destvn',
                    name:'Destination VN',
                    minWidth: 215,
                    searchable:true
                }];
        data['grids']={
            /*url:function() {
                var protocol= [];
                if(obj['protocol']!=undefined){
                   $.map($('.toggleProtocol'),function(item,idx) {
                       if($(item).text() != getProtocolName(obj['protocol'])) {
                           $(item).removeClass('selected');
                           $(item).addClass('disable');
                       }
                   });
                }
                if($('.toggleProtocol.selected').length > 0) {
                    protocol = $.map($('.toggleProtocol.selected'),function(obj,idx) {
                        return $(obj).text().toLowerCase();
                    });
                }
                return constructReqURL($.extend({},obj,{protocol:['tcp','icmp','udp']}));
            }*/
            url:constructReqURL($.extend({},obj,{protocol:['tcp','icmp','udp']})),
            timeout:FLOW_QUERY_TIMEOUT,
            config:{
                widgetGridTitle:'Flows',
                widgetGridActions: ['<a class="toggleProtocol selected">ICMP</a>','<a class="toggleProtocol selected">UDP</a>','<a class="toggleProtocol selected">TCP</a>'],
                noMsg:'No Flows for the given criteria',
                scrollable: false,
                actionCell: [
                    {
                        title: 'Start Packet Capture',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            startPacketCapture4Flow('gridFlows', rowIndex, 'parseAnalyzerRuleParams4FlowByPort');
                        }
                    }
                ]
            },
            columns:lcolumns.concat(columns),
            parseFn:function(response){
                return portSummaryView.constructDataForPortdistribution(response,portDeferredObj,obj);    
            }
        };
        if(obj['port'].indexOf('-') == -1) {
            //data set to the cache object in the port range detail is used here.
            if(globalObj['dataSources']['portRangeData'] != null && globalObj['dataSources']['portRangeData'][obj['fqName']] != null) {
                var port = (obj['portType'] == 'src') ? 'sport' : 'dport',portData = [];
                var cacheData = manageDataSource.getPortRangeData(obj['fqName']);
                var portDatasource = new ContrailDataView({data:[]});
                $.each(cacheData['data'],function(idx,inrObj){
                   if(inrObj[port] == obj['port']) 
                       portData.push(inrObj);
                })
                portDatasource.setData(portData);
                // we are setting the url for port range detail and as we are using the same object here in case of port detail
                // it is not required,so we are deleting it.
                delete data['grids']['url'];
                data['grids']['dataSource'] = portDatasource;
            }
        }
        //Render the template
        var summaryTemplate = $('#' + template).html();
        var container = cfg['container'];
        $(container).html(summaryTemplate);
        $(container).initTemplates(data);
        //Disable class is added for the protocols on port map drill down.
        $('.toggleProtocol').filter(function() {
            return (!$(this).hasClass('disable'));
        }).on('click',function() {
            if($('.toggleProtocol.disable').length==0)
                $(this).toggleClass('selected');
            //If no protocol is selected,select all protocols
            if($('.toggleProtocol.selected').length == 0 && $('.toggleProtocol.disable').length == 0) {
                $('.toggleProtocol').addClass('selected');        
            }
            //Have client side filtering of protocols
            if($('.toggleProtocol.disable').length == 0) {
                var protocolMap = {tcp:6,icmp:1,udp:17};
                var selProtocolArr = $.map($('.toggleProtocol.selected'),function(obj,idx) {
                    return protocolMap[$(obj).text().toLowerCase()];
                });
                var flowsGrid = $('.contrail-grid').data('contrailGrid');
                flowsGrid._dataView.setFilterArgs({selProtocolArr:selProtocolArr});
                flowsGrid._dataView.setFilter(function(item,args){
                    if(args['selProtocolArr'].indexOf(item['protocol']) > -1)
                        return true;
                    return false;
                });
            }
        });
    }
    
    this.constructDataForPortdistribution = function(response,portDeferredObj,obj) {
        var portCF = crossfilter(response['data']);
        if(obj['port'].indexOf('-') >-1) {
            var data = {portType:obj['portType'],minPort:obj['port'].split('-')[0],maxPort:obj['port'].split('-')[1],
                            data:response['data']};
            manageDataSource.setPortRangeData(obj['fqName'], data);
        }
        var portDim;
        if(portDeferredObj != null) {
            //Format data to plot in Port Distribution chart

            if(obj['portType'] == 'src')
                portDim = portCF.dimension(function(d) { return d['sport'];});
            else
                portDim = portCF.dimension(function(d) { return d['dport'];});
            var portArr = [];
            var portGroup = portDim.group().reduceSum(function(d) { return d['sum_bytes']});
            $.each(portGroup.top(Infinity),function(idx,portObj) {
                portDim.filterAll();
                var flowCnt = 0;
                var matchedRecords = portDim.filter(portObj['key']).top(Infinity);
                $.each(matchedRecords,function(idx,currPortObj) {
                    flowCnt += currPortObj['flow_count'];
                });
                portArr.push({
                    port:portObj['key'],
                    bytes:portObj['value'],
                    flowCnt:flowCnt
                });
            });
            portDeferredObj.resolve(portArr);
        }

        return response.data;
    }
}

/**
* @options['objectType']   project|network|flow|peer|port
* @options['view']         chart|list
* Do any logarthmic calculations here
*/
function chartsParseFn(options, response) {
   var obj = response;
   var view = options['view'];
   var objType = options['objectType'];
   var objSource = options['source'];
   var fqName = options['fqName'];
   var logScale = ifNull(options['logScale'], 0);
   if (options['chart'] != null) {
       var selector = options['chart'];
       if ($(selector).hasClass('negate') || (logScale > 0)) {
           var data = obj;
           var fields = [];
           var series = options['series'];
           $.each(series, function (idx, obj) {
               fields.push(obj['field']);
           });
           if ($(selector).hasClass('negate')) {
               $.each(data, function (idx, obj) {
                   $.each(fields, function (i, field) {
                       data[idx][field] = -1 * data[idx][field];
                   });
               });
           }
           if (logScale > 0) {
               $.each(data, function (idx, obj) {
                   $.each(fields, function (i, field) {
                       data[idx][field] = log2(data[idx][field]);
                   });
               });
           }
       }
   }

   if(objType == 'project' && objSource == 'uve') {
       obj = $.map(tenantNetworkMonitorUtils.filterVNsNotInCfg(response['value'],fqName), function (currObj, idx) {
           currObj['inBytes'] = jsonPath(currObj, '$..in_bytes')[0];
           currObj['outBytes'] = jsonPath(currObj, '$..out_bytes')[0];
           currObj['project'] = currObj['name'].split(':').slice(0, 2).join(':');
           return currObj;
       });
       var projArr = [], projData = {};
       $.each(obj, function (idx, d) {
           if (!(d['project'] in projData)) {
               projData[d['project']] = {
                   inBytes:0,
                   inThroughput:0,
                   outThroughput:0,
                   outBytes:0,
                   vnCount:0
               }
           }
           projData[d['project']]['inBytes'] += ifNull(jsonPath(d, '$..in_bytes')[0], 0);
           projData[d['project']]['outBytes'] += ifNull(jsonPath(d, '$..out_bytes')[0], 0);
           projData[d['project']]['inThroughput'] += ifNull(jsonPath(d, '$..in_bandwidth_usage')[0], 0);
           projData[d['project']]['outThroughput'] += ifNull(jsonPath(d, '$..out_bandwidth_usage')[0], 0);
           projData[d['project']]['vnCount']++;
       });
       $.each(projData, function (key, obj) {
           $.extend(obj, {name:key});
           projArr.push(obj);
       });
       obj = projArr;
   } else if (objType == 'network') {
       obj = tenantNetworkMonitorUtils.networkParseFn(response);
   } else if (objType == 'instance') {
       obj = tenantNetworkMonitorUtils.instanceParseFn(response);
   } else if (objType == 'port') {
   } else if (objType == 'peer') {
   } else if ($.inArray(objType, ['flow', 'flowdetail']) > -1) {
       obj = $.map(response, function (obj, idx) {
           obj['sourceip'] = long2ip(obj['sourceip']);
           obj['destip'] = long2ip(obj['destip']);
           //obj['protocol'] = formatProtocol(obj['protocol']);
           if (view == 'list') {
               //obj['bytes'] = formatBytes(obj['bytes']);
           }
           obj['name'] = ifNull(obj['sourceip'], obj['destip']);
           obj['name'] += ':' + ifNull(obj['sport'], obj['dport']);
           return obj;
       });
   }
   return obj;
}

function initializeRefreshBtn() {
    $(pageContainer).siblings().filter('.refresh-btn').on('click',function() {
        monitorRefresh($(pageContainer));
    });
}
/*
 * Function is the populate function of the network datasource which fetches networks page by page.
 */
function getVirtualNetworksData(deferredObj,dataSource,dsObj) {
    //Check whether networkDatatSource is available and if not populate, else take it
    //options = ifNull(options,{});
    //var objType = ifNull(options['objType'],'');
    var vnCfilts = ['UveVirtualNetworkAgent:interface_list','UveVirtualNetworkAgent:in_bandwidth_usage','UveVirtualNetworkAgent:out_bandwidth_usage',
                'UveVirtualNetworkAgent:in_bytes','UveVirtualNetworkAgent:out_bytes',//'UveVirtualNetworkAgent:in_stats','UveVirtualNetworkAgent:out_stats',
                'UveVirtualNetworkConfig:connected_networks','UveVirtualNetworkAgent:virtualmachine_list'];
    var obj = {};
    $.when($.ajax({
                url:'/api/tenants/projects/default-domain',
                abortOnNavigate:enableHardRefresh == true ? false : true
            }), $.ajax({
                url:'/api/tenants/config/virtual-networks',
                abortOnNavigate:enableHardRefresh == true ? false : true
            })).done(function(projList,vnList) {
                var kfilts = [],projNamesArr = [],projData = [];
                $.each(ifNull(projList[0]['projects'],[]),function(idx,projObj) {
                    kfilts.push(projObj['fq_name'].join(':') + ':*');
                    projData.push(projObj);
                    projNamesArr.push(projObj['fq_name'].join(':'));
                    //globalObj['dataSources']['projectData'] = projData;
                    if(globalObj['dataSources']['projectDS'] != null)
                        globalObj['dataSources']['projectDS']['data'] = projData;
                    else
                        globalObj['dataSources']['projectDS'] = {data:projData};
                });
                obj['transportCfg'] = { 
                        url:'/api/tenant/networking/virtual-networks/details?count='+NETWORKS_PAGINATION_CNT,
                        type:'POST',
                        data:{data:[{"type":"virtual-network", "cfilt":vnCfilts.join(',')}]}
                    }
                getOutputByPagination(dataSource,{transportCfg:obj['transportCfg'],
                    parseFn:function(response){return networkParseFnForPagination(response,vnList,projData);},loadedDeferredObj:deferredObj},dsObj);
            }).fail(function(errObj,status,errorText) {
                deferredObj.reject({errObj:errObj,status:status,errTxt:errorText});
            });
}

/**
 * Filters the following Networks from the list received from opserver
 * 1. Networks not present in API Server
 * 2. Filter service networks
 */
function networkParseFnForPagination(uveData,configVNList,projData) {
    var configVNs = [],filteredVNs=[],uveVNs = [],configData = [];
    //uveData = uveData[0];
    configVNList = configVNList[0];
    var excludeVNs = ['svc-vn-left','svc-vn-right','svc-vn-mgmt'];
    $.each(configVNList['virtual-networks'],function(idx,obj) {
        configVNs.push(obj['fq_name'].join(':'));
        configData.push(obj);
    });
    if(uveData['value'] != null)
    filteredVNs = $.map(uveData['value'],function(obj,idx) {
        if($.inArray(obj['name'].split(':')[2],excludeVNs) > -1)
            return null;
        //If it's present in Api Server
        var cfgIdx = $.inArray(obj['name'],configVNs);
        if(cfgIdx > -1) {
            obj['uuid'] = configData[cfgIdx]['uuid'];
            uveVNs.push(obj['name']);
            return obj;
        } else
            return null;
    });
    /*$.each(configVNs,function(idx,vnName) {
        if($.inArray(vnName,uveVNs) == -1 && $.inArray(vnName.split(':')[2],excludeVNs) == -1 && vnName != 'default-domain:default-project:ip-fabric') {
            var vnObj = {name:vnName,value:{},uuid:configData[idx]['uuid']};
            filteredVNs.push(vnObj);
        }
    });*/
    return chartsParseFn({objectType:'network',source:'uve'},filteredVNs);
}


/**
 * Compute Projects summary data based on networks data by grouping together the networks in each project
 */
function getProjectData(vnData,project){
    var vnArr = [],obj = {},projArr = [];projData = {},projCfgData = [],projList =ifNull( project['data'],[]);
    var inBytes = 0;outBytes=0;interVNInBytes=0;interVNOutBytes=0;
    var projNamesArr = [];
    $.each(projList,function(idx,projObj) {
        projNamesArr.push(projObj['fq_name'].join(':'));
    });
    $.each(vnData,function(idx,d) {
        obj = {};
        obj['name'] = d['name'];
        obj['uuid'] = d['uuid'];
        obj['project'] = obj['name'].split(':').slice(0,2).join(':');
        obj['intfCnt'] = ifNull(jsonPath(d,'$..interface_list')[0],[]).length;
        obj['vnCnt'] = ifNull(jsonPath(d,'$..connected_networks')[0],[]).length;
        obj['inThroughput'] = ifNull(jsonPath(d,'$..in_bandwidth_usage')[0],0);
        obj['outThroughput'] = ifNull(jsonPath(d,'$..out_bandwidth_usage')[0],0);
        obj['throughput'] = obj['inThroughput'] + obj['outThroughput'];
        obj['x'] = obj['intfCnt'];
        obj['y'] = obj['vnCnt'];
        obj['size'] = obj['throughput']+1;
        obj['type'] = 'network';
        obj['inBytes']  = ifNull(jsonPath(d,'$..in_bytes')[0],0);
        obj['outBytes'] = ifNull(jsonPath(d,'$..out_bytes')[0],0);
        vnArr.push(obj);
    });
    var vnCF = crossfilter(vnArr);
    var projDimension = vnCF.dimension(function(d) { return d.project;});
    var defProjObj = {
                    intfCnt : 0,
                    vnCnt   : 0,
                    throughput:0,
                    inThroughput:0,
                    outThroughput:0,
                    inBytes:0,
                    outBytes:0
                };
    $.each(vnArr,function(idx,d) {
        inBytes += d['inBytes'];
        outBytes += d['outBytes'];
        if(!(d['project'] in projData)) {
            projData[d['project']] = $.extend({},defProjObj);
        }
        //projData[d['project']]['uuid'] = projList[cfgIdx]['uuid'];
        projData[d['project']]['inBytes'] += d['inBytes'];
        projData[d['project']]['outBytes'] += d['outBytes'];
        projData[d['project']]['inThroughput'] += d['inThroughput'];
        projData[d['project']]['outThroughput'] += d['outThroughput'];
        projData[d['project']]['intfCnt'] += d['intfCnt'];
        projData[d['project']]['throughput'] += d['throughput'];
        projData[d['project']]['vnCnt']++;
    });
    $.each(projNamesArr,function(idx,currProjName) {
        if(projData[currProjName] == null) {
            projData[currProjName] = $.extend({},defProjObj);
        }
    });
    $.each(projData,function(key,obj) {
        var cfgIdx = $.inArray(key,projNamesArr);
        $.extend(obj,{type:'project',id:key,name:key,uuid:projList[cfgIdx]['uuid'],size:obj['throughput']+1,x:obj['intfCnt'],y:obj['vnCnt']});
        projArr.push(obj);
    });
    return {projectsData:projArr,networksData:vnArr,aggData:{inBytes:inBytes,outBytes:outBytes}};
}

function getMultiValueStr(arr) {
    var retStr = '';
    var entriesToShow = 2;
    $.each(arr,function(idx,value) {
        if(idx == 0)
            retStr += value; 
        else if(idx < entriesToShow)
            retStr += '<br/>' + value;
        else
            return;
    });
    if(arr.length > 2)
        retStr += '<br/>' + contrail.format('({0} more)',arr.length-entriesToShow);
    return retStr;
}

function getSelInstanceFromDropDown() {
    if($('#dropdownIP').length == 0)
        return {};
    var vmIntfObj = $('#dropdownIP').data('contrailDropdown').getSelectedData()[0];
    return {ip:vmIntfObj['ip_address'],vnName:vmIntfObj['virtual_network']};
}

var connectedNetworkView = new connectedNetworkRenderer();

function connectedNetworkRenderer() {
  this.load = function(cfg) {
      var obj = $.extend({},cfg);
      var data = {stats:{},charts:{},grids:{}};
      pushBreadcrumb([obj['fqName'] + ' <-> ' + obj['srcVN']]);
      layoutHandler.setURLHashParams({fqName:obj['fqName'],srcVN:obj['srcVN']},{p:'mon_net_networks',merge:false,triggerHashChange:false});
      //Show Ingress/Egress Traffic in different colors
      data['stats'] = {
          'list' : [
              { lbl : contrail.format('Ingress/Egress from {0} to {1}',obj['srcVN'].split(':').pop(),obj['fqName'].split(':').pop()),field:'toNetwork'},
              { lbl : contrail.format('Egress/Ingress from {0} to {1}',obj['fqName'].split(':').pop(),obj['srcVN'].split(':').pop()),field:'fromNetwork'}
          ],
          parseFn: function(response) {
              return [{
                  'toNetwork': contrail.format("<span class='in'>{0}</span> <span class='seperator'>/</span>" +
                          " <span class='out'>{1}</span>",formatBytes(response['toNW']['inBytes']),formatBytes(response['toNW']['outBytes'])),
                  'fromNetwork': contrail.format("<span class='out'>{0}</span> <span class='seperator'>/</span>" +
                          " <span class='in'>{1}</span>",formatBytes(response['toNW']['inBytes']),formatBytes(response['toNW']['outBytes']))
                  }]
          }
      }
      template = 'connected-nw-template';
      data['stats']['url'] = constructReqURL($.extend({},obj,{type:'summary'}));
      data['ts-chart'] = {};
      data['ts-chart']['url'] = constructReqURL($.extend({},obj,{widget:'flowseries'}));
      //Render the template
      var summaryTemplate = contrail.getTemplate4Id(template);
      var container = cfg['container'];
      $(container).html(summaryTemplate(obj));
      $(container).initTemplates(data);
  }
}
