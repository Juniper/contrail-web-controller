/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var prefixId = ctwc.PACKET_CAPTURE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var self;
    var packetCaptureEditView = ContrailView.extend({
        renderAddEditPacketCapture: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId});
            self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-980',
                'title': options['title'], 'body': editLayout,
                 'onSave': function () {
                        self.configEditPacketCapture(options);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.fetchVirtualNetworks(function(networkList, leftNetworkList) {
                self.packetCaptureRenderView4Config(options, networkList, leftNetworkList);
            });
        },
        fetchVirtualNetworks: function(callback) {
            var vns, formattedValue, leftVNFormattedValue, fqName, ajaxConfig = {
                url : "/api/tenants/config/virtual-networks?tenant_id=" +
                    getCookie("domain") + ":" + getCookie("project"),
                type : 'GET'
            };
            var networkList = [];
            var leftNetworkList = []
            contrail.ajaxHandler(ajaxConfig, null,
                function(result) {
                    vns = getValueByJsonPath(result, "virtual-networks", []);
                    _.each(vns, function(vn){
                        fqName = vn.fq_name;
                        if(fqName.length === 3) {
                            formattedValue = fqName[0] + "~" + fqName[1] +
                                "~" + fqName[2] + "~" + vn.uuid;
                            leftVNFormattedValue =
                                fqName[0] + ":" + fqName[1] + ":" + fqName[2];
                            networkList.push({ value : formattedValue,
                                text : fqName[2] });
                            leftNetworkList.push({ value : leftVNFormattedValue,
                                text : fqName[2] });
                        }
                    });
                    callback(networkList, leftNetworkList);
                },
                function(error) {
                    callback(networkList);
                }
            );

        },
        configEditPacketCapture : function(options) {
            self.model.configPacketCapture({
                init: function () {
                    cowu.enableModalLoading(modalId);
                },
                success: function () {
                    options['callback']();
                    $("#" + modalId).modal('hide');
                },
                error: function (error) {
                    cowu.disableModalLoading(modalId, function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 error.responseText);
                    });
                }
            }, options.mode === ctwl.CREATE_ACTION ? 'POST' : 'PUT');
        },
        packetCaptureRenderView4Config : function(options, networkList, leftNetworkList) {
            var disableFlag =
                (options.mode === ctwl.CREATE_ACTION) ?  false : true;
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                self.model,
                self.getPacketCaptureViewConfig(disableFlag, networkList, leftNetworkList),
                "configureValidation", null, null,
                function () {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                   kbValidation.bind(self);
                }
            );
        },
        renderDeletePacketCapture: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deletePacketCapture(options['checkedRows'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
        },
        getPacketCaptureViewConfig : function(disableId, networkList, leftNetworkList) {
            var autoVirtualNetworkList = [{value: "automatic", text: "Automatic"}];
            var srcDestVirtualNetworkList = [{value: "any", text: "any"}, {value: "local", text: "local"}];
            autoVirtualNetworkList = autoVirtualNetworkList.concat(leftNetworkList);
            srcDestVirtualNetworkList = srcDestVirtualNetworkList.concat(leftNetworkList);
            var pktCaptureConfig = {
                elementId: cowu.formatElementId([prefixId,
                                   ctwl.TITLE_ADD_PACKET_CAPTURE]),
                title: ctwl.TITLE_ADD_PACKET_CAPTURE,
                view: "SectionView",
                viewConfig :{
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: "name",
                                    view: "FormInputView",
                                    viewConfig: {
                                        disabled: disableId,
                                        path: "name",
                                        dataBindValue: "name",
                                        label: "Name",
                                        placeholder: "Enter Analyzer Name",
                                        class: "col-xs-6"
                                    }
                                },
                                {
                                    elementId: "virtual_network",
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        disabled: disableId,
                                        path: "service_instance_properties.interface_list[0].virtual_network",
                                        dataBindValue: "service_instance_properties().interface_list[0].virtual_network",
                                        label: "Virtual Network",
                                        class: "col-xs-6",
                                        elementConfig : {
                                            placeholder: "Select Virtual Network",
                                            dataValueField: "value",
                                            dataTextField: "text",
                                            data: autoVirtualNetworkList
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                {
                                    elementId: "user_created_associate_networks",
                                    view: "FormMultiselectView",
                                    viewConfig: {
                                        path: "user_created_associate_networks",
                                        dataBindValue: "user_created_associate_networks",
                                        label: "Associate Networks",
                                        class: "col-xs-12",
                                        elementConfig : {
                                            placeholder: "Select Networks",
                                            dataValueField: "value",
                                            dataTextField: "text",
                                            data: networkList
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [{
                                   elementId: "analyzer_rule_section",
                                   view: "FormEditableGridView",
                                       viewConfig: {
                                           path: "rules",
                                           label: "Analyzer Rules",
                                           collection: "rules",
                                           validation: "ruleValidation",
                                           templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                           columns: [{
                                               elementId: "protocol",
                                               name: "Protocol",
                                               view: "FormComboboxView",
                                               width: 100,
                                               viewConfig: {
                                                   width: 100,
                                                   path: "protocol",
                                                   templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                                   dataBindValue: "protocol()",
                                                   elementConfig:{
                                                       placeholder: "Protocol",
                                                       dataValueField: "value",
                                                       dataTextField: "text",
                                                       dataSource: {
                                                           type: 'local',
                                                           data:[{value: "any", text : "ANY"},
                                                                 {value: "tcp", text: "TCP"},
                                                                 {value: "udp", text: "UDP"},
                                                                 {value: "icmp", text: "ICMP"},
                                                                 {value: "icmp6", text: "ICMP6"}]
                                                       }
                                                   }
                                               }
                                           },{
                                               elementId: "src_network",
                                               name: "Source Network",
                                               view: "FormDropdownView",
                                               width: 180,
                                               viewConfig: {
                                                   width: 180,
                                                   path: "src_network",
                                                   templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                   dataBindValue: "src_network()",
                                                   elementConfig:{
                                                       placeholder: "Select Network",
                                                       dataValueField: "value",
                                                       dataTextField: "text",
                                                       data: srcDestVirtualNetworkList
                                                   }
                                               }
                                           },{
                                               elementId: "src_port",
                                               name: "Source Port",
                                               view: "FormInputView",
                                               width: 150,
                                               viewConfig: {
                                                   placeholder: "Enter Source Port",
                                                   width: 150,
                                                   path: "src_port",
                                                   templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                   dataBindValue: "src_port()",
                                               }
                                           },{
                                               elementId: "direction",
                                               name: "Direction",
                                               view: "FormDropdownView",
                                               width: 100,
                                               viewConfig: {
                                                   width: 100,
                                                   path: "direction",
                                                   templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                   dataBindValue: "direction()",
                                                   elementConfig:{
                                                       placeholder: "Direction",
                                                       data:['<>', '>']
                                                   }
                                               }
                                           },{
                                               elementId: "dst_network",
                                               name: "Destination Network",
                                               view: "FormDropdownView",
                                               width: 180,
                                               viewConfig: {
                                                   width: 180,
                                                   path: "dst_network",
                                                   templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                   dataBindValue: "dst_network()",
                                                   elementConfig:{
                                                       placeholder: "Select Network",
                                                       dataValueField: "value",
                                                       dataTextField: "text",
                                                       data: srcDestVirtualNetworkList
                                                   }
                                               }
                                           },{
                                               elementId: "dst_port",
                                               name: "Destination Port",
                                               view: "FormInputView",
                                               width: 150,
                                               viewConfig: {
                                                   placeholder: "Enter Destination Port",
                                                   width: 150,
                                                   path: "dst_port",
                                                   templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                   dataBindValue: "dst_port()",
                                               }
                                           }],
                                           rowActions: [
                                               {
                                                   onClick: "function() {\
                                                   $root.addRule(); }",
                                                   iconClass: 'fa fa-plus'
                                               },
                                               {
                                                   onClick: "function() {\
                                                   $root.deleteRule($data, this)\
                                                   ;}",
                                                   iconClass: 'fa fa-minus'
                                               }
                                           ],
                                           gridActions: [
                                               {
                                                   onClick: "function() {\
                                                   addRule(); }",
                                                   buttonTitle: ""
                                               }
                                           ]
                                       }
                               }]
                        }
                    ]
                }
            };
            return pktCaptureConfig;
        }
    });

    return packetCaptureEditView;
});

