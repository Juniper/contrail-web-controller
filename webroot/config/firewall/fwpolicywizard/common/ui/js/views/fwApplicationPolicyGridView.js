/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/firewall/common/fwpolicy/ui/js/fwPolicyFormatter',
    'config/firewall/common/fwpolicy/ui/js/models/fwPolicyModel',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizardEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/inventoryPolicyView'
], function(_, ContrailView, Knockback, FWPolicyFormatter, FWPolicyModel, FWPolicyEditView, InventoryPolicyView) {
    var self, gridElId;
      fwPolicyFormatter = new FWPolicyFormatter(),
      fwPolicyEditView =  new FWPolicyEditView(),
      inventoryPolicyView = new InventoryPolicyView();
    var fwPolicyGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            updatedGridList = [];
            var viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            gridElId = '#'+ viewConfig.viewConfig.idList.gridId;
            self.renderView4Config(self.$el, self.model,
                getFWPolicyGridViewConfig(viewConfig));
            $("#create-fw").off('click').on('click', function(){
                var apsName;
                $("#overlay-background-id").removeClass("overlay-background");
                newApplicationSet = {
                        name:  ko.contextFor($('#name').get(0)).$data.name(),
                        Application: ko.contextFor($('#Application').get(0)).$data.Application(),
                        description : ko.contextFor($('#description').get(0)).$data.description()
                    };
                if(ko.contextFor($('#name').get(0)).$data.uuid !== undefined){
                    newApplicationSet.uuid = ko.contextFor($('#name').get(0)).$data.uuid();
                    newApplicationSet.id_perms = ko.contextFor($('#name').get(0)).$data.id_perms();
                }
                var existingRows = $('#fw-wz-policy-grid').data("contrailGrid")._dataView.getItems();
                newApplicationSet.existingRows = existingRows;
                newApplicationSet.mode = viewConfig.viewConfig.mode;
                $('#aps-save-btn-container').hide();
                $('#applicationpolicyset_policy_wizard .actions').css("display", "block");
                if(newApplicationSet.name === ''){
                    apsName = 'Add Application Policy Set';
                }else{
                    apsName = newApplicationSet.name;
                }
                var modelHeader = apsName + ' > '+ 'New Policy';
                $('.modal-header-title').text('');
                $('.modal-header-title').text(modelHeader);
                $($('#applicationpolicyset_policy_wizard a.btn-primary')[0]).trigger("click");
           });
        }
    });


    function getFWPolicyGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_FW_WZ_POLICY_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: viewConfig.viewConfig.idList.gridId,
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

    function getRowActionConfig(dc) {
        var viewConfig = this;
        var rowActionConfig = [
            {
                "type" : "link",
                "title" : 'Move Up',
                "iconClass" : "fa fa-arrow-up",
                "onClick" : function(rowIndex) {
                    var dataView = $('#fw-wz-policy-grid').data("contrailGrid")._dataView;
                    var items = dataView.getItems();
                    var nextIndex = rowIndex - 1;
                    var currentData = items[rowIndex];
                    var currentId = Number(currentData.cgrid.split('_')[1]) - 1;
                    currentData.cgrid = 'id_' + currentId;
                    var nextData = items[nextIndex];
                    var nextId = Number(nextData.cgrid.split('_')[1]) + 1;
                    nextData.cgrid = 'id_' + nextId;
                    items[rowIndex] = nextData;
                    items[rowIndex - 1] = currentData;
                    updatedGridList = [];
                    _.each(items, function(obj) {
                        var fqName = obj.fq_name;
                        updatedGridList.push(fqName[fqName.length - 1]);
                    });
                    dataView.updateData(items);
                }
            },
            {
                "type" : "link",
                "title" : 'Move Down',
                "iconClass" : "fa fa-arrow-down",
                "onClick" : function(rowIndex) {
                    var dataView = $('#fw-wz-policy-grid').data("contrailGrid")._dataView;
                    var items = dataView.getItems();
                    var nextIndex = rowIndex + 1;
                    var currentData = items[rowIndex];
                    var currentId = Number(currentData.cgrid.split('_')[1]) + 1;
                    currentData.cgrid = 'id_' + currentId;
                    var nextData = items[nextIndex];
                    var nextId = Number(nextData.cgrid.split('_')[1]) - 1;
                    nextData.cgrid = 'id_' + nextId;
                    items[rowIndex] = nextData;
                    items[rowIndex + 1] = currentData;
                    updatedGridList = [];
                    _.each(items, function(obj) {
                        var fqName = obj.fq_name;
                        updatedGridList.push(fqName[fqName.length - 1]);
                    });
                    dataView.updateData(items);
                }
            },
            {
                "type" : "link",
                "title" : 'Insert Below',
                "iconClass" : "fa contrailGlyph-insert-below",
                "onClick" : function(rowIndex) {
                    $("#overlay-background-id").removeClass("overlay-background");
                    var apsName;
                    newApplicationSet = {
                            name:  ko.contextFor($('#name').get(0)).$data.name(),
                            Application: ko.contextFor($('#Application').get(0)).$data.Application(),
                            description : ko.contextFor($('#description').get(0)).$data.description()
                        };
                    if(ko.contextFor($('#name').get(0)).$data.uuid !== undefined){
                        newApplicationSet.uuid = ko.contextFor($('#name').get(0)).$data.uuid();
                        newApplicationSet.id_perms = ko.contextFor($('#name').get(0)).$data.id_perms();
                    }
                    var existingRows = $('#fw-wz-policy-grid').data("contrailGrid")._dataView.getItems();
                    newApplicationSet.existingRows = existingRows;
                    newApplicationSet.mode = viewConfig.viewConfig.mode;
                    newApplicationSet.insert = 'below';
                    newApplicationSet.currentIndex = rowIndex;
                    $('#aps-save-btn-container').hide();
                    $('#applicationpolicyset_policy_wizard .actions').css("display", "block");
                    if(newApplicationSet.name === ''){
                        apsName = 'Add Application Policy Set';
                    }else{
                        apsName = newApplicationSet.name;
                    }
                    var modelHeader = apsName + ' > '+ 'New Policy';
                    $('.modal-header-title').text('');
                    $('.modal-header-title').text(modelHeader);
                    $($('#applicationpolicyset_policy_wizard a.btn-primary')[0]).trigger("click");
                }
            },
            {
                "type" : "link",
                "title" : 'Insert Above',
                "iconClass" : "fa contrailGlyph-insert-above",
                "onClick" : function(rowIndex) {
                    $("#overlay-background-id").removeClass("overlay-background");
                    var apsName;
                    newApplicationSet = {
                            name:  ko.contextFor($('#name').get(0)).$data.name(),
                            Application: ko.contextFor($('#Application').get(0)).$data.Application(),
                            description : ko.contextFor($('#description').get(0)).$data.description()
                        };
                    if(ko.contextFor($('#name').get(0)).$data.uuid !== undefined){
                        newApplicationSet.uuid = ko.contextFor($('#name').get(0)).$data.uuid();
                        newApplicationSet.id_perms = ko.contextFor($('#name').get(0)).$data.id_perms();
                    }
                    var existingRows = $('#fw-wz-policy-grid').data("contrailGrid")._dataView.getItems();
                    newApplicationSet.existingRows = existingRows;
                    newApplicationSet.mode = viewConfig.viewConfig.mode;
                    newApplicationSet.insert = 'above';
                    newApplicationSet.currentIndex = rowIndex;
                    $('#aps-save-btn-container').hide();
                    $('#applicationpolicyset_policy_wizard .actions').css("display", "block");
                    if(newApplicationSet.name === ''){
                        apsName = 'Add Application Policy Set';
                    }else{
                        apsName = newApplicationSet.name;
                    }
                    var modelHeader = apsName + ' > '+ 'New Policy';
                    $('.modal-header-title').text('');
                    $('.modal-header-title').text(modelHeader);
                    $($('#applicationpolicyset_policy_wizard a.btn-primary')[0]).trigger("click");
                }
            },
            {
                "type" : "link",
                "title" : 'Insert at Top',
                "iconClass" : "fa contrailGlyph-insert-top",
                "onClick" : function(rowIndex) {
                    $("#overlay-background-id").removeClass("overlay-background");
                    var apsName;
                    newApplicationSet = {
                            name:  ko.contextFor($('#name').get(0)).$data.name(),
                            Application: ko.contextFor($('#Application').get(0)).$data.Application(),
                            description : ko.contextFor($('#description').get(0)).$data.description()
                        };
                    if(ko.contextFor($('#name').get(0)).$data.uuid !== undefined){
                        newApplicationSet.uuid = ko.contextFor($('#name').get(0)).$data.uuid();
                        newApplicationSet.id_perms = ko.contextFor($('#name').get(0)).$data.id_perms();
                    }
                    var existingRows = $('#fw-wz-policy-grid').data("contrailGrid")._dataView.getItems();
                    newApplicationSet.existingRows = existingRows;
                    newApplicationSet.mode = viewConfig.viewConfig.mode;
                    newApplicationSet.insert = 'top';
                    newApplicationSet.currentIndex = rowIndex;
                    $('#aps-save-btn-container').hide();
                    $('#applicationpolicyset_policy_wizard .actions').css("display", "block");
                    if(newApplicationSet.name === ''){
                        apsName = 'Add Application Policy Set';
                    }else{
                        apsName = newApplicationSet.name;
                    }
                    var modelHeader = apsName + ' > '+ 'New Policy';
                    $('.modal-header-title').text('');
                    $('.modal-header-title').text(modelHeader);
                    $($('#applicationpolicyset_policy_wizard a.btn-primary')[0]).trigger("click");
                }
            },
            {
                "type" : "link",
                "title" : 'Insert at End',
                "iconClass" : "fa contrailGlyph-insert-bottom",
                "onClick" : function(rowIndex) {
                    $("#overlay-background-id").removeClass("overlay-background");
                    var apsName;
                    newApplicationSet = {
                            name:  ko.contextFor($('#name').get(0)).$data.name(),
                            Application: ko.contextFor($('#Application').get(0)).$data.Application(),
                            description : ko.contextFor($('#description').get(0)).$data.description()
                        };
                    if(ko.contextFor($('#name').get(0)).$data.uuid !== undefined){
                        newApplicationSet.uuid = ko.contextFor($('#name').get(0)).$data.uuid();
                        newApplicationSet.id_perms = ko.contextFor($('#name').get(0)).$data.id_perms();
                    }
                    var existingRows = $('#fw-wz-policy-grid').data("contrailGrid")._dataView.getItems();
                    newApplicationSet.existingRows = existingRows;
                    newApplicationSet.mode = viewConfig.viewConfig.mode;
                    newApplicationSet.insert = 'end';
                    newApplicationSet.currentIndex = rowIndex;
                    $('#aps-save-btn-container').hide();
                    $('#applicationpolicyset_policy_wizard .actions').css("display", "block");
                    if(newApplicationSet.name === ''){
                        apsName = 'Add Application Policy Set';
                    }else{
                        apsName = newApplicationSet.name;
                    }
                    var modelHeader = apsName + ' > '+ 'New Policy';
                    $('.modal-header-title').text('');
                    $('.modal-header-title').text(modelHeader);
                    $($('#applicationpolicyset_policy_wizard a.btn-primary')[0]).trigger("click");
                }
            }
        ];
        var list = policyGridList.list;
        if(list.length == 1){
            rowActionConfig.splice(0,1);
            rowActionConfig.splice(0,1);
            return rowActionConfig;
        }else {
           var fqName = dc.fq_name[dc.fq_name.length - 1];
           if(updatedGridList.length > 0){
               list = updatedGridList;
           }
           var lastCount = list.length - 1;
           if(list.indexOf(fqName) === 0){
               rowActionConfig.splice(0,1);
               return rowActionConfig;
           }else if(list.indexOf(fqName) === lastCount){
               rowActionConfig.splice(1,1);
               return rowActionConfig;
           }else{
              return rowActionConfig;
           }
        }
    };

    function getConfiguration (viewConfig) {
        var loadingText = 'Loading Firewall Policies..';
        var emptyText = 'No Firewall Policy Found.';
        var gridTitle;
        if(viewConfig.viewConfig.mode === 'add' || viewConfig.viewConfig.mode === 'edit'){
            loadingText = 'No Associated Firewall Policies';
            emptyText = 'No Associated Firewall Policies';
            gridTitle = ctwl.TITLE_ASSOCIATED_POLICY;
        }
        else if(viewConfig.viewConfig.isInventory === true){
            gridTitle = "Select firewall policy";
        }
        else{
            gridTitle = "";
        }
        var gridElementConfig = {
            header: {
                title: {
                    text: gridTitle
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
                    actionCell: getRowActionConfig.bind(viewConfig),
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
                        text: loadingText
                    },
                    empty: {
                        text: emptyText
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
        if(viewConfig.viewConfig.isInventory){
            gridElementConfig.body.options.actionCell = [];
        }
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
                    var checkedRows = $('#fw-wz-policy-grid').data("contrailGrid").getCheckedRows();
                    _.each(checkedRows, function(row){
                        deletedObj.push(row.uuid);
                    });
                    $('#fw-wz-policy-grid').data("contrailGrid")._dataView.refreshData();
                }
            },
            {
                "type" : "link",
                "title" : 'Add firewall Policy from Inventory',
                "iconClass": 'fa fa-link rot45_antic',
                "linkElementId": 'btnInventoryFWPolicy',
                "onClick" : function() {
                    var applicationObj ={
                            name:  ko.contextFor($('#name').get(0)).$data.name(),
                            Application: ko.contextFor($('#Application').get(0)).$data.Application(),
                            description : ko.contextFor($('#description').get(0)).$data.description()
                        };
                        var mode = viewConfig.viewConfig.mode;
                        if(mode === 'edit'){
                            applicationObj.uuid =  ko.contextFor($('#name').get(0)).$data.uuid();
                            applicationObj.id_perms = ko.contextFor($('#name').get(0)).$data.id_perms();
                        }
                        var selectedRows = $('#fw-wz-policy-grid').data("contrailGrid")._dataView.getItems();
                        inventoryPolicyView.renderInventoryView({
                                        applicationObj : applicationObj,
                                        viewConfig: viewConfig,
                                        previousRows : selectedRows,
                                        mode : mode,
                                        gridElId: '#fw-wz-policy-grid'
                        });
                }
            }
        ];
        if(viewConfig.viewConfig.isInventory){
            return [];
        }else{
            return headerActionConfig;
        }
    };

    function onPolicyClick (e, dc) {
        var isGlobal = this.viewConfig.isGlobal;
        var viewTab = isGlobal ?
                'config_security_globalrules': 'config_security_projectrules';
        var hashP = isGlobal ?
                'config_security_globalpolicies' : 'config_security_projectscopedpolicies';
        var hashParams = null,
            hashObj = {
                view: viewTab,
                focusedElement: {
                    policy: dc.name,
                    uuid: dc.uuid,
                    tab: viewTab,
                    isGlobal: isGlobal
                }
            };
        if (contrail.checkIfKeyExistInObject(true,
                hashParams,
                'clickedElement')) {
            hashObj.clickedElement =
                hashParams.clickedElement;
        }

        layoutHandler.setURLHashParams(hashObj, {
            p: hashP,
            merge: false,
            triggerHashChange: true
        });
    }

    function getfwPolicyColumns(viewConfig){
        var fwPolicyColumns = [{
            id: 'name',
            field: 'name',
            name: 'Name'//,
            //cssClass :'cell-hyperlink-blue',
            //events : {
              //  onClick : onPolicyClick.bind({viewConfig:viewConfig})
            //}
         }, {
             id: 'id_perms.description',
             field: 'id_perms.description',
             name: 'Description',
             minWidth : 120,
             formatter: fwPolicyFormatter.policyDescriptionFormatter
          }, {
              id: 'application_policy_set_back_refs',
              field: 'application_policy_set_back_refs',
              name: 'Member of Application Policy Sets',
              minWidth : 190,
              formatter: fwPolicyFormatter.policySetFormatter
           }, {
             id: 'firewall_rule_refs',
             field: 'firewall_rule_refs',
             name: 'Rules',
             //cssClass :'cell-hyperlink-blue',
             //events : {
                // onClick : onPolicyClick.bind({viewConfig:viewConfig})
            // },
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
                                keyClass:'col-xs-5',
                                valueClass:'col-xs-7',
                                title: 'Details',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: 'name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Name'
                                },{
                                    keyClass:'col-xs-5',
                                    valueClass:'col-xs-7',
                                    key: 'display_name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Display Name'
                                },{
                                    keyClass:'col-xs-5',
                                    valueClass:'col-xs-7',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID"
                                },{
                                    keyClass:'col-xs-5',
                                    valueClass:'col-xs-7',
                                    key: "id_perms.description",
                                    templateGenerator: "TextGenerator",
                                    label: "Description",
                                    templateGeneratorConfig: {
                                        formatter: "policyDescriptionFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-5',
                                    valueClass:'col-xs-7',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Member of",
                                    templateGeneratorConfig: {
                                        formatter: "policySetFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-5',
                                    valueClass:'col-xs-7',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Number of Rules",
                                    templateGeneratorConfig: {
                                        formatter: "fwRuleFormatter"
                                    }
                                },{
                                    label: 'Associated Security Logging Objects',
                                    key: 'security_logging_object_refs',
                                    keyClass:'col-xs-5',
                                    valueClass:'col-xs-7',
                                    templateGenerator:
                                        'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter:
                                            'SloFormatter'
                                    }
                                },{
                                    key: "id_perms.last_modified",
                                    keyClass:'col-xs-5',
                                    valueClass:'col-xs-7',
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

    this.SloFormatter = function (v, dc) {
        return ctwu.securityLoggingObjectFormatter(dc, 'details');
    };

    return fwPolicyGridView;
});