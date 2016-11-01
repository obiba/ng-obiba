'use strict';

angular.module('obiba.graphics', ['nvd3', 'obiba.utils'])
  .factory('D3GeoConfig', [function () {
    function D3GeoConfig () {
      this.data = []; // based on studyResultDto['obiba.mica.TermsAggregationResultDto.terms'] for 'populations-selectionCriteria-countriesIso' aggregation
      this.color = '#2077b2'; // the lightest color
      this._dimensions = {width: 960, height: 500}; // default geoMercator translate dimensions
      this._scale = 150; // default geoMercator scale
      this.title = '';
    }

    D3GeoConfig.prototype.withData = function (data) {
      this.data = data;
      return this;
    };

    D3GeoConfig.prototype.withColor = function (color) {
      this.color = color;
      return this;
    };

    D3GeoConfig.prototype.withTitle = function (title) {
      this.title = title;
      return this;
    };

    D3GeoConfig.prototype.getDimensions = function () {
      return this._dimensions;
    };

    D3GeoConfig.prototype.getScale = function () {
      return this._scale;
    };

    return D3GeoConfig;
  }])
  .factory('D3ChartConfig', [function () {

    function D3ChartConfig(aggregation) {
      var options = {
        chart: {
          x: function (d) { return d.title; },
          y: function (d) { return d.count; },
          yAxis: {
            tickFormat: function (d) { return d3.format(',.0f')(d); }
          },
          showLabels: false,
          duration: 500,
          labelThreshold: 0.01,
          groupSpacing: 0.5,
          height: 250,
          tooltip: {
            contentGenerator: function (o) {
              var series = o.series[0];
              if (series === null) { return; }

              var s = '',
                  bottom = '<span>' + series.key + ': <strong>' + series.value + '</strong></span>';
              if (o.value) {
                s = '<strong>' + o.value + '</strong><br/>';
              }

              return '<div class="chart-tooltip">' + s + bottom + '</div>';
            }
          }
        },
        title: {},
        subtitle: {}
      };

      switch (aggregation) {
        case 'methods-designs':
        case 'populations-dataCollectionEvents-bioSamples':
          options.chart.type = 'multiBarHorizontalChart';
          break;
        case 'numberOfParticipants-participant-range':
          options.chart.type = 'pieChart';
          break;
        default:
          options.chart.type = 'discreteBarChart';
          break;
      }

      this.data = [];
      this.options = options;
    }

    D3ChartConfig.prototype.withType = function (type) {
      this.options.chart.type = type;
    };

    D3ChartConfig.prototype.withTitle = function (title) {
      this.options.chart.title = {text: title, enable: true};
    };

    D3ChartConfig.prototype.withSubtitle = function (subtitle) {
      this.options.chart.subtitle = {text: subtitle, enable: true};
    };

    D3ChartConfig.prototype.withData = function (data, override, key) {
      if (override) {
        this.data = data;
      } else {
        this.data.push({key: key, values: data });
      }
      return this;
    };

    return D3ChartConfig;
  }])
  .directive('obibaNvChart', [function () {
    function link() { }

    return {
      restrict: 'EA',
      template: '<nvd3 options="chartConfig.options" data="chartConfig.data"></nvd3>',
      scope: {
        chartConfig: '='
      },
      link: link
    };
  }])
  .directive('obibaGeo', ['ObibaCountriesGeoJson',
    function (ObibaCountriesGeoJson) {
      function link(scope, element) {        
        // data
        var data = {};
        // assuming config.data: [{key: X1, title: Y1, default: Z1, count: A1}, {key: Xn, title: Yn, default: Zn, count: An}, ...]
        scope.config.data.forEach(function (d) { data[d.key] = d.count; });

        // colors
        var max = 0;
        for (var k in data) {
          if (data.hasOwnProperty(k)) {
            max = data[k] >= max ? data[k] : max;
          }
        }

        var color = d3.scale.threshold()
            .domain([0, max])
            .range(d3.range(0, max, 1).map(function (i) { return d3.rgb(scope.config.color).darker(i); }));

        // map
        var parentElement = element.parent()[0];
        var ratio = parentElement.clientWidth / scope.config.getDimensions().width;

        var projection = d3.geo.mercator()
            .scale(scope.config.getScale() * ratio)
            .translate([scope.config.getDimensions().width * ratio / 2, scope.config.getDimensions().height * ratio / 2]);
        var path = d3.geo.path().projection(projection);
        var svg = d3.select(element[0]).append('svg')
            .attr('width', scope.config.getDimensions().width * ratio)
            .attr('height', scope.config.getDimensions().height * ratio);

        svg.selectAll('path')
            .data(ObibaCountriesGeoJson.features)
            .enter()
            .append('path').attr('d', path)
            .style('fill', function (d) { return data[d.id] ? color(data[d.id]) : d3.rgb('#ccc'); }).style('stroke', '#fff');

        // title
        var title = scope.config.title;
        if (title) {
          scope.title = title;
        }
      }

      return {
        restrict: 'EA',
        scope: {
          config: '='
        },
        link: link
      };
  }]);