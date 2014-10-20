/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var flowSeriesObj = new flowSeriesObj(),
    flowRecordsObj = new flowRecordsObj(),
    flowQueryQueueObj = new flowQueryQueueObj();

var qeTemplate = $("#qe-template").html();

var fsQuery = queries['fs'],
    frQuery = queries['fr'];

fsQuery['columnDisplay'] = [
    {select:"T", display:{id:"T", field:"T", width:180, minWidth:180, name:"Time", formatter: function(r, c, v, cd, dc){ return formatMicroDate(dc.T);}, filterable:false, groupable:false}},
    {select:"vrouter", display:{id:"vrouter",field:"vrouter", width:150, name:"Virtual Router", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.vrouter);}}},
    {select:"sourcevn", display:{id:"sourcevn",field:"sourcevn", width:250, name:"Source VN", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourcevn);}}},
    {select:"destvn", display:{id:"destvn", field:"destvn", width:250, name:"Destination VN", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destvn);}}},
    {select:"sourceip", display:{id:"sourceip", field:"sourceip", width:120, name:"Source IP", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourceip);}}},
    {select:"destip", display:{id:"destip", field:"destip", width:120, name:"Destination IP", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destip);}}},
    {select:"sport", display:{id:"sport", field:"sport", width:120, name:"Source Port", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sport);}}},
    {select:"dport", display:{id:"dport", field:"dport", width:120, name:"Destination Port", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.dport);}}},
    {select:"direction_ing", display:{id:"direction_ing", field:"direction_ing", width:120, name:"Direction", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getDirName(dc.direction_ing));}}},
    {select:"protocol", display:{id:"protocol", field:"protocol", width:100, name:"Protocol", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getProtocolName(dc.protocol));}}},
    {select:"bytes", display:{id:"bytes", field:"bytes", width:120, name:"Bytes", format:"{0:n0}", groupable:false}},
    {select:"sum(bytes)", display:{id:"sum_bytes", field:"sum_bytes", width:100, name:"SUM(Bytes)", format:"{0:n0}", groupable:false}},
    {select:"avg(bytes)", display:{id:"avg_bytes", field:"avg_bytes", width:100, name:"AVG(Bytes)", format:"{0:n0}", groupable:false}},
    {select:"packets", display:{id:"packets", field:"packets", width:100, name:"Packets", format:"{0:n0}", groupable:false}},
    {select:"sum(packets)", display:{id:"sum_packets", field:"sum_packets", width:100, name:"SUM(Packets)", format:"{0:n0}", groupable:false}},
    {select:"avg(packets)", display:{id:"avg_packets", field:"avg_packets", width:100, name:"AVG(Packets)", format:"{0:n0}", groupable:false}}
];

fsQuery['fcColumnDisplay'] = [
    {select:"sourcevn", display:{id:"sourcevn", field:"sourcevn", name:"Source VN", width:275, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourcevn);}}},
    {select:"destvn", display:{id:"destvn", field:"destvn", name:"Destination VN", width:275, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destvn);}}},
    {select:"sourceip", display:{id:"sourceip", field:"sourceip", name:"Source IP", width:120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourceip);}}},
    {select:"destip", display:{id:"destip", field:"destip", name:"Destination IP", width:120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destip);}}},
    {select:"sport", display:{id:"sport", field:"sport", name:"Source Port", width:120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sport);}}},
    {select:"dport", display:{id:"dport", field:"dport", name:"Destination Port", width:120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.dport);}}},
    {select:"protocol", display:{id:"protocol", field:"protocol", name:"Protocol", width:80, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getProtocolName(dc.protocol));}}}
];

frQuery['columnDisplay'] = [
    {select:"setup_time", display:{id:"setup_time", field:"setup_time", width:180, minWidth:180, name:"Setup Time", formatter: function(r, c, v, cd, dc){ return formatMicroDate(dc.setup_time); }, filterable:false, groupable:false}},
    {select:"teardown_time", display:{id:"teardown_time", field:"teardown_time", width:210, name:"Teardown Time", formatter: function(r, c, v, cd, dc){ return formatMicroDate(dc.teardown_time); }, filterable:false, groupable:false}},
    {select:"vrouter", display:{id:"vrouter", field:"vrouter", width:150, name:"Virtual Router", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.vrouter);}}},
    {select:"sourcevn", display:{id:"sourcevn", field:"sourcevn", width:250, name:"Source VN", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourcevn);}}},
    {select:"destvn", display:{id:"destvn", field:"destvn", width:250, name:"Destination VN", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destvn);}}},
    {select:"sourceip", display:{id:"sourceip", field:"sourceip", width:120, name:"Source IP", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourceip);}}},
    {select:"destip", display:{id:"destip", field:"destip", width:120, name:"Destination IP", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destip);}}},
    {select:"sport", display:{id:"sport", field:"sport", width:120, name:"Source Port", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sport);}}},
    {select:"dport", display:{id:"dport", field:"dport", width:120, name:"Destination Port", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.dport);}}},
    {select:"direction_ing", display:{id:"direction_ing", field:"direction_ing", width:120, name:"Direction", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getDirName(dc.direction_ing));}}},
    {select:"protocol", display:{id:"protocol", field:"protocol", width:120, name:"Protocol", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getProtocolName(dc.protocol));}}},
    {select:"agg-bytes", display:{id:'["agg-bytes"]', field:'["agg-bytes"]', width:120, name:"Aggregate Bytes", format:"{0:n0}", groupable:false}},
    {select:"agg-packets", display:{id:'["agg-packets"]', field:'["agg-packets"]', width:120, name:"Aggregate Packets", format:"{0:n0}", groupable:false}}
];

