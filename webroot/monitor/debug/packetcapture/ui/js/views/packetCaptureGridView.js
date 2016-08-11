/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'monitor/debug/packetcapture/ui/js/models/packetCaptureModel',
    'monitor/debug/packetcapture/ui/js/views/packetCaptureEditView',
    'monitor/debug/packetcapture/ui/js/packetCaptureFormatter'
], function(_, ContrailView, PacketCaptureModel,
    PacketCaptureEditView, PacketCaptureFormatter) {
    var gridElId = '#' + ctwc.PACKET_CAPTURE_GRID_ID;
    var packetCaptureEditView = new PacketCaptureEditView();
    var packetCaptureFormatter = new PacketCaptureFormatter();
    var self;
    var packetCaptureGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self = this;
            self.selectedProject = viewConfig["selectedProject"];
            self.analyzerImageAvbl =  viewConfig["analyzerImageAvbl"];
            self.renderView4Config(self.$el, self.model,
                getPacketCaptureGridViewConfig(pagerOptions));
        }
    });

    var getPacketCaptureGridViewConfig = function (pagerOptions) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.PACKET_CAPTURE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.PACKET_CAPTURE_GRID_ID,
                                title: ctwl.TITLE_PACKET_CAPTURE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig:
                                        getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_PACKET_CAPTURE
                },
                advanceControls: getHeaderActionConfig()
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeletePacketCapture').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeletePacketCapture').removeClass('disabled-link');
                        }
                    },
                    actionCell:getRowActionConfig(),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            getPacketCaptureDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Analyzers..'
                    },
                    empty: {
                        text: 'No Analyzers Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                {
                    field: "display_name",
                    name: "Analyzer Name",
                    minWidth: 100,
                    sortable : {
                        sortBy: "formattedValue"
                    },
                    formatter: packetCaptureFormatter.displayNameFormatter
                },{
                    field: "service_instance_properties.left_virtual_network",
                    name: "Virtual Network",
                    minWidth: 100,
                    sortable: {
                        sortBy: "formattedValue"
                    },
                    formatter: packetCaptureFormatter.vnFormatter
                },{
                    field: "network_policy.virtual_network_back_refs",
                    name: "Associated Networks",
                    minWidth: 100,
                    sortable: {
                        sortBy: "formattedValue"
                    },
                    formatter: packetCaptureFormatter.associateVNFormatter
                },{
                    field: "network_policy.network_policy_entries.policy_rule",
                    name: "Analyzer Rules",
                    minWidth: 400,
                    sortable: {
                        sortBy: "formattedValue"
                    },
                    formatter: packetCaptureFormatter.analyzerRuleFormatter
                },{
                    field: "vmStatus",
                    name: "Status",
                    minWidth: 100,
                    sortable: {
                        sortBy: "formattedValue"
                    },
                    formatter: packetCaptureFormatter.vmStatusFormatter
                }]
            }
        };
        return gridElementConfig;
    };

    function analyzerImageCheck(callback) {
        if(self.analyzerImageAvbl.isAnalyzerImageCheckDone) {
            if(self.analyzerImageAvbl.isAnalyzerImageAvailable) {
                callback();
            } else {
                showInfoWindow("Analyzer image is not found.", "Warning");
                return;
            }
        } else {
            showInfoWindow("Waiting to get the analyzer image. Try again after some time.", "Message");
            return;
        }
    }

    function getRowActionConfig() {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
                analyzerImageCheck(function(){
                    var dataItem =
                        $(gridElId).data("contrailGrid").
                            _dataView.getItem(rowIndex);
                    var packetCaptureModel = new PacketCaptureModel(dataItem),
                        checkedRow = dataItem,
                        title =
                            ctwl.TITLE_EDIT_PACKET_CAPTURE +
                            ' ('+ dataItem['name'] +')';

                    packetCaptureEditView.model = packetCaptureModel;
                    packetCaptureEditView.renderAddEditPacketCapture(
                        {"title": title, checkedRow: checkedRow,
                            callback: function () {
                                var dataView =
                                    $(gridElId).data("contrailGrid")._dataView;
                                dataView.refreshData();
                            },
                            mode : ctwl.EDIT_ACTION
                        }
                    );
                });
            }, "Edit"),
            ctwgc.getListAction(function (rowIndex) {
                var dataItem =
                    $(gridElId).data("contrailGrid").
                        _dataView.getItem(rowIndex),
                    vmUUID = getValueByJsonPath(dataItem, "vmDetails;0;server;id", null);

                if(vmUUID == null) {
                    showInfoWindow("Analyzer is not ready. Try after some time.", "Launch Analyzer");
                    return;
                }
                var ajaxConfig = {
                    url: '/api/tenants/config/service-instance-vm?project_id=' +
                             getCookie("project") + "&vm_id=" + vmUUID,
                    type: "GET"
                };
                contrail.ajaxHandler(ajaxConfig, null, function(result) {
                    var href = jsonPath(result, "$.console.url")[0];
                    window.open(href);
                });
            }, "View Analyzer"),
          ctwgc.getDeleteAction(function (rowIndex) {
              var dataItem = $(gridElId).data("contrailGrid").
                  _dataView.getItem(rowIndex),
                  packetCaptureModel = new PacketCaptureModel(dataItem),
                  checkedRow = [dataItem];

              packetCaptureEditView.model = packetCaptureModel;
              packetCaptureEditView.renderDeletePacketCapture(
                  {"title": ctwl.TITLE_PACKET_CAPTURE_DELETE,
                      checkedRows: checkedRow,
                      callback: function () {
                          var dataView =
                              $(gridElId).data("contrailGrid")._dataView;
                          dataView.refreshData();
                      }
                  }
              );
        })];
        return rowActionConfig;
    };

    function getHeaderActionConfig() {
        var headerActionConfig;
	        var headerActionConfig = [
	            {
                    "type" : "link",
	                "title" : ctwl.TITLE_PACKET_CAPTURE_MULTI_DELETE,
	                "iconClass": 'fa fa-trash',
                    "linkElementId": 'btnDeletePacketCapture',
	                "onClick" : function() {
	                    var packetCaptureModel = new PacketCaptureModel();
	                    var checkedRows =
	                        $(gridElId).data("contrailGrid").
	                        getCheckedRows();
                        if(checkedRows && checkedRows.length > 0) {
	                        packetCaptureEditView.model = packetCaptureModel;
	                        packetCaptureEditView.renderDeletePacketCapture(
	                            {"title": ctwl.TITLE_PACKET_CAPTURE_MULTI_DELETE,
	                                checkedRows: checkedRows,
	                                callback: function () {
	                                    var dataView =
	                                        $(gridElId).
	                                        data("contrailGrid")._dataView;
	                                    dataView.refreshData();
	                                }
	                            }
	                        );
                        }
	                }
	            },
	            {
	                "type" : "link",
	                "title" : ctwl.TITLE_ADD_PACKET_CAPTURE,
	                "iconClass" : "fa fa-plus",
	                "onClick" : function() {
                        analyzerImageCheck(function(){
	                        var packetCaptureModel = new PacketCaptureModel();
	                        packetCaptureEditView.model = packetCaptureModel;
	                        packetCaptureEditView.renderAddEditPacketCapture(
	                            {"title": ctwl.TITLE_ADD_PACKET_CAPTURE,
	                                callback: function () {
	                                    var dataView =
	                                        $(gridElId).
	                                        data("contrailGrid")._dataView;
	                                    dataView.refreshData();
	                                },
	                                mode : ctwl.CREATE_ACTION
	                            }
	                        );
                        });
	                }
	            }
	        ];

        return headerActionConfig;
    };

    function getPacketCaptureDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-12',
                            rows: [{
                                title: 'Details',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: 'display_name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Name',
                                    templateGeneratorConfig: {
                                        formatter: "DisplayNameFormatter"
                                    }
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID"
                                },{
                                    key: "network_policy.virtual_network_back_refs",
                                    templateGenerator: "TextGenerator",
                                    label: "Associated Networks",
                                    templateGeneratorConfig: {
                                        formatter: "AssociateVNFormatter"
                                    }
                                },{
                                    key: "network_policy.network_policy_entries.policy_rule",
                                    templateGenerator: "TextGenerator",
                                    label: "Analyzer Rules",
                                    templateGeneratorConfig: {
                                        formatter: "AnalyzerRuleFormatter"
                                    }
                                }]
                            }]
                        }]
                    }
                }]
            }
        };
    };


    this.DisplayNameFormatter = function(v, dc) {
        return packetCaptureFormatter.displayNameFormatter("", "", v, "", dc);
    };
    this.AssociateVNFormatter = function(v, dc) {
        return packetCaptureFormatter.associateVNFormatter("", "", v, "", dc);
    };
    this.AnalyzerRuleFormatter = function(v, dc) {
        return packetCaptureFormatter.analyzerRuleFormatter("", "", v, "", dc);
    };

    return packetCaptureGridView;
});

