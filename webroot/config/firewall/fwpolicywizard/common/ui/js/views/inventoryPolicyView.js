/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/firewall/fwpolicywizard/common/ui/js/models/fwPolicyWizardModel',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwApplicationPolicyEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizardEditView',
], function (_, ContrailView, Knockback, FwPolicyWizardModel, FwApplicationPolicyEditView, FwPolicyWizardEditView) {
    var fwApplicationPolicyEditView = new FwApplicationPolicyEditView(),
    fwPolicyWizardEditView = new FwPolicyWizardEditView();
    var inventryPolicyView = ContrailView.extend({
        renderInventoryView: function(options) {
            var self = this;
            deletedObj = []; var projectSelected;
            var headerText = 'Add firewall policy from inventory'
            var viewConfig = options.viewConfig.viewConfig;
            var applicationObj = options.applicationObj;
            var previousRows = options.previousRows;
            var mode = options.mode;
            if(viewConfig.projectSelectedValueData !== undefined){
                projectSelected = viewConfig.projectSelectedValueData.name;
            }
            $("#overlay-background-id").addClass("overlay-background");
            $('#aps-overlay-container').show();
            $("#aps-gird-container").empty();
            $('#aps-save-button').show();
            self.setErrorContainer(headerText);
            $("#aps-back-button").text('Cancel');
            $("#aps-save-button").text('Add Selected');
            $("#aps-back-button").off('click').on('click', function(){
                $('#aps-save-button').text('Save');
                var seletedRows = getSelectedRows(previousRows, []);
                viewConfig.seletedRows = seletedRows;
                if(applicationObj.id_perms !== undefined){
                    applicationObj.id_perms.description = applicationObj.description;
                }
                fwPolicyWizardEditView.model = new FwPolicyWizardModel(applicationObj);
                fwPolicyWizardEditView.renderFwWizard({
                                          'mode': mode,
                                          'isGlobal': viewConfig.isGlobal,
                                          'viewConfig': viewConfig,
                                          'seletedRows': seletedRows,
                                          'isWizard': viewConfig.isWizard,
                                           'noResetModal': true,
                                           callback: function () {
                                               $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).data("contrailGrid")._dataView.refreshData();
                }});
            });
            $("#aps-save-button").off('click').on('click', function(){
                $('#aps-save-button').text('Save');
                var gridElId = '#inventory-policy-grid';
                var seletedRows = getSelectedRows($(gridElId).data("contrailGrid").getCheckedRows(), previousRows);
                if(applicationObj.id_perms !== undefined){
                    applicationObj.id_perms.description = applicationObj.description;
                }
                fwPolicyWizardEditView.model = new FwPolicyWizardModel(applicationObj);
                fwPolicyWizardEditView.renderFwWizard({
                                          'mode': mode,
                                          'isGlobal': viewConfig.isGlobal,
                                          'viewConfig': viewConfig,
                                          'seletedRows': seletedRows,
                                          'isWizard': viewConfig.isWizard,
                                          'noResetModal': true,
                                          callback: function () {
                                       $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).data("contrailGrid")._dataView.refreshData();
                }});
            });
            self.renderView4Config($('#gird-details-container'),'',
                    getInventoryPolicyViewConfig(previousRows, viewConfig, projectSelected),
                    '',null, null, function() {
            },null,false);
           
        },
        setErrorContainer : function(headerText){
            $('#aps-gird-container').append($('<h6></h6>').text(headerText).addClass('aps-details-header'));
            var errorHolder = $('<div></div>').addClass('alert-error clearfix aps-details-error-container');
            var errorSpan = $('<span>Error : </span>').addClass('error-font-weight');
            var errorText = $('<span id="grid-details-error-container"></span>');
            errorHolder.append(errorSpan);
            errorHolder.append(errorText);
            $('#aps-gird-container').append(errorHolder);
            $('#aps-gird-container').append($('<div id = "gird-details-container"></div>'));
        }
    });
    function getInventoryPolicyViewConfig(previousRows, viewConfig, projectSelected){
        var oldRecordsID = [];
        if(previousRows.length > 0){
            _.each(previousRows, function(row) {
                oldRecordsID.push(row.uuid);
            });
        }
        return {
            elementId: "inventory-policy-list-view",
            view: "fwApplicationPolicyListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewPathPrefix: "config/firewall/fwpolicywizard/project/ui/js/views/",
            viewConfig: $.extend(true, {}, {isInventory: true,
                oldRecords: oldRecordsID, isGlobal: viewConfig.isGlobal,
                projectSelected: projectSelected, idList: ctwc.INVENTORY_POLICY_GRID_ID})
        }
    }
    function getSelectedRows(model, previousRows){
        var fwPolicyList = [];
        var newRecoreds = previousRows.concat(model);
        _.each(newRecoreds, function(fwPolicy) {
            delete fwPolicy.cgrid;
            fwPolicyList.push(fwPolicy);
        });
        return fwPolicyList;
    }
    return inventryPolicyView;
});