frQuery['defaultColumns'] = ['vrouter', 'sourcevn', 'sourceip', 'sport', 'destvn', 'destip', 'dport', 'protocol', 'direction_ing'];
fsQuery['defaultColumns'] = ['flow_class_id', 'direction_ing'];

function getDirName(dirId) {
    if (dirId == 1) {
        return "INGRESS";
    } else if (dirId == 0) {
        return "EGRESS";
    } else {
        return dirId;
    }
};

function initFlowPages() {
    initConfirmWindow4Queue("fqq");
};

function flowSeriesObj() {
    this.load = loadFlowSeries;
    this.destroy = function() {};
};

function flowRecordsObj() {
    this.load = loadFlowRecords;
    this.destroy = function() {};
};

function flowQueryQueueObj() {
    this.load = loadFlowQueryQueue;
    this.destroy = function() {};
};

function ChartViewModel() {
    this.isFCLoaded = ko.observable(false);
    this.flowClasses = ko.observableArray([]);
    this.fsChartData = ko.observable({});
    this.seriesValues = ko.observableArray([]);
    this.navigatorValues = ko.observableArray([]);
    this.plotFields = ko.observableArray([]);
    this.options = ko.observable({});
    this.selectedFlows = ko.observableArray([]);

    this.reset = function() {};
};

//Flow Series Query - Begin
function FlowFilterViewModel(queryPrefix, resetFunction) {
    this.orderTypes = [
        { name: "ASC", value: "asc" },
        { name: "DESC", value: "desc"}
    ];
    this.checkedOrderBy = ko.observableArray([]);
    this.checkedFilters = ko.observableArray([]);
    this.isEnabled = getFSDefaultFilterIsEnabled();
    this.limit = ko.observable("");
    this.sortOrder = ko.observable("asc");
    this.reset = resetFunction;
};

fsQuery['queryViewModel'] = new QueryViewModel('fs', function() {
                                this.defaultTRValue("1800");
                                this.isCustomTRVisible(false);
                                this.isTGVisible(false);
                                this.defaultDirectionValue("1");
                                queries.fs.selectViewModel.reset();
                                queries.fs.whereViewModel.reset();
                                queries.fs.filterViewModel.reset();
                            }, true);

fsQuery['chartViewModel'] = new ChartViewModel();

fsQuery['selectViewModel'] = new SelectViewModel('fs', function() {
        this.checkedFields([]);
        this.isEnabled["bytes"](true);
        this.isEnabled["packets"](true);
        this.isEnabled["sum(bytes)"](true);
        this.isEnabled["sum(packets)"](true);
        this.defaultSelectAllText("Select All");
        $('#fs-select').val('');
});

fsQuery['whereViewModel'] = new WhereViewModel('fs', function() {
        //this.selectFields([]);
        this.whereClauseView([]);
        this.whereClauseSubmit([]);
        this.whereClauseEdit([]);
        this.selectedORClauseIndex('-1');
        $('#fs-where').val('');
    });

fsQuery['filterViewModel'] = new FlowFilterViewModel('fs', function() {
    this.checkedOrderBy([]);
    this.checkedFilters([]);
    this.isEnabled = getFSDefaultFilterIsEnabled();
    this.limit("");
    this.sortOrder("asc");
    $('#fs-filter').val('');
});

function getFSDefaultFilterIsEnabled() {
    return {
        "sourcevn": ko.observable(false), "destvn": ko.observable(false), "sourceip": ko.observable(false),
        "destip": ko.observable(false), "sport": ko.observable(false), "dport": ko.observable(false), "protocol": ko.observable(false),
        "sort": ko.observable(false), "bytes": ko.observable(false), "sum(bytes)": ko.observable(false), "packets": ko.observable(false),
        "sum(packets)": ko.observable(false), "vrouter": ko.observable(false)
    };
};

function loadFlowSeries() {
    var urlHashParams = layoutHandler.getURLHashParams(), autoRun;
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    setFSValidValues();
    initFSQueryView('fs');
    ko.applyBindings(queries.fs.queryViewModel, document.getElementById('fs-query'));
    ko.applyBindings(queries.fs.chartViewModel, document.getElementById('fs-chart'));

    initWidgetBoxes();
    currTab = 'query_flow_series';

    autoRun = urlHashParams['autorun'];
    if (autoRun == "true") {
        autoRunFlowSeries(urlHashParams);
    }
};

function autoRunFlowSeries(urlHashParams) {
    var queryJSON = {"table":'FlowSeriesTable', "start_time":"", "end_time":"", "select_fields":[]},
        tg = 60, tgUnit = 'secs', whereClauseAND, selectClause, whereClause = [];
    queryJSON["start_time"] = urlHashParams["start_time"];
    queryJSON["end_time"] = urlHashParams["end_time"];
    selectClause = splitString2Array(urlHashParams["select_fields"], "|");
    queryJSON["select_fields"] = ['flow_class_id', "direction_ing"].concat(selectClause);
    whereClauseAND = constructWhereClause(urlHashParams["sourcevn"], urlHashParams["sport"], urlHashParams["dport"]);
    if (whereClauseAND.length > 0) {
        whereClause.push([
            {name:"protocol", value:"6", op:1}
        ].concat(whereClauseAND));
        whereClause.push([
            {name:"protocol", value:"17", op:1}
        ].concat(whereClauseAND));
        queryJSON['where'] = whereClause;
    }
    queryJSON['dir'] = 1;
    populateFSQueryForm(queryJSON, tg, tgUnit);
    runFSQuery();
}

function constructWhereClause(sourceVN, sPort, dPort) {
    var whereClause = [], portArray, port;
    if (sourceVN && sourceVN != "") {
        whereClause.push({name:"sourcevn", value:sourceVN, op:1});
    }
    if (sPort && sPort != "") {
        portArray = splitString2Array(sPort, "-");
        if (portArray.length == 2) {
            whereClause.push({name:"sport", value:portArray[0], value2:portArray[1], op:3});
        }
    } else if (dPort && dPort != "") {
        portArray = splitString2Array(dPort, "-");
        if (portArray.length == 2) {
            whereClause.push({name:"dport", value:portArray[0], value2:portArray[1], op:3});
        }
    }
    return whereClause;
}

