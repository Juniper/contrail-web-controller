/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'config/firewall/common/addressgroup/ui/js/models/addressGroupModel',
    'config/firewall/common/addressgroup/ui/js/views/addressGroupEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/overlayAddressGroupEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils',
    'knockback',
], function (_, ContrailView, AddressGroupModel, AddressGroupEditView, OverlayAddressGroupEditView,FWZUtils,Knockback) {
    var addressGroupEditView = new AddressGroupEditView(),
        overlayAddressGroupEditView = new OverlayAddressGroupEditView(),
        gridElId = "#" + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID;
    var fwzUtils = new FWZUtils();

    var addressGroupGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                elementId = _.get(viewConfig, 'elementIdPrefix', '');
                pagerOptions = viewConfig['pagerOptions'];
                var draftMode ="";
                if(viewConfig.viewMode == ctwc.FW_DRAFTED){
                    draftMode = " - Drafts";
                }
                viewConfig.draftTitle = draftMode;
            self.renderView4Config(self.$el, self.model,
                                   getAddressGroupGridViewConfig(viewConfig,elementId));
            $("#aps-back-button").off('click').on('click', function(){
                $('#helper').show();
                if(viewConfig.wizardMode === "policy"){
                    $('.modal-header-title').text("Create Firewall Policy");
                }
                else{
                    $('.modal-header-title').text("Create Application Policy Set");
                }
                $('#aps-overlay-container').hide();
                $("#overlay-background-id").removeClass("overlay-background");
                Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                $("#aps-gird-container").empty();
            });
        }
    });

    var getAddressGroupGridViewConfig = function (viewConfig,elementId) {
        return {
            elementId: cowu.formatElementId([ctwc.SECURITY_POLICY_ADDRESS_GRP_LIST_VIEW_ID.concat(elementId)]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID.concat(elementId),
                                title: ctwl.TITLE_SEC_GRP_ADDRESS_GROUP,
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
                    text: ctwl.TITLE_SEC_GRP_ADDRESS_GROUP + viewConfig.draftTitle
                },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteAddressGrp').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteAddressGrp').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getAddressGrpDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Address Groups..'
                    },
                    empty: {
                        text: 'No Address Groups Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                        {
                             field: 'name',
                             name: 'Name',
                             id: 'name'
                        },
                        {
                            id: "prefix",
                            field: "prefix",
                            name: "Prefix",
                            formatter: prefixFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        }
                ]
            },
        };
        return gridElementConfig;
    };
    function getRowActionConfig(viewConfig) {
        if(cowu.isAdmin() === false && viewConfig['is_global'] === true){
            return false;
        }
        else{
            var rowActionConfig = [
                ctwgc.getEditConfig('Edit', function(rowIndex) {
                    if(viewConfig.isWizard){
                        dataView = $('#security-policy-address-grp-grid_fw_wizard').data("contrailGrid")._dataView;
                        if($("#fw-wizard-details-error-container")){
                            $("#fw-wizard-details-error-container").remove();
                        }
                        overlayAddressGroupEditView.model = new AddressGroupModel(dataView.getItem(rowIndex));
                        overlayAddressGroupEditView.renderAddressGroup({
                                                'mode':'edit',
                                                'viewConfig': viewConfig,
                                                'isGlobal': viewConfig.isGlobal
                        });
                    }else{
                        dataView = $('#security-policy-address-grp-grid_standalone').data("contrailGrid")._dataView;
                        addressGroupEditView.model = new AddressGroupModel(dataView.getItem(rowIndex));
                        addressGroupEditView.renderAddEditAddressGroup({
                                              "title": 'Edit Address Group',
                                              'mode':'edit',
                                              'isGlobal': viewConfig.isGlobal,
                                               callback: function () {
                                                  dataView.refreshData();
                        }});
                    }
                }),
                ctwgc.getDeleteConfig('Delete', function(rowIndex) {
                   if(viewConfig.isWizard){
                       fwzUtils.appendDeleteContainer($(arguments[1].context).parent()[0], 'security-policy-address-group_fw_wizard');
                       $(".cancelWizardDeletePopup").off('click').on('click', function(){
                           if($('.confirmation-popover').length != 0){
                               $('.confirmation-popover').remove();
                               $('#overlay-background-id').removeClass('overlay-background');
                           }
                       });
                       $(".saveWizardRecords").off('click').on('click', function(){
                           var dataItem = $('#security-policy-address-grp-grid_fw_wizard').data('contrailGrid')._dataView.getItem(rowIndex);
                           var model = new AddressGroupModel();
                           model.deleteAddressGroup([dataItem],{
                               success: function () {
                                   if($('#security-policy-address-grp-grid_fw_wizard').data("contrailGrid") !== undefined){
                                       $('#security-policy-address-grp-grid_fw_wizard').data('contrailGrid')._dataView.refreshData();
                                  }
                                   if($('#security-policy-address-grp-grid_standalone').data("contrailGrid") !== undefined){
                                        $('#security-policy-address-grp-grid_standalone').data('contrailGrid')._dataView.refreshData();
                                   }
                                   if($("#fw-wizard-details-error-container")){
                                       $("#fw-wizard-details-error-container").remove();
                                   }
                                   if($('.confirmation-popover').length != 0){
                                       $('.confirmation-popover').remove();
                                       $('#overlay-background-id').removeClass('overlay-background');
                                   }
                               },
                               error: function (error) {
                                   $("#security-policy-address-grp-grid_fw_wizard .grid-header").append("<div id='fw-wizard-details-error-container'></div>");
                                   $("#fw-wizard-details-error-container").text('');
                                   $("#fw-wizard-details-error-container").text(error.responseText);
                                   $("#fw-wizard-details-error-container").addClass('alert-error');
                                   if($('.confirmation-popover').length != 0){
                                       $('.confirmation-popover').remove();
                                       $('#overlay-background-id').removeClass('overlay-background');
                                   }
                               }
                           });
                       });
                   }else{
                       var dataItem = $('#security-policy-address-grp-grid_standalone').data('contrailGrid')._dataView.getItem(rowIndex);
                       addressGroupEditView.model = new AddressGroupModel(dataItem);
                       addressGroupEditView.renderDeleteAddressGrp({
                                              "title": ctwl.TITLE_ADDRESS_GROUP_DELETE,
                                              selectedGridData: [dataItem],
                                              callback: function () {
                                                  var dataView = $('#security-policy-address-grp-grid_standalone').data("contrailGrid")._dataView;
                                                  dataView.refreshData();
                       }});
                   }
                })
            ];
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
                    "title" : ctwl.TITLE_ADDRESS_GROUP_MULTI_DELETE,
                    "iconClass": 'fa fa-trash',
                    "linkElementId": 'btnDeleteAddressGrp',
                    "onClick" : function() {
                        if(viewConfig.isWizard){
                            fwzUtils.appendDeleteContainer($('#btnDeleteAddressGrp')[0], 'security-policy-address-group_fw_wizard');
                            $(".cancelWizardDeletePopup").off('click').on('click', function(e){
                                if($('.confirmation-popover').length != 0){
                                    $('.confirmation-popover').remove();
                                    $('#overlay-background-id').removeClass('overlay-background');
                                }
                            });
                            $(".saveWizardRecords").off('click').on('click', function(){
                                var checkedRows = $('#security-policy-address-grp-grid_fw_wizard').data('contrailGrid').getCheckedRows();
                                if(checkedRows && checkedRows.length > 0) {
                                    var model = new AddressGroupModel();
                                    model.deleteAddressGroup(checkedRows, {
                                        success: function () {
                                            if($('#security-policy-address-grp-grid_standalone').data("contrailGrid") !== undefined){
                                                $('#security-policy-address-grp-grid_standalone').data('contrailGrid')._dataView.refreshData();
                                           }
                                            if($('#security-policy-address-grp-grid_fw_wizard').data("contrailGrid") !== undefined){
                                                $('#security-policy-address-grp-grid_fw_wizard').data('contrailGrid')._dataView.refreshData();
                                           }
                                            if($("#fw-wizard-details-error-container")){
                                                $("#fw-wizard-details-error-container").remove();
                                            }
                                            if($('.confirmation-popover').length != 0){
                                                $('.confirmation-popover').remove();
                                                $('#overlay-background-id').removeClass('overlay-background');
                                            }
                                        },
                                        error: function (error) {
                                            $("#security-policy-address-grp-grid_fw_wizard .grid-header").append("<div id='fw-wizard-details-error-container'></div>");
                                            $("#fw-wizard-details-error-container").text('');
                                            $("#fw-wizard-details-error-container").text(error.responseText);
                                            $("#fw-wizard-details-error-container").addClass('alert-error');
                                            if($('.confirmation-popover').length != 0){
                                                $('.confirmation-popover').remove();
                                                $('#overlay-background-id').removeClass('overlay-background');
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        else{
                            var addressGroupModel = new AddressGroupModel();
                            var checkedRows = $('#security-policy-address-grp-grid_standalone').data("contrailGrid").getCheckedRows();
                            if(checkedRows && checkedRows.length > 0) {
                                    addressGroupEditView.model = addressGroupModel;
                                    addressGroupEditView.renderDeleteAddressGrp(
                                        {"title": ctwl.TITLE_ADDRESS_GROUP_MULTI_DELETE,
                                            selectedGridData: checkedRows,
                                            callback: function () {
                                                var dataView =
                                                    $('#security-policy-address-grp-grid_standalone').
                                                    data("contrailGrid")._dataView;
                                                dataView.refreshData();
                                            }
                                        }
                                    );
                            }
                        }
                    }

                },
                {
                    "type": "link",
                    "title": ctwl.TITLE_CREATE_ADDRESS_GROUP,
                    "iconClass": "fa fa-plus",
                    "onClick": function () {
                        if(viewConfig.isWizard){
                            $("#overlay-background-id").addClass("overlay-background");
                            if($("#fw-wizard-details-error-container")){
                                $("#fw-wizard-details-error-container").remove();
                            }
                            overlayAddressGroupEditView.model = new AddressGroupModel();
                            overlayAddressGroupEditView.renderAddressGroup({
                                'mode': 'add',
                                'viewConfig': viewConfig,
                                'isGlobal': viewConfig.isGlobal,
                                callback: function () {
                                    $('#security-policy-address-grp-grid_fw_wizard').
                                    data("contrailGrid")._dataView.refreshData();
                                }});
                         }else{
                            addressGroupEditView.model = new AddressGroupModel();
                            addressGroupEditView.renderAddEditAddressGroup({
                                                      "title": 'Create',
                                                      'mode': 'add',
                                                      'isGlobal': viewConfig.isGlobal,
                                                      callback: function () {
                                                          $('#security-policy-address-grp-grid_standalone').
                                                          data("contrailGrid")._dataView.refreshData();
                            }});
                        }
                    }
                }

            ];
            return headerActionConfig;
        }
    }

    function getAddressGrpDetailsTemplateConfig() {
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
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Display Name',
                                                    key: 'display_name',
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'UUID',
                                                    key: 'uuid',
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Prefixes',
                                                    keyClass:'col-xs-4',
                                                    templateGeneratorConfig: {
                                                        formatter: 'addressGroupFormatter'
                                                    }
                                                }
                                                
                                            ].concat(ctwu.getTagsExpandDetails())
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
    this.addressGroupFormatter = function(value, dc) {
        return prefixFormatter(null, null, null, value, dc, true);
    };
    function prefixFormatter(r, c, v, cd, dc, showAll) {
        var prefixlList = [], returnString = '';
        var  subnet = getValueByJsonPath(dc, 'address_group_prefix;subnet',[]);
        for(var i = 0; i < subnet.length; i++){
            var prefix = subnet[i].ip_prefix + '/'+ subnet[i].ip_prefix_len;
            var prefixText = '<span>'+ prefix +'</span>';
            prefixlList.push(prefixText);
        }
        if ((null != showAll) && (true == showAll)) {
        	if(prefixlList.length > 0){
        		for (var k = 0; k < prefixlList.length; k++) {
                    if (typeof prefixlList[k] !== "undefined") {
                        returnString += prefixlList[k] + "<br>";
                    }
                }
                return returnString;
        	}else{
        		return '-';
        	}
        }
        if(prefixlList.length > 0){
            for(var j = 0; j< prefixlList.length,j < 2; j++){
                if(prefixlList[j]) {
                    returnString += prefixlList[j] + "<br>";
                }
            }
            if (prefixlList.length > 2) {
                returnString += '<span class="moredataText">(' +
                    (prefixlList.length-2) + ' more)</span> \
                    <span class="moredata" style="display:none;" ></span>';
            }
        }else{
        	returnString = '-';
        }
        return  returnString;
    }
   return addressGroupGridView;
});

