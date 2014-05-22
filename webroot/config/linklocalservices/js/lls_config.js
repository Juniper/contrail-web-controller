/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

llsConfigObj = new LinkLocalServicesConfigObj();

function LinkLocalServicesConfigObj() {
    var btnDeleteLLS, btnCreateLLS, btnRemovePopupOK,
    btnRemovePopupCancel, btnCnfRemoveMainPopupOK,
    btnCnfRemoveMainPopupCancel, btnCreateLLSOK, 
    btnCreateLLSCancel;
    
    var windowCreateLLS, confirmRemove, confirmMainRemove;
    
    var txtLocalServiceIP, txtLocalServicePort,
    txtFabServiceDNS, txtFabricServicePort;

    var ddFabServiceIPDNS, ddLocalServiceName;
    var gridLLS;
    
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.populateData = populateData;
    this.failureHandlerForGridLLS = failureHandlerForGridLLS;
    this.handleCommitFailure = handleCommitFailure;
    this.createFabEntry = createFabEntry;
    this.appendFabEntry = appendFabEntry;
    this.deleteFabEntry = deleteFabEntry; 
    this.clearFabEntries = clearFabEntries; 
    this.showLLSEditWindow = showLLSEditWindow;
    this.deleteLLS = deleteLLS;
    this.closeCreateLLSWindow = closeCreateLLSWindow;
    this.clearValuesFromDomElements = clearValuesFromDomElements;
    this.showRemoveWindow = showRemoveWindow;
    this.handleIPDNS = handleIPDNS;
    this.checkMetadata = checkMetadata;
    this.validate = validate;
    this.destroy = destroy;
}

function load() {
    var configTemplate = Handlebars.compile($("#lls-config-template").html());
    $(contentContainer).html('');
    $(contentContainer).html(configTemplate);
    currTab = 'config_infra_lls';
    init();
}

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
}

