/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var statCPUInfoObj = new statCPUInfoObj(),
    statQEPerformanceObj = new statQEPerformanceObj(),
    statVNAgentObj = new statVNAgentObj(),
    statQueryQueueObj = new statQueryQueueObj(),
    statSandeshMsgObj = new statSandeshMsgObj();

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
    //setColumnValues('/api/admin/table/schema/' + tableName, 'fields', [queries[queryPrefix].filterViewModel], 'columns', null, "all");
    //TODO: Create a cache and get the values from that cache
};

function populateStatQueryForm(queryJSON, tg, tgUnit, queryPrefix, reRunTimeRange) {
    var selectFields = queryJSON['select_fields'];
    resetTGValues(true, queryPrefix);
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
        fields = query.selectViewModel.fields();
    var data = {queryPrefix: queryPrefix, fields: $.makeArray(fields), modalClass: 'modal-700'};
    if(queryPrefix == 'qeperf' || queryPrefix == 'acpu') {
        data['modalClass'] = 'modal-980';
    }
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
        selectArray, acpuGridDisplay, labelStepUnit;
    selectArray = queryJSON['select_fields'];

    if(reRun) {
        queryId = randomUUID();
        reqQueryObj = reRunQueryObj;
        reqQueryObj = setUTCTimeObj(queryPrefix, reqQueryObj, options, timeObj);
    }
    if(typeof(ko.dataFor(document.getElementById(queryPrefix + '-query'))) !== "undefined"){
        ko.cleanNode(document.getElementById(queryPrefix + '-query'));
    }

    reqQueryObj.queryId = queryId;
    
    setStatValidValues(params.tableName, queryPrefix);
    initStatQueryView(queryPrefix);
    collapseOtherWidgets(queryPrefix);

    ko.applyBindings(queries[queryPrefix].queryViewModel, document.getElementById(queryPrefix + '-query'));
    initWidget4Id('#' + queryPrefix +'-query-widget');
    if (tg != '' && tgUnit != '') {
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
    acpuGridDisplay = getColumnDisplay4Grid(queries[queryPrefix]['columnDisplay'], selectArray);
    collapseWidget('#' + queryPrefix + '-query-widget');
    loadStatResults(options, reqQueryObj, acpuGridDisplay);
};

function statCPUInfoObj() {
    this.load = loadStatCPUInfo;
    this.destroy = function() {};
};

function statQEPerformanceObj() {
    this.load = loadStatQEPerformance;
    this.destroy = function() {};
};

function statVNAgentObj() {
    this.load = loadStatVNAgent;
    this.destroy = function() {};
};

function statQueryQueueObj() {
    this.load = loadStatQueryQueue;
    this.destroy = function() {};
};

function statSandeshMsgObj() {
    this.load = loadStatSandeshMsg;
    this.destroy = function() {};
};

function runStatQuery(queryPrefix) {
    var queryFormId = "#" + queryPrefix +"-query-form",
        query = queries[queryPrefix];
    if ($(queryFormId).valid()) {
        var reqQueryObj = $(queryFormId).serializeObject(),
            select = $(queryFormId + " input[name='select']").val(),
            options = getDefaultOptions(queryPrefix, false),
            queryId, gridDisplay, selectArray, labelStepUnit, tg, tgUnit;

        collapseWidget('#' + queryPrefix + '-query-widget');
        queryId = randomUUID();
        options.queryId = queryId;
        reqQueryObj = setUTCTimeObj(queryPrefix, reqQueryObj, options);
        reqQueryObj.queryId = queryId;
        reqQueryObj.async = true;
        selectArray = parseStringToArray(select, ',');
        selectArray = selectArray.concat(query['defaultColumns']);
        gridDisplay = getColumnDisplay4Grid(query['columnDisplay'], selectArray);
        if (selectArray.indexOf('T=') != -1) {
            tg = $('#' + queryPrefix + '-tg-value').val();
            tgUnit = $('#' + queryPrefix + '-tg-units').val();
            labelStepUnit = getLabelStepUnit(tg, tgUnit);
            options.labelStep = labelStepUnit.labelStep;
            options.baseUnit = labelStepUnit.baseUnit;
            options.interval = labelStepUnit.secInterval;
        }
        if(queryPrefix == 'qeperf') {
            reqQueryObj.table = 'StatTable.QueryPerfInfo.query_stats';
        } else if(queryPrefix == 'vna') {
            reqQueryObj.table = 'StatTable.UveVirtualNetworkAgent.vn_stats';
        } else if(queryPrefix == 'smsg') {
            reqQueryObj.table = 'StatTable.SandeshMessageStat.msg_info';
        }
        reqQueryObj.engQueryStr = getEngQueryStr(reqQueryObj);
        loadStatResults(options, reqQueryObj, gridDisplay);
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
    validateDate('vna');

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

//CPU Information Query - Begin
var acpuQuery = queries['acpu'];

acpuQuery['columnDisplay'] = [
    {select:"T", display:{id:"T", field:"T", width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc.T); }, filterable:false, groupable:false}},
    {select:"T=", display:{id: 'T=', field:'["T="]', width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc['T=']); }, filterable:false, groupable:false}},
    {select:"UUID", display:{id:"UUID", field:"UUID", name:"UUID",  width:280, groupable:true}},
    {select:"name", display:{id:'name', field:'name', width:150, name:"Name", groupable:false}},
    {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}},
    {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count(CPU Info)", format:"{0:n0}", groupable:false}},
    {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:120, name:"Virtual Memory", format:"{0:n0}", groupable:false}},
    {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM(Virtual Memory)", format:"{0:n0}", groupable:false}},
    {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:120, name:"CPU Share", format:"{0:n0}", groupable:false}},
    {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:120, name:"SUM(CPU Share)", format:"{0:n0}", groupable:false}},
    {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:120, name:"Instance Id", format:"{0:n0}", groupable:false}},
    {select:"SUM(cpu_info.inst_id)", display:{id:'SUM(cpu_info.inst_id)', field:'SUM(cpu_info.inst_id)', width:120, name:"SUM(Instance Id)", format:"{0:n0}", groupable:false}}
];

