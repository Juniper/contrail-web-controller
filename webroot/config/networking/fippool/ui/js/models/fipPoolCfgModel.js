
/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-config-model',
    'config/networking/fippool/ui/js/views/fipPoolFormatters',
], function (_, ContrailConfigModel,fipPoolFormatters) {
    var portFormatters = new fipPoolFormatters();
    var self;
    var FipPoolCfgModel = ContrailConfigModel.extend({
        defaultConfig: {
            'name':null,
            'display_name':null,
            'description':null,
            "id_perms": {"description": null},
            'fq_name': null,
            'parent_type': 'virtual-network',
            'virtualNetworkName' : '',
            'project_back_refs': []
        },
        setVNData: function(allNetworks) {
            self.allNetworks = allNetworks;
        },
        formatModelConfig: function (config) {
            self = this;
            var modelConfig = $.extend({},true,config);
            var virtualNetworkName = [];
            if(modelConfig['fq_name'] != null){
                for(var i = 0; i < modelConfig['fq_name'].length - 1; i++){
                    virtualNetworkName.push(modelConfig['fq_name'][i]);
                }
            }
             modelConfig['virtualNetworkName'] = virtualNetworkName.join(":");
            if(modelConfig['fq_name'] != null &&
               modelConfig['fq_name'].length >= 3) {
                modelConfig['name'] = modelConfig['fq_name'][3];
            }
            modelConfig['display_name']  = modelConfig['display_name'];
            modelConfig["description"] = modelConfig["id_perms"]["description"];
            modelConfig['project_back_refs'] = modelConfig["project_back_refs"];
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);

            return modelConfig;
        },
        validations: {
            fipPoolValidations: {
                'display_name': {
                    required: true,
                    msg: 'Enter the Floating IP Pool name'
                }
            }
        },
        configurefipPool: function (mode, callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var projects = [];
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
                //Creation and updating project back refs
                var to = [], projects = [];
                var shareList = _.get(newFipIPPoolsData, "share_list", null);
                var shareListArr = shareList.toJSON();
                if(shareList && shareListArr.length > 0){
                 to.push(newFipIPPoolsData["fq_name"][0]);
                 for(var i = 0; i < shareListArr.length; i++){
                    var tenantDetails = shareListArr[i].tenant().split('(');
                    if(tenantDetails.length > 1){
                        tenantDetails[0] = tenantDetails[0].slice(0, -1); 
                        tenantDetails[1] = tenantDetails[1].slice(0, -1); 
                        to.push(tenantDetails[0]);
                        projects.push({
                          uuid:tenantDetails[1],
                          to:to
                        })
                    }
                 }
               }
               else{
                   newFipIPPoolsData['project_back_refs'] = [];
               }
               if(mode == ctwl.CREATE_ACTION) {
                   newFipIPPoolsData['project_back_refs'] = projects;
               }
               else{
                   if(projects.length > 0){
                       for(var i = 0 ; i < projects.length; i++){
                           newFipIPPoolsData['project_back_refs'].push(projects[i]);
                       }
                   }
                   var filterDelArray = [];
                   var checkTenant;
                   $.each(newFipIPPoolsData['project_back_refs'], function(i, val) {
                       checkTenant = false;
                       for(var j=0; j< shareListArr.length; j++){
                         if(shareListArr[j].tenant().indexOf(newFipIPPoolsData['project_back_refs'][i].uuid) >= 0){
                               checkTenant = true;
                          }
                       }
                       if(checkTenant == true){
                           filterDelArray.push(newFipIPPoolsData['project_back_refs'][i]);
                       }
                     });
                   newFipIPPoolsData['project_back_refs'] = filterDelArray;
               }
               newFipIPPoolsData["id_perms"]["description"] = newFipIPPoolsData["description"];
                //permissions
                this.updateRBACPermsAttrs(newFipIPPoolsData);
                ctwu.deleteCGridData(newFipIPPoolsData);
                delete(newFipIPPoolsData.virtualNetworkName);
                var type = "";
                var url = "";
                delete newFipIPPoolsData.description;
                delete newFipIPPoolsData.detailData;
                var postData;
                ajaxConfig = {};
                var postData = {'floating-ip-pool':{}};
                if(mode == ctwl.CREATE_ACTION) {
                    postData["floating-ip-pool"] = newFipIPPoolsData;
                    ajaxConfig.url = ctwc.CREATE_FIP_POOL;
                    ajaxConfig.type = 'POST';
                } else {
                    postData["floating-ip-pool"] = newFipIPPoolsData;
                    ajaxConfig.url = ctwc.UPDATE_FIP_POOL + newFipIPPoolsData['uuid'];
                    ajaxConfig.type = 'PUT';
                }
               // ajaxConfig.type = 'POST';
                ajaxConfig.data = JSON.stringify(postData);
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
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
