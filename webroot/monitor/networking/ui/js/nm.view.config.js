/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
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
        
    };

    return NMViewConfig;
});