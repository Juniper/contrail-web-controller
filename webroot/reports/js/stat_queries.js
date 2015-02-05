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
            },
            where: {
                required: '<i class="icon-warning-sign"></i> Where Required'
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
        {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:120, name:"Virtual Memory", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:120, name:"CPU Share", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:120, name:"SUM (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:120, name:"Instance Id", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}}

    ],
    "StatTable.ConfigCpuState.cpu_info" : [
        {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:120, name:"Virtual Memory", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:120, name:"CPU Share", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:120, name:"SUM (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:120, name:"Instance Id", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}}

    ],
    "StatTable.ControlCpuState.cpu_info" : [
        {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:120, name:"Virtual Memory", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:120, name:"CPU Share", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:120, name:"SUM (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:120, name:"Instance Id", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}}

    ],
    "StatTable.ComputeCpuState.cpu_info" : [
        {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:120, name:"Virtual Memory", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:120, name:"CPU Share", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:120, name:"SUM (CPU Share)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.used_sys_mem", display:{id:'cpu_info.used_sys_mem', field:'cpu_info.used_sys_mem', width:120, name:"CPU Sys Memory Used", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.used_sys_mem)", display:{id:'SUM(cpu_info.used_sys_mem)', field:'SUM(cpu_info.used_sys_mem)', width:120, name:"SUM (CPU Sys Memory Used)", format:"{0:n0}", groupable:false}},
        {select:"cpu_info.one_min_cpuload", display:{id:'cpu_info.one_min_cpuload', field:'cpu_info.one_min_cpuload', width:120, name:"CPU 1 Min Load", format:"{0:n0}", groupable:false}},
        {select:"SUM(cpu_info.one_min_cpuload)", display:{id:'SUM(cpu_info.one_min_cpuload)', field:'SUM(cpu_info.one_min_cpuload)', width:120, name:"SUM (CPU 1 Min Load)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.SandeshMessageStat.msg_info" : [
        {select:"COUNT(msg_info)", display:{id:'COUNT(msg_info)', field:'COUNT(msg_info)', width:120, name:"Count (Msg Info)", format:"{0:n0}", groupable:false}},
        {select:"msg_info.type", display:{id:'msg_info.type', field:'msg_info.type', width:210, name:"Message Type", groupable:false}},
        {select:"msg_info.level", display:{id:'msg_info.level', field:'msg_info.level', width:210, name:"Message Level", groupable:false}},
        {select:"msg_info.messages", display:{id:'msg_info.messages', field:'msg_info.messages', width:120, name:"Messages", format:"{0:n0}", groupable:false}},
        {select:"SUM(msg_info.messages)", display:{id:'SUM(msg_info.messages)', field:'SUM(msg_info.messages)', width:120, name:"SUM (Messages)", format:"{0:n0}", groupable:false}},
        {select:"msg_info.bytes", display:{id:'msg_info.bytes', field:'msg_info.messages', width:120, name:"Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(msg_info.bytes)", display:{id:'SUM(msg_info.bytes)', field:'SUM(msg_info.bytes)', width:120, name:"SUM (Bytes)", format:"{0:n0}", groupable:false}}

    ],
    "StatTable.GeneratorDbStats.table_info" : [
        {select:"COUNT(table_info)", display:{id:'COUNT(table_info)', field:'COUNT(table_info)', width:120, name:"Count (Table Info)", format:"{0:n0}", groupable:false}},
        {select:"table_info.table_name", display:{id:'table_info.table_name', field:'table_info.table_name', width:150, name:"Table Name", groupable:false}},
        {select:"table_info.reads", display:{id:'table_info.reads', field:'table_info.reads', width:150, name:"Reads", format:"{0:n0}", groupable:false}},
        {select:"table_info.read_fails", display:{id:'table_info.read_fails', field:'table_info.read_fails', width:150, name:"Read Fails", format:"{0:n0}", groupable:false}},
        {select:"table_info.writes", display:{id:'table_info.writes', field:'table_info.writes', width:150, name:"Writes", format:"{0:n0}", groupable:false}},
        {select:"table_info.write_fails", display:{id:'table_info.write_fails', field:'table_info.write_fails', width:150, name:"Write Fails", format:"{0:n0}", groupable:false}}

    ],
    "StatTable.GeneratorDbStats.errors" : [
        {select:"COUNT(errors)", display:{id:'COUNT(errors)', field:'COUNT(errors)', width:120, name:"Count (Errors)", format:"{0:n0}", groupable:false}},
        {select:"errors.write_tablespace_fails", display:{id:'errors.write_tablespace_fails', field:'errors.write_tablespace_fails', width:120, name:"Write Tablespace Fails", format:"{0:n0}", groupable:false}},
        {select:"errors.read_tablespace_fails", display:{id:'errors.read_tablespace_fails', field:'errors.read_tablespace_fails', width:120, name:"Read Tablespace Fails", format:"{0:n0}", groupable:false}},
        {select:"errors.write_table_fails", display:{id:'errors.write_table_fails', field:'errors.write_table_fails', width:120, name:"Write Table Fails", format:"{0:n0}", groupable:false}},
        {select:"errors.read_table_fails", display:{id:'errors.read_table_fails', field:'errors.read_table_fails', width:120, name:"Read Table Fails", format:"{0:n0}", groupable:false}},
        {select:"errors.write_column_fails", display:{id:'errors.write_column_fails', field:'errors.write_column_fails', width:120, name:"Write Column Fails", format:"{0:n0}", groupable:false}},
        {select:"errors.write_batch_column_fails", display:{id:'errors.write_batch_column_fails', field:'errors.write_batch_column_fails', width:120, name:"Write Column Batch Fails", format:"{0:n0}", groupable:false}},
        {select:"errors.read_column_fails", display:{id:'errors.read_column_fails', field:'errors.read_column_fails', width:120, name:"Read Column Fails", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.FieldNames.fields" : [
        {select:"COUNT(fields)", display:{id:'COUNT(fields)', field:'COUNT(fields)', width:120, name:"Count (Fields)", format:"{0:n0}", groupable:false}},
        {select:"fields.value", display:{id:'fields.value', field:'fields.value', width:150, name:"Value", groupable:false}}
    ],
    "StatTable.FieldNames.fieldi" : [
        {select:"COUNT(fieldi)", display:{id:'COUNT(fieldi)', field:'COUNT(fieldi)', width:120, name:"Count (FieldI)", format:"{0:n0}", groupable:false}},
        {select:"fieldi.value", display:{id:'fieldi.value', field:'fieldi.value', width:150, name:"Value", groupable:false}},
        {select:"SUM(fieldi.value)", display:{id:'SUM(fieldi.value)', field:'SUM(fieldi.value)', width:120, name:"SUM (Value)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.QueryPerfInfo.query_stats" : [
        {select:"COUNT(query_stats)", display:{id:'COUNT(query_stats)', field:'COUNT(query_stats)', width:120, name:"Count (Query Stats)", format:"{0:n0}", groupable:false}},
        {select:"table", display:{id:'table', field:'table', width:150, name:"Table", groupable:false}},
        {select:"query_stats.time", display:{id:'query_stats.time', field:'query_stats.time', width:280, name:"Query Time", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.time)", display:{id:'SUM(query_stats.time)', field:'SUM(query_stats.time)', width:120, name:"SUM (Time Taken)", format:"{0:n0}", groupable:false}},
        {select:"query_stats.rows", display:{id:'query_stats.rows', field:'query_stats.rows', width:120, name:"Rows Returned", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.rows)", display:{id:'SUM(query_stats.rows)', field:'SUM(query_stats.rows)', width:140, name:"SUM (Rows Returned)", format:"{0:n0}", groupable:false}},
        {select:"query_stats.qid", display:{id:'query_stats.qid', field:'query_stats.qid', width:280, name:"Query Id", format:"{0:n0}", groupable:false}},
        {select:"query_stats.where", display:{id:'query_stats.where', field:'query_stats.where', width:300, name:"Where", groupable:false}},
        {select:"query_stats.select", display:{id:'query_stats.select', field:'query_stats.select', width:300, name:"Select", groupable:false}},
        {select:"query_stats.post", display:{id:'query_stats.post', field:'query_stats.post', width:300, name:"Filter", groupable:false}},
        {select:"query_stats.time_span", display:{id:'query_stats.time_span', field:'query_stats.time_span', width:110, name:"Time Span", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.time_span)", display:{id:'SUM(query_stats.time_span)', field:'SUM(query_stats.time_span)', width:110, name:"SUM (Time Span)", format:"{0:n0}", groupable:false}},
        {select:"query_stats.chunks", display:{id:'query_stats.chunks', field:'query_stats.chunks', width:110, name:"Chunks", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.chunks)", display:{id:'SUM(query_stats.chunks)', field:'SUM(query_stats.chunks)', width:110, name:"Sum (Chunks)", format:"{0:n0}", groupable:false}},
        {select:"query_stats.chunk_where_time", display:{id:'query_stats.chunk_where_time', field:'query_stats.chunk_where_time', width:130, name:"Chunk Where Time", format:"{0:n0}", groupable:false}},
        {select:"query_stats.chunk_select_time", display:{id:'query_stats.chunk_select_time', field:'query_stats.chunk_select_time', width:130, name:"Chunk Select Time", format:"{0:n0}", groupable:false}},
        {select:"query_stats.chunk_postproc_time", display:{id:'query_stats.chunk_postproc_time', field:'query_stats.chunk_postproc_time', width:140, name:"Chunk Postproc Time", format:"{0:n0}", groupable:false}},
        {select:"query_stats.chunk_merge_time", display:{id:'query_stats.chunk_merge_time', field:'query_stats.chunk_merge_time', width:130, name:"Chunk Merge Time", format:"{0:n0}", groupable:false}},
        {select:"query_stats.final_merge_time", display:{id:'query_stats.final_merge_time', field:'query_stats.final_merge_time', width:130, name:"Final Merge Time", format:"{0:n0}", groupable:false}},
        {select:"SUM(query_stats.final_merge_time)", display:{id:'SUM(query_stats.final_merge_time)', field:'SUM(query_stats.final_merge_time)', width:150, name:"SUM (Final Merge Time)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.UveVirtualNetworkAgent.vn_stats" : [
        {select:"COUNT(vn_stats)", display:{id:'COUNT(vn_stats)', field:'COUNT(vn_stats)', width:120, name:"Count (VN Stats)", format:"{0:n0}", groupable:false}},
        {select:"vn_stats.other_vn", display:{id:'vn_stats.other_vn', field:'vn_stats.other_vn', width:250, name:"Other VN", groupable:false}},
        {select:"vn_stats.vrouter", display:{id:'vn_stats.vrouter', field:'vn_stats.vrouter', width:120, title:"vRouter", groupable:false}},
        {select:"vn_stats.in_tpkts", display:{id:'vn_stats.in_tpkts', field:'vn_stats.in_tpkts', width:120, name:"In Packets", format:"{0:n0}", groupable:false}},
        {select:"SUM(vn_stats.in_tpkts)", display:{id:'SUM(vn_stats.in_tpkts)', field:'SUM(vn_stats.in_tpkts)', width:120, name:"SUM (In Packets)", format:"{0:n0}", groupable:false}},
        {select:"vn_stats.in_bytes", display:{id:'vn_stats.in_bytes', field:'vn_stats.in_bytes', width:120, name:"In Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(vn_stats.in_bytes)", display:{id:'SUM(vn_stats.in_bytes)', field:'SUM(vn_stats.in_bytes)', width:120, name:"SUM (In Bytes)", format:"{0:n0}", groupable:false}},
        {select:"vn_stats.out_tpkts", display:{id:'vn_stats.out_tpkts', field:'vn_stats.out_tpkts', width:120, name:"Out Packets", format:"{0:n0}", groupable:false}},
        {select:"SUM(vn_stats.out_tpkts)", display:{id:'SUM(vn_stats.out_tpkts)', field:'SUM(vn_stats.out_tpkts)', width:120, name:"SUM (Out Packets)", format:"{0:n0}", groupable:false}},
        {select:"vn_stats.out_bytes", display:{id:'vn_stats.out_bytes', field:'vn_stats.out_bytes', width:120, name:"Out Bytes", format:"{0:n0}", groupable:false}},
        {select:"SUM(vn_stats.out_bytes)", display:{id:'SUM(vn_stats.out_bytes)', field:'SUM(vn_stats.out_bytes)', width:120, name:"SUM (Out Bytes)", format:"{0:n0}", groupable:false}}
    ],
    "StatTable.DatabasePurgeInfo.stats" : [
        {select:"stats.purge_id", display:{id:'stats.purge_id', field:'stats.purge_id', width:280, name:"Purge Id", format:"{0:n0}", groupable:false}},
        {select:"stats.request_time", display:{id:'stats.request_time', field:'stats.request_time', width:280, name:"Request Time", format:"{0:n0}", groupable:false}},
        {select:"SUM(stats.request_time)", display:{id:'SUM(stats.request_time)', field:'SUM(stats.request_time)', width:280, name:"SUM (Request Time)", format:"{0:n0}", groupable:false}},
        {select:"stats.rows_deleted", display:{id:'stats.rows_deleted', field:'stats.rows_deleted', width:280, name:"Rows Deleted", format:"{0:n0}", groupable:false}},
        {select:"SUM(stats.rows_deleted)", display:{id:'SUM(stats.rows_deleted)', field:'SUM(stats.rows_deleted)', width:280, name:"SUM (Rows Deleted)", format:"{0:n0}", groupable:false}},
        {select:"stats.duration", display:{id:'stats.duration', field:'stats.duration', width:280, name:"Duration Time", format:"{0:n0}", groupable:false}},
        {select:"SUM(stats.duration)", display:{id:'SUM(stats.duration)', field:'SUM(stats.duration)', width:280, name:"SUM (Duration Time)", format:"{0:n0}", groupable:false}}
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
