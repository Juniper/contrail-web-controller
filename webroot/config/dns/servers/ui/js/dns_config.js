/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

dnsConfigObj = new DnsServerConfigObj();

function DnsServerConfigObj() {
    var btnDeleteDNS, btnCreateDNS, btnRemovePopupOK,
    btnRemovePopupCancel, btnCnfRemoveMainPopupOK,
    btnCnfRemoveMainPopupCancel, btnCreateDNSOK, 
    btnCreateDNSCancel;
    
    var windowCreateDNS, confirmRemove, confirmMainRemove;
    
    var txtLocalServiceIP, txtLocalServicePort,
    txtFabServiceDNS, txtFabricServicePort;

    var ddFabServiceIPDNS, ddLocalServiceName;
    var gridDNS;
    
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.populateData = populateData;
    this.failureHandlerForGridDNS = failureHandlerForGridDNS;
    this.handleCommitFailure = handleCommitFailure;
    this.createFabEntry = createFabEntry;
    this.appendFabEntry = appendFabEntry;
    this.deleteFabEntry = deleteFabEntry; 
    this.clearFabEntries = clearFabEntries; 
    this.showDnsEditWindow = showDnsEditWindow;
    this.deleteDns = deleteDns;
    this.closeCreateDnsWindow = closeCreateDnsWindow;
    this.clearValuesFromDomElements = clearValuesFromDomElements;
    this.showRemoveWindow = showRemoveWindow;
    this.handleIPDNS = handleIPDNS;
    this.checkMetadata = checkMetadata;
    this.validate = validate;
    this.destroy = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#dns-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    //currTab = 'config_infra_dns';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function initComponents() {
    $("#gridDNS").contrailGrid({
        header : {
            title : {
                text : 'DNS Servers',
                //cssClass : 'blue',
                //icon : 'icon-list',
                //iconCssClass : 'blue'
            },
            //defaultControls: {
            //    collapseable: false,
            //    exportable: false,
            //    refreshable: false,
            //    searchable: true
            //},
            customControls: [
                '<a id="btnDeleteDNS" class="disabled-link" title="Delete DNS Server"><i class="icon-trash"></i></a>',
                '<a id="btnCreateDNS" onclick="showDnsEditWindow(\'add\');return false;" title="Create DNS Server"><i class="icon-plus"></i></a>'
            ]
        },
        columnHeader : {
            columns : [
            {
                id: "DnsServer",
                field: "DnsServer",
                name: "Dns Server",
                sortable: true
            },
            {
                id: "DomainName",
                field: "DomainName",
                name: "Domain Name",
                sortable: true
            },
            {
                id: "Forwarders",
                field: "Forwarders",
                name: "Forwarders",
                sortable: true
            }]
        },
        body : {
            options : {
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeleteDNS').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteDNS').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            showDnsEditWindow('edit',rowIndex);
                        }
                    },
                    {
                        title: 'Delete',
                        iconClass: 'icon-trash',
                        onClick: function(rowIndex){
                            showRemoveWindow(rowIndex);
                        }
                    }
                ]
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                    text: 'Loading DNS Servers..',
                },
                empty: {
                    text: 'No DNS Servers Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting DNS Servers.'
                }
            }
        }
    });
    gridDNS = $("#gridDNS").data("contrailGrid");
    $("#gridDNS").data("contrailGrid").showGridMessage("loading");

    btnDeleteDNS = $("#btnDeleteDNS");
    btnCreateDNS = $("#btnCreateDNS");
    btnRemovePopupOK = $("#btnRemovePopupOK");
    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");
    btnCreateDNSOK = $("#btnCreateDNSOK");
    btnCreateDNSCancel = $("#btnCreateDNSCancel");

    txtLocalServiceIP = $("#txtLocalServiceIP");
    txtLocalServicePort = $("#txtLocalServicePort");
    txtFabServiceDNS = $("#txtFabServiceDNS");
    txtFabricServicePort = $("#txtFabricServicePort");
    
    ddLocalServiceName = $("#ddLocalServiceName").contrailCombobox({
        placeholder: "Service Name",
        dataTextField:"text",
        dataValueField:"value",
        dataSource: {
        },
    	change: checkMetadata
    });
    $("#ddLocalServiceName").data("contrailCombobox").setData([{"text":"metadata","value":"metadata"}]);

    ddFabServiceIPDNS = $("#ddFabServiceIPDNS").contrailDropdown({
        change: handleIPDNS,
        data: [{id:"ip", text:"IP"}, {id:"dns", text:"DNS"}]
    });
    windowCreateDNS = $("#windowCreateDNS");
    windowCreateDNS.on("hide", closeCreateDnsWindow);
    windowCreateDNS.modal({backdrop:'static', keyboard: false, show:false});

    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}

