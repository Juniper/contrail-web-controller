/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var noDataStr = monitorInfraConstants.noDataStr;
    var ControlNodesDetailPageView = ContrailView.extend({

        el: $(contentContainer),

        render: function () {
            var self = this;
            var detailsTemplate = contrail.getTemplate4Id(
                    cowc.TMPL_2COLUMN_1ROW_2ROW_CONTENT_VIEW);
            var viewConfig = this.attributes.viewConfig;
            var leftContainerElement = $('#left-column-container');
            var hostname = viewConfig['hostname'];

            this.$el.html(detailsTemplate);

            monitorInfraUtils.doAjaxCallsForNodeDetails ({
                ajaxConfigList:[
                    {
                        ajaxConfig: {
                            url: contrail.format(
                                    monitorInfraConstants.
                                        monitorInfraUrls['CONTROLNODE_DETAILS'],
                                    hostname),
                            type: 'GET'
                        },
                        dataParser: dataParser,
                        callBack:function(parsedData,viewConfig){
                            self.renderView4Config($('#left-column-container'), null,
                                    getControlNodeDetailPageViewConfig(viewConfig,parsedData));
                        }
                    }
                ],
                viewConfig:viewConfig
            });
            self.renderView4Config($('#right-column-container'), null,
                    getControlNodeDetailChartViewConfig(viewConfig));
        }
    });

    function getControlNodeDetailChartViewConfig (viewConfig) {
        return {
            elementId: 'controlnode_detail_charts_id',
            title: ctwl.TITLE_DETAILS,
            view: "ControlNodeDetailsChartsView",
            viewPathPrefix : ctwl.CONTROLNODE_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: viewConfig
        }
    }

    var getControlNodeDetailPageViewConfig = function (viewConfig,data) {
        var hostname = viewConfig['hostname'];
        return {
            elementId: ctwl.CONTROLNODE_DETAIL_PAGE_ID,
            title: ctwl.TITLE_DETAILS,
            view: "DetailsView",
            viewConfig: {
                data: data,
                templateConfig: getDetailsViewTemplateConfig(),
                app: cowc.APP_CONTRAIL_CONTROLLER,
            }
        }
    }

    function getControlNodeIpAddressList(data){
        var ips = getValueByJsonPath(data,'$..bgp_router_ip_list',[]);
        var configip = jsonPath(data,'$..ConfigData..bgp_router_parameters.address')[0];
        var ipList = [];
        if(ips.length > 0){
           $.each(ips,function(idx,obj){
              if(obj != null && ipList.indexOf(obj) == -1){
                 ipList.push({
                     ip: obj
                 });
              }
           });
        }
        if(configip != null && ipList.indexOf(configip) == -1){
            var configHostname = getValueByJsonPath(data, 'derived-uve;ConfigData;bgp-router;name');
            ipList.push({
               ip: configip,
               hostname: configHostname
           });
        }
        return ipList;
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
                                title: 'Control Node',
                                theme: 'widget-box',
                                keyClass: 'label-blue',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorData: 'rawData',
                                templateGeneratorConfig: getTemplateGeneratorConfig()
                            }
                        ]
                    }
                ]
            }
        };
    };

    function getTemplateGeneratorConfig () {
        var templateGeneratorConfig = [];
        templateGeneratorConfig = templateGeneratorConfig.concat([
            {
                key: 'name',
                label:'Hostname',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'ips',
                label:'IP Address',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'version',
                label: 'Version',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'overallNodeStatus',
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
                            key: 'controlProcessStatusList.contrail-control',
                            label: 'Control Node',
                            keyClass: 'indent-right',
                            templateGenerator: 'TextGenerator'
                        }
                    ]
                        : []
        );
        templateGeneratorConfig = templateGeneratorConfig.concat([
            {
                key: 'ifMapConnectionStatus',
                label: 'Ifmap Connection',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'analyticsNodeDetails',
                label: 'Analytics Node',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'analyticsMessages',
                label: 'Analytics Messages',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'peersDetails',
                label: 'Peers',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'vRouterPeerDetails',
                label: ' ',
                templateGenerator: 'TextGenerator'
            },
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
                key: 'lastLogTimestamp',
                label: 'Last Log',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'cores',
                label: 'Core File(s)',
                templateGenerator: 'TextGenerator'
            }
        ]);
        return templateGeneratorConfig;
    }

    function getStatusesForAllControlProcesses(processStateList) {
        var ret = [];
        if (processStateList != null) {
            for ( var i = 0; i < processStateList.length; i++) {
                var currProc = processStateList[i];
                if (currProc.process_name == "contrail-control-nodemgr") {
                    ret['contrail-control-nodemgr'] = monitorInfraUtils
                            .getProcessUpTime(currProc);
                } else if (currProc.process_name == "contrail-control") {
                    ret['contrail-control'] = monitorInfraUtils
                            .getProcessUpTime(currProc);
                }
            }
        }
        return ret;
    }

    //Derive the IFmap connection status from the parsed data
    function getIfMapConnectionStatus(ctrlNodeData) {
        var cnfNode = '';
        var noDataStr = monitorInfraConstants.noDataStr;
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
            var status = ctrlNodeData.BgpRouterState.
                ifmap_info.connection_status;
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
        var noDataStr = monitorInfraConstants.noDataStr;
        var anlNode = noDataStr;
        var secondaryAnlNode, status;
        try{
           anlNode = jsonPath(ctrlNodeData,
                   "$..ModuleClientState..collector_ip")[0].split(':')[0];
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
        if(secondaryAnlNode != null && secondaryAnlNode != ""
            && secondaryAnlNode != "0.0.0.0"){
           anlNode = anlNode.concat(', ' + secondaryAnlNode);
        }
        return ifNull(anlNode,noDataStr);
    }

    function getAnalyticsNodeMessageInfo(ctrlNodeData) {
        var msgs = monitorInfraUtils.getAnalyticsMessagesCountAndSize(
                ctrlNodeData['derived-uve'],
                ['contrail-control']);
        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
    }

    function getPeersDetails(parsedData) {
        var totpeers= 0,uppeers=0;
        totpeers= ifNull(parsedData['totalBgpPeerCnt'],0);
        uppeers = ifNull(parsedData['upBgpPeerCnt'],0);
        var downpeers = 0;
        if(totpeers > 0){
            downpeers = totpeers - uppeers;
        }
        if (downpeers > 0){
            downpeers = ", <span class='text-error'>"+ downpeers +
                " Down</span>";
        } else {
            downpeers = "";
        }
        return contrail.format('BGP Peers: {0} Total {1}',totpeers,downpeers);
    }

    function getVRouterPeersDetails(ctrlNodeData,parsedData) {
        var totXmppPeers = 0,upXmppPeers = 0,downXmppPeers = 0,subsCnt = 0;
        totXmppPeers = parsedData['totalXMPPPeerCnt'];
        upXmppPeers = parsedData['upXMPPPeerCnt'];
        subsCnt = ifNull(jsonPath(ctrlNodeData,
                '$..BgpRouterState.ifmap_server_info.num_peer_clients')[0],
                0);
        if(totXmppPeers > 0){
            downXmppPeers = totXmppPeers - upXmppPeers;
        }
        if (downXmppPeers > 0){
            downXmppPeers = ", <span class='text-error'>"+ downXmppPeers
            +" Down</span>";
        } else {
            downXmppPeers = "";
        }
        if (subsCnt > 0){
            subsCnt = ", "+ subsCnt +" subscribed for configuration";
        } else {
            subsCnt = ""
        }
        return contrail.format('vRouters: {0} Established in Sync{1}{2} ',
                upXmppPeers,downXmppPeers,subsCnt);
    }

    function getLastLogTime(ctrlNodeData) {
        var lmsg;
        lmsg = monitorInfraUtils.getLastLogTimestamp(ctrlNodeData['derived-uve'],"control");
        if(lmsg != null){
           try{
              return new Date(parseInt(lmsg)/1000).toLocaleString();
           }catch(e){return noDataStr;}
        } else return noDataStr;
    }

    function dataParser (result,viewConfig) {
        var hostname = viewConfig['hostname'];
        var ctrlNodeData = result;
        var obj = monitorInfraParsers.
            parseControlNodesDashboardData([{
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
            procStateList = jsonPath(ctrlNodeData,
                    "$..NodeStatus.process_info")[0];
            var controlProcessStatusList =
                getStatusesForAllControlProcesses(procStateList);
            obj['controlProcessStatusList'] =
                    controlProcessStatusList;
        }catch(e){}

        obj['name'] = hostname;

        obj['ips'] = monitorInfraUtils.getControlIpAddresses(
                            ctrlNodeData,'details');

        obj['overallNodeStatus'] = overallStatus;

        //dummy entry to show empty value in details
        obj['processes'] = '&nbsp;';

        obj['ifMapConnectionStatus'] =
                getIfMapConnectionStatus(ctrlNodeData);

        obj['analyticsNodeDetails'] =
                getAnalyticsNodeDetails(ctrlNodeData);

        obj['analyticsMessages'] =
                getAnalyticsNodeMessageInfo(ctrlNodeData);

        obj['peersDetails'] =
                getPeersDetails(obj);

        obj['vRouterPeerDetails'] =
                getVRouterPeersDetails(ctrlNodeData,obj);

        obj['cpu'] = monitorInfraParsers.getCpuText(obj['cpu'],'--');

        obj['lastLogTimestamp'] =
                getLastLogTime(ctrlNodeData);

        var ipList = getControlNodeIpAddressList(ctrlNodeData);
        monitorInfraUtils.createMonInfraDetailsFooterLinks (
                $('#left-column-container').parent(), ipList, 
                monitorInfraConstants.ControlNodeIntrospectPort);

        return obj;

    }

    return ControlNodesDetailPageView;
});
