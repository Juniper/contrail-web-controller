/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

//This file contains utility functions for network monitoring pages.

var commonUtils = require(process.mainModule.exports.corePath +
                          "/src/serverroot/utils/common.utils"),
    infraCmn = require("./infra.common.api"),
    opApiServer = require(process.mainModule.exports.corePath +
                          "/src/serverroot/common/opServer.api"),
    _ = require("lodash");

function sortEntriesByObj (entries, matchStr) {
    if (!_.isNil(matchStr)) {
        entries.sort(function(a, b) {
            if (a[matchStr] > b[matchStr]) {
                return 1;
            } else if (a[matchStr] < b[matchStr]) {
                return -1;
            }
            return 0;
        });
    } else {
        entries.sort();
    }
    return entries;
}

function getnThIndexByLastKey (lastKey, entries, matchStr) {
    var matchedStr;
    if (_.isNil(lastKey)) {
        return -1;
    }
    try {
        var cnt = entries.length;
    } catch(e) {
        return -1;
    }
    for (var i = 0; i < cnt; i++) {
        if (_.isNil(matchStr)) {
            matchedStr = entries[i];
        } else {
            matchedStr = entries[i][matchStr];
        }
        if (matchedStr === lastKey) {
            return i;
        } else if (matchedStr > lastKey) {
            return i - 1;
        }
    }
    return -2;
}

function makeUVEList (keys, attr)
{
    var result = [];
    var attrName = attr ? attr : 'name';
    keys.forEach(function(val, i){
        result[i] = {};
        result[i][attrName] = keys[i];
    });
    return result;
}

function buildBulkUVEUrls (filtData, appData) {
    filtData = filtData.data;
    var dataObjArr = [];

    try {
        var modCnt = filtData.length;
    } catch(e) {
        return null;
    }
    for (var i = 0; i < modCnt; i++) {
        var type = filtData[i].type;
        var hostname = filtData[i].hostname;
        var module = filtData[i].module;
        var cfilt = filtData[i].cfilt;
        var kfilt = filtData[i].kfilt;
        var mfilt = filtData[i].mfilt;
        var reqUrl = 
            infraCmn.getBulkUVEUrl(type, hostname, module,
                                   {cfilt:cfilt, kfilt:kfilt, mfilt:mfilt});
        /* All URLs should be valid */
        if (_.isNil(reqUrl)) {
            return null;
        }
        commonUtils.createReqObj(dataObjArr, reqUrl, null,
                                 null, opApiServer, null, appData);
    }
    return dataObjArr;
}

exports.getnThIndexByLastKey = getnThIndexByLastKey;
exports.makeUVEList = makeUVEList;
exports.sortEntriesByObj = sortEntriesByObj;
exports.buildBulkUVEUrls = buildBulkUVEUrls;

