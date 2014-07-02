/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*jshint node:true */
module.exports = function( grunt ) {

    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-qunit" );
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-karma');

    var commonFiles = [
        "contrail-web-core/webroot/js/contrail-all-1.js",
        "contrail-web-core/webroot/js/contrail-all-2.js",
        "contrail-web-core/webroot/js/contrail-all-3.js",
        "contrail-web-core/webroot/js/contrail-all-4.js",
        "contrail-web-core/webroot/js/contrail-all-5.js",
        "contrail-web-core/webroot/js/test/utils_mock.js",
        "contrail-web-controller/webroot/monitor/infra/common/ui/js/monitor_infra_constants.js",
        "contrail-web-controller/webroot/monitor/infra/common/ui/js/monitor_infra_utils.js"
        ];

    grunt.initConfig({
        pkg: grunt.file.readJSON( "../../../contrail-web-core/package.json" ),
        karma: {
                options:{
                    configFile:'karma.conf.js',
                },
                monitor_infra: {
                    options: {
                        files:commonFiles.concat([
                            /* DASHBOARD */
                            "contrail-web-controller/webroot/monitor/infra/dashboard/ui/js/monitor_infra_dashboard.js",
                            "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_dashboard_mock.js",
                            "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_dashboard_test.js",
                            
                            /* MONITOR INFRA VROUTER */
                            "contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/monitor_infra_vrouter_acl.js",
                            "contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/monitor_infra_vrouter_details.js",
                            "contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/monitor_infra_vrouter_flows.js",
                            "contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/monitor_infra_vrouter_interfaces.js",
                            "contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/monitor_infra_vrouter_networks.js",
                            "contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/monitor_infra_vrouter_routes.js",
                            "contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/monitor_infra_vrouter_summary.js",
                            "contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/monitor_infra_vrouter.js",
                            "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_vrouter_mock.js",
                            "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_vrouter_test.js",
                            
                            /* MONITOR INFRA CONTROL NODE */
                            "contrail-web-controller/webroot/monitor/infra/controlnode/ui/js/monitor_infra_controlnode_details.js",
                            "contrail-web-controller/webroot/monitor/infra/controlnode/ui/js/monitor_infra_controlnode_peers.js",
                            "contrail-web-controller/webroot/monitor/infra/controlnode/ui/js/monitor_infra_controlnode_routes.js",
                            "contrail-web-controller/webroot/monitor/infra/controlnode/ui/js/monitor_infra_controlnode_summary.js",
                            "contrail-web-controller/webroot/monitor/infra/controlnode/ui/js/monitor_infra_controlnode.js",
                            "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_controlnode_mock.js",
                            "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_controlnode_test.js",
                            
                            /* MONITOR INFRA ANALYTICS NODE */
                            "contrail-web-controller/webroot/monitor/infra/analyticsnode/ui/js/monitor_infra_analyticsnode_details.js",
                            "contrail-web-controller/webroot/monitor/infra/analyticsnode/ui/js/monitor_infra_analyticsnode_generators.js",
                            "contrail-web-controller/webroot/monitor/infra/analyticsnode/ui/js/monitor_infra_analyticsnode_qequeries.js",
                            "contrail-web-controller/webroot/monitor/infra/analyticsnode/ui/js/monitor_infra_analyticsnode_summary.js",
                            "contrail-web-controller/webroot/monitor/infra/analyticsnode/ui/js/monitor_infra_analyticnode.js",
                            "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_analyticsnode_mock.js",
                            "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_analyticsnode_test.js"

                            ]),
                        preprocessors: {
                            'contrail-web-controller/webroot/monitor/infra/dashboard/ui/js/*.js': ['coverage'],
                            'contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/*.js': ['coverage'],
                            'contrail-web-controller/webroot/monitor/infra/controlnode/ui/js/*.js': ['coverage'],
                            'contrail-web-controller/webroot/monitor/infra/analyticsnode/ui/js/*.js': ['coverage'],
                        }
                    }
                },
                monitor_network :{
                    options: {
                        files: commonFiles.concat([
                            "contrail-web-controller/webroot/monitor/tenant-network/network/ui/js/tenant_monitor_network.js",
                            "contrail-web-controller/webroot/monitor/tenant-network/dashboard/ui/js/tenant_monitor_dashboard.js",
                            "contrail-web-controller/webroot/monitor/tenant-network/instance/ui/js/tenant_monitor_instance.js",
                            "contrail-web-controller/webroot/monitor/tenant-network/project/ui/js/tenant_monitor_project.js",
                            "contrail-web-controller/webroot/monitor/tenant-network/common/ui/js/tenant_monitor_topology.js",
                            "contrail-web-controller/webroot/monitor/tenant-network/test/tenant_monitor_network_mock.js",
                            "contrail-web-controller/webroot/monitor/tenant-network/test/tenant_monitor_network_test.js",
                        ]),
                        preprocessors: {
                            'contrail-web-controller/webroot/monitor/tenant-network/network/ui/js/*.js': ['coverage'],
                            'contrail-web-controller/webroot/monitor/tenant-network/dashboard/ui/js/*.js': ['coverage'],
                            'contrail-web-controller/webroot/monitor/tenant-network/instance/ui/js/*.js': ['coverage'],
                            'contrail-web-controller/webroot/monitor/tenant-network/project/ui/js/*.js': ['coverage'],
                            'contrail-web-controller/webroot/monitor/tenant-network/common/ui/js/*.js': ['coverage'],
                        }
                    }
                },
                config_svc_instances :{
                    options: {
                        files: commonFiles.concat([
                            "contrail-web-controller/webroot/config/services/instances/ui/js/svcinstances_config.js",
                            "contrail-web-controller/webroot/config/services/instances/ui/views/svcinstances_config.view",
                            "contrail-web-controller/webroot/config/services/instances/ui/views/svcinstances_config_ut.view",
                            "contrail-web-controller/webroot/config/services/instances/test/config_service_instance_test.js",
                            "contrail-web-controller/webroot/config/services/instances/test/config_service_instance_mock.js",
                        ]),
                        preprocessors: {
                            'contrail-web-controller/webroot/config/services/instances/ui/js/*.js': ['coverage'],
                            'contrail-web-controller/webroot/config/services/instances/ui/views/*.view' : ['html2js'],
                        }
                    }
                },
                config_svc_templates: {
                    options: {
                        files: commonFiles.concat([
                            "contrail-web-controller/webroot/config/services/template/ui/js/svctemplate_config.js",
                            "contrail-web-controller/webroot/config/services/template/ui/views/svctemplate_config.view",
                            "contrail-web-controller/webroot/config/services/template/test/config_service_template_test.js",
                            "contrail-web-controller/webroot/config/services/template/test/config_service_template_mock.js",
                        ]),
                        preprocessors: {
                            'contrail-web-controller/webroot/config/services/template/ui/js/*.js': ['coverage'],
                            'contrail-web-controller/webroot/config/services/template/ui/views/*.view' : ['html2js'],
                        }
                    }
                }
        },
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            files: [ "Gruntfile.js"]
        },
    });
};
