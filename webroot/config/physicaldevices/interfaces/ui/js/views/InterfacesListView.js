/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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
            self.pInterfaceDS = [];
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
                vlan : '-',
                server : '-',
                servers_display : '-',
                vn : '-',
                logicalInfType : '-'
            });
        },
        preparePIData : function(result) {
            var gridDS = [];
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
                    self.pInterfaceDS.push(
                        {
                            text : piName,
                            value : pInterface.uuid,
                            parent : 'Physical Interface'
                        }
                    );
                }
            }
            if(self.piUUID.length > 0) {
                self.fetchLIWithPI();
            }
            window.inf = {};
            window.inf.pInterfaceDS = self.pInterfaceDS;
            return gridDS;
        },
        prepareLIData : function(result) {
            var gridDS = [];
            if(result!= null && result.length > 0) {
                for(var i = 0; i < result.length; i++) {
                    var lInterface = result[i]['logical-interface'];
                    var liName = lInterface.display_name != null ?
                        lInterface.display_name : lInterface.name;
                    var liDetails = self.getLogicalInterfaceDetails(lInterface);
                    var parentName =
                        lInterface.parent_type == 'physical-router' ?
                        lInterface.fq_name[1] :
                        self.getActInterfaceName(lInterface.fq_name[2]);
                    var serverString = '';
                    var vmiDetails = liDetails.vmiDetails;
                    if(vmiDetails == null || vmiDetails == '-' ||
                        vmiDetails.length < 1){
                        serverString = '-'
                    } else {
                        $.each(vmiDetails,function(i,d){
                            if(i == 0){
                                serverString = d;
                            } else {
                                serverString += '</br>' + d;
                            }
                        });
                    }
                    gridDS.push({
                        uuid : lInterface.uuid,
                        name : liName,
                        type : 'Logical',
                        parent : parentName,
                        vlan : liDetails.vlanTag != null ?
                            liDetails.vlanTag : '-',
                        server : (liDetails.liType == "L3")? '-' :
                            vmiDetails != null ? vmiDetails : '-',
                        servers_display : serverString,
                        vn : liDetails.vnRefs != null ? liDetails.vnRefs : '-',
                        logicalInfType :
                            liDetails.liType != null ? liDetails.liType : '-' ,
                        vmi_ip :
                            liDetails.vmiIP != null ? liDetails.vmiIP : '-',
                        vmi_uuid : liDetails.vmiUUID,
                        vm_uuid : liDetails.vmUUID,
                        subnetUUIDArr : liDetails.subnetUUIDArr != null ?
                            liDetails.subnetUUIDArr : '-',
                        subnetCIDRArr : liDetails.subnetCIDRArr != null ?
                            liDetails.subnetCIDRArr : '-',
                        vnUUID :
                            liDetails.vnUUID != null ? liDetails.vnUUID : '-'
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
            contrail.ajaxHandler(ajaxConfig, null,
                function(result, cbparam){
                    if(cbparam.ajaxParam != ajaxParam) {
                        return;
                    }
                    self.prepareLIDataWithPI(result);
                    /*issue logical interfaces per 200 physical interfaces
                    call one at a time*/
                    if(self.piUUID.length > cbparam.actCnt) {
                        //gridPhysicalInterfaces.showGridMessage('loading');
                        var newCnt = cbparam.actCnt + self.liChunkCnt;
                        var newChunk =
                            self.piUUID.slice(cbparam.actCnt, newCnt);
                        self.fetchLIWithPIChunk(newChunk, newCnt);
                    } else {
                        //gridPhysicalInterfaces.removeGridMessage();
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
                        var liDetails =
                            self.getLogicalInterfaceDetails(lInterface);
                        var parentName =
                            lInterface.parent_type == 'physical-router' ?
                            lInterface.fq_name[1] :
                            self.getActInterfaceName(lInterface.fq_name[2]);
                        var serverString = '';
                        var vmiDetails = liDetails.vmiDetails;
                        if(vmiDetails == null || vmiDetails == '-' ||
                            vmiDetails.length < 1){
                            serverString = '-'
                        } else {
                            $.each(vmiDetails,function(i,d){
                                if(i == 0){
                                    serverString = d;
                                } else {
                                    serverString += '</br>' + d;
                                }
                            });
                        }
                        var infObj = {
                            uuid : lInterface.uuid,
                            name : liName,
                            type : 'Logical',
                            parent : parentName,
                            vlan : liDetails.vlanTag != null ?
                                liDetails.vlanTag : '-',
                            server : (liDetails.liType == "L3")? '-' :
                                vmiDetails != null ? vmiDetails : '-',
                            servers_display : serverString,
                            vn : liDetails.vnRefs != null ?
                                liDetails.vnRefs : '-',
                            logicalInfType : liDetails.liType != null ?
                                liDetails.liType : '-' ,
                            vmi_ip : liDetails.vmiIP != null ?
                                liDetails.vmiIP : '-',
                            vmi_uuid : liDetails.vmiUUID,
                            vm_uuid : liDetails.vmUUID,
                            subnetUUIDArr : liDetails.subnetUUIDArr != null ?
                                liDetails.subnetUUIDArr : '-',
                            subnetCIDRArr : liDetails.subnetCIDRArr != null ?
                                liDetails.subnetCIDRArr : '-',
                            vnUUID : liDetails.vnUUID != null ?
                                liDetails.vnUUID : '-'
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
            var vnRefs = '-';
            var vlanTag = inf['logical_interface_vlan_tag'] != null ?
                inf['logical_interface_vlan_tag'] : '-' ;
            var liType = inf['logical_interface_type'] != null ?
                inf['logical_interface_type'] : '-' ;
            var vmiIP = '-' ;
            var vmiIPs = [];
            if(liType != '-') {
                liType = liType === 'l2' ? 'L2' : 'L3';
            }
            var vmiDetails = '-';
            var vmiDetailsArray = [];
            var vmiUUID = [], vmUUID = [];
            if(inf['vmi_details'] != null) {
                for(var i =0; i < inf['vmi_details'].length ; i++){
                    var vmiDetail = inf['vmi_details'][i];
                    if(vmiDetail != null) {
                        var macAddr = vmiDetail.mac[0] != null ?
                            vmiDetail.mac[0].trim() : '';
                        if(vmiDetail.ip[0] != null) {
                            vmiIP = vmiDetail.ip[0].trim();
                            vmiIPs.push(vmiIP);
                            vmiDetails = macAddr +' ('+ vmiIP + ')';
                        } else {
                            vmiDetails = macAddr;
                        }
                        vmiDetailsArray.push(vmiDetails);
                        vmiUUID.push(vmiDetail['vmi_uuid']);
                        vmiDetail['vm_refs'][0] != null ?
                           vmUUID.push(vmiDetail['vm_refs'][0].to[0]) : null;
                    }
                }
            }

            var subnetCIDRArr = [];
            var subnetUUIDArr = [];
            var subnet = '-';
            var vnUUID = '-';
            if(vmiDetails != '-') {
                if(vmiDetail['vn_refs'] != null && vmiDetail['vn_refs'][0]) {
                    vnRefs = vmiDetail['vn_refs'][0].to;
                    vnUUID =  vmiDetail['vn_refs'][0].uuid;
                }
                if(vnRefs != '-') {
                    vnRefs =
                        vnRefs[2] + ' (' + vnRefs[0] + ':' + vnRefs[1] + ')';
                }
                if(vmiDetail['subnet'] != null && vmiDetail['subnet'] != '' &&
                    vmiDetail['subnet'].length > 0){
                    for(var i = 0 ;i < vmiDetail['subnet'].length ; i++){
                        var subnetCidr =
                            vmiDetail['subnet'][i]['subnetIPPrefix'];
                        subnetCIDRArr.push(subnetCidr['ip_prefix'] + '/' +
                            subnetCidr['ip_prefix_len']);
                        subnetUUIDArr.push(
                            vmiDetail['subnet'][i]['subnetUUID']);
                    }
                }
            }

            return {
                vlanTag : vlanTag,
                liType : liType,
                vmiDetails : vmiDetailsArray,
                vnRefs : vnRefs,
                vmiIP : vmiIPs,
                vmiUUID : vmiUUID,
                vmUUID : vmUUID,
                subnetCIDRArr : subnetCIDRArr,
                subnetUUIDArr:subnetUUIDArr,
                vnUUID:vnUUID
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
                                view: "InterfacesGridView",
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

