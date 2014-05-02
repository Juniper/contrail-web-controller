
function getCores(data) {
    var fileList=[],result=[];
    var fileArrList=ifNull(jsonPath(data,'$..process_state_list[*].core_file_list'),[]);
    for(var i=0;i<fileArrList.length;i++){
        var files=fileArrList[i];
       for(var j=0;j<files.length;j++)
            fileList.push(files[j])}
    if(fileList.length==1){
        result.push({lbl:'Core File',value:fileList[0]});
    }else if(fileList.length>1){
        result.push({lbl:'Cores Files',value:fileList[0]});
        for(var i=1;i<fileList.length;i++)
            result.push({lbl:'',value:fileList[i]});}
    return result;
}

function getIPOrHostName(obj) {
    return (obj['ip'] == noDataStr) ? obj['name'] : obj['ip'];
}

function formatProtcolRange(rangeStr) {
    if (rangeStr == "0 - 255")
        return "any";
    else
        return rangeStr;
}

function formatPortRange(rangeStr) {
    if (rangeStr == null || rangeStr == "undefined - undefined" || rangeStr == "0 - 65535")
        return "any";
    else
        return rangeStr;
}

function formatPeerType(encoding, peer_type) {
    if (encoding == "XMPP") {
        return "vRouter";
    } else if ((peer_type == "internal") && (encoding == "BGP")) {
        return 'Control Node'
    } else if ((peer_type == "external") && (encoding == "BGP")) {
        return 'BGP Peer'
    }
}
function floatingIPCellTemplate(fip) {
    var fipArray = [];
    if(!(fip instanceof Array)){
        if($.isEmptyObject(fip))
            fip = [];
        else 
            fip = [fip];
    }
    $.each(fip, function (idx, obj) {
        fipArray.push(obj['ip_addr']);
    });
    if (fipArray.length == 0)
        return 'None';
    else
        return fipArray.join(', ');
}

function getCPUMemoryChartConfig(type) {
    var memTitle = 'Memory';
    cpuTitle = 'CPU utilization'
   /* if(type == 'controlNode') {
        memTitle = 'control-node Memory';
        cpuTitle = 'control-node CPU utilization';
    } else if(type == 'vRouter')  {
        memTitle = 'vnswad Memory';
        cpuTitle = 'vnswad CPU utilization';
    } else if(type == 'analyticsNode')  {
        memTitle = 'Memory';
        cpuTitle = 'CPU utilization';
    } else if(type == 'configNode')  {
        memTitle = 'Memory';
        cpuTitle = 'CPU utilization';
    }*/
    
    return {
        columns:[{field:'cpu',name:cpuTitle,axis:'cpu', tooltipTemplate:'CPU : #= value#'},
            {field:'memory',name:memTitle,axis:'memory',tooltipTemplate:'Memory : #= formatBytes(value*1024) #'}],
        parseFn: parseCPUMemoryTimeSeriesResponse
    }
}

function parseCPUMemoryTimeSeriesResponse(response) {
    var summary = response['summary'];
    var startTime = summary['start_time'],interval=summary['timeGran_microsecs'],
        endTime = summary['end_time'];
    var data = response['flow-series'];
    //CPU/Memory Samples are sent only at a interval of 1min
    interval = 60*1000;
    if(data.length == 0)
        return [];
    //Weed out empty samples until it's fixed in NodeJS
    data = $.map(data,function(obj,idx) {
        //If both CPU/Memory stats are empty,remove the sample
        if($.isEmptyObject(obj['cpuData']) && $.isEmptyObject(obj['memData']['memInfo']) &&
            $.isEmptyObject(obj['memData']['sysMemInfo']))
            return null;
        else {
            if(idx > 0) {
                if($.isEmptyObject(obj['cpuData']))
                    obj['cpuData'] = data[idx-1]['cpuData'];
                if($.isEmptyObject(obj['memData']['memInfo']))
                    obj['memData']['memInfo'] = data[idx-1]['memData']['memInfo'];
                if($.isEmptyObject(obj['memData']['sysMemInfo']))
                    obj['memData']['sysMemInfo'] = data[idx-1]['memData']['sysMemInfo'];
            }
            return obj;
        }
    });
    data = $.map(data,function(obj,idx) {
        obj['date'] = convertMicroTSToDate(obj['MessageTS']);
        obj['date'].setSeconds(0);
        obj['date'].setMilliseconds(0);
        return obj;
    });
    startTime = data[0]['date'].getTime();
    endTime = endTime/1000;
    for(var i=startTime,j=0;i<=endTime;i=i+interval,j++) {
        if((data[j] == null) || (data[j]['date'].getTime() != i)) {
            data.splice(j,0,{
                //MessageTS:i,
                date:new Date(i),
                cpuData:data[j-1]['cpuData'],
                memData:data[j-1]['memData']
            });
        }
    }
    var retArr = $.map(data,function(obj,idx) {
        //obj['date'] = convertMicroTSToDate(obj['MessageTS']);
        obj['cpu'] = parseFloat(obj['cpuData']['cpu_share']);
        obj['memory'] = parseInt(obj['memData']['memInfo']['virt']);
        obj['max'] = summary['numCpu'];
        return obj;
    });
    return retArr;
}

