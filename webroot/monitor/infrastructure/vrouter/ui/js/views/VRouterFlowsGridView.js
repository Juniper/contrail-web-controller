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
                noDataStr = monitorInfraConstants.noDataStr,
                pagerOptions = viewConfig['pagerOptions'];

            function getAclSgUuuidString (data,isSearch) {
                //if the request is based on a particular acl return the uuid
                if(data['acl_uuid'] != null && data['acl_uuid'] != 'All'){
                    if(isSearch){
                        return data['searchUUID'];
                    } else {
                        return data['acl_uuid'];
                    }
                }
                var aclUuidList = ifNull(jsonPath(data,"$..policy..FlowAclUuid..uuid"),noDataStr);
                var outPolicyAclUuidList = ifNull(jsonPath(data,"$..out_policy..FlowAclUuid..uuid"),noDataStr);
                var sgUuidList = ifNull(jsonPath(data,"$..sg..FlowAclUuid..uuid"),noDataStr);
                var outSgUuidList = ifNull(jsonPath(data,"$..out_sg..FlowAclUuid..uuid"),noDataStr);

                var ret = '';
                if(aclUuidList.length > 0){
                    ret += "<span class='text-info'>Policy:</span>";
                }
                $.each(aclUuidList,function(idx,aclUuid){
                    ret += "</br>" + aclUuid;
                });
                if(outPolicyAclUuidList.length > 0){
                    ret += (ret != '')?" </br><span class='text-info'>Out Policy:</span>" :
                        "<span class='text-info'>Out Policy:</span>";
                }
                $.each(outPolicyAclUuidList,function(idx,outPolicyAclUuid){
                    ret += "</br>" + outPolicyAclUuid;
                });
                if(sgUuidList.length > 0){
                    ret += (ret != '')?"</br><span class='text-info'>SG:</span>" :
                        "<span class='text-info'>SG:</span>";
                }
                $.each(sgUuidList,function(idx,sgUuid){
                    ret += "</br>" + sgUuid;
                });
                if(outSgUuidList.length > 0){
                    ret += (ret != '')?"</br><span class='text-info'>Out SG:</span>" :
                        "<span class='text-info'>Out SG:</span>";
                }
                $.each(outSgUuidList,function(idx,outSgUuid){
                    ret += "</br>" + outSgUuid;
                });
                return (ret == '')? noDataStr: ret;
            }


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
//                                hide:true,
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
                                        $("#"+ctwl.VROUTER_DETAILS_TABS_ID).tabs({active:ctwl.VROUTER_NETWORKS_TAB_IDX});
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
                                        $("#"+ctwl.VROUTER_DETAILS_TABS_ID).tabs({active:ctwl.VROUTER_NETWORKS_TAB_IDX});
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
                                    if(dc['setup_time_utc'] != null && dc['setup_time_utc'] != '-') {
                                        return new XDate(dc['setup_time_utc']/1000).toLocaleString();
                                    }
                                    return dc['setup_time_utc'];
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
                    text: 'Flows'
                },
                customControls : [
                        '<a class="widget-toolbar-icon"><i class="fa fa-forward"></i></a>',
                        '<a class="widget-toolbar-icon"><i class="fa fa-backward"></i></a>',
                    ],
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            footer:false,
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    // fixedRowHeight: 30,
                    sortable: false,
                    lazyLoading:false,
                    detail: ctwu.getDetailTemplateConfigToDisplayRawJSON()
                },
                dataSource: {
                    remote: {
                        ajaxConfig: {
                        }
                    }
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Flows..',
                    },
                    empty: {
                        text: 'No Flows Found.'
                    }
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
