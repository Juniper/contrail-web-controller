/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var overlayServiceGroupEditView = ContrailView.extend({
        renderServiceGroup: function(options) {
            var self = this,disable = false;
            var mode = options.mode, headerText;
            if(mode === 'edit'){
                disable = true;
                headerText = 'Edit Service Group';
            }else if(mode === 'add'){
                headerText = 'Create Service Group';
            }else{
                headerText = 'Delete Service Group';
            }
            var viewConfig = options.viewConfig;
            $('#aps-overlay-container').show();
            $("#aps-gird-container").empty();
            $('#aps-save-button').show();
            self.setErrorContainer(headerText);
            self.renderView4Config($('#gird-details-container'),
                    this.model,
                    getServiceGroupViewConfig(disable),
                    "serviceGroupValidation",
                    null, null, function() {
                         $("#aps-back-button").off('click').on('click', function(){
                             $('#aps-save-button').hide();
                             $('#aps-overlay-container').show();
                             $("#overlay-background-id").removeClass("overlay-background");
                             Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                             $("#aps-gird-container").empty();
                             $("#aps-gird-container").append($("<div id='servicegroup-wrapper'></div>"));
                             self.renderView4Config($('#servicegroup-wrapper'), null, getServiceGroup(viewConfig));
                         });
                         $("#aps-save-button").off('click').on('click', function(){
                             self.model.addEditServiceGroup({
                                 success: function () {
                                     $('#aps-save-button').hide();
                                     $('#aps-overlay-container').show();
                                     Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                     $("#aps-gird-container").empty();
                                     $("#aps-gird-container").append($("<div id='servicegroup-wrapper'></div>"));
                                     self.renderView4Config($('#servicegroup-wrapper'), null, getServiceGroup(viewConfig));
                                     if($('#security-policy-service-grp-grid_fw_wizard').data("contrailGrid") !== undefined){
                                         $('#security-policy-service-grp-grid_fw_wizard').data("contrailGrid")._dataView.refreshData();
                                     }
                                     if($('#security-policy-service-grp-grid_standalone').data("contrailGrid") !== undefined){
                                         $('#security-policy-service-grp-grid_standalone').data("contrailGrid")._dataView.refreshData();
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
                                           self.model.model().attributes.serviceTypeCollection});
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
    function getServiceGroup(viewConfig){
        if(viewConfig.isGlobal) {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_SG_GLOBAL_LIST_VIEW_ID]),
                view: "serviceGroupGlobalListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/infra/firewall/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_SG_PROJECT_LIST_VIEW_ID]),
                view: "serviceGroupProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/servicegroup/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
            };
        }
    }
    function getServiceGroup(viewConfig){
        if(viewConfig.isGlobal) {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_SG_GLOBAL_LIST_VIEW_ID]),
                view: "serviceGroupGlobalListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/infra/firewall/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_SG_PROJECT_LIST_VIEW_ID]),
                view: "serviceGroupProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/servicegroup/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
            };
        }
    }
    var getServiceGroupViewConfig = function (isDisable) {
        return {
            elementId: ctwc.APS_SERVICE_GRP_ID,
            view: 'SectionView',
            title: "Service Group",
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
                                    class: 'col-xs-7',
                                    dataBindValue: 'name',
                                    disabled : isDisable
                                }
                            }
                        ]
                    },
                    {
                        columns: [{
                            elementId: 'serviceTypeCollection',
                            view: "FormCollectionView",
                            //view: "FormEditableGridView",
                            viewConfig: {
                                path: "serviceTypeCollection",
                                class: 'col-xs-12',
                                validation: 'serviceCollectionValidation',
                                templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                                collection: "serviceTypeCollection",
                                rows:[{
                                   rowActions: [
                                        {onClick: "function() { $root.addSvcType(); }",
                                         iconClass: 'fa fa-plus'},
                                         {onClick: "function() { $root.deleteSvcType($data, this); }",
                                         iconClass: 'fa fa-minus'}
                                   ],
                                columns: [
                                    {
                                        elementId: 'protocol',
                                        name: 'Protocol',
                                        view: "FormComboboxView",
                                        width:205,
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                            path: "protocol",
                                            dataBindValue: "protocol()",
                                            elementConfig:{
                                                dataTextField: 'text',
                                                dataValueField: 'value',
                                                dataSource: {
                                                    type: 'local',
                                                    data:[{text:'tcp', value:'tcp' },
                                                          {text:'udp', value:'udp' },
                                                          {text:'icmp', value:'icmp' }]
                                                   }
                                               }
                                           }
                                       },
                                       {
                                           elementId: 'dst_port',
                                           name: 'Port',
                                           view: "FormInputView",
                                           width:210,
                                           viewConfig: {
                                              templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                              placeholder: '0 - 65535',
                                              path: 'dst_port',
                                              dataBindValue: 'dst_port()'
                                           }
                                       }
                                 ]
                                }],
                                gridActions: [
                                    {onClick: "function() { addSvcType(); }",
                                     buttonTitle: ""}
                                ]
                        }
                        }]
                    }
                ]
            }
        }
    };

    return overlayServiceGroupEditView;
});