function initActions() {
    btnDeleteDNS.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.modal('show');
        }
    });

    btnCreateDNSOK.click(function (a) {
    	if(!validate())
    		return false;
        var gvrConfig = configObj["global-vrouter-config"];
        if(null !== gvrConfig && typeof gvrConfig !== "undefined") { 
        	if(null === gvrConfig["dns_server"] || 
        		typeof gvrConfig["dns_server"] === "undefined" ||
        		null === gvrConfig["dns_server"]["dns_server_entry"] ||
        		typeof gvrConfig["dns_server"]["dns_server_entry"] === "undefined") {
        		gvrConfig["dns_server"] = {};
        		gvrConfig["dns_server"]["dns_server_entry"] = [];
        	}
    	    var dnsConfigData = gvrConfig["dns_server"]["dns_server_entry"];
    	    if($("#ddLocalServiceName").data("contrailCombobox").isEnabled() === false) {
    	      	//Mode Edit
    	    	for(var i=0; i<dnsConfigData.length; i++) {
    	    		var dnsEntry = dnsConfigData[i];
	        		if(dnsEntry["dns_server_name"] === 
	        			$(ddLocalServiceName).data("contrailCombobox").text().trim()) {
	                    dnsEntry["dns_server_name"] = $(ddLocalServiceName).data("contrailCombobox").text().trim();
	                    dnsEntry["dns_server_ip"] = $(txtLocalServiceIP).val().trim();
	                    dnsEntry["dns_server_port"] = parseInt($(txtLocalServicePort).val().trim());
	                    dnsEntry["ip_fabric_service_port"] = parseInt($(txtFabricServicePort).val().trim());
	                    dnsEntry["ip_fabric_DNS_service_name"] = "";
	                    dnsEntry["ip_fabric_service_ip"] = [];
	                    var fabOption = $("#ddFabServiceIPDNS").data("contrailDropdown").text();
	                    if(fabOption === "IP") {
	                    	if(null === $("#txtFabricDNSIP_0").val().trim() ||
	                    		typeof $("#txtFabricDNSIP_0").val().trim() === "undefined" ||
	                    		"" === $("#txtFabricDNSIP_0").val().trim() ||
	                    		!validip($("#txtFabricDNSIP_0").val().trim())) {
	                    		showInfoWindow("Enter a valid IP address in xxx.xxx.xxx.xxx format", "Invalid input");
	                    		return false;
	                    	}
	                    		
	                    	dnsEntry["ip_fabric_service_ip"][0] = $("#txtFabricDNSIP_0").val().trim();
	                    	var fabTuples = $("#fabTuples").children();
	                    	if(fabTuples.length>0) {
	                    		for(var j=0; j<fabTuples.length; j++) {
	                    			dnsEntry["ip_fabric_service_ip"][dnsEntry["ip_fabric_service_ip"].length] = 
	                    	            $($($("#fabTuples").children()[j]).find("input")).val().trim();
	                    		}
	                    	}
	                    } else {
	                    	dnsEntry["ip_fabric_DNS_service_name"] = $("#txtFabricDNSIP_0").val().trim();
	                    }
	        			break;
	        		}
    	    	}
        	} else {
        		//Mode Add
        		var dnsEntry = {};
                dnsEntry["dns_server_name"] = $(ddLocalServiceName).data("contrailCombobox").text().trim();
                dnsEntry["dns_server_ip"] = $(txtLocalServiceIP).val().trim();
                dnsEntry["dns_server_port"] = parseInt($(txtLocalServicePort).val().trim());
                dnsEntry["ip_fabric_service_port"] = parseInt($(txtFabricServicePort).val().trim());
                dnsEntry["ip_fabric_DNS_service_name"] = "";
                dnsEntry["ip_fabric_service_ip"] = [];
                var fabOption = $("#ddFabServiceIPDNS").data("contrailDropdown").text();
                if(fabOption === "IP") {
                	dnsEntry["ip_fabric_service_ip"][0] = $("#txtFabricDNSIP_0").val().trim();
                	var fabTuples = $("#fabTuples").children();
                	if(fabTuples.length>0) {
                		for(var j=0; j<fabTuples.length; j++) {
                			dnsEntry["ip_fabric_service_ip"][dnsEntry["ip_fabric_service_ip"].length] = 
                	            $($($("#fabTuples").children()[j]).find("input")).val().trim();
                		}
                	}
                } else {
                	dnsEntry["ip_fabric_DNS_service_name"] = $("#txtFabricDNSIP_0").val().trim();
                }
                dnsConfigData[dnsConfigData.length] = dnsEntry;
        	}
        } else {
        	gvrConfig = {};
        	gvrConfig["global-vrouter-config"] = {};
            gvrConfig["global-vrouter-config"]["dns_server"] = {};
            gvrConfig["global-vrouter-config"]["dns_server"]["dns_server_entry"] = [];
        	gvrConfig["global-vrouter-config"]["dns_server"]["dns_server_entry"][0] = {};
        	var dnsEntry = gvrConfig["global-vrouter-config"]["dns_server"]["dns_server_entry"][0];
            dnsEntry["dns_server_name"] = $(ddLocalServiceName).data("contrailCombobox").text().trim();
            dnsEntry["dns_server_ip"] = $(txtLocalServiceIP).val().trim();
            dnsEntry["dns_server_port"] = parseInt($(txtLocalServicePort).val().trim());
            dnsEntry["ip_fabric_service_port"] = parseInt($(txtFabricServicePort).val().trim());
            dnsEntry["ip_fabric_DNS_service_name"] = "";
            dnsEntry["ip_fabric_service_ip"] = [];
            var fabOption = $("#ddFabServiceIPDNS").data("contrailDropdown").text();
            if(fabOption === "IP") {
            	var fabTuples = $("#fabTuples").children();
            	if(fabTuples.length>0) {
            		for(var j=0; j<fabTuples.length; j++) {
            			dnsEntry["ip_fabric_service_ip"][dnsEntry["ip_fabric_service_ip"].length] = 
            	            $($($("#fabTuples").children()[j]).find("input")).val().trim();
            		}
            	}
            	dnsEntry["ip_fabric_service_ip"][0] = $("#txtFabricDNSIP_0").val().trim();
            } else {
            	dnsEntry["ip_fabric_DNS_service_name"] = $("#txtFabricDNSIP_0").val().trim();
            }
        }
        if(null === configObj["global-vrouter-config"] ||
           	typeof configObj["global-vrouter-config"] === "undefined" ||
           	null === configObj["global-vrouter-config"]["uuid"] ||
           	typeof configObj["global-vrouter-config"]["uuid"] === "undefined") {
            doAjaxCall("/api/tenants/config/global-vrouter-configs", "POST", 
            	JSON.stringify(gvrConfig), "fetchData", "handleCommitFailure");
        } else {
            var gvrId = configObj["global-vrouter-config"]["uuid"];
            var gvr = {};
            gvr["global-vrouter-config"] = {};
            gvr["global-vrouter-config"] = gvrConfig;
            doAjaxCall("/api/tenants/config/global-vrouter-config/" + gvrId + "/link-local-services",
                "PUT", JSON.stringify(gvr), "fetchData", "handleCommitFailure");
        }
        windowCreateDNS.modal("hide");
    });
    
    btnCreateDNSCancel.click(function (a) {
    	windowCreateDNS.modal("hide");
    });
    
    btnCnfRemoveMainPopupCancel.click(function (a) {
        confirmMainRemove.modal('hide');
    });

    btnCnfRemoveMainPopupOK.click(function (a) {
        var selected_rows = $("#gridDNS").data("contrailGrid").getCheckedRows();
        deleteDns(selected_rows);
        confirmMainRemove.modal('hide');
    });
}

