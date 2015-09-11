define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model'
], function (_, Backbone, Knockout, ContrailModel) {
    var TraceFlowTabModel = ContrailModel.extend({
        defaultConfig: {
            'traceflow_radiobtn_name' : 'vRouter',
            'vrouter_dropdown_name' : "",
            'instance_dropdown_name' : "",
        }
    });
    return TraceFlowTabModel;
});