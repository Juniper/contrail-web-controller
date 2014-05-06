/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module("Configure Virtual Network", {
	//Initiate view files.
    setup: function() {
    },
    //Called when any test case is completed 
    teardown: function() {
    }
});

test("validateRTEntry", function() {
	vnMock.loadRouteTargetDom(1, [12], [13]);
	equal(virtualnetworkConfigObj.validateRTEntry(), true, 'Valid values for ASN & Route Target');
	u.clearDom();
	vnMock.loadRouteTargetDom(1, [], [13]);
	equal(virtualnetworkConfigObj.validateRTEntry(), false, 'Invalid value for ASN, valid value for Route Target');
	u.clearDom();
	vnMock.loadRouteTargetDom(1, [12], []);
	equal(virtualnetworkConfigObj.validateRTEntry(), false, 'Valid value for ASN, Invalid value for Route Target');
	u.clearDom();
	vnMock.loadRouteTargetDom(1, [], []);
	equal(virtualnetworkConfigObj.validateRTEntry(), false, 'Invalid value for ASN, Invalid value for Route Target');
	u.clearDom();
});

test("validateFipEntry", function() {
	vnMock.loadFloatingIpDom(1, ["abc"], [["admin"]]);
	equal(virtualnetworkConfigObj.validateFipEntry(), true, 'Valid values for Pool Name & Projects');
	u.clearDom();
	vnMock.loadFloatingIpDom(1, [""], [["admin"]]);
	equal(virtualnetworkConfigObj.validateFipEntry(), false, 'Invalid value for Pool Name, valid value for Project');
	u.clearDom();
	vnMock.loadFloatingIpDom(1, ["abc"], []);
	equal(virtualnetworkConfigObj.validateFipEntry(), true, 'Valid value for ASN, Invalid value for Route Target');
	u.clearDom();
});