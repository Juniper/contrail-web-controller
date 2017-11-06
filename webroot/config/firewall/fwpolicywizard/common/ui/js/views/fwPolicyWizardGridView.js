/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'moment',
    'backbone',
    'contrail-view',
    'config/firewall/fwpolicywizard/common/ui/js/models/fwPolicyWizardModel',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwApplicationPolicyEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils'
], function (_, moment, Backbone, ContrailView, FwPolicyWizardModel, FwApplicationPolicyEditView,FWZUtils) {
    var fwApplicationPolicyEditView = new FwApplicationPolicyEditView(),
        fwzUtils = new FWZUtils(),
        gridElId = "#" + ctwc.NEW_APPLICATION_POLICY_SET_GRID_ID;

    var fwPolicyWizardGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
                self.renderView4Config(self.$el, self.model,
                                  getAppPolicyGridViewConfig(viewConfig));
        }
    });

    var getAppPolicyGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.NEW_APPLICATION_POLICY_SET_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.NEW_APPLICATION_POLICY_SET_GRID_ID,
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
            footer: {
                pager: {
                    options: {
                        pageSize: 10,
                        pageSizeSelect: [10, 50, 100]
                    }
                }
            }
        };
        return gridElementConfig;
    };
    function getRowActionConfig(dc) {
        var viewConfig = this, policy = [],
            appPolicySetName = getValueByJsonPath(dc, 'name', '', false),
            rowActionConfig = [
            ctwgc.getEditConfig('Edit', function(rowIndex) {
                $("#overlay-background-id").addClass("overlay-background");
                var dataItem = $('#' + ctwc.NEW_APPLICATION_POLICY_SET_GRID_ID).
                        data('contrailGrid')._dataView.getItem(rowIndex);
                fwApplicationPolicyEditView.model = new FwPolicyWizardModel(dataItem);
                if(dataItem.firewall_policy_refs !== undefined){
                   policy = dataItem.firewall_policy_refs.reverse();
                }
                var apsName = dataItem.fq_name[dataItem.fq_name.length - 1];
                fwApplicationPolicyEditView.renderApplicationPolicy({
                                          'viewConfig': $.extend({mode: 'edit'}, viewConfig),
                                          'policy': policy,
                                          'apsName':apsName
                });
            })];
        if(appPolicySetName !== ctwc.GLOBAL_APPLICATION_POLICY_SET) {
            var deleteActionConfig = ctwgc.getDeleteConfig('Delete',
                function(rowIndex) {
                fwzUtils.appendDeleteContainer($(arguments[1].context).parent()[0], 'new-application-policy-set');
                $(".cancelWizardDeletePopup").off('click').on('click', function(){
                    if($('.confirmation-popover').length != 0){
                        $('.confirmation-popover').remove(); 
                        $('#overlay-background-id').removeClass('overlay-background');
                    }
                });
                $(".saveWizardRecords").off('click').on('click', function(){
                    var dataItem = $('#' + ctwc.NEW_APPLICATION_POLICY_SET_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
                    var model = new FwPolicyWizardModel();
                    model.deleteApplicationPolicy([dataItem], {
                        success: function () {
                            $('#' + ctwc.NEW_APPLICATION_POLICY_SET_GRID_ID).
                            data('contrailGrid')._dataView.refreshData();
                            $('#' + ctwc.NEW_APPLICATION_POLICY_SET_GRID_ID).data("contrailGrid").refreshGrid();
                            $('#overlay-background-id').removeClass('overlay-background');
                            if($('.confirmation-popover').length != 0){
                                $('.confirmation-popover').remove();
                                $('#overlay-background-id').removeClass('overlay-background');
                            }
                        },
                        error: function (error) {
                            /*$("#grid-details-error-container").text('');
                            $("#grid-details-error-container").text(error.responseText);
                            $(".aps-details-error-container").show();*/
                        }
                    });
                });
             })
             rowActionConfig.push(deleteActionConfig);
        }
        if(appPolicySetName === ctwc.STANDALONE_FIREWALL_POLICIES ||
                appPolicySetName === ctwc.ALL_FIREWALL_POLICIES){
                 return false;
        }
        else{
            return rowActionConfig;
        }
    }
    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : 'Application Policy Set Multi Delete',
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteAppPolicy',
                "onClick" : function() {
                    fwzUtils.appendDeleteContainer($('#btnDeleteAppPolicy')[0], 'new-application-policy-set');
                    $(".cancelWizardDeletePopup").off('click').on('click', function(){
                        if($('.confirmation-popover').length != 0){
                            $('.confirmation-popover').remove(); 
                            $('#overlay-background-id').removeClass('overlay-background');
                        }
                    });
                    $(".saveWizardRecords").off('click').on('click', function(){
                        var checkedRows = $('#' + ctwc.NEW_APPLICATION_POLICY_SET_GRID_ID).data('contrailGrid').getCheckedRows();
                        if(checkedRows && checkedRows.length > 0) {
                            var model = new FwPolicyWizardModel();
                            model.deleteApplicationPolicy(checkedRows, {
                                success: function () {
                                    $('#' + ctwc.NEW_APPLICATION_POLICY_SET_GRID_ID).
                                    data('contrailGrid')._dataView.refreshData();
                                    $('#' + ctwc.NEW_APPLICATION_POLICY_SET_GRID_ID).data("contrailGrid").refreshGrid();
                                    $('#overlay-background-id').removeClass('overlay-background');
                                    if($('.confirmation-popover').length != 0){
                                        $('.confirmation-popover').remove();
                                        $('#overlay-background-id').removeClass('overlay-background');
                                    }
                                },
                                error: function (error) {
                                    /*$("#grid-details-error-container").text('');
                                    $("#grid-details-error-container").text(error.responseText);
                                    $(".aps-details-error-container").show();*/
                                }
                            });  
                        }
                    });
                }

            },
            {
                "type" : "custom-link",
                "title" : "Create stand alone firewall policy",
                "iconTitle":'Firewall Policy',
                "iconClass" : "fa fa-plus",
                "linkElementId": 'btnAddPolicy-firewall-policy',
                "onClick" : function() {
                    newApplicationSet = {};
                    policyEditSet = {};
                    $('#applicationpolicyset_policy_wizard .actions').css("display", "block");
                    $('#aps-main-back-button').hide();
                    $($('#applicationpolicyset_policy_wizard a.btn-primary')[0]).trigger("click");
                    return;
                }
            },
            {
                "type" : "custom-link",
                "title" : "Create application policy set",
                "iconClass" : "fa fa-plus",
                "iconTitle":'Policy Set',
                "linkElementId": 'btnAddPolicy-app-set',
                "onClick" : function() {
                    fwzUtils.createApplicationPolicySet();
                    fwApplicationPolicyEditView.model = new FwPolicyWizardModel();
                    fwApplicationPolicyEditView.renderApplicationPolicy({
                                              'viewConfig': $.extend({mode:'add'}, viewConfig)
                    });
                }
            }
        ];
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
                                                },
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
   return fwPolicyWizardGridView;
});

