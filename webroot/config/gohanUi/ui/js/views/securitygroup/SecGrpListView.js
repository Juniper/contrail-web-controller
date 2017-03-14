/*

 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var gridElId = '#' + ctwl.SEC_GRP_GRID_ID;
    var SecGrpListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var tenantId = contrail.getCookie('gohanRole'),getAjaxs = [];
            var listModelConfig = {
                   remote: {
                       ajaxConfig: {
                           url: './gohan_contrail/v1.0/tenant/security_groups?sort_key=id&sort_order=asc&limit=25&offset=0&tenant_id='+tenantId,
                           type: "GET",
                           timeout : self.ajaxTimeout
                       },
                       dataParser: ctwp.gohanSecurityGroupDataParser
                   },
                   vlRemoteConfig : {
                       vlRemoteList : self.getSecurityRules(tenantId)
                   }
            };
            getAjaxs[0] = $.ajax({
            	url: './gohan_contrail/v1.0/tenant/security_groups?sort_key=id&sort_order=asc&limit=25&offset=0',
                type:'GET'
            });
            getAjaxs[1] = $.ajax({
            	url: '/api/tenants/config/projects',
                type:'GET'
            });
            $.when.apply($, getAjaxs).then( function () {
            	var sgData = arguments[0][0]['security_groups'],
            	    pjData = arguments[1][0]['projects'], allSecGrpList = [], projectList = [];
            	    for(var j = 0; j < pjData.length; j++){
            	    	var uuid = pjData[j].uuid.split('-');
            	    	projectList.push(uuid.join(''));
            	    	var fqName = pjData[j].fq_name;
            	    	projectList.push(fqName[fqName.length -1]);
            	    }
            	    var cnt = sgData.length;
	                for (var i = 0; i < cnt; i++) {
	                	var index = projectList.indexOf(sgData[i].tenant_id) + 1;
	                	var projectName = projectList[index];
	                	var sgName = sgData[i].name +' ('+ projectName +')' ;
	                	var sgid = sgData[i].id +';security_group';
	                    allSecGrpList.push({text : sgName, value : sgid, parent : "security_group", id: sgid});
	                }
                    var contrailListModel = new ContrailListModel(listModelConfig);
                    self.renderView4Config(self.$el, contrailListModel, getSecGrpViewConfig(allSecGrpList));
            })
            
        },
        getSecurityRules : function (tenantId) {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var lazyAjaxConfig = {
                                url: './gohan_contrail/v1.0/tenant/security_group_rules?sort_key=id&sort_order=asc&limit=25&offset=0',
                                type: "GET",
                                timeout : self.ajaxTimeout
                        }
                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailListModel, parentModelList) {
                       var secGroupData = contrailListModel.getItems();
                       var rulesList = response[Object.keys(response)[0]];
                       for(var i = 0; i < secGroupData.length ; i++){
                           var rules = [];
                           for(var j = 0; j < rulesList.length; j++){
                               if(secGroupData[i].id === rulesList[j].security_group_id){
                                   rules.push(rulesList[j]);
                               }
                           }
                           secGroupData[i]['sgRules'] = rules;
                       }
                       contrailListModel.updateData(secGroupData);
                    }
                }
            ];
        }
    });

    var getSecGrpViewConfig = function (sgDataObj) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SEC_GRP_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_SEC_GRP_ID,
                                title: ctwl.TITLE_SEC_GRP,
                                view: "SecGrpGridView",
                                viewPathPrefix: "config/gohanUi/ui/js/views/securitygroup/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    sgDataObj: sgDataObj
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return SecGrpListView;
});


