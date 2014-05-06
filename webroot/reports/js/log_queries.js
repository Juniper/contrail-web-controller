/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var systemLogsObj = new systemLogsObj(),
    objectLogsObj = new objectLogsObj(),
    logQueryQueueObj = new logQueryQueueObj();

var qeTemplate = $("#msg-template").html(),
    otSelectPopupTemplate = contrail.getTemplate4Id('ot-select-popup-template');

var slQuery = queries.sl,
    otQuery = queries.ot;

function initLogPages() {
    initConfirmWindow4Queue("lqq");
};

function systemLogsObj() {
    this.load = loadSystemLogs;
    this.destroy = function() {};
};

function objectLogsObj() {
    this.load = loadObjectLogs;
    this.destroy = function() {};
};

function logQueryQueueObj() {
    this.load = loadLogQueryQueue;
    this.destroy = function() {};
};

//System Logs Query - Begin
slQuery['queryViewModel'] = new QueryViewModel('sl', function() {
                                this.defaultTRValue("1800");
                                //this.levels([]);
                                this.selectedLevel();
                                this.categories([]);
                                this.isCustomTRVisible(false);
                                queries.sl.filterViewModel.reset();
                                queries.sl.whereViewModel.reset();
                            });

slQuery['whereViewModel'] = new WhereViewModel('sl', function() {
        this.whereClauseView([]);
        this.whereClauseSubmit([]);
        this.whereClauseEdit([]);
        this.selectedORClauseIndex("-1");
        $('#sl-where').val('');
});

slQuery['filterViewModel'] = new FilterViewModel('sl', function() {
    this.filterClauseSubmit([]);
    this.filterClauseSubmit("");
    $('#sl-filter').val('');
});

function loadSystemLogs() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    setSLValidValues();
    initSLQueryView('sl');
    ko.applyBindings(queries.sl.queryViewModel, document.getElementById('sl-query'));
    initWidgetBoxes();
    currTab = 'query_log_system';
};

function initSLQueryView(queryPrefix) {
    var query = queries[queryPrefix],
        defaultToTime = new Date(),
        defaultFromTime = new Date(defaultToTime.getTime() - 600000);
    $('#' + queryPrefix + '-query').html($('#' + queryPrefix + "-query-template").html());

    validateDate('sl');

    $("#sl-query-form").validate({
        errorClass: 'jqInvalid',
        rules: {
            checkValidDate: true
        },
        messages: {},
        errorPlacement: function(label, element) {
            label.insertAfter(element.parent());
        }
    });

    query.fromTime = createNewDTPicker(queryPrefix, queryPrefix + '-from-time', showFromTime, onSelectFromDate, defaultFromTime);
    query.toTime = createNewDTPicker(queryPrefix, queryPrefix + '-to-time', showToTime, onSelectToDate, defaultToTime);
};

function setSLValidValues() {
    var viewModels = [queries.sl.whereViewModel, queries.sl.filterViewModel];
    setValidLevelValues('/api/admin/table/values/MessageTable/Level', 'levels', queries.sl.queryViewModel);
    setValidValues('/api/admin/table/values/MessageTable/Category', 'Category', viewModels, 'ControlNode');
    setColumnValues('/api/admin/table/schema/MessageTable', 'selectFields', [queries.sl.whereViewModel], 'columns');
    setColumnValues('/api/admin/table/schema/MessageTable', 'selectFields', [queries.sl.filterViewModel], 'columns', null, true, [
        {"name":'Xmlmessage', "value":'Xmlmessage'}
    ]);
    setValidValues('/api/admin/table/values/MessageTable/ModuleId', 'ModuleId', viewModels);
    setValidValues('/api/admin/table/values/MessageTable/Source', 'Source', viewModels);
};

function runSLQuery() {
    var reqObject = $('#sl-query-form').serializeObject(),
        queryPrefix = 'sl',
        options = getSLDefaultOptions(), queryId;
    if ($("#" + queryPrefix + "-query-form").valid()) {
    	collapseWidget('#sl-query-widget');
        queryId = randomUUID();
        reqObject = setUTCTimeObj('sl', reqObject);
        reqObject['table'] = 'MessageTable';
        reqObject['queryId'] = queryId;
        reqObject['async'] = 'true';
        reqObject.engQueryStr = getEngQueryStr(reqObject);
        loadSLResults(options, reqObject);
    }
};

