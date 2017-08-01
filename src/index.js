const BASE_MATRIX = [1, 0, 0, 1, 0, 0];

const MATRIX_FILLER = [0, 0, 1];

const tokens = ['matrix', 'translate', 'scale', 'rotate', 'skewX', 'skewY'];

const maxString = tokens.reduce(
	(acc, t) => (t.length > acc ? t.length : acc),
	0
);

const multiplyMatrices = (m1, m2) => {
	const result = [];
	for (let i = 0; i < m1.length; i++) {
		result[i] = [];
		for (let j = 0; j < m2[0].length; j++) {
			let sum = 0;
			for (let k = 0; k < m1[0].length; k++) {
				sum += m1[i][k] * m2[k][j];
			}
			result[i][j] = sum;
		}
	}
	return result;
};

const inBrackets = value => value.match(/\((.*?)\)/)[1];

const getTransformCombos = (transformString, arr) => {
	transformString = transformString.trim();
	if (transformString.length < maxString) {
		return arr;
	}
	const sample = transformString.substr(0, maxString);
	let found = false;
	tokens.forEach(t => {
		if (found) {
			return;
		}
		const p = sample.indexOf(t);
		if (p > -1) {
			found = true;
			transformString = transformString.substr(t.length);
			const inbr = inBrackets(transformString);
			transformString = transformString.substr(inbr.length + 2);
			arr.push({
				type: t,
				br: inbr,
				values: inbr.match(/[-+]?(\d*\.?\d+)/g).map(m => parseFloat(m))
			});
		}
	});
	if (!found) {
		return arr;
	}
	return getTransformCombos(transformString, arr);
};

export const svgTransformStringToMatrix = transformationsString => {
	const allTransformations = getTransformCombos(transformationsString, []);
	let transformedMatrices = [];
	allTransformations.forEach(tr => {
		transformedMatrices = transformToMatrix(
			tr.type,
			tr.values,
			transformedMatrices
		);
	});
	let pM = [1, 0, 0, 1, 0, 0];
	transformedMatrices.forEach((m, i) => {
		pM = multiplyMatrices(
			[[pM[0], pM[2], pM[4]], [pM[1], pM[3], pM[5]], [...MATRIX_FILLER]],
			[[m[0], m[2], m[4]], [m[1], m[3], m[5]], [...MATRIX_FILLER]]
		);
		pM = [pM[0][0], pM[1][0], pM[0][1], pM[1][1], pM[0][2], pM[1][2]];
	});
	return pM;
};
const transformToMatrix = (type, values, matrices) => {
	let matrix = null;

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
			matrices = matrices.concat([
				[1, 0, Math.tan(values[0] / 180 * Math.PI), 1, 0, 0]
			]);
			break;
		case tokens[5]:
			matrices = matrices.concat([
				[1, Math.tan(values[0] / 180 * Math.PI), 0, 1, 0, 0]
			]);
			break;
		case tokens[3]:
			const ang = values[0] / 180 * Math.PI;
			let rotationMatrix = [
				Math.cos(ang),
				Math.sin(ang),
				-Math.sin(ang),
				Math.cos(ang),
				0,
				0
			];
			if (values.length === 1) {
				matrix = rotationMatrix;
				matrices = matrices.concat([matrix]);
			} else if (values.length === 3) {
				let mt = [];
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