function handleCommitFailure(result) {
	showInfoWindow("Error in saving configuration.", "Error", result);
	fetchData();
}

function fetchData() {
    $("#gridDNS").data("contrailGrid")._dataView.setData([]);
    $("#gridDNS").data("contrailGrid").showGridMessage("loading");
    doAjaxCall(
           "/api/tenants/config/global-vrouter-config", "GET",
        null, "populateData", "failureHandlerForGridDns", null, null);
}

function failureHandlerForGridDns(result, cbParam) {
    $("#gridDNS").data("contrailGrid").showGridMessage("errorGettingData");
}

function populateData(result) {
	clearValuesFromDomElements();
	btnCreateDNS.attr('disabled',false);
    if(null !== result) {
        gvrConfig = result["global-vrouter-config"];
        configObj["global-vrouter-config"] = {};
        configObj["global-vrouter-config"] = result["global-vrouter-config"];
        if(null !== gvrConfig["dns_server"] && 
            typeof gvrConfig["dns_server"] !== "undefined" &&
            null !== gvrConfig["dns_server"]["dns_server_entry"] &&
            typeof gvrConfig["dns_server"]["dns_server_entry"] !== "undefined" &&
            gvrConfig["dns_server"]["dns_server_entry"].length > 0) {
            var gridData = [];
            var dnsEntries = gvrConfig["dns_server"]["dns_server_entry"];
            for(var i=0; i<dnsEntries.length; i++) {
                var dnsEntry = dnsEntries[i];
                
                var localServiceName = dnsEntry["dns_server_name"];
                if(null === localServiceName || typeof localServiceName === "undefined")
                	localServiceName = "";

                var localAddress = "";
                var localServiceIP = dnsEntry["dns_server_ip"];
                if(null === localServiceIP || typeof localServiceIP === "undefined")
                	localServiceIP = "";
                else {
                	localAddress = localServiceIP; 
                }
                
                var localServicePort = dnsEntry["dns_server_port"];
                if(null === localServicePort || typeof localServicePort === "undefined")
                	localServicePort = "";
                else {
                	localAddress += ":" + localServicePort; 
                }
                
                var fabricIP = dnsEntry["ip_fabric_service_ip"];
                if(null === fabricIP || typeof fabricIP === "undefined")
                	fabricIP = "";
                
                var fabricPort = dnsEntry["ip_fabric_service_port"];
                if(null === fabricPort || typeof fabricPort === "undefined")
                	fabricPort = "";
                
                var fabricDnsName = dnsEntry["ip_fabric_DNS_service_name"];
                if(null === fabricDnsName || typeof fabricDnsName === "undefined" ||
                	typeof fabricDnsName !== "string")
                	fabricDnsName = "";
                

                if(null !== fabricDnsName && 
                	typeof fabricDnsName === "object" &&
                	fabricDnsName.length > 0) {
                	    fabricDnsName = fabricDnsName[0];
                }
                
                if("" === fabricDnsName) {
                	//IP given
                    var fabricAddress = [];
                    if(null !== fabricIP && typeof fabricIP !== "undefined" &&
                    	typeof fabricIP === "object" && fabricIP.length > 0) {
                    	for(var j=0; j<fabricIP.length; j++) {
                    		fabricAddress[j] = 
                    		fabricIP[j] + ((null !== fabricPort && typeof fabricPort !== "undefined") ? ":" + fabricPort : "");  
                    	}
                    	fabricAddress = fabricAddress.join(",");
                    }
                } else {
                	if(null !== fabricPort && typeof fabricPort !== "undefined")
                		fabricAddress = fabricDnsName + ":" + fabricPort;
                	
                }

                gridData.push({
                    "id" : i,
                    "LocalServiceName" : localServiceName,
                    "LocalServiceIP" : localServiceIP,
                    "LocalServicePort" : localServicePort,
                    "LocalServiceAddress" : localAddress,
                    "FabServiceIP" : fabricIP,
                    "FabServicePort" : fabricPort,
                    "FabServiceAddress" : fabricAddress,
                    "FabDNSServiceName" : fabricDnsName
                });
            }
            $("#gridDNS").data("contrailGrid")._dataView.setData(gridData);
        } else {
            $("#gridDNS").data("contrailGrid").showGridMessage("empty");
        }
    } else {
    	configObj["global-vrouter-config"] = {};
    	delete configObj["global-vrouter-config"];
        $("#gridDNS").data("contrailGrid").showGridMessage("empty");
    }
}