function initFSQueryView(queryPrefix) {
    var query = queries[queryPrefix],
        defaultToTime = new Date(),
        defaultFromTime = new Date(defaultToTime.getTime() - 600000);
    $('#' + queryPrefix + '-query').html($('#' + queryPrefix + "-query-template").html());

    validateDate('fs');

    $("#fs-query-form").validate({
        errorClass: 'jqInvalid',
        rules: {
            select: "required",
            checkValidDate: true
        },
        messages: {
            select:{ required: '<i class="icon-warning-sign"></i> Select Required'}
        },
        errorPlacement: function(label, element) {
            label.insertAfter(element.parent());
        }
    });
    query.fromTime = createNewDTPicker(queryPrefix, queryPrefix + '-from-time', showFromTime, onSelectFromDate, defaultFromTime);
    query.toTime = createNewDTPicker(queryPrefix, queryPrefix + '-to-time', showToTime, onSelectToDate, defaultToTime);

    query.selectTemplate = $('#' + queryPrefix + '-select-popup-template').html();
    query.filterTemplate = $('#' + queryPrefix + '-filter-popup-template').html();
};

function openFSSelect() {
    openSelect('fs');
};

function openFSFilter() {
    var queryPrefix = 'fs', query = queries[queryPrefix];

    $('#' + queryPrefix + '-filter-popup-container').remove();
    $('body').append(query.filterTemplate);

    query.filterWindow = $('#' + queryPrefix + '-filter-popup-container');
    ko.applyBindings(query.filterViewModel, document.getElementById(queryPrefix + '-filter-popup-container'));
    query.filterWindow.modal('show');
};

function addFSSelect() {
    var queryPrefix = 'fs', query = queries[queryPrefix],
        selectedFields = $('#fs-select-popup-form').serializeArray(),
        selectValue = "", fieldValue, checkedFields = [];
    query.selectWindow.modal('hide');
    $.each(selectedFields, function (i, selectedFields) {
        fieldValue = selectedFields.value;
        checkedFields.push(fieldValue);
        selectValue += (i != 0 ? ", " : "") + fieldValue;
    });
    /*
    if (checkedFields.indexOf('bytes') != -1 || checkedFields.indexOf('packets') != -1) {
        selectValue = 'T, ' + selectValue;
    }*/
    query.selectViewModel.checkedFields(checkedFields);
    $('#fs-select').val(selectValue);
    initTimeGranularity(checkedFields, query, queryPrefix);
    resetFSCheckedFilters(checkedFields);
};

function resetFSCheckedFilters(checkedFields) {
    var query = queries['fs'],
        filtersModel = query.filterViewModel,
        fsFilterSortFields = filtersModel.isEnabled;
    fsFilterSortFields['sort'](false);
    for (key in fsFilterSortFields) {
        if(key != 'sort') {
            if (checkedFields.indexOf(key) != -1) {
                fsFilterSortFields[key](true);
                if (!fsFilterSortFields['sort']()) {
                    fsFilterSortFields['sort'](true);
                }
            } else {
                fsFilterSortFields[key](false);
            }
        }
    }
    filtersModel.checkedOrderBy([]);
    addFSFilter();
}

function addFSFilter() {
    var queryPrefix = 'fs', query = queries[queryPrefix],
        selectedFields = $('#' + queryPrefix + '-filter-popup-form').serializeArray(),
        orderByValue = "", checkedFilters = [],
        sortOrder = null, limit, fieldValue;
    if (query.filterWindow != "") {
        query.filterWindow.modal('hide');
    }
    $.each(selectedFields, function (i, selectedFields) {
        if (selectedFields.name == 'sortBy') {
            fieldValue = selectedFields.value;
            checkedFilters.push(fieldValue);
            orderByValue += (orderByValue.length != 0 ? ", " : "sort_fields: [") + fieldValue;
        }
    });
    if (orderByValue != '') {
        orderByValue += "]";
        sortOrder = $("#" + queryPrefix + "-filter-popup-form select[name=sortOrder]").val();
        orderByValue += ", sort: " + sortOrder;
    }
    limit = $("#" + queryPrefix + "-filter-popup-form input[name=limit]").val();
    if (limit != null && limit.length > 0) {
        orderByValue += (orderByValue.trim() == '' ? '' : ', ') + "limit: " + limit;
    }
    query.filterViewModel.checkedFilters(checkedFilters);
    query.filterViewModel.limit(limit);
    query.filterViewModel.sortOrder(sortOrder);
    $("#" + queryPrefix + "-filter").val(orderByValue);
};

function runFSQuery() {
	toggleToGrid('fs');
    var serverCurrentTime = getCurrentTime4MemCPUCharts();
    $.ajax({
        url: '/api/service/networking/web-server-info'
    }).done(function (resultJSON) {
        serverCurrentTime = resultJSON['serverUTCTime'];
    }).always(function() {
        runFSQueryCB(serverCurrentTime)
    });
}

