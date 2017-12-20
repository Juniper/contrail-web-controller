/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'monitor/security/test/ui/views/TrafficGroupsView.mock.data',
    'monitor/security/trafficgroups/ui/js/views/TrafficGroupsHelpers'
], function (TGMockData, TGHelpers) {
	var tgHelpers = new TGHelpers(),
		tgSettings = TGMockData.tgSettingsMockData;
	tgHelpers.sliceByProjectOnly = true;
	test("parse-hierarchy-config-same-project", function() {
	    var dataObj = TGMockData.parseHierarchyConfigData['same-project-case'],
	        result = tgHelpers.parseHierarchyConfig(dataObj.data, tgSettings, 'hrdev');
	    console.log('Executng parse-hierarchy-config-same-project...');
	    equal(JSON.stringify(result), JSON.stringify(dataObj.expected));
	});
	test("parse-hierarchy-config-external-project", function() {
	    var dataObj = TGMockData.parseHierarchyConfigData['external-project-case'],
	        result = tgHelpers.parseHierarchyConfig(dataObj.data, tgSettings, 'hrdev');
	    console.log('Executng parse-hierarchy-config-external-project...');
	    equal(JSON.stringify(result), JSON.stringify(dataObj.expected));
	});
	test("parse-hierarchy-config-external", function() {
	    var dataObj = TGMockData.parseHierarchyConfigData['external-case'],
	        result = tgHelpers.parseHierarchyConfig(dataObj.data, tgSettings, 'hrdev');
	    console.log('Executng parse-hierarchy-config-external...');
	    equal(JSON.stringify(result), JSON.stringify(dataObj.expected));
	});
	test("link-direction-bidirectional", function() {
	    var dataObj = TGMockData.getLinkDirectionData['bidrectional-case'],
	        result = tgHelpers.getLinkDirection(dataObj.data.src, dataObj.data.dst);
	    console.log('Executng link-direction-bidirectional...');
	    equal(JSON.stringify(result), JSON.stringify(dataObj.expected));
	});
	test("link-direction-forward", function() {
	    var dataObj = TGMockData.getLinkDirectionData['forward-direction-case'],
	        result = tgHelpers.getLinkDirection(dataObj.data.src, dataObj.data.dst);
	    console.log('Executng link-direction-forward...');
	    equal(JSON.stringify(result), JSON.stringify(dataObj.expected));
	});
	test("link-direction-reverse", function() {
	    var dataObj = TGMockData.getLinkDirectionData['reverse-direction-case'],
	        result = tgHelpers.getLinkDirection(dataObj.data.src, dataObj.data.dst);
	    console.log('Executng link-direction-reverse...');
	    equal(JSON.stringify(result), JSON.stringify(dataObj.expected));
	});
	test("link-direction-external-reverse", function() {
	    var dataObj = TGMockData.getLinkDirectionData['external-reverse-direction-case'],
	        result = tgHelpers.getLinkDirection(dataObj.data.src, dataObj.data.dst);
	    console.log('Executng link-direction-external-reverse...');
	    equal(JSON.stringify(result), JSON.stringify(dataObj.expected));
	});
	var policyObj = '', ruleUUIDs = '';
	test("get-and-sort-app-aps", function() {
	    var dataObj = TGMockData.getAppAPSData,
	        result = tgHelpers.getAndSortAppAPS(dataObj.data, 'hrdev', 'default-domain', 'application=HR');
	    console.log('Executng get-and-sort-app-aps...');
	    policyObj = result;
	    equal(JSON.stringify(result), JSON.stringify(dataObj.expected));
	});
	test("get-and-sort-app-rule-uuids", function() {
	    var dataObj = TGMockData.getPolicyRuleList,
	        result = tgHelpers.getAndSortAppRullUUIDs(dataObj.data, policyObj);
	    console.log('Executng get-and-sort-app-rule-uuids...');
	    ruleUUIDs = result;
	    equal(JSON.stringify(result), JSON.stringify(dataObj.expected));
	});
});