function getSLDefaultOptions() {
    return {
        elementId:'sl-results', gridHeight:480,
        timeOut:90000, pageSize:100, export:true, pageable:true, virtual:false,
        btnId:'sl-query-submit'
    };
}

function viewSLQueryResults(dataItem, params) {
	
    var options = getSLDefaultOptions(), 
    	queryId = dataItem.queryId,
        queryJSON = dataItem.queryJSON,
        reRun = params['reRun'], 
        timeObj = params['timeObj'],
        reRunQueryObj = params['reRunQueryObj'],
        queryPrefix = params['queryPrefix'],
        reqQueryObject = {};

    if(reRun) {
        queryId = randomUUID();
        reqQueryObject = reRunQueryObj;
        reqQueryObject = setUTCTimeObj('sl', reqQueryObject, options, timeObj);
    }
    if(typeof(ko.dataFor(document.getElementById(queryPrefix + '-query'))) !== "undefined"){
        ko.cleanNode(document.getElementById(queryPrefix + '-query'));
    }

    reqQueryObject.queryId = queryId;
    
    setSLValidValues();
    initSLQueryView(queryPrefix);
    collapseOtherWidgets(queryPrefix);

    ko.applyBindings(queries[queryPrefix].queryViewModel, document.getElementById(queryPrefix + '-query'));
    
    populateSLQueryForm(queryJSON, timeObj.reRunTimeRange);
    collapseWidget('#' + queryPrefix + '-query-widget');
    loadSLResults(options, reqQueryObject);
};

function populateSLQueryForm(queryJSON, reRunTimeRange) {
    var queryPrefix = 'sl';
    populateTimeRange(queryPrefix, queryJSON['start_time'], queryJSON['end_time'], reRunTimeRange);
    populateLevel(queryPrefix, queryJSON['filter']);
    if (queryJSON['where'] != null) {
        populateLogWhere(queryPrefix, queryJSON['where']);
    }
    if (queryJSON['filter'] != null) {
        populateLogFilter(queryPrefix, queryJSON['filter']);
    }
};
//System Logs Query - End

//Object Traces Query - Begin
otQuery['queryViewModel'] = new QueryViewModel('ot', function() {
                                this.defaultTRValue("1800");
                                this.categories([]);
                                this.isCustomTRVisible(false);
                                queries.ot.filterViewModel.reset();
                                queries.ot.selectViewModel.reset();
                                queries.ot.whereViewModel.reset();
                            });

otQuery['selectViewModel'] = new SelectViewModel('ot', function() {
    this.checkedFields(getOTSelectFieldsOptions());
    this.selectFields(getOTSelectFieldsOptions());
    this.defaultSelectAllText("Clear All");
    $('#ot-select').val('ObjectLog, SystemLog');
});

otQuery['whereViewModel'] = new WhereViewModel('ot', function() {
    this.whereClauseView([]);
    this.whereClauseSubmit([]);
    this.whereClauseEdit([]);
    this.selectedORClauseIndex("-1");
    $('#ot-where').val('');
});

otQuery['filterViewModel'] = new FilterViewModel('ot', function() {
    this.filterClauseSubmit([]);
    this.filterClauseSubmit("");
    $('#ot-filter').val('');
});

function loadObjectLogs() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    initObjectTypes();
    initOTView('ot');
    ko.applyBindings(queries.ot.queryViewModel, document.getElementById('ot-query'));
    $('#ot-select-obj-id').select2('val', '');

    initWidgetBoxes();
    currTab = 'query_log_object';
};

function initOTView(queryPrefix) {
    var query = queries[queryPrefix],
        defaultToTime = new Date(),
        defaultFromTime = new Date(defaultToTime.getTime() - 600000);
    $('#' + queryPrefix + '-query').html($('#' + queryPrefix + "-query-template").html());
    validateDate('ot');

    $("#ot-query-form").validate({
        errorClass: 'jqInvalid',
        rules: {
            select: "required",
            checkValidDate: true
        },
        messages: {
            select: {
                required: '<i class="icon-warning-sign"></i> Select Required'
            },
            objectId: {
                required: '<i class="icon-warning-sign"></i> Object Id Required'
            }
        },
        errorPlacement: function(label, element) {
            label.insertAfter(element.parent());
        }
    });

    query.fromTime = createNewDTPicker(queryPrefix, queryPrefix + '-from-time', showFromTime, onSelectFromDate, defaultFromTime);
    query.toTime = createNewDTPicker(queryPrefix, queryPrefix + '-to-time', showToTime, onSelectToDate, defaultToTime);
    query.selectTemplate = $('#' + queryPrefix + '-select-popup-template').html();
};

