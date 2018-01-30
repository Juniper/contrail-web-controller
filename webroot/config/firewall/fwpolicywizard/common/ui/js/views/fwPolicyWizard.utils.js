/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-list-model'
], function (_, ContrailListModel) {
    var FWZUtils = function () {
        var self = this;
        self.getFirewallPolicyViewConfig = function(prefixId, allData, isPolicyDisable){
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
                                        label: 'Name',
                                        path: "policy_name",
                                        dataBindValue: "policy_name",
                                        class: "col-xs-6",
                                        disabled : isPolicyDisable
                                    }
                                }
                            ]
                        }, {
                            columns: [
                                      {
                                          elementId: "policy_description",
                                          view: "FormInputView",
                                          viewConfig: {
                                              label: 'Description',
                                              path: "policy_description",
                                              dataBindValue: "policy_description",
                                              class: "col-xs-12"
                                          }
                                      }
                                  ]
                          },
                          {
                              columns: [
                                  {
                                      elementId: 'security_logging_object_refs',
                                      view: 'FormMultiselectView',
                                      viewConfig: {
                                          label: 'Security Logging Object(s)',
                                          path: 'security_logging_object_refs',
                                          class: 'col-xs-12',
                                          dataBindValue: 'security_logging_object_refs',
                                          elementConfig: {
                                              placeholder: 'Select Security Logging Object(s)',
                                              dataTextField: "text",
                                              dataValueField: "id",
                                              separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                              data : allData.sloList
                                           }
                                      }
                                 }]
                          }
                    ]
                }
            },
            {
                elementId: "fw_security_permissions",
                view: 'SectionView',
                title:"Permissions",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'fw_owner_access_security',
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
                                    elementId: 'fw_global_access_secuirty',
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
                                elementId: "fw_security_share_accordion_create",
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
                                plusFlag:true,
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
                                     width: 67,
                                     viewConfig: {
                                         templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                         path: "simple_action",
                                         disabled: "disabled()",
                                         dataBindValue: "simple_action()",
                                         elementConfig:{
                                             data:['pass','deny']
                                        }}
                                    },
                                    {
                                        elementId: 'user_created_service',
                                        name: 'Services',
                                        view: "FormComboboxView",
                                        width: 234,
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                            path: 'user_created_service',
                                            disabled: "disabled()",
                                            dataBindValue: 'user_created_service()',
                                            elementConfig:{
                                                dataTextField: 'text',
                                                dataValueField: 'value',
                                                placeholder: "Select or Enter Protocol:SrcPort:DstPort",
                                                dataSource: {
                                                    type: 'local',
                                                    data: allData.serviceGrpList
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
                                        width: 200,
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                            path: 'endpoint_1',
                                            dataBindValue: 'endpoint_1()',
                                            disabled: "disabled()",
                                            plusFlag : false,
                                            //dataBindOptionList : "dataSourceAllData",
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
                                     width: 52,
                                     viewConfig: {
                                         templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                         path: "direction",
                                         dataBindValue: "direction()",
                                         disabled: "disabled()",
                                         elementConfig:{
                                             data:['<>', '>', '<']
                                         }}
                                    },
                                    {
                                        elementId: 'endpoint_2',
                                        view:
                                            "FormHierarchicalDropdownView",
                                        name: 'End Point 2',
                                        class: "",
                                        width: 201,
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                            path: 'endpoint_2',
                                            plusFlag : false,
                                            dataBindValue: 'endpoint_2()',
                                            disabled: "disabled()",
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
                                        width: 201,
                                        viewConfig:
                                          {
                                           class: "",
                                           path: "match_tags",
                                           disabled: "disabled()",
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
                                    },
                                    {
                                        elementId: 'slo_check',
                                        name: 'SLO',
                                        view: "FormCheckboxView",
                                        class: "text-center",
                                        width: 48,
                                        viewConfig: {
                                           templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                           path: 'slo_check',
                                           dataBindValue: 'slo_check()'
                                           }
                                    }]
                                },
                                {
                                    columns: [
                                        {
                                             elementId: 'security_logging_object_refs',
                                             name: 'Security Logging Object(s)',
                                             view: "FormMultiselectView",
                                             width: 180,
                                             viewConfig: {
                                                 colSpan: "12",
                                                 width: 180,
                                                 class: "col-xs-12",
                                                 label: 'SLO',
                                                 placeholder:"Select Security Logging Object(s)",
                                                 visible: "slo_check()",
                                                 templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_LEFT_LABEL_VIEW,
                                                 path: "security_logging_object_refs",
                                                 dataBindValue: "security_logging_object_refs()",
                                                 elementConfig:{
                                                     dataTextField: "text",
                                                     dataValueField: "id",
                                                     separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                                     data: allData.sloList
                                                 }
                                             }
                                        }
                                      ]
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
        self.createApplicationPolicySet = function(){
            $('#view-address-group').show();
            $('#view-service-group').show();
            $('#view-visble-tags').show();
        }
        self.viewAdressGroup = function(){
            $("#overlay-background-id").addClass("overlay-background");
        }
        self.viewServiceGroup = function(){
            $("#overlay-background-id").addClass("overlay-background");
        }
        self.viewTags = function(){
            $("#overlay-background-id").addClass("overlay-background");
        }
        self.viewApplicationPolicySet = function(){
            $('#aps-overlay-container .dropdown').show();
            $("#overlay-background-id").removeClass("overlay-background");
        }
        self.backButtonClick = function(){
            $("#aps-gird-container").empty();
            $('#aps-landing-container').show();
        }
        self.appendDeleteContainer = function(postionDiv, appendDiv, overlay){
            var deleteContainer = $('<div class="confirmation-popover"></div>');
            var msg = $('<span class="confirm-message">Are you sure you want to Delete?</span>');
            deleteContainer.append(msg);
            var confirmDiv = $('<div class="confirm-actions"></div>');
            var cancel = $('<a class="margin-right-10 cancelWizardDeletePopup"></a>');
            var cancelI = $('<i class="fa fa-close"></i>');
            cancel.append(cancelI);
            confirmDiv.append(cancel);
            var save = $('<a class="margin-right-10 saveWizardRecords"></a>');
            var saveI = $('<i class="fa fa-check"></i>');
            save.append(saveI);
            confirmDiv.append(save);
            deleteContainer.append(confirmDiv);
            if($(postionDiv).parents().eq(2).hasClass("grid-header")){
                $(postionDiv).parent().parent().append(deleteContainer);
            }
            else{
                 $(postionDiv).parent().append(deleteContainer);
            }
            if(overlay){
                var deleteOverlay = $('<div id="delete-popup-background" class="overlay-background"></div>');
                if($('#delete-popup-background').length == 0){
                    $('#aps-overlay-container').append(deleteOverlay);
                }else{
                    $('#delete-popup-background').addClass('overlay-background');
                }
            }else{
                var deleteOverlay = $('<div id="overlay-background-id" class="overlay-background"></div>');
                if($('#overlay-background-id').length == 0){
                    $('#applicationpolicyset_policy_wizard').append(deleteOverlay);
                }else{
                    $('#overlay-background-id').addClass('overlay-background');
                }
            }
        }
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