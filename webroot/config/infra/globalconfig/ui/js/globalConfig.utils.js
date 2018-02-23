/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var globalConfigUtils = function() {
        var self = this;
        this.getDefaultUIEncapList = function () {
            return ['MPLS Over UDP', 'MPLS Over GRE', 'VxLAN'];
        },
        this.getDefaultConfigEncapList = function () {
            return ['MPLSoUDP', 'MPLSoGRE', 'VXLAN'];
        },
        this.mapConfigEncapToUIEncap = function(configEncapList) {
            var uiEncapList = [];
            if (null == configEncapList) {
                return null;
            }
            var encapCnt = configEncapList.length;
            for (var i = 0; i < encapCnt; i++) {
                if ('MPLSoUDP' == configEncapList[i]) {
                    uiEncapList.push('MPLS Over UDP');
                } else if ('MPLSoGRE' == configEncapList[i]) {
                    uiEncapList.push('MPLS Over GRE');
                } else if ('VXLAN' == configEncapList[i]) {
                    uiEncapList.push('VxLAN');
                }
            }
            return uiEncapList;
        },
        this.mapUIEncapToConfigEncap = function(uiEncapList) {
            var configEncapList = [];
            if (null == uiEncapList) {
                return null;
            }
            var encapCnt = uiEncapList.length;
            for (var i = 0; i < encapCnt; i++) {
                if ('MPLS Over UDP' == uiEncapList[i]) {
                    configEncapList.push('MPLSoUDP');
                } else if ('MPLS Over GRE' == uiEncapList[i]) {
                    configEncapList.push('MPLSoGRE');
                } else if ('VxLAN' == uiEncapList[i]) {
                    configEncapList.push('VXLAN');
                }
            }
            return configEncapList;
        },

        this.getTextByValue = function(arry, val) {
            var i, arryCnt = arry.length, text = null;
            for(i = 0; i < arryCnt; i++) {
                if(arry[i].value == val){
                    text = arry[i].text;
                    break;
                }
            }
            if(text === null) {
                //converts integer to binary
                text = val ? val.toString(2) : "";
            }
            return text;
        },

        this.getValueByText =  function(arry, txt) {
            var i, arryCnt = arry.length, value = null;
            for(i = 0; i < arryCnt; i++) {
                if(arry[i].text === txt){
                    value = arry[i].value;
                    break;
                }
            }
            if(value === null) {
                //converts binary to integer
                txt = Number(txt);
                value = parseInt(txt, 2);
                value = isNaN(value) ? parseInt(txt, 10) : value;
            }
            return value;
        },

        this.isValidBits =  function(arry, txt) {
            var i, arryCnt = arry.length, value = Number(txt), isValid = true;
            for(i = 0; i < arryCnt; i++) {
                if(arry[i].text === txt){
                    value = arry[i].value;
                    break;
                }
            }
            if(isNaN(parseInt(value, 2)) && isNaN(parseInt(value, 10))) {
                isValid = false;
            }
            return isValid;
        },
        this.validateIP = function(inputText){
        		if(typeof inputText != 'string')
        			return false;
        		var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        		if(inputText.match(ipformat))
        			return true;
        		else
        			return false;
        };
        this.vRouterCfgDataParser = function(response) {
            var retArr = [];
            if(response != null &&
               'virtual-routers' in response &&
                response['virtual-routers'] != null &&
                response['virtual-routers'].length > 0) {
                var length = response['virtual-routers'].length
                for (var i = 0; i < length; i++) {
                    retArr.push(response['virtual-routers'][i]['virtual-router']);
                }
            }
            return retArr;
         };
    }
    return globalConfigUtils;
});