acpuQuery['defaultColumns'] = [];

acpuQuery['queryViewModel'] = new QueryViewModel('acpu', function(){
                                    this.defaultTRValue("1800");
                                    this.isCustomTRVisible(false);
                                    this.isTGVisible(false);
                                    queries.acpu.selectViewModel.reset();
                                    queries.acpu.whereViewModel.reset();
                                    queries.acpu.filterViewModel.reset();
                              }, true);

acpuQuery['selectViewModel'] = new SelectViewModel('acpu', function() {
    this.fields([]);
    this.isEnabled['T'](true);
    this.checkedFields([]);
    this.defaultSelectAllText("Select All");
    $('#acpu-select').val('');
});

acpuQuery['whereViewModel'] = new WhereViewModel('acpu', function(){
    //this.selectFields([]);
    this.whereClauseView([]);
    this.whereClauseSubmit([]);
    this.whereClauseEdit([]);
    this.selectedORClauseIndex("-1");
    $('#acpu-where').val('');
});

acpuQuery['filterViewModel'] = new FilterViewModel('acpu', function() {
    this.filterClauseSubmit([]);
    this.filterClauseSubmit("");
    resetStatFilter(this);
    $('#acpu-filter').val('');
});

function resetStatFilter(dis){
    dis.limit = ko.observable("150000");
    dis.sortOrder = ko.observable("asc");
    dis.fields([]);
};

function loadStatCPUInfo() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    setFromValues('/api/admin/tables', 'fromTables', queries['acpu'].queryViewModel, 'acpu');
    setStatValidValues('StatTable.AnalyticsCpuState.cpu_info', 'acpu');
    initStatQueryView('acpu');
    populateStatSelectPopupTemplate('acpu');

    ko.applyBindings(queries.acpu.queryViewModel, document.getElementById('acpu-query'));

    initWidgetBoxes();
    currTab = 'query_stat_cpuinfo';
    $('#acpu-table').on("select2-selecting", function(e) {
        fromTableChangeHandler(e);
    });
};

