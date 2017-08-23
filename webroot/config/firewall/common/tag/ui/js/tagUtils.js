/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define(['lodash'], function(_){
    tagUtils = function () {
        this.fetchVMIDetails =  function (dataItems, listModel) {
            var vmiIdList = [],
                ajaxConfig = {}, tagVmiListMap = {};
            _.forEach(dataItems, function(data) {
                var currentTagVmis =
                    _.map(_.get(data, 'virtual_machine_interface_back_refs', []),'uuid');
                vmiIdList = vmiIdList.concat(currentTagVmis);
            });
            vmiIdList = _.uniq(vmiIdList);
            if(vmiIdList.length === 0) {
                return dataItems;
            }
            ajaxConfig.type = 'POST';
            ajaxConfig.url = ctwc.URL_GET_PORT;
            ajaxConfig.data = JSON.stringify({type: "virtual-machine-interfaces",
                uuidList: vmiIdList})
            contrail.ajaxHandler(ajaxConfig, null,
                function (vmiDetails) {
                _.forEach(vmiDetails, function (vmiData) {
                    var vmi =
                        _.get(vmiData, 'virtual-machine-interface', {}),
                        tags = _.get(vmi, 'tag_refs', []);
                    _.forEach(tags, function (tag) {
                        var tagId = _.get(tag, 'uuid', '');
                        if(!(tagVmiListMap[tagId] instanceof Array)) {
                            tagVmiListMap[tagId] = [];
                        }
                        tagVmiListMap[tagId].push(vmi);
                    });
                });
                //update vmi details in tag object
                _.forEach(dataItems, function (tagDetails) {
                    tagDetails.virtual_machine_interface_back_refs =
                        tagVmiListMap[tagDetails.uuid];
                });
                listModel.setData(dataItems);

            },  function (error) {
                listModel.setData(dataItems);
            });
            return [];
        };
    };
    return new tagUtils();
});
