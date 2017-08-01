(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["svgTransformToMatrix"] = factory();
	else
		root["svgTransformToMatrix"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var BASE_MATRIX = [1, 0, 0, 1, 0, 0];

var MATRIX_FILLER = [0, 0, 1];

var tokens = ['matrix', 'translate', 'scale', 'rotate', 'skewX', 'skewY'];

var maxString = tokens.reduce(function (acc, t) {
	return t.length > acc ? t.length : acc;
}, 0);

var multiplyMatrices = function multiplyMatrices(m1, m2) {
	var result = [];
	for (var i = 0; i < m1.length; i++) {
		result[i] = [];
		for (var j = 0; j < m2[0].length; j++) {
			var sum = 0;
			for (var k = 0; k < m1[0].length; k++) {
				sum += m1[i][k] * m2[k][j];
			}
			result[i][j] = sum;
		}
	}
	return result;
};

var inBrackets = function inBrackets(value) {
	return value.match(/\((.*?)\)/)[1];
};

var getTransformCombos = function getTransformCombos(transformString, arr) {
	transformString = transformString.trim();
	if (transformString.length < maxString) {
		return arr;
	}
	var sample = transformString.substr(0, maxString);
	var found = false;
	tokens.forEach(function (t) {
		if (found) {
			return;
		}
		var p = sample.indexOf(t);
		if (p > -1) {
			found = true;
			transformString = transformString.substr(t.length);
			var inbr = inBrackets(transformString);
			transformString = transformString.substr(inbr.length + 2);
			arr.push({
				type: t,
				br: inbr,
				values: inbr.match(/[-+]?(\d*\.?\d+)/g).map(function (m) {
					return parseFloat(m);
				})
			});
		}
	});
	if (!found) {
		return arr;
	}
	return getTransformCombos(transformString, arr);
};

var svgTransformStringToMatrix = exports.svgTransformStringToMatrix = function svgTransformStringToMatrix(transformationsString) {
	var allTransformations = getTransformCombos(transformationsString, []);
	var transformedMatrices = [];
	allTransformations.forEach(function (tr) {
		transformedMatrices = transformToMatrix(tr.type, tr.values, transformedMatrices);
	});
	var pM = [1, 0, 0, 1, 0, 0];
	transformedMatrices.forEach(function (m, i) {
		pM = multiplyMatrices([[pM[0], pM[2], pM[4]], [pM[1], pM[3], pM[5]], [].concat(MATRIX_FILLER)], [[m[0], m[2], m[4]], [m[1], m[3], m[5]], [].concat(MATRIX_FILLER)]);
		pM = [pM[0][0], pM[1][0], pM[0][1], pM[1][1], pM[0][2], pM[1][2]];
	});
	return pM;
};
var transformToMatrix = function transformToMatrix(type, values, matrices) {
	var matrix = null;

	switch (type) {
		case tokens[0]:
			matrix = values;
			matrices = matrices.concat([matrix]);
			break;
		case tokens[1]:
			matrix = BASE_MATRIX.slice();
			matrix[4] = values[0];
			matrix[5] = values[1];
			matrices = matrices.concat([matrix]);
			break;
		case tokens[2]:
			matrices = matrices.concat([[values[0], 0, 0, values[1], 0, 0]]);
			break;
		case tokens[4]:
			matrices = matrices.concat([[1, 0, Math.tan(values[0] / 180 * Math.PI), 1, 0, 0]]);
			break;
		case tokens[5]:
			matrices = matrices.concat([[1, Math.tan(values[0] / 180 * Math.PI), 0, 1, 0, 0]]);
			break;
		case tokens[3]:
			var ang = values[0] / 180 * Math.PI;
			var rotationMatrix = [Math.cos(ang), Math.sin(ang), -Math.sin(ang), Math.cos(ang), 0, 0];
			if (values.length === 1) {
				matrix = rotationMatrix;
				matrices = matrices.concat([matrix]);
			} else if (values.length === 3) {
				var mt = [];
				matrix = BASE_MATRIX.slice();
				matrix[4] = values[1];
				matrix[5] = values[2];
				mt.push(matrix);
				mt.push(rotationMatrix);
				matrix = BASE_MATRIX.slice();
				matrix[4] = -values[1];
				matrix[5] = -values[2];
				mt.push(matrix);
				matrices = matrices.concat(mt);
			}
			break;
	}
	return matrices;
};

/***/ })
/******/ ]);
});