/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Details tab
 */
monitorInfraComputeDetailsClass = (function() {
    this.populateDetailsTab = function (obj) {
        var nodeIp; 
        layoutHandler.setURLHashParams({tab:'',node: obj['name']},{triggerHashChange:false});
        //showProgressMask('#computenode-dashboard', true);
        startWidgetLoading('vrouter-sparklines');
        toggleWidgetsVisibility(['vrouter-chart-box'], ['system-chart-box']);

        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#computenode-dashboard').html(dashboardTemplate({title:'vRouter',colCount:2,showSettings:true, widgetBoxId:'dashboard'}));
        startWidgetLoading('dashboard');   

        $.ajax({
            url: contrail.format(monitorInfraUrls['VROUTER_DETAILS'], obj['name'])
        }).done(function (result) {
                    computeNodeData = result;
                    var parsedData = infraMonitorUtils.parsevRoutersDashboardData([{name:obj['name'],value:result}])[0];
                    var noDataStr = '--',
                    cpu = "N/A",
                    memory = "N/A",
                    computeNodeDashboardInfo, oneMinCPU, fiveMinCPU, fifteenMinCPU,
                    usedMemory, totalMemory;
                // var chartWidths3 = $('#vrouter-detail-charts').width();
                //var cwd1 = (parseInt(chartWidths3));
                //var cwd = cwd1/3;
                var parentWidth = parseInt($('#computenode-dashboard').width());
                var chartWdth = parentWidth/2;
                var endTime, startTime;
                $.ajax({
                    url: '/api/service/networking/web-server-info'
                }).done(function (resultJSON) {
                    endTime = resultJSON['serverUTCTime'];
                }).fail(function() {
                    endTime = getCurrentTime4MemCPUCharts();
                }).always(function() {
                    var slConfig;
                    startTime = endTime - 600000;
                    slConfig = {startTime: startTime, endTime: endTime};
                    $('#vrouter-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'VrouterStatsAgent':[{name: 'cpu_share', color: 'blue-sparkline'}, {name: 'virt_mem', color: 'green-sparkline'}]}, slConfig);
                    $('#system-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'VrouterStatsAgent':[{name: 'one_min_avg_cpuload', color: 'blue-sparkline'}, {name: 'used_sys_mem', color: 'green-sparkline'}]}, slConfig);
                    endWidgetLoading('vrouter-sparklines');
                    $('#vrouter-chart').initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'vRouterAgent', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: true, showWidgetIds: ['vrouter-chart-box'], hideWidgetIds: ['system-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}), 110);
                    $('#system-chart').initMemCPULineChart($.extend({url:function() {
                        return  contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'vRouterAgent', '30', '10', obj['name'], endTime);
                    }, parser: "parseSystemMemCPUData", plotOnLoad: false, showWidgetIds: ['system-chart-box'], hideWidgetIds: ['vrouter-chart-box'], titles: {memTitle:'Memory',cpuTitle:'Avg CPU Load'}}),110);
                });
                var procStateList, overallStatus = noDataStr;
                var vRouterProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                computeNodeDashboardInfo = getvRouterDetailsLblValuePairs(parsedData);
                var cores=getCores(computeNodeData);
                for(var i=0;i<cores.length;i++)
                    computeNodeDashboardInfo.push(cores[i]);
                //showProgressMask('#computenode-dashboard');
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#computenode-dashboard .widget-body').html(dashboardBodyTemplate({colCount:2, d:computeNodeDashboardInfo, nodeData:computeNodeData, showSettings:true, ip:nodeIp}));
                /*Selenium Testing*/
                cmptNodeDetailsData = computeNodeDashboardInfo;
                /*End of Selenium Testing*/
                var ipList = getVrouterIpAddressList(computeNodeData);
                var ipDeferredObj = $.Deferred();
                getReachableIp(ipList,"8085",ipDeferredObj);
                ipDeferredObj.done(function(nodeIp){
                    if(nodeIp != null && nodeIp != noDataStr) {  
                        $('#linkIntrospect').unbind('click');
                        $('#linkIntrospect').click(function(){
                            window.open('/proxy?proxyURL=http://'+nodeIp+':8085&indexPage', '_blank');
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
                initWidget4Id('#dashboard-box');
                initWidget4Id('#vrouter-chart-box');
                initWidget4Id('#system-chart-box');

                endWidgetLoading('dashboard');
            }).fail(displayAjaxError.bind(null, $('#computenode-dashboard')));
    };
    return {populateDetailsTab:populateDetailsTab};
})();

function getVrouterIpAddressList(data){
    var controlIp = getValueByJsonPath(data,'VrouterAgent;control_ip',noDataStr);
    var ips = getValueByJsonPath(data,'VrouterAgent;self_ip_list',[]);
    var configip = getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address');
    var ipList = [];
    if(controlIp != noDataStr){
        ipList.push(controlIp);
    }
    if(ips.length > 0){
        $.each(ips,function(idx,obj){
            if(obj != null && ipList.indexOf(obj) == -1){
                ipList.push(obj);
            }
        });
    }
    if(configip != null && ipList.indexOf(configip) == -1){
        ipList.push(configip);
    }
    return ipList;
}