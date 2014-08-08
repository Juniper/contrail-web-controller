/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
dnsRecordsDynamicConfigObj = new dnsRecordsDynamicConfig();
function dnsRecordsDynamicConfig(){
    //Variable Definations
    //Grids
    var gridDynamicDNSRec;
    var prevNextCache = [];
    var dnsName;
    //Method Definations
    this.load = load;
    this.init = init;	
    this.initActions = initActions;
    this.fetchData = fetchData;	
    this.destroy = destroy;

    function load() {
        dnsName = window.location.hash.split('&')[2].split('=')[1];
        var configTemplate =  Handlebars.compile($("#DNSRecords-dynamic-config-template").html());
        $(contentContainer).html('');
        $(contentContainer).html(configTemplate);
        init();
        initActions();
        fetchData(); 
    }

    function init(){
        //initializing grid
        gridDynamicDNSRec = $("#gridDynamicDNSRec").contrailGrid({
            header : {
                title: {
                    text : 'Active DNS Database',
                    //cssClass : 'blue',
                    //icon : 'icon-list',
                    //iconCssClass : 'blue'              
                },
                customControls: ['<button id="btnNextRecords" class="btn btn-primary btn-mini" title="Next">Next >></button>',
                    '<button id="btnPrevRecords" class="btn btn-primary btn-mini" disabled="disabled"  title="Previous"><< Prev</button>',
                    'DNS Server: <div style="display:inline;" id="lblServer"/>']
            }, 
            columnHeader : {
                columns : [
                {
                    id : 'name',
                    field : 'name',
                    name : 'Name'                    
                },
                {
                    id : 'rec_name',
                    field : 'rec_name',
                    name : 'DNS Record Name'                    
                },
                {
                    id : 'rec_type',
                    field : 'rec_type',
                    name : 'DNS Record Type'                    
                },
                {
                    id : 'rec_data',
                    field : 'rec_data',
                    name : 'DNS Record Data'                    
                },
                {
                    id : 'source',
                    field : 'source',
                    name : 'Source'                    
                },
                {
                    id : 'installed',
                    field : 'installed',
                    name : 'Installed'                    
                }]                
            },
            body : {
                options : {
                    forceFitColumns: true,
                    detail : {
                        template : $("#gridActiveDNSRecordDetailTemplate").html()
                    }    
                },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Active DNS Records..'
                    },
                    empty: {
                        text: 'No Active DNS Records.'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Active DNS Records.'
                    }
                }            
            },
            footer : false
        });
        gridDynamicDNSRec = $("#gridDynamicDNSRec").data('contrailGrid');
        gridDynamicDNSRec.showGridMessage('loading');
    }
    function initActions(){
        $("#btnPrevRecords").unbind("click").click(onPrevAction);
        $("#btnNextRecords").unbind("click").click(onNextAction);
    }
    
    function onPrevAction(){
        if($(this).hasClass('disabled')) {return};
        $("#btnNextRecords").removeAttr('disabled');
        if(prevNextCache.length > 0){
            if(prevNextCache.length == 2){
                prevNextCache.pop();
                prevNextCache.pop();            
                fetchData();
                $("#btnPrevRecords").attr('disabled', 'disabled');
            } 
            else if(prevNextCache.length > 2){
                prevNextCache.pop();
                prevNextCache.pop();                        
                fetchData(prevNextCache[prevNextCache.length - 1]);
            }
        }
    }
     
    function onNextAction(){
        if($(this).hasClass('disabled')) {return};
        $("#btnPrevRecords").removeAttr('disabled');
        if(prevNextCache.length > 0){
            fetchData(prevNextCache[prevNextCache.length - 1]);
        }
    }
		
    function fetchData(k){
        gridDynamicDNSRec._dataView.setData([]);    
	    var domain = getCookie('domain');
	    $("#lblServer").text(dnsName);
	    gridDynamicDNSRec.showGridMessage("loading");
	    var dnsFQN;
        if(k != undefined) {
            dnsFQN = k;
        }    
        else {   
            dnsFQN = domain + ":" + dnsName;
        }    
        doAjaxCall("/api/tenants/config/sandesh/virtual-DNS/" + dnsFQN, "GET", null, "successDynamicRecData", "failureDynamicRecData", null, null);     
    }	
    window.successDynamicRecData = function(e){
       //prepare grid data source 
        var ds = [];
        if(e && e.length > 0 && e[0] && e[0].VirtualDnsRecordsResponse && e[0].VirtualDnsRecordsResponse.records && e[0].VirtualDnsRecordsResponse.records.list){
            var nextRecSetKey = e[0].VirtualDnsRecordsResponse.getnext_record_set;
            if(nextRecSetKey != null && $.isEmptyObject(nextRecSetKey)){
               $("#btnNextRecords").attr('disabled', 'disabled');
            } 
            prevNextCache.push(nextRecSetKey);
            var res = e[0].VirtualDnsRecordsResponse.records.list.VirtualDnsRecordTraceData;
            if(res){
                if(res.length > 0){   
	                for(var i = 0;i < res.length;i++){
	                    var d = res[i];
		                ds.push({"name" : d.name, "rec_name" : d.rec_name, "rec_type" : d.rec_type, "rec_data" : d.rec_data, "rec_ttl" : d.rec_ttl,  "rec_class" : d.rec_class, "source" : d.source, "installed" : d.installed, "raw_json" : d});        	
		            }
		        }
		        else{
		        	var d = res;
		        	ds.push({"name" : d.name, "rec_name" : d.rec_name, "rec_type" : d.rec_type, "rec_data" : d.rec_data, "rec_ttl" : d.rec_ttl, "rec_class" : d.rec_class, "source" : d.source, "installed" : d.installed, "raw_json" : d}); 
		        }
            }      
        }
        else {
            $("#btnNextRecords").attr('disabled', 'disabled');
        }
        if(ds.length > 0){
            gridDynamicDNSRec._dataView.setData(ds);
	    }
        else{
            gridDynamicDNSRec.showGridMessage('empty');
        }  	
    }   

    window.failureDynamicRecData= function(e){
        gridDynamicDNSRec.showGridMessage('errorGettingData');
    }		
    
    function destroy(){
    	if(isSet(dsGridDynamicDNSRec)){
    		dsGridDynamicDNSRec = $();
    	}
        //configTemplate,
        var btnPrevRecords = $("#btnPrevRecords");
        if(isSet(btnPrevRecords)) {
        	btnPrevRecords.remove();
        	btnPrevRecords = $();
        }
        var btnNextRecords = $("#btnNextRecords");
        if(isSet(btnNextRecords)) {
        	btnNextRecords.remove();
        	btnNextRecords = $();
        }
        var lblServer = $("#lblServer");
        if(isSet(lblServer)) {
        	lblServer.remove();
        	lblServer = $();
        }
        gridDynamicDNSRec = $("#gridDynamicDNSRec");
        if(isSet(gridDynamicDNSRec)) {
        	gridDynamicDNSRec.remove();
        	gridDynamicDNSRec = $();
        }
        var configTemplate = $("#DNSRecords-dynamic-config-template");
        if(isSet(configTemplate)) {
        	configTemplate.remove();
        	configTemplate = $();
        }
    }
}
