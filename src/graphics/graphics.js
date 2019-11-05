/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

angular.module('obiba.graphics', ['nvd3', 'obiba.utils'])
  .factory('D3GeoConfig', [function () {
    function D3GeoConfig () {
      this.data = [];
      this.color = ['#2077b2']; // the lightest color
      this._dimensions = {width: 960, height: 500}; // default geoMercator translate dimensions
      this._scale = 150; // default geoMercator scale
      this.title = '';
      this.subtitle = '';
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

    D3GeoConfig.prototype.withSubtitle = function (subtitle) {
      this.subtitle = subtitle;
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
          margin: {left: 100},
          x: function (d) { return d.title; },
          y: function (d) { return d.value; },
          xAxis: {
            tickFormat: function (d) {
              return d;
            }
          },
          yAxis: {
            tickFormat: function (d) { return d3.format(',.0f')(d); }
          },
          showLabels: false,
          showLegend: true,
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
        case 'model-methods-design':
        case 'populations-dataCollectionEvents-model-bioSamples':
          options.chart.type = 'multiBarHorizontalChart';
          break;
        case 'model-numberOfParticipants-participant-range':
          options.chart.type = 'pieChart';
          break;
        default:
          options.chart.type = 'multiBarChart';
          break;
      }
if(options.chart.type === 'pieChart'){
  options.chart.showLabels = true;
  options.chart.labelThreshold = 0.1;
  options.chart.labelSunbeamLayout = false;
  options.chart.labelType =  function(d){
    var percent = (d.endAngle - d.startAngle) / (2 * Math.PI);
    return d3.format('.2%')(percent);
  };
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

      function luma(rgbColor) {
        return rgbColor.r * 0.2126 + rgbColor.g * 0.7152 + rgbColor.b * 0.0722;
      }

      function colorComparator(colorA, colorB) {
        if (colorA === colorB) {
          return 0;
        }

        return luma(d3.rgb(colorA)) > luma(d3.rgb(colorB)) ? 1 : -1;
      }

      function lightestColor(colorArray) {
        // according to ITU-R Recommendation BT.709, HDTV forms luma (D'Y) using D'R, D'G and D'B coefficients 0.2126, 0.7152, and 0.0722.
        // http://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.709-6-201506-I!!PDF-E.pdf

        if (!Array.isArray(colorArray)) {
          return colorArray;
        }

        colorArray.sort(colorComparator);

        return colorArray.reduce(function (acc, val) {
          if (!acc) {
            return val;
          }

          var rgbVal = d3.rgb(val),
              rbgAcc = d3.rgb(acc);

          return luma(rgbVal) > luma(rbgAcc) ? val : acc;
        });
      }

      function ColorSelector(values, palette) {
        var sortedUniqueValues =
          values.filter(function(item, pos) {
            return values.indexOf(item) === pos;
          })
          .sort(function(a, b){
            return a- b;
          });

        var configColor = lightestColor(palette);

        /**
         * The algorithm is still not perfect and may have a threshold where high values would look black.
         *
         * @param value
         * @returns RGB color
         */
        this.color = function(value) {
          var index = sortedUniqueValues.indexOf(value);
          return index === 0 ? d3.rgb(configColor) : d3.rgb(configColor).darker(index*0.005*value);
        };
      }

      function link(scope, element) {
        // data
        var values = [];
        var data = {};
        // map
        function getRadio(){
          var parentElement = element.parent()[0];
          return parentElement.clientWidth / scope.config.getDimensions().width;
        }
        // assuming config.data: [{key: X1, title: Y1, default: Z1, count: A1}, {key: Xn, title: Yn, default: Zn, count: An}, ...]
        scope.config.data.forEach(function (d) {
          data[d.key] = d.value;
          values.push(d.value);
        });

        // colors
        var max = 0;
        for (var k in data) {
          if (data.hasOwnProperty(k)) {
            max = data[k] >= max ? data[k] : max;
          }
        }

        // Render the SVG
        function renderMap(ratio){
          // Make sure to empty the element[0]
          element[0].innerHTML = '';
          var colorSelector = new ColorSelector(values,scope.config.color);

          // title
          var title = scope.config.title;
          if (title) {
            d3.select(element[0]).append('div').attr('class', 'title h4').style('text-align', 'center').text(title);
          }

          // tooltip
          var tooltip = d3.select(element[0]).append('div')
            .attr('class', 'hidden chart-tooltip');

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
            .style('fill', function (d) {return data[d.id] ? colorSelector.color(data[d.id]) : d3.rgb('#ccc');})
            .style('stroke', '#fff')
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
          // subTitle
          var subtitle = scope.config.subtitle;
          if(subtitle){
            d3.select(element[0]).append('div').attr('class', 'sub-title h5').style('text-align', 'center').text(subtitle);
          }
        }

        renderMap(getRadio());

        d3.select(window).on('resize', function () {
          renderMap(getRadio());
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