function getCPUMemoryChartConfigForSystem(type) {
    var memTitle = 'Memory';
    if(type == 'system')  {
        memTitle = 'Memory';
    }
    return {
        columns:[{field:'cpu',name:cpuTitle,axis:'cpu', tooltipTemplate:'CPU : #= value#'},
            {field:'memory',name:memTitle,axis:'memory',tooltipTemplate:'Memory : #= formatBytes(value*1024) #'}],
        parseFn: function(response) {
            console.info(response);
            var summary = response['summary'];
            var startTime = summary['start_time'],interval=summary['timeGran_microsecs'],
                endTime = summary['end_time'];
            var data = response['flow-series'];
            //CPU/Memory Samples are sent only at a interval of 1min
            interval = 60*1000;
            if(data.length == 0)
                return [];
            //Weed out empty samples until it's fixed in NodeJS
            data = $.map(data,function(obj,idx) {
                //If both CPU/Memory stats are empty,remove the sample
                if($.isEmptyObject(obj['cpuData']) && $.isEmptyObject(obj['memData']['sysMemInfo']))
                    return null;
                else {
                    if(idx > 0) {
                        if($.isEmptyObject(obj['cpuData']))
                            obj['cpuData'] = data[idx-1]['cpuData'];
                        if($.isEmptyObject(obj['memData']['sysMemInfo']))
                            obj['memData']['sysMemInfo'] = data[idx-1]['memData']['sysMemInfo'];
                    }
                    return obj;
                }
            });
            data = $.map(data,function(obj,idx) {
                obj['date'] = convertMicroTSToDate(obj['MessageTS']);
                obj['date'].setSeconds(0);
                obj['date'].setMilliseconds(0);
                return obj;
            });
            startTime = data[0]['date'].getTime();
            endTime = endTime/1000;
            for(var i=startTime,j=0;i<=endTime;i=i+interval,j++) {
                if((data[j] == null) || (data[j]['date'].getTime() != i)) {
                    data.splice(j,0,{
                        //MessageTS:i,
                        date:new Date(i),
                        cpuData:data[j-1]['cpuData'],
                        memData:data[j-1]['memData']
                    });
                }
            }
            var retArr = $.map(data,function(obj,idx) {
                //obj['date'] = convertMicroTSToDate(obj['MessageTS']);
                obj['cpu'] = parseFloat(obj['cpuData']['cpuLoadAvg']['one_min_avg']);
                obj['memory'] = parseInt(obj['memData']['sysMemInfo']['total']);
                //obj['max'] = summary['numCpu'];
                return obj;
            });
            return retArr;
        }
    }
}


function showObjLog(objId, type){
    var defaultTimeRange = 1800;//30mins
    if(type == 'vRouter' || type =='XMPP_peer' || type == 'BGP_peer' || type == 'vn'){
        var objWindowTemplate = contrail.getTemplate4Id('objectLog-window-template');
        if ($('body').find('#objLogWindow').length > 0){
            //already initialized do nothing
        } else {
            $('body').append("<div id='objLogWindow' class='modal modal-980 hide' tabindex='-1'></div>");
            $('#objLogWindow').append(objWindowTemplate);
        }
        bgpwindow = $("#objLogWindow");
        bgpwindow.on("hide", closeObjectLogWindow);
        bgpwindow.modal({backdrop:'static', keyboard: false, show:false});
        $("btnObjLogWindowCancel").click(function (a) {
            bgpwindow.hide();
        });
        runOTQueryForObjLogs(objId, defaultTimeRange, type);
        bgpwindow.modal('show');
    }
};

function closeObjectLogWindow() {
    //clearValuesFromDomElements();
}

function showStatus(ip, action){
    if(CONTRAIL_STATUS_USER["ip_"+ip] == null || CONTRAIL_STATUS_PWD["ip_"+ip] == null){
        showLoginWindow(ip, action);
    }else {
        if(action === 'log') {
            showLogDirWindow(CONTRAIL_STATUS_USER["ip_"+ip], CONTRAIL_STATUS_PWD["ip_"+ip], ip);
        } else {
            populateStatus(CONTRAIL_STATUS_USER["ip_"+ip], CONTRAIL_STATUS_PWD["ip_"+ip], ip);
        }
    }
}

function showLogs(ip) {
    showStatus(ip, 'log');
}

function showLoginWindow(ip, action){
    var username;
    var password;
    /*if ($('body').find('loginWindow')){
        //already initialized do nothing
    } else {
        $('body').append($("#loginWindow"));
    }*/
    var loginWindowTemplate = contrail.getTemplate4Id('login-window-template');
    if ($('body').find('#loginWindow').length > 0){
        //already initialized do nothing
    } else {
        $('body').append("<div id='loginWindow' class='modal modal-520 hide' tabindex='-1'></div>");
        $('#loginWindow').append(loginWindowTemplate);
    }
    
    loginWindow = $("#loginWindow");
    loginWindow.on("hide", closeObjectLogWindow);
    loginWindow.modal({backdrop:'static', keyboard: false, show:false});
    $("#btnLoginWindowCancel").unbind('click');
    $("#btnLoginWindowCancel").click(function (a) {
    $('#divLoginError').html("");
        loginWindow.hide();
    });
    $("#btnLoginWindowLogin").unbind('click');
    $("#btnLoginWindowLogin").click(function (a) {
        username = $('#txtLoginUserName').val();
        password = $('#txtLoginPassword').val();
        $('#divLoginError').html("");
        if(username == "" || password == ""){
            $('#divLoginError').html("Username and password cannot be empty");
            showLoginWindow(ip);
        } else {
            if(action === 'log') {
                showLogDirWindow(username, password, ip, loginWindow);
            }else { 
                populateStatus(username, password, ip, loginWindow);
            }
        }
        //loginWindow.hide();
    });
    loginWindow.modal('show');
};

