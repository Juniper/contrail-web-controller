/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    "core-constants"
], function (_, ContrailView, cowc) {
    var noDataStr = monitorInfraConstants.noDataStr;
    var AnalyticsNodesDetailPageView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            var detailsTemplate = contrail.getTemplate4Id(
                    cowc.TMPL_2COLUMN_1ROW_2ROW_CONTENT_VIEW);
            var viewConfig = this.attributes.viewConfig;
            var leftContainerElement = $('#left-column-container');
            this.$el.html(detailsTemplate);

            self.renderView4Config($('#left-column-container'), null,
                    getAnalyticsNodeDetailPageViewConfig(viewConfig));
            self.renderView4Config($('#right-column-container'), null,
                    getAnalyticsNodeDetailChartViewConfig(viewConfig));
        }
    });
    var getAnalyticsNodeDetailPageViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];
        return {
            elementId: ctwl.ANALYTICSNODE_DETAIL_PAGE_ID,
            title: ctwl.TITLE_DETAILS,
            view: "DetailsView",
            viewConfig: {
                ajaxConfig: {
                    url: contrail.format(
                            monitorInfraConstants.
                            monitorInfraUrls['ANALYTICS_DETAILS'], hostname),
                    type: 'GET'
                },
                templateConfig: getDetailsViewTemplateConfig(),
                app: cowc.APP_CONTRAIL_CONTROLLER,
                dataParser: function (result) {
                    var analyticsNodeData = result;
                    var nodeIp;
                    var obj = monitorInfraParsers.
                    parseAnalyticsNodesDashboardData([{
                        name: monitorInfraUtils.getIPOrHostName(viewConfig),
                        value: result
                    }])[0];
                    //Further parsing required for Details page done below

                    var overallStatus;
                    try{
                        overallStatus = monitorInfraUtils.
                            getOverallNodeStatusForDetails(obj);
                    }catch(e){
                        overallStatus = "<span> "+ statusTemplate({color:'red',
                            colorSevMap:cowc.COLOR_SEVERITY_MAP})+" Down</span>";
                    }

                    try{
                        //Add the process status list with uptime
                        var procStateList = jsonPath(analyticsNodeData,
                                "$..NodeStatus.process_info")[0];
                        obj['analyticsProcessStatusList'] =
                            getStatusesForAllAnalyticsProcesses(procStateList);
                    }catch(e){}

                    obj['name'] = hostname;

                    obj['ip'] = getIPAddress(analyticsNodeData);

                    obj['overallStatus'] = overallStatus;

                    //dummy entry to show empty value in details
                    obj['processes'] = '&nbsp;';

                    obj['cpu'] = monitorInfraParsers.getCpuText(obj['cpu'],'--');

                    obj['analyticsMessages'] = getAnalyticsMessages(
                                                        analyticsNodeData);

                    obj['generators'] = getGenerators(analyticsNodeData);

                    obj['lastLogTimestamp'] = getLastLogTime(analyticsNodeData);

                    monitorInfraUtils.createNodeDetailsFooterLinks ({
                        parent : $('#left-column-container').parent(),
                        ipList : obj['ip'].split(','),
                        introspectPort : monitorInfraConstants.OpServerIntrospectPort,
                        featurePort : monitorInfraConstants.OpServerPort,
                        linkLabel : 'OpServer',
                        type : 'OpServer'
                    });
                    return obj;
                }
            }
        }
    }

    function getAnalyticsNodeDetailChartViewConfig (viewConfig) {
        return {
            elementId: 'analytics_detail_charts_id',
            title: ctwl.TITLE_DETAILS,
            view: "AnalyticsNodeDetailsChartsView",
            viewPathPrefix : ctwl.ANALYTICSNODE_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: viewConfig
        }
    }

    function getDetailsViewTemplateConfig() {
        return {
            advancedViewOptions: false,
            templateGenerator: 'ColumnSectionTemplateGenerator',
            templateGeneratorConfig: {
                columns: [
                    {
                        class: 'col-xs-12',
                        rows: [
                            {
                                title: 'Analytics Node',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorData: 'rawData',
                                theme: 'widget-box',
                                keyClass: 'label-blue',
                                templateGeneratorConfig: getTemplateGeneratorConfig()
                            }
                        ]
                    }
                 ]
            }
        };
    };

    function getTemplateGeneratorConfig() {
        var templateGeneratorConfig = [];
        templateGeneratorConfig = templateGeneratorConfig.concat([
                {
                    key: 'name',
                    label:'Hostname',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'ip',
                    label:'IP Address',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'version',
                    label: 'Version',
                    templateGenerator: 'TextGenerator'
                },
                {
                    key: 'overallStatus',
                    label: 'Overall Node Status',
                    templateGenerator: 'TextGenerator'
                }
        ]);
        //Add proccesses info only if the node manager is installed
        templateGeneratorConfig = templateGeneratorConfig.concat(
            (monitorInfraConstants.IS_NODE_MANAGER_INSTALLED)?
                    [
                         {
                             key: 'processes',
                             label: 'Processes',
                             templateGenerator: 'TextGenerator'
                         },
                         {
                             key: 'analyticsProcessStatusList.' +
                                 cowc.UVEModuleIds['COLLECTOR'],
                             label: 'Collector',
                             keyClass: 'indent-right',
                             templateGenerator: 'TextGenerator'
                         },
                         {
                             key: 'analyticsProcessStatusList.' +
                                 cowc.UVEModuleIds['QUERYENGINE'],
                             label: 'Query Engine',
                             keyClass: 'indent-right',
                             templateGenerator: 'TextGenerator'
                         },
                         {
                             key: 'analyticsProcessStatusList.' +
                                 cowc.UVEModuleIds['APISERVER'],
                             label: 'OpServer',
                             keyClass: 'indent-right',
                             templateGenerator: 'TextGenerator'
                         }
                    ]
                    : []
        );

        templateGeneratorConfig = templateGeneratorConfig.concat(
                [
                    {
                        key: 'cpu',
                        label: ctwl.TITLE_CPU,
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'memory',
                        label: 'Memory',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'analyticsMessages',
                        label: 'Messages',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'generators',
                        label: 'Generators',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'lastLogTimestamp',
                        label: 'Last Log',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'cores',
                        label: 'Core File(s)',
                        templateGenerator: 'TextGenerator'
                    }
                ]
        );
        return templateGeneratorConfig;
    }

    function getIPAddress(aNodeData) {
        var ips = '';
        iplist = getValueByJsonPath(aNodeData,"CollectorState;self_ip_list",[]);
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
    }

    function getAnalyticsMessages(aNodeData) {
        var msgs = monitorInfraUtils.getAnalyticsMessagesCountAndSize(
                                            aNodeData['derived-uve'],
                                            ['contrail-collector']);
        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
    }

    function getStatusesForAllAnalyticsProcesses(processStateList){
        var ret = {};
        if(processStateList != null){
            for(var i=0; i < processStateList.length; i++){
                var currProc = processStateList[i];
                if (currProc.process_name == "contrail-query-engine"){
                    ret[cowc.UVEModuleIds['QUERYENGINE']]
                                                = monitorInfraUtils.
                                                    getProcessUpTime(currProc);
                }  else if (currProc.process_name ==
                                "contrail-analytics-nodemgr"){
                    ret[cowc.UVEModuleIds['ANALYTICS_NODEMGR']]
                                                = monitorInfraUtils.
                                                    getProcessUpTime(currProc);
                }  else if (currProc.process_name == "contrail-analytics-api"){
                    ret[cowc.UVEModuleIds['APISERVER']]
                                                = monitorInfraUtils.
                                                    getProcessUpTime(currProc);
                } else if (currProc.process_name == "contrail-collector"){
                    ret[cowc.UVEModuleIds['COLLECTOR']]
                                                = monitorInfraUtils.
                                                    getProcessUpTime(currProc);
                }
            }
        }
        return ret;
    }

    //Derive the IFmap connection status from the parsed data
    function getIfMapConnectionStatus(ctrlNodeData) {
        var cnfNode = '';
        try {
            var url = ctrlNodeData.BgpRouterState.ifmap_info.url;
            if (url != null && url != undefined && url != "") {
                var pos = url.indexOf(':8443');
                if (pos != -1)
                    cnfNode = url.substr(0, pos);
                pos = cnfNode.indexOf('https://');
                if (pos != -1)
                    cnfNode = cnfNode.slice(pos + 8);
            }
            var status = ctrlNodeData.BgpRouterState.ifmap_info.connection_status;
            var stateChangeAtTime = ctrlNodeData.BgpRouterState.
                                        ifmap_info.connection_status_change_at;
            var stateChangeSince = "";
            var statusString = "";
            if (stateChangeAtTime != null) {
                var stateChangeAtTime = new XDate(
                        stateChangeAtTime / 1000);
                var currTime = new XDate();
                stateChangeSince = diffDates(stateChangeAtTime,
                        currTime);
            }
            if (status != null && status != undefined && status != "") {
                if (stateChangeSince != "") {
                    if (status.toLowerCase() == "up"
                            || status.toLowerCase() == "down") {
                        status = status + " since";
                    }
                    statusString = status + " " + stateChangeSince;
                } else {
                    statusString = status;
                }
            }
            if (statusString != "") {
                cnfNode = cnfNode.concat(' (' + statusString + ')');
            }
        } catch (e) {
        }
        return ifNull(cnfNode, noDataStr);
    }

    //Derive the ip and status of Analytics Node this is connecting to
    function getAnalyticsNodeDetails(ctrlNodeData) {
        var anlNode = noDataStr;
        var secondaryAnlNode, status;
        try{
           anlNode = jsonPath(
                   ctrlNodeData,"$..ModuleClientState..primary")[0].
                       split(':')[0];
           status = jsonPath(ctrlNodeData,"$..ModuleClientState..status")[0];
           secondaryAnlNode = ifNull(jsonPath(ctrlNodeData,
                   "$..ModuleClientState..secondary")[0],"").split(':')[0];
        }catch(e){
           anlNode = "--";
        }
        try{
           if(anlNode != null && anlNode != noDataStr &&
                   status.toLowerCase() == "established")
              anlNode = anlNode.concat(' (Up)');
        }catch(e){
           if(anlNode != null && anlNode != noDataStr) {
              anlNode = anlNode.concat(' (Down)');
           }
        }
        if(secondaryAnlNode != null && secondaryAnlNode != "" &&
                secondaryAnlNode != "0.0.0.0"){
           anlNode = anlNode.concat(', ' + secondaryAnlNode);
        }
        return ifNull(anlNode,noDataStr);
    }

    function getAnalyticsNodeMessageInfo(ctrlNodeData) {
        var msgs = monitorInfraUtils.getAnalyticsMessagesCountAndSize(
                ctrlNodeData,['contrail-control']);
        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
    }

    function getGenerators(aNodeData) {
        var ret='';
        var genno;
        try{
            if(aNodeData.CollectorState["generator_infos"]!=null){
                genno = aNodeData.CollectorState["generator_infos"].length;
            };
            ret = ret + ifNull(genno,noDataStr);
        }catch(e){ return noDataStr;}
        return ret;
    }

    function getLastLogTime(aNodeData) {
        var lmsg;
        lmsg = monitorInfraUtils.getLastLogTimestamp(aNodeData['derived-uve'],
                "analytics");
        if(lmsg != null){
            try{
                return new Date(parseInt(lmsg)/1000).toLocaleString();
            }catch(e){return noDataStr;}
        } else return noDataStr;
        }

    return AnalyticsNodesDetailPageView;
});
