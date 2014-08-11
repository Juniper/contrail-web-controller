/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Control Node Details tab
 */
monitorInfraControlDetailsClass = (function() {
    this.populateDetailsTab = function(obj) {
        var endTime = getCurrentTime4MemCPUCharts(), startTime = endTime - 600000;
        var slConfig = {startTime: startTime, endTime: endTime};
        var nodeIp;
        //Compute the label/value pairs to be displayed in dashboard pane
        //As details tab is the default tab,don't update the tab state in URL
        layoutHandler.setURLHashParams({tab:'', node: obj['name']},{triggerHashChange:false});
        //showProgressMask('#controlnode-dashboard', true);
        startWidgetLoading('control-sparklines');
        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#controlnode-dashboard').html(dashboardTemplate({title:'Control Node',colCount:2, showSettings:true, widgetBoxId:'dashboard'}));
        startWidgetLoading('dashboard');   
        $.ajax({
            url: contrail.format(monitorInfraUrls['CONTROLNODE_DETAILS'], obj['name'])
        }).done(function (result) {
                ctrlNodeData = result;
                var parsedData = infraMonitorUtils.parseControlNodesDashboardData([{name:obj['name'],value:result}])[0];
                var noDataStr = "--";
                var cpu = "N/A", memory = "N/A", ctrlNodeDashboardInfo;
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
                    $('#control-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'BgpRouterState': [
                        {name: 'cpu_share', color: 'blue-sparkline'},
                        {name: 'virt_mem', color: 'green-sparkline'}
                    ]}, slConfig);
                    endWidgetLoading('control-sparklines');
                    $('#control-chart').initMemCPULineChart($.extend({url:function() {
                        return  contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'ControlNode', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: true, showWidgetIds: [], hideWidgetIds: [], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                });
                
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
               
                ctrlNodeDashboardInfo = getControlNodeDetailsLblValuePairs(parsedData);
                
                /*Selenium Testing*/
                ctrlNodeDetailsData = ctrlNodeDashboardInfo;
                /*End of Selenium Testing*/
                var cores=getCores(ctrlNodeData);
                for(var i=0;i<cores.length;i++)
                  ctrlNodeDashboardInfo.push(cores[i]);
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#dashboard-box .widget-body').html(dashboardBodyTemplate({colCount:2, d:ctrlNodeDashboardInfo, nodeData:ctrlNodeData, showSettings:true, ip:nodeIp}));
                var ipList = getControlNodeIpAddressList(ctrlNodeData);
                var ipDeferredObj = $.Deferred();
               getReachableIp(ipList,"8083",ipDeferredObj);
               ipDeferredObj.done(function(nodeIp){
                   if(nodeIp != null && nodeIp != noDataStr) {
                     $('#linkIntrospect').unbind('click');
                       $('#linkIntrospect').click(function(){
                           window.open('/proxy?proxyURL=http://'+nodeIp+':8083&indexPage', '_blank');
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
                initWidget4Id('#control-chart-box');
            }).fail(displayAjaxError.bind(null, $('#controlnode-dashboard')));
    }
    return {populateDetailsTab:populateDetailsTab}
})();

function getControlNodeIpAddressList(data){
   var ips = getValueByJsonPath(data,'$..bgp_router_ip_list',[]);
   var configip = jsonPath(data,'$..ConfigData..bgp_router_parameters.address')[0];
   var ipList = [];
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