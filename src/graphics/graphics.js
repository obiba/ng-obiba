'use strict';

angular.module('obiba.graphics', ['nvd3', 'obiba.utils'])
  .factory('D3GeoConfig', [function () {
    function D3GeoConfig () {
      this.data = [];
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
      function elementClick (o) {
        var link = o.data.link;
        if (link && window) {
          window.location = link;
        }
      }

      var options = {
        chart: {
          x: function (d) { return d.title; },
          y: function (d) { return d.value; },
          yAxis: {
            tickFormat: function (d) { return d3.format(',.0f')(d); }
          },
          showLabels: false,
          duration: 0,
          labelThreshold: 0.01,
          groupSpacing: 0.5,
          height: 250,
          reduceXTicks: false,
          stacked: true,
          showControls: false,
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
          },
          multibar: {
            dispatch: {
              elementClick: elementClick
            }
          },
          pie: {
            dispatch: {
              elementClick: elementClick
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
          options.chart.type = 'multiBarChart';
          break;
      }

      this.data = [];
      this.options = options;
    }

    D3ChartConfig.prototype.withType = function (type) {
      this.options.chart.type = type;
      return this;
    };

    D3ChartConfig.prototype.withTitle = function (title) {
      this.options.title = {text: title, enable: true};
      return this;
    };

    D3ChartConfig.prototype.withSubtitle = function (subtitle) {
      this.options.subtitle = {text: subtitle, enable: true};
      return this;
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
        scope.config.data.forEach(function (d) { data[d.key] = d.value; });

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

        // title
        var title = scope.config.title;
        if (title) {
          d3.select(element[0]).append('div').attr('class', 'title h4').style('text-align', 'center').text(title);
        }

        // tooltip
        var tooltip = d3.select(element[0]).append('div')
            .attr('class', 'hidden chart-tooltip');

        // map
        var parentElement = element.parent()[0];
        var ratio = parentElement.clientWidth / scope.config.getDimensions().width;

        var projection = d3.geo.equirectangular()
            .translate([scope.config.getDimensions().width * ratio / 2, scope.config.getDimensions().height * ratio / 2])
            .scale(scope.config.getScale() * ratio);
        var path = d3.geo.path().projection(projection);
        var svg = d3.select(element[0]).append('svg')
            .attr('width', scope.config.getDimensions().width * ratio)
            .attr('height', scope.config.getDimensions().height * ratio);

        var g = svg.append('g');

        g.selectAll('path')
            .data(ObibaCountriesGeoJson.features)
            .enter()
            .append('path').attr('d', path)
            .style('fill', function (d) { return data[d.id] ? color(data[d.id]) : d3.rgb('#ccc'); }).style('stroke', '#fff')
            .on('mousemove', function (d) {
              var mouse = d3.mouse(svg.node()).map(function(d) {
                return parseInt(d);
              });
              var tooltipText = d.properties.name;
              if (typeof data[d.id] !== 'undefined') {
                tooltipText = tooltipText + ' <strong>' + data[d.id] + '</strong>';
              }

              tooltip.classed('hidden', false)
                  .attr('style', 'left:' + (mouse[0] + 5) + 'px; top:' + (mouse[1] - 5) + 'px; position: absolute')
                  .html(tooltipText);
            })
            .on('mouseout', function () {
              tooltip.classed('hidden', true);
            });
      }

      return {
        restrict: 'EA',
        scope: {
          config: '='
        },
        link: link
      };
  }]);