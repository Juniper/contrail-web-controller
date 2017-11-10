/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'monitor/security/test/ui/views/TrafficGroupsView.mock.data',
    'monitor/security/trafficgroups/ui/js/views/TrafficGroupsHelpers'
], function (TGMockData, TGHelpers) {
	tgHelpers = new TGHelpers();
	var d = {
		'MAX(eps.client.active)' : 1,
		'MIN(eps.client.active)' : 1,
		'SUM(eps.client.added)' : 0,
		'SUM(eps.client.deleted)' : 0,
		'SUM(eps.traffic.in_bytes)' : 176302,
		'SUM(eps.traffic.in_pkts)' : 1799,
		'SUM(eps.traffic.out_bytes)' : 176302,
		'SUM(eps.traffic.out_pkts)' : 1799,
		'app' : 'application=hr1',
		'app_fqn' : 'application=hr1',
		'cgrid' : 'id_2',
		'deployment' : 'deployment=prod',
		'deployment_fqn' : 'deployment=prod',
		'eps.__key' : '00000000-0000-0000-0000-000000000001',
		'eps.client.remote_prefix' : '',
		'eps.traffic.remote_app_id' : 'application=hr1',
		'eps.traffic.remote_app_id_fqn' : 'application=hr1',
		'eps.traffic.remote_deployment_id' : 'deployment=prod',
		'eps.traffic.remote_deployment_id_fqn' : 'deployment=prod',
		'eps.traffic.remote_prefix' : '',
		'eps.traffic.remote_prefix_fqn' : '',
		'eps.traffic.remote_site_id' : '',
		'eps.traffic.remote_site_id_fqn' : '',
		'eps.traffic.remote_tier_id' : 'tier=db',
		'eps.traffic.remote_tier_id_fqn' : 'tier=db',
		'eps.traffic.remote_vn' : 'default-domain:sapdev:dbvn',
		'isClient' : true,
		'linkCssClass' : 'implicitAllow',
		'name' : 'e3d5fbab-8061-40b8-bc88-e35028c995cc',
		'name_fqn' : 'default-domain:sapdev:e3d5fbab-8061-40b8-bc88-e35028c995cc',
		'site' : '',
		'site_fqn' : '',
		'tier' : 'tier=app',
		'tier_fqn' : 'tier=app',
		'vn' : 'default-domain:sapdev:appvn'
	};
	var expected = '[{"names":["application=hr1-deployment=prod","tier=app"],"displayLabels":[["application=hr1","deployment=prod"],["tier=app"]],"id":"application=hr1-deployment=prod-tier=app","value":352604,"inBytes":176302,"outBytes":176302},{"names":["application=hr1-deployment=prod","tier=db"],"displayLabels":[["application=hr1","deployment=prod"],["tier=db"]],"id":"application=hr1-deployment=prod-tier=db","type":"","value":352604,"inBytes":176302,"outBytes":176302}]';
	test("parse-hierarchy-config", function() {
	    var hierarchyConfig = tgHelpers.parseHierarchyConfig(d, '', 'sapdev');
	    equal(JSON.stringify(hierarchyConfig), expected, "parse-hierarchy-config");
	});
});
