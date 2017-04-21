/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/gohanUi/templates/ui/js/models/gcSvcTemplateInterfaceModel'
], function (_, ContrailModel, SvcTemplateInterfaceModel) {
    var svcTemplateCfgModel = ContrailModel.extend({

        defaultConfig: {
            "availability_zone_enable": false,
            "description": '',
            "flavor": {
              "description": '',
              "disk": null,
              "ephemeral": null,
              "id": '',
              "name": '',
              "ram": null,
              "swap": null,
              "tenant_id": '',
              "vcpus": null
            },
            "flavor_id": 'ddc',
            "id": '',
            "image": {
              "container_format": '',
              "description": '',
              "disk_format": '',
              "id": '',
              "is_public": false,
              "min_disk": null,
              "min_ram": null,
              "name": '',
              "protected": false,
              "tenant_id": '',
              "url": ''
            },
            "image_id": '',
            "name": '',
            "service_mode": 'transparent',
            "tenant_id": '',
            'interfaces' : [],
            'user_created_image_list' : []
        },

        formatModelConfig: function (modelConfig) {
            var ifList = [];
             var ifCount = ifList.length, ifModels = [];
             if(ifList.length > 0) {
                 for(var i = 0; i < ifCount; i++) {
                     var ifModel = new SvcTemplateInterfaceModel(ifList[i]);
                     ifModels.push(ifModel)
                 }
             }
             var ifCollectionModel = new Backbone.Collection(ifModels);
             var versionList = [{text: 'v2', id: 2}];
             if (false == isVCenter()) {
                 versionList.splice(0, 0, {text: 'v1', id: 1});
             }
             modelConfig['interfaces'] = ifCollectionModel;
             return modelConfig;
        },
        addSvcTemplateInterface: function() {
            var interfaces = this.model().attributes['interfaces'];
            var svcType = this.model().get('user_created_service_type');
            var intfTypes = ['management', 'left', 'right', 'other0'];
            var intfColl = this.model().get('interfaces');
            var len = intfColl.length;
            var intfTypesList = [];
            var tmpIntfList = intfTypes;
            var otherIntfIdxList = [];
            for (var i = 0; i < len; i++) {
                var modIntf = intfColl.at(i).get('service_interface_type')();
                intfTypesList.push(modIntf);
                intfTypes.push('other' + (i + 1).toString());
            }
            var newIntfTypes = _.difference(intfTypes, intfTypesList);
            var newIntfType = "";
            if (newIntfTypes.length > 0) {
                newIntfType = newIntfTypes[0];
            }
            var intfText = newIntfType;
            var intfTypes = [];
            var cnt = tmpIntfList.length;
            for (var i = 0; i < cnt; i++) {
                intfTypes.push({text: tmpIntfList[i], id: tmpIntfList[i]});
            }
            var newInterface
                = new SvcTemplateInterfaceModel(
                        {'static_route_enable': false,
                         'shared_ip': false,
                         'service_interface_type': intfText,
                         interfaceTypesData: intfTypes
                        });

            interfaces.add([newInterface]);
        },
        gohanSvcTempUpdateModel: function (mode, callbackObj) {
            var ajaxConfig = {}, returnFlag = true;
            var svcTempData = $.extend(true,{},this.model().attributes);
                var model = {};
                model['service_template'] = {};
                model['service_template']['description'] = svcTempData['description'];
                var type = "",url = "";
                if (mode == "add") {
                type = "POST";
                    url = "/api/tenants/config/policys";
                } else {
                    type = "PUT";
                    url = ctwc.SVC_TEMPLATES + '/' + svcTempData['id'];
                }
                ajaxConfig = {};
                ajaxConfig.type = type;
                ajaxConfig.data = JSON.stringify(model);
                ajaxConfig.url = url;
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
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            return returnFlag;
        },
        deleteGohanSvcTemp : function(selectedGridData, callbackObj){
            var ajaxConfig = {}, returnFlag = false;
            var model = {};
            model['service_template'] = {};
            ajaxConfig.type = "DELETE";
            ajaxConfig.data = JSON.stringify(model);
            ajaxConfig.url = ctwc.SVC_TEMPLATES + '/' + selectedGridData['id'];
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
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        },
        deleteSvcTemplateInterface: function(parentModel, data, kbInterfaces) {
            /* Remove any error message if any */
            var ifCollection = data.model().collection,
                delInterface = kbInterfaces.model();

            ifCollection.remove(delInterface);
            if (ifCollection.length > 2) {
                return;
            }
            /* Only 2 there now */
            var intfModel = parentModel.model();
            var attr = cowu.getAttributeFromPath('user_created_service_type');
            var errors = intfModel.get(cowc.KEY_MODEL_ERRORS);
            var attrErrorObj = {};
            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = null;
            errors.set(attrErrorObj);
        },
        getSvcTemplateInterfaceList : function(attr) {
            var ifCollection = attr.interfaces.toJSON(), ifList = [];
            for(var i = 0; i < ifCollection.length; i++) {
                var intf = ifCollection[i];
                var intfObj = {
                        'static_route_enable': intf.static_route_enable(),
                        'shared_ip': intf.shared_ip(),
                        'service_interface_type': intf.service_interface_type()
                    };
                ifList.push(intfObj);
            }
            return ifList;
        },
        addSvcTemplateCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'service_template':{}};
            var self = this;
            var newSvcTemplateCfgData = $.extend(true, {}, self.model().attributes);
                newSvcTemplateCfgData['interface_type'] = self.getSvcTemplateInterfaceList(newSvcTemplateCfgData);
                delete newSvcTemplateCfgData.elementConfigMap;
                delete newSvcTemplateCfgData.interfaces;
                delete newSvcTemplateCfgData.errors;
                delete newSvcTemplateCfgData.flavor;
                delete newSvcTemplateCfgData.image;
                delete newSvcTemplateCfgData.id;
                delete newSvcTemplateCfgData.locks;
                delete newSvcTemplateCfgData.tenant_id;
                delete newSvcTemplateCfgData.user_created_image_list;
                postData['service_template'] = newSvcTemplateCfgData;

                ajaxConfig.async = false;
                ajaxConfig.type  = 'POST';
                ajaxConfig.data  = JSON.stringify(postData);
                ajaxConfig.url   = ctwc.SVC_TEMPLATES;

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
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });

            return returnFlag;
        },
        disableStaticRoute: function(parentModel, model) {
            var mode = parentModel.service_mode();
            if (mode == 'transparent') {
                model.static_route_enable()(false);
                return true;
            }else{
                return false;
            }
        },
        disableSharedIp: function(parentModel, model){
            var svcMode = parentModel.service_mode();
            var intfType = model.service_interface_type()();
                switch (intfType) {
                case 'left':
                    model.shared_ip()(true);
                    return true;
                case 'right':
                    if (('transparent' == svcMode) ||
                        ('in-network' == svcMode)) {
                        model.shared_ip()(true);
                    } else {
                        model.shared_ip()(false);
                    }
                    return true;
                case 'management':
                    model.shared_ip()(false);
                    return true;
                default:
                    model.shared_ip()(false);
                    return false;
                }
            
        }
    });
    return svcTemplateCfgModel;
});
