/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var overlayAddressGroupEditView = ContrailView.extend({
    	renderAddressGroup: function(options) {
            var self = this,disable = false;
            var mode = options.mode, headerText;
            if(mode === 'edit'){
            	disable = true;
            	headerText = 'Edit Address Group';
            }else if(mode === 'add'){
                headerText = 'Create Address Group';
            }else{
                headerText = 'Delete Address Group';
            }
           var viewConfig = options.viewConfig;
           $('#aps-overlay-container').show();
           $("#aps-gird-container").empty();
           $('#aps-save-button').show();
	        self.setErrorContainer(headerText);
            self.renderView4Config($('#gird-details-container'),
                    this.model,
                    getAddressGroupViewConfig(disable),
                    "addressGroupValidation",
                    null, null, function() {
                         $("#aps-back-button").off('click').on('click', function(){
                             $('#aps-save-button').hide();
                             $('#aps-overlay-container').hide();
                             $("#overlay-background-id").removeClass("overlay-background");
                             Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                             $("#aps-gird-container").empty();
                         });
                         $("#aps-save-button").off('click').on('click', function(){
                             self.model.addEditAddressGroup({
                                 success: function () {
                                     $('#aps-save-button').hide();
                                     $('#aps-overlay-container').hide();
                                     Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                     $("#aps-gird-container").empty();
                                     if($('#security-policy-address-grp-grid').data("contrailGrid") !== undefined){
                                         $('#security-policy-address-grp-grid').data("contrailGrid")._dataView.refreshData();
                                     }
                                     if($('#fw_security_policy_as_grid_view').data("contrailGrid") !== undefined){
                                         $('#fw_security_policy_as_grid_view').data("contrailGrid")._dataView.refreshData();
                                     }
                                     $("#overlay-background-id").removeClass("overlay-background");
                                 },
                                 error: function (error) {
                                     $("#grid-details-error-container").text('');
                                     $("#grid-details-error-container").text(error.responseText);
                                     $(".aps-details-error-container").show();
                                 }
                             }, options);
                         });
                         Knockback.applyBindings(self.model,
                                                 document.getElementById('aps-gird-container'));
                         kbValidation.bind(self, {collection:
                                           self.model.model().attributes.subnetCollection});
            },null,true);
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
    function getAddressGroup(viewConfig){
        if(viewConfig.isGlobal) {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_AS_GLOBAL_LIST_VIEW_ID]),
                view: "fwPolicyWizardASGlobalListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                    view: "fwPolicyWizardASProjectListView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
            }
        }
    };
    var getAddressGroupViewConfig = function (isDisable) {
        return {
            elementId: ctwc.APS_ADDRESS_GRP_ID,
            view: 'SectionView',
            title: "Address Group",
            viewConfig: {
                rows: [
                    {
                        columns: [
                        	{
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Name',
                                    path: 'name',
                                    class: 'col-xs-6',
                                    dataBindValue: 'name',
                                    disabled : isDisable
                                }
                            }
                        ]
                    },
                    {
                        columns: [{
                            elementId: 'subnetCollection',
                            view: "FormCollectionView",
                            viewConfig: {
                                path: "subnetCollection",
                                class: 'col-xs-12',
                                //validation: 'ruleValidation',
                                templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                                collection: "subnetCollection",
                                rows:[{
                                   rowActions: [
                                        {onClick: "function() { $root.addSubnet(); }",
                                         iconClass: 'fa fa-plus'},
                                         {onClick: "function() { $root.deleteSubnet($data, this); }",
                                         iconClass: 'fa fa-minus'}
                                   ],
                                columns: [
                                    {
                                          elementId: 'prefix',
                                          name: 'Prefix',
                                          view: "FormInputView",
                                          class: "",
                                          width:345,
                                          viewConfig: {
                                             templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                             placeholder: 'xxx.xxx.xxx.xxx/xx',
                                             width:290,
                                             path: 'prefix',
                                             dataBindValue: 'prefix()'
                                          }
                                       }
                                  ]
                                }],
                                gridActions: [
                                    {onClick: "function() { addSubnet(); }",
                                     buttonTitle: ""}
                                ]
                        }
                        }]
                    }
                ]
            }
        }
    };

    return overlayAddressGroupEditView;
});
