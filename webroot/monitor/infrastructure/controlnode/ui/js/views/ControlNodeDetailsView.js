/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ControlNodeDetailsView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            var currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = {};

//            if (contrail.checkIfExist(currentHashParams.clickedElement)) {
                tabConfig = getControlNodeTabsViewConfig (currentHashParams);
//            } else {
//                tabConfig = ctwgrc.getTabsViewConfig(ctwc.GRAPH_ELEMENT_NETWORK, {
//                    fqName: networkFQN,
//                    uuid: networkUUID
//                });
//            }

            this.renderView4Config(this.$el, null, tabConfig, null, null, null);
        }
    });

    function getControlNodeTabsViewConfig(currHashParams) {
        var options = {
                hostname: currHashParams.focusedElement.node
            };
        return {
            elementId: cowu.formatElementId([ctwl.CONTROLNODE_TAB_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONTROLNODE_TAB_VIEW_ID,
                                view: "ControlNodeTabView",
                                viewPathPrefix: "monitor/infrastructure/controlnode/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: options
                            }
                        ]
                    }
                ]
            }
        };
    };

    return ControlNodeDetailsView;

});