/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'moment',
    'backbone',
    'contrail-view',
    'config/firewall/common/applicationpolicy/ui/js/models/applicationPolicyModel',
    'config/firewall/common/applicationpolicy/ui/js/views/applicationPolicyEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizardEditView',
    'config/firewall/fwpolicywizard/common/ui/js/models/fwPolicyWizardModel'
], function (_, moment, Backbone, ContrailView, ApplicationPolicyModel, ApplicationPolicyEditView,
        FwPolicyWizardEditView, FWPolicyWizardModel) {
    var applicationPolicyEditView = new ApplicationPolicyEditView(),
        fwPolicyWizardEditView = new FwPolicyWizardEditView(),
        gridElId = "#" + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID;

    var applicationPolicyGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getApplicationPolicyGridViewConfig(viewConfig));
        }
    });

    var getApplicationPolicyGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.FIREWALL_APPLICATION_POLICY_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID,
                                title: ctwl.TITLE_FIREWALL_APPLICATION_POLICY,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };
    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_FIREWALL_APPLICATION_POLICY
                },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteAppPolicy').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteAppPolicy').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig.bind(viewConfig),
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getApplicationPolicyDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Application Policy Sets..'
                    },
                    empty: {
                        text: 'No Application Policy Set Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                        {
                             field: 'name',
                             name: 'Name',
                             id: 'name',
                             minWidth : 150,
                        },
                        {
                            id: "description",
                            field: "description",
                            name: "Description",
                            formatter: descriptionFormatter,
                            minWidth : 150,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        },
                        {
                            field:"tag_refs",
                            name:"Application Tags",
                            sortable: {
                               sortBy: 'formattedValue'
                            },
                            minWidth : 180,
                            formatter: ctwu.tagsPortGridFormatter
                        },
                        {
                            id: "noofpolicies",
                            field: "noofpolicies",
                            name: "FW Policies",
                            minWidth : 100,
                            formatter: noOfPoliciesFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        },
                        /*{
                            id: "shared",
                            field: "shared",
                            name: "Shared",
                            formatter: isSharedFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        },*/
                        {
                            id: "lastupdated",
                            field: "lastupdated",
                            name: "Last Updated",
                            minWidth : 100,
                            formatter: lastUpdateFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        }
                ]
            },
        };
        return gridElementConfig;
    };
    function getRowActionConfig(dc) {
        if(cowu.isAdmin() === false && dc['is_global'] === true){
            return false;
        }
        else{
            var viewConfig = this,
                appPolicySetName = getValueByJsonPath(dc, 'name', '', false),
                rowActionConfig = [
                ctwgc.getEditConfig('Edit', function(rowIndex) {
                    dataView = $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).data("contrailGrid")._dataView;
                    var rowData = dataView.getItem(rowIndex);
                    var policy = rowData.firewall_policy_refs;
                    delete rowData.perms2;
                    var apsName = rowData.fq_name[rowData.fq_name.length - 1];
                    fwPolicyWizardEditView.model = new FWPolicyWizardModel(rowData);
                    fwPolicyWizardEditView.renderFwWizard({
                                    "title": 'Edit Application Policy Set',
                                    'viewConfig': $.extend(viewConfig.viewConfig, { policy: policy, mode: 'edit', apsName: apsName,
                                        isGlobal: viewConfig.isGlobal , seletedRows : [], isWizard: true, wizardMode: 'aps'}),
                                        callback: function () {
                                         dataView.refreshData();
                                     }
                    });
                })];
                if(appPolicySetName !== ctwc.GLOBAL_APPLICATION_POLICY_SET) {
                    var deleteActionConfig = ctwgc.getDeleteConfig('Delete',
                        function(rowIndex) {
                            var dataItem =
                                $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).
                                    data('contrailGrid')._dataView.getItem(rowIndex);
                            applicationPolicyEditView.model = new ApplicationPolicyModel(dataItem);
                            applicationPolicyEditView.renderDeleteApplicationPolicy ({
                                 "title": ctwl.TITLE_APP_POLICY_SET_DELETE,
                                 selectedGridData: [dataItem],
                                 callback: function () {
                                     var dataView =
                                         $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).
                                               data("contrailGrid")._dataView;
                                     dataView.refreshData();
                         }});
                     });
                    rowActionConfig.push(deleteActionConfig);
                 }
                 var firewallRuleConfig = ctwgc.getActiveDnsConfig('View Firewall Rules',
                         function(rowIndex) {
                         var dataItem = $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).
                             data('contrailGrid')._dataView.getItem(rowIndex), uuidList = [];
                         _.each(dataItem.firewall_policy_refs, function(row) {
                            uuidList.push(row.uuid);
                         });
                         fwPolicyWizardEditView.model = new FWPolicyWizardModel();
                         fwPolicyWizardEditView.renderFirewallRule({
                                         "title": 'Firewall Rules Associated with Application Policy Set',
                                         'uuidList': uuidList,
                                         'isGlobal': viewConfig.isGlobal,
                                         'projectSelectedValueData': _.get(viewConfig, "viewConfig.projectSelectedValueData", false)
                         });
                  });
                  if(dc.firewall_policy_refs !== undefined && dc.firewall_policy_refs.length > 0){
                      rowActionConfig.push(firewallRuleConfig);
                  }
                  return rowActionConfig;
        }
    }
    function getHeaderActionConfig(viewConfig) {
        if(cowu.isAdmin() === false && viewConfig.isGlobal === true){
            return false;
        }
        else{
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_APP_POLICY_SET_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteAppPolicy',
                "onClick" : function() {
                    var applicationPolicyModel = new ApplicationPolicyModel();
                    var checkedRows = $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).data("contrailGrid").getCheckedRows();
                    if(checkedRows && checkedRows.length > 0) {
                        applicationPolicyEditView.model = applicationPolicyModel;
                        applicationPolicyEditView.renderDeleteApplicationPolicy(
                            {"title": ctwl.TITLE_APP_POLICY_SET_MULTI_DELETE,
                                selectedGridData: checkedRows,
                                callback: function () {
                                    var dataView =
                                        $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).
                                        data("contrailGrid")._dataView;
                                    dataView.refreshData();
                                }
                            }
                        );
                    }
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_APP_POLICY_SET,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                        fwPolicyWizardEditView.model = new FWPolicyWizardModel();
                        fwPolicyWizardEditView.renderFwWizard({
                                        "title": ctwl.TITLE_CREATE_APP_POLICY_SET,
                                        'viewConfig': $.extend(viewConfig.viewConfig, { mode: 'add', isGlobal: viewConfig.isGlobal , 
                                         seletedRows : [], isWizard: true, wizardMode: 'aps'}),
                                         callback: function () {
                             $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).data("contrailGrid")._dataView.refreshData();}
                        });
                }
            }
        ];
    }
        return headerActionConfig;
    }
    function getApplicationPolicyDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                       {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-12',
                                    rows: [
                                        {
                                            title: ctwl.CFG_VN_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    label: 'Name',
                                                    key: 'name',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Display Name',
                                                    key: 'display_name',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'UUID',
                                                    key: 'uuid',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'id_perms',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Description',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'setDescriptionFormatter'
                                                    }
                                                },/*
                                                {
                                                    key: 'firewall_policy_refs',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'FW Policies',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'setNoOfPoliciesFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'id_perms',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Shared',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'setIsSharedFormatter'
                                                    }
                                                },*/
                                                {
                                                    key: 'id_perms',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Last Updated',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'setLastUpdateFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'FW Policies',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'setFirewallPolicyFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Global Apply',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'isGlobalFormatter'
                                                    }
                                                }
                                            ].concat(ctwu.getTagsApplicationDetails())
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };
    
    this.setNoOfPoliciesFormatter = function(value, dc) {
        return noOfPoliciesFormatter(null, null, null, value, dc, true);
    };
    this.setLastUpdateFormatter = function(value, dc) {
        return lastUpdateExpFormatter(null, null, null, value, dc, true);
    };
    this.setIsGlobalFormatter = function(value, dc){
        return isGlobalFormatter(null, null, null, value, dc, true);
    };
    this.isGlobalFormatter = function(value, dc){
        var apsGlobal = getValueByJsonPath(dc, 'is_global'), isGlobal;
        if(apsGlobal !== undefined){
            if(apsGlobal){
                isGlobal = 'Enabled';
                return isGlobal;
            }else{
                isGlobal = 'Disabled';
                return isGlobal;
            }
        }else{
            return '-';
        }
    };
    this.setIsSharedFormatter = function(value, dc){
        return isSharedFormatter(null, null, null, value, dc, true);
    };
    this.setDescriptionFormatter = function(value, dc){
        return descriptionFormatter(null, null, null, value, dc, true);
    };
    this.setFirewallPolicyFormatter = function(value, dc){
        var policy = getValueByJsonPath(dc, 'firewall_policy_refs',[]),policyList = [];
         var policy =
             _.sortBy(policy, function (pol) {
                 var sequence =
                    Number(getValueByJsonPath(pol, 'attr;sequence', 0));
                 return ((1 + sequence) * 100000 ) - sequence;
            });
        var returnString = '';
        for(var i = 0; i < policy.length; i++){
            var to = policy[i].to;
            var name = to[to.length - 1];
            var text = '<span>'+ name +'</span>';
            policyList.push(text);
        }
        if(policyList.length > 0){
            for(var j = 0; j< policyList.length; j++){
                if(policyList[j]) {
                    returnString += policyList[j] + "<br>";
                }
            }
        }else{
            returnString = '-';
        }
        return returnString;
    };
    function isSharedFormatter(r, c, v, cd, dc, showAll){
        var enable = getValueByJsonPath(dc, 'id_perms;enable'), shared;
        if(enable){
            shared = 'Enabled';
        }else{
            shared = 'Disabled';
        }
        return  shared;
    }
    function descriptionFormatter(r, c, v, cd, dc, showAll){
        var description = getValueByJsonPath(dc, 'id_perms;description','-');
        return  description;
    }
    function noOfPoliciesFormatter(r, c, v, cd, dc, showAll){
        var policyRefs = getValueByJsonPath(dc, 'firewall_policy_refs',[]);
        var noOfRefs = policyRefs.length
        return  noOfRefs;
    }
    function lastUpdateFormatter(r, c, v, cd, dc, showAll){
        var lastUpdated = getValueByJsonPath(dc, "id_perms;last_modified", '', false);
        if(lastUpdated) {
            lastUpdated = moment(lastUpdated, '').format('DD MMM YYYY');
        } else {
            lastUpdated = '-';
        }
        return lastUpdated;
    }
    function lastUpdateExpFormatter(r, c, v, cd, dc, showAll){
        var lastUpdated = getValueByJsonPath(dc, "id_perms;last_modified", '', false);
        if(lastUpdated) {
            lastUpdated = moment(lastUpdated, '').format('DD MMM YYYY HH:mm:ss');
        } else {
            lastUpdated = '-';
        }
        return lastUpdated;
    }
   return applicationPolicyGridView;
});