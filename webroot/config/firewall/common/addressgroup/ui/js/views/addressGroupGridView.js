/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/addressgroup/ui/js/models/addressGroupModel',
    'config/firewall/common/addressgroup/ui/js/views/addressGroupEditView'
], function (_, ContrailView, AddressGroupModel, AddressGroupEditView) {
    var addressGroupEditView = new AddressGroupEditView(),
        gridElId = "#" + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID;

    var addressGroupGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getAddressGroupGridViewConfig(viewConfig));
        }
    });

    var getAddressGroupGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.SECURITY_POLICY_ADDRESS_GRP_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID,
                                title: ctwl.TITLE_SEC_GRP_ADDRESS_GROUP,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };
    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_SEC_GRP_ADDRESS_GROUP
                },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteAddressGrp').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteAddressGrp').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getAddressGrpDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Address Groups..'
                    },
                    empty: {
                        text: 'No Address Groups Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                        {
                             field: 'name',
                             name: 'Name',
                             id: 'name'
                        },
                        {
                            id: "prefix",
                            field: "prefix",
                            name: "Prefix",
                            formatter: prefixFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        }
                ]
            },
        };
        return gridElementConfig;
    };
    function getRowActionConfig(viewConfig) {
        var rowActionConfig = [
            ctwgc.getEditConfig('Edit', function(rowIndex) {
                dataView = $('#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID).data("contrailGrid")._dataView;
                addressGroupEditView.model = new AddressGroupModel(dataView.getItem(rowIndex));
                addressGroupEditView.renderAddEditAddressGroup({
                                      "title": 'Edit Address Group',
                                      'mode':'edit',
                                      'isGlobal': viewConfig.isGlobal,
                                       callback: function () {
                                          dataView.refreshData();
                }});
            }),
            ctwgc.getDeleteConfig('Delete', function(rowIndex) {
               var dataItem = $('#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
               addressGroupEditView.model = new AddressGroupModel(dataItem);
               addressGroupEditView.renderDeleteAddressGrp({
                                      "title": 'Delete Address Group',
                                      selectedGridData: [dataItem],
                                      callback: function () {
                                          var dataView = $('#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID).data("contrailGrid")._dataView;
                                          dataView.refreshData();
                }});
            })
        ];
        return rowActionConfig;
    }
    function getHeaderActionConfig(viewConfig) {
    	var headerActionConfig = [
    		{
                "type" : "link",
                "title" : ctwl.TITLE_TAG_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteAddressGrp',
                "onClick" : function() {
                    var addressGroupModel = new AddressGroupModel();
                    var checkedRows = $('#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID).data("contrailGrid").getCheckedRows();
                    if(checkedRows && checkedRows.length > 0) {
                    	addressGroupEditView.model = addressGroupModel;
                    	addressGroupEditView.renderDeleteAddressGrp(
                            {"title": 'Delete Address Group',
                            	selectedGridData: checkedRows,
                                callback: function () {
                                    var dataView =
                                        $('#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID).
                                        data("contrailGrid")._dataView;
                                    dataView.refreshData();
                                }
                            }
                        );
                    }
                }

            },
            {
                "type": "link",
                "title": ctwc.SEC_POL_SEC_GRP_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                	addressGroupEditView.model = new AddressGroupModel();
                	addressGroupEditView.renderAddEditAddressGroup({
                                              "title": 'Create',
                                              'mode': 'add',
                                              'isGlobal': viewConfig.isGlobal,
                                              callback: function () {
                       $('#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }
    function getAddressGrpDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                       {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-12',
                                    rows: [
                                        {
                                            title: ctwl.CFG_VN_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    label: 'Name',
                                                    key: 'name',
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Display Name',
                                                    key: 'display_name',
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'UUID',
                                                    key: 'uuid',
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Prefixes',
                                                    keyClass:'col-xs-4',
                                                    templateGeneratorConfig: {
                                                        formatter: 'addressGroupFormatter'
                                                    }
                                                }
                                                
                                            ].concat(ctwu.getTagsExpandDetails())
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };
    this.addressGroupFormatter = function(value, dc) {
        return prefixFormatter(null, null, null, value, dc, true);
    };
    function prefixFormatter(r, c, v, cd, dc, showAll) {
        var prefixlList = [], returnString = '';
        var  subnet = getValueByJsonPath(dc, 'address_group_prefix;subnet',[]);
        for(var i = 0; i < subnet.length; i++){
            var prefix = subnet[i].ip_prefix + '/'+ subnet[i].ip_prefix_len;
            var prefixText = '<span>'+ prefix +'</span>';
            prefixlList.push(prefixText);
        }
        if ((null != showAll) && (true == showAll)) {
        	if(prefixlList.length > 0){
        		for (var k = 0; k < prefixlList.length; k++) {
                    if (typeof prefixlList[k] !== "undefined") {
                        returnString += prefixlList[k] + "<br>";
                    }
                }
                return returnString;
        	}else{
        		return '-';
        	}
        }
        if(prefixlList.length > 0){
            for(var j = 0; j< prefixlList.length,j < 2; j++){
                if(prefixlList[j]) {
                    returnString += prefixlList[j] + "<br>";
                }
            }
            if (prefixlList.length > 2) {
                returnString += '<span class="moredataText">(' +
                    (prefixlList.length-2) + ' more)</span> \
                    <span class="moredata" style="display:none;" ></span>';
            }
        }else{
        	returnString = '-';
        }
        return  returnString;
    }
   return addressGroupGridView;
});