function clearValuesFromDomElements() {
    mode = "";
    $("#ddLocalServiceName").data("contrailCombobox").value("");
    $("#ddLocalServiceName").data("contrailCombobox").text("");
    $("#ddLocalServiceName").data("contrailCombobox").enable(true);
    $("#ddLocalServiceName").data("contrailCombobox").setData([]);
    $("#ddLocalServiceName").data("contrailCombobox").setData([{"text":"metadata","value":"metadata"}]);    
    $(txtLocalServiceIP).val("");
    $(txtLocalServicePort).val("");    
    $(txtFabricServicePort).val("");
    $(txtFabServiceDNS).val("");
    $(txtFabServiceDNS).show();
    $("#txtFabricDNSIP_0").val("");
    $("#ddFabServiceIPDNS").data("contrailDropdown").value("ip");

    clearFabEntries();
}

function checkMetadata(e) {
	var option = $("#ddLocalServiceName").data("contrailCombobox").text();
	option = option.toLowerCase();
    var gridData = $("#gridDNS").data("contrailGrid")._dataView.getItems();
    if("metadata" === option.trim()) {
    	var dnsNames = jsonPath(gridData, "$..LocalServiceName");
    	if(dnsNames !== false && dnsNames.indexOf("metadata") !== -1) {
    		$("#ddLocalServiceName").data("contrailCombobox").value("");    		
    		showInfoWindow("Local service 'metadata' already exists.", "Invalid input");
    	} else {
    	    $(txtLocalServiceIP).val("169.254.169.254");
    	    $(txtLocalServicePort).val("80");
    	}
    }	
}

