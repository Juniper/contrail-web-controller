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
            $("#aps-gird-container").empty();
            $('#aps-save-button').show();
            self.setErrorContainer(headerText);
            if(mode === 'delete'){
                $('#aps-save-button').text('Confirm');
                var deleteContainer = $('<div style="padding-top:30px;"></div>');
                var deletText = $('<span style="padding-left:300px;">Are you sure you want to delete ?</span>');
                deleteContainer.append(deletText);
                $('#gird-details-container').append(deleteContainer);
                //back method
                $("#aps-back-button").off('click').on('click', function(){
                    $('#aps-save-button').hide();
                    Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                    $("#aps-gird-container").empty();
                    self.renderView4Config($("#aps-gird-container"), null, getServiceGroup(viewConfig));
                    $('#aps-save-button').text('Save');
                });
                
                // save method
                $("#aps-save-button").off('click').on('click', function(){
                    self.model.deleteServiceGroup(options['selectedGridData'],{
                        success: function () {
                            $('#aps-save-button').text('Save');
                            $('#aps-save-button').hide();
                            Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                            $("#aps-gird-container").empty();
                            self.renderView4Config($("#aps-gird-container"), null, getServiceGroup(viewConfig));
                        },
                        error: function (error) {
                            $("#grid-details-error-container").text('');
                            $("#grid-details-error-container").text(error.responseText);
                            $(".aps-details-error-container").show();
                        }
                    });
                });
            }else{
                self.renderView4Config($('#gird-details-container'),
                        this.model,
                        getServiceGroupViewConfig(disable),
                        "serviceGroupValidation",
                        null, null, function() {
                             $("#aps-back-button").off('click').on('click', function(){
                                 $('#aps-save-button').hide();
                                 Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                 $("#aps-gird-container").empty();
                                 self.renderView4Config($("#aps-gird-container"), null, getServiceGroup(viewConfig));
                             });
                             $("#aps-save-button").off('click').on('click', function(){
                                 self.model.addEditServiceGroup({
                                     success: function () {
                                         $('#aps-save-button').hide();
                                         Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                         $("#aps-gird-container").empty();
                                         self.renderView4Config($("#aps-gird-container"), null, getServiceGroup(viewConfig));
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
                },null,true);
            }
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
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                    view: "fwPolicyWizardServiceGlobalListView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                    view: "fwPolicyWizardServiceProjectListview",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
            };
        }
    };
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