function populateStatus(usrName,pwd,ip,loginWindow) {
    var postData = {"username":usrName,"password":pwd};
    $.ajax({
        url:'/api/service/networking/device-status/' + ip,
        type:'post',
        data:postData
    }).done(function(response) {
        CONTRAIL_STATUS_USER["ip_"+ip] = usrName;
        CONTRAIL_STATUS_PWD["ip_"+ip] = pwd;
        if(loginWindow != null){
            loginWindow.hide();
        }
        var htmlString = '<pre>' + response + '</pre>';
        $('#divContrailStatus').html(htmlString);
        $('#divBasic').hide();
        $('#divAdvanced').hide();
        $('#divStatus').show();
        $('#divAdvanced').parents('.widget-box').find('.widget-header h4 .subtitle').remove();
        $('#divAdvanced').parents('.widget-box').find('.widget-header h4').append('<span class="subtitle">(Status)</span>')
    }).fail(function(response) {
        if(response != null && response.responseText != null && response.responseText.search("Error: Authentication failure") != -1){
            $('#divLoginError').html("Invalid username or password");
            showLoginWindow(ip);
        } else {
            $('#divLoginError').html("Error fetching status");
            showLoginWindow(ip);
        }
    });
}

function showLogDirWindow(usrName, pwd, ip, loginWindow) {
    var postData = {"userName":usrName,"passWord":pwd,"hostIPAddress":ip};
    var fileNameArry = [];
    $.ajax({
        url:'/log-directory',
        type:'post',
        data:JSON.stringify(postData),
        contentType: "application/json"
    }).done(function(response) {
        CONTRAIL_STATUS_USER["ip_"+ip] = usrName;
        CONTRAIL_STATUS_PWD["ip_"+ip] = pwd;
        if(loginWindow != null) {
            loginWindow.hide();
        }
        if ($('body').find('#logDirWindow').length > 0) {
            //already initialized do nothing
        }else {
            var logDirTemplate = contrail.getTemplate4Id("logDirTemplate");
            var htmlString = '<ul style="list-style:none;padding:0;margin:0;"> <li><span class="pull-left" style="font-weight:bold">Directory Listing</span><span class="pull-right" style="font-weight:bold">Size</span></li><br><br>';
            var len = response.length;
            for(var i = 0; i < len; i++) {
                var res = response[i];
                var fileName = res.name;
                var fileSize = res.size;
                htmlString = htmlString + '<li > <a class="pull-left" href ="/download?userName='+ usrName +'&passWord='+pwd+'&hostIPAddress='+ip+'&file=' + fileName +'&size='+ fileSize +'" title="Click to download the file.">'+ fileName +' </a> <span class="pull-right">'+ fileSize +'</span></li><br>';
            }
            htmlString = htmlString + '</ul>';
            $('body').append(logDirTemplate);
            $('#logDirContext').append(htmlString);
        }   
        var logDirWindow = $("#logDirWindow");
        logDirWindow.modal('show');
    }).fail(function(response) {
        if(response != null && response.responseText != null && response.responseText.search("Authentication failure") != -1) {
            $('#divLoginError').html("Invalid username or password");
            showLoginWindow(ip, 'log');
        } else {
            $('#divLoginError').html("Error fetching logs");
            showLoginWindow(ip, 'log');
        }       
    });
}
/**
 * This function takes parsed nodeData from the infra parse functions and returns object with all alerts displaying in dashboard tooltip,
 * and tooltip messages array
 */
function getNodeStatusForSummaryPages(data,page) {
    var result = {},msgs = [],tooltipAlerts = [];
    for(var i = 0;i < data['alerts'].length; i++) {
        if(data['alerts'][i]['tooltipAlert'] != false) {
            tooltipAlerts.push(data['alerts'][i]);
            msgs.push(data['alerts'][i]['msg']);
        }
    }
    //Status is pushed to messages array only if the status is "UP" and tooltip alerts(which are displaying in tooltip) are zero
    if(ifNull(data['status'],"").indexOf('Up') > -1 && tooltipAlerts.length == 0) {
        msgs.push(data['status']);
        tooltipAlerts.push({msg:data['status'],sevLevel:sevLevels['INFO']});
    } else if(ifNull(data['status'],"").indexOf('Down') > -1) {
        //Need to discuss and add the down status 
        //msgs.push(data['status']);
        //tooltipAlerts.push({msg:data['status'],sevLevel:sevLevels['ERROR']})
    }
    result['alerts'] = tooltipAlerts;
    result['nodeSeverity'] = data['alerts'][0] != null ? data['alerts'][0]['sevLevel'] : sevLevels['INFO'];
    result['messages'] = msgs;
     var statusTemplate = contrail.getTemplate4Id('statusTemplate');
    if(page == 'summary') 
        return statusTemplate({sevLevel:result['nodeSeverity'],sevLevels:sevLevels});
    return result;
}
/**
 * This function takes parsed nodeData from the infra parse functions and returns the status column text/html for the summary page grid
 */