function fromTableChangeHandler(e){
    queries.acpu.selectViewModel.reset();
    queries.acpu.whereViewModel.reset();
    queries.acpu.filterViewModel.reset();
    setStatValidValues(e.val, 'acpu');
};

//CPU Information Query - End

//QE Performance Query - Begin

var qeperfQuery = queries['qeperf'];

qeperfQuery['columnDisplay'] = [
	{select:"T", display:{id:"T", field:"T", width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc.T); }, filterable:false, groupable:false}},
	{select:"T=", display:{id: 'T=', field:'["T="]', width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc['T=']); }, filterable:false, groupable:false}},
	{select:"UUID", display:{id:"UUID", field:"UUID", name:"UUID",  width:280, groupable:true}},
	{select:"name", display:{id:'name', field:'name', width:150, name:"Name", groupable:false}},
    {select:"query_stats.qid", display:{id:'query_stats.qid', field:'query_stats.qid', width:280, name:"Query Id", format:"{0:n0}", groupable:false}},
    {select:"query_stats.table", display:{id:'query_stats.table', field:'query_stats.table', width:250, name:"Table", format:"{0:n0}", groupable:false}},
    {select:"query_stats.select", display:{id:'query_stats.select', field:'query_stats.select', width:300, name:"Select", groupable:false}},
    {select:"query_stats.where", display:{id:'query_stats.where', field:'query_stats.where', width:300, name:"Where", groupable:false}},
    {select:"query_stats.post", display:{id:'query_stats.post', field:'query_stats.post', width:300, name:"Filter", groupable:false}},
    {select:"COUNT(query_stats)", display:{id:'COUNT(query_stats)', field:'COUNT(query_stats)', width:130, name:"Count(Query Stats)", format:"{0:n0}", groupable:false}},
    {select:"query_stats.time", display:{id:'query_stats.time', field:'query_stats.time', width:110, name:"Time Taken", format:"{0:n0}", groupable:false}},
    {select:"SUM(query_stats.time)", display:{id:'SUM(query_stats.time)', field:'SUM(query_stats.time)', width:120, name:"SUM(Time Taken)", format:"{0:n0}", groupable:false}},
    {select:"query_stats.rows", display:{id:'query_stats.rows', field:'query_stats.rows', width:120, name:"Rows Returned", format:"{0:n0}", groupable:false}},
    {select:"SUM(query_stats.rows)", display:{id:'SUM(query_stats.rows)', field:'SUM(query_stats.rows)', width:140, name:"SUM(Rows Returned)", format:"{0:n0}", groupable:false}},
    {select:"query_stats.time_span", display:{id:'query_stats.time_span', field:'query_stats.time_span', width:110, name:"Time Span", format:"{0:n0}", groupable:false}},
    {select:"SUM(query_stats.time_span)", display:{id:'SUM(query_stats.time_span)', field:'SUM(query_stats.time_span)', width:110, name:"SUM(Time Span)", format:"{0:n0}", groupable:false}},
    {select:"query_stats.chunks", display:{id:'query_stats.chunks', field:'query_stats.chunks', width:110, name:"Chunks", format:"{0:n0}", groupable:false}},
    {select:"SUM(query_stats.chunks)", display:{id:'SUM(query_stats.chunks)', field:'SUM(query_stats.chunks)', width:110, name:"Sum(Chunks)", format:"{0:n0}", groupable:false}},
    {select:"query_stats.chunk_where_time", display:{id:'query_stats.chunk_where_time', field:'query_stats.chunk_where_time', width:130, name:"Chunk Where Time", format:"{0:n0}", groupable:false}},
    {select:"SUM(query_stats.chunk_where_time)", display:{id:'SUM(query_stats.chunk_where_time)', field:'SUM(query_stats.chunk_where_time)', width:160, name:"SUM(Chunk Where Time)", format:"{0:n0}", groupable:false}},
    {select:"query_stats.chunk_select_time", display:{id:'query_stats.chunk_select_time', field:'query_stats.chunk_select_time', width:130, name:"Chunk Select Time", format:"{0:n0}", groupable:false}},
    {select:"SUM(query_stats.chunk_select_time)", display:{id:'SUM(query_stats.chunk_select_time)', field:'SUM(query_stats.chunk_select_time)', width:160, name:"SUM(Chunk Select Time)", format:"{0:n0}", groupable:false}},
    {select:"query_stats.chunk_postproc_time", display:{id:'query_stats.chunk_postproc_time', field:'query_stats.chunk_postproc_time', width:140, name:"Chunk Postproc Time", format:"{0:n0}", groupable:false}},
    {select:"SUM(query_stats.chunk_postproc_time)", display:{id:'SUM(query_stats.chunk_postproc_time)', field:'SUM(query_stats.chunk_postproc_time)', width:180, name:"SUM(Chunk Postproc Time)", format:"{0:n0}", groupable:false}},
    {select:"query_stats.chunk_merge_time", display:{id:'query_stats.chunk_merge_time', field:'query_stats.chunk_merge_time', width:130, name:"Chunk Merge Time", format:"{0:n0}", groupable:false}},
    {select:"SUM(query_stats.chunk_merge_time)", display:{id:'SUM(query_stats.chunk_merge_time)', field:'SUM(query_stats.chunk_merge_time)', width:160, name:"SUM(Chunk Merge Time)", format:"{0:n0}", groupable:false}},
    {select:"query_stats.final_merge_time", display:{id:'query_stats.final_merge_time', field:'query_stats.final_merge_time', width:130, name:"Final Merge Time", format:"{0:n0}", groupable:false}},
    {select:"SUM(query_stats.final_merge_time)", display:{id:'SUM(query_stats.final_merge_time)', field:'SUM(query_stats.final_merge_time)', width:150, name:"SUM(Final Merge Time)", format:"{0:n0}", groupable:false}}
];

