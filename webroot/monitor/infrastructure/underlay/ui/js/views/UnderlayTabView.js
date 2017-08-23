/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'monitor/infrastructure/underlay/ui/js/underlay.utils'
], function (_, ContrailView, underlayUtils) {
    var UnderlayTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                callbackExecuted = false;
            this.renderView4Config(self.$el, self.model,
                 getUnderlayTabConfig(viewConfig), null, null, null,
                 function (underlayTabView) {
                    if(!callbackExecuted) {
                        self.listenToGraphModel(underlayTabView, viewConfig);
                        callbackExecuted = true;
                    }
                 }
            );
        },
        listenToGraphModel : function (underlayTabView, viewConfig) {
            var _this = this;
            graphModel = viewConfig.model;
            if(graphModel != null) {
                viewConfig.model.selectedElement().model().off('change:nodeType');
                viewConfig.model.selectedElement().model().on(
                    'change:nodeType', function (selectedElement) {
                   var nodeType = selectedElement['attributes']['nodeType'];
                   var nodeDetails = selectedElement['attributes']['nodeDetail'];
                   if(nodeType == ctwc.PROUTER) {
                       showPRouterTabs(nodeDetails, underlayTabView);
                   } else if (nodeType == ctwc.VROUTER) {
                     $("input[name='traceflow_radiobtn_name'][value='vRouter']").prop("checked", true);
                     $("input[name='traceflow_radiobtn_name'][value='vRouter']").trigger('click');
                     $("#vrouter_dropdown_name_dropdown").val(nodeDetails.label).trigger('change');
                       showVRouterTabs(nodeDetails, underlayTabView);
                   } else if (nodeType == ctwc.VIRTUALMACHINE) {
                     $("input[name='traceflow_radiobtn_name'][value='instance']").prop("checked", true);
                     $("input[name='traceflow_radiobtn_name'][value='instance']").trigger('click');
                     $("#instance_dropdown_name_dropdown").val(nodeDetails.name).trigger('change');
                       showVMTabs(nodeDetails, underlayTabView);
                   } else if (nodeType == ctwc.BARE_METAL_SERVER) {
                       showBMSTabs(nodeDetails, underlayTabView);
                   }else if (nodeType == ctwc.UNDERLAY_LINK) {
                       showLinkTrafficStatistics(nodeDetails, underlayTabView);
                   }
                });
            }
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
        if (selTab != null) {
            selTab = selTab.trim();
        }
        if (selTab == ctwl.UNDERLAY_SEARCHFLOW_TITLE &&
            $('#' + ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + "-results").data('contrailGrid') != null) {
            $('#' + ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + "-results").data('contrailGrid').refreshView();
        } else if (selTab == ctwl.UNDERLAY_TRACEFLOW_TITLE &&
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
      $("#"+ctwc.UNDERLAY_TAB_ID).tabs().show();
        var interfaceDetails = [];
        var deferredObj = $.Deferred();
        underlayUtils.removeUnderlayTabs(underlayTabView, deferredObj);
        deferredObj.always(function (resetLoading) {
        var data = {
            hostName : ifNull(nodeDetails['name'],'-'),
            description: getValueByJsonPath(nodeDetails,
                'more_attributes;lldpLocSysDesc','-'),
            intfCnt   : getValueByJsonPath(nodeDetails,
                'more_attributes;ifTable',[]).length,
            managementIP :
                ifNull(nodeDetails['mgmt_ip'],'-'),
        };
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

        // Rendering the details, interfaces tab
        underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].renderNewTab(
            ctwc.UNDERLAY_TAB_ID,
            [underlayUtils.getUnderlayDetailsTabViewConfig({data:data}),
            underlayUtils.getUnderlayPRouterInterfaceTabViewConfig({
                    hostName:data.hostName,
                    data: interfaceDetails
                })
            ], null, null, function() {
                // onAllViewsRenderComplete callback is executed when
                // all the tabs are rendered hence interface click
                // handler is bind in the interface tabs callback
                $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:2});
                $("#details .intfCnt").click(function (e) {
                    e.preventDefault();
                    $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:3});
                })

            });
        });
    }

    function showVRouterTabs (nodeDetails, underlayTabView) {
        $("#"+ctwc.UNDERLAY_TAB_ID).tabs().show();
        var deferredObj = $.Deferred();
        underlayUtils.removeUnderlayTabs(underlayTabView, deferredObj);
        deferredObj.always(function(resetLoading){
        var vRouterParams =
            monitorInfraParsers.parseVRouterDetails(nodeDetails['more_attributes']);
        vRouterParams['hostname'] = nodeDetails['name'];
        vRouterParams['isUnderlayPage'] = true;
        var vRouterTabConfig = ctwvc.getVRouterDetailsPageTabs(vRouterParams);
        underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].renderNewTab(
            ctwc.UNDERLAY_TAB_ID, vRouterTabConfig, null, null, function(){
                $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:2});
            }
        );
        //$("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:2});
        })
    }

    function showVMTabs (nodeDetails, underlayTabView) {
        $("#"+ctwc.UNDERLAY_TAB_ID).tabs().show();
        var deferredObj = $.Deferred();
        underlayUtils.removeUnderlayTabs(underlayTabView, deferredObj);
        deferredObj.always(function(resetLoading){
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
            ctwc.UNDERLAY_TAB_ID, instanceTabConfig, null, modelMap, function(){
                $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:2});
            }
        );
        });
    }
    function showBMSTabs(linkDetails, underlayTabView) {
          $("#"+ctwc.UNDERLAY_TAB_ID).tabs().hide();
    }
    function showLinkTrafficStatistics (linkDetails, underlayTabView) {
      $("#"+ctwc.UNDERLAY_TAB_ID).tabs().show();
        var deferredObj = $.Deferred();
        underlayUtils.removeUnderlayTabs(underlayTabView, deferredObj);
        deferredObj.always(function(resetLoading){
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
                renderOnActivate: false
            }
        };
        // Rendering the traffic statistics tab
        underlayTabView.childViewMap[ctwc.UNDERLAY_TAB_ID].renderNewTab(
                ctwc.UNDERLAY_TAB_ID, [viewConfig], null, null, function(){
                    $("#"+ctwc.UNDERLAY_TAB_ID).tabs({active:2});
                });
        })
    }

    return UnderlayTabView;
});
