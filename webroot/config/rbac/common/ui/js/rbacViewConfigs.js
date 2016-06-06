/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(["underscore", "config/rbac/common/ui/js/rbacFormatters"],
    function(_, RBACFormatters){
    var rbacFormatters = new RBACFormatters();
    var rbacViewConfigs = function(){
        this.viewConfig = function(prefixId, disableId){
            var rbacDomainConfig = {
                    elementId: cowu.formatElementId([prefixId,
                                       "view_config"]),
                    view: "SectionView",
                    viewConfig:{
                        rows: [
                            {
                                columns: [
                                    {
                                        elementId: "rule_object",
                                        view: "FormInputView",
                                        viewConfig: {
                                            disabled: disableId,
                                            path: "rule_object",
                                            dataBindValue: "rule_object",
                                            label: "Object",
                                            class: "span6"
                                        }
                                    },
                                    {
                                        elementId: "rule_field",
                                        view: "FormInputView",
                                        viewConfig: {
                                            disabled: disableId,
                                            path: "rule_field",
                                            dataBindValue: "rule_field",
                                            label: "Property",
                                            class: "span6"
                                        }
                                    }
                                ]
                            },{
                               columns:[{
                                   elementId: "access_accordion",
                                   view: "AccordianView",
                                   viewConfig:[{
                                      elementId: "access_section",
                                      view:  "SectionView",
                                      title: "API Acess Rules",
                                      //active: true,
                                      viewConfig:{
                                          //active: true,
                                          rows: [{
                                              columns: this.AccessSection()
                                           }]
                                       }
                                   }]
                               }]
                            }
                        ]
                    }
            };
            return rbacDomainConfig
        };

        this.AccessSection = function(){
            return  [{
                elementId: 'rule_perms',
                view: "FormEditableGridView",
                viewConfig: {
                    path : 'rule_perms',
                    validation:
                   'rbacRulePermsValidations',
                   templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                    collection:
                        'rule_perms',
                    columns: [
                        {
                         elementId: 'role_name',
                         name:
                           'Role',
                         view: "FormComboboxView",
                         viewConfig:
                           {
                            class: "", width: 250,
                            placeholder: 'Role',
                            templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                            path: "role_name",
                            dataBindValue:
                                'role_name()',
                            elementConfig: {
                                dataTextField: "text",
                                dataValueField: "text",
                                placeholder: "Enter or Select Role",
                                dataSource: {
                                    type: "remote",
                                    url: "/api/getRoles",
                                    parse: rbacFormatters.rolesComboFormatter
                                }
                            }
                           }
                        },
                        {
                         elementId: 'role_crud',
                         name:
                           'Access',
                         view: "FormMultiselectView",
                         viewConfig:
                           {
                            class: "", width: 320,
                            path: "role_crud",
                            templateId:
                                cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                            dataBindValue:
                                'role_crud()',
                            elementConfig: {
                                placeholder: "Select Access",
                                dataValueField: "value",
                                dataTextField: "text",
                                data: ctwc.RBAC_ROLE_CRUD_LIST
                            }
                           }
                        },
                    ],
                    rowActions: [
                        {onClick: "function() {\
                            $root.addRulePerm();\
                            }",
                         iconClass: 'icon-plus'},
                        {onClick: "function() {\
                            $root.deleteRulePerm($data, this);\
                           }",
                         iconClass: 'icon-minus'}
                    ],
                    gridActions: [
                        {onClick: "function() {\
                            addRulePerm();\
                            }",
                         buttonTitle: ""}
                    ]
                }
            }];
        };
    };
    return rbacViewConfigs;
});
