/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var UnderlayTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            var callBackExecuted = false;
            this.renderView4Config(self.$el, self.model,
                 getUnderlayTabConfig(viewConfig), null, null, null,
                 function (underlayTabView) {
                    if(!callBackExecuted) {
                        var graphModel = $('#' + ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
                        underlayTabView.listenTo(graphModel.selectedElement, 'change', function (selectedElement) {
                           var nodeType = selectedElement['attributes']['nodeType'];
                           var nodeDetails = selectedElement['attributes']['nodeDetail'];
                           if(nodeType == ctwc.PROUTER) {
                               showPRouterTabs(nodeDetails, underlayTabView);
                           } else if (nodeType == ctwc.VROUTER) {
                               showVRouterTabs(nodeDetails, underlayTabView);
                           } else if (nodeType == ctwc.VIRTUALMACHINE) {
                               showVMTabs(nodeDetails, underlayTabView);
                           } else if (nodeType == ctwc.UNDERLAY_LINK) {
                               showLinkTrafficStatistics(nodeDetails, underlayTabView);
                           }
                        });
                        callBackExecuted = true;
                    }
                 }
            );
        }
    });

    var getUnderlayTabConfig = function (viewConfig) {
        // Underlay default tab config (Search flows & Trace flow)
        var underlayDefaultTabConfig =
            ctwvc.getUnderlayDefaultTabConfig(viewConfig);
        return {
            elementId: ctwc.UNDERLAY_TAB_ID,
            view: "TabsView",
            viewConfig: {
                theme: 'classic',
                disabled: ifNull(
                    viewConfig['tabsToDisable'], []),
                activate: function (e, ui) {
                    activate(e, ui);
                },
                tabs: underlayDefaultTabConfig
            }
        };
    };

    function activate (e, ui) {
        var selTab = $(ui.newTab.context).text();
        if (selTab == ctwl.UNDERLAY_TRACEFLOW_TITLE &&
             $("#" + ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid') != null) {
            $("#" + ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid')
                                                   .refreshView();
        } else if (selTab == ctwl.TITLE_TRAFFIC_STATISTICS) {
            $('#' + ctwl.INSTANCE_TRAFFIC_STATS_ID).
            find('svg').trigger('refresh');
        } else if (selTab == ctwl.TITLE_INTERFACES && $(ui.newPanel).find('.contrail-grid').
                data('contrailGrid') != null) {
            $(ui.newPanel).find('.contrail-grid').
            data('contrailGrid').refreshView();
        } else if (selTab == ctwl.TITLE_CPU_MEMORY &&
                $('#' + ctwl.INSTANCE_CPU_MEM_STATS_ID) != null) {
            $('#' + ctwl.INSTANCE_CPU_MEM_STATS_ID).
            find('svg').trigger('refresh');
        } else if (selTab == ctwl.TITLE_PORT_DISTRIBUTION &&
               $('#' + ctwl.INSTANCE_PORT_DIST_CHART_ID) != null) {
            $('#' + ctwl.INSTANCE_PORT_DIST_CHART_ID).trigger('refresh');
        } else if (selTab == 'Networks' && $("#" + ctwl.VROUTER_NETWORKS_RESULTS).
                data('contrailGrid') != null) {
            $("#" + ctwl.VROUTER_NETWORKS_RESULTS).
            data('contrailGrid').refreshView();
        } else if (selTab == 'ACL' && $('#' + ctwl.VROUTER_ACL_GRID_ID).
                data('contrailGrid') != null) {
            $('#' + ctwl.VROUTER_ACL_GRID_ID).
            data('contrailGrid').refreshView();
        } else if (selTab == 'Flows' && $('#' + ctwl.VROUTER_FLOWS_GRID_ID).
                data('contrailGrid') != null) {
            $('#' + ctwl.VROUTER_FLOWS_GRID_ID).
            data('contrailGrid').refreshView();
        } else if (selTab == 'Routes' && $('#' + ctwl.VROUTER_ROUTES_GRID_ID).
                data('contrailGrid') != null) {
            $('#' + ctwl.VROUTER_ROUTES_GRID_ID).
            data('contrailGrid').refreshView();
        } else if (selTab == 'Instances' && $('#' + ctwl.VROUTER_INSTANCE_GRID_ID).
                data('contrailGrid') != null) {
            $('#' + ctwl.VROUTER_INSTANCE_GRID_ID).
            data('contrailGrid').refreshView();
        }
    }

    function showPRouterTabs (nodeDetails, underlayTabView) {
        var interfaceDetails = [];
        monitorInfraUtils.removeUnderlayTabs(underlayTabView);
        var data = {
            hostName : ifNull(nodeDetails['name'],'-'),
            description: getValueByJsonPath(nodeDetails,
                'more_attributes;lldpLocSysDesc','-'),
            intfCnt   : getValueByJsonPath(nodeDetails,
                'more_attributes;ifTable',[]).length,
            managementIP :
                ifNull(nodeDetails['mgmt_ip'],'-'),
        };
        // Rendering the details tab
        underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].renderNewTab(
            ctwc.UNDERLAY_TAB_ID,
            [monitorInfraUtils.getUnderlayDetailsTabViewConfig({data:data})]);
        for(var i = 0; i < getValueByJsonPath(nodeDetails,
            'more_attributes;ifTable',[]).length; i++ ) {
            var intfObj =
                nodeDetails['more_attributes']['ifTable'][i];
            var rowObj = {
                ifDescr: ifNull(intfObj['ifDescr'],'-'),
                ifIndex: ifNull(intfObj['ifIndex'],'-'),
                ifInOctets: intfObj['ifInOctets'],
                ifOutOctets: intfObj['ifOutOctets'],
                ifPhysAddress:
                    ifNull(intfObj['ifPhysAddress'],'-'),
                raw_json: intfObj
            };
            interfaceDetails.push(rowObj);
        }
        // Rendering the interfaces tab
        underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].renderNewTab(
            ctwc.UNDERLAY_TAB_ID,
            [monitorInfraUtils.getUnderlayPRouterInterfaceTabViewConfig({
                    hostName:data.hostName,
                    data: interfaceDetails
                })]
        );
        $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:2});
    }

    function showVRouterTabs (nodeDetails, underlayTabView) {
        monitorInfraUtils.removeUnderlayTabs(underlayTabView);
        var vRouterParams =
            monitorInfraUtils.getUnderlayVRouterParams(nodeDetails);
        var vRouterTabConfig = ctwvc.getVRouterDetailsPageTabs(vRouterParams);
        underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].renderNewTab(
            ctwc.UNDERLAY_TAB_ID, vRouterTabConfig
        );
        $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:2});
    }

    function showVMTabs (nodeDetails, underlayTabView) {
        var ip = [],vnList = [],intfLen = 0,vmName,
        instDetails = {},inBytes = 0,
        outBytes = 0;
        var instanceUUID = nodeDetails['name'];
        var instanceDetails = nodeDetails;
        var intfList = getValueByJsonPath(instanceDetails,
            'more_attributes;interface_list',[]);
        intfLen = intfList.length;
        vmName =
            instanceDetails['more_attributes']['vm_name'];
        for(var j = 0; j < intfLen; j++) {
            var intfObj = intfList[j];
            ip.push(ifNull(intfObj['ip_address'],'-'));
            vnList.push(
                ifNull(intfObj['virtual_network'],'-'));
            for(var k = 0; k < ifNull(intfObj['floating_ips'],[]).length > 0; k++) {
                var intfObjFip =
                    intfObj['floating_ips'][k];
                ip.push(ifNull(
                      intfObjFip['ip_address'],'-'));
                vnList.push(ifNull(
                    intfObjFip['virtual_network'],'-'));
            }
        }

        var instanceObj = {
            instanceUUID: instanceUUID,
            networkFQN: vnList[0],
        };
        monitorInfraUtils.removeUnderlayTabs(underlayTabView);
        var instanceTabConfig =
            ctwvc.getInstanceDetailPageTabConfig(
                instanceObj);
        var modelMap = {};
        var modelKey =
            ctwc.get(ctwc.UMID_INSTANCE_UVE,
                instanceUUID);
        modelMap[modelKey] =
            ctwvc.getInstanceTabViewModelConfig(
                instanceUUID);
        underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].modelMap = modelMap;
        underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].renderNewTab(
            ctwc.UNDERLAY_TAB_ID, instanceTabConfig, null, modelMap, null
        );
        $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:2});
    }

    function showLinkTrafficStatistics (linkDetails, underlayTabView) {
        monitorInfraUtils.removeUnderlayTabs(underlayTabView);
        var viewConfig = {
            elementId:
                ctwc.UNDERLAY_TRAFFICSTATS_TAB_ID,
            title: 'Traffic Statistics',
            view: 'TrafficStatisticsView',
            viewPathPrefix:
                ctwl.UNDERLAY_VIEWPATH_PREFIX,
            viewConfig: {
                linkAttributes: linkDetails
            },
            tabConfig: {
                activate: function (event, ui){
                    if($("#"+ ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid') != null) {
                        $("#"+ ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid').refreshView();
                    }
                },
                renderOnActivate: true
            }
        };
        // Rendering the traffic statistics tab
        underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].renderNewTab(
                ctwc.UNDERLAY_TAB_ID, [viewConfig]);
        $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:2});
    }

    return UnderlayTabView;
});
