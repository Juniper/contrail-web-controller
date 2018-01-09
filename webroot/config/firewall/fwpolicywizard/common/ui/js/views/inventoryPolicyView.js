/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var inventryPolicyView = ContrailView.extend({
        renderInventoryView: function(options) {
            var self = this;
            deletedObj = []; var projectSelected;
            var headerText = 'Add firewall policy from inventory'
            var viewConfig = options.viewConfig.viewConfig;
            var policyGridId = options.gridElId;
            var applicationObj = options.applicationObj;
            var previousRows = _.get(options, 'previousRows', []);
            var mode = options.mode;
            if(viewConfig.projectSelectedValueData !== undefined){
                projectSelected = viewConfig.projectSelectedValueData.name;
            }
            $("#overlay-background-id").addClass("overlay-background");
            $('#aps-overlay-container').show();
            $("#aps-gird-container").empty();
            $('#aps-save-button').show();
            $('#helper').hide();
            self.setErrorContainer(headerText);
            $("#aps-back-button").text('Cancel');
            $("#aps-save-button").text('Add Selected');
            $("#aps-back-button").off('click').on('click', function(){
                $('#aps-save-button').text('Save');
                $('#helper').show();
                seletedInventoryList = getSelectedRows(previousRows, []);
                if(seletedInventoryList.length === 0){
                    seletedInventoryList.push('cancel');
                }
                $(policyGridId).data("contrailGrid")._dataView.refreshData();
                $('#aps-overlay-container').hide();
                $("#overlay-background-id").removeClass("overlay-background");
                Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                $("#aps-gird-container").empty();
            });
            $("#aps-save-button").off('click').on('click', function(){
                $('#aps-save-button').text('Save');
                $('#helper').show();
                seletedInventoryList = getSelectedRows($('#inventory-policy-grid').data("contrailGrid").getCheckedRows(), previousRows);
                if($(policyGridId).data("contrailGrid") !== undefined){
                    $(policyGridId).data("contrailGrid")._dataView.refreshData();
                }
                $('#aps-overlay-container').hide();
                $("#overlay-background-id").removeClass("overlay-background");
                Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                $("#aps-gird-container").empty();
            });
            self.renderView4Config($('#gird-details-container'),'',
                    getInventoryPolicyViewConfig(previousRows, viewConfig, projectSelected),
                    '',null, null, function() {
            },null,false);
        },
        setErrorContainer : function(headerText){
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