function getNodeStatusContentForSummayPages(data,type){
    var obj = getNodeStatusForSummaryPages(data);
    if(obj['alerts'].length > 0) {
        if(type == 'html')
            return '<span title="'+obj['messages'].join(',&#10 ')+'" class=\"infra-nodesatus-text-ellipsis\">'+obj['messages'].join(',')+'</span>';
        else if(type == 'text')
            return obj['messages'].join(',');
    } else {
        if(type == 'html')
            return "<span> "+data['status']+"</span>";
        else if(type == 'text')
            return data['status'];
    }
}

function runOTQueryForObjLogs(objId, timeRange, type) {
    var currTime = new Date();
    var currTimeInSecs = currTime.getTime();
    var fromTimeInSecs = currTimeInSecs - timeRange*1000;

    var objectType;
    var objectId;
    //build the query string
    if(type == "vRouter") {
        objectType = "ObjectBgpRouter";
    } else if (type == "XMPP_peer") {
        objectType = "ObjectXmppPeerInfo";
    } else if (type == "BGP_peer") {
        objectType = "ObjectBgpPeer";
    } else if(type == "vn") {
        objectType = "ObjectVNTable";
    }
    var reqQueryString ="timeRange="+timeRange+
        "&objectType="+objectType+
        //"&objectId_input="+objId+
        "&objectId="+objId+
        "&select=ObjectLog" +
        "&where=" +
        "&fromTimeUTC=now-30"+
        "&toTimeUTC=now"+
        "&table=" +objectType+
        "&async=false";
    var    options = {
        elementId:'ot-results', gridHeight:300,gridWidth:600,
        timeOut:90000, pageSize:50,
        export:true, btnId:'ot-query-submit'
    };
    select = 'ObjectLog,SystemLog';
    loadOTResults(options, reqQueryString, parseStringToArray(select, ','));
};


function bucketizeData(data,fieldName) {
    var retObj = {},retArr=[];keys=[];
    $.each(data,function(idx,obj) {
        //Add key if it doesn't exist
        if($.inArray(obj[fieldName],keys) == -1)
            keys.push(obj[fieldName]);
        if(obj[fieldName] in retObj) {
            retObj[obj[fieldName]]++;
        } else {
            retObj[obj[fieldName]] = 1;
        }
    });
    var maxKey = d3.extent(keys);
    for(var i=maxKey[0];i<=maxKey[1];i++) {
        var value = 0;
        if(retObj[i] != null) {
            value = retObj[i];
            retArr.push({name:i,value:value});
        }
    }
    return retArr;
}

function getNodeVersion(buildStr) {
    var verStr = '';
    if(buildStr != null) {
        var buildInfo;
        try {
             buildInfo = JSON.parse(buildStr);
        } catch(e) {
        }
        if((buildInfo != null) && (buildInfo['build-info'] instanceof Array)) {
            var buildObj = buildInfo['build-info'][0];
            verStr = buildObj['build-version'] + ' (Build ' + buildObj['build-number'] + ')'
        }
    }
    return verStr;
}

function getNodeUpTime(d) {
    var upTimeStr = noDataStr;
    if(jsonPath(d,'$..start_time').length > 0) {
        var upTime = new XDate(jsonPath(d,'$..start_time')[0]/1000);
        var currTime = new XDate();
        upTimeStr = 'Up since ' + diffDates(upTime,currTime);
    } else if(jsonPath(d,'$..ModuleServerState..reset_time').length > 0){
        var resetTime = new XDate(jsonPath(d,'$..reset_time')[0]/1000);
        var currTime = new XDate();
        upTimeStr = 'Down since ' + diffDates(resetTime,currTime);
    } else {
        upTimeStr = "Down";
    }
    return upTimeStr;
}

function getProcessUpTime(d) {
    var upTimeStr = noDataStr;
    if(d != null && d.process_state != null && d.process_state.toUpperCase() == "PROCESS_STATE_RUNNING") {
        if(d.last_start_time != null){
            var upTime = new XDate(d.last_start_time/1000);
            var currTime = new XDate();
            upTimeStr = 'Up since ' + diffDates(upTime,currTime);
        }
    } else {
        var exitTime=0,stopTime=0;
        var currTime = new XDate();
        if(d.last_exit_time != null){
            exitTime = d.last_exit_time;
        }
        if(d.last_stop_time != null){
            stopTime = d.last_stop_time;
        }
        if(exitTime != 0 || stopTime != 0){
            if(exitTime > stopTime){
                exitTime = new XDate(exitTime/1000);
                upTimeStr = 'Down since ' + diffDates(exitTime,currTime);
            } else {
                stopTime = new XDate(stopTime/1000);
                upTimeStr = 'Down since ' + diffDates(stopTime,currTime);
            }
        } else {
            upTimeStr = "Down";
        }
    } 
    return upTimeStr;
}

/**
 * Claculates node status based on process_state_list & generators
 * ToDo: use getOverallNodeStatusFromGenerators 
 */