qeperfQuery['defaultColumns'] = [];

qeperfQuery['queryViewModel'] = new QueryViewModel('qeperf', function(){
                                    this.defaultTRValue("1800");
                                    this.isCustomTRVisible(false);
                                    this.isTGVisible(false);
                                    queries.qeperf.selectViewModel.reset();
                                    queries.qeperf.whereViewModel.reset();
                                    queries.qeperf.filterViewModel.reset();
                                }, true);

qeperfQuery['selectViewModel'] = new SelectViewModel('vna', function() {
    this.fields([]);
    this.isEnabled['T'](true);
    this.checkedFields([]);
    this.defaultSelectAllText("Select All");
    $('#qeperf-select').val('');
});

qeperfQuery['whereViewModel'] = new WhereViewModel('qeperf', function() {
    this.opValues({name:"=", value:"="});
    //this.selectFields([]);
    this.whereClauseView([]);
    this.whereClauseSubmit([]);
    this.whereClauseEdit([]);
    this.selectedORClauseIndex("-1");
    $('#qeperf-where').val('');
});

qeperfQuery['filterViewModel'] = new FilterViewModel('qeperf', function() {
    this.filterClauseSubmit([]);
    this.filterClauseSubmit("");
    resetStatFilter(this);
    $('#qeperf-filter').val('');
});

function loadStatQEPerformance() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    setStatValidValues('StatTable.QueryPerfInfo.query_stats', 'qeperf');
    initStatQueryView('qeperf');

    ko.applyBindings(queries.qeperf.queryViewModel, document.getElementById('qeperf-query'));

    initWidgetBoxes();
    currTab = 'query_stat_cpuinfo';
};

//QE Performance Query - End

//VN Agent Stat Query - Begin

var vnaQuery = queries['vna'];