function runFSQueryCB(serverCurrentTime) {
    var reqQueryObj = $('#fs-query-form').serializeObject(),
        queryPrefix = 'fs',
        select = $("#fs-query-form input[name='select']").val(),
        showChartToggle = (select.indexOf('time-granularity') != -1) ? true : false,
        options = getFSDefaultOptions(showChartToggle),
        queryId, fsGridDisplay, selectArray, labelStepUnit, fcGridDisplay,
        tg, tgUnit;
    options['serverCurrentTime'] = serverCurrentTime;
    if ($("#" + queryPrefix + "-query-form").valid()) {
    	collapseWidget('#fs-query-widget');
        queryId = randomUUID();
        options.queryId = queryId;
        reqQueryObj = setUTCTimeObj('fs', reqQueryObj, options);
        reqQueryObj.table = 'FlowSeriesTable';
        reqQueryObj.queryId = queryId;
        reqQueryObj.async = 'true';
        reqQueryObj.autoSort = 'true';
        reqQueryObj.autoLimit = 'true';
        selectArray = parseStringToArray(select, ',');
        selectArray = selectArray.concat(queries['fs']['defaultColumns']);
        if(selectArray.indexOf('time-granularity') != -1) {
            selectArray.push('T');
        }
        fsGridDisplay = getFSColumnDisplay4Grid(queries['fs']['columnDisplay'], selectArray);
        fcGridDisplay = getFSColumnDisplay4Grid(queries['fs']['fcColumnDisplay'], selectArray);
        if (selectArray.indexOf('time-granularity') != -1) {
            tg = $('#fs-tg-value').val();
            tgUnit = $('#fs-tg-units').val();
            labelStepUnit = getLabelStepUnit(tg, tgUnit);
            options.labelStep = labelStepUnit.labelStep;
            options.baseUnit = labelStepUnit.baseUnit;
            options.interval = labelStepUnit.secInterval;
        }
        reqQueryObj.engQueryStr = getEngQueryStr(reqQueryObj);
        loadFlowResults(options, reqQueryObj, fsGridDisplay, fcGridDisplay);
    }
};

function viewFSQueryResults(dataItem, params) {
	var serverCurrentTime = getCurrentTime4MemCPUCharts();
    $.ajax({
        url: '/api/service/networking/web-server-info'
    }).done(function (resultJSON) {
        serverCurrentTime = resultJSON['serverUTCTime'];
	}).always(function() {
        viewFSQueryResultsCB(dataItem, params, serverCurrentTime);
    });
}

function viewFSQueryResultsCB(dataItem, params, serverCurrentTime) {
    var options = null, queryId = dataItem.queryId,
        queryJSON = dataItem.queryJSON, reqQueryObj = {},
        tg = dataItem.tg, tgUnit = dataItem.tgUnit, tgIndex,
        reRun = params['reRun'], timeObj = params['timeObj'],
        reRunQueryObj = params['reRunQueryObj'], queryPrefix = params['queryPrefix'],
        selectArray, fsGridDisplay, labelStepUnit, fcGridDisplay, reRunTimeRange;
    selectArray = queryJSON['select_fields'];
    if(reRun) {
        if(timeObj["reRunTimeRange"] != null) {
            reRunTimeRange = parseInt(timeObj["reRunTimeRange"]);
            timeObj['fromTime'] = timeObj['fromTimeUTC'] = serverCurrentTime - (reRunTimeRange*1000);
            timeObj['toTime'] = timeObj['toTimeUTC'] = serverCurrentTime;
            reRunQueryObj.engQueryStr = getEngQueryStr(reRunQueryObj);
        }
        queryId = randomUUID();
        reqQueryObj = reRunQueryObj;
        reqQueryObj = setUTCTimeObj(queryPrefix, reqQueryObj, options, timeObj);
    }

    reqQueryObj.queryId = queryId;

    if(typeof(ko.dataFor(document.getElementById(queryPrefix + '-query'))) !== "undefined"){
        ko.cleanNode(document.getElementById(queryPrefix + '-query'));
        ko.cleanNode(document.getElementById(queryPrefix + '-chart'));
    }

    setFSValidValues();
    initFSQueryView(queryPrefix);
    collapseOtherWidgets(queryPrefix);
    ko.applyBindings(queries[queryPrefix].queryViewModel, document.getElementById(queryPrefix + '-query'));
    ko.applyBindings(queries[queryPrefix].chartViewModel, document.getElementById(queryPrefix + '-chart'));
    initWidget4Id('#' + queryPrefix + '-query-widget');

    if (tg != '' && tgUnit != '' && selectArray.indexOf("T=" + getTGmicrosecs(tg, tgUnit) / 1000) != -1) {
        options = getFSDefaultOptions(true);
        selectArray.push('time-granularity');
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
        options = getFSDefaultOptions(false);
    }

    populateFSQueryForm(queryJSON, tg, tgUnit, timeObj.reRunTimeRange);
    toggleToGrid();
    fsGridDisplay = getFSColumnDisplay4Grid(queries['fs']['columnDisplay'], selectArray);
    fcGridDisplay = getFSColumnDisplay4Grid(queries['fs']['fcColumnDisplay'], selectArray);
    collapseWidget('#' + queryPrefix + '-query-widget');
    $('#' + queryPrefix +'-chart-loading').show();
    loadFlowResults(options, reqQueryObj, fsGridDisplay, fcGridDisplay);
};

function populateFSQueryForm(queryJSON, tg, tgUnit, reRunTimeRange) {
    var queryPrefix = 'fs', selectFields = queryJSON['select_fields'];
    resetTGValues(true, 'fs');
    populateTimeRange(queryPrefix, queryJSON['start_time'], queryJSON['end_time'], reRunTimeRange);
    populateSelect(queryPrefix, selectFields, queries['fs']['defaultColumns']);
    populateTimeGranularity(queryPrefix, selectFields, tg, tgUnit);
    if (queryJSON['where'] != null) {
        populateWhere(queryPrefix, queryJSON['where']);
    }
    populateDirection(queryPrefix, queryJSON['dir']);
    populateFilter(queryPrefix, queryJSON['sort_fields'], queryJSON['sort'], queryJSON['limit']);
};