function handleIPDNS(e) {
    var option = e.added.text;
    if("IP" === option.trim()) {
        $("#fabTuples").show();
        $("#addinterfaces").show();
    } else if("DNS" === option.trim()) {
        $("#fabTuples").hide();
        $("#addinterfaces").hide();
    }
}

function showDnsEditWindow(mode, rowIndex) {
    if (mode === "add") {
        windowCreateDNS.find('h6.modal-header-title').text('Create DNS Server');
        $($($("#ddLocalServiceName").next()[0]).find("input")[0]).focus();
    } else if (mode === "edit") {
        var selectedRow = $("#gridDNS").data("contrailGrid")._dataView.getItem(rowIndex);
        $(ddLocalServiceName).data("contrailCombobox").text(selectedRow.LocalServiceName);
        $(ddLocalServiceName).data("contrailCombobox").value(selectedRow.LocalServiceName);
        $("#ddLocalServiceName").data("contrailCombobox").enable(false);
        windowCreateDNS.find('h6.modal-header-title').text('Edit Link Local Service "' + selectedRow.LocalServiceName + '"');
        
        txtLocalServiceIP.val(selectedRow.LocalServiceIP);
        txtLocalServicePort.val(selectedRow.LocalServicePort);
        
        if(null !== selectedRow.FabDNSServiceName && 
        	typeof selectedRow.FabDNSServiceName !== "undefined" && 
        	"" !== selectedRow.FabDNSServiceName.trim()) {
        	$("#ddFabServiceIPDNS").data("contrailDropdown").value("dns");
            $("#fabTuples").hide();
            $("#addinterfaces").hide();        
        	if(selectedRow.FabDNSServiceName.indexOf(":") !== -1) {
        		$("#txtFabricDNSIP_0").val(selectedRow.FabDNSServiceName.split(":")[0]);
        	} else {
        		$("#txtFabricDNSIP_0").val(selectedRow.FabDNSServiceName);
        	}
        } else {
        	$("#ddFabServiceIPDNS").data("contrailDropdown").value("ip");
            $("#fabTuples").show();
            $("#addinterfaces").show();            
        	var fabServiceIPPort = selectedRow.FabServiceAddress.split(",");
        	$("#txtFabricDNSIP_0").val(fabServiceIPPort[0].split(':')[0]);
        	for(var i=1; i<fabServiceIPPort.length; i++) {
                var fabEntry = createFabEntry(fabServiceIPPort[i].split(':')[0], i);
                $("#fabTuples").append(fabEntry);
        	}
        }
        txtFabricServicePort.val(selectedRow.FabServicePort);
    }
    windowCreateDNS.modal("show");
    windowCreateDNS.find('.modal-body').scrollTop(0);
}

