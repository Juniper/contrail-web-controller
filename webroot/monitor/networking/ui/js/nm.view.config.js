/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'core-basedir/reports/qe/ui/js/common/qe.utils'
], function (_, qewu) {
    var NMViewConfig = function () {
        var self = this;

        self.getMNConnnectedGraphConfig = function (url, elementNameObject, keySuffix, type) {
            var instanceSuffix = (contrail.checkIfExist(elementNameObject['instanceUUID']) ? (':' + elementNameObject['instanceUUID']) : ''),
                ucid = ctwc.UCID_PREFIX_MN_GRAPHS + elementNameObject.fqName + instanceSuffix +  keySuffix,
                graphConfig = {
                    remote: {
                        ajaxConfig: {
                            url: url,
                            type: 'GET'
                        }
                    },
                    cacheConfig: {
                        ucid: ucid
                    },
                    focusedElement: {
                        type: type,
                        name: elementNameObject
                    }
                };

            if(type ==  ctwc.GRAPH_ELEMENT_NETWORK) {
                graphConfig['vlRemoteConfig'] = {
                    vlRemoteList: nmwgc.getNetworkVMDetailsLazyRemoteConfig()
                };
            }

            return graphConfig;
        };

        self.getInterfaceListModelConfig  = function(parentUUID, parentFQN) {
            var ajaxConfig = {
                url : ctwc.get(ctwc.URL_GET_NETWORK_INTERFACES, 100, 1000, $.now()),
                type: 'POST',
                data: JSON.stringify({
                    id: qewu.generateQueryUUID(),
                    FQN: parentFQN
                })
            };

            return {
                remote: {
                    ajaxConfig: ajaxConfig,
                    dataParser: ctwp.interfaceDataParser,
                    hlRemoteConfig: {
                        remote: {
                            ajaxConfig: {
                                url: ctwc.get(ctwc.URL_GET_INTERFACES_LIST, $.now()),
                                type: 'POST',
                                data: JSON.stringify({
                                    reqId: qewu.generateQueryUUID(),
                                    FQN: parentFQN,
                                    fqnUUID: parentUUID
                                })
                            },
                            dataParser: function(vmiList) {
                                var retArr = [];
                                var opVMIList = vmiList.opVMIList;
                                var configVMIList = vmiList.configVMIList;
                                var configVMIListLen = 0;
                                var tmpOpVMIObjs = {};
                                if ((null == opVMIList) || (!opVMIList.length)) {
                                    return retArr;
                                }
                                if (!cowu.isNil(configVMIList)) {
                                    configVMIListLen = configVMIList.length;
                                }
                                _.each(opVMIList, function(vmiUUID) {
                                    tmpOpVMIObjs[vmiUUID] = vmiUUID;
                                    retArr.push({name: vmiUUID, source: "analytics"});
                                });
                                for (var i = 0; i < configVMIListLen; i++) {
                                    var vmi = configVMIList[i].fqn;
                                    if (cowu.isNil(tmpOpVMIObjs[vmi])) {
                                        retArr.push({name: vmi, source: "config"});
                                    }
                                }
                                return retArr;
                            },
                            completeCallback: function(response, contrailListModel,
                                                       parentListModelArray) {
                                function updateInterfaceModel (contrailListModel, parentListModelArray) {
                                    var uuidList = contrailListModel.getItems();
                                    var detailsList = parentListModelArray[0].getItems();
                                    var uniqList = nmwu.getUniqElements(detailsList, uuidList, "name");
                                    parentListModelArray[0].addData(uniqList);
                                }
                                if (contrail.checkIfExist(parentListModelArray) &&
                                    contrail.checkIfFunction(parentListModelArray[0].isRequestInProgress)) {
                                    if (parentListModelArray[0].isRequestInProgress()) {
                                        var updateInterfaceModelCB = function() {
                                            return updateInterfaceModel(contrailListModel, parentListModelArray);
                                        };
                                        parentListModelArray[0].onAllRequestsComplete.subscribe(updateInterfaceModelCB);
                                    }
                                } else {
                                    updateInterfaceModel(contrailListModel, parentListModelArray);
                                }
                            }
                        },
                        vlRemoteConfig: {
                            vlRemoteList: nmwgc.getInterfaceStatsVLOfHLRemoteConfig()
                        }
                    },
                    cacheConfig : {
                        ucid: (parentUUID != null) ? (ctwc.UCID_PREFIX_MN_LISTS + parentUUID + ":" + 'virtual-interfaces') : ctwc.UCID_ALL_INTERFACES_LIST
                    }
                }
            }
        }
        
    };

    return NMViewConfig;
});