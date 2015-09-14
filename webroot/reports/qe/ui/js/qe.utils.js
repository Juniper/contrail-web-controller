/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEUtils = function () {
        var self = this;

        self.generateQueryUUID = function () {
            var s = [], itoh = '0123456789ABCDEF';
            for (var i = 0; i < 36; i++) {
                s[i] = Math.floor(Math.random() * 0x10);
            }
            s[14] = 4;
            s[19] = (s[19] & 0x3) | 0x8;
            for (var i = 0; i < 36; i++) {
                s[i] = itoh[s[i]];
            }
            s[8] = s[13] = s[18] = s[23] = s[s.length] = '-';
            s[s.length] = (new Date()).getTime();
            return s.join('');
        };

        self.setUTCTimeObj = function (queryPrefix, formModelAttrs, options, timeRange) {
            var serverCurrentTime = options ? options['serverCurrentTime'] : null;
            timeRange = (timeRange == null) ? getTimeRangeObj(formModelAttrs, serverCurrentTime) : timeRange;

            if (options != null) {
                options.fromTime = timeRange.fromTimeUTC;
                options.toTime = timeRange.toTimeUTC;
            }

            formModelAttrs['from_time_utc'] = timeRange.fromTime;
            formModelAttrs['to_time_utc'] = timeRange.toTime;
            formModelAttrs['rerun_time_range'] = timeRange.reRunTimeRange;
            return formModelAttrs;
        };

        self.getLabelStepUnit = function (tg, tgUnit) {
            var baseUnit = null, secInterval = 0;
            if (tgUnit == 'secs') {
                secInterval = tg;
                if (tg < 60) {
                    tg = (-1 * tg);
                } else {
                    tg = Math.floor(parseInt(tg / 60));
                }
                baseUnit = 'minutes';
            } else if (tgUnit == 'mins') {
                secInterval = tg * 60;
                baseUnit = 'minutes';
            } else if (tgUnit == 'hrs') {
                secInterval = tg * 3600;
                baseUnit = 'hours';
            } else if (tgUnit == 'days') {
                secInterval = tg * 86400;
                baseUnit = 'days';
            }
            return {labelStep: (1 * tg), baseUnit: baseUnit, secInterval: secInterval};
        };

        self.getEngQueryStr = function (reqQueryObj) {
            var engQueryJSON = {
                select: reqQueryObj.select,
                from: reqQueryObj.table,
                where: reqQueryObj.where,
                filter: reqQueryObj.filters
            };
            if (reqQueryObj.toTimeUTC == "now") {
                engQueryJSON['from_time'] = reqQueryObj.fromTimeUTC;
                engQueryJSON['to_time'] = reqQueryObj.toTimeUTC;
            } else {
                engQueryJSON['from_time'] = moment(reqQueryObj.fromTimeUTC).format('MMM DD, YYYY hh:mm:ss A');
                engQueryJSON['to_time'] = moment(reqQueryObj.toTimeUTC).format('MMM DD, YYYY hh:mm:ss A');
            }
            return JSON.stringify(engQueryJSON);
        };
    };

    function getTimeRangeObj(formModelAttrs, serverCurrentTime) {
        var queryPrefix = formModelAttrs['query_prefix'],
            timeRange = formModelAttrs['time_range'],
            tgUnit = formModelAttrs['tg_unit'],
            tgValue = formModelAttrs['tg_value'],
            fromDate, toDate, fromTimeUTC, toTimeUTC,
            fromTime, toTime, now, tgMicroSecs = 0;

        tgMicroSecs = getTGMicroSecs(tgValue, tgUnit);

        if (timeRange > 0) {
            if (serverCurrentTime) {
                toTimeUTC = serverCurrentTime;
            } else {
                now = new Date();
                now.setSeconds(0);
                now.setMilliseconds(0);
                toTimeUTC = now.getTime();
            }
            fromTimeUTC = toTimeUTC - (timeRange * 1000);
            if (queryPrefix !== 'fs' && queryPrefix !== 'stat') {
                toTime = "now";
                fromTime = "now-" + timeRange + "s";
            } else {
                toTime = toTimeUTC;
                fromTime = fromTimeUTC;
            }
        } else {
            // used for custom time range
            fromDate = formModelAttrs['from_time'];
            fromTimeUTC = new Date(fromDate).getTime();
            fromTime = fromTimeUTC;
            toDate = formModelAttrs['to_time'];
            toTimeUTC = new Date(toDate).getTime();
            toTime = toTimeUTC;
        }

        if (typeof fromTimeUTC !== 'undefined' && typeof tgMicroSecs !== 'undefined') {
            fromTimeUTC = ceilFromTime(fromTimeUTC, tgMicroSecs);
        }
        return {fromTime: fromTime, toTime: toTime, fromTimeUTC: fromTimeUTC, toTimeUTC: toTimeUTC, reRunTimeRange: timeRange};
    };

    function getTGMicroSecs(tg, tgUnit) {
        if (tgUnit == 'secs') {
            return tg * 1000;
        } else if (tgUnit == 'mins') {
            return tg * 60 * 1000;
        } else if (tgUnit == 'hrs') {
            return tg * 3600 * 1000;
        } else if (tgUnit == 'days') {
            return tg * 86400 * 1000;
        }
    };

    function ceilFromTime(fromTimeUTC, TGSecs){
        fromTimeUTC = TGSecs * Math.ceil(fromTimeUTC/TGSecs);
        return fromTimeUTC;
    };

    return QEUtils;
});