function getOverallNodeStatus(d,nodeType,processPath){
    var status = "--";
    var generatorDownTime;
    //For Analytics node if there are error strings in the UVE display it as Down
    if(nodeType != null && nodeType == 'analytics'){
        try{
            var errorStrings = jsonPath(d,"$..ModuleCpuState.error_strings")[0];
        }catch(e){}
        if(errorStrings && errorStrings.length > 0){
            return 'Down';
        }
    }
    var procStateList;
    if(processPath != null)
        procStateList = getValueByJsonPath(d,processPath);
    else
        procStateList = jsonPath(d,"$..process_state_list")[0];
    if(procStateList != null && procStateList != undefined && procStateList != "") {
        status = getOverallNodeStatusFromProcessStateList(procStateList);
        //Check if any generator is down. This may happen if the process_state_list is not updated due to some reason
        if(status.search("Up") != -1){
            generatorDownTime = getMaxGeneratorDownTime(d);
            if(generatorDownTime != -1){
                try{
                    var resetTime = new XDate(generatorDownTime/1000);
                    var currTime = new XDate();
                    status = 'Down since ' + diffDates(resetTime,currTime);
                }catch(e){
                    status = 'Down';
                }
            }
        }
    } else {
        //For each process get the generator_info and fetch the gen_attr which is having the highest connect_time. This is because
        //we are interseted only in the collector this is connected to the latest. 
        //From this gen_attr see if the reset_time > connect_time. If yes then the process is down track it in down list. 
        //Else it is up and track in uplist.
        //If any of the process is down get the least reset_time from the down list and display the node as down. 
        //Else get the generator with max connect_time and show the status as Up.
        try{
            var genInfos = ifNull(jsonPath(d,"$..ModuleServerState..generator_info"),[]);
            if(!genInfos){
                return 'Down';
            }
            var upGenAttrs = [];
            var downGenAttrs = [];
            var isDown = false;
            $.each(genInfos,function(idx,genInfo){
                var genAttr = getMaxGeneratorValueInArray(genInfo,"connect_time");
                var connTime = jsonPath(genAttr,"$..connect_time")[0];
                var resetTime = jsonPath(genAttr,"$..reset_time")[0];
                if(resetTime > connTime){
                    isDown = true;
                    downGenAttrs.push(genAttr);
                } else {
                    upGenAttrs.push(genAttr);
                }
            });
            if(!isDown){
                var maxConnTimeGen = getMaxGeneratorValueInArray(upGenAttrs,"connect_time");
                var maxConnTime = jsonPath(maxConnTimeGen,"$..connect_time")[0];
                var connectTime = new XDate(maxConnTime/1000);
                var currTime = new XDate();
                status = 'Up since ' + diffDates(connectTime,currTime);
            } else {
                var minResetTimeGen = getMinGeneratorValueInArray(downGenAttrs,"reset_time");
                var minResetTime = jsonPath(minResetTimeGen,"$..reset_time")[0];
                var resetTime = new XDate(minResetTime/1000);
                var currTime = new XDate();
                status = 'Down since ' + diffDates(resetTime,currTime);
            }
        }catch(e){}
    }
    return status;
}

/**
 * Calculates node status only based on generators
 */
function getOverallNodeStatusFromGenerators(d){
    var status = "--";
    var generatorDownTime;
    
    
    //For each process get the generator_info and fetch the gen_attr which is having the highest connect_time. This is because
    //we are interseted only in the collector this is connected to the latest. 
    //From this gen_attr see if the reset_time > connect_time. If yes then the process is down track it in down list. 
    //Else it is up and track in uplist.
    //If any of the process is down get the least reset_time from the down list and display the node as down. 
    //Else get the generator with max connect_time and show the status as Up.
    try{
        var genInfos = ifNull(jsonPath(d,"$..ModuleServerState..generator_info"),[]);
        if(!genInfos){
            return 'Down';
        }
        var upGenAttrs = [];
        var downGenAttrs = [];
        var isDown = false;
        $.each(genInfos,function(idx,genInfo){
            var genAttr = getMaxGeneratorValueInArray(genInfo,"connect_time");
            var connTime = jsonPath(genAttr,"$..connect_time")[0];
            var resetTime = jsonPath(genAttr,"$..reset_time")[0];
            if(resetTime > connTime){
                isDown = true;
                downGenAttrs.push(genAttr);
            } else {
                upGenAttrs.push(genAttr);
            }
        });
        if(!isDown){
            var maxConnTimeGen = getMaxGeneratorValueInArray(upGenAttrs,"connect_time");
            var maxConnTime = jsonPath(maxConnTimeGen,"$..connect_time")[0];
            var connectTime = new XDate(maxConnTime/1000);
            var currTime = new XDate();
            status = 'Up since ' + diffDates(connectTime,currTime);
        } else {
            var minResetTimeGen = getMinGeneratorValueInArray(downGenAttrs,"reset_time");
            var minResetTime = jsonPath(minResetTimeGen,"$..reset_time")[0];
            var resetTime = new XDate(minResetTime/1000);
            var currTime = new XDate();
            status = 'Down since ' + diffDates(resetTime,currTime);
        }
    }catch(e){}
    
    return status;
}

/**
 * ToDo: can be merged with getOverallNodeStatus
 */
function getFinalNodeStatusFromGenerators(statusFromGen,dataItem){
    if(!dataItem['processStateAvailable']) {
        return statusFromGen;
    }
    var statusFromProcessStateList = dataItem['status'];
    if(statusFromProcessStateList.search("Up") != -1){
        if(statusFromGen.search("Down") != -1){
            return statusFromGen;
        } else {
            return statusFromProcessStateList;
        }
    } else {
        return statusFromProcessStateList;
    }
}

