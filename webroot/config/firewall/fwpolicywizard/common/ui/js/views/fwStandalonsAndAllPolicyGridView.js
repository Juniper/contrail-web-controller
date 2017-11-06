/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/fwpolicy/ui/js/fwPolicyFormatter',
    'config/firewall/common/fwpolicy/ui/js/models/fwPolicyModel',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils'
], function(_, ContrailView, FWPolicyFormatter, FWPolicyModel, FWZUtils) {
    var self, gridElId = '#' + ctwc.FW_STANDALONE_ALL_POLICY_GRID_ID, gridObj,
      fwPolicyFormatter = new FWPolicyFormatter(),
      fwzUtils = new FWZUtils();
    var fwStandalonsAndAllPolicyGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                getStandaloneAndAllPolicyGridViewConfig(viewConfig));
        }
    });


    function getStandaloneAndAllPolicyGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.FW_STANDALONE_ALL_POLICY_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.FW_STANDALONE_ALL_POLICY_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig:
                                        getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getRowActionConfig(viewConfig) {
        var rowActionConfig = [];
            rowActionConfig.push(ctwgc.getDeleteAction(function (rowIndex) {
                  fwzUtils.appendDeleteContainer($(arguments[1].context).parent()[0], ctwc.FW_STANDALONE_ALL_POLICY_ID, true);
                     $(".cancelWizardDeletePopup").off('click').on('click', function(){
                         if($('.confirmation-popover').length != 0){
                             $('.confirmation-popover').remove(); 
                             $('#delete-popup-background').removeClass('overlay-background');
                         }
                     });
                     $(".saveWizardRecords").off('click').on('click', function(){
                         var dataItem = $('#' + ctwc.FW_STANDALONE_ALL_POLICY_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
                         var model = new FWPolicyModel();
                         model.deleteFWPolicies([dataItem], {
                             success: function () {
                                 $('#' + ctwc.FW_STANDALONE_ALL_POLICY_GRID_ID).
                                 data('contrailGrid')._dataView.refreshData();
                                 $('#' + ctwc.FW_STANDALONE_ALL_POLICY_GRID_ID).data("contrailGrid").refreshGrid();
                                 $('#delete-popup-background').removeClass('overlay-background');
                                 if(dataItem.application_policy_set_back_refs){
                                     $("#firewall_policies_all").text($("#firewall_policies_all").text()-1);
                                     $("#stand_alone_policies").text($("#stand_alone_policies").text());
                                 }
                                 else{
                                     $("#firewall_policies_all").text($("#firewall_policies_all").text()-1);
                                     $("#stand_alone_policies").text($("#stand_alone_policies").text()-1);
                                 }
                                 if($('.confirmation-popover').length != 0){
                                     $('.confirmation-popover').remove();
                                     $('#delete-popup-background').removeClass('overlay-background');
                                 }
                             },
                             error: function (error) {
                                 $("#grid-details-error-container").text('');
                                 $("#grid-details-error-container").text(error.responseText);
                                 $(".aps-details-error-container").show();
                                 if($('.confirmation-popover').length != 0){
                                     $('.confirmation-popover').remove(); 
                                     $('#delete-popup-background').removeClass('overlay-background');
                                 }
                             }
                         });
                     });
              }));
         return rowActionConfig; 
    };

    function getConfiguration (viewConfig) {
        var title;
        if(viewConfig.isWizard == true){
            title = '';
        }
        else{
            title = ctwl.TITLE_FW_POLICY;
        }
        var gridElementConfig = {
            header: {
                title: {
                    text: title
                },
               advanceControls: getHeaderActionConfig(viewConfig)
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteFWPolicy').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteFWPolicy').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                                    getFWPolicyExpDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Firewall Policies..'
                    },
                    empty: {
                        text: 'No Firewall Policy Found.'
                    }
                }
            },
            columnHeader: { columns: getfwPolicyColumns(viewConfig)},
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

    function getHeaderActionConfig(viewConfig) {
            var headerActionConfig = [
                {
                    "type" : "link",
                    "title" : ctwl.TITLE_FW_POLICY_MULTI_DELETE,
                    "iconClass": 'fa fa-trash',
                    "linkElementId": 'btnDeleteFWPolicy',
                    "onClick" : function() {
                        fwzUtils.appendDeleteContainer($('#btnDeleteFWPolicy')[0], ctwc.FW_STANDALONE_ALL_POLICY_ID, true);
                        $(".cancelWizardDeletePopup").off('click').on('click', function(){
                            if($('.confirmation-popover').length != 0){
                                $('.confirmation-popover').remove(); 
                                $('#delete-popup-background').removeClass('overlay-background');
                            }
                        });
                        $(".saveWizardRecords").off('click').on('click', function(){
                            var checkedRows = $('#' + ctwc.FW_STANDALONE_ALL_POLICY_GRID_ID).data('contrailGrid').getCheckedRows();
                            if(checkedRows && checkedRows.length > 0) {
                                var model = new FWPolicyModel();
                                model.deleteFWPolicies(checkedRows, {
                                    success: function () {
                                        $('#' + ctwc.FW_STANDALONE_ALL_POLICY_GRID_ID).
                                        data('contrailGrid')._dataView.refreshData();
                                        $('#' + ctwc.FW_STANDALONE_ALL_POLICY_GRID_ID).data("contrailGrid").refreshGrid();
                                        $('#delete-popup-background').removeClass('overlay-background');
                                        for(var i=0; i<checkedRows.length; i++){
                                            if(checkedRows[i].application_policy_set_back_refs){
                                                $("#firewall_policies_all").text($("#firewall_policies_all").text()-1);
                                                $("#stand_alone_policies").text($("#stand_alone_policies").text());
                                            }
                                            else{
                                                $("#firewall_policies_all").text($("#firewall_policies_all").text()-1);
                                                $("#stand_alone_policies").text($("#stand_alone_policies").text()-1);
                                            }
                                        }
                                        if($('.confirmation-popover').length != 0){
                                            $('.confirmation-popover').remove();
                                            $('#delete-popup-background').removeClass('overlay-background');
                                        }
                                    },
                                    error: function (error) {
                                        $("#grid-details-error-container").text('');
                                        $("#grid-details-error-container").text(error.responseText);
                                        $(".aps-details-error-container").show();
                                        if($('.confirmation-popover').length != 0){
                                            $('.confirmation-popover').remove();
                                            $('#delete-popup-background').removeClass('overlay-background');
                                        }
                                    }
                               }); 
                            }
                        });
                    }
                },
                {
                    "type" : "link",
                    "title" : 'Create Stand Alone Firewall Policy',
                    "iconClass" : "fa fa-plus",
                    "onClick" : function() {
                        newApplicationSet = {};
                        policyEditSet = {};
                        policyEditSet.mode = 'add';
                        policyEditSet.state = viewConfig.mode;
                        $("#aps-overlay-container").hide();
                        $("#overlay-background-id").removeClass("overlay-background");
                        $('#applicationpolicyset_policy_wizard .actions').css("display", "block");
                        $('#aps-main-back-button').hide();
                        $($('#applicationpolicyset_policy_wizard a.btn-primary')[0]).trigger("click");
                    }
                }
            ];
            return headerActionConfig;
    };

    function onPolicyClick (e, dc) {
        policyEditSet = {};
        newApplicationSet = {};
        policyEditSet.model = dc;
        $("#overlay-background-id").removeClass("overlay-background");
        policyEditSet.mode = 'edit';
        policyEditSet.state = this.viewConfig.mode;
        policyEditSet.uuid = dc.uuid;
        $("#aps-overlay-container").hide();
        $('#applicationpolicyset_policy_wizard .actions').css("display", "block");
        $('#aps-main-back-button').hide();
        $($('#applicationpolicyset_policy_wizard a.btn-primary')[0]).trigger("click");
    }

    function getfwPolicyColumns(viewConfig){
    	var fwPolicyColumns = [{
            id: 'name',
            field: 'name',
            name: 'Name',
            cssClass: 'cell-hyperlink-blue',
            events : {
                onClick : onPolicyClick.bind({viewConfig:viewConfig})
            }
         }, {
             id: 'id_perms.description',
             field: 'id_perms.description',
             name: 'Description',
             minWidth : 150,
             formatter: fwPolicyFormatter.policyDescriptionFormatter
          }, {
              id: 'application_policy_set_back_refs',
              field: 'application_policy_set_back_refs',
              name: 'Member of Application Policy Sets',
              minWidth : 150,
              formatter: fwPolicyFormatter.policySetFormatter
           }, {
             id: 'firewall_rule_refs',
             field: 'firewall_rule_refs',
             name: 'Rules',
            // cssClass: 'cell-hyperlink-blue',
             //events : {
               //  onClick : onPolicyClick.bind({viewConfig:viewConfig})
             //},
             minWidth : 80,
             formatter:
                 fwPolicyFormatter.fwRuleFormatter
         }, {
             id: 'id_perms.last_modified',
             field: 'id_perms.last_modified',
             name: 'Last Updated',
             formatter: fwPolicyFormatter.lastUpdateFormatter
         }];
    	return fwPolicyColumns;
    };
    function getFWPolicyExpDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-12',
                            rows: [{
                                keyClass:'col-xs-3',
                                valueClass:'col-xs-9',
                                title: 'Details',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: 'name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Name'
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: 'display_name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Display Name'
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID"
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "id_perms.description",
                                    templateGenerator: "TextGenerator",
                                    label: "Description",
                                    templateGeneratorConfig: {
                                        formatter: "policyDescriptionFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Member of Application Policy Sets",
                                    templateGeneratorConfig: {
                                        formatter: "policySetFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Number of Rules",
                                    templateGeneratorConfig: {
                                        formatter: "fwRuleFormatter"
                                    }
                                },{
                                    key: "id_perms.last_modified",
                                    templateGenerator: "TextGenerator",
                                    label: "Last Updated",
                                    templateGeneratorConfig: {
                                        formatter: "lastUpdateExpFormatter"
                                    }
                                }].concat(ctwu.getTagsExpandDetails())
                           }]
                      }]
                    }
                }]
            }
        };
    };

    this.fwRuleFormatter = function(v, dc) {
        return fwPolicyFormatter.fwRuleFormatter("", "", v, "", dc);
    };

    this.policySetFormatter = function(v, dc) {
        return fwPolicyFormatter.policySetFormatter("", "", v, "", dc);
    };

    this.policyDescriptionFormatter = function(v, dc) {
        return fwPolicyFormatter.policyDescriptionFormatter("", "", v, "", dc);
    };

    this.lastUpdateFormatter = function(v, dc) {
        return fwPolicyFormatter.lastUpdateFormatter("", "", v, "", dc);
    };

    this.lastUpdateExpFormatter = function(v, dc) {
        return fwPolicyFormatter.lastUpdateExpFormatter("", "", v, "", dc);
    };

    return fwStandalonsAndAllPolicyGridView;
});