function setOTValidValues(tableName, resetValues) {
    var viewModels = [queries.ot.whereViewModel, queries.ot.filterViewModel];
    queries.ot.queryViewModel.objectIds([]);
    setObjectIdValues('/api/admin/object-ids/' + tableName, tableName, [queries.ot.queryViewModel], 'objectIds');
    setValidLevelValues('/api/admin/table/values/' + tableName + '/Level', 'levels', queries.ot.queryViewModel);
    setColumnValues('/api/admin/table/schema/' + tableName, 'selectFields', [queries.ot.whereViewModel], 'columns');
    setColumnValues('/api/admin/table/schema/' + tableName, 'selectFields', [queries.ot.filterViewModel], 'columns', null, true, [
        {"name":'ObjectLog', "value":'ObjectLog'},
        {"name":'SystemLog', "value":'SystemLog'}
    ]);
    setValidValues('/api/admin/table/values/' + tableName + '/ModuleId', 'ModuleId', viewModels);
    setValidValues('/api/admin/table/values/' + tableName + '/Source', 'Source', viewModels);
    if (resetValues) {
        queries.ot.whereViewModel.whereClauseView([]);
        $('#ot-where').attr('value', '');
        $('#ot-select-obj-id').select2('val', '');
    }
};

function initObjectIdValues(url, tableName, viewModels, viewModelKey) {
    var timeRange = getTimeRange("ot");
    url += "?fromTimeUTC=" + timeRange.fromTime + "&toTimeUTC=" + timeRange.toTime;
    $.ajax({
        url:url,
        dataType:"json",
        success:function (response) {
            var validValueDS = formatObjectIds(response, tableName);
            if (viewModelKey != null) {
                for (var j = 0; j < viewModels.length; j++) {
                    viewModels[j][viewModelKey](validValueDS);
                }
            }
        }
    });
}

function setObjectIdValues(url, tableName, viewModels, viewModelKey) {
    for (var j = 0; j < viewModels.length; j++) {
        viewModels[j][viewModelKey]([]);
    }
    initObjectIdValues(url, tableName, viewModels, viewModelKey);
};

function formatObjectIds(response, tableName) {
    var objectIdArray = response['data'],
        results = [], objId;
    if (objectIdArray.length != 0) {
        for (var i = 0; i < objectIdArray.length; i++) {
            objId = objectIdArray[i]['ObjectId'];
            results.push({"name":objId, "value":objId});
        }
    } else {
        results.push({"name":"No object id available in selected time-range.", "value":""});
    }
    results.sort(objValueComparator);
    return results;
};

function openOTSelect() {
    queries.ot.selectTemplate = otSelectPopupTemplate(getOTSelectFieldsOptions());
    openSelect('ot', 430);
};

function addOTSelect() {
    addSelect('ot');
};

function runOTQuery() {
    var reqQueryString = $('#ot-query-form').serialize(),
        queryPrefix = 'ot',
        options = {
            elementId:'ot-results',
            timeOut:90000, pageSize:50,
            export:true, btnId:'ot-query-submit'
        }, table, select;
    if ($("#" + queryPrefix + "-query-form").valid()) {
    	collapseWidget('#ot-query-widget');
        table = $("#ot-query-form select[name='objectType']").val();
        select = $("#ot-query-form input[name='select']").val();
        reqQueryString = setUTCTime('ot', reqQueryString);
        reqQueryString += '&table=' + table + '&async=false' + '&tableType=OBJECT';
        if (select == null || select == '') {
            select = 'ObjectLog,SystemLog';
        }
        reqQueryString.engQueryStr = getEngQueryStr(reqQueryString);
        loadOTResults(options, reqQueryString, parseStringToArray(select, ','));
    }
};

function loadOTSources() {
    var element = $('#ot-select-obj-type'),
        selectedValue = $(element).val();
    if(selectedValue) {
        setOTValidValues(selectedValue, true);
    }
};
//Object Traces Query - End

//Flow Queue - Begin
function loadLogQueryQueue() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    initLogQueueView();
    initWidgetBoxes();
};

function initLogQueueView() {
    var options = {elementId:'lqq-results', queueType:'lqq', timeOut:60000, gridHeight:530, pageSize:6},
        intervalId;
    $("#lqq-container").show();
    loadQueryQueue(options);
};
//Flow Queue - End
