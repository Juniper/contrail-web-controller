/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/services/instances/ui/js/models/StaticRTModel'
], function (_, ContrailModel, StaticRTModel) {
    var InterfacesModel = ContrailModel.extend({

        defaultConfig: {
            interfaceType: "",
            virtualNetwork: "",
            interfaceIndex: -1,
            interfaceData: null
        },

        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },
        formatModelConfig: function(modelConfig) {
            var staticRTModel;
            var staticRTModels = [];
            var staticRTCollectionModel;
            var idx = modelConfig['interfaceIndex'];
            var intfData =
                getValueByJsonPath(modelConfig,
                                   'interfaceData;static_routes;route',
                                   []);
            var cnt = intfData.length;;
            for (var i = 0; i < cnt; i++) {
                var prefix = ((null != intfData[i]) &&
                              (null != intfData[i]['prefix'])) ?
                    intfData[i]['prefix'] : '';
                var nextHop = 'Interface ' + (idx + 1).toString();
                staticRTModel =
                    new StaticRTModel({prefix: prefix,
                                      next_hop: nextHop});
                staticRTModels.push(staticRTModel);
            }
            staticRTCollectionModel = new Backbone.Collection(staticRTModels);
            modelConfig['staticRoutes'] = staticRTCollectionModel;
            return modelConfig;
        },
        addStaticRt: function() {
            var idx = this.model().attributes.interfaceIndex();
            var nextHop = 'Interface ' + (idx + 1).toString();
            var newStaticRT =
                new StaticRTModel({'prefix': "", 'next_hop': nextHop});
            var staticRTs = this.model().attributes.model().get('staticRoutes');
            staticRTs.add([newStaticRT]);
        },
        validations: {
            interfacesValidation: {
                'virtualNetwork': {
                    required: true
                }
            }
        }
    });

    return InterfacesModel;
});

