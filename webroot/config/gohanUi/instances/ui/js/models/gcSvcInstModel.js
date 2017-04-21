/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'knockout',
    'config/gohanUi/instances/ui/js/models/gcInterfacesModel',
    'config/gohanUi/instances/ui/js/views/gcSvcInst.utils'
], function (_, ContrailModel, Knockout, InterfacesModel, svcInstUtils) {
    var self;
    var svcInstModel = ContrailModel.extend({
        defaultConfig: {
            description: '',
            id: '',
            name: '',
            service_instance_properties: {
              interface_list: [],
              scale_out: {
                  max_instances: 0
                }
            },
            scale_out_max_instances: 1,
            service_template: {
              availability_zone_enable: false,
              description: '',
              flavor: {
                description: '',
                disk: 0,
                ephemeral: 0,
                id: '',
                name: '',
                ram: 0,
                swap: 0,
                tenant_id: '',
                vcpus: 0
              },
              flavor_id: '',
              id: '',
              image: {
                container_format: '',
                description: '',
                disk_format: '',
                id: '',
                is_public: false,
                min_disk: 0,
                min_ram: 0,
                name: '',
                protected: false,
                tenant_id: '',
                url: ''
              },
              image_id: '',
              interface_type: [],
              name: '',
              service_mode: '',
              tenant_id: ''
            },
            //interfaces : [],
            service_template_id: null,
            tenant_id: ''
      },
      formatModelConfig: function(modelConfig, configDetails) {
          var svcInstDataObj = modelConfig.svcInstanceDataObj;
          if(svcInstDataObj === undefined){
              return modelConfig;
          }
          if (!svcInstDataObj ||
              !svcInstDataObj.svcTmplsFormatted.length) {
              showInfoWindow("No Service Template found.",
                             "Add Service Template");
              return null;
          }

          self = this;
          self.configDetails = configDetails;
          var intfTypes = [];
          if ((null != modelConfig) &&
              (null != modelConfig['svcTmplDetails']) &&
              (null != modelConfig['svcTmplDetails'][0])) {
              var svcTmplDetails = modelConfig['svcTmplDetails'][0];
              var svcTmpl = {'service-template': svcTmplDetails};
              svcTmpl = svcInstUtils.svcTemplateFormatter(svcTmpl);
              modelConfig['service_template_id'] = svcTmpl;
              svcTmpl = {'service-template': svcTmplDetails};
              intfTypes = svcInstUtils.getSvcTmplIntfTypes(svcTmpl);
          } else {
              modelConfig['service_template_id'] =
                  svcInstDataObj.svcTmplsFormatted[0]['id'];
              var tmpl = modelConfig['service_template_id'];
              var intfTypeStrStart = tmpl.indexOf('(');
              var intfTypeStrEnd = tmpl.indexOf(')');
              intfTypes =
                  tmpl.substr(intfTypeStrStart + 1,
                              intfTypeStrEnd - intfTypeStrStart - 1);
              intfTypes = intfTypes.split(', ');
              var svcTmplObjsByFqn = svcInstDataObj.svcInstTmplts;
              if (null != tmpl) {
                  var tmplFqn = getCookie('domain') + ':' +
                  tmpl.split(' - [')[0];
                  svcTmpl = {'service-template': svcTmplObjsByFqn[tmplFqn]};
              } else {
                  svcTmpl = null;
              }
          }
          var maxInst =
              getValueByJsonPath(modelConfig,
                                 'service_instance_properties;scale_out;max_instances',
                                 null);
          if (null != maxInst) {
              modelConfig['no_of_instances'] = maxInst;
          }

          var intfList =
              getValueByJsonPath(modelConfig,
                                 'service_instance_properties;interface_list',
                                 []);
          var svcTmpls = svcInstDataObj.svcInstTmplts;
          var tmpl = modelConfig['service_template_id'];
          var svcTmplFqn = getCookie('domain') + ":" +
              tmpl.split(' - [')[0];

          var tmplVer =
              getValueByJsonPath(svcTmpls[svcTmplFqn],
                                 'service_template_properties;version',
                                 1);


          if (null == configDetails) {
              return modelConfig;
          }
          var intfList =
              getValueByJsonPath(modelConfig,
                                 'service_instance_properties;interface_list',
                                 []);
          var interfaeTypes = [];
          var intfsCnt = intfTypes.length;
          if ((null != svcTmpls) && (null != svcTmpls[svcTmplFqn])) {
              interfaeTypes =
                  getValueByJsonPath(svcTmpls[svcTmplFqn],
                                     'service_template_properties;interface_type',
                                     []);
          }

          if (!intfList.length) {
              var interfaeTypesCnt = interfaeTypes.length;
              for (var i = 0; i < intfsCnt; i++) {
                  intfList.push({virtual_network: null});
              }
          }
          var len = intfList.length;
          var configuredVNList = [];
          var staticRtsIntfList =
              svcInstUtils.getStaticRtsInterfaceTypesBySvcTmpl(svcTmpls[svcTmplFqn],
                                                               false);
          for (i = 0; i < len; i++) {
              if (null == intfList[i]['virtual_network']) {
                  continue;
              }
              if ("" == intfList[i]['virtual_network']) {
                  intfList[i]['virtual_network'] = 'autoConfigured';
                  configuredVNList.push({'id': "autoConfigured",
                                         'text': "Auto Configured"});
              } else {
                  var formattedVN =
                      svcInstUtils.getVNNameFormatter(intfList[i]['virtual_network'].split(':'));
                  configuredVNList.push({'id': intfList[i]['virtual_network'],
                                         text: formattedVN});
              }
          }
          var interfacesModels = [];
          var interfacesCollectionModel;
          var cnt = intfTypes.length;
          var staticRtsIntfList =
              svcInstUtils.getStaticRtsInterfaceTypesByStr(modelConfig['service_template_id'],
              false, self.svcInstanceDataObj.svcInstTmplts);
          for (var i = 0; i < cnt; i++) {
              var intfType = intfTypes[i];
              var vnList = this.getVNListBySvcIntfType(svcTmpls[svcTmplFqn],
                                                       interfaeTypes[i],
                                                       tmplVer, self.configDetails);
              if ((null == vnList) || (!vnList.length)) {
                  vnList = configuredVNList;
              }
              var interfacesModel =
                  new InterfacesModel({interfaceType: intfType,
                                      virtualNetwork:
                                      intfList[i]['virtual_network'],
                                      interfaceIndex: i,
                                      interfaceData: intfList[i],
                                      allVNListData: vnList});
              interfacesModels.push(interfacesModel);
              interfacesModel.__kb.view_model.model().on('change:virtualNetwork',
                                                         function(model,
                                                                  newValue) {
                  self.editView.setVMIsByVN(self.model(),
                                   newValue,
                                   model.get('interfaceType'));
              });
              this.addStaticRoutesCollection(modelConfig, intfList[i],
                                             intfType, staticRtsIntfList);
          }
          interfacesCollectionModel = new Backbone.Collection([]);
          modelConfig['interfaces'] = interfacesCollectionModel;

          var portTupleList = modelConfig['port_tuples'];
          var portTupleModels = [];
          var portTuplesCnt = 0;
          if (null != portTupleList) {
              portTuplesCnt = portTupleList.length;
          }
          var intfList =
              getValueByJsonPath(modelConfig,
                                 'service_instance_properties;interface_list',
                                 []);
          var intfListLen = intfList.length;
          var addrPairModels = [];
          var len = intfTypes.length;
          var typesDropDownList = [];
          for (var i = 0; i < len; i++) {
              typesDropDownList.push({text: intfTypes[i], id: intfTypes[i]});
          }
          for (var i = 0; i < intfListLen; i++) {
              var allowedAddrPair =
                  getValueByJsonPath(intfList[i],
                                     'allowed_address_pairs;allowed_address_pair',
                                     []);
              var addrPairLen = allowedAddrPair.length;
              if (!addrPairLen) {
                  continue;
              }
              for (var j = 0; j < addrPairLen; j++) {
                  var aapObj = allowedAddrPair[j];
                  aapObj['interface_type'] = intfTypes[i];
                  aapObj['interfaceTypesData'] = typesDropDownList;
                  var allowAddressPairModel = new
                      AllowedAddressPairModel(aapObj);
                  addrPairModels.push(allowAddressPairModel);
              }
          }
          return modelConfig;
      },
      setVMIsByVN: function(modelConfig, vnName, intfType, vnDetails) {
          var pTuples = modelConfig.get('portTuples');
          var vmiList = [];
          if (null == pTuples) {
              return;
          }
          var portTuplesCnt = pTuples.length;
          for (var i = 0; i < portTuplesCnt; i++) {
              var portTupleIntfs =
                  pTuples.models[i].get('portTupleInterfaces')();
              var portTupleIntfsCnt = portTupleIntfs.length;
              for (var j = 0; j < portTupleIntfsCnt; j++) {
                  if (intfType == portTupleIntfs[j]['interfaceType']()()) {
                      if (vnDetails.vnVmiMaps[vnName]) {
                          vmiList = vnDetails.vnVmiMaps[vnName];
                      }
                      portTupleIntfs[j]['vmiListData']()(vmiList);
                      break;
                  }
              }
          }
          return;
      },
      addStaticRoutesCollection: function(modelConfig, interfaceData,
              intfType, staticRtsIntfList) {
          var staticRTModel;
          var staticRTModels = modelConfig.staticRoutes;
          var staticRTCollectionModel;
          if (null == staticRTModels) {
              staticRTCollectionModel = new Backbone.Collection([]);
              modelConfig['staticRoutes'] = staticRTCollectionModel;
              staticRTModels = modelConfig.staticRoutes;
          }
          var intfData =
              getValueByJsonPath(interfaceData, 'static_routes;route', []);
          var cnt = intfData.length;
          for (var i = 0; i < cnt; i++) {
              var prefix = ((null != intfData[i]) &&
                            (null != intfData[i]['prefix'])) ?
                  intfData[i]['prefix'] : '';
              var commAttr =
                  getValueByJsonPath(intfData[i],
                                     'community_attributes;community_attribute',
                                     []);
              staticRTModel =
                  new StaticRTModel({prefix: prefix,
                                    next_hop: null,
                                    interface_type: intfType,
                                    interfaceTypesData: staticRtsIntfList,
                                    community_attributes: commAttr.join(',')});
              staticRTModels.push(staticRTModel);
          }
      },
      formatModelConfigColl: function(svcId, intfTypes, isDisabled, svcTmpls) {
          if (true == isDisabled) {
              return;
          }
          var cnt = intfTypes.length;
          var svcTmpl = svcId;
          var svcTmplFqn = "default-domain:" + svcTmpl.split(' - [')[0];
          this.deleteModelCollectionData(this.model(), 'interfaces');
          var interfaces = this.model().attributes['interfaces'];
          var interfaeTypes = [];
          var svcTmplVer = 1;
          if ((null != svcTmpls) && (null != svcTmpls[svcTmplFqn])) {
              interfaeTypes = getValueByJsonPath(svcTmpls[svcTmplFqn], 'interface_type', []);
          }
          var intfList = getValueByJsonPath(this.model().attributes, 'service_instance_properties;interface_list', []);
          for (var i = 0; i < cnt; i++) {
              var intfType = intfTypes[i];
              var vn = null;
              var vnList = this.getVNListBySvcIntfType(svcTmpls[svcTmplFqn],
                                                       interfaeTypes[i],
                                                       1, self.configDetails);
              var newInterface =
                  new InterfacesModel({'interfaceType': intfType,
                                      'virtualNetwork': vn,
                                      'interfaceIndex': i,
                                      interfaceData: intfList[i],
                                      allVNListData: vnList});
              newInterface.__kb.view_model.model().on('change:virtualNetwork',
                                                         function(model,
                                                                  newValue) {
              });
              interfaces.add([newInterface]);
          }
          return;
      },
      deleteModelCollectionData: function(model, type) {
          model.attributes.interfaces.reset();
      },
      getVNListBySvcIntfType: function(svcTmpl, intf, version, configDetails) {
          var vnList = $.extend([], true, configDetails.allVNList);
          if (null == intf) {
              return vnList;
          }
          if (2 == version) {
              if (vnList.length > 0) {
                  if ('autoConfigured' == vnList[0]['id']) {
                      vnList.splice(0, 1);
                  }
              }
              return vnList;
          }
          var showAuto = true;
          var svcMode =
              getValueByJsonPath(svcTmpl,
                                 'service_template_properties;service_mode',
                                 null);
          if ('management' != intf['service_interface_type']) {
              if (('in-network' == svcMode) ||
                  ('in-network-nat' == svcMode)) {
                  showAuto = false;
              }
          }
          if (-1 != intf['service_interface_type'].indexOf('other')) {
              showAuto = false;
          }
          if (true == intf['static_route_enable']) {
              showAuto = false;
          }
          if ((false == showAuto) && (vnList.length > 0)) {
              if ('autoConfigured' == vnList[0]['id']) {
                  vnList.splice(0, 1);
              }
          }
          return vnList;
      },
      addSvcInstanceNetwork: function() {
          var interfaces = this.model().attributes['interfaces'];
          var intfTypes = this.model().attributes['networkModel'][0].name;
          var networkId = this.model().attributes['networkModel'][0].id;
          var intfColl = this.model().get('interfaces');
          var len = intfColl.length;
          var intfTypesList = [];
          var tmpIntfList = intfTypes;
          var otherIntfIdxList = [];
          for (var i = 0; i < len; i++) {
              var modIntf = intfColl.at(i).get('virtual_network')();
              intfTypesList.push(modIntf);
          }
          var newIntfTypes = _.difference(intfTypes, intfTypesList);
          var newIntfType = "";
          if (newIntfTypes.length > 0) {
              newIntfType = newIntfTypes[0];
              var intfText = newIntfType;
              var intfTypes = [];
              var cnt = tmpIntfList.length;
              for (var i = 0; i < cnt; i++) {
                  intfTypes.push({text: networkId[i].text, id: networkId[i].id});
              }
              var newInterface
                  = new InterfacesModel(
                          {'virtual_network': intfText,
                           virtualNetworkData: intfTypes
                          });

              interfaces.add([newInterface]);
          }
      },
      deleteSvcInstanceNetwork: function(parentModel, data, kbInterfaces) {
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
      gohanServiceInstanceUpdate: function (callbackObj) {
          var ajaxConfig = {}, returnFlag = true;
          var svcInsData = $.extend(true,{},this.model().attributes);
              var model = {};
              model['service_instances'] = {};
              model['service_instances']['description'] = svcInsData['description'];
              var type = "PUT";
              var url = ctwc.SVC_INSTANCES + '/' + svcInsData['id'];
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
      deleteGohanSvcInstance : function(selectedGridData, callbackObj){
          var ajaxConfig = {}, returnFlag = false;
          var model = {};
          model['service_instances'] = {};
          ajaxConfig.type = "DELETE";
          ajaxConfig.data = JSON.stringify(model);
          ajaxConfig.url = ctwc.SVC_INSTANCES + '/' + selectedGridData['id'];
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
      getInterfaceList : function(attr) {
          var ifCollection = attr.interfaces.toJSON(), ifList = [];
          for(var i = 0; i < ifCollection.length; i++) {
              var vn = ifCollection[i].virtualNetwork();
              ifList.push({virtual_network: vn});
          }
          var prop = {
                  interface_list : ifList,
                  scale_out : {max_instances : parseInt(attr.scale_out_max_instances)}
          }
          return prop;
      },
      addSvcInstanceCfg: function (callbackObj) {
          var ajaxConfig = {}, returnFlag = false;
          var postData = {'service_instances':{}};
          var self = this;
          var newSvcTemplateCfgData = $.extend(true, {}, self.model().attributes);
              newSvcTemplateCfgData['service_instance_properties'] = self.getInterfaceList(newSvcTemplateCfgData);
              delete newSvcTemplateCfgData.elementConfigMap;
              delete newSvcTemplateCfgData.interfaces;
              delete newSvcTemplateCfgData.errors;
              delete newSvcTemplateCfgData.locks;
              delete newSvcTemplateCfgData.networkModel;
              delete newSvcTemplateCfgData.id;
              delete newSvcTemplateCfgData.service_template;
              delete newSvcTemplateCfgData.tenant_id;
              delete newSvcTemplateCfgData.staticRoutes;
              delete newSvcTemplateCfgData.svcInstanceDataObj;
              delete newSvcTemplateCfgData.no_of_instances;
              delete newSvcTemplateCfgData.scale_out_max_instances;
              postData['service_instances'] = newSvcTemplateCfgData;

              ajaxConfig.async = false;
              ajaxConfig.type  = 'POST';
              ajaxConfig.data  = JSON.stringify(postData);
              ajaxConfig.url   = ctwc.SVC_INSTANCES;

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
      }
    });
    return svcInstModel;
});

