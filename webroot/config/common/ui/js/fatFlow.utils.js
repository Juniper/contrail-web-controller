/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'config/common/ui/js/models/fatFlowModel'
], function (_, fatFlowModel) {
    var fatFlowUtils = function() {
        var self = this;
        //Grid column expand label: Fat Flow//
        self.FatFlowFormatter = function(d, c, v, cd, dc) {
            var fatFlow = "";
            var fatFlowData = getValueByJsonPath(dc,
                          "virtual_machine_interface_fat_flow_protocols;fat_flow_protocol",
                          getValueByJsonPath(dc,
                                  "virtual_network_fat_flow_protocols;fat_flow_protocol",
                                  []),
                          []);
            if(fatFlowData.length > 0) {
                var fatFlow_length = fatFlowData.length;
                fatFlow = "<table width='100%'><tbody><tr><th class='col-xs-4'>Protocol</th><th class='col-xs-4'>Port</th><th class='col-xs-4'>Ignore Address</th></tr>"
                for(var i = 0; i < fatFlow_length;i++) {
                    var fatFlowVal = fatFlowData[i];
                    fatFlow += "<tr><td>";
                    fatFlow += fatFlowVal["protocol"];
                    fatFlow += "</td><td>";
                    fatFlow += fatFlowVal["port"];
                    fatFlow += "</td><td>";
                    fatFlow += _.startCase(fatFlowVal["ignore_address"]);
                    fatFlow += "</td></tr>";
                }
                fatFlow += "</tbody></table>";
            } else {
                fatFlow = "-";
            }
            return fatFlow;
        };

        self.fatFlowSection = function() {
            return {
                columns: [{
                    elementId: 'fatFlowAccordion',
                    view: 'AccordianView',
                    viewConfig : [{
                        elementId: 'fatFlow',
                        title: 'Fat Flow(s)',
                        view: "SectionView",
                        active:false,
                        viewConfig : {
                            rows : [{
                                columns: [{
                                    elementId: 'fatFlowCollection',
                                    view: 'FormEditableGridView',
                                    viewConfig: {
                                        path: "fatFlowCollection",
                                        class: 'col-xs-12',
                                        validation: 'fatFlowValidations',
                                        templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                        collection: "fatFlowCollection",
                                        columns: [{
                                            elementId: 'protocol',
                                            name: "Protocol",
                                            view: "FormDropdownView",
                                            viewConfig: {
                                                path: 'protocol',
                                                templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                dataBindValue: 'protocol()',
                                                placeholder: 'Protocol',
                                                class: "col-xs-6",
                                                width:180,
                                                label: 'Protocol',
                                                elementConfig:{
                                                    dataTextField: "text",
                                                    dataValueField: "value",
                                                    data : [
                                                        {'text':'TCP','value':'tcp'},
                                                        {'text':'UDP','value':'udp'},
                                                        {'text':'SCTP','value':'sctp'},
                                                        {'text':'ICMP','value':'icmp'}
                                                    ]
                                                }
                                            }
                                        }, {
                                            elementId: 'port',
                                            name: "Port",
                                            view: "FormInputView",
                                            viewConfig: {
                                                path: 'port',
                                                placeholder: '0 to 65535',
                                                templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                dataBindValue: 'port()',
                                                disabled: "disablePort()",
                                                class: "col-xs-6",
                                                width:180,
                                                label: 'Value'
                                            }
                                        },
                                        {
                                            elementId: 'ignore_address',
                                            name: "Ignore Address",
                                            view: "FormDropdownView",
                                            viewConfig: {
                                                path: 'ignore_address',
                                                templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                dataBindValue: 'ignore_address()',
                                                placeholder: 'Address ignored while creating flows',
                                                class: "col-xs-6",
                                                width:180,
                                                label: 'Ignore Address',
                                                elementConfig:{
                                                    dataTextField: "text",
                                                    dataValueField: "value",
                                                    data : [
                                                        {'text':'None','value':'none'},
                                                        {'text':'Source','value':'source'},
                                                        {'text':'Destination','value':'destination'}
                                                    ]
                                                }
                                            }
                                        }],
                                        rowActions: [{
                                            onClick: "function() { $root.addFatFlowByIndex($data, this); }",
                                            iconClass: 'fa fa-plus',
                                            },
                                            {
                                            onClick:
                                            "function() { $root.deleteFatFlow($data, this); }",
                                            iconClass: 'fa fa-minus'
                                        }],
                                        gridActions: [{
                                            onClick: "function() { addFatFlow(); }",
                                            buttonTitle: ""
                                        }]
                                    }
                                }]
                            }]
                        }
                    }]
                }]
            };
        };

    }
    return fatFlowUtils;
});
