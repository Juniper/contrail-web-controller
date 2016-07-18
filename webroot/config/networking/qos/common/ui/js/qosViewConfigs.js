/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(["underscore", "config/networking/qos/common/ui/js/qosFormatters"],
    function(_, QOSFormatters){
    var qosFormatters = new QOSFormatters();
    var qosViewConfigs = function(){
        this.viewConfig = function(prefixId, disableId){
            var qosConfig = {
                    elementId: cowu.formatElementId([prefixId,
                                       "view_config"]),
                    view: "SectionView",
                    title: "QoS",
                    viewConfig:{
                        rows: [
                            {
                                columns: [
                                    {
                                        elementId: "display_name",
                                        view: "FormInputView",
                                        viewConfig: {
                                            disabled: disableId,
                                            path: "display_name",
                                            placeholder: "Enter QoS " +
                                                "Config Name",
                                            dataBindValue: "display_name",
                                            label: "Name",
                                            class: "span6"
                                        }
                                    },
                                    {
                                        elementId:
                                            "default_forwarding_class_id",
                                        view: "FormInputView",
                                        viewConfig: {
                                            path: "default_forwarding_class_id",
                                            placeholder: "Enter Default " +
                                                "Forwarding Class ID",
                                            dataBindValue:
                                                "default_forwarding_class_id",
                                            label:
                                                "Default Forwarding Class ID",
                                            class: "span6"
                                        }
                                    }
                                ]
                            },{
                               columns:[{
                                   elementId: "dscp_entries_accordion",
                                   view: "AccordianView",
                                   viewConfig:[{
                                      elementId: "dscp_entries_section",
                                      view:  "SectionView",
                                      title: "DSCP",
                                      viewConfig:{
                                          rows: [{
                                              columns: this.DSCPEntriesSection()
                                           }]
                                       }
                                   }]
                               }]
                            },{
                                columns:[{
                                    elementId: "mpls_exp_entries_accordion",
                                    view: "AccordianView",
                                    viewConfig:[{
                                       elementId: "mpls_exp_entries_section",
                                       view:  "SectionView",
                                       title: "MPLS EXP",
                                       viewConfig:{
                                           rows: [{
                                               columns:
                                                  this.MPLSExpEntriesSection()
                                            }]
                                        }
                                    }]
                                }]
                             },{
                                columns:[{
                                    elementId:
                                        "vlan_priority_entries_accordion",
                                    view: "AccordianView",
                                    viewConfig:[{
                                       elementId:
                                           "vlan_priorityp_entries_section",
                                       view:  "SectionView",
                                       title: "VLAN Priority",
                                       viewConfig:{
                                           rows: [{
                                               columns:
                                              this.VLANPriorityEntriesSection()
                                            }]
                                        }
                                    }]
                                }]
                             }
                        ]
                    }
            };
            return qosConfig;
        };

        this.fcPairColumns = function(name, key, fcId,  data) {
            return  [
                     {
                         elementId: key,
                         name: name,
                         view: 'FormComboboxView',
                         viewConfig: {
                             path : key,
                             width: 250,
                             dataBindValue : key +'()',
                             templateId:
                                 cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                             elementConfig: {
                                 dataTextField: "text",
                                 dataValueField: "value",
                                 placeholder: "Enter or Select " + name,
                                 dataSource: {
                                     type: "local",
                                     data: data
                                 }
                             }
                        }
                     },
                     {
                         elementId: fcId,
                         name: 'Forwarding Class ID',
                         view: "FormInputView",
                         viewConfig: {
                             templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                             width: 250,
                             path: fcId,
                             placeholder: "Enter Forwarding Class ID",
                             dataBindValue: fcId + "()"
                         }
                     }
            ];
        };

        this.DSCPEntriesSection = function(){
            return  [{
                elementId: 'dscp_entries_fc_pair',
                view: "FormEditableGridView",
                viewConfig: {
                    path : 'dscp_entries_fc_pair',
                    validation:
                   'dscpValidations',
                   templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                    collection:
                        'dscp_entries_fc_pair',
                    columns: this.fcPairColumns("DSCP bits", "dscp_key",
                            "forwarding_class_id",
                            ctwc.QOS_DSCP_VALUES),
                    rowActions: [
                        {onClick: "function() {\
                            $root.addDSCPEntry();\
                            }",
                         iconClass: 'icon-plus'},
                        {onClick: "function() {\
                            $root.deleteDSCPEntry($data, this);\
                           }",
                         iconClass: 'icon-minus'}
                    ],
                    gridActions: [
                        {onClick: "function() {\
                            addDSCPEntry();\
                            }",
                         buttonTitle: ""}
                    ]
                }
            }];
        };

        this.VLANPriorityEntriesSection = function(){
            return  [{
                elementId: 'vlan_priority_entries_fc_pair',
                view: "FormEditableGridView",
                viewConfig: {
                    path : 'vlan_priority_entries_fc_pair',
                    validation:
                   'vlanValidations',
                   templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                    collection:
                        'vlan_priority_entries_fc_pair',
                    columns: this.fcPairColumns("VLAN Priority bits", "vlan_key",
                            "forwarding_class_id",
                            ctwc.QOS_VLAN_PRIORITY_VALUES),
                    rowActions: [
                        {onClick: "function() {\
                            $root.addVlanPriorityEntry();\
                            }",
                         iconClass: 'icon-plus'},
                        {onClick: "function() {\
                            $root.deleteVlanPriorityEntry($data, this);\
                           }",
                         iconClass: 'icon-minus'}
                    ],
                    gridActions: [
                        {onClick: "function() {\
                            addVlanPriorityEntry();\
                            }",
                         buttonTitle: ""}
                    ]
                }
            }];
        };

        this.MPLSExpEntriesSection = function(){
            return  [{
                elementId: 'mpls_exp_entries_fc_pair',
                view: "FormEditableGridView",
                viewConfig: {
                    path : 'mpls_exp_entries_fc_pair',
                    validation:
                   'mplsValidations',
                   templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                    collection:
                        'mpls_exp_entries_fc_pair',
                    columns: this.fcPairColumns("MPLS EXP bits", "mpls_key",
                            "forwarding_class_id",
                            ctwc.QOS_MPLS_EXP_VALUES),
                    rowActions: [
                        {onClick: "function() {\
                            $root.addMPLSExpEntry();\
                            }",
                         iconClass: 'icon-plus'},
                        {onClick: "function() {\
                            $root.deleteMPLSExpEntry($data, this);\
                           }",
                         iconClass: 'icon-minus'}
                    ],
                    gridActions: [
                        {onClick: "function() {\
                            addMPLSExpEntry();\
                            }",
                         buttonTitle: ""}
                    ]
                }
            }];
        };
    };
    return qosViewConfigs;
});