function getOverallNodeStatusFromProcessStateList(d){
    var maxUpTime=0, maxDownTime=0, isAnyNodeDown=false, status = "";
    for(var i=0; i < d.length; i++){
        var currProc = d[i];
        //Exclude specific (node mgr,nova-compute for compute node) process alerts
        if(isProcessExcluded(currProc['process_name']))
            continue;
        if(currProc != null && currProc.process_state != null && currProc.process_state.toUpperCase() == "PROCESS_STATE_RUNNING"){
            if(currProc.last_start_time != null && currProc.last_start_time > maxUpTime){
                maxUpTime = currProc.last_start_time;
            }
        } else {
            if(currProc.last_exit_time != null || currProc.last_stop_time != null){
                isAnyNodeDown = true;
                var maxProcDownTime=0,exitTime=0,stopTime=0;
                if(currProc.last_exit_time != null){
                    exitTime = currProc.last_exit_time;
                }
                if(currProc.last_stop_time != null){
                    stopTime = currProc.last_stop_time;
                }
                maxProcDownTime = (exitTime > stopTime)?exitTime:stopTime;
                if(maxProcDownTime > maxDownTime){
                    maxDownTime = maxProcDownTime;
                }
            }
        }
    }
    if(!isAnyNodeDown && maxUpTime != 0){
        var upTime = new XDate(maxUpTime/1000);
        var currTime = new XDate();
        status = 'Up since ' + diffDates(upTime,currTime);
    } else if(maxDownTime != 0){
        var resetTime = new XDate(maxDownTime/1000);
        var currTime = new XDate();
        status = 'Down since ' + diffDates(resetTime,currTime);
    } else {
        status = 'Down';
    }
    return status;
}

//returns max reset time or -1 if none are down
function getMaxGeneratorDownTime(d){
    var genInfos = [];
    var genInfoList = [];
    var maxResetTime = -1;
    try{
        genInfoList = jsonPath(d,"$..ModuleServerState..generator_info");
        for(var i=0; i < genInfoList.length; i++){
            var currGenInfo = genInfoList[i];
            var maxConnectTimeGenerator = getMaxGeneratorValueInArray(currGenInfo,"connect_time");
            var maxConnectTimeOfProcess = jsonPath(maxConnectTimeGenerator,"$..connect_time")[0];
            var resetTimeOfMaxConnectTimeGenerator = jsonPath(maxConnectTimeGenerator,"$..reset_time")[0];
            if(resetTimeOfMaxConnectTimeGenerator > maxConnectTimeOfProcess){
                if(maxResetTime < resetTimeOfMaxConnectTimeGenerator){
                    maxResetTime = resetTimeOfMaxConnectTimeGenerator
                }
            }
        }
    }catch(e){}
    return maxResetTime;
}

function getVrouterIpAddresses(data,pageType) {
    var ips,controlIp;
    var configip = noDataStr;
    var ipString = "";
    var isConfigMismatch = true;
    try{
        controlIp = getValueByJsonPath(data,'VrouterAgent;control_ip',noDataStr);
        ips = getValueByJsonPath(data,'VRouterAgent;self_ip_list',[]);
        configip = getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address');
        if(controlIp != null && controlIp != noDataStr){
            ipString = controlIp;
        }
        if(configip == controlIp) {
            isConfigMismatch = false;
        }
        $.each(ips, function (idx, ip){
            if(ip == configip){
                isConfigMismatch = false;
            }
            if(ip != controlIp){
                ipString += ", " + ip;
                if(idx == 0){
                    ipString += "*";
                }
            } else {
                ipString += "*"
            }
        });
        if(configip != null && isConfigMismatch){
            if(ipString != ""){
                ipString += ","
            }
            if(pageType == "summary"){
                ipString = ipString +  configip ;
            } else if (pageType == "details"){
                ipString = ipString + "<span class='text-error' title='Config IP mismatch'> "+ configip +"</span>";
            }
        }
    } catch(e){}
    return ipString;
}

function getControlIpAddresses(data,pageType) {
    var ips;
    var configip = noDataStr;
    var ipString = "";
    var isConfigMismatch = true;
    try{
        ips = ifNull(jsonPath(data,'$..bgp_router_ip_list')[0],[]);
        configip = jsonPath(data,'$..ConfigData..bgp_router_parameters.address')[0];
        $.each(ips, function (idx, ip){
            if(ip == configip){
                isConfigMismatch = false;
            }
            if(idx+1 == ips.length) {
                ipString = ipString + ip;
            } else {
                ipString = ipString + ip + ', ';
            }
        });
        if(configip != null && isConfigMismatch){
            if(ipString != ""){
                ipString += ","
            }
            if(pageType == "summary"){
                ipString = ipString +  configip ;
            } else if (pageType == "details"){
                ipString = ipString + "<span class='text-error' title='Config IP mismatch'> "+ configip +"</span>";
            }
        }
    } catch(e){}
    return ipString;
}

function summaryIpDisplay (ip,tooltip){
    return '<span title="'+ tooltip +'">' + ip + '</span>';
}