function getFSDefaultOptions(showChartToggle) {
    return {
        elementId:'fs-results', gridHeight:480, timeOut:120000,
        pageSize:100, queryPrefix:'fs', export:true, showChartToggle:showChartToggle,
        labelStep:1, baseUnit:'mins', fromTime:0, toTime:0, interval:0,
        btnId:'fs-query-submit', refreshChart: true
    };
};

function setFSValidValues() {
    queries.fs.whereViewModel.selectFields(flowWhereFields);
    setNetworkValues('/api/admin/networks', ['sourcevn_sourceip', 'destvn_destip'], queries.fs.whereViewModel);
    setProtocolValues(['protocol_sport', 'protocol_dport'], queries.fs.whereViewModel);
    //TODO: Create a cache and get the values from that cache
};

function setVrouterValues(viewModelKey, viewModel) {
    var computeDS = new SingleDataSource('computeNodeDS');
    var result = computeDS.getDataSourceObj();
    $(computeDS).on('change',function(){
        var items = result['dataSource'].getItems(),data = [];
        for(var i = 0; i < items.length; i++){
            data.push({name:items[i]['name'],value:items[i]['name']});
        }
        var validValueObservable = ko.observableArray(data);
        viewModel[viewModelKey] = validValueObservable;
    });
}

function setNetworkValues(url, viewModelKeys, viewModel) {
    $.ajax({
        url:url,
        dataType:"json",
        success:function (response) {
            var validValueDS = formatNetworkNames(response);
            var validValueObservable = ko.observableArray([]);
            validValueObservable(validValueDS);
            for (var i = 0; i < viewModelKeys.length; i++) {
                viewModel[viewModelKeys[i]] = validValueObservable;
            }
            /*Initializing the combobox in first where clause with the network names 
            var element = 'append-where-clause-1';
            if($("#"+element).find("input[name='value[]']").length > 0){
                var comboBoxElement = $("#"+element).find("input[name='value[]']"),
                    fieldName = $('#' + element).find("select[name='field[]']").val();
                comboBoxElement.contrailCombobox({
                    placeholder:(placeHolders[fieldName] != null ? placeHolders[fieldName][0] : 'Select'),
                    dataTextField:"name",
                    dataValueField:"value",
                    dataSource:{
                        type: 'local',
                        data:validValueObservable()
                    }, 
                    change: function(e, ui){
                        validateOrClause(element);
                        setORClauseTerm('fr',$('#' + element).parents('.or-clause-item'));
                    }
                });
            }*/
        }
    });
};

function setProtocolValues(viewModelKeys, viewModel) {
    protocolList.sort(objValueComparator);
    var protocolObservable = ko.observableArray([]);
    protocolObservable(protocolList);
    for (var i = 0; i < viewModelKeys.length; i++) {
        viewModel[viewModelKeys[i]] = protocolObservable;
    }
};

function formatNetworkNames(response, tableName) {
    var res = jsonPath(response, "$.virtual-networks[*].fq_name"),
        i, results = [];
    for (i = 0; i < res.length; i++) {
        results.push({"name":res[i].join(':'), "value":res[i].join(':')});
    }
    results.sort(objValueComparator);
    return results;
};

function loadSelectedFSChart(element) {
    var val = parseInt(element.value),
        selectedFlows = queries.fs.chartViewModel.selectedFlows(),
        selector = "#ts-chart",
        navigatorValues = queries.fs.chartViewModel.navigatorValues(),
        plotFields = queries.fs.chartViewModel.plotFields(),
        options = queries.fs.chartViewModel.options(),
        availableColorIndices = getAvailableColorIndices('fs'),
        index, plotData = [], selectedFlow, flowClassId;
    index = findIndexInSelectedFlows(selectedFlows, val);
    if (element.checked) {
        if (selectedFlows.length >= 5) {
            $(element).prop('checked', false);
            showMessagePopup('Alert', 'You can select maximum 5 flows.');
            return;
        } else if (index == -1) {
            selectedFlows.push({flowClassId:val, sumBytes:null, sumPackets:null, r:$(element).data('id'), colorIndex: availableColorIndices[0]});
        }
    } else {
        if (selectedFlows.length == 1) {
            $(element).prop('checked', true);
            showMessagePopup('Alert', 'You must select at least 1 flow.');
            return;
        }
        if (index != -1) {
            selectedFlow = selectedFlows[index];
            flowClassId = selectedFlow['flowClassId'];
            assignColors2FlowClass({"flowClassId":flowClassId, "sumBytes":null, "sumPackets":null, r:$(element).data('id'), colorIndex: availableColorIndices[0]});
            selectedFlows.splice(index, 1);
        }
    }
    createFSChart(selector, queries.fs.chart);
};

function findIndexInSelectedFlows(selectedFlows, val) {
    for (var i = 0; i < selectedFlows.length; i++) {
        if (selectedFlows[i]['flowClassId'] == val) {
            return i;
        }
    }
    return -1;
}

function onChangeTGSelect(element) {
    var fsSelectModel = queries.fs.selectViewModel,
        checkedFields = fsSelectModel.checkedFields,
        selectFields = true, selectSumFields = false;
    if (element.checked) {
        checkedFields.remove('bytes');
        checkedFields.remove('packets');
        selectFields = false;
        selectSumFields = true;
    } else {
        selectFields = true;
        selectSumFields = true;
    }
    fsSelectModel.isEnabled['bytes'](selectFields);
    fsSelectModel.isEnabled['packets'](selectFields);
    fsSelectModel.isEnabled['sum(bytes)'](selectSumFields);
    fsSelectModel.isEnabled['sum(packets)'](selectSumFields);
};

