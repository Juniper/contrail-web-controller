/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var statQueryObj = new statQueryObj(),
    statQueryQueueObj = new statQueryQueueObj();

var qeTemplate = $("#stat-template").html(),
    statSelectPopupTemplate = contrail.getTemplate4Id('stat-select-popup-template'),
    statQueryTemplate = contrail.getTemplate4Id('stat-query-template');

function setStatValidValues(tableName, queryPrefix) {
    var viewModels = [queries[queryPrefix].whereViewModel, queries[queryPrefix].filterViewModel];
    setSelectValues('/api/admin/table/schema/' + tableName, 'fields', [queries[queryPrefix].selectViewModel], 'columns', [], function() {
        populateStatSelectPopupTemplate(queryPrefix);
    });
    setColumnValues('/api/admin/table/schema/' + tableName, 'selectFields', [queries[queryPrefix].whereViewModel, queries[queryPrefix].filterViewModel], 'columns', null, true);
    setValidValues('/api/admin/table/values/' + tableName + '/name', 'name', viewModels);
    setValidValues('/api/admin/table/values/' + tableName + '/Source', 'Source', viewModels);
    //setColumnValues('/api/admin/table/schema/' + tableName, 'fields', [queries[queryPrefix].filterViewModel], 'columns', null, "all");
    //TODO: Create a cache and get the values from that cache
};

function populateStatQueryForm(queryJSON, tg, tgUnit, queryPrefix, reRunTimeRange) {
    var selectFields = queryJSON['select_fields'];
    resetTGValues(true, queryPrefix);
    setStatQueryFromValues('/api/admin/tables', 'fromTables', queries['stat'].queryViewModel, queryJSON);
    populateTimeRange(queryPrefix, queryJSON['start_time'], queryJSON['end_time'], reRunTimeRange);
    populateSelect(queryPrefix, selectFields, []);
    populateTimeGranularity(queryPrefix, selectFields, tg, tgUnit);
    if (queryJSON['where'] != null) {
        populateWhere(queryPrefix, queryJSON['where']);
    }
};

function addStatSelect(queryPrefix) {
    var query = queries[queryPrefix],
        selectedFields = $('#' + queryPrefix + '-select-popup-form').serializeArray(),
        selectValue = "", fieldValue, checkedFields = [], checkedFilterFields = [];
    query.selectWindow.modal('hide');
    $.each(selectedFields, function (i, selectedFields) {
        fieldValue = selectedFields.value;
        checkedFields.push(fieldValue);
        selectValue += (i != 0 ? ", " : "") + fieldValue;
        checkedFilterFields.push({"name":fieldValue, "value":fieldValue});
    });
    query.selectViewModel.checkedFields(checkedFields);
    query.filterViewModel.fields(checkedFilterFields);
    $('#' + queryPrefix + '-select').val(selectValue);
    initTimeGranularity(checkedFields, query, queryPrefix);
};

function populateStatSelectPopupTemplate(queryPrefix) {
    var query = queries[queryPrefix],
        fields = query.selectViewModel.fields(),
        data = {queryPrefix: queryPrefix, fields: $.makeArray(fields), modalClass: 'modal-980'};
    // remove the CLASS() fields as they are used internally
    var selectFields = data.fields,
        filteredSelectFields = [];
    $.each(selectFields, function (k, v) {
        if (!(contrail.checkIfExist(v) && (v.value).indexOf('CLASS(') > -1) && !(contrail.checkIfExist(v) && (v.value).indexOf('UUID') > -1) ) {
            filteredSelectFields.push(v);
        }
    });
    data.fields = filteredSelectFields;
    query.selectTemplate = statSelectPopupTemplate(data);
};

function onChangeTGSelect(element, queryPrefix) {
    var selectModel = queries[queryPrefix].selectViewModel,
        checkedFields = selectModel.checkedFields;
    if (element.checked) {
        checkedFields.remove('T');
        checkedFields.push('T=');
        selectModel.isEnabled['T'](false);
    } else {
        selectModel.isEnabled['T'](true);
    }
};

function viewStatQueryResults(dataItem, params) {
    var options = null, queryId = dataItem.queryId,
        queryJSON = dataItem.queryJSON,
        reqQueryObj = {},
        tg = dataItem.tg, tgUnit = dataItem.tgUnit, tgIndex,
        reRun = params['reRun'], timeObj = params['timeObj'],
        reRunQueryObj = params['reRunQueryObj'],
        queryPrefix = params['queryPrefix'],
        selectArray, statQueryGridDisplay, labelStepUnit, columnDisplayArray, query = queries[queryPrefix];
    selectArray = queryJSON['select_fields'];

    if(reRun) {
        queryId = randomUUID();
        reqQueryObj = reRunQueryObj;
        reqQueryObj = setUTCTimeObj(queryPrefix, reqQueryObj, options, timeObj);
    }
    if(typeof(ko.dataFor(document.getElementById(queryPrefix + '-query'))) !== "undefined"){
        ko.cleanNode(document.getElementById(queryPrefix + '-query'));
        ko.cleanNode(document.getElementById(queryPrefix + '-chart'));
    }

    reqQueryObj.queryId = queryId;
    setStatValidValues(params.tableName, queryPrefix);
    initStatQueryView(queryPrefix);
    collapseOtherWidgets(queryPrefix);
    ko.applyBindings(queries[queryPrefix].queryViewModel, document.getElementById(queryPrefix + '-query'));
    initWidget4Id('#' + queryPrefix +'-query-widget');
    if (tg != '' && tgUnit != '' && selectArray.indexOf("T=" + getTGmicrosecs(tg, tgUnit) / 1000) != -1) {
        options = getDefaultOptions(queryPrefix, true);
        selectArray.push('T=');
        labelStepUnit = getLabelStepUnit(tg, tgUnit);
        options.labelStep = labelStepUnit.labelStep;
        options.baseUnit = labelStepUnit.baseUnit;
        options.interval = labelStepUnit.secInterval;
        options.fromTime = queryJSON['start_time'] / 1000;
        options.toTime = queryJSON['end_time'] / 1000;
        options.queryId = queryId;
        tgIndex = selectArray.indexOf("T=" + options.interval);
        selectArray.splice(tgIndex, 1);
    } else {
        options = getDefaultOptions(queryPrefix, false);
    }
    populateStatQueryForm(queryJSON, tg, tgUnit, queryPrefix, timeObj.reRunTimeRange);
    if(query['columnDisplay'][queryJSON.table] !== undefined){
        columnDisplayArray = query['defaultColumnDisplay'].concat(query['columnDisplay'][queryJSON.table]);
    } else{
        columnDisplayArray = query['defaultColumnDisplay'];
    }
    
    reqQueryObj.table = params.tableName;
    if(queries.stat.queryViewModel.isCustomTableVisible()){
        statQueryGridDisplay = getColumnDisplay4Grid(columnDisplayArray, selectArray);
        collapseWidget('#' + queryPrefix + '-query-widget');
        reqQueryObj.table = reqQueryObj.customTable;
        delete reqQueryObj.customTable;
        loadStatResults(options, reqQueryObj, statQueryGridDisplay, statQueryGridDisplay, statChartGridDisplay);
    } else{
        getStatPlotFields(selectArray, reqQueryObj, options, columnDisplayArray, selectArray);
    }
};

function loadSelectedStatChart(element ) {
    var val = element.value,
        selectedFlows = queries.stat.chartViewModel.selectedFlows(),
        selector = "#ts-chart",
        navigatorValues = queries.stat.chartViewModel.navigatorValues(),
        plotFields = queries.stat.chartViewModel.plotFields(),
        options = queries.stat.chartViewModel.options(),
        availableColorIndices = getAvailableColorIndices('stat'),
        index, plotData = [], selectedFlow, flowClassId;
    index = findIndexInStatSelectedFlows(selectedFlows, val);
    if (element.checked) {
        if (selectedFlows.length >= 5) {
            $(element).prop('checked', false);
            showMessagePopup('Alert', 'You can select maximum 5.');
            return;
        } else if (index == -1) {
            selectedFlows.push({flowClassId:val,sumBytes:null, sumPackets:null, r:$(element).data('id'), colorIndex: availableColorIndices[0]});
        }
    } else {
        if (selectedFlows.length == 1) {
            $(element).prop('checked', true);
            showMessagePopup('Alert', 'You must select at least 1.');
            return;
        }
        if (index != -1) {
            selectedFlow = selectedFlows[index];
            flowClassId = selectedFlow['flowClassId'];
            assignColors2FlowClass({"flowClassId":flowClassId, "sumBytes":null, "sumPackets":null, r:$(element).data('id'), colorIndex: availableColorIndices[0]});
            selectedFlows.splice(index, 1);
        }
    }
    createStatChart(selector, queries.stat.chart);
};
function findIndexInStatSelectedFlows(selectedFlows, val) {

    for (var i = 0; i < selectedFlows.length; i++) {
        if (selectedFlows[i]['flowClassId'] == val.toString()) {
            return i;
        }
    }
    return -1;
}

function statQueryObj(){
    this.load = loadStatQueryObj;
    this.destroy = function() {};
}

function statQueryQueueObj() {
    this.load = loadStatQueryQueue;
    this.destroy = function() {};
};

function preRunStatQuery(queryPrefix){
    toggleToGrid('stat');
    var serverCurrentTime = getCurrentTime4MemCPUCharts();
    $.ajax({
        url: '/api/service/networking/web-server-info'
        }).done(function (resultJSON) {
            serverCurrentTime = resultJSON['serverUTCTime'];
        }).always(function() {
            runStatQuery(queryPrefix, serverCurrentTime);
        });
};
function runStatQuery(queryPrefix, serverCurrentTime) {
    var queryFormId = "#" + queryPrefix +"-query-form",
        query = queries[queryPrefix];
    if ($(queryFormId).valid()) {
        var reqQueryObj = $(queryFormId).serializeObject(),
            select = $(queryFormId + " input[name='select']").val(),
            showChartToggle = (select.indexOf('T=') != -1) ? true : false,
            options = getDefaultOptions(queryPrefix, showChartToggle),
            queryId, selectArray, columnDisplayArray, labelStepUnit, tg, tgUnit;

        collapseWidget('#' + queryPrefix + '-query-widget');
        queryId = randomUUID();
        options['serverCurrentTime'] = serverCurrentTime;
        options.queryId = queryId;
        reqQueryObj = setUTCTimeObj(queryPrefix, reqQueryObj, options);
        reqQueryObj.queryId = queryId;
        reqQueryObj.async = true;
        selectArray = parseStringToArray(select, ',');
        selectArray = selectArray.concat(query['defaultColumns']);
        if(query['columnDisplay'][reqQueryObj.table] !== undefined){
            columnDisplayArray = query['defaultColumnDisplay'].concat(query['columnDisplay'][reqQueryObj.table]);
        } else {
            columnDisplayArray = query['defaultColumnDisplay'];
        }
        // need group fields here
        if (selectArray.indexOf('T=') != -1) {
            tg = $('#' + queryPrefix + '-tg-value').val();
            tgUnit = $('#' + queryPrefix + '-tg-units').val();
            labelStepUnit = getLabelStepUnit(tg, tgUnit);
            options.labelStep = labelStepUnit.labelStep;
            options.baseUnit = labelStepUnit.baseUnit;
            options.interval = labelStepUnit.secInterval;
        }
        if(queries.stat.queryViewModel.isCustomTableVisible()){
            statQueryGridDisplay = getColumnDisplay4Grid(columnDisplayArray, selectArray);
            collapseWidget('#' + queryPrefix + '-query-widget');
            reqQueryObj.table = reqQueryObj.customTable;
            delete reqQueryObj.customTable;
            loadStatResults(options, reqQueryObj, statQueryGridDisplay, statQueryGridDisplay);
        } else{
            getStatPlotFields(selectArray, reqQueryObj, options, columnDisplayArray, selectArray);
        }
    }
};

function getDefaultOptions(queryPrefix, showChartToggle) {
    return {
        elementId:queryPrefix + '-results', gridHeight:480, timeOut:120000,
        pageSize:100, queryPrefix:queryPrefix, export:true, showChartToggle:showChartToggle,
        labelStep:1, baseUnit:'mins', fromTime:0, toTime:0, interval:0,
        btnId:queryPrefix + '-query-submit'
    };
};

function initStatQueryView(queryPrefix) {
    var query = queries[queryPrefix],
        defaultToTime = new Date(),
        defaultFromTime = new Date(defaultToTime.getTime() - 600000);

    $('#' + queryPrefix + '-query').html(statQueryTemplate({queryPrefix:queryPrefix, title: queries[queryPrefix]['title']}));
    validateDate(queryPrefix);

    $("#" + queryPrefix + "-query-form").validate({
        errorClass: 'jqInvalid',
        rules: {
            select: "required",
            checkValidDate: true
        },
        messages: {
            select: {
                required: '<i class="icon-warning-sign"></i> Select Required'
            }
        },
        errorPlacement: function(label, element) {
            label.insertAfter(element.parent());
        }
    });

    query.fromTime = createNewDTPicker(queryPrefix, queryPrefix + '-from-time', showFromTime, onSelectFromDate, defaultFromTime);
    query.toTime = createNewDTPicker(queryPrefix, queryPrefix + '-to-time', showToTime, onSelectToDate, defaultToTime);
};

function getStatPlotFields(selectFields, reqQueryObj, options, columnDisplayArray, selectArray) {
    var fields = [],
        tableName = reqQueryObj.table,
        url = '/api/admin/table/schema/' + tableName,
        plotFields = [],
        groupFields = [],
        Xaxis = [];
    $.ajax({
        url     : url,
        dataType: "json",
        success : function (response) {
            var result = response;
            if (result.type != "STAT"){
                return [];
            }
            result = result.columns;
            for(var i=0; i<result.length; i++){
                if (result[i].name == "T"){
                    Xaxis.push(result[i].name);
                } else if (result[i].name == "T="){
                    Xaxis.push(result[i].name);
                } else if (result[i].datatype == "int" || result[i].datatype == "long" || result[i].datatype == "double"){
                    plotFields.push(result[i].name);
                } else if (result[i].index){
                    if(plotFields.indexOf(result[i].name) == -1){
                        groupFields.push(result[i].name);
                    }
                }
            }
            // Intersect the plotFields with the selectArray so that plotFields will contain only the 'selected fields'
            plotFields = intesectArrays(selectArray, plotFields);
            groupFields = intesectArrays(selectArray, groupFields);
            // Update the plotfields to contain only aggregate fields such as SUM(), AVG(), COUNT() etc
            plotFields = filterPlotFieldsByAggregateFields(plotFields);
            plotFields.reverse();
            statQuery['chartViewModel'].plotFields(plotFields);
            statQuery['chartViewModel'].Xaxis(Xaxis);
            statQuery['chartViewModel'].groupFields(groupFields);
            reqQueryObj.engQueryStr = getEngQueryStr(reqQueryObj);
            reqQueryObj.plotFields = queries.stat.chartViewModel.plotFields();
            reqQueryObj.groupFields = queries.stat.chartViewModel.groupFields();
            reqQueryObj.Xaxis = queries.stat.chartViewModel.Xaxis();
            statQueryGridDisplay = getColumnDisplay4Grid(columnDisplayArray, selectArray);
            var chartSelectArray = selectArray.filter(getFieldsForChartGrid);
            statChartGridDisplay = getColumnDisplay4Grid(columnDisplayArray, chartSelectArray);
            loadStatResults(options, reqQueryObj, statQueryGridDisplay, statQueryGridDisplay, statChartGridDisplay);
        }
    });
}

