/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/infra/vrouters/ui/js/models/vRoutersubnetModel',
    'config/infra/vrouters/ui/js/views/vRouterCfgFormatters'
], function (_, ContrailConfigModel,vRouterSubnetModel,VRouterCfgFormatters) {
    var formatVRouterCfg = new VRouterCfgFormatters();

    var vRouterCfgModel = ContrailConfigModel.extend({
        constructor: function () {
            ContrailConfigModel.apply(this,arguments);
            const vRouterType = this.virtual_router_type();

            if (vRouterType == null || vRouterType == '' || !vRouterType.length) {
                this.virtual_router_type('hypervisor');
            }
        },

        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'network_ipam_refs': [], // subnet collection
            'parent_type': 'global-system-config',
            'virtual_router_type': 'hypervisor',
            'virtual_router_ip_address': null,
            'vrouter_specific_pool':true
        },

        formatModelConfig: function(modelConfig) {
            //permissions
            this.readSubnetList(modelConfig);
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        readSubnetList: function (modelConfig) {
            var self = this;
            var vRoutersubnetModels = [], vRoutersubnetList = [];
            vRoutersubnetList = formatVRouterCfg.vRoutersubnetModelFormatter(null,
                                             null, null, -1, modelConfig);
            if(vRoutersubnetList.length > 0) {
                for(var i = 0; i < vRoutersubnetList.length; i++) {
                    var vroutersubnetModel = new vRouterSubnetModel(vRoutersubnetList[i]);
                    vRoutersubnetModels.push(vroutersubnetModel);
                }
            }
            //user defined subnet
            modelConfig['network_ipam_refs'] =
                                    new Backbone.Collection(vRoutersubnetModels);
        },
        getAllocPools: function(subnetObj) {
            var allocPools = [], retAllocPool = [];
            if ('allocation_pools' in subnetObj &&
                        subnetObj.allocation_pools.length) {
                allocPools = subnetObj.allocation_pools.split('\n');
            }
            allocPools.every(function(pool) {
                var poolObj = pool.split('-');
                if (poolObj.length == 2) {
                    retAllocPool.push({'start': poolObj[0].trim(),
                                       'end':  poolObj[1].trim(),
                                       'vrouter_specific_pool':true});
                }
                return true;
            });
            return retAllocPool;
        },
        setSubnetChangeEvent: function (subnetModel) {
            var self = this;
            subnetModel.__kb.view_model.model().on('change:vr_user_created_cidr',
            function(model, text){
                 self.setSubnetAllocationPool(self, model, text);
            });
        },
        addSubnet: function() {
            var self = this;
            var subnet = this.model().attributes['network_ipam_refs'],
                vRoutersubnetModel = new vRouterSubnetModel();
            self.setSubnetChangeEvent(vRoutersubnetModel);
            subnet.add([vRoutersubnetModel]);
        },
        addSubnetByIndex: function(data, kbSubnet) {
            var self = this;
            var selectedRuleIndex = data.model().collection.indexOf(kbSubnet.model());
            var subnet = this.model().attributes['network_ipam_refs'],
            vRoutersubnetModel = new vRouterSubnetModel();
            self.setSubnetChangeEvent(vRoutersubnetModel);
            subnet.add([vRoutersubnetModel],{at: selectedRuleIndex+1});
          },
          deleteSubnet: function(data, kbSubnet) {
              var subnetCollection = data.model().collection,
                  subnet = kbSubnet.model();
              subnetCollection.remove(subnet);
          },
          setSubnetAllocationPool: function (self, model, text) {
              var subnets = self.model().attributes['network_ipam_refs'].toJSON();
              var cid = model.cid;
              subnets.every(function(subnet) {
                  if (subnet.model().cid != cid) {
                      return true;
                  }
                  var ipPrefixLen = text.split('/')[1];
                  var ipPrefixLenSub;
                  var pow = null;
                  if(ipPrefixLen <= 32){
                      ipPrefixLenSub = 32 - ipPrefixLen;
                      pow = Math.pow(2, ipPrefixLenSub)-1;
                      var subtext = text.substring(0, text.indexOf('/'));
                      var lastChar = subtext.substr(subtext.length - 1);
                      var lastCharSlash = text.split('.').pop();
                      var lastChar = lastCharSlash.slice(0, lastCharSlash.indexOf("/"));
                      pow=pow+Number(lastChar);
                      subtext = subtext + "-"+ text.replace(lastCharSlash, pow);
                      subnet.allocation_pools(subtext);
                      subnet.alloc_pool_flag(true);
                  }
                  else{
                      subnet.allocation_pools('');
                  }
                  return true;
              });
          },
        getSubnetList: function(attr) {
            var subnetCollection = attr.network_ipam_refs.toJSON(),
                subnetArray = [], allocationPool = [], subnet = [], ipamAssocArr = {}, dhcpOption
            for(var i = 0; i < subnetCollection.length; i++) {
                var subnet = $.extend(true, {}, subnetCollection[i].model().attributes);

                var cidr = subnet.vr_user_created_cidr;
                if (subnet.subnet[0].ip_prefix == null && cidr != null &&
                        cidr.split("/").length == 2) {
                    subnet.subnet[0].ip_prefix = cidr.split('/')[0];
                    subnet.subnet[0].ip_prefix_len = Number(cidr.split('/')[1]);
                }
                var allocPool  = this.getAllocPools(subnet);
                subnet.allocation_pools = allocPool;

                var ipam_fqn = subnet['user_created_ipam_fqn'];
                if (allocPool.length == 0) {
                    delete subnet['allocation_pools'];
                }
                delete subnet['errors'];
                delete subnet['locks'];
                delete subnet['disable'];
                delete subnet['user_created_ipam_fqn'];
                delete subnet['vr_user_created_cidr'];
               if (!(ipam_fqn in ipamAssocArr)) {
                 ipamAssocArr[ipam_fqn] = {};
                 ipamAssocArr[ipam_fqn]['allocation_pools'] = [];
                 if(subnet.subnet[0].ip_prefix != null && subnet.subnet[0].ip_prefix != null){
                     ipamAssocArr[ipam_fqn]['subnet'] = [];
                 }
               }
              if(ipamAssocArr[ipam_fqn]['subnet'] &&
                      (subnet.subnet[0].ip_prefix != null && subnet.subnet[0].ip_prefix != null)){
                  ipamAssocArr[ipam_fqn]['subnet'].push(subnet.subnet[0]);
              }
              else if(!(ipamAssocArr[ipam_fqn]['subnet']) &&
                      (subnet.subnet[0].ip_prefix != null && subnet.subnet[0].ip_prefix != null)){
                  ipamAssocArr[ipam_fqn]['subnet'] = [];
                  ipamAssocArr[ipam_fqn]['subnet'].push(subnet.subnet[0]);
              }
              if(ipamAssocArr[ipam_fqn]['allocation_pools']){
                  ipamAssocArr[ipam_fqn]['allocation_pools'].push(subnet.allocation_pools[0]);
              }
            }
            for (var ipam in ipamAssocArr) {
                var ipamSubtext = ipam.substring(0, ipam.indexOf(':'));
                var uuid = ipam.split(':').pop();
                subnetArray.push({'to': ipamSubtext.split(cowc.DROPDOWN_VALUE_SEPARATOR),
                                  'attr' :ipamAssocArr[ipam],
                                  'uuid':uuid
                                  });
        }
            attr['network_ipam_refs'] = subnetArray;
        },
        validations: {
            vRouterCfgConfigValidations: {
                'name': {
                    required: true,
                    msg: 'Enter Virtual Router Name'
                },
                'virtual_router_ip_address': {
                    required: true,
                    pattern: cowc.PATTERN_IP_ADDRESS,
                    msg: 'Enter valid IP Address'
                }
            }
        },
        addEditvRouterCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'virtual-router':{}};

            var self  = this;
            var validation = [
                {
                    key: null,
                    type: cowc.OBJECT_TYPE_MODEL,
                    getValidation: 'vRouterCfgConfigValidations'
                },
                {
                    key: 'network_ipam_refs',
                    type: cowc.OBJECT_TYPE_COLLECTION,
                    getValidation: 'subnetModelConfigValidations'
                },
            //permissions
            ctwu.getPermissionsValidation()];
            if (self.isDeepValid(validation)) {

                var newvRouterCfgData = $.extend({},this.model().attributes);
                if (newvRouterCfgData['display_name'] == '') {
                    newvRouterCfgData['display_name'] = newvRouterCfgData['name'];
                }
                if (newvRouterCfgData['fq_name'] == null ||
                    !newvRouterCfgData['fq_name'].length) {
                    newvRouterCfgData['fq_name'] = [];
                    newvRouterCfgData['fq_name'][0] = 'default-global-system-config';
                    newvRouterCfgData['fq_name'][1] = newvRouterCfgData['name'];
                }

                if (newvRouterCfgData['virtual_router_type'] === 'hypervisor') {
                    newvRouterCfgData['virtual_router_type'] = null;
                }
                this.getSubnetList(newvRouterCfgData);
                //permissions
                self.updateRBACPermsAttrs(newvRouterCfgData);
                ctwu.deleteCGridData(newvRouterCfgData);
                delete newvRouterCfgData.id_perms;
                delete newvRouterCfgData.physical_router_back_refs;
                delete newvRouterCfgData.href;
                delete newvRouterCfgData.parent_href;
                delete newvRouterCfgData.parent_uuid;
                postData['virtual-router'] = newvRouterCfgData;
                var ajaxType     = contrail.checkIfExist(ajaxMethod) ? ajaxMethod : "POST";
                ajaxConfig.async = false;
                ajaxConfig.type  = ajaxType;
                ajaxConfig.data  = JSON.stringify(postData);
                ajaxConfig.url   = ajaxType == 'PUT' ?
                                   '/api/tenants/config/virtual-router/' +
                                   newvRouterCfgData['uuid'] :
                                   '/api/tenants/config/virtual-routers';
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
                    callbackObj.error(this.getFormErrorText(ctwl.CFG_VROUTER_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        multiDeletevRouterCfg: function (checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'virtual-router',
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
        }

    });
    return vRouterCfgModel;
});