function initComponents() {
    $("#gridLLS").contrailGrid({
        header : {
            title : {
                text : 'Link Local Services',
                cssClass : 'blue',
                icon : 'icon-list',
                iconCssClass : 'blue'
            },
            //defaultControls: {
            //    collapseable: false,
            //    exportable: false,
            //    refreshable: false,
            //    searchable: true
            //},
            customControls: [
                '<a id="btnDeleteLLS" class="disabled-link" title="Delete Link Local Service(s)"><i class="icon-trash"></i></a>',
                '<a id="btnCreateLLS" onclick="showLLSEditWindow(\'add\');return false;" title="Create Link Local Service"><i class="icon-plus"></i></a>'
            ]
        },
        columnHeader : {
            columns : [
            {
                id: "LocalServiceName",
                field: "LocalServiceName",
                name: "Service Name",
                sortable: true
            },
            {
                id: "LocalServiceAddress",
                field: "LocalServiceAddress",
                name: "Service Address",
                sortable: true
            },
            {
                id: "FabServiceAddress",
                field: "FabServiceAddress",
                name: "Fabric Address",
                sortable: true
            }]
        },
        body : {
            options : {
                checkboxSelectable: {
                    onNothingChecked: function(e){
                        $('#btnDeleteLLS').addClass('disabled-link');
                    },
                    onSomethingChecked: function(e){
                        $('#btnDeleteLLS').removeClass('disabled-link');
                    }
                },
                forceFitColumns: true,
                actionCell: [
                    {
                        title: 'Edit',
                        iconClass: 'icon-edit',
                        onClick: function(rowIndex){
                            showLLSEditWindow('edit',rowIndex);
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
                    text: 'Loading Link Local Services..',
                },
                empty: {
                    text: 'No Link Local Services Found.'
                }, 
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Error in getting Link Local Services.'
                }
            }
        }
    });
    gridLLS = $("#gridLLS").data("contrailGrid");
    $("#gridLLS").data("contrailGrid").showGridMessage("loading");

    btnDeleteLLS = $("#btnDeleteLLS");
    btnCreateLLS = $("#btnCreateLLS");
    btnRemovePopupOK = $("#btnRemovePopupOK");
    btnRemovePopupCancel = $("#btnRemovePopupCancel");
    btnCnfRemoveMainPopupOK = $("#btnCnfRemoveMainPopupOK");
    btnCnfRemoveMainPopupCancel = $("#btnCnfRemoveMainPopupCancel");
    btnCreateLLSOK = $("#btnCreateLLSOK");
    btnCreateLLSCancel = $("#btnCreateLLSCancel");

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
    $('body').append($("#windowCreateLLS"));
    windowCreateLLS = $("#windowCreateLLS");
    windowCreateLLS.on("hide", closeCreateLLSWindow);
    windowCreateLLS.modal({backdrop:'static', keyboard: false, show:false});

    $('body').append($("#confirmMainRemove"));
    confirmMainRemove = $("#confirmMainRemove");
    confirmMainRemove.modal({backdrop:'static', keyboard: false, show:false});

    $('body').append($("#confirmRemove"));
    confirmRemove = $("#confirmRemove");
    confirmRemove.modal({backdrop:'static', keyboard: false, show:false});
}

function initActions() {
    btnDeleteLLS.click(function (a) {
        if(!$(this).hasClass('disabled-link')) {
            confirmMainRemove.find('.modal-header-title').text("Confirm");
            confirmMainRemove.modal('show');
        }
    });

    btnCreateLLSOK.click(function (a) {
    	if(!validate())
    		return false;
        var gvrConfig = configObj["global-vrouter-config"];
        if(null !== gvrConfig && typeof gvrConfig !== "undefined") { 
        	if(null === gvrConfig["linklocal_services"] || 
        		typeof gvrConfig["linklocal_services"] === "undefined" ||
        		null === gvrConfig["linklocal_services"]["linklocal_service_entry"] ||
        		typeof gvrConfig["linklocal_services"]["linklocal_service_entry"] === "undefined") {
        		gvrConfig["linklocal_services"] = {};
        		gvrConfig["linklocal_services"]["linklocal_service_entry"] = [];
        	}
    	    var llsConfigData = gvrConfig["linklocal_services"]["linklocal_service_entry"];
    	    if($("#ddLocalServiceName").data("contrailCombobox").isEnabled() === false) {
    	      	//Mode Edit
    	    	for(var i=0; i<llsConfigData.length; i++) {
    	    		var llsEntry = llsConfigData[i];
	        		if(llsEntry["linklocal_service_name"] === 
	        			$(ddLocalServiceName).data("contrailCombobox").text().trim()) {
	                    llsEntry["linklocal_service_name"] = $(ddLocalServiceName).data("contrailCombobox").text().trim();
	                    llsEntry["linklocal_service_ip"] = $(txtLocalServiceIP).val().trim();
	                    llsEntry["linklocal_service_port"] = parseInt($(txtLocalServicePort).val().trim());
	                    llsEntry["ip_fabric_service_port"] = parseInt($(txtFabricServicePort).val().trim());
	                    llsEntry["ip_fabric_DNS_service_name"] = "";
	                    llsEntry["ip_fabric_service_ip"] = [];
	                    var fabOption = $("#ddFabServiceIPDNS").data("contrailDropdown").text();
	                    if(fabOption === "IP") {
	                    	if(null === $("#txtFabricDNSIP_0").val().trim() ||
	                    		typeof $("#txtFabricDNSIP_0").val().trim() === "undefined" ||
	                    		"" === $("#txtFabricDNSIP_0").val().trim() ||
	                    		!validip($("#txtFabricDNSIP_0").val().trim())) {
	                    		showInfoWindow("Enter a valid IP address in xxx.xxx.xxx.xxx format", "Invalid input");
	                    		return false;
	                    	}
	                    		
	                    	llsEntry["ip_fabric_service_ip"][0] = $("#txtFabricDNSIP_0").val().trim();
	                    	var fabTuples = $("#fabTuples").children();
	                    	if(fabTuples.length>0) {
	                    		for(var j=0; j<fabTuples.length; j++) {
	                    			llsEntry["ip_fabric_service_ip"][llsEntry["ip_fabric_service_ip"].length] = 
	                    	            $($($("#fabTuples").children()[j]).find("input")).val().trim();
	                    		}
	                    	}
	                    } else {
	                    	llsEntry["ip_fabric_DNS_service_name"] = $("#txtFabricDNSIP_0").val().trim();
	                    }
	        			break;
	        		}
    	    	}
        	} else {
        		//Mode Add
        		var llsEntry = {};
                llsEntry["linklocal_service_name"] = $(ddLocalServiceName).data("contrailCombobox").text().trim();
                llsEntry["linklocal_service_ip"] = $(txtLocalServiceIP).val().trim();
                llsEntry["linklocal_service_port"] = parseInt($(txtLocalServicePort).val().trim());
                llsEntry["ip_fabric_service_port"] = parseInt($(txtFabricServicePort).val().trim());
                llsEntry["ip_fabric_DNS_service_name"] = "";
                llsEntry["ip_fabric_service_ip"] = [];
                var fabOption = $("#ddFabServiceIPDNS").data("contrailDropdown").text();
                if(fabOption === "IP") {
                	llsEntry["ip_fabric_service_ip"][0] = $("#txtFabricDNSIP_0").val().trim();
                	var fabTuples = $("#fabTuples").children();
                	if(fabTuples.length>0) {
                		for(var j=0; j<fabTuples.length; j++) {
                			llsEntry["ip_fabric_service_ip"][llsEntry["ip_fabric_service_ip"].length] = 
                	            $($($("#fabTuples").children()[j]).find("input")).val().trim();
                		}
                	}
                } else {
                	llsEntry["ip_fabric_DNS_service_name"] = $("#txtFabricDNSIP_0").val().trim();
                }
                llsConfigData[llsConfigData.length] = llsEntry;
        	}
        } else {
        	gvrConfig = {};
        	gvrConfig["global-vrouter-config"] = {};
            gvrConfig["global-vrouter-config"]["linklocal_services"] = {};
            gvrConfig["global-vrouter-config"]["linklocal_services"]["linklocal_service_entry"] = [];
        	gvrConfig["global-vrouter-config"]["linklocal_services"]["linklocal_service_entry"][0] = {};
        	var llsEntry = gvrConfig["global-vrouter-config"]["linklocal_services"]["linklocal_service_entry"][0];
            llsEntry["linklocal_service_name"] = $(ddLocalServiceName).data("contrailCombobox").text().trim();
            llsEntry["linklocal_service_ip"] = $(txtLocalServiceIP).val().trim();
            llsEntry["linklocal_service_port"] = parseInt($(txtLocalServicePort).val().trim());
            llsEntry["ip_fabric_service_port"] = parseInt($(txtFabricServicePort).val().trim());
            llsEntry["ip_fabric_DNS_service_name"] = "";
            llsEntry["ip_fabric_service_ip"] = [];
            var fabOption = $("#ddFabServiceIPDNS").data("contrailDropdown").text();
            if(fabOption === "IP") {
            	var fabTuples = $("#fabTuples").children();
            	if(fabTuples.length>0) {
            		for(var j=0; j<fabTuples.length; j++) {
            			llsEntry["ip_fabric_service_ip"][llsEntry["ip_fabric_service_ip"].length] = 
            	            $($($("#fabTuples").children()[j]).find("input")).val().trim();
            		}
            	}
            	llsEntry["ip_fabric_service_ip"][0] = $("#txtFabricDNSIP_0").val().trim();
            } else {
            	llsEntry["ip_fabric_DNS_service_name"] = $("#txtFabricDNSIP_0").val().trim();
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
        windowCreateLLS.modal("hide");
    });
    
    btnCreateLLSCancel.click(function (a) {
    	windowCreateLLS.modal("hide");
    });
    
    btnCnfRemoveMainPopupCancel.click(function (a) {
        confirmMainRemove.modal('hide');
    });

    btnCnfRemoveMainPopupOK.click(function (a) {
        var selected_rows = $("#gridLLS").data("contrailGrid").getCheckedRows();
        deleteLLS(selected_rows);
        confirmMainRemove.modal('hide');
    });
}

function handleCommitFailure(result) {
	showInfoWindow("Error in saving configuration.", "Error", result);
	fetchData();
}

function fetchData() {
    $("#gridLLS").data("contrailGrid").showGridMessage("loading");
    $("#gridLLS").data("contrailGrid")._dataView.setData([]);
    doAjaxCall(
           "/api/tenants/config/global-vrouter-config", "GET",
        null, "populateData", "failureHandlerForGridLLS", null, null);
}

function failureHandlerForGridLLS(result, cbParam) {
    $("#gridLLS").data("contrailGrid").showGridMessage("errorGettingData");
}

function populateData(result) {
	clearValuesFromDomElements();
	btnCreateLLS.attr('disabled',false);
    if(null !== result) {
        gvrConfig = result["global-vrouter-config"];
        configObj["global-vrouter-config"] = {};
        configObj["global-vrouter-config"] = result["global-vrouter-config"];
        if(null !== gvrConfig["linklocal_services"] && 
            typeof gvrConfig["linklocal_services"] !== "undefined" &&
            null !== gvrConfig["linklocal_services"]["linklocal_service_entry"] &&
            typeof gvrConfig["linklocal_services"]["linklocal_service_entry"] !== "undefined" &&
            gvrConfig["linklocal_services"]["linklocal_service_entry"].length > 0) {
            var gridData = [];
            var llsEntries = gvrConfig["linklocal_services"]["linklocal_service_entry"];
            for(var i=0; i<llsEntries.length; i++) {
                var llsEntry = llsEntries[i];
                
                var localServiceName = llsEntry["linklocal_service_name"];
                if(null === localServiceName || typeof localServiceName === "undefined")
                	localServiceName = "";

                var localAddress = "";
                var localServiceIP = llsEntry["linklocal_service_ip"];
                if(null === localServiceIP || typeof localServiceIP === "undefined")
                	localServiceIP = "";
                else {
                	localAddress = localServiceIP; 
                }
                
                var localServicePort = llsEntry["linklocal_service_port"];
                if(null === localServicePort || typeof localServicePort === "undefined")
                	localServicePort = "";
                else {
                	localAddress += ":" + localServicePort; 
                }
                
                var fabricIP = llsEntry["ip_fabric_service_ip"];
                if(null === fabricIP || typeof fabricIP === "undefined")
                	fabricIP = "";
                
                var fabricPort = llsEntry["ip_fabric_service_port"];
                if(null === fabricPort || typeof fabricPort === "undefined")
                	fabricPort = "";
                
                var fabricDnsName = llsEntry["ip_fabric_DNS_service_name"];
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
            $("#gridLLS").data("contrailGrid")._dataView.setData(gridData);
        } else {
            $("#gridLLS").data("contrailGrid").showGridMessage("empty");
        }
    } else {
    	configObj["global-vrouter-config"] = {};
    	delete configObj["global-vrouter-config"];
        $("#gridLLS").data("contrailGrid").showGridMessage("empty");
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
    var gridData = $("#gridLLS").data("contrailGrid")._dataView.getItems();
    if("metadata" === option.trim()) {
    	var llsNames = jsonPath(gridData, "$..LocalServiceName");
    	if(llsNames !== false && llsNames.indexOf("metadata") !== -1) {
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

function showLLSEditWindow(mode, rowIndex) {
    if (mode === "add") {
        windowCreateLLS.find('h6.modal-header-title').text('Create Link Local Service');
        $($($("#ddLocalServiceName").next()[0]).find("input")[0]).focus();
    } else if (mode === "edit") {
        var selectedRow = $("#gridLLS").data("contrailGrid")._dataView.getItem(rowIndex);
        $(ddLocalServiceName).data("contrailCombobox").text(selectedRow.LocalServiceName);
        $(ddLocalServiceName).data("contrailCombobox").value(selectedRow.LocalServiceName);
        $("#ddLocalServiceName").data("contrailCombobox").enable(false);
        windowCreateLLS.find('h6.modal-header-title').text('Edit Link Local Service "' + selectedRow.LocalServiceName + '"');
        
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
    windowCreateLLS.modal("show");
    windowCreateLLS.find('.modal-body').scrollTop(0);
}

function closeCreateLLSWindow() {
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
               var selected_row = $("#gridLLS").data("contrailGrid")._dataView.getItem(rowNum);
               deleteLLS([selected_row]);
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

function deleteLLS(selected_rows) {
	if(null !== selected_rows && typeof selected_rows !== "undefined") {
		var gvrConfigData = configObj["global-vrouter-config"];
		if(null !== gvrConfigData && typeof gvrConfigData !== "undefined") {
			if(null !== gvrConfigData["linklocal_services"] &&
				typeof gvrConfigData["linklocal_services"] !== "undefined" &&
				null !== gvrConfigData["linklocal_services"]["linklocal_service_entry"] &&
				typeof gvrConfigData["linklocal_services"]["linklocal_service_entry"] !== "undefined" &&
				gvrConfigData["linklocal_services"]["linklocal_service_entry"].length > 0) {
				if($("#gridLLS").find("input.headerRowCheckbox")[0].checked === true) {
					delete gvrConfigData["linklocal_services"];
				} else {
					for(var i=0; i<selected_rows.length; i++) {
						var localServiceName = selected_rows[i].LocalServiceName.trim();
						var llsEntries =
							gvrConfigData["linklocal_services"]["linklocal_service_entry"]; 
						for(var j=0; j<llsEntries.length; j++) {
							if(localServiceName === 
								llsEntries[j]["linklocal_service_name"].trim()) {
								(gvrConfigData["linklocal_services"]["linklocal_service_entry"]).splice(j,1);
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
    btnDeleteLLS = $("#btnDeleteLLS");
	if(isSet(btnCreateLLS)) {
	    btnCreateLLS.remove();
	    btnCreateLLS = $();
	}
	
	btnCreateLLS = $("#btnCreateLLS");
    if(isSet(btnDeleteLLS)) {
	    btnDeleteLLS.remove();
	    btnDeleteLLS = $();
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
    
    btnCreateLLSOK = $("#btnCreateLLSOK");
    if(isSet(btnCreateLLSOK)) {
	    btnCreateLLSOK.remove();
	    btnCreateLLSOK = $();
    }

    btnCreateLLSCancel = $("#btnCreateLLSCancel");
    if(isSet(btnCreateLLSCancel)) {
	    btnCreateLLSCancel.remove();
	    btnCreateLLSCancel = $();
    }

    gridLLS = $("#gridLLS").data("contrailGrid");
    if(isSet(gridLLS)) {
    	gridLLS.destroy();
        $("#gridLLS").empty();
    	gridLLS = $();
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

    windowCreateLLS = $("#windowCreateLLS");
    if(isSet(windowCreateLLS)) {
	    windowCreateLLS.remove();
	    windowCreateLLS = $();
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

    var configTemplate = $("#lls-config-template");
    if(isSet(configTemplate)) {
	    configTemplate.remove();
	    configTemplate = $();
    }
}
