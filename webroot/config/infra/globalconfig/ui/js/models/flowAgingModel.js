/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/globalconfig/ui/js/models/flowAgingTimeoutModel'
], function (_, ContrailModel, FlowAgingTimeoutModel) {
    var flowAgingModel = ContrailModel.extend({
        defaultConfig: {
            "flow_aging_timeout_list": {
                "flow_aging_timeout": []
            }
        },
        formatModelConfig: function(modelConfig) {
            /* Flow Aging Timeout */
            var flowAgeModel;
            var flowAgeModels = [];
            var flowAgeCollectionModel;
            var flowAgeTuples =
                getValueByJsonPath(modelConfig,
                                   'flow_aging_timeout_list;flow_aging_timeout', []);
            var flowAgeTuplesCnt = flowAgeTuples.length;
            for (var i = 0; i < flowAgeTuplesCnt; i++) {
                flowAgeModel =
                    new FlowAgingTimeoutModel({protocol:
                                                flowAgeTuples[i]['protocol'],
                                              port: flowAgeTuples[i]['port'],
                                              timeout_in_seconds:
                                                flowAgeTuples[i]['timeout_in_seconds']});
                this.flowAgingTimeoutAttrs(flowAgeModel, this);
                flowAgeModels.push(flowAgeModel);
            }
            flowAgeCollectionModel = new Backbone.Collection(flowAgeModels);
            modelConfig['flowAgingTimeout'] = flowAgeCollectionModel;
            if (null != modelConfig['flow_aging_timeout']) {
                delete modelConfig['flow_aging_timeout'];
            }
            return modelConfig;
        },
        deleteFlowAgingTuple: function(data, flowAgeTuple) {
            var flowAgeCollection = data.model().collection;
            var flowAgeEntry = flowAgeTuple.model();
            flowAgeCollection.remove(flowAgeEntry);
        },
        addFlowAgingTupleByIndex: function(data, flowAgeTuple) {
          var selectedRuleIndex = data.model().collection.indexOf(flowAgeTuple.model());
          var flowAgeCollection = this.model().get('flowAgingTimeout');
          var newFlowAgeEntry =
              new FlowAgingTimeoutModel({protocol: "", port: "",
                                        timeout_in_seconds: ""});
          this.flowAgingTimeoutAttrs(newFlowAgeEntry, this);
          flowAgeCollection.add([newFlowAgeEntry],{at: selectedRuleIndex+1});
        },
        addFlowAgingTuple: function() {
            var flowAgeCollection = this.model().get('flowAgingTimeout');
            var newFlowAgeEntry =
                new FlowAgingTimeoutModel({protocol: "", port: "",
                                          timeout_in_seconds: ""});
            this.flowAgingTimeoutAttrs(newFlowAgeEntry, this);
            flowAgeCollection.add([newFlowAgeEntry]);
        },
        flowAgingTimeoutAttrs: function(flowAgingTimeoutModel, self) {
            flowAgingTimeoutModel.disablePort = ko.computed(function(){
               var protocol = self.getProtocolText(this.protocol());
               var disablePort = false;
               if(protocol === 'icmp' || protocol === '1') {
                   this.port('0');
                   disablePort = true;
               } else if(this.disablePort instanceof Function &&
                   this.disablePort()) {
                   this.port('');
                   disablePort = false
               }
               return disablePort;
            }, flowAgingTimeoutModel);
        },
        getProtocolText: function(protocol) {
            var protocolText = '';
            if(protocol.indexOf('(') !== -1) {
                protocolText =
                    protocol.split(' ')[1].replace(/[()]/g, '').toLowerCase();
            } else {
                protocolText = protocol;
           }
           return protocolText;
        },
        getFlowAgingTupleList: function(attr) {
            var flowTupleArr = [];
            var flowTupleCollection = attr.flowAgingTimeout.toJSON();
            var flowTupleCnt = flowTupleCollection.length;
            for (var i = 0; i < flowTupleCnt; i++) {
                var timeout = flowTupleCollection[i].timeout_in_seconds();
                if (true == _.isString(timeout)) {
                    if ("" == timeout.trim()) {
                        timeout = 180; /* 3 Minutes */
                    }
                    timeout = Number(timeout);
                }
                flowTupleArr.push({protocol: this.getProtocolText(flowTupleCollection[i].protocol()),
                                   port: Number(flowTupleCollection[i].port()),
                                   timeout_in_seconds: timeout});
            }
            return flowTupleArr;
        },
        configureFlowOptions: function (callbackObj) {
            var self = this, ajaxConfig = {}, returnFlag = false,
                putData = {}, flowOptionsData = {}, newFlowOptionsConfig,
                validations = [
                    {
                        key: null,
                        type: cowc.OBJECT_TYPE_MODEL,
                        getValidation: 'flowOptionsValidations'
                    },
                    {
                        key: 'flowAgingTimeout',
                        type: cowc.OBJECT_TYPE_COLLECTION,
                        getValidation: 'flowAgingTimeoutValidation'
                    }
                ];

            if(self.isDeepValid(validations)) {
                newFlowOptionsConfig =
                    $.extend({}, true, self.model().attributes);
                flowOptionsData['global-vrouter-config'] = {};

                var flowAgeList = self.getFlowAgingTupleList(newFlowOptionsConfig);
                if ((null != flowAgeList) & (flowAgeList.length > 0)) {
                    flowOptionsData['global-vrouter-config']['flow_aging_timeout_list'] = {};
                    flowOptionsData['global-vrouter-config']['flow_aging_timeout_list']
                           ['flow_aging_timeout'] = flowAgeList;
                } else {
                    flowOptionsData['global-vrouter-config']['flow_aging_timeout_list']
                        = null;
                }
                if (null != newFlowOptionsConfig['uuid']) {
                    flowOptionsData['global-vrouter-config']['uuid'] =
                        newFlowOptionsConfig['uuid'];
                    putData = {"global-vrouter-config":
                        flowOptionsData["global-vrouter-config"]};
                }
                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
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
                    callbackObj.error(this.getFormErrorText(ctwc.GLOBAL_FLOW_AGING_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return flowAgingModel;
});
