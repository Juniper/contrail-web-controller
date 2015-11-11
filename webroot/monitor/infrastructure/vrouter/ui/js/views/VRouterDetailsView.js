/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterDetailsView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            var currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = {};

            var vRouterDefObj = $.Deferred();
            tabConfig = getVRouterTabsViewConfig (currentHashParams,vRouterDefObj);

            pushBreadcrumb([currentHashParams.focusedElement.node]);
            vRouterDefObj.done(function(tabConfig) {
                self.renderView4Config(self.$el, null, tabConfig, null, null, null);
            });
        }
    });

    function getVRouterTabsViewConfig(currHashParams,vRouterDefObj) {
        var computeNodeDeferredObj = $.Deferred();
        var computeNodeInfo = {};
        computeNodeInfo['hostname'] = currHashParams.focusedElement.node;
        monitorInfraUtils.getComputeNodeDetails(computeNodeDeferredObj,computeNodeInfo['hostname']);
        computeNodeDeferredObj.done(function(data) {
            //If IP address is not available in UVE,pick it from ConfigData
            computeNodeInfo['ip'] = getValueByJsonPath(data,'VrouterAgent;self_ip_list;0',
                getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address'));
            computeNodeInfo['introspectPort'] = getValueByJsonPath(data,'VrouterAgent;sandesh_http_port',
                monitorInfraConstants.defaultIntrospectPort);
            computeNodeInfo['vrouterModuleId'] = getValueByJsonPath(data,'NodeStatus;process_status;0;module_id', 
                monitorInfraConstants.UVEModuleIds['VROUTER_AGENT']);
            computeNodeInfo['vRouterType'] = getValueByJsonPath(data,
                'ConfigData;virtual-router;virtual_router_type','hypervisor');
            if(computeNodeInfo['vRouterType'] instanceof Array) {
                computeNodeInfo['vRouterType'] =
                    computeNodeInfo['vRouterType'][0];
            }
            if(computeNodeInfo['vRouterType'] == '' ||
                computeNodeInfo['vRouterType'] == null) {
                computeNodeInfo['vRouterType'] = 'hypervisor';
            }
            vRouterDefObj.resolve({
                elementId: cowu.formatElementId([ctwl.VROUTER_TAB_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: ctwl.VROUTER_TAB_VIEW_ID,
                                    view: "VRouterTabView",
                                    viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                                    app: cowc.APP_CONTRAIL_CONTROLLER,
                                    viewConfig: computeNodeInfo
                                }
                            ]
                        }
                    ]
                }
            });
        });
    };

    return VRouterDetailsView;

});
