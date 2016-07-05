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
            var i, arryCnt = arry.length, text = val;
            for(i = 0; i < arryCnt; i++) {
                if(arry[i].value == val){
                    text = arry[i].text;
                    break;
                }
            }
            return text;
        },

        this.getValueByText =  function(arry, txt) {
            var i, arryCnt = arry.length, value = txt;
            for(i = 0; i < arryCnt; i++) {
                if(arry[i].text === txt){
                    value = arry[i].value;
                    break;
                }
            }
            return value;
        }
    }
    return globalConfigUtils;
});