function decideColor(origClass,color){
    if(color == 'red' || color == "#d62728"){
        return 'cell-hyperlink-text-error';
    } else {
        return 'cell-hyperlink';
    }
}

function getGridCellCssClass() {

}

function showAdvancedDetails(){
    $('#divBasic').hide();
    $('#divStatus').hide();
    $('#divAdvanced').show();
    $('#divAdvanced').parents('.widget-box').find('.widget-header h4 .subtitle').remove();
    $('#divAdvanced').parents('.widget-box').find('.widget-header h4').append('<span class="subtitle">(Advanced)</span>')
}

function showBasicDetails(){
    $('#divAdvanced').hide();
    $('#divStatus').hide();
    $('#divBasic').show();
    $('#divAdvanced').parents('.widget-box').find('.widget-header h4 .subtitle').remove();
}

function parseUveHistoricalValues(d,path,histPath) {
    var histData; 
    if(histPath != null)
        histData = getValueByJsonPath(d,histPath,[]);
    else
        histData = ifNull(jsonPath(d,path)[0],[]);
    var histDataArr = [];
    $.each(histData,function(key,value) {
        histDataArr.push([JSON.parse(key)['ts'],value]);
    });
    histDataArr.sort(function(a,b) { return a[0] - b[0];});
    histDataArr = $.map(histDataArr,function(value,idx) {
        return value[1];
    });
    return histDataArr;
}

function getMaxGeneratorValueInArray(inputArray,selector) {
    var maxVal;
    if(inputArray != null && inputArray['length'] != null && inputArray['length'] > 0) {
        maxVal = inputArray[0];
        for(var i = 1; i < inputArray.length; i++){
            var curSelectorVal = jsonPath(inputArray[i],"$.."+selector)[0];
            var maxSelectorVal = jsonPath(maxVal,"$.."+selector)[0];
            if(curSelectorVal > maxSelectorVal){
                maxVal = inputArray[i];
            }
        }
        return maxVal;
    } else {
        return inputArray;
    }
}

function getMinGeneratorValueInArray(inputArray,selector) {
    var minVal;
    if(inputArray != null && inputArray['length'] != null && inputArray['length'] > 0) {
        minVal = inputArray[0];
        for(var i = 1; i < inputArray.length; i++){
            var curSelectorVal = jsonPath(inputArray[i],"$.."+selector)[0];
            var maxSelectorVal = jsonPath(minVal,"$.."+selector)[0];
            if(curSelectorVal < maxSelectorVal){
                minVal = inputArray[i];
            }
        }
        return minVal;
    } else {
        return inputArray;
    }
}

function getConsolidatedStatusForConfigNode (d){
    var upTimeStr;
    if(jsonPath(d,'$..start_time').length > 0) {
        var upTimeSecs = jsonPath(d,'$..start_time')[0]/1000;
        upTimeStr = {"status":"Up","UpDownTime": upTimeSecs};
    } else if(jsonPath(d,'$..ModuleServerState..reset_time').length > 0){
        var resetTimeSecs = jsonPath(d,'$..reset_time')[0]/1000;
        upTimeStr = {"status":"Up","UpDownTime": resetTimeSecs};
    } else {
        upTimeStr = {"status":"Down","UpDownTime": "0"};
    }
    return upTimeStr;
}

function getSecurityGroup(sg){
    var ret = "";
    sg = ifNullOrEmptyObject(sg,[]);
    for(var i=0; i < sg.length; i++){
        if(sg[i].search("security group") != -1) {
            if(ret == ""){
                ret = sg[i].split(":")[1];
            } else {
                ret = ret + ", " + sg[i].split(":")[1];
            }
        }
    }
    return ret;
}

function toggleDetails(divId){
    var div = $('#'+divId);
    var iconId = '#icon_' + divId;
    var iconClass = $(iconId).attr("class");
    if(iconClass == 'icon-expand-alt') {
        $(iconId).removeClass(iconClass).addClass('icon-collapse-alt');
    } else {
        $(iconId).removeClass(iconClass).addClass('icon-expand-alt');
    }
    $('#'+divId).toggle();
}

function getPostData(type,module,hostname,cfilt,kfilt){
    var cfiltObj = {};
    var postData;
    if(type != null && type != ""){
        cfiltObj["type"] = type;
    } else {
        return null;
    }
    if(module != null && module != ""){
        cfiltObj["module"] = module;
    }
    if(hostname != null && hostname != ""){
        cfiltObj["hostname"] = hostname;
    }
    if(cfilt != null && cfilt != ""){
        cfiltObj["cfilt"] = cfilt;
    }
    if(kfilt != null && kfilt != ""){
        cfiltObj["kfilt"] = kfilt;
    }
    postData = {data:[cfiltObj]};
    return postData;
}

function getSandeshPostData(ip,port,url){
    var postData;
    var obj = {};
    if(ip != null && ip != ""){
        obj["ip"] = ip;
    } else {
        return null;
    }
    if(port != null && port != ""){
        obj["port"] = port;
    }
    if(url != null && url != ""){
        obj["url"] = url;
    }
    postData = {data:obj};
    return postData;
}

