/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/services/templates/ui/js/models/svcTemplateInterfaceModel'
], function (_, ContrailModel, SvcTemplateInterfaceModel) {
    var svcTemplateCfgModel = ContrailModel.extend({

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
                'service_scaling': false,
                'vrouter_instance_type': null,
                'ordered_interfaces': true,
                'interface_type': []
            },
            'user_created_service_virtualization_type': 'virtual-machine',
            'service_appliance_set': null,
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

            modelConfig['interfaces'] = ifCollectionModel;

            return modelConfig;
        },

        addSvcTemplateInterface: function() {
            var interfaces =
                this.model().attributes['interfaces'];
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

            var newInterface
                = new SvcTemplateInterfaceModel(
                        {'static_route_enable': false,
                         'shared_ip': false,
                         'service_interface_type': ifType
                        });

            interfaces.add([newInterface]);
            console.log(ifType);
        },

        deleteSvcTemplateInterface: function(data, kbInterfaces) {
            var ifCollection = data.model().collection,
                delInterface = kbInterfaces.model();

            ifCollection.remove(delInterface);
        },

        getSvcTemplateInterfaceList : function(attr) {
            var ifCollection = attr.interfaces.toJSON(), ifList = [];
            for(var i = 0; i < ifCollection.length; i++) {
                var intf = ifCollection[i];
                ifList.push({
                            'static_route_enable': intf.static_route_enable(),
                            'shared_ip': intf.shared_ip(),
                            'service_interface_type': intf.service_interface_type()
                            });
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
                    if ('virtual-machine' !=
                        data['user_created_service_virtualization_type']) {
                        return;
                    }
                    if (null == val) {
                        return 'Select an Image';
                    }
                },
                'service_template_properties.flavor': function(val, attr,
                                                               data) {
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
                }
            }
        },

        addSvcTemplateCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'service-template':{}};

            var self = this;
            if (self.model().isValid(true, "svcTemplateCfgConfigValidations")) {

                var newSvcTemplateCfgData = $.extend(true, {}, self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);

                if (newSvcTemplateCfgData['display_name'] == '') {
                    newSvcTemplateCfgData['display_name'] = newSvcTemplateCfgData['name'];
                }
                if (newSvcTemplateCfgData['fq_name'] == [] ||
                    newSvcTemplateCfgData['fq_name'] == null) {
                    newSvcTemplateCfgData['fq_name'] = [];
                    newSvcTemplateCfgData['fq_name'][0] = domain;
                    newSvcTemplateCfgData['fq_name'][1] = newSvcTemplateCfgData['name'];
                }

                newSvcTemplateCfgData['service_template_properties']['interface_type'] =
                    self.getSvcTemplateInterfaceList(newSvcTemplateCfgData);;

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