function onChangeFSSelect(element, disableIds, enableTG) {
    var fsSelectModel = queries.fs.selectViewModel,
        checkedFields = fsSelectModel.checkedFields;
    if (checkedFields.indexOf('time-granularity') == -1) {
        if (element.checked) {
            for (var i = 0; i < disableIds.length; i++) {
                checkedFields.remove(disableIds[i]);
                fsSelectModel.isEnabled[disableIds[i]](false);
            }
        } else {
            for (var i = 0; i < disableIds.length; i++) {
                fsSelectModel.isEnabled[disableIds[i]](true);
            }
        }
        if(enableTG != null && enableTG) {
            checkedFields.push('time-granularity');
        }
    }
};

function formatTime4Tip(dataItem) {
    if (dataItem == null || dataItem.date == null) {
        return '';
    } else {
        return ' at ' + moment(new Date(dataItem.date)).format('HH:mm');
    }
}
//Flow Series Query - End

//Flow Record Query - Begin
frQuery['queryViewModel'] = new QueryViewModel('fr', function() {
                                this.defaultTRValue("600");
                                this.isCustomTRVisible(false);
                                this.defaultDirectionValue("1");
                                queries.fr.selectViewModel.reset();
                                queries.fr.whereViewModel.reset();
                            }, false);

frQuery['selectViewModel'] = new SelectViewModel('fr', function() {
        this.checkedFields([]);
	    this.defaultSelectAllText("Select All");
        $('#fr-select').val('');
});

frQuery['whereViewModel'] = new WhereViewModel('fr', function(){
        //this.selectFields([]);
        this.whereClauseView([]);
        this.whereClauseSubmit([]);
        this.selectedORClauseIndex('-1');
        $('#fr-where').val('');
    });

function loadFlowRecords() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);
    initFRQueryView('fr');
    ko.applyBindings(queries.fr.queryViewModel, document.getElementById('fr-query'));

    initWidgetBoxes();
    currTab = 'query_flow_records';
};

/*function openWhereWithUnderlay(queryPrefix) {
    var query = queries[queryPrefix],
    whereClauseView = query.whereViewModel.whereClauseView(),
//  whereClauseEdit = query.whereViewModel.whereClauseSubmit(),
    selectedORClauseIndex = parseInt(query.whereViewModel.selectedORClauseIndex());
    
    query.orClauseTemplate = contrail.getTemplate4Id(((queryPrefix == 'fs' || queryPrefix == 'fr') ? 'flow-' : '') + 'or-clause-template');
    query.newORClauseTemplate = contrail.getTemplate4Id('new-or-clause-template');
    
    ko.applyBindings(query.whereViewModel, document.getElementById(queryPrefix + '-or-clauses'));
    $('#' + queryPrefix + '-or-clauses').append(query.orClauseTemplate({
        queryPrefix: queryPrefix,
        whereClauseView: $.makeArray(whereClauseView)
    }));
    $.each(whereClauseView, function(orKey, orVal){
        $.each(orVal.whereClauseEdit, function(andKey, andVal){
            ko.applyBindings(query.whereViewModel, document.getElementById(queryPrefix + '-where-clause-' + orKey + '-' + andKey));
            loadWhereOptions(queryPrefix + '-where-clause-' + orKey + '-' + andKey, queryPrefix, andVal['value'], (contrail.checkIfExist(andVal['value2']) ? andVal['value2'] : ''));
        });
    });
    selectNewORClause(queryPrefix);
}*/

function initFRQueryView(queryPrefix) {
    var query = queries[queryPrefix],
        defaultToTime = new Date(),
        defaultFromTime = new Date(defaultToTime.getTime() - 600000);
    $('#' + queryPrefix + '-query').html($("#" + queryPrefix +"-underlay-query-template").html());
    query.selectViewModel.checkedFields(["setup_time","teardown_time","agg-bytes","agg-packets"]);
    validateDate('fr');
    query.fromTime = createNewDTPicker(queryPrefix, queryPrefix + '-from-time', showFromTime, onSelectFromDate, defaultFromTime);
    query.toTime = createNewDTPicker(queryPrefix, queryPrefix + '-to-time', showToTime, onSelectToDate, defaultToTime);
    query.selectTemplate = $('#' + queryPrefix + '-select-popup-template').html();
    query.filterTemplate = $('#' + queryPrefix + '-filter-popup-template').html();
};

function openFRSelect() {
    openSelect('fr');
};

function addFRSelect() {
    addSelect('fr');
};