function getLastLogTimestamp(d, nodeType){
    var logLevelStats = [], lastLog, lastTimeStamp;
    var procsList = [];
    if(nodeType != null){
        if(nodeType == "control"){
            procsList = controlProcsForLastTimeStamp;
        } else if (nodeType == "compute"){
            procsList = computeProcsForLastTimeStamp;
        } else if (nodeType =="analytics") {
            procsList = analyticsProcsForLastTimeStamp;
        } else if (nodeType =="config"){
            procsList = configProcsForLastTimeStamp;
        }
        $.each(procsList,function(idx,proc){
            logLevelStats = getAllLogLevelStats(d,proc,logLevelStats);
        });
    } else {
        logLevelStats = getAllLogLevelStats(d,"",logLevelStats);
    }
    
    if(logLevelStats != null){
        lastLog = getMaxGeneratorValueInArray(logLevelStats,"last_msg_timestamp");
        if(lastLog != null){
            lastTimeStamp = lastLog.last_msg_timestamp;
        }
    }
    return lastTimeStamp;
}

function getAllLogLevelStats(d,proc,logLevelStats){
    var allStats = [],obj = {};
    for(var key in d){
        var label = key.toUpperCase();
        if(label.indexOf(proc.toUpperCase()) != -1){
            obj[key] = d[key];
        }
    }
    allStats =  ifNullOrEmptyObject(jsonPath(obj,"$..log_level_stats"),[]);
    if(allStats instanceof Array){
        for(var i = 0; i < allStats.length;i++){
            if(!($.isEmptyObject(allStats[i]))){
                if( allStats[i] instanceof Array){
                    logLevelStats = logLevelStats.concat(allStats[i]);
                } else {
                    logLevelStats.push(allStats[i]);
                }
            }
        }
    }
    return logLevelStats;
}

function getFormattedDate(timeStamp){
    if(!$.isNumeric(timeStamp))
        return '';
    else{
    var date=new Date(timeStamp),fmtDate="",mnth,hrs,mns,secs,dte;
    dte=date.getDate()+"";
    if(dte.length==1)
        dte="0"+dte;
    mnth=parseInt(date.getMonth()+1)+"";
    if(mnth.length==1)
        mnth="0"+mnth;
    hrs=parseInt(date.getHours())+"";
    if(hrs.length==1)
        hrs="0"+hrs;
    mns=date.getMinutes()+"";
    if(mns.length==1)
        mns="0"+mns;
    secs=date.getSeconds()+"";
    if(secs.length==1)
        secs="0"+secs;
    fmtDate=date.getFullYear()+"-"+mnth+"-"+dte+"  "+hrs+":"+mns+":"+secs;
    return fmtDate;}
}

//If current process is part of exclude process list,then return true; else return false
function isProcessExcluded(procName) {
    //Exclude specific (node mgr,nova-compute for compute node) process alerts
    var excludeProcessLen = excludeProcessList.length;
    for(var i=0;i<excludeProcessLen;i++) {
        if(procName.indexOf(excludeProcessList[i]) > -1)
            return true;
    }
    return false;
}
/**
 * Function returns the overall node status html of monitor infra node details page
 */
function getOverallNodeStatusForDetails(data){
    var statusObj = getNodeStatusForSummaryPages(data);
    var templateData = {result:statusObj['alerts'],showMore:true,defaultItems:1};
    return contrail.getTemplate4Id('overallNodeStatusTemplate')(templateData);
}

function getPostDataForReachableIpsCall(ips,port){
	var postData;
	var ipPortList = [];
	$.each(ips,function(idx,obj){
		ipPortList.push({ip:obj,port:port});
	});
	postData = {data:ipPortList};
	return postData;
}

function getReachableIp(ips,port,deferredObj){
	var res;
	if(ips != null && ips.length > 0){
		var postData = getPostDataForReachableIpsCall(ips,port);
		$.ajax({
	    	url:'/api/service/networking/get-network-reachable-ip',
	        type:'POST',
	        data:postData
	    }).done(function(result) {
	    	if(result != null && result['ip'] != null){
	    		res = result['ip'];
	    	} 
	    	deferredObj.resolve(res);
	    }).fail(function(result) {
	    	deferredObj.resolve(res);
	    });
	}
}

function convertMicroTSToDate(microTS) {
    return new Date(microTS/1000);
}

/* 
 * Common function to retrieve the analytics messages count and size
 */
function getAnalyticsMessagesCountAndSize(d,procList){
    var count = 0,size = 0, obj = {};
    for(var key in d){
        var label = key.toUpperCase();
        $.each(procList,function(idx,proc){
            if(label.indexOf(":"+proc.toUpperCase()+":") != -1){
                obj[key] = d[key];
            }
        });
    }
    var sizes =  ifNull(jsonPath(obj,"$..ModuleClientState.client_info.tx_socket_stats.bytes"),0);
    var counts = ifNull(jsonPath(obj,"$..ModuleClientState.session_stats.num_send_msg"),0);
    $.each(counts,function(i,cnt){
        count += cnt;
    });
    $.each(sizes,function(i,sze){
        size += sze;
    });
    return {count:count,size:size};
}

//Handlebar functions for monitor infra 
Handlebars.registerPartial('statusTemplate',$('#statusTemplate').html());

Handlebars.registerHelper('renderStatusTemplate', function(sevLevel, options) {
    var selector = '#statusTemplate',
        source = $(selector).html(),
        html = Handlebars.compile(source)({sevLevel:sevLevel,sevLevels:sevLevels});
    return new Handlebars.SafeString(html);
});