function closeCreateDnsWindow() {
    clearValuesFromDomElements();
}

function showRemoveWindow(rowIndex) {
    $.contrailBootstrapModal({
       id: 'confirmRemove',
       title: 'Remove',
       body: '<h6>Confirm Link Local Service delete</h6>',
       footer: [{
           title: 'Cancel',
           onclick: 'close',
       },
       {
           id: 'btnRemovePopupOK',
           title: 'Confirm',
           rowIdentifier: rowIndex,
           onclick: function(){
               var rowNum = this.rowIdentifier;
               var selected_row = $("#gridDNS").data("contrailGrid")._dataView.getItem(rowNum);
               deleteDns([selected_row]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
       }
       ]
   });
}

function createFabEntry(ip, len) {
    var inputTxtIP = document.createElement("input");
    inputTxtIP.type = "text";
    inputTxtIP.className = "span12";
    inputTxtIP.setAttribute("placeholder", "IP Address");
    var divIP = document.createElement("div");
    divIP.className = "span9";
    divIP.appendChild(inputTxtIP);
    
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendFabEntry(this);");
    iBtnAddRule.setAttribute("title", "Add IP Address below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-left margin-5 span1";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteFabEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete IP Address");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-left margin-5 span1";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);
    
    var divRowFluidMargin10 = document.createElement("div");
    divRowFluidMargin10.className = "row-fluid";
    divRowFluidMargin10.appendChild(divIP);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.appendChild(divRowFluidMargin10);

    if (null !== ip && typeof ip !== "undefined") {
        $(inputTxtIP).val(ip);
    }    
    return rootDiv;
}

function appendFabEntry(who, defaultRow) {
	var ip = $(txtFabricDNSIP_0).val().trim();
    if (typeof ip === "undefined" || ip === "" || !validip(ip) || ip.indexOf("/") !== -1) {
        showInfoWindow("Enter IP address in the format xxx.xxx.xxx.xxx", "Input required");
        return false;
    }

    var len = $("#fabTuples").children().length;
    if(len > 0) {
        for(var i=0; i<len; i++) {
            var ip = $($($("#fabTuples").children()[i]).find("input")).val().trim();
            if (typeof ip === "undefined" || ip === "" || !validip(ip) || ip.indexOf("/") !== -1) {
                showInfoWindow("Enter IP address in the format xxx.xxx.xxx.xxx", "Input required");
                return false;
            }
        }
    }

    var fabEntry = createFabEntry(null, len);
    if (defaultRow) {
        $("#fabTuples").prepend($(fabEntry));
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(fabEntry, parentEl.nextSibling);
    }
}

function deleteFabEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
}

function clearFabEntries() {
    var tuples = $("#fabTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[i]).empty();
        }
        $(tuples).empty();
        $("#fabTuples").empty();
    }
}

