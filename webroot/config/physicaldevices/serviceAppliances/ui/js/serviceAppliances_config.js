serviceAppliancesConfigObj = new serviceAppliancesConfigObj();

function serviceAppliancesConfigObj() {
    //UI
    var $saGrid = null;
    var $saName = null;
    var $saEditButton = null;
    var $saDeleteButton = null;
    var $saPrDrop = null;
    var $saSetDrop = null;
    var $saLeftPiDrop = null;
    var $saLeftPiPrDrop = null;
    var $saLeftPiPiDrop = null;
    var $saRightPiDrop = null;
    var $saRightPiPrDrop = null;
    var $saRightPiPiDrop = null;
    var $saEditWindow = null;
    var $saDelWindow = null;

    //Configuration
    var ajaxTimeout = 300000;

    //Method Definations
    this.load = load;
    this.destroy = destroy;

    function load() {
        var configTemplate = Handlebars.compile($("#sa-config-template").html());
        $(contentContainer).html('');
        $(contentContainer).html(configTemplate);
        init();
    }

    function init() {
        initComponents();
        initActions();
    }

    function destroy() {

    }
    //////////////Tool function ////////////
    function getDataObjName(obj) {
        return obj.display_name ? obj.display_name : obj.name ? obj.name : obj.fq_name[obj.fq_name.length-1];
    }

    ////////////// UI part /////////////////
    function gridFormatter(r, c, v, cd, physical_refs) {
        var interfaces = "-";
        if (physical_refs.refs != null && physical_refs.refs.length > 0) {
            interfaces = "";
            for (var i = 0; i < physical_refs.refs.length; i++) {
                var pi = physical_refs.refs[i]['to'][2];
                if (i != 0 && i < 2) {
                    interfaces += "<br>";
                }
                if (i < 2) {
                    interfaces = interfaces + pi;
                }
            }
            if (physical_refs.refs.length > 2) {
                interfaces += '<br><span class="moredataText">(' +
                    (physical_refs.refs.length - 2) +
                    ' more)</span><span class="moredata" style="display:none;"></span>';
            }
        }
        return interfaces;
    }

    function initComponents() {
        var sasetSelectorTemplate = contrail.getTemplate4Id('sa-grid-saset-selector-template');
        $saGrid = $("#sa-grid");
        $saGrid.contrailGrid({
            header: {
                title: {
                    text: 'Service Appliances',
                    //cssClass : 'blue',
                    //icon : 'icon-list',
                    //iconCssClass : 'blue'                
                },
                customControls: [
                    sasetSelectorTemplate(),
                    '<a id="sa-grid-add-btn" \
                        title="Create Service Appliance">\
                        <i class="icon-plus"></i>\
                    </a>',
                    '<a id="sa-grid-del-btn" \
                        class="dropdown-toggle" data-toggle="dropdown" href="#" >\
                            <i class = "icon-trash"></i>\
                    </a>',
                ]
            },
            columnHeader: {
                columns: [{
                    id: 'name',
                    field: 'name',
                    name: 'Name'
                }, {
                    id: 'left_interface',
                    field: 'left_interface',
                    name: 'Left Physical Interface',
                    //formatter: gridFormatter,
                }, {
                    id: 'right_interface',
                    field: 'right_interface',
                    name: 'Right Physical Interface',
                    //formatter: gridFormatter,
                }]
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e) {
                            $('#deleteServiceAppliances').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e) {
                            $('#deleteServiceAppliances').removeClass('disabled-link');
                        }
                    },
                    forceFitColumns: true,
                    actionCell: function(dc) {
                        var ret = [];
                        ret.push({
                            title: 'Edit',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex) {
                                showServiceApplianceEditWindow(rowIndex);
                            }
                        });

                        ret.push({
                            title: 'Delete',
                            iconClass: 'icon-trash',
                            onClick: function(rowIndex) {
                                showServiceApplianceDelWindow(rowIndex);
                            }
                        });
                        return ret
                    },
                    detail: {
                        template: $("#sa-grid-template").html()
                    }
                },
                dataSource: {
                    data: []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Service Appliances..'
                    },
                    empty: {
                        text: 'No Service Appliances.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Service Appliances.'
                    }
                }
            }
        });
        //Init all the drop down list
        $saSetSelector = $('#sa-set-selector-drop').contrailDropdown({});

        $saPrDrop = $("#sa-pr-drop").contrailDropdown({});

        $saLeftPiDrop = $('#left-sapi-drop').contrailDropdown({});
        $saLeftPiPrDrop = $('#left-sapipr-drop').contrailDropdown({});
        $saLeftPiPiDrop = $('#left-sapipi-drop').contrailDropdown({});

        $saRightPiDrop = $('#right-sapi-drop').contrailDropdown({});
        $saRightPiPrDrop = $('#right-sapipr-drop').contrailDropdown({});
        $saRightPiPiDrop = $('#right-sapipi-drop').contrailDropdown({});

        //initializing edit window      
        $saEditWindow = $('#sa-edit-window').modal({
            backdrop: 'static',
            keyboard: false,
            show: false
        });

        //initializing delete record window
        $saDelWindow = $('#sa-del-window').modal({
            backdrop: 'static',
            keyboard: false,
            show: false,
        });

        //init SA name editor
        $saName = $('#sa-name-txt');

        //init SA set selector
        setSASETSelector();
    };
    function setSASETSelector(callback){
        SASET_data.read(function(sasets) {
            var currentUUID = null;
            var queryParams = window.location.href.split("&");
            if (queryParams != undefined && queryParams.length > 1 && queryParams[1].indexOf('=') != -1) {
                currentUUID = queryParams[1].split('=')[1];
            }
            var sasetList = [];
            var sasetShowIndex = 0;
            for (var i = 0; i < sasets.length; i++) {
                if (currentUUID && sasets[i].uuid == currentUUID) {
                    sasetShowIndex = i;
                }
                sasetList.push({
                    "text": getDataObjName(sasets[i]),
                    "value": sasets[i].uuid,
                    "data": sasets[i]
                });
            }
            $saSetSelector.contrailDropdown({
                data: sasetList,
                dataTextField: "text",
                dataValueField: "value",
                change: function() {
                    setServiceApplianceGrid();
                    var saset = $saSetSelector.data('contrailDropdown').getSelectedData()[0].data;
                    layoutHandler.setURLHashParams({
                        uuid: saset.uuid
                    }, {
                        triggerHashChange: false
                    });
                }
            });
            //Add url parameter
            $saSetSelector.data('contrailDropdown').value(sasetList[sasetShowIndex].value, true);
            if(callback){
                callback();
            }
        });
    }

    function initActions() {
        $('#sa-grid-add-btn').click(function(){showServiceApplianceEditWindow(null)});
        $('#sa-edit-window-cancel').click(clearServiceApplianceEditWindow);
        $('#sa-grid-del-btn').click(function(){showServiceApplianceDelWindow(null)});
    }

    /**** Grid ****/
    function setServiceApplianceGrid() {
        $saGrid.data('contrailGrid').showGridMessage('loading');
        $saGrid.data('contrailGrid')._dataView.setData([]);
        var saset = $saSetSelector.data('contrailDropdown').getSelectedData()[0].data;
        SA_data.read(function(sas) {
            var ds = [];
            if (!saset.service_appliances) {
                $saGrid.data('contrailGrid').showGridMessage('No records');
                return;
            }
            for (var i = 0; i < sas.length; i++) {
                for (var j = 0; j < saset.service_appliances.length; j++) {
                    if (sas[i].uuid == saset.service_appliances[j].uuid) {
                        var saName = sas[i].display_name != null ? sas[i].display_name : sas[i].name;
                        var physical_refs = sas[i]['physical_interface_refs'];
                        var left_interface = "-";
                        var right_interface = "-";
                        if (physical_refs && physical_refs.length > 0) {
                            for (var w = 0; w < physical_refs.length; w++) {
                                if (physical_refs[w]['attr']['interface_type'] == 'left') {
                                    left_interface = physical_refs[w]['to'][2];
                                }
                                if (physical_refs[w]['attr']['interface_type'] == 'right') {
                                    right_interface = physical_refs[w]['to'][2];
                                }
                            }
                        }
                        ds.push({
                            uuid: sas[i].uuid,
                            name: saName,
                            left_interface: left_interface,
                            right_interface: right_interface,
                            data: sas[i]
                        });
                    }
                }
            }
            $saGrid.data('contrailGrid')._dataView.setData(ds);
        });
    }
    /**** Windows ****/

    //Actions of the edit window
    function showServiceApplianceEditWindow(rowIndex) {
        if (rowIndex || rowIndex == 0) {
            $saEditWindow.find(".modal-header-title").text('Edit Service Appliance');
            if (SA_data.sas.length <= rowIndex) //in case of read failed
                return;
            var sa = $saGrid.data('contrailGrid')._dataView.getItem(rowIndex).data;
            setServiceApplianceEditWindow(sa);
            $('#sa-edit-window-ok').off('click');
            $('#sa-edit-window-ok').click(sa,confrimServiceApplianceEditWindow);
        } else {
            $saEditWindow.find(".modal-header-title").text('Add Service Appliance');
            setServiceApplianceEditWindow(null);
            $('#sa-edit-window-ok').off('click');
            $('#sa-edit-window-ok').click(null,confrimServiceApplianceEditWindow);
        }
    }

    function collectServiceApplianceEditWindow() {
        var saset = $saSetSelector.data('contrailDropdown').getSelectedData()[0].data;
        var saName = $saName.val();
        if (!saName) {
            showInfoWindow("Enter Service Appliance Name", "Input required");
            return false;
        }
        var leftInterData = $saLeftPiDrop.data('contrailDropdown').getSelectedData();
        if (!leftInterData) {
            showInfoWindow("Please select a physical interface as the left interface of this Service appliance", "Input required");
            return false;
        }
        var leftInter = leftInterData[0].data;

        var rightInterData = $saRightPiDrop.data('contrailDropdown').getSelectedData();
        if (!rightInterData) {
            showInfoWindow("Please select a physical interface as the right interface of this Service appliance", "Input required");
            return false;
        }
        var rightInter = rightInterData[0].data;

        var leftConnectedInterData = $saLeftPiPiDrop.data('contrailDropdown').getSelectedData();
        if (!leftConnectedInterData) {
            showInfoWindow("The left interface of the service appliance should connect to a router", "Input required");
            return false;
        }
        var leftConnectedInter = leftConnectedInterData[0].data;

        var rightConnectedInterData = $saRightPiPiDrop.data('contrailDropdown').getSelectedData();
        if (!rightConnectedInterData) {
            showInfoWindow("The right interface of the service appliance should connect to a router", "Input required");
            return false;
        }
        var rightConnectedInter = rightConnectedInterData[0].data;

        var sa = {
            fq_name: [
                'default-global-system-config',
                saset.fq_name[saset.fq_name.length - 1],
                saName,
            ],
            display_name:saName,
            parent_uuid: saset.uuid,
            parent_type: "service-appliance-set",
            physical_interface_refs: [{
                "uuid": leftInter.uuid,
                "to": leftInter.fq_name,
                "attr": {
                    "interface_type": "left",
                }
            }, {
                "uuid": rightInter.uuid,
                "to": rightInter.fq_name,
                "attr": {
                    "interface_type": "right",
                }
            }]
        };


        var leftConnectedRef = {
            "uuid": leftConnectedInter.uuid,
            "to": leftConnectedInter.fq_name
        };
        var rightConnectedRef = {
            "uuid": rightConnectedInter.uuid,
            "to": rightConnectedInter.fq_name
        };
        leftInter.physical_interface_refs = [leftConnectedRef];
        rightInter.physical_interface_refs = [rightConnectedRef];
        var pis = [leftInter, rightInter];
        return {
            sa: sa,
            pis: pis
        };
    }


    function preparePrList(prs) {
        var prList = [];
        for (var i = 0; i < prs.length; i++) {
            prList.push({
                "text": getDataObjName(prs[i]),
                "value": prs[i].uuid,
                "data": prs[i],
            });
        }
        return prList;
    }

    function preparePiList(pis) {
        var res = [];
        if (!pis) {
            return res;
        }
        for (var i = 0; i < pis.length; i++) {
            res.push({
                "text": getDataObjName(pis[i]),
                "value": pis[i].uuid,
                "data": pis[i],
            });
        }
        return res;
    }

    function setPisDropDown(pr, $dd) {
        PI_data.read(function(pis) {
            var pi_list = [];
            for (var i = 0; i < pis.length; i++) {
                for (var j = 0; j < pr.physical_interfaces.length; j++) {
                    if (pis[i].uuid == pr.physical_interfaces[j].uuid) {
                        pi_list.push(pis[i]);
                    }
                }
            }
            $dd.contrailDropdown({
                data: preparePiList(pi_list),
                dataTextField: "text",
                dataValueField: "value",
            });
        }, true)

    }

    function setServiceApplianceEditWindow(sa) {
        PR_data.read(function(prs) {
            $saPrDrop.contrailDropdown({
                data: preparePrList(prs),
                dataTextField: "text",
                dataValueField: "value",
                placeholder:"Select a Physical device",
                change: function() {
                    var pr = $saPrDrop.data('contrailDropdown').getSelectedData();
                    if (!pr) {
                        return
                    }
                    pr = pr[0].data;
                    setPisDropDown(pr, $saLeftPiDrop);
                    setPisDropDown(pr, $saRightPiDrop);
                },
            });
            $saLeftPiPrDrop.contrailDropdown({
                data: preparePrList(prs),
                dataTextField: "text",
                dataValueField: "value",
                placeholder:"Select a Physical Interface as the left interface",
                change: function() {
                    var pr = $saLeftPiPrDrop.data('contrailDropdown').getSelectedData();
                    if (!pr) {
                        return;
                    }
                    pr = pr[0].data;
                    setPisDropDown(pr, $saLeftPiPiDrop);
                }
            });
            $saRightPiPrDrop.contrailDropdown({
                data: preparePrList(prs),
                dataTextField: "text",
                dataValueField: "value",
                placeholder:"Select a Physical Interface as the right interface",
                change: function() {
                    var pr = $saRightPiPrDrop.data('contrailDropdown').getSelectedData();
                    if (!pr) {
                        return;
                    }
                    pr = pr[0].data;
                    setPisDropDown(pr, $saRightPiPiDrop);
                }
            });
            if (sa) {
                $saName.val(getDataObjName(sa));
                if (sa.physical_interface_refs) {
                    var piMap = {};
                    for (var i = 0; i < sa.physical_interface_refs.length; i++) {
                        if (sa.physical_interface_refs[i].attr.interface_type == "left") {
                            piMap.left = sa.physical_interface_refs[i].uuid;
                        }
                        if (sa.physical_interface_refs[i].attr.interface_type == "right") {
                            piMap.right = sa.physical_interface_refs[i].uuid;
                        }
                    }
                    PI_data.read(function(pis) {
                        var leftPi = null;
                        var rightPi = null;
                        var i = 0;
                        for (i = 0; i < pis.length; i++) {
                            if (pis[i].uuid == piMap.left) {
                                leftPi = pis[i];
                            } else if (pis[i].uuid == piMap.right) {
                                rightPi = pis[i];
                            }
                        }
                        if (leftPi.parent_uuid != rightPi.parent_uuid) {
                            return;
                        }
                        var sapr = null;
                        for (i = 0; i < prs.length; i++) {
                            if (prs[i].uuid == leftPi.parent_uuid) {
                                sapr = prs[i];
                            }
                        }
                        $saPrDrop.data('contrailDropdown').value(sapr.uuid, true);
                        $saLeftPiDrop.data('contrailDropdown').value(leftPi.uuid);
                        $saRightPiDrop.data('contrailDropdown').value(rightPi.uuid);

                        var leftConnectedPi = null;
                        var rightConnectedPi = null;
                        for (i = 0; i < pis.length; i++) {
                            if (leftPi.physical_interface_refs && pis[i].uuid == leftPi.physical_interface_refs[0].uuid) {
                                leftConnectedPi = pis[i];
                            } else if (rightPi.physical_interface_refs && pis[i].uuid == rightPi.physical_interface_refs[0].uuid) {
                                rightConnectedPi = pis[i];
                            }
                        }
                        for (i = 0; i < prs.length; i++) {
                            if (leftConnectedPi && prs[i].uuid == leftConnectedPi.parent_uuid) {
                                $saLeftPiPrDrop.data('contrailDropdown').value(leftConnectedPi.parent_uuid, true);
                                $saLeftPiPiDrop.data('contrailDropdown').value(leftConnectedPi.uuid);
                            }
                            if (rightConnectedPi && prs[i].uuid == rightConnectedPi.parent_uuid) {
                                $saRightPiPrDrop.data('contrailDropdown').value(rightConnectedPi.parent_uuid, true);
                                $saRightPiPiDrop.data('contrailDropdown').value(rightConnectedPi.uuid);
                            }
                        }
                    }, true);
                }
            }
        });
        $saEditWindow.modal('show');
    }

    function clearServiceApplianceEditWindow() {
        $saName.val('');
        $saPrDrop.data('contrailDropdown').value('none');
        $saLeftPiDrop.data('contrailDropdown').value('none');
        $saLeftPiPrDrop.data('contrailDropdown').value('none');
        $saLeftPiPiDrop.data('contrailDropdown').value('none');
        $saRightPiDrop.data('contrailDropdown').value('none');
        $saRightPiPrDrop.data('contrailDropdown').value('none');
        $saRightPiPiDrop.data('contrailDropdown').value('none');
    }

    function confrimServiceApplianceEditWindow(e) {
        var data = collectServiceApplianceEditWindow();
        var old_sa = e.data;
        if (old_sa) {
            data.sa.uuid = old_sa.uuid;
            SA_data.update(data.sa, function() {
                clearServiceApplianceEditWindow();
                setServiceApplianceGrid();
                $saEditWindow.modal('hide');
            });
        } else {
            SA_data.create(data.sa, function() {
                clearServiceApplianceEditWindow();
                setSASETSelector(setServiceApplianceGrid);
                $saEditWindow.modal('hide');
            });
        }
        //update the PI connections
        for (var i = 0; i < data.pis.length; i++) {
            PI_data.update(data.pis[i]);
        }
    }

    //Actions of the delete window
    function showServiceApplianceDelWindow(rowIndex) {
        if (!$(this).hasClass('disabled-link')) {
            var rows = [];
            if (rowIndex || rowIndex == 0) {
                var row = $saGrid.data('contrailGrid')._dataView.getItem(rowIndex);
                rows.push(row);
            } else {
                rows = $saGrid.data('contrailGrid').getCheckedRows();
            }
            $('#sa-del-window-ok').click(function() {
                confrimServiceApplianceDelWindow(rows)
            });
            $saDelWindow.modal('show');
        }
    }

    function confrimServiceApplianceDelWindow(rows) {
        SA_data.del(rows,setServiceApplianceGrid);
        $saDelWindow.modal('hide');
    }

    //////////////Data layer/////////////////
    function prepareData(input, type) {
        var data = []
        if (input != null && input.data != null && input.data.length > 0) {
            for (var i = 0; i < input.data.length; i++) {
                data.push(input.data[i][type]);
            }
        }
        return data;
    }
    var SA_data = {
        sas: [],
        create: function(sa, callback) {
            doAjaxCall(
                "/api/tenants/config/service-appliances",
                "POST",
                JSON.stringify({"service-appliance":sa}),
                "saReadSuccess",
                "saReadFail",
                null, {
                    callback: callback
                },
                ajaxTimeout);
        },
        __createSuccess: function(result, cbParams) {
            cbParams.callback(result);
        },
        __createFail: function(error) {
            Error.gridError("Cannot create the service appliance");
        },
        read: function(callback) {
            doAjaxCall(
                "/api/admin/config/get-data?type=service-appliance",
                "GET",
                null,
                "saReadSuccess",
                "saReadFail",
                null, {
                    callback: callback
                },
                ajaxTimeout);
        },
        __readSuccess: function(result, cbParams) {
            SA_data.sas = prepareData(result, 'service-appliance');
            cbParams.callback(SA_data.sas);
        },
        __readFail: function(error) {
            Error.gridError("Cannot read the service appliance");
        },
        update: function(sa, callback) {
            doAjaxCall(
                "/api/tenants/config/service-appliance/" + sa.uuid,
                "PUT",
                JSON.stringify({"service-appliance":sa}),
                "saUpdateSuccess",
                "saUpdateFail",
                null, {
                    callback: callback
                },
                ajaxTimeout);
        },
        __updateSuccess: function(result, cbParams) {
            cbParams.callback(result);
        },
        __updateFail: function(error) {
            Error.gridError("Cannot create the service appliance");
        },
        del: function(rows,callback) {
            window.saDelSuccess = callback
            var cbParams = {
                selected_rows: rows,
                url: "/api/tenants/config/service-appliance/",
                urlField: "uuid",
                fetchDataFunction: "saDelSuccess",
                errorTitle: "Error",
                errorShortMessage: "Error in deleting Service Appliance - ",
                errorField: "name"
            };
            deleteObject(cbParams);
        },
        validate: function(sa) {

        },
    }

    var PI_data = {
        pis: [],
        pisRouterMap: {},
        read: function(callback, cache) {
            if (PI_data.pis.length && cache) {
                callback(PI_data.pis);
                return;
            }
            doAjaxCall(
                "/api/admin/config/get-data?type=physical-interface",
                "GET",
                null,
                "piReadSuccess",
                "piReadFail",
                null, {
                    callback: callback
                },
                ajaxTimeout);
        },
        __readSuccess: function(result, cbParams) {
            PI_data.pis = prepareData(result, 'physical-interface');
            cbParams.callback(PI_data.pis);
        },
        __readFail: function(error) {
            Error.gridError("Cannot read the physical interface");
        },
        update: function(pi, callback) {
            doAjaxCall(
                '/api/tenants/config/service-appliance/physical-interface/'+pi.uuid,
                'PUT',
                JSON.stringify({"physical-interface":pi}),
                "piUpdateSuccess",
                "piUpdateFail",
                null, {
                    callback: callback
                }, ajaxTimeout);
        },
        __upadateSuccess: function(result, cbParams) {
            PI_data.pis = prepareData(result, 'physical-interface');
            cbParams.callback(PI_data.pis);
        },
    }

    var PR_data = {
        read: function(callback) {
            doAjaxCall(
                "/api/admin/config/get-data?type=physical-router",
                "GET",
                null,
                "prReadSuccess",
                "prReadFail",
                null, {
                    callback: callback
                },
                ajaxTimeout);
        },
        __readSuccess: function(result, cbParams) {
            PR_data.prs = prepareData(result, 'physical-router');
            cbParams.callback(PR_data.prs);
        },
        __readFail: function(error) {
            Error.gridError("Cannot read the physical router");
        },
        update: function() {

        }
    };

    var SASET_data = {
        read: function(callback) {
            doAjaxCall(
                "/api/admin/config/get-data?type=service-appliance-set",
                "GET",
                null,
                "sasetReadSuccess",
                "sasetReadFail",
                null, {
                    callback: callback
                },
                ajaxTimeout);
        },
        __readSuccess: function(result, cbParams) {
            SASET_data.prs = prepareData(result, 'service-appliance-set');
            cbParams.callback(SASET_data.prs);
        },
        __readFail: function(error) {
            Error.gridError("Cannot read the service appliance set");
        }
    };

    //register callbacks
    window.setSaGrid = setServiceApplianceGrid;
    window.saReadSuccess = SA_data.__readSuccess;
    window.saReadFail = SA_data.__readFail;
    window.saCreateSuccess = SA_data.__createSuccess;
    window.saCreateFail = SA_data.__createFail;
    window.saUpdateSuccess = SA_data.__updateSuccess;
    window.saUpdateFail = SA_data.__updateFail;

    window.piReadSuccess = PI_data.__readSuccess;
    window.piReadFail = PI_data.__readFail;

    window.prReadSuccess = PR_data.__readSuccess;
    window.prReadFail = PR_data.__readFail;

    window.sasetReadSuccess = SASET_data.__readSuccess;
    window.sasetReadFail = SASET_data.__readFail;

    /////////////////error hanlde//////////////
    var Error = {
        gridError: function(str) {
            $saGrid.data('contrailGrid').showGridMessage(str);
        }
    };

}