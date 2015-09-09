/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-view',
    'contrail-list-model'
], function (_, Backbone, ContrailView, ContrailListModel) {
    var self;
    var InterfacesListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this, viewConfig = this.attributes.viewConfig;
            self.piUUID = [];
            self.liChunkCnt = 200;
            self.ajaxTimeout = 300000;
            self.pRouterSelData = viewConfig.pRouterSelData;
            self.renderInterfaceListView(viewConfig.pRouterSelData);

        },
        renderInterfaceListView : function(pRouterSelData) {
            var postObj = {};
            postObj.type = "physical-interface";
            postObj.parentType = "physical-router";
            var uuid = pRouterSelData.value;
            postObj.parentIDList = [uuid];
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url : ctwc.get(ctwc.URL_GET_INTERFACES),
                        type : "POST",
                        data : JSON.stringify(postObj),
                        timeout : self.ajaxTimeout
                    },
                    dataParser : self.preparePIData
                },
                vlRemoteConfig : {
                    vlRemoteList : self.getRootLILazyRemoteConfig()
                }
            };

            self.contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el, self.contrailListModel,
                getInterfacesSectionViewConfig(pRouterSelData));
        },
        setPhysicalInterfaceDataItem : function(ds, pInterface, piName,
            lInterfaceNames) {
            ds.push({
                uuid : pInterface.uuid,
                name : piName,
                type : 'Physical',
                lInterfaces : lInterfaceNames != '' ? lInterfaceNames : '-',
                parent : pInterface.fq_name[1],
                parent_type : ctwl.PARENT_TYPE_PROUTER,
                logical_interface_vlan_tag : '-',
                server : '-',
                servers_display : '-',
                vn : '-',
                logical_interface_type : '-'
            });
        },
        preparePIData : function(result) {
            var gridDS = [];
            var pInterfaceDS = [];
            if(result!= null && result.length > 0) {
                for(var i = 0; i < result.length; i++) {
                    var pInterface = result[i]['physical-interface'];
                    var piName = pInterface.display_name != null ?
                        pInterface.display_name : pInterface.name;
                    var lInfs = pInterface["logical_interfaces"];
                    var lInterfaceNames = '';
                    if(lInfs != null) {
                        for(var j = 0; j < lInfs.length;j++) {
                            var lInterfaceName =
                                self.getActInterfaceName(lInfs[j].to[3]);
                            if(lInterfaceNames === ''){
                                lInterfaceNames = lInterfaceName;
                            } else {
                                lInterfaceNames += ',' + lInterfaceName;
                            }
                        }
                        self.piUUID.push(pInterface.uuid);
                    }
                    self.setPhysicalInterfaceDataItem(gridDS, pInterface,
                        piName, lInterfaceNames);
                    pInterfaceDS.push(
                        {
                            text : piName,
                            value : pInterface.uuid,
                        }
                    );
                }
            }
            /*make call to fetch logical intrefaces under
                physical interfaces*/
            if(self.piUUID.length > 0) {
                self.fetchLIWithPI();
            }
            window.inf = {};
            window.inf.pInterfaceDS = pInterfaceDS;
            return gridDS;
        },
        prepareLIData : function(result) {
            var gridDS = [];
            if(result!= null && result.length > 0) {
                for(var i = 0; i < result.length; i++) {
                    var lInterface = result[i]['logical-interface'];
                    var liName = lInterface.display_name != null ?
                        lInterface.display_name : lInterface.name;
                    var parentName =
                        lInterface.parent_type == 'physical-router' ?
                        lInterface.fq_name[1] :
                        self.getActInterfaceName(lInterface.fq_name[2]);
                    var lInfType = lInterface['logical_interface_type'] === 'l2' ?
                        ctwl.LOGICAL_INF_L2_TYPE : ctwl.LOGICAL_INF_L3_TYPE;
                    var liDetails = self.getLogicalInterfaceDetails(lInterface);
                    gridDS.push({
                        uuid : lInterface.uuid,
                        name : liName,
                        type : ctwl.LOGICAL_INF,
                        parent : parentName,
                        parent_type : ctwl.PARENT_TYPE_PROUTER,
                        logical_interface_vlan_tag :
                            lInterface['logical_interface_vlan_tag'],
                        logical_interface_type : lInfType,
                        virtual_machine_interface_refs :
                            lInterface.virtual_machine_interface_refs,
                        vmi_uuid: liDetails.vmiUUID,
                        subnetUUIDArr : liDetails.subnetUUIDArr
                    });
                }
            }
            return gridDS;
        },
        fetchLIWithPI : function() {
            self.fetchLIWithPIChunk(self.piUUID.slice(0, self.liChunkCnt),
                self.liChunkCnt);
        },
        //fetches all logical interfaces under all physical interfaces
        fetchLIWithPIChunk : function(uuidsChunk, actCnt) {
            ajaxParam = self.pRouterSelData.value;
            var postObj = {};
            postObj.type = "logical-interface";
            postObj.parentType = "physical-interface";
            postObj.parentIDList = [uuidsChunk];
            var ajaxConfig = {
                url : ctwc.get(ctwc.URL_GET_INTERFACES),
                type : 'POST',
                data : JSON.stringify(postObj),
                timeout : self.ajaxTimeout
            };
            contrail.ajaxHandler(ajaxConfig,
                function(){
                    setTimeout(function(){
                        if($.active > 0) {
                            $('#' + ctwl.INTERFACES_GRID_ID).
                                find('.grid-header-icon-loading').show();
                        }
                    }, 1000);
                },
                function(result, cbparam){
                    if(cbparam.ajaxParam != ajaxParam) {
                        return;
                    }
                    self.prepareLIDataWithPI(result);
                    /*issue logical interfaces per 200 physical interfaces
                    call one at a time*/
                    if(self.piUUID.length > cbparam.actCnt) {
                        $('#' + ctwl.INTERFACES_GRID_ID).
                            find('.grid-header-icon-loading').show();
                        var newCnt = cbparam.actCnt + self.liChunkCnt;
                        var newChunk =
                            self.piUUID.slice(cbparam.actCnt, newCnt);
                        self.fetchLIWithPIChunk(newChunk, newCnt);
                    } else {
                        $('#' + ctwl.INTERFACES_GRID_ID).
                            find('.grid-header-icon-loading').hide();
                    }
                },
                function(error){
                },
                {ajaxParam : ajaxParam, actCnt : actCnt}
            );
        },
        prepareLIDataWithPI : function(result) {
            self.orderInterfaces(result);
        },
        orderInterfaces : function(result) {
            var gridData = self.contrailListModel.getItems();
            var newData = [];
            $.extend(true, newData, gridData);
            for(var j = 0; j < result.length; j++) {
                for(var i = newData.length - 1; i > -1; i--) {
                    if(result[j]['logical-interface'].parent_uuid ===
                        newData[i].uuid){
                        var lInterface = result[j]['logical-interface'];
                        var liName = lInterface.display_name != null ?
                            lInterface.display_name : lInterface.name;
                        var parentName =
                            lInterface.parent_type == 'physical-router' ?
                            lInterface.fq_name[1] :
                            self.getActInterfaceName(lInterface.fq_name[2]);
                        var lInfType = lInterface['logical_interface_type'] === 'l2' ?
                            ctwl.LOGICAL_INF_L2_TYPE : ctwl.LOGICAL_INF_L3_TYPE;
                        var liDetails = self.getLogicalInterfaceDetails(lInterface);
                        var infObj = {
                            uuid : lInterface.uuid,
                            name : liName,
                            type : ctwl.LOGICAL_INF,
                            parent : parentName,
                            parent_type : ctwl.PARENT_TYPE_PINF,
                            logical_interface_vlan_tag :
                                lInterface['logical_interface_vlan_tag'],
                            logical_interface_type : lInfType,
                            virtual_machine_interface_refs :
                                lInterface.virtual_machine_interface_refs,
                             vmi_uuid : liDetails.vmiUUID,
                             subnetUUIDArr : liDetails.subnetUUIDArr
                        };
                        newData.splice(i + 1, 0, infObj);
                    }
                }
            }
            self.contrailListModel.setData(newData);
        },
        getActInterfaceName : function(name) {
            var actName = name;
            if(name.indexOf('__') != -1){
                actName = name.replace('__',':');
            }
            return actName;
        },
        getLogicalInterfaceDetails : function(inf) {
            var vmiUUID = [], subnetUUIDArr = [];
            var vmiRefs = inf['virtual_machine_interface_refs'];
            if(vmiRefs != null) {
                for(var i = 0; i < vmiRefs.length ; i++) {
                    var vmiDetail = vmiRefs[i]['virtual-machine-interface'];
                    if(vmiDetail != null) {
                        vmiUUID.push(vmiDetail['uuid']);
                    }
                }
                if('subnet_back_refs' in vmiRefs[0]) {
                    var subnet = vmiRef['subnet_back_refs'][0];
                    subnetUUIDArr.push(subnet['uuid']);
                }
            }
            return {
                vmiUUID : vmiUUID,
                subnetUUIDArr : subnetUUIDArr,
            };
        },
        getRootLILazyRemoteConfig : function () {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var postObj = {};
                        postObj.type = "logical-interface";
                        postObj.parentType = "physical-router";
                        var uuid =
                            self.pRouterSelData.value;
                        postObj.parentIDList = [uuid];
                        var lazyAjaxConfig = {
                            url: ctwc.get(ctwc.URL_GET_INTERFACES),
                            type: 'POST',
                            data: JSON.stringify(postObj),
                            timeout : self.ajaxTimeout
                        }
                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailListModel,
                        parentModelList) {
                        /*add logical intrefaces directly under
                            physical router*/
                        var liData = self.prepareLIData(response);
                        contrailListModel.addData(liData);
                    }
                }
            ];
        }
    });

    var getInterfacesSectionViewConfig = function (pRouterSelData) {
        return {
            elementId:
                cowu.formatElementId([ctwl.CONFIG_INTERFACES_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_INTERFACES_ID,
                                title: ctwl.TITLE_INTERFACES,
                                view: "interfacesGridView",
                                viewPathPrefix: ctwl.INF_VIEW_PATH_PREFIX,
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig : {pRouterSelData : pRouterSelData}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return InterfacesListView;
});

