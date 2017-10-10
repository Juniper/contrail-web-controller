/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-list-model'
], function (_, ContrailListModel) {
    var FWZUtils = function () {
        var self = this;
        self.getFirewallPolicyViewConfig = function(prefixId){
            var createPolicyViewConfig = [{
                elementId: cowu.formatElementId([prefixId, ctwl.TITLE_DETAILS]),
                title: ctwl.TITLE_POLICY_INFO,
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: "policy_name",
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "policy_name",
                                        dataBindValue: "policy_name",
                                        class: "col-xs-6"
                                    }
                                }
                            ]
                        }, {
                            columns: [
                                      {
                                          elementId: "policy_description",
                                          view: "FormInputView",
                                          viewConfig: {
                                              path: "policy_description",
                                              dataBindValue: "policy_description",
                                              class: "col-xs-12"
                                          }
                                      }
                                  ]
                          }
                    ]
                }
            },
            {
                elementId: "security_permissions",
                view: 'SectionView',
                title:"Permissions",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'owner_access_security',
                                    view: 'FormMultiselectView',
                                    viewConfig: {
                                        label: "Owner Permissions",
                                        path: 'perms2.owner_access',
                                        dataBindValue: 'perms2().owner_access',
                                        class: 'col-xs-6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Permissions",
                                            data: cowc.RBAC_ACCESS_TYPE_LIST
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'global_access_secuirty',
                                    view: 'FormMultiselectView',
                                    viewConfig: {
                                        label: "Global Share Permissions",
                                        path: 'perms2.global_access',
                                        dataBindValue: 'perms2().global_access',
                                        class: 'col-xs-6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Permissions",
                                            data: cowc.RBAC_ACCESS_TYPE_LIST
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns:[{
                                elementId: "security_share_accordion_create",
                                view: "AccordianView",
                                viewConfig:[{
                                   elementId: "security_share_accordion_create",
                                   view:  "SectionView",
                                   title: "Share List",
                                   viewConfig:{
                                       rows: [{
                                           columns:
                                              shareViewConfig()
                                        }]
                                    }
                                }]
                            }]
                         }

                    ]
                }
            }];
            return createPolicyViewConfig;
        }
        self.getRulesViewConfig = function(allData) {
            var serviceGrp = {data: [{type: 'service-groups'}]};
            return {
                rows: [{
                        columns: [{
                            elementId: 'firewall_rules',
                            view: "FormCollectionView",
                            //view: "FormEditableGridView",
                            viewConfig: {
                                label:"",
                                path: "firewall_rules",
                                class: 'col-xs-12',
                                validation: 'ruleValidation',
                                templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                                collection: "firewall_rules",
                                rows:[{
                                   rowActions: [
                                       {onClick: "function() { $root.addRuleByIndex($data, this); }",
                                       iconClass: 'fa fa-plus'},
                                       {onClick:
                                       "function() { $root.deleteRules($data, this); }",
                                        iconClass: 'fa fa-minus'}
                                   ],
                                columns: [
                                    {
                                     elementId: 'simple_action',
                                     name: 'Action',
                                     view: "FormDropdownView",
                                     class: "",
                                     width: 70,
                                     viewConfig: {
                                         templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                         path: "simple_action",
                                         disabled: "showService()",
                                         dataBindValue: "simple_action()",
                                         elementConfig:{
                                             data:['pass','deny']
                                        }}
                                    },
                                    {
                                        elementId: 'user_created_service',
                                        name: 'Services',
                                        view: "FormComboboxView",
                                        width: 300,
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                            width: 210,
                                            path: 'user_created_service',
                                            dataBindValue: 'user_created_service()',
                                            elementConfig: {
                                                dataTextField: "text",
                                                dataValueField: "value",
                                                placeholder: "Select or Enter Protocol:Port",
                                                dataSource: {
                                                    type: "remote",
                                                    requestType: "POST",
                                                    url: "/api/tenants/config/get-config-details",
                                                    postData: JSON.stringify(serviceGrp),
                                                    parse : serviceGroupDataFormatter
                                                }
                                            }
                                        }
                                    },
                                    {
                                        elementId: 'endpoint_1',
                                        view:
                                            "FormHierarchicalDropdownView",
                                        name: 'End Point 1',
                                        class: "",
                                        width: 220,
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                            width: 220,
                                            path: 'endpoint_1',
                                            dataBindValue: 'endpoint_1()',
                                            elementConfig: {
                                                placeholder: 'Select Endpoint',
                                                minimumResultsForSearch : 1,
                                                dataTextField: "text",
                                                dataValueField: "value",
                                                data: allData.addrFields,
                                                queryMap: [
                                                {
                                                    name : 'Application',
                                                    value : 'Application',
                                                    iconClass:
                                                    'fa fa-list-alt'
                                                },
                                                {
                                                    name : 'Deployment',
                                                    value : 'Deployment',
                                                    iconClass:
                                                    'fa fa-database'
                                                },
                                                {
                                                    name : 'Site',
                                                    value : 'Site',
                                                    iconClass:
                                                    'fa fa-life-ring'
                                                },
                                                {
                                                    name : 'Tier',
                                                    value : 'Tier',
                                                    iconClass:
                                                    'fa fa-clone'
                                                },
                                                {
                                                    name : 'Label',
                                                    value : 'label',
                                                    iconClass:
                                                    'fa fa-tags'
                                                },
                                                {
                                                    name : 'Network',
                                                    value : 'virtual_network',
                                                    iconClass:
                                                    'icon-contrail-virtual-network'
                                                },
                                                {
                                                    name : 'Address Group',
                                                    value : 'address_group',
                                                    iconClass:
                                                    'icon-contrail-network-ipam'
                                                },
                                                {
                                                    name : 'Any Workload',
                                                    value : 'any_workload',
                                                    iconClass:'fa fa-globe'
                                                }
                                               ]
                                            }
                                        }
                                    },
                                    {
                                     elementId: 'direction',
                                     name: 'Dir',
                                     view: "FormDropdownView",
                                     class: "",
                                     width: 100,
                                     viewConfig: {
                                         templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                         path: "direction",
                                         dataBindValue: "direction()",
                                         disabled: "showService()",
                                         elementConfig:{
                                             data:['<>', '>', '<']
                                         }}
                                    },
                                    {
                                        elementId: 'endpoint_2',
                                        view:
                                            "FormHierarchicalDropdownView",
                                        name: 'End Point 2',
                                        class: "col-xs-2",
                                        width: 220,
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                            width: 220,
                                            path: 'endpoint_2',
                                            dataBindValue: 'endpoint_2()',
                                            elementConfig: {
                                                placeholder: 'Select Endpoint',
                                                minimumResultsForSearch : 1,
                                                dataTextField: "text",
                                                dataValueField: "value",
                                                data: allData.addrFields,
                                                queryMap: [
                                                {
                                                    name : 'Application',
                                                    value : 'Application',
                                                    iconClass:
                                                    'fa fa-list-alt'
                                                },
                                                {
                                                    name : 'Deployment',
                                                    value : 'Deployment',
                                                    iconClass:
                                                    'fa fa-database'
                                                },
                                                {
                                                    name : 'Site',
                                                    value : 'Site',
                                                    iconClass:
                                                    'fa fa-life-ring'
                                                },
                                                {
                                                    name : 'Label',
                                                    value : 'label',
                                                    iconClass:
                                                    'fa fa-tags'
                                                },
                                                {
                                                    name : 'Tier',
                                                    value : 'Tier',
                                                    iconClass:
                                                    'fa fa-clone'
                                                },
                                                {
                                                    name : 'Network',
                                                    value : 'virtual_network',
                                                    iconClass:
                                                    'icon-contrail-virtual-network'
                                                },
                                                {
                                                    name : 'Address Group',
                                                    value : 'address_group',
                                                    iconClass:
                                                    'icon-contrail-network-ipam'
                                                },
                                                {
                                                    name : 'Any Workload',
                                                    value : 'any_workload',
                                                    iconClass:'fa fa-globe'
                                                }]
                                            }
                                        }
                                    }, {
                                        elementId: 'match_tags',
                                        name: 'Match Tags',
                                        view: "FormMultiselectView",
                                        width: 170,
                                        viewConfig:
                                          {
                                           class: "",
                                           width: 170,
                                           path: "match_tags",
                                           templateId:
                                               cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                           dataBindValue:
                                               'match_tags()',
                                           elementConfig: {
                                               placeholder: "Select Tag Types",
                                               dataValueField: "value",
                                               dataTextField: "text",
                                               data: [{text: "Application", value: "application"},
                                                      {text: 'Tier', value: 'tier'},
                                                      {text:'Deployment', value: 'deployment'},
                                                      {text: 'Site', value: 'site'}]
                                           }
                                          }
                                    }]
                                }],
                                gridActions: [
                                    {onClick: "function() { addRule(); }",
                                     buttonTitle: ""}
                                ]
                        }
                        }]
                    }]
                };

        }
        self.formatAccessList = function(access) {
            var retStr = "";
            switch (access) {
                case 1:
                    retStr = "1";
                    break;
                case 2:
                    retStr = "2";
                    break;
                case 3:
                    retStr = "2,1";
                    break;
                case 4:
                    retStr = "4";
                    break;
                case 5:
                    retStr = "4,1";
                    break;
                case 6:
                    retStr = "4,2";
                    break;
                case 7:
                    retStr = "4,2,1";
                    break;
                default:
                    retStr = "";
                    break;
            };
            return retStr;
        }
    };
    this.serviceGroupDataFormatter = function(response){
        var serviceGrpList = [];
        //self.serviceGroupList =[];
        var secGrpList = getValueByJsonPath(response, "0;service-groups", []);
        $.each(secGrpList, function (i, obj) {
            var obj = obj['service-group'];
            serviceGrpList.push({value: obj.uuid, text: obj.name});
            //serviceGroupList.push({fq_name : obj.fq_name, text: obj.name});
         });
        return serviceGrpList;
    };
    this.shareViewConfig = function() {
        return  [{
            elementId: 'share_list',
            view: "FormEditableGridView",
            viewConfig: {
                path : 'share_list',
                class: 'col-xs-12',
                validation:
               'rbacPermsShareValidations',
               templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                collection:
                    'share_list',
                columns: [
                    {
                        elementId: "tenant",
                        name: "Project",
                        view: 'FormComboboxView',
                        viewConfig: {
                            path : "tenant",
                            width: 250,
                            dataBindValue : "tenant()",
                            templateId:
                                cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                            elementConfig: {
                                dataTextField: "text",
                                dataValueField: "value",
                                placeholder: "Enter or Select Project",
                                dataSource: {
                                    type: "remote",
                                    url:
                                     "/api/tenants/config/all-projects/",
                                    requestType: "GET",
                                    parse: function(result){
                                        var dataSource = [],
                                           projects =
                                           getValueByJsonPath(result,
                                               "projects", []);
                                        _.each(projects, function(project){
                                            var projName =
                                                getValueByJsonPath(project,
                                                "fq_name;1", "", false),
                                                projId =
                                                getValueByJsonPath(project,
                                                "uuid", "", false  );
                                            if(projId && projName &&
                                                projName !==
                                                    "default-project") {
                                                dataSource.push({
                                                    text: projName + " (" + projId + ")",
                                                    value: projId
                                                });
                                            }
                                        });
                                        return dataSource
                                    }
                                }
                            }
                       }
                    },
                    {
                        elementId: "tenant_access",
                        name: 'Permissions',
                        view: "FormMultiselectView",
                        viewConfig: {
                            templateId: cowc.
                                TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                            width: 250,
                            path: "tenant_access",
                            dataBindValue: "tenant_access()",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "value",
                                placeholder: "Select Permissions",
                                data: cowc.RBAC_ACCESS_TYPE_LIST
                            }
                        }
                    }
                 ],
                rowActions: [
                    {onClick: "function() {" +
                        "$root.addShareByIndex($data, this);" +
                        "}",
                     iconClass: 'fa fa-plus'},
                    {onClick: "function() {" +
                        "$root.deleteShare($data, this);" +
                       "}",
                     iconClass: 'fa fa-minus'}
                ],
                gridActions: [
                    {onClick: "function() {" +
                        "addShare();" +
                        "}",
                     buttonTitle: ""}
                ]
            }
        }];
    }
    return FWZUtils;
});
