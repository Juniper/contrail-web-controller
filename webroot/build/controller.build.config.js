/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
({
appDir: "./../",
dir: "./../built/",
baseUrl: "./",
paths: {
    "core-srcdir": "./../../contrail-web-core/webroot/.",
    "core-basedir": "./../../contrail-web-core/webroot/.",
    "jquery": "./../../contrail-web-core/webroot/./assets/jquery/js/jquery-1.8.3.min",
    "knockout": "./../../contrail-web-core/webroot/./assets/knockout/knockout-3.0.0",
    "joint": "./../../contrail-web-core/webroot/./assets/joint/js/joint.clean",
    "geometry": "./../../contrail-web-core/webroot/./assets/joint/js/geometry",
    "vectorizer": "./../../contrail-web-core/webroot/./assets/joint/js/vectorizer",
    "joint.layout.DirectedGraph": "./../../contrail-web-core/webroot/./assets/joint/js/joint.layout.DirectedGraph",
    "dagre": "./../../contrail-web-core/webroot/./assets/joint/js/dagre",
    "vis": "./../../contrail-web-core/webroot/./assets/vis-v4.9.0/js/vis.min",
    "bezier": "./../../contrail-web-core/webroot/./assets/bezierjs/bezier",
    "lodash": "./../../contrail-web-core/webroot/./assets/lodash/lodash.min",
    "backbone": "./../../contrail-web-core/webroot/./assets/backbone/backbone-min",
    "knockback": "./../../contrail-web-core/webroot/./assets/backbone/knockback.min",
    "validation": "./../../contrail-web-core/webroot/./assets/backbone/backbone-validation-amd",
    "text": "./../../contrail-web-core/webroot/./assets/requirejs/text",
    "underscore": "./../../contrail-web-core/webroot/./assets/underscore/underscore-min",
    "contrail-layout": "./../../contrail-web-core/webroot/./js/contrail-layout",
    "joint.contrail": "./../../contrail-web-core/webroot/./js/joint.contrail",
    "core-utils": "./../../contrail-web-core/webroot/./js/common/core.utils",
    "core-constants": "./../../contrail-web-core/webroot/./js/common/core.constants",
    "core-formatters": "./../../contrail-web-core/webroot/./js/common/core.formatters",
    "core-labels": "./../../contrail-web-core/webroot/./js/common/core.labels",
    "core-messages": "./../../contrail-web-core/webroot/./js/common/core.messages",
    "core-cache": "./../../contrail-web-core/webroot/./js/common/core.cache",
    "core-views-default-config": "./../../contrail-web-core/webroot/./js/common/core.views.default.config",
    "core-init": "./../../contrail-web-core/webroot/./js/common/core.init",
    "contrail-unified-1": "./../../contrail-web-core/webroot/./js/common/contrail.unified.1",
    "contrail-unified-2": "./../../contrail-web-core/webroot/./js/common/contrail.unified.2",
    "contrail-unified-3": "./../../contrail-web-core/webroot/./js/common/contrail.unified.3",
    "cf-datasource": "./../../contrail-web-core/webroot/./js/common/cf.datasource",
    "contrail-remote-data-handler": "./../../contrail-web-core/webroot/./js/handlers/ContrailRemoteDataHandler",
    "layout-handler": "./../../contrail-web-core/webroot/./js/handlers/LayoutHandler",
    "menu-handler": "./../../contrail-web-core/webroot/./js/handlers/MenuHandler",
    "content-handler": "./../../contrail-web-core/webroot/./js/handlers/ContentHandler",
    "graph-view": "./../../contrail-web-core/webroot/./js/views/GraphView",
    "contrail-view": "./../../contrail-web-core/webroot/./js/views/ContrailView",
    "query-form-view": "./../../contrail-web-core/webroot/./js/views/QueryFormView",
    "query-form-model": "./../../contrail-web-core/webroot/./js/models/QueryFormModel",
    "query-or-model": "./../../contrail-web-core/webroot/./js/models/QueryOrModel",
    "query-and-model": "./../../contrail-web-core/webroot/./js/models/QueryAndModel",
    "contrail-graph-model": "./../../contrail-web-core/webroot/./js/models/ContrailGraphModel",
    "contrail-vis-model": "./../../contrail-web-core/webroot/./js/models/ContrailVisModel",
    "contrail-view-model": "./../../contrail-web-core/webroot/./js/models/ContrailViewModel",
    "contrail-model": "./../../contrail-web-core/webroot/./js/models/ContrailModel",
    "contrail-list-model": "./../../contrail-web-core/webroot/./js/models/ContrailListModel",
    "mon-infra-node-list-model": "./../../contrail-web-core/webroot/./js/models/NodeListModel",
    "mon-infra-log-list-model": "./../../contrail-web-core/webroot/./js/models/LogListModel",
    "infoboxes": "./../../contrail-web-core/webroot/./js/views/InfoboxesView",
    "barchart-cf": "./../../contrail-web-core/webroot/./js/views/BarChartView",
    "mon-infra-alert-list-view": "./../../contrail-web-core/webroot/./js/views/AlertListView",
    "mon-infra-alert-grid-view": "./../../contrail-web-core/webroot/./js/views/AlertGridView",
    "mon-infra-log-list-view": "./../../contrail-web-core/webroot/./js/views/LogListView",
    "mon-infra-sysinfo-view": "./../../contrail-web-core/webroot/./js/views/SystemInfoView",
    "mon-infra-dashboard-view": "./../../contrail-web-core/webroot/./js/views/MonitorInfraDashboardView",
    "loginwindow-model": "./../../contrail-web-core/webroot/./js/models/LoginWindowModel",
    "controller-srcdir": ".",
    "controller-basedir": ".",
    "controller-constants": "./common/ui/js/controller.constants",
    "controller-grid-config": "./common/ui/js/controller.grid.config",
    "controller-graph-config": "./common/ui/js/controller.graph.config",
    "controller-labels": "./common/ui/js/controller.labels",
    "controller-utils": "./common/ui/js/controller.utils",
    "controller-messages": "./common/ui/js/controller.messages",
    "controller-parsers": "./common/ui/js/controller.parsers",
    "controller-view-config": "./common/ui/js/controller.view.config",
    "controller-init": "./common/ui/js/controller.init",
    "searchflow-model": "./monitor/infrastructure/underlay/ui/js/models/SearchFlowFormModel",
    "traceflow-model": "./monitor/infrastructure/underlay/ui/js/models/TraceFlowTabModel",
    "underlay-graph-model": "./monitor/infrastructure/underlay/ui/js/models/UnderlayGraphModel",
    "monitor-infra-confignode-model": "./monitor/infrastructure/common/ui/js/models/ConfigNodeListModel",
    "monitor-infra-analyticsnode-model": "./monitor/infrastructure/common/ui/js/models/AnalyticsNodeListModel",
    "monitor-infra-databasenode-model": "./monitor/infrastructure/common/ui/js/models/DatabaseNodeListModel",
    "monitor-infra-controlnode-model": "./monitor/infrastructure/common/ui/js/models/ControlNodeListModel",
    "monitor-infra-vrouter-model": "./monitor/infrastructure/common/ui/js/models/VRouterListModel",
    "monitor-infra-utils": "./monitor/infrastructure/common/ui/js/utils/monitor.infra.utils",
    "confignode-scatterchart-view": "./monitor/infrastructure/common/ui/js/views/ConfigNodeScatterChartView",
    "controlnode-scatterchart-view": "./monitor/infrastructure/common/ui/js/views/ControlNodeScatterChartView",
    "dbnode-scatterchart-view": "./monitor/infrastructure/common/ui/js/views/DatabaseNodeScatterChartView",
    "analyticsnode-scatterchart-view": "./monitor/infrastructure/common/ui/js/views/AnalyticsNodeScatterChartView",
    "vrouter-dashboard-view": "./monitor/infrastructure/dashboard/ui/js/views/VRouterDashboardView",
    "monitor-infra-parsers": "./monitor/infrastructure/common/ui/js/utils/monitor.infra.parsers",
    "monitor-infra-constants": "./monitor/infrastructure/common/ui/js/utils/monitor.infra.constants",
    "mon-infra-controller-dashboard": "./monitor/infrastructure/dashboard/ui/js/views/ControllerDashboardView"
},
map: {
    "*": {
        "underscore": "underscore"
    }
},
shim: {
    "backbone": {
        "deps": [
            "lodash"
        ],
        "exports": "Backbone"
    },
    "joint": {
        "deps": [
            "geometry",
            "vectorizer",
            "backbone"
        ],
        "exports": "joint"
    },
    "vis": {
        "deps": [
            "jquery"
        ],
        "exports": "vis"
    },
    "knockout": {
        "deps": [
            "jquery"
        ]
    },
    "validation": {
        "deps": [
            "backbone"
        ]
    },
    "bezier": {
        "deps": [
            "jquery"
        ]
    },
    "joint.layout.DirectedGraph": {
        "deps": [
            "joint"
        ]
    },
    "joint.contrail": {
        "deps": [
            "joint.layout.DirectedGraph"
        ]
    },
    "contrail-model": {
        "deps": [
            "knockback"
        ]
    },
    "contrail-list-model": {
        "deps": [
            "contrail-remote-data-handler"
        ]
    }
},
waitSeconds: 0,
optimizeCss: "default",
skipModuleInsertion: true,
keepAmdefine: true,
modules: [
    {
        "name": "controller-init",
        "include": [
            "searchflow-model",
            "traceflow-model",
            "underlay-graph-model",
            "monitor-infra-confignode-model",
            "monitor-infra-analyticsnode-model",
            "monitor-infra-databasenode-model",
            "monitor-infra-controlnode-model",
            "monitor-infra-vrouter-model",
            "monitor-infra-utils",
            "confignode-scatterchart-view",
            "controlnode-scatterchart-view",
            "dbnode-scatterchart-view",
            "analyticsnode-scatterchart-view",
            "vrouter-dashboard-view",
            "monitor-infra-parsers",
            "monitor-infra-constants",
            "controller-basedir/monitor/infrastructure/common/ui/js/views/VRouterScatterChartView"
        ],
        "exclude": [
            "contrail-view",
            "contrail-model",
            "contrail-view-model",
            "contrail-list-model",
            "contrail-graph-model",
            "query-form-model",
            "query-or-model",
            "query-and-model",
            "core-init",
            "core-basedir/js/views/LoginWindowView"
        ]
    }
],
optimize: "uglify2",
uglify2: {
    "output": {
        "beautify": false
    },
    "compress": {
        "sequences": false,
        "global_defs": {
            "DEBUG": false
        }
    },
    "warnings": false,
    "mangle": false
},
keepBuildDir: false,
throwWhen: {
    "optimize": true
},
fileExclusionRegExp: /(.*node_modules|.*api|.*jobs|.*test|.*examples|.*build|.*vis-v4.9.0)/
})