function runFRQuery() {
    var reqQueryObj = $('#fr-query-form').serializeObject(),
        //validator = initValidateDate("fr"),
        queryPrefix = 'fr',
        options = getFRDefaultOptions(),
        select = "setup_time, teardown_time, agg-bytes, agg-packets",
        columnDisplay, selectArray, queryId;
        reqQueryObj.where = addWhereForUnderLay('fr');
    //if ($("#" + queryPrefix + "-query-form").valid()) {
    	//collapseWidget('#fr-query-widget');
    	$("#"+queryPrefix+"-results").data('endTime',new Date().getTime());
    	var startTime = (new Date().getTime() - (parseInt(reqQueryObj['timeRange']) * 1000));
    	$("#"+queryPrefix+"-results").data('startTime',startTime);
        reqQueryObj.select = select;
        queryId = randomUUID();
        reqQueryObj = setUTCTimeObj('fr', reqQueryObj);
        reqQueryObj.table = 'FlowRecordTable';
        reqQueryObj.queryId = queryId;
        reqQueryObj.async = 'true';
        selectArray = parseStringToArray(select, ',');
        selectArray = selectArray.concat(queries['fr']['defaultColumns']);
        columnDisplay = getColumnDisplay4Grid(queries['fr']['columnDisplay'], selectArray, true);
        reqQueryObj.engQueryStr = getEngQueryStr(reqQueryObj);
        loadFlowResultsForUnderlay(options, reqQueryObj, columnDisplay);
    //}
};
function addWhereForUnderLay(queryPrefix) {
    var query = queries[queryPrefix];
    query.whereViewModel.whereClauseView([]);
    query.whereViewModel.whereClauseSubmit([]);
    
    var whereClauseArray =  query.whereViewModel.whereClauseView(),
        whereClauseSubmitArray = query.whereViewModel.whereClauseSubmit();
    
    $('#' + queryPrefix + '-or-clauses').find('.or-clause-item').each(function(){
        if($(this).attr('id') != 'fs-or-clause-item-new-term'){
            var fieldArray = [], opArray = [], valArray = [], val2Array = [],
                whereClauseViewStr = "", i, length, whereForm, splitFlowFieldArray = [],
                whereClauseSubmit = [];
        
            whereForm = $(this);
            whereForm.find("select[name='field[]']").each(function () {
                fieldArray.push($(this).val());
            });
            whereForm.find("select[name='operator[]']").each(function () {
                opArray.push($(this).val());
            });
            whereForm.find("input[name='value[]']").each(function () {
                valArray.push($(this).data('contrailCombobox').value());
            });
            if (queryPrefix == 'fs' || queryPrefix == 'fr') {
                whereForm.find("input[name='value2[]']").each(function () {
                    val2Array.push($(this).val());
                });
            }
            length = fieldArray.length;
            for (i = 0; i < length; i += 1) {
                if (queryPrefix == 'fs' || queryPrefix == 'fr') {
                    splitFlowFieldArray = fieldArray[i].split('_');
                    whereClauseViewStr += (valArray[i] != '') ? (((i != 0 && whereClauseViewStr != '') ? " AND " : "") + splitFlowFieldArray[0] + " " + opArray[i] + " " + valArray[i]) : "";
                    whereClauseViewStr += (val2Array[i] != '') ? (((whereClauseViewStr != '') ? " AND " : "") + splitFlowFieldArray[1] + " " + opArray[i] + " " + val2Array[i]) : "";
                    whereClauseSubmit.push({field:fieldArray[i], operator:opArray[i], value:valArray[i], value2:val2Array[i] });
                } else {
                    whereClauseViewStr += (valArray[i] != '') ? (((i != 0 && whereClauseViewStr != '') ? " AND " : "") + fieldArray[i] + " " + opArray[i] + " " + valArray[i]) : "";
                    whereClauseSubmit.push({field:fieldArray[i], operator:opArray[i], value:valArray[i]});
                }
            }
            if (whereClauseViewStr != "") {
                whereClauseArray.push({text: "(" + whereClauseViewStr + ")", whereClauseEdit: whereClauseSubmit});
                whereClauseSubmitArray.push(whereClauseSubmit);
            }
        }
    });
    var whereClause = query.whereViewModel.whereClauseView(),
        whereClauseStr = "", whereClauseLength;
    whereClauseLength = whereClause.length;
    for (var i = 0; i < whereClauseLength; i += 1) {
        whereClauseStr += (i != 0 ? " OR " : "") + whereClause[i].text;
    }
    return whereClauseStr;
};

function viewFRQueryResults(dataItem, params) {
    var options = getFRDefaultOptions(), queryId = dataItem.queryId,
        queryJSON = dataItem.queryJSON, reqQueryObj = {},
        reRun = params['reRun'], timeObj = params['timeObj'],
        reRunQueryObj = params['reRunQueryObj'],
        queryPrefix = params['queryPrefix'],
        selectArray, queryColumnDisplay;
    selectArray = queryJSON['select_fields'];
    if(reRun) {
        queryId = randomUUID();
        reqQueryObj = reRunQueryObj;
        reqQueryObj = setUTCTimeObj(queryPrefix, reqQueryObj, options, timeObj);
    }
    reqQueryObj.queryId = queryId;

    if(typeof(ko.dataFor(document.getElementById(queryPrefix + '-query'))) !== "undefined"){
        ko.cleanNode(document.getElementById(queryPrefix + '-query'));
    }

    setFRValidValues();
    initFRQueryView(queryPrefix);
    collapseOtherWidgets(queryPrefix);

    ko.applyBindings(queries[queryPrefix].queryViewModel, document.getElementById(queryPrefix + '-query'));
    initWidget4Id("#" + queryPrefix + "-query-widget");

    populateFRQueryForm(queryJSON, timeObj.reRunTimeRange);
    queryColumnDisplay = getColumnDisplay4Grid(queries['fr']['columnDisplay'], selectArray, true);
    collapseWidget('#' + queryPrefix + '-query-widget');
    loadFlowResultsForUnderlay(options, reqQueryObj, queryColumnDisplay);
};

