/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/**
 * during build time, all view/model file of qe will be
 * concatenated to this file. build config is located in the core repo webroot/build/
 */
define([
    "text!controller-basedir/reports/qe/ui/templates/controller.qe.tmpl",
    "controller-basedir/reports/qe/ui/js/ControllerQEPageLoader"
], function (ControllerQETemplates, ControllerQEPageLoader) {
    $("body").append(ControllerQETemplates);
    window.controllerQEPageLoader = new ControllerQEPageLoader();
});
