// Generated by CoffeeScript 1.6.3
(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['underscore', 'flight/lib/component', 'lib/fusiontip/fusiontip', 'lib/accounting/accounting', 'map/utils/mobile_detection'], function(_, defineComponent, fusionTip, accounting, mobileDetection) {
    var ToolTip, neighborhoodsOverlay;
    ToolTip = (function(_super) {
      __extends(ToolTip, _super);

      function ToolTip(map) {
        this.map = map;
      }

      ToolTip.prototype.container = $("<div/>", {
        "class": "hood_info_window"
      });

      ToolTip.prototype.position = null;

      ToolTip.prototype.count = null;

      ToolTip.prototype.listener = void 0;

      ToolTip.prototype.offset = {
        x: 20,
        y: 20
      };

      ToolTip.prototype.destroy = function() {
        return this.setMap(null);
      };

      ToolTip.prototype.onAdd = function() {
        return this.container.appendTo(this.getPanes().floatPane);
      };

      ToolTip.prototype.onRemove = function() {
        return this.container.remove();
      };

      ToolTip.prototype.draw = function() {};

      ToolTip.prototype.setContent = function(html) {
        this.container.html(html);
        return this.setMap(this.map);
      };

      ToolTip.prototype.hide = function() {
        return this.container.hide().empty();
      };

      ToolTip.prototype.show = function() {
        return this.container.show();
      };

      ToolTip.prototype.onMouseMove = function(latLng) {
        var px;
        px = this.getProjection().fromLatLngToContainerPixel(latLng);
        return this.container.css({
          left: px.x + this.offset.x,
          top: px.y + this.offset.y
        });
      };

      ToolTip.prototype.updatePosition = function(overlay) {
        var _this = this;
        this.listener = google.maps.event.addListener(overlay, "mousemove", function(event) {
          return _this.onMouseMove(event.latLng, overlay);
        });
        return this.show();
      };

      return ToolTip;

    })(google.maps.OverlayView);
    neighborhoodsOverlay = function() {
      this.defaultAttrs({
        fusionApiUrl: "https://www.googleapis.com/fusiontables/v1/query?sql=",
        baseInfoHtml: "<strong>Neigborhood: </strong>{{hood}}",
        enableOnboardCalls: false,
        enableMouseover: false,
        tableId: void 0,
        apiKey: void 0,
        gMap: void 0,
        data: void 0,
        infoTemplate: void 0,
        polygons: [],
        wait: 200,
        polygonOptions: {
          mouseover: {
            strokeColor: "#000",
            strokeOpacity: .5,
            strokeWeight: 1,
            fillColor: "#000",
            fillOpacity: .2
          },
          mouseout: {
            strokeWeight: 0,
            fillOpacity: 0
          }
        },
        infoWindowData: {
          state: void 0,
          hood: void 0,
          population: void 0,
          growth: void 0,
          density: void 0,
          males: void 0,
          females: void 0,
          median_income: void 0,
          average_income: void 0
        }
      });
      this.hoodQuery = function(data) {
        var query;
        query = ["SELECT geometry, HOOD_NAME, STATENAME, MARKET, LATITUDE, LONGITUDE"];
        query.push("FROM " + this.attr.tableId);
        query.push("WHERE LATITUDE >= " + data.lat1 + " AND LATITUDE <= " + data.lat2);
        query.push("AND LONGITUDE >= " + data.lng1 + " AND LONGITUDE <= " + data.lng2);
        return query.join(' ');
      };
      this.addHoodsLayer = function(ev, data) {
        this.attr.gMap = data.gMap;
        this.attr.data = data;
        if (!this.toolTip) {
          this.toolTip = new ToolTip(this.attr.gMap);
        }
        return this.getKmlData(data);
      };
      this.setupMouseOver = function(event, data) {
        if (!this.isMobile() && this.attr.enableMouseover) {
          return this.buildInfoWindow(event, data);
        }
      };
      this.getKmlData = function(data) {
        var query, url,
          _this = this;
        query = this.hoodQuery(data);
        url = [this.attr.fusionApiUrl];
        url.push(encodeURIComponent(this.hoodQuery(data)));
        url.push("&key=" + this.attr.apiKey);
        return $.ajax({
          url: url.join(""),
          dataType: "jsonp",
          success: function(data) {
            return _this.buildPolygons(data);
          }
        });
      };
      this.clearPolygons = function() {
        var x, _i, _len, _ref;
        if (!this.attr.polygons.length) {
          return;
        }
        _ref = this.attr.polygons;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          if (x) {
            x.setMap(null);
          }
        }
        this.attr.polygons = [];
      };
      this.buildPolygons = function(data) {
        var hoodData, polygonData, row, rows, _i, _len, _results;
        rows = data.rows;
        this.clearPolygons();
        _results = [];
        for (_i = 0, _len = rows.length; _i < _len; _i++) {
          row = rows[_i];
          if (!rows[0]) {
            continue;
          }
          polygonData = this.buildPaths(row);
          hoodData = this.buildHoodData(row);
          _results.push(this.wireupPolygon(polygonData, hoodData));
        }
        return _results;
      };
      this.wireupPolygon = function(polygonData, hoodData) {
        var hoodLayer, initialOptions, isCurrentHood, mouseOutOptions, mouseOverOptions;
        mouseOverOptions = this.attr.polygonOptions.mouseover;
        mouseOutOptions = this.attr.polygonOptions.mouseout;
        isCurrentHood = this.attr.data.hood === hoodData.hood;
        initialOptions = isCurrentHood ? mouseOverOptions : mouseOutOptions;
        hoodLayer = new google.maps.Polygon(_.extend({
          paths: polygonData
        }, initialOptions));
        toolTip = this.toolTip;
        google.maps.event.addListener(hoodLayer, "mouseover", function(event) {
          this.setOptions(mouseOverOptions);
          return $(document).trigger('hoodMouseOver', {
            data: hoodData,
            hoodLayer: hoodLayer
          });
        });
        google.maps.event.addListener(hoodLayer, "click", function(event) {
          var data;
          data = _.extend(hoodLayer, hoodData, event);
          return $(document).trigger('hoodOnClick', data);
        });
        google.maps.event.addListener(hoodLayer, "mouseout", function() {
          this.hide(hoodLayer);
          if (!isCurrentHood) {
            return this.setOptions(mouseOutOptions);
          }
        });
        hoodLayer.setMap(this.attr.gMap);
        this.attr.polygons.push(hoodLayer);
      };
      this.showInfoWindow = function(event, data) {
        var html, infoData;
        this.trigger(document, 'uiNHoodInfoWindowDataRequest');
        infoData = this.buildOnboardData(data);
        html = _.template(this.attr.infoTemplate, infoData);
        return this.toolTip.setContent(html);
      };
      this.buildPaths = function(row) {
        var coordinates, geometry;
        coordinates = [];
        if (geometry = row[0].geometry) {
          if (geometry.type === 'Polygon') {
            coordinates = this.makePathsCoordinates(geometry.coordinates[0]);
          }
        }
        return coordinates;
      };
      this.isValidPoint = function(arr) {
        return arr.length === 2 && _.all(arr, _.isNumber);
      };
      this.makePathsCoordinates = function(coordinates) {
        if (this.isValidPoint(coordinates)) {
          return new google.maps.LatLng(coordinates[1], coordinates[0]);
        } else {
          return _.map(coordinates, this.makePathsCoordinates, this);
        }
      };
      this.buildHoodData = function(row) {
        if (typeof row[0] === 'object') {
          return _.object(['hood', 'state', 'city', 'lat', 'lng'], row.slice(1));
        } else {
          return {};
        }
      };
      this.buildInfoWindow = function(event, polygonData) {
        var html;
        if (!polygonData.data) {
          return polygonData.data;
        }
        html = _.template(this.attr.baseInfoHtml, polygonData.data);
        this.toolTip.setContent(html);
        return this.toolTip.updatePosition(polygonData.hoodLayer);
      };
      this.buildOnboardData = function(polygonData) {
        var data, demographic, key, onboardData, value, _ref;
        if (!this.attr.enableOnboardCalls) {
          return polygonData;
        }
        onboardData = JSON.parse(this.getOnboardData(polygonData).responseText);
        data = _.extend(this.attr.infoWindowData, polygonData);
        if (!_.isEmpty(onboardData)) {
          demographic = onboardData.demographic;
          _ref = this.attr.infoWindowData;
          for (key in _ref) {
            value = _ref[key];
            if (demographic[key]) {
              data[key] = this.formatValue(key, demographic[key]);
            }
          }
        }
        return data;
      };
      this.formatValue = function(key, value) {
        switch (key) {
          case 'median_income':
          case 'average_income':
            return accounting.formatMoney(value);
          case 'population':
            return accounting.formatNumber(value);
          default:
            return value;
        }
      };
      this.getOnboardData = function(data) {
        var query, xhr;
        if (_.isEmpty(data)) {
          return {};
        }
        query = [];
        query.push("state=" + (this.toDashes(data.state)));
        query.push("city=" + (this.toDashes(data.city)));
        query.push("neighborhood=" + (this.toDashes(data.hood)));
        return xhr = $.ajax({
          url: "/meta/community?rectype=NH&" + (query.join('&')),
          async: false
        }).done(function(data) {
          return data;
        }).fail(function(data) {
          return {};
        });
      };
      this.toDashes = function(value) {
        if (value == null) {
          return '';
        }
        return value.replace(' ', '-');
      };
      this.toSpaces = function(value) {
        if (value == null) {
          return '';
        }
        return value.replace('-', ' ');
      };
      return this.after('initialize', function() {
        this.on(document, 'uiNeighborhoodDataRequest', this.addHoodsLayer);
        this.on(document, 'hoodMouseOver', this.setupMouseOver);
        this.on(document, 'hoodOnClick', this.showInfoWindow);
      });
    };
    return defineComponent(neighborhoodsOverlay, mobileDetection, withTooltip);
  });

}).call(this);
