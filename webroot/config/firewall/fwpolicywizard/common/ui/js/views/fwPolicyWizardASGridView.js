/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/addressgroup/ui/js/models/addressGroupModel',
    'config/firewall/common/addressgroup/ui/js/views/addressGroupEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/overlayAddressGroupEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils'
], function (_, ContrailView, AddressGroupModel, AddressGroupEditView, OverlayAddressGroupEditView, FWZUtils) {
    var addressGroupEditView = new AddressGroupEditView(),
        overlayAddressGroupEditView = new OverlayAddressGroupEditView(),
        gridElId = "#" + ctwc.FW_WZ_SECURITY_POLICY_ADDRESS_GRP_GRID_ID;
    var fwzUtils = new FWZUtils();
    var addressGroupGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getAddressGroupGridViewConfig(viewConfig));
        }
    });

    var getAddressGroupGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_ADDRESS_GRP_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.FW_WZ_SECURITY_POLICY_ADDRESS_GRP_GRID_ID,
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
                    text: ctwl.TITLE_SEC_GRP_ADDRESS_GROUP
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
    function getRowActionConfig(viewConfig) {
        var rowActionConfig = [
            ctwgc.getEditConfig('Edit', function(rowIndex) {
                dataView = $('#' + ctwc.FW_WZ_SECURITY_POLICY_ADDRESS_GRP_GRID_ID).data("contrailGrid")._dataView;
                if(viewConfig.isWizard){
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
                fwzUtils.appendDeleteContainer($(arguments[1].context).parent()[0], 'fw_security_policy_global_adressgroup');
                $(".cancelWizardDeletePopup").off('click').on('click', function(){
                    if($('.confirmation-popover').length != 0){
                        $('.confirmation-popover').remove();
                        $('#overlay-background-id').removeClass('overlay-background');
                    }
                });
                $(".saveWizardRecords").off('click').on('click', function(){
                    var dataItem = $('#fw_security_policy_as_grid_view').data('contrailGrid')._dataView.getItem(rowIndex);
                    var model = new AddressGroupModel();
                    model.deleteAddressGroup([dataItem],{
                        success: function () {
                            if($('#fw_security_policy_as_grid_view').data("contrailGrid") !== undefined){
                                $('#fw_security_policy_as_grid_view').data('contrailGrid')._dataView.refreshData();
                           }
                            if($('#security-policy-address-grp-grid').data("contrailGrid") !== undefined){
                                 $('#security-policy-address-grp-grid').data('contrailGrid')._dataView.refreshData();
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
                            $("#fw_security_policy_as_grid_view .grid-header").append("<div id='fw-wizard-details-error-container'></div>");
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
            })
        ];
        return rowActionConfig;
    }
    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_ADDRESS_GROUP_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteAddressGrp',
                "onClick" : function() {
                    fwzUtils.appendDeleteContainer($('#btnDeleteAddressGrp')[0], 'fw_security_policy_global_adressgroup');
                    $(".cancelWizardDeletePopup").off('click').on('click', function(e){
                        if($('.confirmation-popover').length != 0){
                            $('.confirmation-popover').remove();
                            $('#overlay-background-id').removeClass('overlay-background');
                        }
                    });
                    $(".saveWizardRecords").off('click').on('click', function(){
                        var checkedRows = $('#fw_security_policy_as_grid_view').data('contrailGrid').getCheckedRows();
                        if(checkedRows && checkedRows.length > 0) {
                            var model = new AddressGroupModel();
                            model.deleteAddressGroup(checkedRows, {
                                success: function () {
                                    if($('#security-policy-address-grp-grid').data("contrailGrid") !== undefined){
                                        $('#security-policy-address-grp-grid').data('contrailGrid')._dataView.refreshData();
                                   }
                                    if($('#fw_security_policy_as_grid_view').data("contrailGrid") !== undefined){
                                        $('#fw_security_policy_as_grid_view').data('contrailGrid')._dataView.refreshData();
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
                                    $("#fw_security_policy_as_grid_view .grid-header").append("<div id='fw-wizard-details-error-container'></div>");
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
                            'isGlobal': viewConfig.isGlobal
                        });
                    }else{
                        addressGroupEditView.model = new AddressGroupModel();
                        addressGroupEditView.renderAddEditAddressGroup({
                                                  "title": 'Create',
                                                  'mode': 'add',
                                                  'isGlobal': viewConfig.isGlobal,
                                                  callback: function () {
                           $('#' + ctwc.FW_WZ_SECURITY_POLICY_ADDRESS_GRP_GRID_ID).data("contrailGrid")._dataView.refreshData();
                        }});
                    }
                }
            }

        ];
        return headerActionConfig;
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