vnaQuery['columnDisplay'] = [
	{select:"T", display:{id:"T", field:"T", width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc.T); }, filterable:false, groupable:false}},
	{select:"T=", display:{id: 'T=', field:'["T="]', width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc['T=']); }, filterable:false, groupable:false}},
	{select:"UUID", display:{id:"UUID", field:"UUID", name:"UUID",  width:280, groupable:true}},
	{select:"name", display:{id:'name', field:'name', width:250, name:"Name", groupable:false}},
    {select:"vn_stats.vrouter", display:{id:'vn_stats.vrouter', field:'vn_stats.vrouter', width:120, title:"vRouter", groupable:false}},
    {select:"vn_stats.other_vn", display:{id:'vn_stats.other_vn', field:'vn_stats.other_vn', width:250, name:"Other VN", groupable:false}},
    {select:"COUNT(vn_stats)", display:{id:'COUNT(vn_stats)', field:'COUNT(vn_stats)', width:120, name:"Count(VN Stats)", format:"{0:n0}", groupable:false}},
    {select:"vn_stats.in_bytes", display:{id:'vn_stats.in_bytes', field:'vn_stats.in_bytes', width:120, name:"In Bytes", format:"{0:n0}", groupable:false}},
    {select:"SUM(vn_stats.in_bytes)", display:{id:'SUM(vn_stats.in_name)', field:'SUM(vn_stats.in_name)', width:120, name:"SUM(In Bytes)", format:"{0:n0}", groupable:false}},
    {select:"vn_stats.in_tpkts", display:{id:'vn_stats.in_tpkts', field:'vn_stats.in_tpkts', width:120, name:"In Packets", format:"{0:n0}", groupable:false}},
    {select:"SUM(vn_stats.in_tpkts)", display:{id:'SUM(vn_stats.in_tpkts)', field:'SUM(vn_stats.in_tpkts)', width:120, name:"SUM(In Packets)", format:"{0:n0}", groupable:false}},
    {select:"vn_stats.out_bytes", display:{id:'vn_stats.out_bytes', field:'vn_stats.out_bytes', width:120, name:"Out Bytes", format:"{0:n0}", groupable:false}},
    {select:"SUM(vn_stats.out_bytes)", display:{id:'SUM(vn_stats.out_bytes)', field:'SUM(vn_stats.out_bytes)', width:120, name:"SUM(Out Bytes)", format:"{0:n0}", groupable:false}},
    {select:"vn_stats.out_tpkts", display:{id:'vn_stats.out_tpkts', field:'vn_stats.out_tpkts', width:120, name:"Out Packets", format:"{0:n0}", groupable:false}},
    {select:"SUM(vn_stats.out_tpkts)", display:{id:'SUM(vn_stats.out_tpkts)', field:'SUM(vn_stats.out_tpkts)', width:120, name:"SUM(Out Packets)", format:"{0:n0}", groupable:false}}
];

vnaQuery['defaultColumns'] = [];

vnaQuery['queryViewModel'] = new QueryViewModel('vna', function() {
                                this.defaultTRValue("1800");
                                this.isCustomTRVisible(false);
                                this.isTGVisible(false);
                                queries.vna.selectViewModel.reset();
                                queries.vna.whereViewModel.reset();
                                queries.vna.filterViewModel.reset();
                            }, true);

vnaQuery['selectViewModel'] = new SelectViewModel('vna', function() {
        this.fields([]);
        this.isEnabled['T'](true);
        this.checkedFields([]);
        this.defaultSelectAllText("Select All");
        $('#vna-select').val('');
});

vnaQuery['whereViewModel'] = new WhereViewModel('vna', function() {
    this.whereClauseView([]);
    this.whereClauseSubmit([]);
    this.whereClauseEdit([]);
    this.selectedORClauseIndex("-1");
    $('#vna-where').val('');
});

vnaQuery['filterViewModel'] = new FilterViewModel('vna', function() {
    this.filterClauseSubmit([]);
    this.filterClauseSubmit("");
    resetStatFilter(this);
    $('#vna-filter').val('');
});

