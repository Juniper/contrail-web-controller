/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-view"
], function (_, ContrailView) {
    var IntrospectJSGridView = ContrailView.extend({
        el: $(window.contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                introspectNode = viewConfig.node,
                introspectPort = viewConfig.port,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                jsonData = viewConfig.jsonData,
                jsGridViewConfig = getIntrospectJSGridViewConfig(jsonData, introspectNode, introspectPort);

            self.renderView4Config(self.$el, null, jsGridViewConfig, null, null, modelMap, null);
        }
    });

    function getIntrospectJSGridViewConfig(jsonData, introspectNode, introspectPort) {
        jsonData = (null != jsonData) ? jsonData : {};
        var sandeshData = parseData(jsonData),
            gridViewConfigs = [];

        _.each(sandeshData, function(value, key){
            gridViewConfigs.push({
                columns: [
                    {
                        elementId: "introspect-result-js-grid-" + introspectNode + "-" + introspectPort + "-" + key,
                        view: "GridView",
                        viewConfig: {
                            elementConfig: getIntrospectJSGridConfig(value)
                        }
                    }
                ]
            });
        });

        return {
            elementId: "introspect-js-grids",
            view: "SectionView",
            viewConfig: {
                rows: gridViewConfigs
            }
        };
    }

    function getIntrospectJSGridConfig(value) {
        var dataObj, gridData =  [], gridColumnsObj = {columns: []};

        if (isSandeshDataHavingObject(value)) {
            dataObj = parseDataObject(value.data);

            if (contrail.checkIfExist(dataObj)) {
                gridColumnsObj = createGridColumns(dataObj);
                gridData = createGridData(dataObj);
            }
        }

        return {
            header: {
                title: {text: value.title},
                defaultControls: {
                    collapseable: false,
                    columnPickable: true
                }
            },
            columnHeader: {columns: gridColumnsObj.columns},
            body: {
                options: {
                    forceFitColumns: gridColumnsObj.columns.length < 3 ? true : false,
                    checkboxSelectable: false,
                    fixedRowHeight: gridColumnsObj.isFixedRowHeight ? 30 : false
                },
                dataSource: {data: gridData}
            }
        };
    }

    function createGridColumns(dataObj) {
        var dataLength = dataObj.length,
            dataRecord = {}, gridColumns = [],
            isFixedRowHeight = true;

        if (!_.isArray(dataObj)) {
            dataRecord = dataObj;
        } else if (dataLength > 1) {
            dataRecord = dataObj[0];
        }

        _.each(dataRecord, function (value, key) {
            value = JSON.parse(cowu.sanitize(JSON.stringify(value)));
            if (key.charAt(0) !== "_" && ["more", "next_batch"].indexOf(key) === -1 ) {
                var gridColumn = {
                    id: key, field: key,
                    name: getLabel4Key(key),
                    width: getColoumnWidth(value, key),
                    sortable: true
                };

                if (contrail.checkIfExist(value._link)) {
                    gridColumn.formatter = function (r, c, v, cd, dc) {
                        return '<a class="introspect-link" data-link="' + value._link + '" ' +
                            'x="' + cowu.sanitize(dc[key]) + '">' + cowu.sanitize(dc[key]) + "</a>";
                    };
                    gridColumn.exportConfig = { allow: true };

                }

                if (_.contains(["list", "struct", "sandesh", "map"], value._type) ||
                    (!contrail.checkIfExist(value._type) && _.isArray(value))) {
                    gridColumn.formatter = {
                        format: "json2html", options: {jsonValuePath: key, htmlValuePath: key + "HTML", expandLevel: 0}
                    };
                    gridColumn.exportConfig = { allow: true, advFormatter: function(dc) { return JSON.stringify(dc[key]);}};
                    isFixedRowHeight = false;
                }

                gridColumns.push(gridColumn);
            }
        });

        return { columns: gridColumns, isFixedRowHeight: isFixedRowHeight };
    }

    function getColoumnWidth(value, key) {
        var type = value._type,
            keyLength = key.length,
            headerPixelFactor = 10, strPixelFactor = 15,
            columnWidth = keyLength * headerPixelFactor,
            maxWidth = 360, minWidth = 80, textValue, textValueLength;

        columnWidth = columnWidth < minWidth ? minWidth : columnWidth;

        if((type === "string" || type === "u32" || type === "u64") && contrail.checkIfExist(value.__text)) {
            textValue = value.__text;
            textValueLength = textValue.length * strPixelFactor;
            columnWidth = (textValueLength > maxWidth) ? maxWidth : ((textValueLength < columnWidth) ? columnWidth : textValueLength);

        } else if (_.contains(["list", "struct", "sandesh", "map"], type)) {
            columnWidth = 250;
        }

        return columnWidth;
    }

    function createGridData(dataObj) {
        var gridData = [];

        if (!_.isArray(dataObj)) {
            gridData.push(cleanDataObj(dataObj));
        } else {
            _.each(dataObj, function (value) {
                gridData.push(cleanDataObj(value));
            });
        }

        return gridData;
    }

    function convertMapStringToUIStruct (mapObj)
    {
        var structObj = {_type: "struct", element: {}};
        var elemArr = mapObj.element;
        if (!contrail.checkIfExist(elemArr)) {
            return null;
        }
        if (!elemArr.length) {
            return null;
        }
        var elemArrLen = elemArr.length;
        for (var i = 0; i < elemArrLen - 1; i++) {
            structObj.element[elemArr[i]] = {
                _type: "string",
                __text: elemArr[i + 1]
            };
            i++;
        }
        return structObj;
    }

    function filterMapObjStructKey (mapObj)
    {
        for (var key in mapObj) {
            if ("element" === key) {
                continue;
            }
            return key;
        }
        return null;
    }

    function convertMapStructToUIStruct (mapObj)
    {
        var structObj = {_type: "struct"};
        var structKey = filterMapObjStructKey(mapObj);
        if (!contrail.checkIfExist(structKey) ||
            !contrail.checkIfExist(mapObj[structKey]) ||
            !contrail.checkIfExist(mapObj.element)) {
            return null;
        }
        var mapArr = mapObj[structKey];
        var mapArrLen = mapArr.length;
        var elemArr = mapObj.element;
        var elemArrLen = elemArr.length;
        if (elemArrLen != mapArrLen) {
            console.log("Mapped Structure is not proper:" + mapObj);
        }
        var len = (mapArrLen < elemArrLen) ? mapArrLen : elemArrLen;
        structObj[structKey] = {};
        for (var i = 0; i < len; i++) {
            structObj[structKey][elemArr[i]] = mapArr[i];
        }
        return structObj;
    }

    function formatMapDataObj (mapObj)
    {
        if (!contrail.checkIfExist(mapObj) ||
            (!contrail.checkIfExist(mapObj._value))) {
            return null;
        }
        var valStr = mapObj._value;
        if ("struct" == valStr) {
            return convertMapStructToUIStruct(mapObj);
        } else {
            return convertMapStringToUIStruct(mapObj);
        }
    }

    function cleanDataObj(data) {
        var dataObj = $.extend(true, {}, data);
        _.each(dataObj, function (value, key) {
            if (contrail.checkIfExist(value.__text)) {
                dataObj[key] = value.__text;
            } else if (value._type === "string") {
                if (contrail.checkIfExist(value.element)) {
                    dataObj[key] = value.element;
                } else {
                    dataObj[key] = "-";
                }

            } else if (value._type === "list") {
                if (parseInt(value.list._size) === 0) {
                    dataObj[key] = "-";
                } else {
                    delete value.list._size;
                    delete value.list._type;
                    dataObj[key] = cleanDataObj(value.list);
                }

            } else if (value._type === "struct") {
                delete value._type;
                delete value._identifier;
                dataObj[key] = cleanDataObj(value);
            } else if ("map" === value._type) {
                dataObj[key] = formatMapDataObj(value.map);
                if (dataObj[key]) {
                    delete dataObj[key]._type;
                    delete dataObj[key]._identifier;
                    dataObj[key] = cleanDataObj(dataObj[key]);
                }
            } else if (_.isArray(value)) {
                dataObj[key] = cleanDataObj(value);

            } else if (_.isObject(value)) {
                dataObj[key] = cleanDataObj(value);
            }
        });

        return dataObj;
    }

    function getLabel4Key(key) {
        var newKey = replaceAll("_", " ", key),
            label = capitalizeSentence(newKey);

        return label;
    }

    function replaceAll(find, replace, strValue) {
        return strValue.replace(new RegExp(find, "g"), replace);
    }

    function capitalizeSentence(sentence) {
        var word = sentence.split(" ");
        for (var i = 0; i < word.length; i++) {
            word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
        }
        return word.join(" ");
    }

    function parseData(jsonObject, title) {
        var sandeshData = [];
        var filteredSandeshObj = filterSandeshObject(jsonObject),
            sandeshKey = filteredSandeshObj.key,
            sandeshObj = filteredSandeshObj.value;

        if (sandeshObj._type === "sandesh") {
            sandeshData = sandeshData.concat(parseSandeshData(jsonObject, title));

        } else if (sandeshObj._type === "slist") {
            sandeshObj = _.omit(sandeshObj, ["_type", "more", "next_batch"]);
            _.each(sandeshObj, function(sandeshValue, sandeshKey) {
                var sandeshListObj = {};
                if (sandeshValue instanceof Array) {
                    var len = sandeshValue.length;
                    for (var i = 0; i < len; i++) {
                        sandeshListObj[sandeshKey] = sandeshValue[i];
                        sandeshData = sandeshData.concat(parseData(sandeshListObj, sandeshKey));
                    }
                } else {
                    sandeshListObj[sandeshKey] = sandeshValue;
                    sandeshData = sandeshData.concat(parseData(sandeshListObj, sandeshKey));
                }
            });
        } else {
            sandeshData.push({
                title: (contrail.checkIfExist(title) ? title + " | " : "") + sandeshKey,
                data: jsonObject
            });
        }

        return sandeshData;
    }

    function parseSandeshData(jsonObject, title) {
        var sandeshTypes = ["list", "struct"], sandeshData = [],
            filteredSandeshObj = filterSandeshObject(jsonObject),
            sandeshKey = filteredSandeshObj.key,
            sandeshObj = _.omit(filteredSandeshObj.value, ["_type"]),
            sandeshObjKeys = _.keys(sandeshObj),
            sandeshTypesLength = getLengthOfTypesInSandeshObj(sandeshObj, sandeshTypes);

        if (sandeshTypesLength < sandeshObjKeys.length) {
            sandeshData.push({
                title: (contrail.checkIfExist(title) ? title + " | " : "") + sandeshKey,
                data: filterTypesOfSandeshObj(sandeshObj, sandeshTypes)
            });
        }

        if (sandeshTypesLength > 0) {
            _.each(sandeshObj, function (value, key) {
                var newTitle = (contrail.checkIfExist(title) ? title + " | " : "") + sandeshKey + " | " + key;

                if (isSandeshAllListORStruct(value)) {
                    sandeshData = sandeshData.concat(parseSandeshData(value, newTitle));
                } else if(_.contains(sandeshTypes, value._type)) {
                    sandeshData.push({
                        title: newTitle,
                        data: value
                    });
                }
            });
        }

        return sandeshData;
    }

    function isSandeshAllListORStruct(jsonObject) {
        var sandeshTypes = ["list", "struct"],
            filteredSandeshObj = filterSandeshObject(jsonObject),
            sandeshObj = filteredSandeshObj.value,
            sandeshObjKeys = _.keys(sandeshObj),
            sandeshTypesLength = getLengthOfTypesInSandeshObj(sandeshObj, sandeshTypes);

        return (sandeshTypesLength === sandeshObjKeys.length);
    }

    function getLengthOfTypesInSandeshObj(sandeshObj, types) {
        var typesLength = 0;
        _.each(sandeshObj, function(value) {
            if(_.contains(types, value._type)) {
                typesLength += 1;
            }
        });

        return typesLength;
    }

    function filterSandeshObject(jsonObject) {
        var keys = _.keys(jsonObject),
            sandeshKey = keys[0],
            sandeshObj = jsonObject[sandeshKey];

        sandeshObj = _.omit(sandeshObj, ["more", "next_batch"]);

        return {key: sandeshKey, value: sandeshObj};
    }

    function filterTypesOfSandeshObj(sandeshObj, omitTypes) {
        var filteredSandeshObj = {};
        _.each(sandeshObj, function(value, key) {
            if(!_.contains(omitTypes, value._type)) {
                filteredSandeshObj[key] = value;
            }
        });

        return filteredSandeshObj;
    }

    function parseDataObject(jsonObject) {

        while (jsonObject._type === "list") {
            jsonObject = parseListDataObj(jsonObject);
        }

        while (jsonObject._type === "struct") {
            jsonObject = parseDataObjByType(jsonObject, "struct");
        }

        if (jsonObject._type === "string" && contrail.checkIfExist(jsonObject._size) && contrail.checkIfExist(jsonObject.element)) {
            jsonObject = _.map(jsonObject.element, function(value) { return {element: value}; });
        }

        return jsonObject;
    }

    function parseDataObjByType(jsonObject, type) {
        for (var key in jsonObject) {
            if (_.isObject(jsonObject[key]) && jsonObject._type === type) {
                jsonObject = jsonObject[key];
                break;
            }
        }

        return jsonObject;
    }

    function isSandeshDataHavingObject(sandeshDataItem) {
        var isObject = false;
        _.each(sandeshDataItem.data, function(value) {
            isObject = isObject || _.isObject(value);
        });

        return isObject;
    }

    function parseListDataObj(jsonObject) {
        if (jsonObject.list._size > 0) {
            jsonObject = jsonObject.list;
        } else {
            jsonObject = {};
        }

        return jsonObject;
    }

    return IntrospectJSGridView;
});
