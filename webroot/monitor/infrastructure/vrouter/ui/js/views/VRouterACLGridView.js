/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var VRouterACLGridView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;

            self.renderView4Config(self.$el, self.model,
                    self.getViewConfig(self.attributes),null,null,null,
                    function(){
                        cowu.addGridGrouping ('vrouter_acl-results',{
                            groupingField :"uuid",
                            groupHeadingPrefix : 'ACL UUID: ',
                            rowCountSuffix : ['ACE','ACE']
                        });
                    });
        },

        getViewConfig: function (attributes) {
            var viewConfig = attributes.viewConfig,
                hostname = viewConfig['hostname'],
                pagerOptions = viewConfig['pagerOptions'];

            function getAclActions(d){
                var ret = '';
                var aclActionList = d.actionList;
                $.each(aclActionList,function(idx,action){
                    if(idx == 0){
                        ret += action;
                    } else {
                        ret += ',</br>' + action;
                    }
                });
                return (ret == '')? noDataStr: ret;
            }

            var columns = [
                       {
                           field:"dispuuid",
                           name:"UUID",
                           searchFn:function(d){
                               return d['uuid'];
                           },
                           hide:true,
                           minWidth:200,
                       },
                       {
                           field:"aceId",
                           name:"ACE Id",
                           minWidth:50
                       },
                       {
                           field:"ace_action",
                           name:"Action",
                           formatter:function(r,c,v,cd,dc){
                               return getAclActions(dc);
                           },
                           minWidth:70
                       },
                       {
                           field:"proto",
                           name:"Protocol",
                           minWidth:76,
                           formatter:function(r,c,v,cd,dc) {
                               return monitorInfraParsers.formatProtcolRange(dc['proto']);
                           }
                       },
                       {
                           field:"src_vn",
                           name:"Source",
                           minWidth:250,
                           cssClass:'cell-hyperlink-blue',
                           events: {
                               onClick: function(e,dc){
                                   var tabIdx = $.inArray("networks", computeNodeTabs);
                                    $("#"+ctwl.VROUTER_DETAILS_TABS_ID).tabs({active:ctwl.VROUTER_NETWORKS_TAB_IDX});
                               }
                            }
                       },
                       //{field:"src_ip",     name:"Source IP",minWidth:95},
                       {
                           field:"src_port",
                           name:"Source Port",
                           minWidth:95,
                           formatter:function(r,c,v,cd,dc){
                               return monitorInfraParsers.formatPortRange(dc['src_port']);
                           }
                       },
                       {
                           field:"dst_vn",
                           name:"Destination",
                           cssClass:'cell-hyperlink-blue',
                           events: {
                               onClick: function(e,dc){
                                   var tabIdx = $.inArray("networks", computeNodeTabs);
                                   $("#"+ctwl.VROUTER_DETAILS_TABS_ID).tabs({active:ctwl.VROUTER_NETWORKS_TAB_IDX});
                               }
                            },
                           minWidth:250
                       },
                       //{field:"dst_ip",       name:"Destination IP",minWidth:110},
                       {
                           field:"dst_port",
                           name:"Destination Port",
                           formatter:function(r,c,v,cd,dc){
                               return monitorInfraParsers.formatPortRange(dc['dst_port']);
                           },
                           minWidth:95
                       },
                       {
                           field:"flow_count",
                           name:"Flows",
                           minWidth:50,
                           cssClass:'cell-hyperlink-blue',
                           events: {
                               onClick: function(e,dc){
                                   var tabIdx = $.inArray("flows", computeNodeTabs);
                                   var data = {tab:"flows",filters:[{aclUUID:dc['uuid']}]};
                                   $('#' + computeNodeTabStrip).data('tabFilter',data);
                                    $("#"+ctwl.VROUTER_DETAILS_TABS_ID).tabs({active:ctwl.VROUTER_FLOWS_TAB_IDX});
                               }
                            }
                       }
                       /*{
                           field:"proto_range",
                           name:"Source Policy Rule",
                           minWidth:125
                       },*/

                   ];

            return {
                elementId: ctwl.VROUTER_ACL_GRID_ID,
                title: 'ACL',
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
                    text: 'ACL'
                },
                customControls : monitorInfraUtils.getGridPaginationControls(),
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
                    detail: ctwu.getDetailTemplateConfigToDisplayRawJSON()
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading ACLs..',
                    },
                    empty: {
                        text: 'No ACLs Found.'
                    }
                }
            },
            columnHeader: {
                columns: columns
            }
        };
        return gridElementConfig;
    };


    return VRouterACLGridView;
});
