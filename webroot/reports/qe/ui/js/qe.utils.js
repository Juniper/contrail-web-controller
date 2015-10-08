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


        self.getFromTimeElementConfig = function(fromTimeId, toTimeId) {
            return {
                onShow: function(cdt) {
                    this.setOptions(getFromTimeShowOptions(toTimeId, cdt));
                },
                onClose: function(cdt) {
                    this.setOptions(getFromTimeShowOptions(toTimeId, cdt));
                },
                onSelectDate: function(cdt) {
                    this.setOptions(getFromTimeSelectOptions(toTimeId, cdt));
                }
            };
        };

        self.getToTimeElementConfig = function(fromTimeId, toTimeId) {
            return {
                onShow: function(cdt) {
                    this.setOptions(getToTimeShowOptions(fromTimeId, cdt));
                },
                onClose: function(cdt) {
                    this.setOptions(getToTimeShowOptions(fromTimeId, cdt));
                },
                onSelectDate: function(cdt) {
                    this.setOptions(getToTimeSelectOptions(fromTimeId, cdt));
                }
            };
        };

        self.getModalClass4Table = function(tableName) {
            switch (tableName) {
                case "StatTable.ServerMonitoringSummary.resource_info_stats":
                    return "modal-1120";

                case "StatTable.ServerMonitoringInfo.file_system_view_stats.physical_disks":
                    return "modal-1120";

                default:
                    return cowc.QE_DEFAULT_MODAL_CLASSNAME;
            }
        };

        //TODO- remove this
        self.addFlowMissingPoints = function(tsData, options, plotFields, color, counter) {
            var fromTime = options.fromTime,
                toTime = options.toTime,
                interval = options.interval * 1000,
                plotData = [], addPoint, flowClassId = null,
                sumBytes = [], sumPackets = [];

            for (var key in tsData) {
                if (tsData[key]['flow_class_id'] != null) {
                    flowClassId = tsData[key]['flow_class_id'];
                    break;
                }
            }

            for (var i = fromTime + interval; i <= toTime; i += interval) {
                for (var k = 0; k < plotFields.length; k++) {
                    addPoint = {'x':i, 'flow_class_id':flowClassId};
                    if (tsData[i.toString()] != null) {
                        addPoint['y'] = tsData[i.toString()][plotFields[k]];
                    } else {
                        addPoint['y'] = 0;
                    }
                    if(plotFields[k] == 'sum_bytes') {
                        sumBytes.push(addPoint);
                    } else if (plotFields[k] == 'sum_packets') {
                        sumPackets.push(addPoint);
                    }
                }
            }

            if(sumBytes.length > 0) {
                plotData.push({'key': "#" + counter + ': Sum Bytes', color: color, values: sumBytes});
            } else if(sumPackets.length > 0) {
                plotData.push({'key': "#" + counter + ': Sum Packets', color: color, values: sumPackets});
            }

            return plotData;
        };

        self.getCurrentTime4Client = function() {
            var now = new Date(), currentTime;
            currentTime = now.getTime();
            return currentTime;
        };

        self.addFSMissingPoints = function(chartDataRow, queryFormModel, plotFields, color, counter) {
            var chartDataValues = chartDataRow.values,
                newChartDataValues = {},
                emptyChartDataValue  = {},
                toTime = queryFormModel.to_time(),
                fromTime = queryFormModel.from_time(),
                timeGranularity = queryFormModel.time_granularity(),
                timeGranularityUnit = queryFormModel.time_granularity_unit(),
                timeInterval = timeGranularity * qewc.TIME_GRANULARITY_INTERVAL_VALUES[timeGranularityUnit];

            $.each(plotFields, function(plotFieldKey, plotFieldValue) {
                emptyChartDataValue[plotFieldValue] = 0;
            });

            for (var i = fromTime; i <= toTime; i += timeInterval) {
                if (!contrail.checkIfExist(chartDataValues[i])) {
                    newChartDataValues[i] = emptyChartDataValue
                } else {
                    newChartDataValues[i] = chartDataValues[i];
                }
            }

            chartDataRow.values = newChartDataValues;

            return chartDataRow;
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
            if (queryPrefix == qewc.FS_QUERY_PREFIX || queryPrefix == qewc.STAT_QUERY_PREFIX) {
                toTime = toTimeUTC;
                fromTime = fromTimeUTC;
            } else {
                toTime = "now";
                fromTime = "now-" + timeRange + "s";
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

    function getFromTimeShowOptions(toTimeId, cdt) {
        var d = new Date($('#' + toTimeId + '_datetimepicker').val()),
            dateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A');

        return {
            maxDate: dateString ? dateString : false,
            maxTime: timeString ? timeString : false
        };
    };

    function getFromTimeSelectOptions(toTimeId, cdt) {
        var d = new Date($('#' + toTimeId + '_datetimepicker').val()),
            toDateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A'),
            fromDateString = moment(cdt).format('MMM DD, YYYY');

        return {
            maxDate: toDateString ? toDateString : false,
            maxTime: (fromDateString == toDateString) ? timeString : false
        };
    };

    function getToTimeShowOptions(fromTimeId, cdt) {
        var d = new Date($('#' + fromTimeId + '_datetimepicker').val()),
            dateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A');

        return {
            minDate: dateString ? dateString : false,
            minTime: timeString ? timeString : false
        };
    };

    function getToTimeSelectOptions(fromTimeId, cdt) {
        var d = new Date($('#' + fromTimeId + '_datetimepicker').val()),
            fromDateString = moment(d).format('MMM dd, yyyy'),
            timeString = moment(d).format('hh:mm:ss A'),
            toDateString = moment(cdt).format('MMM DD, YYYY');

        return {
            minDate: fromDateString ? fromDateString : false,
            minTime: (toDateString == fromDateString) ? timeString : false
        };
    };

    return QEUtils;
});
