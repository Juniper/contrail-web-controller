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
                             $('#aps-overlay-container').show();
                             $("#overlay-background-id").removeClass("overlay-background");
                             Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                             $("#aps-gird-container").empty();
                             self.renderView4Config($('#addressgroup-wrapper'), null, getAddressGroup(viewConfig));
                         });
                         $("#aps-save-button").off('click').on('click', function(){
                             self.model.addEditAddressGroup({
                                 success: function () {
                                     $('#aps-save-button').hide();
                                     $('#aps-overlay-container').show();
                                     Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                     $("#aps-gird-container").empty();
                                     $("#aps-gird-container").append($("<div id='addressgroup-wrapper'></div>"));
                                     self.renderView4Config($('#addressgroup-wrapper'), null, getAddressGroup(viewConfig));
                                     if($('#security-policy-address-grp-grid_fw_wizard').data("contrailGrid") !== undefined){
                                         $('#security-policy-address-grp-grid_fw_wizard').data("contrailGrid")._dataView.refreshData();
                                     }
                                     if($('#security-policy-address-grp-grid_fw_wizard').data("contrailGrid") !== undefined){
                                         $('#security-policy-address-grp-grid_fw_wizard').data("contrailGrid")._dataView.refreshData();
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
            },null,true,false);
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
                view: "addressGroupGlobalListView",
                viewPathPrefix: "config/infra/firewall/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_AS_PROJECT_LIST_VIEW_ID]),
                view: "addressGroupProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/addressgroup/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
            };
        }
    }
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
                    },
                    {
                        columns: [
                            {
                                elementId: 'Labels',
                                view: 'FormMultiselectView',
                                viewConfig: {
                                    label: "Labels",
                                    path: 'Labels',
                                    dataBindValue: 'Labels',
                                    class: 'col-xs-6',
                                    elementConfig: {
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        placeholder:
                                            "Select Labels",
                                             dataSource : ctwu.getDataSourceForDropdown('label')
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    return overlayAddressGroupEditView;
});
