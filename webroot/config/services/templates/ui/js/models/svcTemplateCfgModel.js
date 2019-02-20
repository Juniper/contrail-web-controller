/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/services/templates/ui/js/models/svcTemplateInterfaceModel'
], function (_, ContrailConfigModel, SvcTemplateInterfaceModel) {
    var svcTemplateCfgModel = ContrailConfigModel.extend({

        defaultConfig: {
            'name': null,
            'fq_name': null,
            'display_name': '',
            'parent_type': 'domain',
            'service_template_properties': {
                'instance_data': null,
                'availability_zone_enable': false,
                'service_virtualization_type': 'virtual-machine',
                'image_name': null,
                'service_mode': 'transparent',
                'service_type': 'firewall',
                'flavor': null,
                'version': 2,
                'service_scaling': false,
                'vrouter_instance_type': null,
                'ordered_interfaces': true,
                'interface_type': []
            },
            'user_created_service_virtualization_type': 'virtual-machine',
            'user_created_version': 2,
            'user_created_service_scaling': false,
            'user_created_service_mode': 'transparent',
            'user_created_service_type': 'firewall',
            'service_appliance_set': null,
            'user_created_image_list': [],
            'interfaces' : []
        },

        formatModelConfig: function (modelConfig) {

            var ifList =
               modelConfig['service_template_properties']['interface_type'] =
                           getValueByJsonPath(modelConfig,
              'service_template_properties;interface_type', []);

            var ifCount = ifList.length, ifModels = [];

            if(ifList.length > 0) {
                for(var i = 0; i < ifCount; i++) {
                    var ifModel = new SvcTemplateInterfaceModel(ifList[i]);
                    ifModels.push(ifModel)
                }
            }

            var ifCollectionModel = new Backbone.Collection(ifModels);
            var versionList = [{text: 'v2', id: 2}];
            modelConfig['versionList'] = versionList;
            modelConfig['service_template_properties']['version'] =
                getValueByJsonPath(modelConfig,
                                   'service_template_properties;version', 1);
            modelConfig['interfaces'] = ifCollectionModel;
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },


        addSvcTemplateInterface: function() {
            var interfaces =
                this.model().attributes['interfaces'];
            /*
            //create in following order Mgmt, Left, Right, Others
            var ifType = 'management', hasLeft = false,
                hasMgmt = false, hasRight = false;
            var ifCollection = interfaces.toJSON();

            for(var i = 0; i < ifCollection.length; i++) {
                var intf = ifCollection[i];
                if (intf.service_interface_type() == 'management') {
                   hasMgmt = true;
                }
                if (intf.service_interface_type() == 'left') {
                   hasLeft = true;
                }
                if (intf.service_interface_type() == 'right') {
                    hasRight = true;
                }
            }

            if (hasMgmt) {
                if (!hasLeft) {
                    ifType = 'left';
                } else if (!hasRight) {
                    ifType = 'right';
                } else {
                    ifType = 'other'
                }
            } else if (hasLeft) {
                if (!hasMgmt) {
                    ifType = 'management';
                } else if (!hasRight) {
                    ifType = 'right';
                } else {
                    ifType = 'other'
                }
            } else if (hasRight) {
                if (!hasMgmt) {
                    ifType = 'management';
                } else if (!hasLeft) {
                    ifType = 'left';
                } else {
                    ifType = 'other'
                }
            }
            */
            var svcType = this.model().get('user_created_service_type');
            var intfTypes = svcType == "analyzer" ? ['left', 'management'] :
                ['management', 'left', 'right', 'other0'];
            var intfColl = this.model().get('interfaces');
            var len = intfColl.length;
            var intfTypesList = [];
            var tmpIntfList = intfTypes;
            var otherIntfIdxList = [];
            if (('analyzer' == svcType) && (len >= 2)) {
                /* Analyzer, only two interface types can be added */
                return;
            }
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
            /*
            if (newIntfType.length > 0) {
                intfText = newIntfType.replace(newIntfType[0],
                                                  newIntfType[0].toUpperCase());
            }
            */
            var intfTypes = [];
            var cnt = tmpIntfList.length;
            for (var i = 0; i < cnt; i++) {
                if ('analyzer' == svcType) {
                    if (('management' != tmpIntfList[i]) &&
                        ('left' != tmpIntfList[i])) {
                        continue;
                    }
                }
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
        addSvcTemplateInterfaceByIndex: function(data,kbInterfaces) {
          var selectedRuleIndex = data.model().collection.indexOf(kbInterfaces.model());
            var interfaces =
                this.model().attributes['interfaces'];
            /*
            //create in following order Mgmt, Left, Right, Others
            var ifType = 'management', hasLeft = false,
                hasMgmt = false, hasRight = false;
            var ifCollection = interfaces.toJSON();

            for(var i = 0; i < ifCollection.length; i++) {
                var intf = ifCollection[i];
                if (intf.service_interface_type() == 'management') {
                   hasMgmt = true;
                }
                if (intf.service_interface_type() == 'left') {
                   hasLeft = true;
                }
                if (intf.service_interface_type() == 'right') {
                    hasRight = true;
                }
            }

            if (hasMgmt) {
                if (!hasLeft) {
                    ifType = 'left';
                } else if (!hasRight) {
                    ifType = 'right';
                } else {
                    ifType = 'other'
                }
            } else if (hasLeft) {
                if (!hasMgmt) {
                    ifType = 'management';
                } else if (!hasRight) {
                    ifType = 'right';
                } else {
                    ifType = 'other'
                }
            } else if (hasRight) {
                if (!hasMgmt) {
                    ifType = 'management';
                } else if (!hasLeft) {
                    ifType = 'left';
                } else {
                    ifType = 'other'
                }
            }
            */
            var svcType = this.model().get('user_created_service_type');
            var intfTypes = svcType == "analyzer" ? ['left', 'management'] :
                ['management', 'left', 'right', 'other0'];
            var intfColl = this.model().get('interfaces');
            var len = intfColl.length;
            var intfTypesList = [];
            var tmpIntfList = intfTypes;
            var otherIntfIdxList = [];
            if (('analyzer' == svcType) && (len >= 2)) {
                /* Analyzer, only two interface types can be added */
                return;
            }
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
            /*
            if (newIntfType.length > 0) {
                intfText = newIntfType.replace(newIntfType[0],
                                                  newIntfType[0].toUpperCase());
            }
            */
            var intfTypes = [];
            var cnt = tmpIntfList.length;
            for (var i = 0; i < cnt; i++) {
                if ('analyzer' == svcType) {
                    if (('management' != tmpIntfList[i]) &&
                        ('left' != tmpIntfList[i])) {
                        continue;
                    }
                }
                intfTypes.push({text: tmpIntfList[i], id: tmpIntfList[i]});
            }
            var newInterface
                = new SvcTemplateInterfaceModel(
                        {'static_route_enable': false,
                         'shared_ip': false,
                         'service_interface_type': intfText,
                         interfaceTypesData: intfTypes
                        });

            interfaces.add([newInterface],{at: selectedRuleIndex+1});
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
        showIntfTypeParams: function(parentModel) {
            var version = parentModel.user_created_version();
            var virtType =
                parentModel.user_created_service_virtualization_type();
            if ('physical-device' == virtType) {
                return true;
            }
            if ((null != version) && (1 != Number(version))) {
                return false;
            }
            return true;
        },
        disableStaticRoute: function(parentModel, model) {
            var virtType =
                parentModel.user_created_service_virtualization_type();
            if ('physical-device' == virtType) {
                model.static_route_enable()(false);
                return false;
            }
            var svcMode = parentModel.user_created_service_mode();
            if ('transparent' == svcMode) {
                model.static_route_enable()(false);
                return true;
            } else {
                return false;
            }
        },
        disableSharedIP: function(parentModel, model) {
            var svcScaling = parentModel.user_created_service_scaling();
            var svcMode = parentModel.user_created_service_mode();
            var virtType = parentModel.user_created_service_virtualization_type();
            if ('physical-device' == virtType) {
                model.shared_ip()(false);
                return false;
            }
            if (true == svcScaling) {
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
            } else {
                model.shared_ip()(false);
                return true;
            }
        },
        getSvcTemplateInterfaceList : function(attr, version) {
            var ifCollection = attr.interfaces.toJSON(), ifList = [];
            for(var i = 0; i < ifCollection.length; i++) {
                var intf = ifCollection[i];
                var intfObj = {};
                if (1 == version) {
                    intfObj = {
                        'static_route_enable': intf.static_route_enable(),
                        'shared_ip': intf.shared_ip(),
                        'service_interface_type': intf.service_interface_type()
                    };
                } else {
                    intfObj = {
                        'service_interface_type': intf.service_interface_type()
                    };
                }
                ifList.push(intfObj);
            }
            return ifList;
        },

        validations: {
            svcTemplateCfgConfigValidations: {
                'name': {
                    required: true,
                    msg: 'Enter Name'
                },
                'service_template_properties.image_name': function(val, attr,
                                                                   data) {
                    var version =
                        getValueByJsonPath(data,
                                           'user_created_version', 1);
                    var virtType =
                        getValueByJsonPath(data,
                                           'user_created_service_virtualization_type',
                                           'virtual-machine');
                    if ((2 == version) || ('virtual-machine' != virtType)) {
                        return;
                    }
                    if (null == val) {
                        return 'Select an Image';
                    }
                    var imageList =
                        getValueByJsonPath(data, 'user_created_image_list', []);
                    var cnt = imageList.length;
                    var imgCnt = 0;
                    for (var i = 0; i < cnt; i++) {
                        if (val == imageList[i]['id']) {
                            imgCnt++;
                        }
                        if (imgCnt >= 2) {
                            return 'Selected Image ' + val + ' has duplicate ' +
                                'reference';
                        }
                    }
                },
                'service_template_properties.flavor': function(val, attr,
                                                               data) {
                    var version =
                        getValueByJsonPath(data,
                                           'user_created_version', 1);
                    if (2 == version) {
                        return;
                    }
                    if ('virtual-machine' !=
                        data['user_created_service_virtualization_type']) {
                        return;
                    }
                    if (null == val) {
                        return 'Select a Flavor';
                    }
                },
                'service_appliance_set':
                    function(val, attr, data) {
                    if ('physical-machine' !=
                        data['user_created_service_virtualization_type']) {
                        return;
                    }
                    if (null == val) {
                        return "Select Service Appliance Set"
                    }
                },
                'user_created_service_type': function(val, attr, data) {
                    var virtType =
                        getValueByJsonPath(data,
                                           'user_created_service_virtualization_type',
                                           'virtual-machine');
                    if ('physical-device' == virtType) {
                        return;
                    }
                    if ((null == val) || (!val.trim().length)) {
                        return 'service type is required';
                    }
                    if ('firewall' == val) {
                        return;
                    }
                    /* Analyzer case */
                    if ('analyzer' == val) {
                        var intfTypesLen = data.interfaces.length;
                        if (intfTypesLen > 2) {
                            return 'Analyzer cannot have more than two ' +
                                'interfaces';
                        }
                    }
                },
                'interfaces': function(val, attr, data) {
                    var intfColl = data.interfaces.toJSON();
                    var intfTypesList = [];
                    var cnt = intfColl.length;
                    if (!cnt) {
                        return 'At least one interface is required';
                    }
                    var svcType =
                        getValueByJsonPath(data,
                                           'user_created_service_type',
                                           'firewall');
                    for (var i = 0; i < cnt; i++) {
                        var intfType = intfColl[i].service_interface_type();
                        intfTypesList.push(intfType);
                    }
                    if ('analyzer' != svcType) {
                        if ((-1 == intfTypesList.indexOf('left')) &&
                            (-1 == intfTypesList.indexOf('right'))) {
                            return 'Left or right interface is required';
                        }
                    } else {
                        if (-1 == intfTypesList.indexOf('left')) {
                            return 'Left interface is required for analyzer ' +
                                'service type';
                        }
                        if ((-1 == intfTypesList.indexOf('left')) &&
                            (-1 == intfTypesList.indexOf('management'))) {
                                return 'Only management and left allowed in ' +
                                    'analyzer service type';
                        }
                    }
                    var cnt = intfTypesList.length;
                    var tmpSvcTypeObjs = {};
                    for (var i = 0; i < cnt; i++) {
                        if (null != tmpSvcTypeObjs[intfTypesList[i]]) {
                            return 'Only one ' + intfTypesList[i] +
                                ' interface can be configured';
                        }
                        tmpSvcTypeObjs[intfTypesList[i]] = true;
                    }
                }
            }
        },

        addSvcTemplateCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'service-template':{}};

            var self = this;
            var validationList = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'svcTemplateCfgConfigValidations',
            },
            {
                key: 'interfaces',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'svcTemplateInterfaceConfigValidations'
            },
            //permissions
            ctwu.getPermissionsValidation()];
            if (this.isDeepValid(validationList)) {

                var newSvcTemplateCfgData = $.extend(true, {}, self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);

                if (newSvcTemplateCfgData['display_name'] == '') {
                    newSvcTemplateCfgData['display_name'] = newSvcTemplateCfgData['name'];
                }
                if (newSvcTemplateCfgData['fq_name'] == null ||
                    !newSvcTemplateCfgData['fq_name'].length) {
                    newSvcTemplateCfgData['fq_name'] = [];
                    newSvcTemplateCfgData['fq_name'][0] = domain;
                    newSvcTemplateCfgData['fq_name'][1] = newSvcTemplateCfgData['name'];
                }

                var version =
                    getValueByJsonPath(newSvcTemplateCfgData,
                                       'user_created_version', 1);
                version = Number(version);
                newSvcTemplateCfgData['service_template_properties']['interface_type'] =
                    self.getSvcTemplateInterfaceList(newSvcTemplateCfgData,
                                                     version);

                var svcMode =
                    getValueByJsonPath(newSvcTemplateCfgData,
                                       'user_created_service_mode',
                                       'transparent');
                newSvcTemplateCfgData['service_template_properties']
                                     ['service_mode'] = svcMode;
                var svcScaling =
                    getValueByJsonPath(newSvcTemplateCfgData,
                                       'user_created_service_scaling',
                                       false);
                newSvcTemplateCfgData['service_template_properties']
                                     ['service_scaling'] = svcScaling;
                var svcType =
                    getValueByJsonPath(newSvcTemplateCfgData,
                                       'user_created_service_type',
                                       'firewall');
                newSvcTemplateCfgData['service_template_properties']
                                     ['service_type'] = svcType;
                newSvcTemplateCfgData['service_template_properties']['version'] =
                    version;
                var svcVirtType =
                    getValueByJsonPath(newSvcTemplateCfgData,
                                       'user_created_service_virtualization_type',
                                       'virtual-machine');
                newSvcTemplateCfgData['service_template_properties']
                                     ['service_virtualization_type'] =
                    svcVirtType;
                if (("physical-device" == svcVirtType) &&
                    (null != newSvcTemplateCfgData['service_appliance_set'])) {
                    newSvcTemplateCfgData["service_appliance_set_refs"] = [];
                    newSvcTemplateCfgData["service_appliance_set_refs"][0] = {};
                    newSvcTemplateCfgData["service_appliance_set_refs"][0]["to"] = [];
                    newSvcTemplateCfgData["service_appliance_set_refs"][0]["to"] =
                        newSvcTemplateCfgData['service_appliance_set'].split(":");
                    delete newSvcTemplateCfgData.service_template_properties.availability_zone_enable;
                    delete newSvcTemplateCfgData.service_template_properties.flavor;
                    delete newSvcTemplateCfgData.service_template_properties.image_name;
                    newSvcTemplateCfgData.service_template_properties.service_mode='transparent';
                    newSvcTemplateCfgData.service_template_properties.service_type='firewall';
                }
                if (2 == version) {
                    newSvcTemplateCfgData['service_template_properties']['flavor']
                        = null;
                    newSvcTemplateCfgData['service_template_properties']['image_name']
                        = null;
                    newSvcTemplateCfgData['service_template_properties']['availability_zone_enable']
                        = null;
                    newSvcTemplateCfgData['service_template_properties']['service_scaling']
                        = null;
                }

                //permissions
                this.updateRBACPermsAttrs(newSvcTemplateCfgData);

                ctwu.deleteCGridData(newSvcTemplateCfgData);
                delete newSvcTemplateCfgData.id_perms;
                delete newSvcTemplateCfgData.interfaces;
                delete newSvcTemplateCfgData.service_instance_back_refs;
                delete newSvcTemplateCfgData.href;
                delete newSvcTemplateCfgData.parent_href;
                delete newSvcTemplateCfgData.parent_uuid;
                delete
                    newSvcTemplateCfgData.user_created_service_virtualization_type;
                delete
                    newSvcTemplateCfgData.service_appliance_set;
                delete newSvcTemplateCfgData.user_created_version;
                delete newSvcTemplateCfgData.user_created_service_mode;
                delete newSvcTemplateCfgData.user_created_service_scaling;
                delete newSvcTemplateCfgData.user_created_service_type;
                delete newSvcTemplateCfgData.user_created_image_list;

                postData['service-template'] = newSvcTemplateCfgData;

                ajaxConfig.async = false;
                ajaxConfig.type  = 'POST';
                ajaxConfig.data  = JSON.stringify(postData);
                ajaxConfig.url   = '/api/tenants/config/service-templates';

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
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(
                        this.getFormErrorText(ctwl.CFG_SVC_TEMPLATE_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        multiDeleteSvcTemplateCfg: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'service-template',
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
    return svcTemplateCfgModel;
});