function loadFlowResultsForUnderlay(options, reqQueryObj, columnDisplay, fcGridDisplay) {
    var grid = $('#' + options.elementId).data('contrailGrid'),
        url = "/api/admin/reports/query",
        btnId = options.btnId;
    
    var gridConfig = {
        header: {
            title:{
                text: 'Flows',
                cssClass: 'blue',
                iconCssClass: 'blue'
            },
            defaultControls: {
                searchable: false
            }
        },
        columnHeader : {
            columns : columnDisplay
        },
        body : {
            options: {
                sortable: true,
                forceFitColumns: true,
            },
            dataSource : {
                remote: {
                    ajaxConfig: {
                        url: url,
                        timeout: options.timeOut,
                        type: "POST",
                        data: reqQueryObj
                    },
                    serverSidePagination: true,
                    exportFunction: exportServersideQueryResults
                },
                events : {
                    onRequestStartCB : function() {
                        onQueryRequestStart(btnId);
                    },
                    onRequestErrorCB : function() {
                        enableButton(btnId);
                    },
                    onRequestSuccessCB : function(response) {
                        var status = response['status'];
                        if (status == 'queued') {
                            options.showChartToggle = false;
                        }
                        enableButton(btnId);
                        return onQueryResult(options.elementId,"No flows found for the given duration.",status, 'fqq');
                        
                    },
                    onDataBoundCB : function() {
                        if (options.refreshChart != null && options.refreshChart) {
                            if (options.showChartToggle) {
                                queries.fs.chartViewModel.isFCLoaded(false);
                                queries.fs.chartViewModel.options(options);
                                populateData4FSChart(options, columnDisplay, fcGridDisplay);
                                
                                var grid = $("#fs-flow-classes").data("contrailGrid");
                                if(grid != null){
                                    grid.refreshView();
                                }
                            }
                            options.refreshChart = false;
                        }
                    }
                }
            },
            statusMessages: {
                queued: {
                    type: 'status',
                    iconClasses: '',
                    text: 'Your query has been queued.'
                }
            }
        },
        footer : {
            pager : {
                options : {
                    pageSize : 50
                }
            }
        }
    };
    
    if(options.queryPrefix == 'fs'){
        if (grid) {
            $('#ts-chart').empty();
        }
        
        gridConfig.header.customControls = ['<a title="View Results as Grid" id="fs-results-link" class="margin-0-5 selected" onclick=toggleToGrid("fs");><i class="icon-table"></i></a> \
                              <a title="View Results as Chart" id="fs-chart-link" class="margin-0-5 disabled-link" onclick=toggleToChart("fs");><i class="icon-bar-chart"></i></a>'];
    }
    else if(options.queryPrefix == 'fr'){
        gridConfig.header.customControls = ['<button id="mapflow" class="btn btn-primary btn-mini" disabled="disabled" title="Map Flow">Map Flow</button>'],
        gridConfig.body.options = {
            checkboxSelectable: {
                enableRowCheckbox: true,
                onNothingChecked: function(e){
                    $("div.slick-cell-checkboxsel > input").removeAttr('disabled')
                    $("#mapflow").attr('disabled','disabled');
                },
                onSomethingChecked: function(e){
                    $("div.slick-cell-checkboxsel > input").attr('disabled','disabled');
                    $("#mapflow").removeAttr('disabled');
                    $(e['currentTarget']).removeAttr('disabled')
                }
            },
            actionCell: [
                {
                    title: 'Start Packet Capture',
                    iconClass: 'icon-edit',
                    onClick: function(rowIndex){
                        startPacketCapture4Flow(options.elementId, rowIndex, 'parseAnalyzerRuleParams4FlowRecord');
                    }
                }
            ]
        };
        $("#mapflow").live('click',function(e){
            var startTime = $("#"+options.queryPrefix+"-results").data('startTime');
            var endTime = $("#"+options.queryPrefix+"-results").data('endTime');
            var checkedRows = $("#"+options.queryPrefix+"-results").data('contrailGrid').getCheckedRows();
            var dataItem = ifNull(checkedRows[0],{});
            dataItem['startTime'] = startTime;
            dataItem['endTime'] = endTime;
            showUnderlayPaths(dataItem);
        });
    }
    
    $("#" + options.elementId).contrailGrid(gridConfig);
    $("#" + options.elementId).find('input.headerRowCheckbox').parent('span').remove();
    $('#fs-results').find('a[data-action="collapse"]').on('click', function(){
        if($(this).find('i.collapse-icon').hasClass('icon-chevron-up')){
            if($('#fs-results-link').hasClass('selected')){
                toggleToGrid('fs');
            }
            else if($('#fs-chart-link').hasClass('selected')){
                toggleToChart('fs');
            }
        }
        else if($(this).find('i.collapse-icon').hasClass('icon-chevron-down')){
            $('#fs-chart').hide();
        }
    });
};

function getFRDefaultOptions() {
    return {
        elementId:'fr-results', gridHeight:480,
        timeOut:60000, pageSize:100, queryPrefix:'fr', export:true,
        btnId:'fr-query-submit'
    };
};

function populateFRQueryForm(queryJSON, reRunTimeRange) {
    var queryPrefix = 'fr';
    populateTimeRange(queryPrefix, queryJSON['start_time'], queryJSON['end_time'], reRunTimeRange);
    populateSelect(queryPrefix, queryJSON['select_fields'], queries['fr']['defaultColumns']);
    if (queryJSON['where'] != null) {
        populateWhere(queryPrefix, queryJSON['where']);
    }
    populateDirection(queryPrefix, queryJSON['dir']);
};

function populateDirection(queryPrefix, direction) {
    $("#" + queryPrefix + "-select-dir").select2('val', direction);
};

function setFRValidValues() {
    var flowWhereFields = [
                       {"name":"VRouter, VMI IP","value":"vrouter"},
                       {"name":"Source VN, Source IP", "value":"sourcevn_sourceip"},
                       {"name":"Dest. VN, Dest. IP", "value":"destvn_destip"},
                       {"name":"Protocol, Source Port", "value":"protocol_sport"},
                       {"name":"Protocol, Dest. Port", "value":"protocol_dport"}
                   ];
    queries.fr.whereViewModel.selectFields(flowWhereFields);
    setVrouterValues('vrouter',queries.fr.whereViewModel);
    setNetworkValues('/api/admin/networks', ['sourcevn_sourceip', 'destvn_destip'], queries.fr.whereViewModel);
    setProtocolValues(['protocol_sport', 'protocol_dport'], queries.fr.whereViewModel);
};
//Flow Record Query - End

//Flow Queue - Begin
function loadFlowQueryQueue() {
    $(contentContainer).html('');
    $(contentContainer).html(qeTemplate);

    initFlowQueueView();
    currTab = 'query_flow_queue';
};

function initFlowQueueView() {
    var options = {elementId:'fqq-results', queueType:'fqq', timeOut:60000, gridHeight:530, pageSize:6},
        intervalId;
    $("#fqq-container").show();
    loadQueryQueue(options);
};
//Flow Queue - End