function deleteDns(selected_rows) {
	if(null !== selected_rows && typeof selected_rows !== "undefined") {
		var gvrConfigData = configObj["global-vrouter-config"];
		if(null !== gvrConfigData && typeof gvrConfigData !== "undefined") {
			if(null !== gvrConfigData["dns_server"] &&
				typeof gvrConfigData["dns_server"] !== "undefined" &&
				null !== gvrConfigData["dns_server"]["dns_server_entry"] &&
				typeof gvrConfigData["dns_server"]["dns_server_entry"] !== "undefined" &&
				gvrConfigData["dns_server"]["dns_server_entry"].length > 0) {
				if($("#gridDNS").find("input.headerRowCheckbox")[0].checked === true) {
					delete gvrConfigData["dns_server"];
				} else {
					for(var i=0; i<selected_rows.length; i++) {
						var localServiceName = selected_rows[i].LocalServiceName.trim();
						var dnsEntries =
							gvrConfigData["dns_server"]["dns_server_entry"]; 
						for(var j=0; j<dnsEntries.length; j++) {
							if(localServiceName === 
								dnsEntries[j]["dns_server_name"].trim()) {
								(gvrConfigData["dns_server"]["dns_server_entry"]).splice(j,1);
							}
						}
					}
				}
	            var gvr = {};
	            var gvrId = configObj["global-vrouter-config"]["uuid"];
	            gvr["global-vrouter-config"] = {};
	            gvr["global-vrouter-config"] = gvrConfigData;
	            doAjaxCall("/api/tenants/config/global-vrouter-config/" + gvrId + "/link-local-services",
	                "PUT", JSON.stringify(gvr), "fetchData", "handleCommitFailure");
			}
		}
	}
}

function validate() {
    var localServiceName = $("#ddLocalServiceName").data("contrailCombobox").text();
    
    if(null === localServiceName || 
    	typeof localServiceName === "undefined" ||
    	"" === localServiceName.trim()) {
        showInfoWindow("Enter Service name", "Invalid Input");
        return false;
    }

    var localServiceIp = $(txtLocalServiceIP).val();
    if(null === localServiceIp || 
        typeof localServiceIp === "undefined" ||
        "" === localServiceIp.trim() ||
        !validip(localServiceIp) ||
        localServiceIp.indexOf("/") !== -1) {
        showInfoWindow("Enter valid IP address in the format xxx.xxx.xxx.xxx for local service", "Invalid Input");
        return false;
    }

    var localServicePort = $(txtLocalServicePort).val();
    if(null === localServicePort || 
    	typeof localServicePort === "undefined" ||
        "" === localServicePort.trim() ||
        isNaN(localServicePort.trim()) ||
        parseInt(localServicePort.trim()) > 65535 ||
        parseInt(localServicePort.trim()) < 1) {
        showInfoWindow("Enter valid local port number between 1 to 65535", "Invalid Input");
        return false;
    }

    var fabOption = $("#ddFabServiceIPDNS").data("contrailDropdown").text();
    if(fabOption === "IP") {
    	var fabricServiceIp = $("#txtFabricDNSIP_0").val();
        if(null === fabricServiceIp || 
	        typeof fabricServiceIp === "undefined" ||
	        "" === fabricServiceIp.trim() ||
	        !validip(fabricServiceIp) ||
	        fabricServiceIp.indexOf("/") !== -1) {
	        showInfoWindow("Enter valid IP address in the format xxx.xxx.xxx.xxx for fabric service", "Invalid Input");
	        return false;
	    }

    	var fabTuples = $("#fabTuples").children();
    	if(fabTuples.length>0) {
    		for(var j=0; j<fabTuples.length; j++) {
	        	var fabricServiceIp = $($($("#fabTuples").children()[j]).find("input")).val();
	            if(null === fabricServiceIp || 
	    	        typeof fabricServiceIp === "undefined" ||
	    	        "" === fabricServiceIp.trim() ||
	    	        !validip(fabricServiceIp) ||
	    	        fabricServiceIp.indexOf("/") !== -1) {
	    	        showInfoWindow("Enter valid IP address in the format xxx.xxx.xxx.xxx for fabric service", "Invalid Input");
	    	        return false;
	    	    }
    		}
    	}
    } else {
    	var fabricServiceDns = $("#txtFabricDNSIP_0").val();
        if(null === fabricServiceDns || 
        	typeof fabricServiceDns === "undefined" ||
        	"" === fabricServiceDns.trim()) {
            showInfoWindow("Enter DNS name", "Invalid Input");
            return false;
        }
    }

    var fabricServicePort = $(txtFabricServicePort).val();
    if(null === fabricServicePort || 
    	typeof fabricServicePort === "undefined" ||
        "" === fabricServicePort.trim() ||
        isNaN(fabricServicePort.trim()) ||
        parseInt(fabricServicePort.trim()) > 65535 ||
        parseInt(fabricServicePort.trim()) < 1) {
        showInfoWindow("Enter valid fabric port number between 1 to 65535", "Invalid Input");
        return false;
    }

    return true;
}

