/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"], function(_){
     var qosUtils = function() {

         this.getQOSDetailsTemplateConfig = function() {
             return {
                 templateGenerator: 'RowSectionTemplateGenerator',
                 templateGeneratorConfig: {
                     rows: [{
                         templateGenerator: 'ColumnSectionTemplateGenerator',
                         templateGeneratorConfig: {
                             columns: [{
                                 class: 'col-xs-6',
                                 rows: [{
                                     title: 'Details',
                                     templateGenerator:
                                         'BlockListTemplateGenerator',
                                     templateGeneratorConfig: [{
                                         key: "name",
                                         templateGenerator: "TextGenerator",
                                         label: "Name"
                                     },{
                                         key: "display_name",
                                         templateGenerator: "TextGenerator",
                                         label: "Display Name"
                                     },{
                                         key: "uuid",
                                         templateGenerator: "TextGenerator",
                                         label: "UUID"
                                     },{
                                         key: "qos_config_type",
                                         templateGenerator: "TextGenerator",
                                         label: "QOS Config Type",
                                         templateGeneratorConfig: {
                                             formatter: "QOSTypeFormatter"
                                         }
                                     },{
                                         key: "default_forwarding_class_id",
                                         templateGenerator: "TextGenerator",
                                         label: "Default Forwarding Class ID"
                                     },{
                                         key: "uuid",
                                         templateGenerator: "TextGenerator",
                                         label: "DSCP",
                                         templateGeneratorConfig: {
                                             formatter:
                                                 "DSCPEntriesExpFormatter"
                                         }
                                     },{
                                         key: "uuid",
                                         templateGenerator: "TextGenerator",
                                         label: "MPLS EXP",
                                         templateGeneratorConfig: {
                                             formatter:
                                                 "MPLSEntriesExpandFormatter"
                                         }
                                     },{
                                         key: "uuid",
                                         templateGenerator: "TextGenerator",
                                         label: "VLAN Priority",
                                         templateGeneratorConfig: {
                                             formatter:
                                              "VLANPriorityEntriesExpFormatter"
                                         }
                                     }]
                                 },
                                 //permissions
                                 ctwu.getRBACPermissionExpandDetails()]
                             }]
                         }
                     }]
                 }
             };
         };

         this.qosGridColumns = function(qosFormatters) {
             return {
                 columns: [
                    {
                         field: "display_name",
                         name: "Name",
                         sortable: true,
                         formatter: this.showName
                     },
                     {
                         field: "dscp_enttries",
                         name: "DSCP",
                         sortable: true,
                         formatter: qosFormatters.dscpEntriesFormatter
                     },
                     {
                         field: "mpls_exp_entries",
                         name: "MPLS EXP",
                         sortable: true,
                         formatter: qosFormatters.mplsExpEntriesFormatter
                     },
                     {
                         field: "vlan_priority_entries",
                         name: "VLAN Priority",
                         sortable: true,
                         formatter: qosFormatters.vlanPriorityEntriesFormatter
                     }
                 ]
             };

         };

         this.showName = function (r, c, v, cd, dc) {
             return ctwu.getDisplayNameOrName(dc);
         };
     };
     return qosUtils;
 });

