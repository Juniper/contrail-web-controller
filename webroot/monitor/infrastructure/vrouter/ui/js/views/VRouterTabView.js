/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            self.renderView4Config(self.$el, null,
                    getVRouterTabsViewConfig(viewConfig));
        }
    });

    var getVRouterTabsViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];

        return {
            elementId: ctwl.VROUTER_DETAILS_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.VROUTER_DETAILS_TABS_ID,
                                view: "TabsView",
                                viewConfig: getVRouterTabViewConfig(
                                                viewConfig)
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getVRouterTabViewConfig (viewConfig) {
        return {
            theme: 'default',
            active: 0,
            activate: function (e, ui) {
                var selTab = $(ui.newTab.context).text();
                if (selTab ==
                        'Details') {
                    $('#' + ctwl.VROUTER_DETAIL_ID).
                        trigger('refresh');
                } else if (selTab == 'Interfaces') {
                   $('#' + ctwl.VROUTER_INTERFACES_GRID_ID).
                   data('contrailGrid').refreshView();
                } else if (selTab == 'Networks') {
                   $('#' + ctwl.VROUTER_NETWORKS_GRID_ID).
                   data('contrailGrid').refreshView();
                } else if (selTab == 'ACL') {
                   $('#' + ctwl.VROUTER_ACL_GRID_ID).
                   data('contrailGrid').refreshView();
                } else if (selTab == 'Flows') {
                   $('#' + ctwl.VROUTER_FLOWS_GRID_ID).
                   data('contrailGrid').refreshView();
                } else if (selTab == 'Routes') {
                   $('#' + ctwl.VROUTER_ROUTES_GRID_ID).
                   data('contrailGrid').refreshView();
                }
            },
            tabs: [
                {
                    elementId: 'vrouter_detail_tab_id',
                    title: 'Details',
                    view: "VRouterDetailPageView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                },{
                    elementId: 'vrouter_interfaces_tab_id',
                    title: 'Interfaces',
                    view: "VRouterInterfacesFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                        widgetConfig: {
                            elementId: ctwl.VROUTER_INTERFACES_GRID_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.VROUTER_TAB_SEARCH_PREFIX + ' ' + ctwl.VROUTER_INTERFACES_TITLE,
                                    // iconClass: "icon-search"
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true
                                        }
                                    }
                                }
                            }
                        }
                    })
                },{
                    elementId: 'vrouter_networks_tab_id',
                    title: 'Networks',
                    view: "VRouterNetworksFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                        widgetConfig: {
                            elementId: ctwl.VROUTER_NETWORKS_GRID_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.VROUTER_TAB_SEARCH_PREFIX + ' ' + ctwl.VROUTER_NETWORKS_TITLE,
                                    // iconClass: "icon-search"
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true
                                        }
                                    }
                                }
                            }
                        }
                    })
                },{
                    elementId: 'vrouter_acl_tab_id',
                    title: 'ACL',
                    view: "VRouterACLFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: $.extend({},viewConfig,{
                        widgetConfig: {
                            elementId: ctwl.VROUTER_ACL_GRID_ID + '-widget',
                            view: "WidgetView",
                            viewConfig: {
                                header: {
                                    title: ctwl.VROUTER_TAB_SEARCH_PREFIX + ' ' + ctwl.VROUTER_ACL_TITLE,
                                    // iconClass: "icon-search"
                                },
                                controls: {
                                    top: {
                                        default: {
                                            collapseable: true
                                        }
                                    }
                                }
                            }
                        }
                    })
                },{
                    elementId: 'vrouter_flows_tab_id',
                    title: 'Flows',
                    view: "VRouterFlowsFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                },{
                    elementId: 'vrouter_routes_tab_id',
                    title: 'Routes',
                    view: "VRouterRoutesFormView",
                    viewPathPrefix:
                        ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                }
            ]
        }
    }
    return VRouterTabView;
});
