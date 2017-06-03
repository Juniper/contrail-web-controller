/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/tag/ui/js/models/tagModel',
    'config/firewall/common/tag/ui/js/views/tagEditView'
], function (_, ContrailView, TagModel, TagEditView) {
    var tagEditView = new TagEditView(),
        gridElId = "#" + ctwc.SECURITY_POLICY_TAG_GRID_ID;
    var isGlobal = true;
    var tagGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            isGlobal = viewConfig["isGlobal"];
            self.renderView4Config(self.$el, self.model,
                                   getTagGridViewConfig(viewConfig));
        }
    });

    var getTagGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SECURITY_POLICY_TAG_GRID_ID,
                                title: ctwl.TITLE_SEC_GRP_TAG,
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
                    text: ctwl.TITLE_SEC_GRP_TAG
                },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteTAG').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteTAG').removeClass('disabled-link');
                        }
                    },
                    actionCell: rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getTagDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Tags..'
                    },
                    empty: {
                        text: 'No Tags Found.'
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
                        /*{
                            field: 'tag_type',
                            name: 'Type',
                            id: 'tag_type'
                        },
                        {
                            field: 'tag_value',
                            name: 'Value',
                            id: 'tag_value'
                        },*/
                        {
                            id: "ref_obj",
                            field: "ref_obj",
                            name: "Associated Virtual Networks",
                            formatter: virtualNetworkFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        },
                        {
                            id: "ref_obj",
                            field: "ref_obj",
                            name: "Associated Ports",
                            formatter: portsFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        },
                        {
                            id: "ref_obj",
                            field: "ref_obj",
                            name: "Associated Objects",
                            formatter: othersFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        }
                ]
            },
        };
        return gridElementConfig;
    };
    var rowActionConfig = [
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
           var dataItem = $('#' + ctwc.SECURITY_POLICY_TAG_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
           tagEditView.model = new TagModel(dataItem);
           tagEditView.renderDeleteTag({
                                  "title": 'Delete Tag',
                                  selectedGridData: [dataItem],
                                  callback: function () {
                                      var dataView = $('#' + ctwc.SECURITY_POLICY_TAG_GRID_ID).data("contrailGrid")._dataView;
                                      dataView.refreshData();
            }});
        })
    ];
    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwc.TITLE_TAG_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteTAG',
                "onClick" : function() {
                    var tagModel = new TagModel();
                    var checkedRows = $('#' + ctwc.SECURITY_POLICY_TAG_GRID_ID).data("contrailGrid").getCheckedRows();
                    if(checkedRows && checkedRows.length > 0) {
                        tagEditView.model = tagModel;
                        tagEditView.renderDeleteTag(
                            {"title": ctwc.TITLE_TAG_MULTI_DELETE,
                                selectedGridData: checkedRows,
                                callback: function () {
                                    var dataView =
                                        $('#' + ctwc.SECURITY_POLICY_TAG_GRID_ID).
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
                "title": ctwc.SEC_POL_TAG_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    tagEditView.model = new TagModel();
                    tagEditView.renderAddEditTag({
                                              "title": 'Create Tag',
                                              'mode': 'add',
                                              'isGlobal': viewConfig.isGlobal,
                                              callback: function () {
                       $('#' + ctwc.SECURITY_POLICY_TAG_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }
    function getTagDetailsTemplateConfig() {
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
                                                    label: 'Type',
                                                    key: 'tag_type',
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Value',
                                                    key: 'tag_value',
                                                    keyClass:'col-xs-4',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'tag_id',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'ID',
                                                    keyClass:'col-xs-4',
                                                    templateGeneratorConfig: {
                                                        formatter: 'tagIdFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'tag_id',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Associated Virtual Networks',
                                                    keyClass:'col-xs-4',
                                                    templateGeneratorConfig: {
                                                        formatter: 'detailsVirtualNetworkFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'tag_id',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Associated Ports',
                                                    keyClass:'col-xs-4',
                                                    templateGeneratorConfig: {
                                                        formatter: 'detailsPortsFormatter'
                                                    }
                                                },{
                                                    key: 'tag_id',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Associated Objects',
                                                    keyClass:'col-xs-4',
                                                    templateGeneratorConfig: {
                                                        formatter: 'detailsOthersFormatter'
                                                    }
                                                }
                                            ]
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
    this.tagIdFormatter = function(value, dc) {
    	var getId = getValueByJsonPath(dc, 'tag_id', 0);
    	//var hexId = getId.toString(16);
    	return getId;
    };
    this.detailsVirtualNetworkFormatter = function(value, dc) {
        return virtualNetworkFormatter(null, null, null, value, dc, true);
    };
    this.detailsPortsFormatter = function(value, dc) {
        return portsFormatter(null, null, null, value, dc, true);
    };
    this.detailsOthersFormatter = function(value, dc) {
        return othersFormatter(null, null, null, value, dc, true);
    }
    function virtualNetworkFormatter(r, c, v, cd, dc, showAll){
    	var returnString = '',refList = [];
    	var vn = getValueByJsonPath(dc, 'virtual_network_back_refs', []);
    	for(var j = 0; j < vn.length; j++){
    		var to = vn[j].to;
    		var name = to[to.length-1];
            name = isGlobal ? name + ' (' + to[1] + ')' : name;
    		var refText = '<span>'+ name +'</span>';
    		refList.push(refText);
    	}
        
        if(refList.length > 0){
        	if ((null != showAll) && (true == showAll)) {
                for (var q = 0; q < refList.length; q++) {
                    if (typeof refList[q] !== "undefined") {
                        returnString += refList[q] + "<br>";
                    }
                }
                return returnString;
            }
            for(var l = 0; l< refList.length,l < 2; l++){
                if(refList[l]) {
                    returnString += refList[l] + "<br>";
                }
            }
            if (refList.length > 2) {
                returnString += '<span class="moredataText">(' +
                    (refList.length-2) + ' more)</span> \
                    <span class="moredata" style="display:none;" ></span>';
            }
        }else{
        	returnString = '-';
        }
        return  returnString;
    };
    function portsFormatter(r, c, v, cd, dc, showAll){
    	var returnString = '',refList = [];
    	var vmi = getValueByJsonPath(dc, 'virtual_machine_interface_back_refs', []);
    	for(var j = 0; j < vmi.length; j++){
    		var to = vmi[j].to;
    		var name = to[to.length-1];
    		var refText = '<span>'+ name +'</span>';
    		refList.push(refText);
    	}
        
        if(refList.length > 0){
        	if ((null != showAll) && (true == showAll)) {
                for (var q = 0; q < refList.length; q++) {
                    if (typeof refList[q] !== "undefined") {
                        returnString += refList[q] + "<br>";
                    }
                }
                return returnString;
            }
            for(var l = 0; l< refList.length,l < 2; l++){
                if(refList[l]) {
                    returnString += refList[l] + "<br>";
                }
            }
            if (refList.length > 2) {
                returnString += '<span class="moredataText">(' +
                    (refList.length-2) + ' more)</span> \
                    <span class="moredata" style="display:none;" ></span>';
            }
        }else{
        	returnString = '-';
        }
        return  returnString;
    };
    
    function capitalizeSentence(sentence) {
        var word = sentence.split(" ");
        for ( var i = 0; i < word.length; i++ ) {
            word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
        }
        return word.join(" ");
    };
    
    function othersFormatter(r, c, v, cd, dc, showAll){
        var returnString = '',refList = [],refText;
        var rowObj = dc;
        for(var j in rowObj){
        	if(j !== 'virtual_machine_interface_back_refs' && j !== 'virtual_network_back_refs'){
        		if(j.substring(j.length-5,j.length) === '_refs'){
 	               var nameList = [];
 	               for(var k = 0; k < rowObj[j].length; k++){
 	            	   var to = rowObj[j][k].to;
 	            	   var name = to[to.length-1];
 	            	   nameList.push(name);
 	               }
 	               var ref = j.split('_');
 	               ref.pop();
 	               ref.pop();
 	               var keyRef = ref.join('_');
 	               var key = capitalizeSentence(cowu.replaceAll("_", " ",keyRef));
 	              if ((null != showAll) && (true == showAll)) {
 	            	 refText = '<span class="rule-format">'+ key +'</span>&nbsp:&nbsp<span>'+ nameList.join(',') +'</span>';
 	              }else{
 	            	 refText = '<span>'+ nameList.join(',') +'</span>';
 	              }
 	              refList.push(refText);
 	            }
        	}
	    }
        if(refList.length > 0){
        	if ((null != showAll) && (true == showAll)) {
                for (var q = 0; q < refList.length; q++) {
                    if (typeof refList[q] !== "undefined") {
                        returnString += refList[q] + "<br>";
                    }
                }
                return returnString;
            }
            for(var l = 0; l< refList.length,l < 2; l++){
                if(refList[l]) {
                    returnString += refList[l] + "<br>";
                }
            }
            if (refList.length > 2) {
                returnString += '<span class="moredataText">(' +
                    (refList.length-2) + ' more)</span> \
                    <span class="moredata" style="display:none;" ></span>';
            }
        }else{
        	returnString = '-';
        }
        return  returnString;
    };
   return tagGridView;
});