function intesectArrays(selectArray, plotFields){
    var intersected = [];
    $.each(selectArray, function(key, value){
        $.each(plotFields, function(k, v){
            if(selectArray[key] == plotFields[k]){
                intersected.push(plotFields[k]);
            }
        });
    });
    return intersected;
};

function filterPlotFieldsByAggregateFields(plotFields){
    var filteredPlotFields = [];
    $.each(plotFields, function(key, value){
        if(plotFields[key].indexOf('COUNT(') > -1){
            filteredPlotFields.push(plotFields[key]);
        } else if(plotFields[key].indexOf('SUM(') > -1){
            filteredPlotFields.push(plotFields[key]);
        }
    });
    return filteredPlotFields;
};

function getFieldsForChartGrid (element) {
    if (element.indexOf('UUID') > -1) {
        return false;
    } else if (element.indexOf('SUM(') > -1) {
        return false;
    } else if (element.indexOf('COUNT(') > -1) {
        return false;
    } else if (element.indexOf('T=') > -1) {
        return false;
    } else {
        return true;
    }
};

//Stat Query - Begin
var statQuery = queries['stat'];

statQuery['columnDisplay']  = {
    "StatTable.AnalyticsCpuState.cpu_info" : [
        {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", format:"{0:n0}", groupable:false}},

        {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:150, name:"Virtual Memory", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', width:150, name:"MIN (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', width:150, name:"MAX (Virtual Memory)", format:"{0:n0}", groupable:false}},

        {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:120, name:"CPU Share", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:150, name:"SUM (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', width:150, name:"MIN (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', width:150, name:"MAX (CPU Share)", format:"{0:n0}", groupable:false}},

        {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:150, name:"Instance Id", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}}

    ],
    "StatTable.ConfigCpuState.cpu_info" : [
        {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:150, name:"Virtual Memory", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', width:150, name:"MIN (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', width:150, name:"MAX (Virtual Memory)", format:"{0:n0}", groupable:false}},

        {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:150, name:"CPU Share", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:150, name:"SUM (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', width:150, name:"MIN (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', width:150, name:"MAX (CPU Share)", format:"{0:n0}", groupable:false}},

        {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:150, name:"Instance Id", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}}

    ],
    "StatTable.ControlCpuState.cpu_info" : [
        {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:120, name:"Virtual Memory", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', width:150, name:"MIN (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', width:150, name:"MAX (Virtual Memory)", format:"{0:n0}", groupable:false}},

        {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:120, name:"CPU Share", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:120, name:"SUM (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', width:120, name:"MIN (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', width:120, name:"MAX (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:120, name:"Instance Id", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}}

    ],
    "StatTable.PRouterEntry.ifStats" : [
        {select:"COUNT(ifStats)", display:{id:'COUNT(ifStats)', field:'COUNT(Stats)', width:120, name:"Count (Intf Stats)", format:"{0:n0}", groupable:false}},
        {select:"ifStats.ifInUcastPkts", display:{id:'ifStats.ifInUcastPkts', field:'ifStats.ifInUcastPkts', width:120, name:"In Unicast Pkts", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifInUcastPkts)", display:{id:'SUM(ifStats.ifInUcastPkts)', field:'SUM(ifStats.ifInUcastPkts)', width:160, name:"SUM (In Unicast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifInUcastPkts)", display:{id:'MAX(ifStats.ifInUcastPkts)', field:'MAX(ifStats.ifInUcastPkts)', width:160, name:"MAX (In Unicast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifInUcastPkts)", display:{id:'MIN(ifStats.ifInUcastPkts)', field:'MIN(ifStats.ifInUcastPkts)', width:160, name:"MIN (In Unicast Pkts)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifInMulticastPkts", display:{id:'ifStats.ifInMulticastPkts', field:'ifStats.ifInMulticastPkts', width:120, name:"In Multicast Pkts", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifInMulticastPkts)", display:{id:'SUM(ifStats.ifInMulticastPkts)', field:'SUM(ifStats.ifInMulticastPkts)', width:160, name:"SUM (In Unicast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifInMulticastPkts)", display:{id:'MAX(ifStats.ifInMulticastPkts)', field:'MAX(ifStats.ifInMulticastPkts)', width:160, name:"MAX (In Unicast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifInMulticastPkts)", display:{id:'MIN(ifStats.ifInMulticastPkts)', field:'MIN(ifStats.ifInMulticastPkts)', width:160, name:"MIN (In Unicast Pkts)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifInBroadcastPkts", display:{id:'ifStats.ifInBroadcastPkts', field:'ifStats.ifInBroadcastPkts', width:120, name:"In Broadcast Pkts", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifInBroadcastPkts)", display:{id:'SUM(ifStats.ifInBroadcastPkts)', field:'SUM(ifStats.ifInBroadcastPkts)', width:160, name:"SUM (In Broadcast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifInBroadcastPkts)", display:{id:'MAX(ifStats.ifInBroadcastPkts)', field:'MAX(ifStats.ifInBroadcastPkts)', width:160, name:"MAX (In Broadcast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifInBroadcastPkts)", display:{id:'MIN(ifStats.ifInBroadcastPkts)', field:'MIN(ifStats.ifInBroadcastPkts)', width:160, name:"MIN (In Broadcast Pkts)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifInDiscards", display:{id:'ifStats.ifInDiscards', field:'ifStats.ifInDiscards', width:120, name:"Intf In Discards", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifInDiscards)", display:{id:'SUM(ifStats.ifInDiscards)', field:'SUM(ifStats.ifInDiscards)', width:160, name:"SUM (Intf In Discards)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifInDiscards)", display:{id:'MAX(ifStats.ifInDiscards)', field:'MAX(ifStats.ifInDiscards)', width:160, name:"MAX (Intf In Discards)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifInDiscards)", display:{id:'MIN(ifStats.ifInDiscards)', field:'MIN(ifStats.ifInDiscards)', width:160, name:"MIN (Intf In Discards)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifInErrors", display:{id:'ifStats.ifInErrors', field:'ifStats.ifInErrors', width:120, name:"Intf In Errors", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifInErrors)", display:{id:'SUM(ifStats.ifInErrors)', field:'SUM(ifStats.ifInErrors)', width:160, name:"SUM (Intf In Errors)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifInErrors)", display:{id:'MAX(ifStats.ifInErrors)', field:'MAX(ifStats.ifInErrors)', width:160, name:"MAX (Intf In Errors)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifInErrors)", display:{id:'MIN(ifStats.ifInErrors)', field:'MIN(ifStats.ifInErrors)', width:160, name:"MIN (Intf In Errors)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifOutUcastPkts", display:{id:'ifStats.ifOutUcastPkts', field:'ifStats.ifOutUcastPkts', width:120, name:"Out Unicast Pkts", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifOutUcastPkts)", display:{id:'SUM(ifStats.ifOutUcastPkts)', field:'SUM(ifStats.ifOutUcastPkts)', width:160, name:"SUM (Out Unicast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifOutUcastPkts)", display:{id:'MAX(ifStats.ifOutUcastPkts)', field:'MAX(ifStats.ifOutUcastPkts)', width:160, name:"MAX (Out Unicast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifOutUcastPkts)", display:{id:'MIN(ifStats.ifOutUcastPkts)', field:'MIN(ifStats.ifOutUcastPkts)', width:160, name:"MIN (Out Unicast Pkts)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifOutMulticastPkts", display:{id:'ifStats.ifOutMulticastPkts', field:'ifStats.ifOutMulticastPkts', width:120, name:"Out Multicast Pkts", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifOutMulticastPkts)", display:{id:'SUM(ifStats.ifOutMulticastPkts)', field:'SUM(ifStats.ifOutMulticastPkts)', width:160, name:"SUM (Out Multicast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifOutMulticastPkts)", display:{id:'MAX(ifStats.ifOutMulticastPkts)', field:'MAX(ifStats.ifOutMulticastPkts)', width:160, name:"MAX (Out Multicast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifOutMulticastPkts)", display:{id:'MIN(ifStats.ifOutMulticastPkts)', field:'MIN(ifStats.ifOutMulticastPkts)', width:160, name:"MIN (Out Multicast Pkts)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifOutBroadcastPkts", display:{id:'ifStats.ifOutBroadcastPkts', field:'ifStats.ifOutBroadcastPkts', width:120, name:"Out Broadcast Pkts", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifOutBroadcastPkts)", display:{id:'SUM(ifStats.ifOutBroadcastPkts)', field:'SUM(ifStats.ifOutBroadcastPkts)', width:160, name:"SUM (Out Broadcast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifOutBroadcastPkts)", display:{id:'MAX(ifStats.ifOutBroadcastPkts)', field:'MAX(ifStats.ifOutBroadcastPkts)', width:160, name:"MAX (Out Broadcast Pkts)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifOutBroadcastPkts)", display:{id:'MIN(ifStats.ifOutBroadcastPkts)', field:'MIN(ifStats.ifOutBroadcastPkts)', width:160, name:"MIN (Out Broadcast Pkts)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifOutDiscards", display:{id:'ifStats.ifOutDiscards', field:'ifStats.ifOutDiscards', width:120, name:"Intf Out Discards", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifOutDiscards)", display:{id:'SUM(ifStats.ifOutDiscards)', field:'SUM(ifStats.ifOutDiscards)', width:160, name:"SUM (Intf Out Discards)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifOutDiscards)", display:{id:'MAX(ifStats.ifOutDiscards)', field:'MAX(ifStats.ifOutDiscards)', width:160, name:"MAX (Intf Out Discards)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifOutDiscards)", display:{id:'MIN(ifStats.ifOutDiscards)', field:'MIN(ifStats.ifOutDiscards)', width:160, name:"MIN (Intf Out Discards)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifOutErrors", display:{id:'ifStats.ifOutErrors', field:'ifStats.ifOutErrors', width:120, name:"Intf Out Errors", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifOutErrors)", display:{id:'SUM(ifStats.ifOutErrors)', field:'SUM(ifStats.ifOutErrors)', width:160, name:"SUM (Intf Out Errors)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifOutErrors)", display:{id:'MAX(ifStats.ifOutErrors)', field:'MAX(ifStats.ifOutErrors)', width:160, name:"MAX (Intf Out Errors)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifOutErrors)", display:{id:'MIN(ifStats.ifOutErrors)', field:'MIN(ifStats.ifOutErrors)', width:160, name:"MIN (Intf Out Errors)", format:"{0:n0}", groupable:false}},

        {select:"ifStats.ifIndex", display:{id:'ifStats.ifIndex', field:'ifStats.ifIndex', width:120, name:"Intf Index", format:"{0:n0}", groupable:false}},
        {select:"SUM(ifStats.ifIndex)", display:{id:'SUM(ifStats.ifIndex)', field:'SUM(ifStats.ifIndex)', width:160, name:"SUM (Intf Index)", format:"{0:n0}", groupable:false}},
        {select:"MAX(ifStats.ifIndex)", display:{id:'MAX(ifStats.ifIndex)', field:'MAX(ifStats.ifIndex)', width:160, name:"MAX (Intf Index)", format:"{0:n0}", groupable:false}},
        {select:"MIN(ifStats.ifIndex)", display:{id:'MIN(ifStats.ifIndex)', field:'MIN(ifStats.ifIndex)', width:160, name:"MIN (Intf Index)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.ComputeCpuState.cpu_info" : [
        {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", format:"{0:n0}", groupable:false}},

        {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:160, name:"Virtual Memory", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:160, name:"SUM (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', width:160, name:"MAX (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', width:160, name:"MIN (Virtual Memory)", format:"{0:n0}", groupable:false}},

        {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:160, name:"CPU Share", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:160, name:"SUM (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', width:160, name:"MAX (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', width:160, name:"MIN (CPU Share)", format:"{0:n0}", groupable:false}},


        {select:"cpu_info.used_sys_mem", display:{id:'cpu_info.used_sys_mem', field:'cpu_info.used_sys_mem', width:160, name:"CPU Sys Memory Used", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.used_sys_mem)", display:{id:'SUM(cpu_info.used_sys_mem)', field:'SUM(cpu_info.used_sys_mem)', width:160, name:"SUM (CPU Sys Memory Used)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.used_sys_mem)", display:{id:'MAX(cpu_info.used_sys_mem)', field:'MAX(cpu_info.used_sys_mem)', width:160, name:"MAX (CPU Sys Memory Used)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.used_sys_mem)", display:{id:'MIN(cpu_info.used_sys_mem)', field:'MIN(cpu_info.used_sys_mem)', width:160, name:"MIN (CPU Sys Memory Used)", format:"{0:n0}", groupable:false}},

        {select:"cpu_info.one_min_cpuload", display:{id:'cpu_info.one_min_cpuload', field:'cpu_info.one_min_cpuload', width:160, name:"CPU 1 Min Load", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.one_min_cpuload)", display:{id:'SUM(cpu_info.one_min_cpuload)', field:'SUM(cpu_info.one_min_cpuload)', width:160, name:"SUM (CPU 1 Min Load)", format:"{0:n0}", groupable:false}},
        {select:"MAX(cpu_info.one_min_cpuload)", display:{id:'MAX(cpu_info.one_min_cpuload)', field:'MAX(cpu_info.one_min_cpuload)', width:160, name:"MAX (CPU 1 Min Load)", format:"{0:n0}", groupable:false}},
        {select:"MIN(cpu_info.one_min_cpuload)", display:{id:'MIN(cpu_info.one_min_cpuload)', field:'MIN(cpu_info.one_min_cpuload)', width:160, name:"MIN (CPU 1 Min Load)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.ComputeStoragePool.info_stats" : [
        {select:"COUNT(info_stats)", display:{id:'COUNT(info_stats)', field:'COUNT(info_stats)', width:120, name:"Count (Info Stats)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.reads", display:{id:'info_stats.reads', field:'info_stats.reads', width:150, name:"Reads", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.reads)", display:{id:'SUM(info_stats.reads)', field:'SUM(info_stats.reads)', width:150, name:"SUM (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.reads)", display:{id:'MAX(info_stats.reads)', field:'MAX(info_stats.reads)', width:150, name:"MAX (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.reads)", display:{id:'MIN(info_stats.reads)', field:'MIN(info_stats.reads)', width:150, name:"MIN (Reads)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.writes", display:{id:'info_stats.writes', field:'info_stats.writes', width:150, name:"Writes", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.writes)", display:{id:'SUM(info_stats.writes)', field:'SUM(info_stats.writes)', width:150, name:"SUM (writes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.writes)", display:{id:'MAX(info_stats.writes)', field:'MAX(info_stats.writes)', width:150, name:"MAX (writes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.writes)", display:{id:'MIN(info_stats.writes)', field:'MIN(info_stats.writes)', width:150, name:"MIN (writes)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.read_kbytes", display:{id:'info_stats.read_kbytes', field:'info_stats.read_kbytes', width:150, name:"Read kbytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.read_kbytes)", display:{id:'SUM(info_stats.read_kbytes)', field:'SUM(info_stats.read_kbytes)', width:150, name:"SUM (Read kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.read_kbytes)", display:{id:'MAX(info_stats.read_kbytes)', field:'MAX(info_stats.read_kbytes)', width:150, name:"MAX (Read kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.read_kbytes)", display:{id:'MIN(info_stats.read_kbytes)', field:'MIN(info_stats.read_kbytes)', width:150, name:"MIN (Read kbytes)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.write_kbytes", display:{id:'info_stats.write_kbytes', field:'info_stats.write_kbytes', width:150, name:"Write kbytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.write_kbytes)", display:{id:'SUM(info_stats.write_kbytes)', field:'SUM(info_stats.write_kbytes)', width:150, name:"SUM (Write kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.write_kbytes)", display:{id:'MAX(info_stats.write_kbytes)', field:'MAX(info_stats.write_kbytes)', width:150, name:"MAX (Write kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.write_kbytes)", display:{id:'MIN(info_stats.write_kbytes)', field:'MIN(info_stats.write_kbytes)', width:150, name:"MIN (Write kbytes)", format:"{0:n0}", groupable:false}}

    ],
    "StatTable.ComputeStorageOsd.info_stats" : [
        {select:"COUNT(info_stats)", display:{id:'COUNT(info_stats)', field:'COUNT(info_stats)', width:120, name:"Count (Info Stats)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.reads", display:{id:'info_stats.reads', field:'info_stats.reads', width:150, name:"Reads", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.reads)", display:{id:'SUM(info_stats.reads)', field:'SUM(info_stats.reads)', width:150, name:"SUM (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.reads)", display:{id:'MAX(info_stats.reads)', field:'MAX(info_stats.reads)', width:150, name:"MAX (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.reads)", display:{id:'MIN(info_stats.reads)', field:'MIN(info_stats.reads)', width:150, name:"MIN (Reads)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.writes", display:{id:'info_stats.writes', field:'info_stats.writes', width:150, name:"Writes", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.writes)", display:{id:'SUM(info_stats.writes)', field:'SUM(info_stats.writes)', width:150, name:"SUM (Writes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.writes)", display:{id:'MAX(info_stats.writes)', field:'MAX(info_stats.writes)', width:150, name:"MAX (Writes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.writes)", display:{id:'MIN(info_stats.writes)', field:'MIN(info_stats.writes)', width:150, name:"MIN (Writes)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.read_kbytes", display:{id:'info_stats.read_kbytes', field:'info_stats.read_kbytes', width:150, name:"Read kbytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.read_kbytes)", display:{id:'SUM(info_stats.read_kbytes)', field:'SUM(info_stats.read_kbytes)', width:150, name:"SUM (Read kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.read_kbytes)", display:{id:'MAX(info_stats.read_kbytes)', field:'MAX(info_stats.read_kbytes)', width:150, name:"MAX (Read kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.read_kbytes)", display:{id:'MIN(info_stats.read_kbytes)', field:'MIN(info_stats.read_kbytes)', width:150, name:"MIN (Read kbytes)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.write_kbytes", display:{id:'info_stats.write_kbytes', field:'info_stats.write_kbytes', width:150, name:"Write kbytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.write_kbytes)", display:{id:'SUM(info_stats.write_kbytes)', field:'SUM(info_stats.write_kbytes)', width:150, name:"SUM (Write kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.write_kbytes)", display:{id:'MAX(info_stats.write_kbytes)', field:'MAX(info_stats.write_kbytes)', width:150, name:"MAX (Write kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.write_kbytes)", display:{id:'MIN(info_stats.write_kbytes)', field:'MIN(info_stats.write_kbytes)', width:150, name:"MIN (Write kbytes)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.op_r_latency", display:{id:'info_stats.op_r_latency', field:'info_stats.op_r_latency', width:150, name:"Read Latency", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.op_r_latency)", display:{id:'SUM(info_stats.op_r_latency)', field:'SUM(info_stats.op_r_latency)', width:150, name:"SUM (Read Latency)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.op_r_latency)", display:{id:'MAX(info_stats.op_r_latency)', field:'MAX(info_stats.op_r_latency)', width:150, name:"MAX (Read Latency)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.op_r_latency)", display:{id:'MIN(info_stats.op_r_latency)', field:'MIN(info_stats.op_r_latency)', width:150, name:"MIN (Read Latency)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.op_w_latency", display:{id:'info_stats.op_w_latency', field:'info_stats.op_w_latency', width:150, name:"Read Latency", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.op_w_latency)", display:{id:'SUM(info_stats.op_w_latency)', field:'SUM(info_stats.op_w_latency)', width:150, name:"SUM (Read Latency)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.op_w_latency)", display:{id:'MAX(info_stats.op_w_latency)', field:'MAX(info_stats.op_w_latency)', width:150, name:"MAX (Read Latency)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.op_w_latency)", display:{id:'MIN(info_stats.op_w_latency)', field:'MIN(info_stats.op_w_latency)', width:150, name:"MIN (Read Latency)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.ComputeStorageDisk.info_stats" : [
        {select:"COUNT(info_stats)", display:{id:'COUNT(info_stats)', field:'COUNT(info_stats)', width:120, name:"Count (Info Stats)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.reads", display:{id:'info_stats.reads', field:'info_stats.reads', width:150, name:"Reads", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.reads)", display:{id:'SUM(info_stats.reads)', field:'SUM(info_stats.reads)', width:150, name:"SUM (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.reads)", display:{id:'MAX(info_stats.reads)', field:'MAX(info_stats.reads)', width:150, name:"MAX (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.reads)", display:{id:'MIN(info_stats.reads)', field:'MIN(info_stats.reads)', width:150, name:"MIN (Reads)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.writes", display:{id:'info_stats.writes', field:'info_stats.writes', width:150, name:"Writes", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.writes)", display:{id:'SUM(info_stats.writes)', field:'SUM(info_stats.writes)', width:150, name:"SUM (Writes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.writes)", display:{id:'MAX(info_stats.writes)', field:'MAX(info_stats.writes)', width:150, name:"MAX (Writes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.writes)", display:{id:'MIN(info_stats.writes)', field:'MIN(info_stats.writes)', width:150, name:"MIN (Writes)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.read_kbytes", display:{id:'info_stats.read_kbytes', field:'info_stats.read_kbytes', width:150, name:"Read kbytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.read_kbytes)", display:{id:'SUM(info_stats.read_kbytes)', field:'SUM(info_stats.read_kbytes)', width:150, name:"SUM (Read kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.read_kbytes)", display:{id:'MAX(info_stats.read_kbytes)', field:'MAX(info_stats.read_kbytes)', width:150, name:"MAX (Read kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.read_kbytes)", display:{id:'MIN(info_stats.read_kbytes)', field:'MIN(info_stats.read_kbytes)', width:150, name:"MIN (Read kbytes)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.write_kbytes", display:{id:'info_stats.write_kbytes', field:'info_stats.write_kbytes', width:150, name:"Write kbytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.write_kbytes)", display:{id:'SUM(info_stats.write_kbytes)', field:'SUM(info_stats.write_kbytes)', width:150, name:"SUM (Write kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.write_kbytes)", display:{id:'MAX(info_stats.write_kbytes)', field:'MAX(info_stats.write_kbytes)', width:150, name:"MAX (Write kbytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.write_kbytes)", display:{id:'MIN(info_stats.write_kbytes)', field:'MIN(info_stats.write_kbytes)', width:150, name:"MIN (Write kbytes)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.iops", display:{id:'info_stats.iops', field:'info_stats.iops', width:150, name:"IOPS", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.iops)", display:{id:'SUM(info_stats.iops)', field:'SUM(info_stats.iops)', width:150, name:"SUM (IOPS)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.iops)", display:{id:'MAX(info_stats.iops)', field:'MAX(info_stats.iops)', width:150, name:"MAX (IOPS)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.iops)", display:{id:'MIN(info_stats.iops)', field:'MIN(info_stats.iops)', width:150, name:"MIN (IOPS)", format:"{0:n0}", groupable:false}},

        {select:"info_stats.bw", display:{id:'info_stats.bw', field:'info_stats.bw', width:150, name:"Bandwidth", format:"{0:n0}", groupable:false}},
        {select:"SUM(info_stats.bw)", display:{id:'SUM(info_stats.bw)', field:'SUM(info_stats.bw)', width:150, name:"SUM (Bandwidth)", format:"{0:n0}", groupable:false}},
        {select:"MAX(info_stats.bw)", display:{id:'MAX(info_stats.bw)', field:'MAX(info_stats.bw)', width:150, name:"MAX (Bandwidth)", format:"{0:n0}", groupable:false}},
        {select:"MIN(info_stats.bw)", display:{id:'MIN(info_stats.bw)', field:'MIN(info_stats.bw)', width:150, name:"MIN (Bandwidth)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.SMIpmiInfo.sensor_stats" : [
        {select:"COUNT(sensor_stats)", display:{id:'COUNT(sensor_stats)', field:'COUNT(sensor_stats)', width:120, name:"Count (Sensor Stats)", format:"{0:n0}", groupable:false}},
        {select:"sensor_stats.sensor", display:{id:'sensor_stats.sensor', field:'sensor_stats.sensor', width:150, name:"Sensor", groupable:false}},
        {select:"sensor_stats.status", display:{id:'sensor_stats.status', field:'sensor_stats.status', width:150, name:"Sensor Status", groupable:false}},

        {select:"sensor_stats.reading", display:{id:'sensor_stats.reading', field:'sensor_stats.reading', width:150, name:"Reading", format:"{0:n0}", groupable:false}},
        {select:"SUM(sensor_stats.reading)", display:{id:'SUM(sensor_stats.reading)', field:'SUM(sensor_stats.reading)', width:150, name:"SUM (Reading)", format:"{0:n0}", groupable:false}},
        {select:"MAX(sensor_stats.reading)", display:{id:'MAX(sensor_stats.reading)', field:'MAX(sensor_stats.reading)', width:150, name:"MAX (Reading)", format:"{0:n0}", groupable:false}},
        {select:"MIN(sensor_stats.reading)", display:{id:'MIN(sensor_stats.reading)', field:'MIN(sensor_stats.reading)', width:150, name:"MIN (Reading)", format:"{0:n0}", groupable:false}},

        {select:"sensor_stats.unit", display:{id:'sensor_stats.unit', field:'sensor_stats.unit', width:150, name:"Unit", groupable:false}},
        {select:"sensor_stats.sensor_type", display:{id:'sensor_stats.sensor_type', field:'sensor_stats.sensor_type', width:150, name:"Sensor Type", groupable:false}},
        {select:"disk_usage.disk_name", display:{id:'disk_usage.disk_name', field:'disk_usage.disk_name', width:150, name:"Disk Name", groupable:false}},

        {select:"disk_usage.read_MB", display:{id:'disk_usage.read_MB', field:'disk_usage.read_MB', width:150, name:"Read MB", format:"{0:n0}", groupable:false}},
        {select:"SUM(disk_usage.read_MB)", display:{id:'SUM(disk_usage.read_MB)', field:'SUM(disk_usage.read_MB)', width:150, name:"SUM (Read MB)", format:"{0:n0}", groupable:false}},
        {select:"MAX(disk_usage.read_MB)", display:{id:'MAX(disk_usage.read_MB)', field:'MAX(disk_usage.read_MB)', width:150, name:"MAX (Read MB)", format:"{0:n0}", groupable:false}},
        {select:"MIN(disk_usage.read_MB)", display:{id:'MIN(disk_usage.read_MB)', field:'MIN(disk_usage.read_MB)', width:150, name:"MIN (Read MB)", format:"{0:n0}", groupable:false}},

        {select:"disk_usage.write_MB", display:{id:'disk_usage.write_MB', field:'disk_usage.write_MB', width:150, name:"Read MB", format:"{0:n0}", groupable:false}},
        {select:"SUM(disk_usage.write_MB)", display:{id:'SUM(disk_usage.write_MB)', field:'SUM(disk_usage.write_MB)', width:150, name:"SUM (Write MB)", format:"{0:n0}", groupable:false}},
        {select:"MAX(disk_usage.write_MB)", display:{id:'MAX(disk_usage.write_MB)', field:'MAX(disk_usage.write_MB)', width:150, name:"MAX (Write MB)", format:"{0:n0}", groupable:false}},
        {select:"MIN(disk_usage.write_MB)", display:{id:'MIN(disk_usage.write_MB)', field:'MIN(disk_usage.write_MB)', width:150, name:"MIN (Write MB)", format:"{0:n0}", groupable:false}},

    ],
    "StatTable.SandeshMessageStat.msg_info" : [
        {select:"COUNT(msg_info)", display:{id:'COUNT(msg_info)', field:'COUNT(msg_info)', width:150, name:"Count (Msg Info)", format:"{0:n0}", groupable:false}},
        {select:"msg_info.type", display:{id:'msg_info.type', field:'msg_info.type', width:210, name:"Message Type", groupable:false}},
        {select:"msg_info.level", display:{id:'msg_info.level', field:'msg_info.level', width:210, name:"Message Level", groupable:false}},

        {select:"msg_info.messages", display:{id:'msg_info.messages', field:'msg_info.messages', width:150, name:"Messages", format:"{0:n0}", groupable:false}},
        {select:"SUM(msg_info.messages)", display:{id:'SUM(msg_info.messages)', field:'SUM(msg_info.messages)', width:150, name:"SUM (Messages)", format:"{0:n0}", groupable:false}},
        {select:"MIN(msg_info.messages)", display:{id:'MIN(msg_info.messages)', field:'MIN(msg_info.messages)', width:150, name:"MIN (Messages)", format:"{0:n0}", groupable:false}},
        {select:"MAX(msg_info.messages)", display:{id:'MAX(msg_info.messages)', field:'MAX(msg_info.messages)', width:150, name:"MAX (Messages)", format:"{0:n0}", groupable:false}},

        {select:"msg_info.bytes", display:{id:'msg_info.bytes', field:'msg_info.messages', width:150, name:"Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(msg_info.bytes)", display:{id:'SUM(msg_info.bytes)', field:'SUM(msg_info.bytes)', width:150, name:"SUM (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(msg_info.bytes)", display:{id:'MIN(msg_info.bytes)', field:'MIN(msg_info.bytes)', width:150, name:"MIN (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(msg_info.bytes)", display:{id:'MAX(msg_info.bytes)', field:'MAX(msg_info.bytes)', width:150, name:"MAX (Bytes)", format:"{0:n0}", groupable:false}}

    ],
    "StatTable.GeneratorDbStats.table_info" : [
        {select:"COUNT(table_info)", display:{id:'COUNT(table_info)', field:'COUNT(table_info)', width:120, name:"Count (Table Info)", format:"{0:n0}", groupable:false}},
        {select:"table_info.table_name", display:{id:'table_info.table_name', field:'table_info.table_name', width:150, name:"Table Name", groupable:false}},

        {select:"table_info.reads", display:{id:'table_info.reads', field:'table_info.reads', width:150, name:"Reads", format:"{0:n0}", groupable:false}},
        {select:"SUM(table_info.reads)", display:{id:'SUM(table_info.reads)', field:'SUM(table_info.reads)', width:150, name:"SUM (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MIN(table_info.reads)", display:{id:'MIN(table_info.reads)', field:'MIN(table_info.reads)', width:150, name:"MIN (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MAX(table_info.reads)", display:{id:'MAX(table_info.reads)', field:'MAX(table_info.reads)', width:150, name:"MAX (Reads)", format:"{0:n0}", groupable:false}},

        {select:"table_info.read_fails", display:{id:'table_info.read_fails', field:'table_info.read_fails', width:150, name:"Read Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(table_info.read_fails)", display:{id:'SUM(table_info.read_fails)', field:'SUM(table_info.read_fails)', width:150, name:"SUM (Read Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(table_info.read_fails)", display:{id:'MIN(table_info.read_fails)', field:'MIN(table_info.read_fails)', width:150, name:"MIN (Read Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(table_info.read_fails)", display:{id:'MAX(table_info.read_fails)', field:'MAX(table_info.read_fails)', width:150, name:"MAX (Read Fails)", format:"{0:n0}", groupable:false}},

        {select:"table_info.writes", display:{id:'table_info.writes', field:'table_info.writes', width:150, name:"Writes", format:"{0:n0}", groupable:false}},
        {select:"SUM(table_info.writes)", display:{id:'SUM(table_info.writes)', field:'SUM(table_info.writes)', width:150, name:"SUM (Writes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(table_info.writes)", display:{id:'MIN(table_info.writes)', field:'MIN(table_info.writes)', width:150, name:"MIN (Writes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(table_info.writes)", display:{id:'MAX(table_info.writes)', field:'MAX(table_info.writes)', width:150, name:"MAX (Writes)", format:"{0:n0}", groupable:false}},

        {select:"table_info.write_fails", display:{id:'table_info.write_fails', field:'table_info.write_fails', width:150, name:"Write Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(table_info.write_fails)", display:{id:'SUM(table_info.write_fails)', field:'SUM(table_info.write_fails)', width:150, name:"SUM (Write Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(table_info.write_fails)", display:{id:'MIN(table_info.write_fails)', field:'MIN(table_info.write_fails)', width:150, name:"MIN (Write Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(table_info.write_fails)", display:{id:'MAX(table_info.write_fails)', field:'MAX(table_info.write_fails)', width:150, name:"MAX (Write Fails)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.GeneratorDbStats.statistics_table_info" : [
        {select:"COUNT(statistics_table_info)", display:{id:'COUNT(statistics_table_info)', field:'COUNT(statistics_table_info)', width:120, name:"Count (Table Info)", format:"{0:n0}", groupable:false}},
        {select:"statistics_table_info.table_name", display:{id:'statistics_table_info.table_name', field:'statistics_table_info.table_name', width:150, name:"Table Name", groupable:false}},

        {select:"statistics_table_info.reads", display:{id:'statistics_table_info.reads', field:'statistics_table_info.reads', width:150, name:"Reads", format:"{0:n0}", groupable:false}},
        {select:"SUM(statistics_table_info.reads)", display:{id:'SUM(statistics_table_info.reads)', field:'SUM(statistics_table_info.reads)', width:150, name:"SUM (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MIN(statistics_table_info.reads)", display:{id:'MIN(statistics_table_info.reads)', field:'MIN(statistics_table_info.reads)', width:150, name:"MIN (Reads)", format:"{0:n0}", groupable:false}},
        {select:"MAX(statistics_table_info.reads)", display:{id:'MAX(statistics_table_info.reads)', field:'MAX(statistics_table_info.reads)', width:150, name:"MAX (Reads)", format:"{0:n0}", groupable:false}},

        {select:"statistics_table_info.read_fails", display:{id:'statistics_table_info.read_fails', field:'statistics_table_info.read_fails', width:150, name:"Read Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(statistics_table_info.read_fails)", display:{id:'SUM(statistics_table_info.read_fails)', field:'SUM(statistics_table_info.read_fails)', width:150, name:"SUM (Read Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(statistics_table_info.read_fails)", display:{id:'MIN(statistics_table_info.read_fails)', field:'MIN(statistics_table_info.read_fails)', width:150, name:"MIN (Read Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(statistics_table_info.read_fails)", display:{id:'MAX(statistics_table_info.read_fails)', field:'MAX(statistics_table_info.read_fails)', width:150, name:"MAX (Read Fails)", format:"{0:n0}", groupable:false}},

        {select:"statistics_table_info.writes", display:{id:'statistics_table_info.writes', field:'statistics_table_info.writes', width:150, name:"Writes", format:"{0:n0}", groupable:false}},
        {select:"SUM(statistics_table_info.writes)", display:{id:'SUM(statistics_table_info.writes)', field:'SUM(statistics_table_info.writes)', width:150, name:"SUM (Writes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(statistics_table_info.writes)", display:{id:'MIN(statistics_table_info.writes)', field:'MIN(statistics_table_info.writes)', width:150, name:"MIN (Writes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(statistics_table_info.writes)", display:{id:'MAX(statistics_table_info.writes)', field:'MAX(statistics_table_info.writes)', width:150, name:"MAX (Writes)", format:"{0:n0}", groupable:false}},

        {select:"statistics_table_info.write_fails", display:{id:'statistics_table_info.write_fails', field:'statistics_table_info.write_fails', width:150, name:"Write Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(statistics_table_info.write_fails)", display:{id:'SUM(statistics_table_info.write_fails)', field:'SUM(statistics_table_info.write_fails)', width:150, name:"SUM (Write Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(statistics_table_info.write_fails)", display:{id:'MIN(statistics_table_info.write_fails)', field:'MIN(statistics_table_info.write_fails)', width:150, name:"MIN (Write Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(statistics_table_info.write_fails)", display:{id:'MAX(statistics_table_info.write_fails)', field:'MAX(statistics_table_info.write_fails)', width:150, name:"MAX (Write Fails)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.GeneratorDbStats.errors" : [
        {select:"COUNT(errors)", display:{id:'COUNT(errors)', field:'COUNT(errors)', width:120, name:"Count (Errors)", format:"{0:n0}", groupable:false}},

        {select:"errors.write_tablespace_fails", display:{id:'errors.write_tablespace_fails', field:'errors.write_tablespace_fails', width:160, name:"Write Tablespace Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(errors.write_tablespace_fails)", display:{id:'SUM(errors.write_tablespace_fails)', field:'SUM(errors.write_tablespace_fails)', width:160, name:"SUM (Write Tablespace Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(errors.write_tablespace_fails_fails)", display:{id:'MIN(errors.write_tablespace_fails)', field:'MIN(errors.write_tablespace_fails)', width:160, name:"MIN (Write Tablespace Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(errors.write_tablespace_fails)", display:{id:'MAX(errors.write_tablespace_fails)', field:'MAX(errors.write_tablespace_fails)', width:160, name:"MAX (Write Tablespace Fails)", format:"{0:n0}", groupable:false}},

        {select:"errors.read_tablespace_fails", display:{id:'errors.read_tablespace_fails', field:'errors.read_tablespace_fails', width:160, name:"Read Tablespace Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(errors.read_tablespace_fails)", display:{id:'SUM(errors.read_tablespace_fails)', field:'SUM(errors.read_tablespace_fails)', width:160, name:"SUM (Read Tablespace Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(errors.read_tablespace_fails_fails)", display:{id:'MIN(errors.read_tablespace_fails)', field:'MIN(errors.read_tablespace_fails)', width:160, name:"MIN (Read Tablespace Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(errors.read_tablespace_fails)", display:{id:'MAX(errors.read_tablespace_fails)', field:'MAX(errors.read_tablespace_fails)', width:160, name:"MAX (Read Tablespace Fails)", format:"{0:n0}", groupable:false}},

        {select:"errors.write_table_fails", display:{id:'errors.write_table_fails', field:'errors.write_table_fails', width:160, name:"Write Table Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(errors.write_table_fails)", display:{id:'SUM(errors.write_table_fails)', field:'SUM(errors.write_table_fails)', width:160, name:"SUM (Write Table Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(errors.write_table_fails_fails)", display:{id:'MIN(errors.write_table_fails)', field:'MIN(errors.write_table_fails)', width:160, name:"MIN (Write Table Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(errors.write_table_fails)", display:{id:'MAX(errors.write_table_fails)', field:'MAX(errors.write_table_fails)', width:160, name:"MAX (Write Table Fails)", format:"{0:n0}", groupable:false}},

        {select:"errors.read_table_fails", display:{id:'errors.read_table_fails', field:'errors.read_table_fails', width:160, name:"Read Table Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(errors.read_table_fails)", display:{id:'SUM(errors.read_table_fails)', field:'SUM(errors.read_table_fails)', width:160, name:"SUM (Read Table Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(errors.read_table_fails_fails)", display:{id:'MIN(errors.read_table_fails)', field:'MIN(errors.read_table_fails)', width:160, name:"MIN (Read Table Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(errors.read_table_fails)", display:{id:'MAX(errors.read_table_fails)', field:'MAX(errors.read_table_fails)', width:160, name:"MAX (Read Table Fails)", format:"{0:n0}", groupable:false}},

        {select:"errors.write_column_fails", display:{id:'errors.write_column_fails', field:'errors.write_column_fails', width:160, name:"Write Column Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(errors.write_column_fails)", display:{id:'SUM(errors.write_column_fails)', field:'SUM(errors.write_column_fails)', width:160, name:"SUM (Write Column Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(errors.write_column_fails_fails)", display:{id:'MIN(errors.write_column_fails)', field:'MIN(errors.write_column_fails)', width:160, name:"MIN (Write Column Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(errors.write_column_fails)", display:{id:'MAX(errors.write_column_fails)', field:'MAX(errors.write_column_fails)', width:160, name:"MAX (Write Column Fails)", format:"{0:n0}", groupable:false}},

        {select:"errors.write_batch_column_fails", display:{id:'errors.write_batch_column_fails', field:'errors.write_batch_column_fails', width:160, name:"Write Column Batch Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(errors.write_batch_column_fails)", display:{id:'SUM(errors.write_batch_column_fails)', field:'SUM(errors.write_batch_column_fails)', width:160, name:"SUM (Write Column Batch Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(errors.write_batch_column_fails_fails)", display:{id:'MIN(errors.write_batch_column_fails)', field:'MIN(errors.write_batch_column_fails)', width:160, name:"MIN (Write Column Batch Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(errors.write_batch_column_fails)", display:{id:'MAX(errors.write_batch_column_fails)', field:'MAX(errors.write_batch_column_fails)', width:160, name:"MAX (Write Column Batch Fails)", format:"{0:n0}", groupable:false}},

        {select:"errors.read_column_fails", display:{id:'errors.read_column_fails', field:'errors.read_column_fails', width:160, name:"Read Column Fails", format:"{0:n0}", groupable:false}},
        {select:"SUM(errors.read_column_fails)", display:{id:'SUM(errors.read_column_fails)', field:'SUM(errors.read_column_fails)', width:160, name:"SUM (Read Column Fails)", format:"{0:n0}", groupable:false}},
        {select:"MIN(errors.read_column_fails_fails)", display:{id:'MIN(errors.read_column_fails)', field:'MIN(errors.read_column_fails)', width:160, name:"MIN (Read Column Fails)", format:"{0:n0}", groupable:false}},
        {select:"MAX(errors.read_column_fails)", display:{id:'MAX(errors.read_column_fails)', field:'MAX(errors.read_column_fails)', width:160, name:"MAX (Read Column Fails)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.FieldNames.fields" : [
        {select:"COUNT(fields)", display:{id:'COUNT(fields)', field:'COUNT(fields)', width:120, name:"Count (Field String)", format:"{0:n0}", groupable:false}},
        {select:"fields.value", display:{id:'fields.value', field:'fields.value', width:150, name:"Value", groupable:false}}
    ],
    "StatTable.FieldNames.fieldi" : [
        {select:"COUNT(fieldi)", display:{id:'COUNT(fieldi)', field:'COUNT(fieldi)', width:120, name:"Count (Field Integer)", format:"{0:n0}", groupable:false}},
        {select:"fieldi.value", display:{id:'fieldi.value', field:'fieldi.value', width:150, name:"Value", groupable:false}},
        {select:"SUM(fieldi.value)", display:{id:'SUM(fieldi.value)', field:'SUM(fieldi.value)', width:150, name:"SUM (Value)", format:"{0:n0}", groupable:false}},
        {select:"MIN(fieldi.value)", display:{id:'MIN(fieldi.value)', field:'MIN(fieldi.value)', width:150, name:"MIN (Value)", format:"{0:n0}", groupable:false}},
        {select:"MAX(fieldi.value)", display:{id:'MAX(fieldi.value)', field:'MAX(fieldi.value)', width:150, name:"MAX (Value)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.QueryPerfInfo.query_stats" : [
        {select:"COUNT(query_stats)", display:{id:'COUNT(query_stats)', field:'COUNT(query_stats)', width:120, name:"Count (Query Stats)", format:"{0:n0}", groupable:false}},
        {select:"table", display:{id:'table', field:'table', width:150, name:"Table", groupable:false}},

        {select:"query_stats.time", display:{id:'query_stats.time', field:'query_stats.time', width:150, name:"Query Time", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.time)", display:{id:'SUM(query_stats.time)', field:'SUM(query_stats.time)', width:150, name:"SUM (Time Taken)", format:"{0:n0}", groupable:false}},
        {select:"MIN(query_stats.time)", display:{id:'MIN(query_stats.time)', field:'MIN(query_stats.time)', width:150, name:"MIN (Time Taken)", format:"{0:n0}", groupable:false}},
        {select:"MAX(query_stats.time)", display:{id:'MAX(query_stats.time)', field:'MAX(query_stats.time)', width:150, name:"MAX (Time Taken)", format:"{0:n0}", groupable:false}},

        {select:"query_stats.rows", display:{id:'query_stats.rows', field:'query_stats.rows', width:120, name:"Rows Returned", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.rows)", display:{id:'SUM(query_stats.rows)', field:'SUM(query_stats.rows)', width:150, name:"SUM (Rows Returned)", format:"{0:n0}", groupable:false}},
        {select:"MIN(query_stats.rows)", display:{id:'MIN(query_stats.rows)', field:'MIN(query_stats.rows)', width:150, name:"MIN (Rows Returned)", format:"{0:n0}", groupable:false}},
        {select:"MAX(query_stats.rows)", display:{id:'MAX(query_stats.rows)', field:'MAX(query_stats.rows)', width:150, name:"MAX (Rows Returned)", format:"{0:n0}", groupable:false}},

        {select:"query_stats.qid", display:{id:'query_stats.qid', field:'query_stats.qid', width:280, name:"Query Id", format:"{0:n0}", groupable:false}},
        {select:"query_stats.where", display:{id:'query_stats.where', field:'query_stats.where', width:300, name:"Where", groupable:false}},
        {select:"query_stats.select", display:{id:'query_stats.select', field:'query_stats.select', width:300, name:"Select", groupable:false}},
        {select:"query_stats.post", display:{id:'query_stats.post', field:'query_stats.post', width:300, name:"Filter", groupable:false}},

        {select:"query_stats.time_span", display:{id:'query_stats.time_span', field:'query_stats.time_span', width:150, name:"Time Span", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.time_span)", display:{id:'SUM(query_stats.time_span)', field:'SUM(query_stats.time_span)', width:150, name:"SUM (Time Span)", format:"{0:n0}", groupable:false}},
        {select:"MIN(query_stats.time_span)", display:{id:'MIN(query_stats.time_span)', field:'MIN(query_stats.time_span)', width:150, name:"MIN (Time Span)", format:"{0:n0}", groupable:false}},
        {select:"MAX(query_stats.time_span)", display:{id:'MAX(query_stats.time_span)', field:'MAX(query_stats.time_span)', width:150, name:"MAX (Time Span)", format:"{0:n0}", groupable:false}},

        {select:"query_stats.chunks", display:{id:'query_stats.chunks', field:'query_stats.chunks', width:150, name:"Chunks", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.chunks)", display:{id:'SUM(query_stats.chunks)', field:'SUM(query_stats.chunks)', width:150, name:"SUM (Chunks)", format:"{0:n0}", groupable:false}},
        {select:"MIN(query_stats.chunks)", display:{id:'MIN(query_stats.chunks)', field:'MIN(query_stats.chunks)', width:150, name:"MIN (Chunks)", format:"{0:n0}", groupable:false}},
        {select:"MAX(query_stats.chunks)", display:{id:'MAX(query_stats.chunks)', field:'MAX(query_stats.chunks)', width:150, name:"MAX (Chunks)", format:"{0:n0}", groupable:false}},

        {select:"query_stats.chunk_where_time", display:{id:'query_stats.chunk_where_time', field:'query_stats.chunk_where_time', width:130, name:"Chunk Where Time", format:"{0:n0}", groupable:false}},
        {select:"query_stats.chunk_select_time", display:{id:'query_stats.chunk_select_time', field:'query_stats.chunk_select_time', width:130, name:"Chunk Select Time", format:"{0:n0}", groupable:false}},
        {select:"query_stats.chunk_postproc_time", display:{id:'query_stats.chunk_postproc_time', field:'query_stats.chunk_postproc_time', width:140, name:"Chunk Postproc Time", format:"{0:n0}", groupable:false}},
        {select:"query_stats.chunk_merge_time", display:{id:'query_stats.chunk_merge_time', field:'query_stats.chunk_merge_time', width:130, name:"Chunk Merge Time", format:"{0:n0}", groupable:false}},
        {select:"query_stats.final_merge_time", display:{id:'query_stats.final_merge_time', field:'query_stats.final_merge_time', width:130, name:"Final Merge Time", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.final_merge_time)", display:{id:'SUM(query_stats.final_merge_time)', field:'SUM(query_stats.final_merge_time)', width:150, name:"SUM (Final Merge Time)", format:"{0:n0}", groupable:false}},
        {select:"MIN(query_stats.final_merge_time)", display:{id:'MIN(query_stats.final_merge_time)', field:'MIN(query_stats.final_merge_time)', width:150, name:"MIN (Final Merge Time)", format:"{0:n0}", groupable:false}},
        {select:"MAX(query_stats.final_merge_time)", display:{id:'MAX(query_stats.final_merge_time)', field:'MAX(query_stats.final_merge_time)', width:150, name:"MAX (Final Merge Time)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.UveVirtualNetworkAgent.vn_stats" : [
        {select:"COUNT(vn_stats)", display:{id:'COUNT(vn_stats)', field:'COUNT(vn_stats)', width:120, name:"Count (VN Stats)", format:"{0:n0}", groupable:false}},
        {select:"vn_stats.other_vn", display:{id:'vn_stats.other_vn', field:'vn_stats.other_vn', width:250, name:"Other VN", groupable:false}},
        {select:"vn_stats.vrouter", display:{id:'vn_stats.vrouter', field:'vn_stats.vrouter', width:120, title:"vRouter", groupable:false}},

        {select:"vn_stats.in_tpkts", display:{id:'vn_stats.in_tpkts', field:'vn_stats.in_tpkts', width:120, name:"In Packets", format:"{0:n0}", groupable:false}},
        {select:"SUM(vn_stats.in_tpkts)", display:{id:'SUM(vn_stats.in_tpkts)', field:'SUM(vn_stats.in_tpkts)', width:120, name:"SUM (In Packets)", format:"{0:n0}", groupable:false}},
        {select:"MIN(vn_stats.in_tpkts)", display:{id:'MIN(vn_stats.in_tpkts)', field:'MIN(vn_stats.in_tpkts)', width:120, name:"MIN (In Packets)", format:"{0:n0}", groupable:false}},
        {select:"MAX(vn_stats.in_tpkts)", display:{id:'MAX(vn_stats.in_tpkts)', field:'MAX(vn_stats.in_tpkts)', width:120, name:"MAX (In Packets)", format:"{0:n0}", groupable:false}},

        {select:"vn_stats.in_bytes", display:{id:'vn_stats.in_bytes', field:'vn_stats.in_bytes', width:120, name:"In Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(vn_stats.in_bytes)", display:{id:'SUM(vn_stats.in_bytes)', field:'SUM(vn_stats.in_bytes)', width:120, name:"SUM (In Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(vn_stats.in_bytes)", display:{id:'MIN(vn_stats.in_bytes)', field:'MIN(vn_stats.in_bytes)', width:120, name:"MIN (In Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(vn_stats.in_bytes)", display:{id:'MAX(vn_stats.in_bytes)', field:'MAX(vn_stats.in_bytes)', width:120, name:"MAX (In Bytes)", format:"{0:n0}", groupable:false}},


        {select:"vn_stats.out_tpkts", display:{id:'vn_stats.out_tpkts', field:'vn_stats.out_tpkts', width:120, name:"Out Packets", format:"{0:n0}", groupable:false}},
        {select:"SUM(vn_stats.out_tpkts)", display:{id:'SUM(vn_stats.out_tpkts)', field:'SUM(vn_stats.out_tpkts)', width:120, name:"SUM (Out Packets)", format:"{0:n0}", groupable:false}},
        {select:"MIN(vn_stats.out_tpkts)", display:{id:'MIN(vn_stats.out_tpkts)', field:'MIN(vn_stats.out_tpkts)', width:120, name:"MIN (Out Packets)", format:"{0:n0}", groupable:false}},
        {select:"MAX(vn_stats.out_tpkts)", display:{id:'MAX(vn_stats.out_tpkts)', field:'MAX(vn_stats.out_tpkts)', width:120, name:"MAX (Out Packets)", format:"{0:n0}", groupable:false}},

        {select:"vn_stats.out_bytes", display:{id:'vn_stats.out_bytes', field:'vn_stats.out_bytes', width:120, name:"Out Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(vn_stats.out_bytes)", display:{id:'SUM(vn_stats.out_bytes)', field:'SUM(vn_stats.out_bytes)', width:120, name:"SUM (Out Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(vn_stats.out_bytes)", display:{id:'MIN(vn_stats.out_bytes)', field:'MIN(vn_stats.out_bytes)', width:120, name:"MIN (Out Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(vn_stats.out_bytes)", display:{id:'MAX(vn_stats.out_bytes)', field:'MAX(vn_stats.out_bytes)', width:120, name:"MAX (Out Bytes)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.DatabasePurgeInfo.stats" : [
        {select:"COUNT(stats)", display:{id:'COUNT(stats)', field:'COUNT(stats)', width:120, name:"Count (Stats)", format:"{0:n0}", groupable:false}},
        {select:"stats.purge_id", display:{id:'stats.purge_id', field:'stats.purge_id', width:280, name:"Purge Id", format:"{0:n0}", groupable:false}},
        {select:"stats.purge_status", display:{id:'stats.purge_status', field:'stats.purge_status', width:280, name:"Purge Status", groupable:false}},

        {select:"stats.request_time", display:{id:'stats.request_time', field:'stats.request_time', width:280, name:"Request Time", format:"{0:n0}", groupable:false}},
        {select:"SUM(stats.request_time)", display:{id:'SUM(stats.request_time)', field:'SUM(stats.request_time)', width:280, name:"SUM (Request Time)", format:"{0:n0}", groupable:false}},
        {select:"MIN(stats.request_time)", display:{id:'MIN(stats.request_time)', field:'MIN(stats.request_time)', width:280, name:"MIN (Request Time)", format:"{0:n0}", groupable:false}},
        {select:"MAX(stats.request_time)", display:{id:'MAX(stats.request_time)', field:'MAX(stats.request_time)', width:280, name:"MAX (Request Time)", format:"{0:n0}", groupable:false}},

        {select:"stats.rows_deleted", display:{id:'stats.rows_deleted', field:'stats.rows_deleted', width:150, name:"Rows Deleted", format:"{0:n0}", groupable:false}},
        {select:"SUM(stats.rows_deleted)", display:{id:'SUM(stats.rows_deleted)', field:'SUM(stats.rows_deleted)', width:150, name:"SUM (Rows Deleted)", format:"{0:n0}", groupable:false}},
        {select:"MIN(stats.rows_deleted)", display:{id:'MIN(stats.rows_deleted)', field:'MIN(stats.rows_deleted)', width:150, name:"MIN (Rows Deleted)", format:"{0:n0}", groupable:false}},
        {select:"MAX(stats.rows_deleted)", display:{id:'MAX(stats.rows_deleted)', field:'MAX(stats.rows_deleted)', width:150, name:"MAX (Rows Deleted)", format:"{0:n0}", groupable:false}},

        {select:"stats.duration", display:{id:'stats.duration', field:'stats.duration', width:280, name:"Time Duration", format:"{0:n0}", groupable:false}},
        {select:"SUM(stats.duration)", display:{id:'SUM(stats.duration)', field:'SUM(stats.duration)', width:280, name:"SUM (Time Duration)", format:"{0:n0}", groupable:false}},
        {select:"MIN(stats.duration)", display:{id:'MIN(stats.duration)', field:'MIN(stats.duration)', width:280, name:"MIN (Time Duration)", format:"{0:n0}", groupable:false}},
        {select:"MAX(stats.duration)", display:{id:'MAX(stats.duration)', field:'MAX(stats.duration)', width:280, name:"MAX (Time Duration)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.DatabaseUsageInfo.database_usage_stats" : [
        {select:"COUNT(database_usage_stats)", display:{id:'COUNT(database_usage_stats)', field:'COUNT(database_usage_stats)', width:120, name:"Count (DB Usage Stats)", format:"{0:n0}", groupable:false}},

        {select:"database_usage_stats.disk_space_used_1k", display:{id:'database_usage_stats.disk_space_used_1k', field:'database_usage_stats.disk_space_used_1k', width:160, name:"Disk Space Used 1k", format:"{0:n0}", groupable:false}},
        {select:"SUM(database_usage_stats.disk_space_used_1k)", display:{id:'SUM(database_usage_stats.disk_space_used_1k)', field:'SUM(database_usage_stats.disk_space_used_1k)', width:160, name:"SUM (Disk Space Used 1k)", format:"{0:n0}", groupable:false}},
        {select:"MIN(database_usage_stats.disk_space_used_1k)", display:{id:'MIN(database_usage_stats.disk_space_used_1k)', field:'MIN(database_usage_stats.disk_space_used_1k)', width:160, name:"MIN (Disk Space Used 1k)", format:"{0:n0}", groupable:false}},
        {select:"MAX(database_usage_stats.disk_space_used_1k)", display:{id:'MAX(database_usage_stats.disk_space_used_1k)', field:'MAX(database_usage_stats.disk_space_used_1k)', width:160, name:"MAX (Disk Space Used 1k)", format:"{0:n0}", groupable:false}},

        {select:"database_usage_stats.disk_space_available_1k", display:{id:'database_usage_stats.disk_space_available_1k', field:'database_usage_stats.disk_space_available_1k', width:160, name:"Disk Space Avail 1k", format:"{0:n0}", groupable:false}},
        {select:"SUM(database_usage_stats.disk_space_available_1k)", display:{id:'SUM(database_usage_stats.disk_space_available_1k)', field:'SUM(database_usage_stats.disk_space_available_1k)', width:160, name:"SUM (Disk Space Avail 1k)", format:"{0:n0}", groupable:false}},
        {select:"MIN(database_usage_stats.disk_space_available_1k)", display:{id:'MIN(database_usage_stats.disk_space_available_1k)', field:'MIN(database_usage_stats.disk_space_available_1k)', width:160, name:"MIN (Disk Space Avail 1k)", format:"{0:n0}", groupable:false}},
        {select:"MAX(database_usage_stats.disk_space_available_1k)", display:{id:'MAX(database_usage_stats.disk_space_available_1k)', field:'MAX(database_usage_stats.disk_space_available_1k)', width:160, name:"MAX (Disk Space Avail 1k)", format:"{0:n0}", groupable:false}},

        {select:"database_usage_stats.analytics_db_size_1k", display:{id:'database_usage_stats.analytics_db_size_1k', field:'database_usage_stats.analytics_db_size_1k', width:160, name:"Analytics DB Size 1k", format:"{0:n0}", groupable:false}},
        {select:"SUM(database_usage_stats.analytics_db_size_1k)", display:{id:'SUM(database_usage_stats.analytics_db_size_1k)', field:'SUM(database_usage_stats.analytics_db_size_1k)', width:160, name:"SUM (Analytics DB Size 1k)", format:"{0:n0}", groupable:false}},
        {select:"MIN(database_usage_stats.analytics_db_size_1k)", display:{id:'MIN(database_usage_stats.analytics_db_size_1k)', field:'MIN(database_usage_stats.analytics_db_size_1k)', width:160, name:"MIN (Analytics DB Size 1k)", format:"{0:n0}", groupable:false}},
        {select:"MAX(database_usage_stats.analytics_db_size_1k)", display:{id:'MAX(database_usage_stats.analytics_db_size_1k)', field:'MAX(database_usage_stats.analytics_db_size_1k)', width:160, name:"MAX (Analytics DB Size 1k)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.ProtobufCollectorStats.tx_socket_stats" : [
        {select:"COUNT(tx_socket_stats)", display:{id:'COUNT(tx_socket_stats)', field:'COUNT(tx_socket_stats)', width:160, name:"Count (Send Socket Stats)", format:"{0:n0}", groupable:false}},
        {select:"tx_socket_stats.average_blocked_duration", display:{id:'tx_socket_stats.average_blocked_duration', field:'tx_socket_stats.average_blocked_duration', width:150, name:"Avg Blocked Duration", groupable:false}},
        {select:"tx_socket_stats.blocked_duration", display:{id:'tx_socket_stats.average_blocked_duration', field:'tx_socket_stats.average_blocked_duration', width:150, name:"Blocked Duration", groupable:false}},

        {select:"tx_socket_stats.bytes", display:{id:'tx_socket_stats.bytes', field:'tx_socket_stats.bytes', width:150, name:"Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(tx_socket_stats.bytes)", display:{id:'SUM(tx_socket_stats.bytes)', field:'SUM(tx_socket_stats.bytes)', width:150, name:"SUM (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(tx_socket_stats.bytes)", display:{id:'MIN(tx_socket_stats.bytes)', field:'MIN(tx_socket_stats.bytes)', width:150, name:"MIN (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(tx_socket_stats.bytes)", display:{id:'MAX(tx_socket_stats.bytes)', field:'MAX(tx_socket_stats.bytes)', width:150, name:"MAX (Bytes)", format:"{0:n0}", groupable:false}},

        {select:"tx_socket_stats.calls", display:{id:'tx_socket_stats.calls', field:'tx_socket_stats.calls', width:150, name:"Calls", format:"{0:n0}", groupable:false}},
        {select:"SUM(tx_socket_stats.calls)", display:{id:'SUM(tx_socket_stats.calls)', field:'SUM(tx_socket_stats.calls)', width:150, name:"SUM (Calls)", format:"{0:n0}", groupable:false}},
        {select:"MIN(tx_socket_stats.calls)", display:{id:'MIN(tx_socket_stats.calls)', field:'MIN(tx_socket_stats.calls)', width:150, name:"MIN (Calls)", format:"{0:n0}", groupable:false}},
        {select:"MAX(tx_socket_stats.calls)", display:{id:'MAX(tx_socket_stats.calls)', field:'MAX(tx_socket_stats.calls)', width:150, name:"MAX (Calls)", format:"{0:n0}", groupable:false}},

        {select:"tx_socket_stats.average_bytes", display:{id:'tx_socket_stats.average_bytes', field:'tx_socket_stats.average_bytes', width:150, name:"Avg Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(tx_socket_stats.average_bytes)", display:{id:'SUM(tx_socket_stats.average_bytes)', field:'SUM(tx_socket_stats.average_bytes)', width:150, name:"SUM (Avg Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(tx_socket_stats.average_bytes)", display:{id:'MIN(tx_socket_stats.average_bytes)', field:'MIN(tx_socket_stats.average_bytes)', width:150, name:"MIN (Avg Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(tx_socket_stats.average_bytes)", display:{id:'MAX(tx_socket_stats.average_bytes)', field:'MAX(tx_socket_stats.average_bytes)', width:150, name:"MAX (Avg Bytes)", format:"{0:n0}", groupable:false}},

        {select:"tx_socket_stats.errors", display:{id:'tx_socket_stats.errors', field:'tx_socket_stats.errors', width:150, name:"Errors", format:"{0:n0}", groupable:false}},
        {select:"SUM(tx_socket_stats.errors)", display:{id:'SUM(tx_socket_stats.errors)', field:'SUM(tx_socket_stats.errors)', width:150, name:"SUM (Errors)", format:"{0:n0}", groupable:false}},
        {select:"MIN(tx_socket_stats.errors)", display:{id:'MIN(tx_socket_stats.errors)', field:'MIN(tx_socket_stats.errors)', width:150, name:"MIN (Errors)", format:"{0:n0}", groupable:false}},
        {select:"MAX(tx_socket_stats.errors)", display:{id:'MAX(tx_socket_stats.errors)', field:'MAX(tx_socket_stats.errors)', width:150, name:"MAX (Errors)", format:"{0:n0}", groupable:false}},

        {select:"tx_socket_stats.blocked_count", display:{id:'tx_socket_stats.blocked_count', field:'tx_socket_stats.blocked_count', width:150, name:"Blocked Count", format:"{0:n0}", groupable:false}},
        {select:"SUM(tx_socket_stats.blocked_count)", display:{id:'SUM(tx_socket_stats.blocked_count)', field:'SUM(tx_socket_stats.blocked_count)', width:150, name:"SUM (Blocked Count)", format:"{0:n0}", groupable:false}},
        {select:"MIN(tx_socket_stats.blocked_count)", display:{id:'MIN(tx_socket_stats.blocked_count)', field:'MIN(tx_socket_stats.blocked_count)', width:150, name:"MIN (Blocked Count)", format:"{0:n0}", groupable:false}},
        {select:"MAX(tx_socket_stats.blocked_count)", display:{id:'MAX(tx_socket_stats.blocked_count)', field:'MAX(tx_socket_stats.blocked_count)', width:150, name:"MAX (Blocked Count)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.ProtobufCollectorStats.rx_socket_stats" : [
        {select:"COUNT(rx_socket_stats)", display:{id:'COUNT(rx_socket_stats)', field:'COUNT(rx_socket_stats)', width:160, name:"Count (Receive Socket Stats)", format:"{0:n0}", groupable:false}},
        {select:"rx_socket_stats.blocked_duration", display:{id:'rx_socket_stats.average_blocked_duration', field:'rx_socket_stats.blocked_duration', width:150, name:"Blocked Duration", groupable:false}},
        {select:"rx_socket_stats.average_blocked_duration", display:{id:'rx_socket_stats.average_blocked_duration', field:'rx_socket_stats.average_blocked_duration', width:160, name:"Avg Blocked Duration", groupable:false}},

        {select:"rx_socket_stats.bytes", display:{id:'rx_socket_stats.bytes', field:'rx_socket_stats.bytes', width:150, name:"Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(rx_socket_stats.bytes)", display:{id:'SUM(rx_socket_stats.bytes)', field:'SUM(rx_socket_stats.bytes)', width:150, name:"SUM (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(rx_socket_stats.bytes)", display:{id:'MIN(rx_socket_stats.bytes)', field:'MIN(rx_socket_stats.bytes)', width:150, name:"MIN (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(rx_socket_stats.bytes)", display:{id:'MAX(rx_socket_stats.bytes)', field:'MAX(rx_socket_stats.bytes)', width:150, name:"MAX (Bytes)", format:"{0:n0}", groupable:false}},

        {select:"rx_socket_stats.calls", display:{id:'rx_socket_stats.calls', field:'rx_socket_stats.calls', width:150, name:"Calls", format:"{0:n0}", groupable:false}},
        {select:"SUM(rx_socket_stats.calls)", display:{id:'SUM(rx_socket_stats.calls)', field:'SUM(rx_socket_stats.calls)', width:150, name:"SUM (Calls)", format:"{0:n0}", groupable:false}},
        {select:"MIN(rx_socket_stats.calls)", display:{id:'MIN(rx_socket_stats.calls)', field:'MIN(rx_socket_stats.calls)', width:150, name:"MIN (Calls)", format:"{0:n0}", groupable:false}},
        {select:"MAX(rx_socket_stats.calls)", display:{id:'MAX(rx_socket_stats.calls)', field:'MAX(rx_socket_stats.calls)', width:150, name:"MAX (Calls)", format:"{0:n0}", groupable:false}},

        {select:"rx_socket_stats.average_bytes", display:{id:'rx_socket_stats.average_bytes', field:'rx_socket_stats.average_bytes', width:150, name:"Avg Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(rx_socket_stats.average_bytes)", display:{id:'SUM(rx_socket_stats.average_bytes)', field:'SUM(rx_socket_stats.average_bytes)', width:150, name:"SUM (Avg Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(rx_socket_stats.average_bytes)", display:{id:'MIN(rx_socket_stats.average_bytes)', field:'MIN(rx_socket_stats.average_bytes)', width:150, name:"MIN (Avg Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(rx_socket_stats.average_bytes)", display:{id:'MAX(rx_socket_stats.average_bytes)', field:'MAX(rx_socket_stats.average_bytes)', width:150, name:"MAX (Avg Bytes)", format:"{0:n0}", groupable:false}},

        {select:"rx_socket_stats.errors", display:{id:'rx_socket_stats.errors', field:'rx_socket_stats.errors', width:150, name:"Errors", format:"{0:n0}", groupable:false}},
        {select:"SUM(rx_socket_stats.errors)", display:{id:'SUM(rx_socket_stats.errors)', field:'SUM(rx_socket_stats.errors)', width:150, name:"SUM (Errors)", format:"{0:n0}", groupable:false}},
        {select:"MIN(rx_socket_stats.errors)", display:{id:'MIN(rx_socket_stats.errors)', field:'MIN(rx_socket_stats.errors)', width:150, name:"MIN (Errors)", format:"{0:n0}", groupable:false}},
        {select:"MAX(rx_socket_stats.errors)", display:{id:'MAX(rx_socket_stats.errors)', field:'MAX(rx_socket_stats.errors)', width:150, name:"MAX (Errors)", format:"{0:n0}", groupable:false}},

        {select:"rx_socket_stats.blocked_count", display:{id:'rx_socket_stats.blocked_count', field:'rx_socket_stats.blocked_count', width:150, name:"Blocked Count", format:"{0:n0}", groupable:false}},
        {select:"SUM(rx_socket_stats.blocked_count)", display:{id:'SUM(rx_socket_stats.blocked_count)', field:'SUM(rx_socket_stats.blocked_count)', width:150, name:"SUM (Blocked Count)", format:"{0:n0}", groupable:false}},
        {select:"MIN(rx_socket_stats.blocked_count)", display:{id:'MIN(rx_socket_stats.blocked_count)', field:'MIN(rx_socket_stats.blocked_count)', width:150, name:"MIN (Blocked Count)", format:"{0:n0}", groupable:false}},
        {select:"MAX(rx_socket_stats.blocked_count)", display:{id:'MAX(rx_socket_stats.blocked_count)', field:'MAX(rx_socket_stats.blocked_count)', width:150, name:"MAX (Blocked Count)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.ProtobufCollectorStats.rx_message_stats" : [
        {select:"COUNT(rx_message_stats)", display:{id:'COUNT(rx_message_stats)', field:'COUNT(rx_message_stats)', width:160, name:"Count (Receive Socket Stats)", format:"{0:n0}", groupable:false}},
        {select:"rx_message_stats.endpoint_name", display:{id:'rx_message_stats.endpoint_name', field:'rx_message_stats.endpoint_name', width:150, name:"Endpoint Name", groupable:false}},
        {select:"rx_message_stats.message_name", display:{id:'rx_message_stats.message_name', field:'rx_message_stats.message_name', width:150, name:"Message Name", groupable:false}},

        {select:"rx_message_stats.messages", display:{id:'rx_message_stats.messages', field:'rx_message_stats.messages', width:150, name:"Messages", format:"{0:n0}", groupable:false}},
        {select:"SUM(rx_message_stats.messages)", display:{id:'SUM(rx_message_stats.messages)', field:'SUM(rx_message_stats.messages)', width:150, name:"SUM (Messages)", format:"{0:n0}", groupable:false}},
        {select:"MIN(rx_message_stats.messages)", display:{id:'MIN(rx_message_stats.messages)', field:'MIN(rx_message_stats.messages)', width:150, name:"MIN (Messages)", format:"{0:n0}", groupable:false}},
        {select:"MAX(rx_message_stats.messages)", display:{id:'MAX(rx_message_stats.messages)', field:'MAX(rx_message_stats.messages)', width:150, name:"MAX (Messages)", format:"{0:n0}", groupable:false}},

        {select:"rx_message_stats.bytes", display:{id:'rx_message_stats.bytes', field:'rx_message_stats.bytes', width:150, name:"Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(rx_message_stats.bytes)", display:{id:'SUM(rx_message_stats.bytes)', field:'SUM(rx_message_stats.bytes)', width:150, name:"SUM (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(rx_message_stats.bytes)", display:{id:'MIN(rx_message_stats.bytes)', field:'MIN(rx_message_stats.bytes)', width:150, name:"MIN (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(rx_message_stats.bytes)", display:{id:'MAX(rx_message_stats.bytes)', field:'MAX(rx_message_stats.bytes)', width:150, name:"MAX (Bytes)", format:"{0:n0}", groupable:false}},

        {select:"rx_message_stats.errors", display:{id:'rx_message_stats.errors', field:'rx_message_stats.errors', width:150, name:"Errors", format:"{0:n0}", groupable:false}},
        {select:"SUM(rx_message_stats.errors)", display:{id:'SUM(rx_message_stats.errors)', field:'SUM(rx_message_stats.errors)', width:150, name:"SUM (Errors)", format:"{0:n0}", groupable:false}},
        {select:"MIN(rx_message_stats.errors)", display:{id:'MIN(rx_message_stats.errors)', field:'MIN(rx_message_stats.errors)', width:150, name:"MIN (Errors)", format:"{0:n0}", groupable:false}},
        {select:"MAX(rx_message_stats.errors)", display:{id:'MAX(rx_message_stats.errors)', field:'MAX(rx_message_stats.errors)', width:150, name:"MAX (Errors)", format:"{0:n0}", groupable:false}},

        {select:"rx_message_stats.last_timestamp", display:{id:'rx_message_stats.last_timestamp', field:'rx_message_stats.last_timestamp', width:150, name:"Last Timestamp", format:"{0:n0}", groupable:false}},
        {select:"SUM(rx_message_stats.last_timestamp)", display:{id:'SUM(rx_message_stats.last_timestamp)', field:'SUM(rx_message_stats.last_timestamp)', width:150, name:"SUM (Last Timestamp)", format:"{0:n0}", groupable:false}},
        {select:"MIN(rx_message_stats.last_timestamp)", display:{id:'MIN(rx_message_stats.last_timestamp)', field:'MIN(rx_message_stats.last_timestamp)', width:150, name:"MIN (Last Timestamp)", format:"{0:n0}", groupable:false}},
        {select:"MAX(rx_message_stats.last_timestamp)", display:{id:'MAX(rx_message_stats.last_timestamp)', field:'MAX(rx_message_stats.last_timestamp)', width:150, name:"MAX (Last Timestamp)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.PFEHeapInfo.heap_info" : [
        {select:"heap_info.name", display:{id:'heap_info.name', field:'heap_info.name', width:150, name:"Heap Info Name", groupable:false}},
        {select:"COUNT(heap_info)", display:{id:'COUNT(heap_info)', field:'COUNT(heap_info)', width:120, name:"Count (Heap Info)", format:"{0:n0}", groupable:false}},

        {select:"heap_info.size", display:{id:'heap_info.size', field:'heap_info.size', width:150, name:"Size", groupable:false}},
        {select:"SUM(heap_info.size)", display:{id:'SUM(heap_info.size)', field:'SUM(heap_info.size)', width:150, name:"SUM (Size)", format:"{0:n0}", groupable:false}},
        {select:"MIN(heap_info.size)", display:{id:'MIN(heap_info.size)', field:'MIN(heap_info.size)', width:150, name:"MIN (Size)", format:"{0:n0}", groupable:false}},
        {select:"MAX(heap_info.size)", display:{id:'MAX(heap_info.size)', field:'MAX(heap_info.size)', width:150, name:"MAX (Size)", format:"{0:n0}", groupable:false}},

        {select:"heap_info.allocated", display:{id:'heap_info.allocated', field:'heap_info.allocated', width:150, name:"Allocated", groupable:false}},
        {select:"MIN(heap_info.allocated)", display:{id:'MIN(heap_info.allocated)', field:'MIN(heap_info.allocated)', width:150, name:"MIN (Allocated)", format:"{0:n0}", groupable:false}},
        {select:"SUM(heap_info.allocated)", display:{id:'SUM(heap_info.allocated)', field:'SUM(heap_info.allocated)', width:150, name:"SUM (Allocated)", format:"{0:n0}", groupable:false}},
        {select:"MAX(heap_info.allocated)", display:{id:'MAX(heap_info.allocated)', field:'MAX(heap_info.allocated)', width:150, name:"MAX (Allocated)", format:"{0:n0}", groupable:false}},

        {select:"heap_info.utilization", display:{id:'heap_info.utilization', field:'heap_info.utilization', width:150, name:"Heap Info Utilization", groupable:false}},
        {select:"SUM(heap_info.utilization)", display:{id:'SUM(heap_info.utilization)', field:'SUM(heap_info.utilization)', width:150, name:"SUM (Utilization)", format:"{0:n0}", groupable:false}},
        {select:"MIN(heap_info.utilization)", display:{id:'MIN(heap_info.utilization)', field:'MIN(heap_info.utilization)', width:150, name:"MIN (Utilization)", format:"{0:n0}", groupable:false}},
        {select:"MAX(heap_info.utilization)", display:{id:'MAX(heap_info.utilization)', field:'MAX(heap_info.utilization)', width:150, name:"MAX (Utilization)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.npu_mem.stats" : [
        {select:"COUNT(stats)", display:{id:'COUNT(stats)', field:'COUNT(stats)', width:120, name:"Count (Stats)", format:"{0:n0}", groupable:false}},
        {select:"stats.pfe_identifier", display:{id:'stats.pfe_identifier', field:'stats.pfe_identifier', width:150, name:"PFE Identifier", groupable:false}},
        {select:"stats.resource_name", display:{id:'stats.resource_name', field:'stats.resource_name', width:150, name:"Resource Name", groupable:false}},

        {select:"stats.size", display:{id:'stats.size', field:'stats.size', width:150, name:"Size", groupable:false}},
        {select:"SUM(stats.size)", display:{id:'SUM(stats.size)', field:'SUM(stats.size)', width:150, name:"SUM (Size)", format:"{0:n0}", groupable:false}},
        {select:"MIN(stats.size)", display:{id:'MIN(stats.size)', field:'MIN(stats.size)', width:150, name:"MIN (Size)", format:"{0:n0}", groupable:false}},
        {select:"MAX(stats.size)", display:{id:'MAX(stats.size)', field:'MAX(stats.size)', width:150, name:"MAX (Size)", format:"{0:n0}", groupable:false}},

        {select:"stats.allocated", display:{id:'stats.allocated', field:'stats.allocated', width:150, name:"Allocated", groupable:false}},
        {select:"SUM(stats.allocated)", display:{id:'SUM(stats.allocated)', field:'SUM(stats.allocated)', width:150, name:"SUM (Allocated)", format:"{0:n0}", groupable:false}},
        {select:"MIN(stats.allocated)", display:{id:'MIN(stats.allocated)', field:'MIN(stats.allocated)', width:150, name:"MIN (Allocated)", format:"{0:n0}", groupable:false}},
        {select:"MAX(stats.allocated)", display:{id:'MAX(stats.allocated)', field:'MAX(stats.allocated)', width:150, name:"MAX (Allocated)", format:"{0:n0}", groupable:false}},

        {select:"stats.utilization", display:{id:'stats.utilization', field:'stats.utilization', width:150, name:"Utilization", groupable:false}},
        {select:"SUM(stats.utilization)", display:{id:'SUM(stats.utilization)', field:'SUM(stats.utilization)', width:150, name:"SUM (Utilization)", format:"{0:n0}", groupable:false}},
        {select:"MIN(stats.utilization)", display:{id:'MIN(stats.utilization)', field:'MIN(stats.utilization)', width:150, name:"MIN (Utilization)", format:"{0:n0}", groupable:false}},
        {select:"MAX(stats.utilization)", display:{id:'MAX(stats.utilization)', field:'MAX(stats.utilization)', width:150, name:"MAX (Utilization)", format:"{0:n0}", groupable:false}},
    ],
    "StatTable.fabric_message.edges" : [
        {select:"COUNT(edges)", display:{id:'COUNT(edges)', field:'COUNT(edges)', width:120, name:"Count (Edges)", format:"{0:n0}", groupable:false}},
        {select:"edges.src_type", display:{id:'edges.src_type', field:'edges.src_type', width:150, name:"Src Type", groupable:false}},
        {select:"edges.src_slot", display:{id:'edges.src_slot', field:'edges.src_slot', width:150, name:"Src Slot", groupable:false}},
        {select:"edges.src_pfe", display:{id:'edges.src_pfe', field:'edges.src_pfe', width:150, name:"Src PFE", groupable:false}},
        {select:"edges.dst_type", display:{id:'edges.dst_type', field:'edges.dst_type', width:150, name:"Dest Type", groupable:false}},
        {select:"edges.dst_slot", display:{id:'edges.dst_slot', field:'edges.dst_slot', width:150, name:"Dest Slot", groupable:false}},
        {select:"edges.dst_pfe", display:{id:'edges.dst_pfe', field:'edges.dst_pfe', width:150, name:"Dest PFE", groupable:false}},
        {select:"edges.class_stats.priority", display:{id:'edges.class_stats.priority', field:'edges.class_stats.priority', width:150, name:"Priority", groupable:false}},

        {select:"edges.class_stats.transmit_counts.packets", display:{id:'edges.class_stats.transmit_counts.packets', field:'edges.class_stats.transmit_counts.packets', width:150, name:"Trans Pkt Cnt", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.packets)", display:{id:'SUM(edges.class_stats.transmit_counts.packets)', field:'SUM(edges.class_stats.transmit_counts.packets)', width:150, name:"SUM (Trans Pkt Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.packets)", display:{id:'MIN(edges.class_stats.transmit_counts.packets)', field:'MIN(edges.class_stats.transmit_counts.packets)', width:150, name:"MIN (Trans Pkt Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.packets)", display:{id:'MAX(edges.class_stats.transmit_counts.packets)', field:'MAX(edges.class_stats.transmit_counts.packets)', width:150, name:"MAX (Trans Pkt Cnt)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.pps", display:{id:'edges.class_stats.transmit_counts.pps', field:'edges.class_stats.transmit_counts.pps', width:150, name:"Trans PPS Cnt", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.pps)", display:{id:'SUM(edges.class_stats.transmit_counts.pps)', field:'SUM(edges.class_stats.transmit_counts.pps)', width:150, name:"SUM (Trans PPS Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.pps)", display:{id:'MIN(edges.class_stats.transmit_counts.pps)', field:'MIN(edges.class_stats.transmit_counts.pps)', width:150, name:"MIN (Trans PPS Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.pps)", display:{id:'MAX(edges.class_stats.transmit_counts.pps)', field:'MAX(edges.class_stats.transmit_counts.pps)', width:150, name:"MAX (Trans PPS Cnt)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.bytes", display:{id:'edges.class_stats.transmit_counts.bytes', field:'edges.class_stats.transmit_counts.bytes', width:150, name:"Trans Bytes Cnt", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.bytes)", display:{id:'SUM(edges.class_stats.transmit_counts.bytes)', field:'SUM(edges.class_stats.transmit_counts.bytes)', width:150, name:"SUM (Trans Bytes Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.bytes)", display:{id:'MIN(edges.class_stats.transmit_counts.bytes)', field:'MIN(edges.class_stats.transmit_counts.bytes)', width:150, name:"MIN (Trans Bytes Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.bytes)", display:{id:'MAX(edges.class_stats.transmit_counts.bytes)', field:'MAX(edges.class_stats.transmit_counts.bytes)', width:150, name:"MAX (Trans Bytes Cnt)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.bps", display:{id:'edges.class_stats.transmit_counts.bps', field:'edges.class_stats.transmit_counts.bps', width:150, name:"Trans BPS Cnt", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.bps)", display:{id:'SUM(edges.class_stats.transmit_counts.bps)', field:'SUM(edges.class_stats.transmit_counts.bps)', width:150, name:"SUM (Trans BPS Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.bps)", display:{id:'MIN(edges.class_stats.transmit_counts.bps)', field:'MIN(edges.class_stats.transmit_counts.bps)', width:150, name:"MIN (Trans BPS Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.bps)", display:{id:'MAX(edges.class_stats.transmit_counts.bps)', field:'MAX(edges.class_stats.transmit_counts.bps)', width:150, name:"MAX (Trans BPS Cnt)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.drop_packets", display:{id:'edges.class_stats.transmit_counts.drop_packets', field:'edges.class_stats.transmit_counts.drop_packets', width:150, name:"Trans Drop Pkts Cnt", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.drop_packets)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_packets)', field:'SUM(edges.class_stats.transmit_counts.drop_packets)', width:150, name:"SUM (Trans Drop Pkts Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.drop_packets)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_packets)', field:'MIN(edges.class_stats.transmit_counts.drop_packets)', width:150, name:"MIN (Trans Drop Pkts Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.drop_packets)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_packets)', field:'MAX(edges.class_stats.transmit_counts.drop_packets)', width:150, name:"MAX (Trans Drop Pkts Cnt)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.drop_bytes", display:{id:'edges.class_stats.transmit_counts.drop_bytes', field:'edges.class_stats.transmit_counts.drop_bytes', width:150, name:"Trans Drop Bytes Cnt", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.drop_bytes)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_bytes)', field:'SUM(edges.class_stats.transmit_counts.drop_bytes)', width:150, name:"SUM (Trans Drop Bytes Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.drop_bytes)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_bytes)', field:'MIN(edges.class_stats.transmit_counts.drop_bytes)', width:150, name:"MIN (Trans Drop Bytes Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.drop_bytes)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_bytes)', field:'MAX(edges.class_stats.transmit_counts.drop_bytes)', width:150, name:"MAX (Trans Drop Bytes Cnt)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.drop_bps", display:{id:'edges.class_stats.transmit_counts.drop_bps', field:'edges.class_stats.transmit_counts.drop_bps', width:150, name:"Trans Drop BPS Cnt", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.drop_bps)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_bps)', field:'SUM(edges.class_stats.transmit_counts.drop_bps)', width:150, name:"SUM (Trans Drop BPS Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.drop_bps)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_bps)', field:'MIN(edges.class_stats.transmit_counts.drop_bps)', width:150, name:"MIN (Trans Drop BPS Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.drop_bps)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_bps)', field:'MAX(edges.class_stats.transmit_counts.drop_bps)', width:150, name:"MAX (Trans Drop BPS Cnt)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.drop_pps", display:{id:'edges.class_stats.transmit_counts.drop_pps', field:'edges.class_stats.transmit_counts.drop_pps', width:150, name:"Trans Drop PPS Cnt", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.drop_pps)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_pps)', field:'SUM(edges.class_stats.transmit_counts.drop_pps)', width:150, name:"SUM (Trans Drop PPS Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.drop_pps)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_pps)', field:'MIN(edges.class_stats.transmit_counts.drop_pps)', width:150, name:"MIN (Trans Drop PPS Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.drop_pps)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_pps)', field:'MAX(edges.class_stats.transmit_counts.drop_pps)', width:150, name:"MAX (Trans Drop PPS Cnt)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.q_depth_avg", display:{id:'edges.class_stats.transmit_counts.q_depth_avg', field:'edges.class_stats.transmit_counts.q_depth_avg', width:150, name:"Trans Avg Q Depth", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.q_depth_avg)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_avg)', field:'SUM(edges.class_stats.transmit_counts.q_depth_avg)', width:150, name:"SUM (Trans Avg Q Depth)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.q_depth_avg)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_avg)', field:'MIN(edges.class_stats.transmit_counts.q_depth_avg)', width:150, name:"MIN (Trans Avg Q Depth)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.q_depth_avg)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_avg)', field:'MAX(edges.class_stats.transmit_counts.q_depth_avg)', width:150, name:"MAX (Trans Avg Q Depth)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.q_depth_cur", display:{id:'edges.class_stats.transmit_counts.q_depth_cur', field:'edges.class_stats.transmit_counts.q_depth_cur', width:150, name:"Trans Cur Q Depth", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.q_depth_cur)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_cur)', field:'SUM(edges.class_stats.transmit_counts.q_depth_cur)', width:150, name:"SUM (Trans Cur Q Depth)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.q_depth_cur)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_cur)', field:'MIN(edges.class_stats.transmit_counts.q_depth_cur)', width:150, name:"MIN (Trans Cur Q Depth)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.q_depth_cur)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_cur)', field:'MAX(edges.class_stats.transmit_counts.q_depth_cur)', width:150, name:"MAX (Trans Cur Q Depth)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.q_depth_peak", display:{id:'edges.class_stats.transmit_counts.q_depth_peak', field:'edges.class_stats.transmit_counts.q_depth_peak', width:150, name:"Trans Peak Q Depth", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.q_depth_peak)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_peak)', field:'SUM(edges.class_stats.transmit_counts.q_depth_peak)', width:150, name:"SUM (Trans Peak Q Depth)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.q_depth_peak)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_peak)', field:'MIN(edges.class_stats.transmit_counts.q_depth_peak)', width:150, name:"MIN (Trans Peak Q Depth)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.q_depth_peak)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_peak)', field:'MAX(edges.class_stats.transmit_counts.q_depth_peak)', width:150, name:"MAX (Trans PeakQ Depth)", format:"{0:n0}", groupable:false}},

        {select:"edges.class_stats.transmit_counts.q_depth_max", display:{id:'edges.class_stats.transmit_counts.q_depth_max', field:'edges.class_stats.transmit_counts.q_depth_max', width:150, name:"Trans Max Q Depth", groupable:false}},
        {select:"SUM(edges.class_stats.transmit_counts.q_depth_max)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_max)', field:'SUM(edges.class_stats.transmit_counts.q_depth_max)', width:150, name:"SUM (Trans Max Q Depth)", format:"{0:n0}", groupable:false}},
        {select:"MIN(edges.class_stats.transmit_counts.q_depth_max)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_max)', field:'MIN(edges.class_stats.transmit_counts.q_depth_max)', width:150, name:"MIN (Trans Max Q Depth)", format:"{0:n0}", groupable:false}},
        {select:"MAX(edges.class_stats.transmit_counts.q_depth_max)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_max)', field:'MAX(edges.class_stats.transmit_counts.q_depth_max)', width:150, name:"MAX (Trans Max Q Depth)", format:"{0:n0}", groupable:false}},

    ],
    "StatTable.g_lsp_stats.lsp_records" : [
        {select:"COUNT(lsp_records)", display:{id:'COUNT(lsp_records)', field:'COUNT(lsp_records)', width:120, name:"Count (LSP Records)", format:"{0:n0}", groupable:false}},
        {select:"system_name", display:{id:'system_name', field:'system_name', width:150, name:"System Name", groupable:false}},
        {select:"sensor_name", display:{id:'sensor_name', field:'sensor_name', width:150, name:"Sensor Name", groupable:false}},
        {select:"lsp_records.name", display:{id:'lsp_records.name', field:'lsp_records.name', width:150, name:"Lsp Records Name", groupable:false}},

        {select:"slot", display:{id:'slot', field:'slot', width:150, name:"Slot", groupable:false}},
        {select:"SUM(slot)", display:{id:'SUM(slot)', field:'SUM(slot)', width:150, name:"SUM (Slot)", format:"{0:n0}", groupable:false}},
        {select:"MIN(slot)", display:{id:'MIN(slot)', field:'MIN(slot)', width:150, name:"MIN (Slot)", format:"{0:n0}", groupable:false}},
        {select:"MAX(slot)", display:{id:'MAX(slot)', field:'MAX(slot)', width:150, name:"MAX (Slot)", format:"{0:n0}", groupable:false}},

        {select:"timestamp", display:{id:'timestamp', field:'timestamp', width:150, name:"Timestamp", groupable:false}},
        {select:"SUM(timestamp)", display:{id:'SUM(timestamp)', field:'SUM(timestamp)', width:150, name:"SUM (Timestamp)", format:"{0:n0}", groupable:false}},
        {select:"MIN(timestamp)", display:{id:'MIN(timestamp)', field:'MIN(timestamp)', width:150, name:"MIN (Timestamp)", format:"{0:n0}", groupable:false}},
        {select:"MAX(timestamp)", display:{id:'MAX(timestamp)', field:'MAX(timestamp)', width:150, name:"MAX (Timestamp)", format:"{0:n0}", groupable:false}},

        {select:"lsp_records.instance_identifier", display:{id:'lsp_records.instance_identifier', field:'lsp_records.instance_identifier', width:150, name:"Instance Identifier", groupable:false}},
        {select:"SUM(lsp_records.instance_identifier)", display:{id:'SUM(lsp_records.instance_identifier)', field:'SUM(lsp_records.instance_identifier)', width:150, name:"SUM (Instance Identifier)", format:"{0:n0}", groupable:false}},
        {select:"MIN(lsp_records.instance_identifier)", display:{id:'MIN(lsp_records.instance_identifier)', field:'MIN(lsp_records.instance_identifier)', width:150, name:"MIN (Instance Identifier)", format:"{0:n0}", groupable:false}},
        {select:"MAX(lsp_records.instance_identifier)", display:{id:'MAX(lsp_records.instance_identifier)', field:'MAX(lsp_records.instance_identifier)', width:150, name:"MAX (Instance Identifier)", format:"{0:n0}", groupable:false}},

        {select:"lsp_records.counter_name", display:{id:'lsp_records.counter_name', field:'lsp_records.counter_name', width:150, name:"Counter Name", groupable:false}},
        {select:"SUM(lsp_records.counter_name)", display:{id:'SUM(lsp_records.counter_name)', field:'SUM(lsp_records.counter_name)', width:150, name:"SUM (Counter Name)", format:"{0:n0}", groupable:false}},
        {select:"MIN(lsp_records.counter_name)", display:{id:'MIN(lsp_records.counter_name)', field:'MIN(lsp_records.counter_name)', width:150, name:"MIN (Counter Name)", format:"{0:n0}", groupable:false}},
        {select:"MAX(lsp_records.counter_name)", display:{id:'MAX(lsp_records.counter_name)', field:'MAX(lsp_records.counter_name)', width:150, name:"MAX (Counter Name)", format:"{0:n0}", groupable:false}},

        {select:"lsp_records.packets", display:{id:'lsp_records.packets', field:'lsp_records.packets', width:150, name:"Packets", groupable:false}},
        {select:"SUM(lsp_records.packets)", display:{id:'SUM(lsp_records.packets)', field:'SUM(lsp_records.packets)', width:150, name:"SUM (Packets)", format:"{0:n0}", groupable:false}},
        {select:"MIN(lsp_records.packets)", display:{id:'MIN(lsp_records.packets)', field:'MIN(lsp_records.packets)', width:150, name:"MIN (Packets)", format:"{0:n0}", groupable:false}},
        {select:"MAX(lsp_records.packets)", display:{id:'MAX(lsp_records.packets)', field:'MAX(lsp_records.packets)', width:150, name:"MAX (Packets)", format:"{0:n0}", groupable:false}},

        {select:"lsp_records.packet_rates", display:{id:'lsp_records.packet_rates', field:'lsp_records.packet_rates', width:150, name:"Packet Rates", groupable:false}},
        {select:"SUM(lsp_records.packet_rates)", display:{id:'SUM(lsp_records.packet_rates)', field:'SUM(lsp_records.packet_rates)', width:150, name:"SUM (Packet Rates)", format:"{0:n0}", groupable:false}},
        {select:"MIN(lsp_records.packet_rates)", display:{id:'MIN(lsp_records.packet_rates)', field:'MIN(lsp_records.packet_rates)', width:150, name:"MIN (Packet Rates)", format:"{0:n0}", groupable:false}},
        {select:"MAX(lsp_records.packet_rates)", display:{id:'MAX(lsp_records.packet_rates)', field:'MAX(lsp_records.packet_rates)', width:150, name:"MAX (Packet Rates)", format:"{0:n0}", groupable:false}},

        {select:"lsp_records.bytes", display:{id:'lsp_records.bytes', field:'lsp_records.bytes', width:150, name:"Bytes", groupable:false}},
        {select:"SUM(lsp_records.bytes)", display:{id:'SUM(lsp_records.bytes)', field:'SUM(lsp_records.bytes)', width:150, name:"SUM (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MIN(lsp_records.bytes)", display:{id:'MIN(lsp_records.bytes)', field:'MIN(lsp_records.bytes)', width:150, name:"MIN (Bytes)", format:"{0:n0}", groupable:false}},
        {select:"MAX(lsp_records.bytes)", display:{id:'MAX(lsp_records.bytes)', field:'MAX(lsp_records.bytes)', width:150, name:"MAX (Bytes)", format:"{0:n0}", groupable:false}},

        {select:"lsp_records.byte_rates", display:{id:'lsp_records.byte_rates', field:'lsp_records.byte_rates', width:150, name:"Byte Rates", groupable:false}},
        {select:"SUM(lsp_records.byte_rates)", display:{id:'SUM(lsp_records.byte_rates)', field:'SUM(lsp_records.byte_rates)', width:150, name:"SUM (Byte Rates)", format:"{0:n0}", groupable:false}},
        {select:"MIN(lsp_records.byte_rates)", display:{id:'MIN(lsp_records.byte_rates)', field:'MIN(lsp_records.byte_rates)', width:150, name:"MIN (Byte Rates)", format:"{0:n0}", groupable:false}},
        {select:"MAX(lsp_records.byte_rates)", display:{id:'MAX(lsp_records.byte_rates)', field:'MAX(lsp_records.byte_rates)', width:150, name:"MAX (Byte Rates)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.UFlowData.flow" : [
        {select:"COUNT(flow)", display:{id:'COUNT(flow)', field:'COUNT(flow)', width:120, name:"Count (Flow)", format:"{0:n0}", groupable:false}},

        {select:"flow.pifindex", display:{id:'flow.pifindex', field:'flow.pifindex', width:150, name:"PIF Index", groupable:false}},
        {select:"SUM(flow.pifindex)", display:{id:'SUM(flow.pifindex)', field:'SUM(flow.pifindex)', width:150, name:"SUM (PIF Index)", format:"{0:n0}", groupable:false}},
        {select:"MIN(flow.pifindex)", display:{id:'MIN(flow.pifindex)', field:'MIN(flow.pifindex)', width:150, name:"MIN (PIF Index)", format:"{0:n0}", groupable:false}},
        {select:"MAX(flow.pifindex)", display:{id:'MAX(flow.pifindex)', field:'MAX(flow.pifindex)', width:150, name:"MAX (PIF Index)", format:"{0:n0}", groupable:false}},

        {select:"flow.sport", display:{id:'flow.sport', field:'flow.sport', width:150, name:"Src Port", groupable:false}},
        {select:"SUM(flow.sport)", display:{id:'SUM(flow.sport)', field:'SUM(flow.sport)', width:150, name:"SUM (Src Port)", format:"{0:n0}", groupable:false}},
        {select:"MIN(flow.sport)", display:{id:'MIN(flow.sport)', field:'MIN(flow.sport)', width:150, name:"MIN (Src Port)", format:"{0:n0}", groupable:false}},
        {select:"MAX(flow.sport)", display:{id:'MAX(flow.sport)', field:'MAX(flow.sport)', width:150, name:"MAX (Src Port)", format:"{0:n0}", groupable:false}},

        {select:"flow.dport", display:{id:'flow.dport', field:'flow.dport', width:150, name:"Dest Port", groupable:false}},
        {select:"SUM(flow.dport)", display:{id:'SUM(flow.dport)', field:'SUM(flow.dport)', width:150, name:"SUM (Dest Port)", format:"{0:n0}", groupable:false}},
        {select:"MIN(flow.dport)", display:{id:'MIN(flow.dport)', field:'MIN(flow.dport)', width:150, name:"MIN (Dest Port)", format:"{0:n0}", groupable:false}},
        {select:"MAX(flow.dport)", display:{id:'MAX(flow.dport)', field:'MAX(flow.dport)', width:150, name:"MAX (Dest Port)", format:"{0:n0}", groupable:false}},

        {select:"flow.protocol", display:{id:'flow.protocol', field:'flow.protocol', width:150, name:"Protocol", groupable:false}},
        {select:"SUM(flow.protocol)", display:{id:'SUM(flow.protocol)', field:'SUM(flow.protocol)', width:150, name:"SUM (Protocol)", format:"{0:n0}", groupable:false}},
        {select:"MIN(flow.protocol)", display:{id:'MIN(flow.protocol)', field:'MIN(flow.protocol)', width:150, name:"MIN (Protocol)", format:"{0:n0}", groupable:false}},
        {select:"MAX(flow.protocol)", display:{id:'MAX(flow.protocol)', field:'MAX(flow.protocol)', width:150, name:"MAX (Protocol)", format:"{0:n0}", groupable:false}},

        {select:"flow.sip", display:{id:'flow.sip', field:'flow.sip', width:150, name:"Src IP", groupable:false}},
        {select:"flow.dip", display:{id:'flow.dip', field:'flow.dip', width:150, name:"Dest IP", groupable:false}},
        {select:"flow.vlan", display:{id:'flow.vlan', field:'flow.vlan', width:150, name:"Virtual LAN", groupable:false}},
        {select:"flow.flowtype", display:{id:'flow.flowtype', field:'flow.flowtype', width:150, name:"Flow Type", groupable:false}},
        {select:"flow.otherinfo", display:{id:'flow.otherinfo', field:'flow.otherinfo', width:150, name:"Other Info", groupable:false}}
    ],
    "StatTable.AlarmgenUpdate.keys" : [
        {select:"COUNT(keys)", display:{id:'COUNT(keys)', field:'COUNT(keys)', width:120, name:"Count (keys)", format:"{0:n0}", groupable:false}},
        {select:"instance", display:{id:'instance', field:'instance', width:150, name:"Instance", groupable:false}},
        {select:"table", display:{id:'table', field:'table', width:150, name:"Table", groupable:false}},
        {select:"keys.key", display:{id:'keys.key', field:'keys.key', width:150, name:"Key", groupable:false}},

        {select:"partition", display:{id:'partition', field:'partition', width:150, name:"Partition", groupable:false}},
        {select:"SUM(partition)", display:{id:'SUM(partition)', field:'SUM(partition)', width:150, name:"SUM (Partition)", format:"{0:n0}", groupable:false}},
        {select:"MIN(partition)", display:{id:'MIN(partition)', field:'MIN(partition)', width:150, name:"MIN (Partition)", format:"{0:n0}", groupable:false}},
        {select:"MAX(partition)", display:{id:'MAX(partition)', field:'MAX(partition)', width:150, name:"MAX (Partition)", format:"{0:n0}", groupable:false}},

        {select:"keys.count", display:{id:'keys.count', field:'keys.count', width:150, name:"Keys Cnt", groupable:false}},
        {select:"SUM(keys.count)", display:{id:'SUM(keys.count)', field:'SUM(keys.count)', width:150, name:"SUM (Keys Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(keys.count)", display:{id:'MIN(keys.count)', field:'MIN(keys.count)', width:150, name:"MIN (Keys Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(keys.count)", display:{id:'MAX(keys.count)', field:'MAX(keys.count)', width:150, name:"MAX (Keys Cnt)", format:"{0:n0}", groupable:false}},
    ],
    "StatTable.AlarmgenUpdate.notifs" : [
        {select:"COUNT(notifs)", display:{id:'COUNT(notifs)', field:'COUNT(notifs)', width:120, name:"Count (notifs)", format:"{0:n0}", groupable:false}},
        {select:"instance", display:{id:'instance', field:'instance', width:150, name:"Instance", groupable:false}},
        {select:"table", display:{id:'table', field:'table', width:150, name:"Table", groupable:false}},
        {select:"notifs.generator", display:{id:'notifs.generator', field:'notifs.generator', width:150, name:"Generator", groupable:false}},
        {select:"notifs.collector", display:{id:'notifs.collector', field:'notifs.collector', width:150, name:"Collector", groupable:false}},
        {select:"notifs.type", display:{id:'notifs.type', field:'notifs.type', width:150, name:"Type", groupable:false}},

        {select:"partition", display:{id:'partition', field:'partition', width:150, name:"Partition", groupable:false}},
        {select:"SUM(partition)", display:{id:'SUM(partition)', field:'SUM(partition)', width:150, name:"SUM (Partition)", format:"{0:n0}", groupable:false}},
        {select:"MIN(partition)", display:{id:'MIN(partition)', field:'MIN(partition)', width:150, name:"MIN (Partition)", format:"{0:n0}", groupable:false}},
        {select:"MAX(partition)", display:{id:'MAX(partition)', field:'MAX(partition)', width:150, name:"MAX (Partition)", format:"{0:n0}", groupable:false}},

        {select:"notifs.count", display:{id:'notifs.count', field:'notifs.count', width:150, name:"Notifs Cnt", groupable:false}},
        {select:"SUM(notifs.count)", display:{id:'SUM(notifs.count)', field:'SUM(notifs.count)', width:150, name:"SUM (Notifs Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MIN(notifs.count)", display:{id:'MIN(notifs.count)', field:'MIN(notifs.count)', width:150, name:"MIN (Notifs Cnt)", format:"{0:n0}", groupable:false}},
        {select:"MAX(notifs.count)", display:{id:'MAX(notifs.count)', field:'MAX(notifs.count)', width:150, name:"MAX (Notifs Cnt)", format:"{0:n0}", groupable:false}}
    ]
};

statQuery['defaultColumnDisplay'] = [
    {select:"T", display:{id:"T", field:"T", width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc.T); }, filterable:false, groupable:false}},
    {select:"T=", display:{id: 'T=', field:'["T="]', width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc['T=']); }, filterable:false, groupable:false}},
    {select:"UUID", display:{id:"UUID", field:"UUID", name:"UUID",  width:280, groupable:true}},
    {select:"name", display:{id:'name', field:'name', width:150, name:"Name", groupable:false}},
    {select:"Source", display:{id:'Source', field:'Source', width:150, name:"Source", groupable:false}}
];
statQuery['defaultColumns'] = [];

statQuery['queryViewModel'] = new QueryViewModel('stat', function(){
    this.defaultTRValue("1800");
    this.isCustomTRVisible(false);
    this.isCustomTableVisible(false);
    this.isTGVisible(false);
    queries.stat.selectViewModel.reset();
    queries.stat.whereViewModel.reset();
    queries.stat.filterViewModel.reset();
}, true);

statQuery['selectViewModel'] = new SelectViewModel('stat', function() {
    this.fields([]);
    this.isEnabled['T'](true);
    this.checkedFields([]);
    this.defaultSelectAllText("Select All");
    $('#stat-select').val('');
});

statQuery['whereViewModel'] = new WhereViewModel('stat', function(){
    this.whereClauseView([]);
    this.whereClauseSubmit([]);
    this.whereClauseEdit([]);
    this.selectedORClauseIndex("-1");
    $('#stat-where').val('');
});

statQuery['filterViewModel'] = new FilterViewModel('stat', function() {
    this.filterClauseSubmit([]);
    this.filterClauseSubmit("");
    resetStatFilter(this);
    $('#stat-filter').val('');
});

function resetStatFilter(dis){
    dis.limit = ko.observable("150000");
    dis.sortOrder = ko.observable("asc");
    dis.fields([]);
};

function loadStatQueryObj() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    setStatQueryFromValues('/api/admin/tables', 'fromTables', queries['stat'].queryViewModel, null, function(){
        $('#stat-table').select2('val', 'StatTable.AnalyticsCpuState.cpu_info');
    });
    setStatValidValues('StatTable.AnalyticsCpuState.cpu_info', 'stat');
    initStatQueryView('stat');
    populateStatSelectPopupTemplate('stat');

    ko.applyBindings(queries.stat.queryViewModel, document.getElementById('stat-query'));
    ko.applyBindings(queries.stat.chartViewModel, document.getElementById('stat-chart'));

    initWidgetBoxes();
    currTab = 'query_stat_cpuinfo';
    $('#stat-table').on("select2-selecting", function(e) {
        fromTableChangeHandler(e);
    });
};

function fromTableChangeHandler(e){
    queries.stat.selectViewModel.reset();
    queries.stat.whereViewModel.reset();
    queries.stat.filterViewModel.reset();
    queries.stat.queryViewModel.isTGVisible(false);

    if(e.val === 'Custom'){
        queries['stat'].queryViewModel.isCustomTableVisible(true);
    } else {
        setStatValidValues(e.val, 'stat');
        queries['stat'].queryViewModel.isCustomTableVisible(false);
    }
};
//Stat Query - End

// Stats Charts - Start
statQuery['chartViewModel'] = new StatChartViewModel();

function StatChartViewModel() {
    this.isFCLoaded = ko.observable(false);
    this.statClasses = ko.observableArray([]);
    this.statChartData = ko.observable({});
    this.seriesValues = ko.observableArray([]);
    this.navigatorValues = ko.observableArray([]);
    this.plotFields = ko.observableArray([]);
    this.groupFields = ko.observableArray([]);
    this.Xaxis = ko.observableArray([]);
    this.options = ko.observable({});
    this.selectedFlows = ko.observableArray([]);
    this.columnLabels = ko.observableArray([]);
    this.reset = function() {};
};
// Stats Charts - End

// Stat Query Queue - Start
function loadStatQueryQueue() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    initStatQueueView();
    initWidgetBoxes();
};

function initStatQueueView() {
    var options = {elementId:'sqq-results', queueType:'sqq', timeOut:60000, gridHeight:530, pageSize:6},
        intervalId;
    $("#sqq-container").show();
    loadQueryQueue(options);
};
// Stat Query Queue - End
