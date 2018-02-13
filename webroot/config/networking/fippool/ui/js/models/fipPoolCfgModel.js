
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/fippool/ui/js/views/fipPoolFormatters',
], function (_, ContrailConfigModel,fipPoolFormatters) {
    var portFormatters = new fipPoolFormatters();
    var self;
    var PortModel = ContrailConfigModel.extend({
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
        getBridgeDomains: function(vnName) {
            if(!vnName) {
                return;
            }
            var self = this, ajaxConfig = {};
            ajaxConfig.type = 'POST';
            ajaxConfig.data = JSON.stringify({data: [{type: "bridge-domains",
                parent_type: "virtual-network",
                parent_fq_name_str: vnName}]});
            ajaxConfig.url = ctwc.URL_GET_CONFIG_DETAILS;
            contrail.ajaxHandler(ajaxConfig, null,
                function(response) {
                    self.user_created_bridge_domain_list(
                            portFormatters.bridgeDomainDDFormatter(response));
                    self.bridge_domain_refs(self.user_created_bridge_domain());
                },
                function(error){
                });
        },

        setVNData: function(allNetworks) {
            self.allNetworks = allNetworks;
        },
        getVNData: function() {
            return self.allNetworks;
        },
        setSubnetDataSource: function(subnetDataSource) {
            self.subnetDataSource = subnetDataSource;
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
                var newPortData = $.extend(true, {}, this.model().attributes),
                    selectedDomain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                    selectedProject = contrail.getCookie(cowc.COOKIE_PROJECT);
                ctwu.setNameFromDisplayName(newPortData);
                newPortData.fq_name = [selectedDomain,
                                     selectedProject];
                var selectedVN = newPortData["virtualNetworkName"].split(":");
                newPortData["fq_name"][2] = selectedVN[2];
                if(newPortData["name"] && newPortData["name"].trim() != "") {
                    newPortData["fq_name"][3] = newPortData["name"].trim();
                } else {
                    delete(newPortData["name"]);
                    delete(newPortData["display_name"]);
                }
                newPortData["id_perms"]["description"] = newPortData["description"];
                //permissions
                this.updateRBACPermsAttrs(newPortData);

                ctwu.deleteCGridData(newPortData);

                delete(newPortData.virtualNetworkName);
                var type = "";
                var url = "";
                if(mode == ctwl.CREATE_ACTION) {
                //create//
                    type = "POST";
                    delete(newPortData["uuid"]);
                    url = ctwc.URL_PORT_POST;
                } else {
                    type = "PUT";
                    url = ctwc.get(ctwc.URL_PORT_PUT,
                                   newPortData["uuid"]);
                }

                delete newPortData.is_sec_grp;
                delete newPortData.securityGroupValue;
                delete newPortData.virtual_machine_refs;
                delete newPortData.virtual_network_refs;
                delete newPortData.description;
                var postData = {'floating-ip-pool':{}};
                postData["floating-ip-pool"] = newPortData;
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
            console.log("uuidList",uuidList);
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
    return PortModel;
});