function destroy() {
    btnDeleteDNS = $("#btnDeleteDNS");
	if(isSet(btnCreateDNS)) {
	    btnCreateDNS.remove();
	    btnCreateDNS = $();
	}
	
	btnCreateDNS = $("#btnCreateDNS");
    if(isSet(btnDeleteDNS)) {
	    btnDeleteDNS.remove();
	    btnDeleteDNS = $();
    }
    
    btnRemovePopupOK = $("#btnRemovePopupOK");
    if(isSet(btnRemovePopupOK)) {
	    btnRemovePopupOK.remove();
	    btnRemovePopupOK = $();
    }
    
    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    if(isSet(btnRemovePopupCancel)) {
	    btnRemovePopupCancel.remove();
	    btnRemovePopupCancel = $();
    }
    
    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    if(isSet(btnCnfRemoveMainPopupOK)) {
	    btnCnfRemoveMainPopupOK.remove();
	    btnCnfRemoveMainPopupOK = $();
    }
    
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");
    if(isSet(btnCnfRemoveMainPopupCancel)) {
	    btnCnfRemoveMainPopupCancel.remove();
	    btnCnfRemoveMainPopupCancel = $();
    }
    
    btnCreateDNSOK = $("#btnCreateDNSOK");
    if(isSet(btnCreateDNSOK)) {
	    btnCreateDNSOK.remove();
	    btnCreateDNSOK = $();
    }

    btnCreateDNSCancel = $("#btnCreateDNSCancel");
    if(isSet(btnCreateDNSCancel)) {
	    btnCreateDNSCancel.remove();
	    btnCreateDNSCancel = $();
    }

    gridDNS = $("#gridDNS").data("contrailGrid");
    if(isSet(gridDNS)) {
    	gridDNS.destroy();
        $("#gridDNS").empty();
    	gridDNS = $();
    }
    
    txtLocalServiceIP = $("#txtLocalServiceIP");
    if(isSet(txtLocalServiceIP)) {
	    txtLocalServiceIP.remove();
	    txtLocalServiceIP = $();
    }
    
    txtLocalServicePort = $("#txtLocalServicePort");
    if(isSet(txtLocalServicePort)) {
	    txtLocalServicePort.remove();
	    txtLocalServicePort = $();
    }
    
    txtFabricServicePort = $("#txtFabricServicePort");
    if(isSet(txtFabricServicePort)) {
	    txtFabricServicePort.remove();
	    txtFabricServicePort = $();
    }
    
    txtFabServiceDNS = $("#txtFabServiceDNS");
    if(isSet(txtFabServiceDNS)) {
	    txtFabServiceDNS.remove();
	    txtFabServiceDNS = $();
    }

    ddFabServiceIPDNS = $("#ddFabServiceIPDNS").data("contrailDropdown");
    if(isSet(ddFabServiceIPDNS)) {
    	ddFabServiceIPDNS.destroy();
    	ddFabServiceIPDNS = $();
    }
    
    ddLocalServiceName = $("#ddLocalServiceName").data("contrailCombobox");
    if(isSet(ddLocalServiceName)) {
	    ddLocalServiceName.destroy();
	    ddLocalServiceName = $();
    }

    windowCreateDNS = $("#windowCreateDNS");
    if(isSet(windowCreateDNS)) {
	    windowCreateDNS.remove();
	    windowCreateDNS = $();
    }
    
    confirmRemove = $("#confirmRemove");
    if(isSet(confirmRemove)) {
	    confirmRemove.remove();
	    confirmRemove = $();
    }
   
    confirmMainRemove = $("#confirmMainRemove");
    if(isSet(confirmMainRemove)) {
	    confirmMainRemove.remove();
	    confirmMainRemove = $();
    }

    var configTemplate = $("#dns-config-template");
    if(isSet(configTemplate)) {
	    configTemplate.remove();
	    configTemplate = $();
    }
}
