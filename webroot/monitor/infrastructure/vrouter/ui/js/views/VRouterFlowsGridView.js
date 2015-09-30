/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var VRouterFlowsGridView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;

            self.renderView4Config(self.$el, self.model, self.getViewConfig());
        },

        getViewConfig: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                hostname = viewConfig['hostname'],
                pagerOptions = viewConfig['pagerOptions'];
            var columns = [
                            {
                                field:"acl_uuid",
                                name:"ACL UUID",
                                formatter:function(r,c,v,cd,dc){
                                    return getAclSgUuuidString(dc,false);
                                },
                                searchFn: function(data) {
                                    return getAclSgUuuidString(data,true);
                                },
                                minWidth:280
                            },
                            {
                                field:"protocol",
                                name:"Protocol",
                                minWidth:60,
                                formatter:function(r,c,v,cd,dc){
                                    return formatProtocol(dc['protocol']);
                                }
                            },
                            {
                                field:"src_vn",
                                name:"Src Network",
                                cssClass:'cell-hyperlink-blue',
                                events: {
                                    onClick: function(e,dc){
                                        var tabIdx = $.inArray("networks", computeNodeTabs);
                                        selectTab(computeNodeTabStrip,tabIdx);
                                    }
                                },
                                minWidth:185
                            },
                            {
                                field:"sip",
                                name:"Src IP",
                                minWidth:70
                            },
                            {
                                field:"src_port",
                                name:"Src Port",
                                minWidth:50
                            },
                            {
                                field:"dst_vn",
                                name:"Dest Network",
                                cssClass:'cell-hyperlink-blue',
                                events: {
                                    onClick: function(e,dc){
                                        var tabIdx = $.inArray("networks", computeNodeTabs);
                                        selectTab(computeNodeTabStrip,tabIdx);
                                    }
                                },
                                minWidth:185
                            },
                            {
                                field:"dip",
                                name:"Dest IP",
                                minWidth:70
                            },
                            {
                                field:"dst_port",
                                name:"Dest Port",
                                minWidth:50
                            },
                            {
                                field:"deny",
                                name:"Implicit Deny",
                                minWidth:60
                            },
                            {
                                field:"stats_bytes",
                                name:"Bytes/Pkts",
                                minWidth:80,
                                formatter:function(r,c,v,cd,dc){
                                    return contrail.format("{0}/{1}",dc['stats_bytes'],dc['stats_packets']);
                                },
                                searchFn:function(d){
                                    return d['stats_bytes']+ '/ ' +d['stats_packets'];
                                }
                            },
                            {
                                field:"setup_time_utc",
                                name:"Setup Time",
                                formatter:function(r,c,v,cd,dc){
                                    return new XDate(dc['setup_time_utc']/1000).toLocaleString();
                                },
                                minWidth:85
                            }];

            return {
                elementId: ctwl.VROUTER_FLOWS_GRID_VIEW_ID,
                title: 'Flows',
                view: "GridView",
                viewConfig: {
                    elementConfig: getGridConfig( columns)
                }
            }
        }
    });

    function getGridConfig( columns) {
        var gridElementConfig = {
            header: {
                title: {
                    text: 'Flows',
                    icon : 'icon-table'
                },
                customControls : monitorInfraUtils.getGridPaginationControls(),
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    sortable: false
                },
                dataSource: {
                }
            },
            columnHeader: {
                columns: columns
            }
        };
        return gridElementConfig;
    };


    return VRouterFlowsGridView;
});
