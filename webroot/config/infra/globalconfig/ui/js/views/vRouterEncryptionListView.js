/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
	'underscore',
	'lodashv4',
    'contrail-view',
    'contrail-list-model',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, lodashv4, ContrailView, ContrailListModel, GlobalConfigUtils) {
    var gcUtils = new GlobalConfigUtils();
    var vRouterEncryptionListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            self.encryptDataObj = {};
            self.encryptDataObj.vRouterGrpList = [];
            self.encryptDataObj.vRouterList = [];
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'global-vrouter-configs'}]})
                    },
                    dataParser: self.parseVRouterEncryptionData,
                },
                vlRemoteConfig: {
                    vlRemoteList : vlRemoteVRouterConfig(self.encryptDataObj),
                    completeCallback: function(response) {
                        self.renderView4Config(self.$el,
                            contrailListModel,
                            getVRouterEncryptionGridViewConfig(self.encryptDataObj));
                    }
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
        },
        parseVRouterEncryptionData : function(result){
            var gridDS = [],
                globalSysConfig = getValueByJsonPath(result,
                    "0;global-vrouter-configs;0;global-vrouter-config", {});
            _.each(ctwc.GLOBAL_VROUTER_ENCRYPTION_MAP, function(encryptOption){
            		gridDS.push({ name: encryptOption.name, key: encryptOption.key,
                     value: getValueByJsonPath(globalSysConfig,
                    		 encryptOption.key, "-", false) });
               
            });
            return gridDS;
        }
    });
    
    function vlRemoteVRouterConfig(encryptDataObj) {
        return [{
            getAjaxConfig: function (responseJSON) {
                var lazyAjaxConfig = {
                		 type: 'GET',
                      url: ctwc.get(ctwc.URL_CFG_VROUTER_DETAILS),
                      parse: gcUtils.vRouterCfgDataParser
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                var allVRGrpList = [];
                var vRouterList=[];
                allVRGrpList.push({
					text : 'Enter or Select',
					value : "-1",
					disabled : true,
					parent : "virtual_router_ip_address",
					id : "0.0.0.0"
				});
                if ('virtual-routers' in response) {
                    var vrData = response['virtual-routers'];
                    vrData =  lodashv4.orderBy(vrData, 'virtual-router.virtual_router_ip_address', 'asc');
                    _.each(vrData, function(vRouter){
                    	 	var vr = vRouter['virtual-router'];
                         var ipAddressName = vr["virtual_router_ip_address"];
                         var ipAddress = vr["virtual_router_ip_address"];
                         var ipDisplayName= vr["display_name"];
                         var ipAddressValue = ipAddressName;
                         vRouterList.push({key:ipAddress, value: ipDisplayName});
                         allVRGrpList.push({text : ipAddressName, value :
                         	ipAddressName, parent : "virtual_router_ip_address",
                             id: ipAddressValue});
                   
                    	});
                }
                var addrFields = [];
		        addrFields.push({
					text : 'Virtual Router IP Address',
					value : 'virtual_router_ip_address',
					disabled : true,
					id : 'virtual_router_ip_address',
					children : allVRGrpList
				});
                encryptDataObj.vRouterGrpList = addrFields;
                encryptDataObj.vRouterList = vRouterList;
            }
        }];
    }

    var getVRouterEncryptionGridViewConfig = function (encryptDataObj) {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_VROUTER_ENCRYPTION_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_VROUTER_ENCRYPTION_ID,
                                view: "vRouterEncryptionGridView",
                                viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                		encryptDataObj:encryptDataObj,
                                		pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                		}
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return vRouterEncryptionListView;
});

