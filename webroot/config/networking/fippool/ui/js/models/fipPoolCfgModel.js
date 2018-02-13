
/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/fippool/ui/js/views/fipPoolFormatters',
], function (_, ContrailConfigModel,fipPoolFormatters) {
    var portFormatters = new fipPoolFormatters();
    var self;
    var FipPoolCfgModel = ContrailConfigModel.extend({
        defaultConfig: {
            'name':null,
            'description':null,
            "id_perms": {"description": null},
            'fq_name': null,
            'parent_type': 'virtual-network',
            'virtual_network_refs':[],
            'virtualNetworkName' : '',
            'virtual_machine_refs':[]
        },
        setVNData: function(allNetworks) {
            self.allNetworks = allNetworks;
        },
        formatModelConfig: function (config) {
            self = this;
            var modelConfig = $.extend({},true,config);
            //virtual Network
            var virtualNetwork = getValueByJsonPath(
                                 modelConfig,"virtual_network_refs;0;to",[]);
            if(virtualNetwork.length > 0) {
                modelConfig['virtualNetworkName'] = virtualNetwork.join(":");
            }
            //Modal config default Fqname formatting
            if(modelConfig['fq_name'] != null &&
               modelConfig['fq_name'].length >= 3) {
                modelConfig['name'] = modelConfig['fq_name'][3];
            }
            modelConfig["description"] = modelConfig["id_perms"]["description"];
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);

            return modelConfig;
        },
        validations: {
            fipPoolValidations: {
                'name': {
                    required: true,
                    msg: 'Enter the Floating IP Pool name'
                }
            }
        },
        configurefipPool: function (mode, callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var temp_val;
            var ItemsTo = [];
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : 'fipPoolValidations'
                },
                //permissions
                ctwu.getPermissionsValidation()
            ];
            if(this.isDeepValid(validations)) {
                var newFipIPPoolsData = $.extend(true, {}, this.model().attributes),
                    selectedDomain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                    selectedProject = contrail.getCookie(cowc.COOKIE_PROJECT);
                ctwu.setNameFromDisplayName(newFipIPPoolsData);
                newFipIPPoolsData.fq_name = [selectedDomain,
                                     selectedProject];
                var selectedVN = newFipIPPoolsData["virtualNetworkName"].split(":");
                newFipIPPoolsData["fq_name"][2] = selectedVN[2];
                if(newFipIPPoolsData["name"] && newFipIPPoolsData["name"].trim() != "") {
                    newFipIPPoolsData["fq_name"][3] = newFipIPPoolsData["name"].trim();
                } else {
                    delete(newFipIPPoolsData["name"]);
                    delete(newFipIPPoolsData["display_name"]);
                }
                newFipIPPoolsData["id_perms"]["description"] = newFipIPPoolsData["description"];
                //permissions
                this.updateRBACPermsAttrs(newFipIPPoolsData);

                ctwu.deleteCGridData(newFipIPPoolsData);

                delete(newFipIPPoolsData.virtualNetworkName);
                var type = "";
                var url = "";
                delete newFipIPPoolsData.securityGroupValue;
                delete newFipIPPoolsData.virtual_machine_refs;
                delete newFipIPPoolsData.virtual_network_refs;
                delete newFipIPPoolsData.description;
                var postData = {'floating-ip-pool':{}};
                postData["floating-ip-pool"] = newFipIPPoolsData;
                console.log("postData",postData);
                ajaxConfig = {};
                if(mode == ctwl.CREATE_ACTION) {
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }
                ajaxConfig.type = 'POST';
                ajaxConfig.data = JSON.stringify(postData);
                //ajaxConfig.url = url;
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    console.log(response);
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    console.log(error);
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText
                                     (ctwc.FIP_POOL_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteFloatingIpPools: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'floating-ip-pool',
                                              'deleteIDs': uuidList}]);

            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
    });
    return FipPoolCfgModel;
});