function loadStatVNAgent() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    setStatValidValues('StatTable.UveVirtualNetworkAgent.vn_stats', 'vna');
    initStatQueryView('vna');

    ko.applyBindings(queries.vna.queryViewModel, document.getElementById('vna-query'));

    initWidgetBoxes();
    currTab = 'query_stat_uvevnagent';
};

//VN Agent Stat Query - End

//Sandesh Message Stat Query - Begin

var smsgQuery = queries['smsg'];

smsgQuery['columnDisplay'] = [
    {select:"T", display:{id:"T", field:"T", width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc.T); }, filterable:false, groupable:false}},
    {select:"T=", display:{id: 'T=', field:'["T="]', width:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc['T=']); }, filterable:false, groupable:false}},
    {select:"UUID", display:{id:"UUID", field:"UUID", name:"UUID",  width:280, groupable:true}},
    {select:"name", display:{id:'name', field:'name', width:210, name:"Name", groupable:false}},
    {select:"Source", display:{id:'Source', field:'Source', width:210, name:"Source", groupable:false}},
    {select:"msg_info.level", display:{id:'msg_info.level', field:'msg_info.level', width:210, name:"Message Level", groupable:false}},
    {select:"msg_info.type", display:{id:'msg_info.type', field:'msg_info.type', width:210, name:"Message Type", groupable:false}},
    {select:"COUNT(msg_info)", display:{id:'COUNT(msg_info)', field:'COUNT(msg_info)', width:120, name:"Count", format:"{0:n0}", groupable:false}},
    {select:"msg_info.messages", display:{id:'msg_info.messages', field:'msg_info.messages', width:120, name:"Messages", format:"{0:n0}", groupable:false}},
    {select:"SUM(msg_info.messages)", display:{id:'SUM(msg_info.messages)', field:'SUM(msg_info.messages)', width:120, name:"SUM(Messages)", format:"{0:n0}", groupable:false}},
    {select:"msg_info.bytes", display:{id:'msg_info.bytes', field:'msg_info.messages', width:120, name:"Bytes", format:"{0:n0}", groupable:false}},
    {select:"SUM(msg_info.bytes)", display:{id:'SUM(msg_info.bytes)', field:'SUM(msg_info.bytes)', width:120, name:"SUM(Bytes)", format:"{0:n0}", groupable:false}}
];

smsgQuery['defaultColumns'] = [];

smsgQuery['queryViewModel'] = new QueryViewModel('smsg', function() {
    this.defaultTRValue("1800");
    this.isCustomTRVisible(false);
    this.isTGVisible(false);
    queries.smsg.selectViewModel.reset();
    queries.smsg.whereViewModel.reset();
    queries.smsg.filterViewModel.reset();
}, true);

smsgQuery['selectViewModel'] = new SelectViewModel('vna', function() {
    this.fields([]);
    this.isEnabled['T'](true);
    this.checkedFields([]);
    this.defaultSelectAllText("Select All");
    $('#smsg-select').val('');
});

smsgQuery['whereViewModel'] = new WhereViewModel('vna', function() {
    this.whereClauseView([]);
    this.whereClauseSubmit([]);
    this.whereClauseEdit([]);
    this.selectedORClauseIndex("-1");
    $('#smsg-where').val('');
});

smsgQuery['filterViewModel'] = new FilterViewModel('smsg', function() {
    this.filterClauseSubmit([]);
    this.filterClauseSubmit("");
    resetStatFilter(this);
    $('#smsg-filter').val('');
});

function loadStatSandeshMsg() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    setStatValidValues('StatTable.SandeshMessageStat.msg_info', 'smsg');
    initStatQueryView('smsg');

    ko.applyBindings(queries.smsg.queryViewModel, document.getElementById('smsg-query'));

    initWidgetBoxes();
    currTab = 'query_stat_smsg';
};

//Sandesh Message Stat Query - End

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
