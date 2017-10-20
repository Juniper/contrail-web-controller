/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/servicegroup/ui/js/models/serviceGroupModel',
    'config/firewall/common/servicegroup/ui/js/views/serviceGroupEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/overlayServiceGroupEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils'
], function (_, ContrailView, ServiceGroupModel, ServiceGroupEditView, OverlayServiceGroupEditView,FWZUtils) {
    var serviceGroupEditView = new ServiceGroupEditView(),
        overlayServiceGroupEditView = new OverlayServiceGroupEditView(),
        gridElId = "#" + ctwc.SECURITY_POLICY_SERVICE_GRP_GRID_ID;
    var fwzUtils = new FWZUtils();
    var serviceGroupGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getServiceGroupGridViewConfig(viewConfig));
        }
    });

    var getServiceGroupGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_SERVICE_GRP_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.FW_WZ_SECURITY_POLICY_SERVICE_GRP_GRID_ID,
                                title: ctwl.TITLE_SEC_GRP_SERVICE_GROUP,
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
                    text: ctwl.TITLE_SEC_GRP_SERVICE_GROUP
                },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteServiceGrp').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteServiceGrp').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getSecGrpDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Service Groups..'
                    },
                    empty: {
                        text: 'No Service Groups Found.'
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
                            id: "protocol",
                            field: "protocol",
                            name: "Protocol",
                            formatter: protocolFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        },
                        {
                            id: "dstport",
                            field: "dstport",
                            name: "Port",
                            formatter: dstPortFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        }
                        /*{
                            id: "srcport",
                            field: "srcport",
                            name: "Source Ports",
                            formatter: srcPortFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        }*/
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
    function getRowActionConfig (viewConfig) {
        var rowActionConfig = [
            ctwgc.getEditConfig('Edit', function(rowIndex) {
                dataView = $('#' + ctwc.FW_WZ_SECURITY_POLICY_SERVICE_GRP_GRID_ID).data("contrailGrid")._dataView;
                if(viewConfig.isWizard){
                    if($("#fw-wizard-details-error-container")){
                        $("#fw-wizard-details-error-container").remove();
                    }
                    overlayServiceGroupEditView.model = new ServiceGroupModel(dataView.getItem(rowIndex));
                    overlayServiceGroupEditView.renderServiceGroup({
                                            'mode':'edit',
                                            'viewConfig': viewConfig,
                                            'isGlobal': viewConfig.isGlobal
                    });
                } else{
                    serviceGroupEditView.model = new ServiceGroupModel(dataView.getItem(rowIndex));
                    serviceGroupEditView.renderAddEditServiceGroup({
                        "title": 'Edit Service Group',
                        'mode':'edit',
                        'isGlobal': viewConfig.isGlobal,
                         callback: function () {
                            dataView.refreshData();
                    }});
                }
            }),
            ctwgc.getDeleteConfig('Delete', function(rowIndex) {
                fwzUtils.appendDeleteContainer($(arguments[1].context).parent()[0], 'fw_security_policy_global_servicegroup');
                $(".cancelWizardDeletePopup").off('click').on('click', function(){
                    if($('.confirmation-popover').length != 0){
                        $('.confirmation-popover').remove();
                        $('#overlay-background-id').removeClass('overlay-background');
                    }
                });
                $(".saveWizardRecords").off('click').on('click', function(){
                    var dataItem = $('#fw_security_policy_service_gp_grid_view').data('contrailGrid')._dataView.getItem(rowIndex);
                    var model = new ServiceGroupModel();
                    model.deleteServiceGroup([dataItem],{
                        success: function () {
                            if($("#fw-wizard-details-error-container")){
                                $("#fw-wizard-details-error-container").remove();
                            }
                            if($('#fw_security_policy_service_gp_grid_view').data("contrailGrid") !== undefined){
                                $('#fw_security_policy_service_gp_grid_view').data('contrailGrid')._dataView.refreshData();
                           }
                            if($('#security-policy-service-grp-grid').data("contrailGrid") !== undefined){
                                $('#security-policy-service-grp-grid').data('contrailGrid')._dataView.refreshData();
                           }
                            if($('.confirmation-popover').length != 0){
                                $('.confirmation-popover').remove();
                                $('#overlay-background-id').removeClass('overlay-background');
                            }
                        },
                        error: function (error) {
                            $("#fw_security_policy_service_gp_grid_view .grid-header").append("<div id='fw-wizard-details-error-container'></div>");
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
                "title" : ctwl.TITLE_SERVICE_GROUP_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteServiceGrp',
                "onClick" : function() {
                    fwzUtils.appendDeleteContainer($('#btnDeleteServiceGrp')[0], 'fw_security_policy_global_servicegroup');
                    $(".cancelWizardDeletePopup").off('click').on('click', function(){
                        if($('.confirmation-popover').length != 0){
                            $('.confirmation-popover').remove();
                            $('#overlay-background-id').removeClass('overlay-background');
                        }
                    });
                    $(".saveWizardRecords").off('click').on('click', function(){
                        var checkedRows = $('#fw_security_policy_service_gp_grid_view').data('contrailGrid').getCheckedRows();
                        if(checkedRows && checkedRows.length > 0) {
                            var model = new ServiceGroupModel();
                            model.deleteServiceGroup(checkedRows, {
                                success: function () {
                                    if($('#fw_security_policy_service_gp_grid_view').data("contrailGrid") !== undefined){
                                        $('#fw_security_policy_service_gp_grid_view').data('contrailGrid')._dataView.refreshData();
                                   }
                                    if($('#security-policy-service-grp-grid').data("contrailGrid") !== undefined){
                                        $('#security-policy-service-grp-grid').data('contrailGrid')._dataView.refreshData();
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
                                    $("#fw_security_policy_service_gp_grid_view .grid-header").append("<div id='fw-wizard-details-error-container'></div>");
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
                    });}

            },
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_SERVICE_GROUP,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    if(viewConfig.isWizard){
                        if($("#fw-wizard-details-error-container")){
                            $("#fw-wizard-details-error-container").remove();
                        }
                        $("#overlay-background-id").addClass("overlay-background");
                        overlayServiceGroupEditView.model = new ServiceGroupModel();
                        overlayServiceGroupEditView.renderServiceGroup({
                                                'mode': 'add',
                                                'viewConfig': viewConfig,
                                                'isGlobal': viewConfig.isGlobal
                        });
                    } else{
                        serviceGroupEditView.model = new ServiceGroupModel();
                        serviceGroupEditView.renderAddEditServiceGroup({
                                                  "title": 'Create',
                                                  'mode': 'add',
                                                  'isGlobal': viewConfig.isGlobal,
                                                  callback: function () {
                           $('#' + ctwc.FW_WZ_SECURITY_POLICY_SERVICE_GRP_GRID_ID).data("contrailGrid")._dataView.refreshData();
                        }});
                    }
                }
            }

        ];
        return headerActionConfig;
    }
    function getSecGrpDetailsTemplateConfig() {
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
                                                /*{
                                                    label: 'Parent Type',
                                                    key: 'parent_type',
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Parent UUID',
                                                    key: 'parent_uuid',
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },*/
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Services',
                                                    keyClass:'col-xs-4',
                                                    templateGeneratorConfig: {
                                                        formatter: 'serviceGroupFormatter'
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
    this.serviceGroupFormatter = function(value, dc) {
        return serviceGroupList(null, null, null, value, dc, true);
    };
    function protocolFormatter(r, c, v, cd, dc, showAll) {
        var protocolList = [], list = [], returnString = '';
        var  firewalService = getValueByJsonPath(dc, 'service_group_firewall_service_list;firewall_service',[]);
        for(var i = 0; i < firewalService.length; i++){
            var serviceText = '<span>'+ firewalService[i].protocol.toUpperCase() +'</span>';
            list.push(serviceText);
        }
        if(list.length > 0){
            for(var j = 0; j < list.length,j < 2; j++){
                if(list[j]) {
                    returnString += list[j] + "<br>";
                }
            }
            if (list.length > 2) {
                returnString += '<span class="moredataText">(' +
                    (list.length-2) + ' more)</span> \
                    <span class="moredata" style="display:none;" ></span>';
            }
        }else{
            returnString = '-';
        }
        return  returnString;
    }
    function dstPortFormatter(r, c, v, cd, dc, showAll){
        var portList = [], returnString = '', port;
        var  firewalService = getValueByJsonPath(dc, 'service_group_firewall_service_list;firewall_service',[]);
        for(var i = 0; i < firewalService.length; i++){
            if(firewalService[i].dst_ports.start_port === firewalService[i].dst_ports.end_port){
                port = firewalService[i].dst_ports.start_port;
            }else{
                port = firewalService[i].dst_ports.start_port + '-' + firewalService[i].dst_ports.end_port;
            }
            var portText = '<span>'+ port +'</span>';
            portList.push(portText);
        }
        if(portList.length > 0){
            for(var j = 0; j< portList.length,j < 2; j++){
                if(portList[j]) {
                    returnString += portList[j] + "<br>";
                }
            }
            if (portList.length > 2) {
                returnString += '<span class="moredataText">(' +
                    (portList.length-2) + ' more)</span> \
                    <span class="moredata" style="display:none;" ></span>';
            }
        }else{
            returnString = '-';
        }
        return  returnString;
    }
    function serviceGroupList(r, c, v, cd, dc, showAll){
        var serviceList = [], returnString = '', srcPort, dstPort;
        var  firewalService = getValueByJsonPath(dc, 'service_group_firewall_service_list;firewall_service',[]);
        serviceList.push('<span class="rule-format" style="width: 180px !important;display:inline-block;">Protocol</span><span class="rule-format">Port</span>');
        for(var i = 0; i < firewalService.length; i++){
            if(firewalService[i].dst_ports.start_port === firewalService[i].dst_ports.end_port){
                dstPort = firewalService[i].dst_ports.start_port;
            }else{
                dstPort = firewalService[i].dst_ports.start_port + '-' + firewalService[i].dst_ports.end_port;
            }
            var portText = '<span style="width: 180px !important;display:inline-block;">'+ firewalService[i].protocol.toUpperCase() +'</span><span>'+ dstPort +'</span>';
            serviceList.push(portText);
        }
        if(serviceList.length > 1){
            for(var j = 0; j< serviceList.length; j++){
                returnString += serviceList[j] + "<br>";
            }
        }else{
            serviceList.push('<span style="width: 180px !important;display:inline-block;">-</span><span>-</span>');
            for(var k = 0; k< serviceList.length; k++){
                returnString += serviceList[k] + "<br>";
            }
        }
        return  returnString;
    } 
   return serviceGroupGridView;
});

