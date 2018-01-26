// MoneyLog test-suite
// Functions tester
// by Aurelio Jargas, since 2012-02-19

// Instructions:
// 1. In moneylog.html, include a new <script> tag after the default moneylog.js.
//     <script type="text/javascript" src="test/functions.js"></script>
// 2. In your browser, open the JavaScript console to see the messages.
// 3. Run MoneyLog, every tests should report "ok".


var zz, suffix;

suffix = ' (expected, results):';


// Disable MoneyLog init() process
window.onload = function () {
	document.getElementById('report').innerHTML =
		'<h1>MoneyLog Test Mode</h1>' +
		'Open the JavaScript console to see the test messages.';
};


function check(results, ok) {
	// Tests strings and numbers

	var prefix = 'Test ' + zz + ': ';

	if (results === ok) {
		console.log(prefix + 'ok');
	} else {
		console.log(prefix + 'FAILED' + suffix);
		console.log(ok);
		console.log(results);
	}
}
function checkArray(results, ok, quiet) {
	// Special function to test arrays because [] == [] returns false.

	// console.log('checkArray called with (results, ok, quiet);
	// console.log(results);
	// console.log(ok);
	// console.log(quiet);

	var i, failed, prefix = 'Test ' + zz + ': ';

	for (i = 0; i < ok.length; i++) {

		// Array inside array?
		if (typeof results[i] === 'object') {
			if (checkArray(results[i], ok[i], 'quiet')) {
				continue;
			} else {
				failed = i;
				break;
			}
		}

		// string|number contents, just test
		if (results[i] !== ok[i]) {
			failed = i;
			break;
		}
	}
	if (failed !== undefined) {
		if (!quiet) {
			console.log(prefix + 'FAILED at array item ' + failed + suffix);
			console.log(ok[failed]);
			console.log(results[failed]);
		}
		return false;
	} else {
		if (!quiet) {
			console.log(prefix + 'ok');
		}
		return true;
	}
}
function checkObject(results, ok) {
	// Loop and check all object properties

	var x, failed, prefix = 'Test ' + zz + ': ';

	for (x in ok) {

		// Array inside object?
		// Note: nested objects are not supported
		if (typeof results[x] === 'object') {
			if (checkArray(results[x], ok[x], 'quiet')) {
				continue;
			} else {
				failed = x;
				break;
			}
		}

		// string|number contents, just test
		if (results[x] !== ok[x]) {
			failed = x;
			break;
		}
	}
	if (failed !== undefined) {
		console.log(prefix + 'FAILED at property "' + failed + '"' + suffix);
		console.log(ok[failed]);
		console.log(results[failed]);

		console.log('*** Full objects (expected, results):');
		console.log(ok);
		console.log(results);
		return false;
	} else {
		console.log(prefix + 'ok');
		return true;
	}
}

console.log('-------------- MoneyLog Tests BEGIN');

zz = 0;
zz++; checkArray([], []);
zz++; checkArray([1,2,3], [1,2,3]);
zz++; checkArray([[1,2,3]], [[1,2,3]]);
zz++; checkArray([1, [2, [3, [4]]]], [1, [2, [3, [4]]]]);
zz++; checkObject({}, {});
zz++; checkObject({n:1}, {n:1});
zz++; checkObject({n:1, s:'x', a:[1]}, {n:1, s:'x', a:[1]});
zz++; checkObject({n:1, s:'x', a:[1, [2, [3]]]}, {n:1, s:'x', a:[1, [2, [3]]]});
zz++; checkObject({a1:[1, [2, [3]]], a2:[3, [2, [1]]]}, {a2:[3, [2, [1]]], a1:[1, [2, [3]]]});
///////////////////////////////////////////////////////////////////// ^ Test 9

// function Array.getColumn(n)
zz++; checkArray([].getColumn(1), []);
zz++; checkArray([[], [], []].getColumn(1), [undefined, undefined, undefined]);
zz++; checkArray([[0,1,2], [3,4,5], [6,7,8]].getColumn(0), [0, 3, 6]);
zz++; checkArray([[0,1,2], [3,4,5], [6,7,8]].getColumn(1), [1, 4, 7]);
zz++; checkArray([[0,1,2], [3,4,5], [6,7,8]].getColumn(2), [2, 5, 8]);
zz++; checkArray([[0,1,2], [3,4]  , [6,7,8]].getColumn(2), [2, undefined, 8]);
zz++; checkArray([[0,1,2], [3,4,5], [6,7,8]].getColumn(3), [undefined, undefined, undefined]);
///////////////////////////////////////////////////////////////////// ^ Test 16

// function computeTotals(arr)
zz++; check(computeTotals([]), undefined);
zz++; checkObject(
	computeTotals([0]),
	{min:0, max:0, sum:0, average:0, sumPositive:0, sumNegative:0, balance:[0]}
);
zz++; checkObject(
	computeTotals([1]),
	{min:1, max:1, sum:1, average:1, sumPositive:1, sumNegative:0, balance:[1]}
);
zz++; checkObject(
	computeTotals([-1]),
	{min:-1, max:-1, sum:-1, average:-1, sumPositive:0, sumNegative:-1, balance:[-1]}
);
zz++; checkObject(
	computeTotals([0, 0, 0, 0]),
	{min:0, max:0, sum:0, average:0, sumPositive:0, sumNegative:0, balance:[0, 0, 0, 0]}
);
zz++; checkObject(
	computeTotals([-2, -1, 0, 1, 2]),
	{min:-2, max:2, sum:0, average:0, sumPositive:3, sumNegative:-3, balance:[-2, -3, -3, -2, 0]}
);
zz++; checkObject(
	computeTotals([10.00, 25.50, -5.50, 33.33]),
	{min:-5.50, max:33.33, sum:63.33, average:15.8325, sumPositive:68.83, sumNegative:-5.50, balance:[10.00, 35.50, 30.00, 63.33]}
);
///////////////////////////////////////////////////////////////////// ^ Test 23

// function groupByPeriod(arr, periodType) {  // m, y
zz++; checkObject(
	groupByPeriod([
		['2012-02-15', '1', 'foo1'],
		['2012-02-18', '2', 'foo2'],
		['2012-02-28', '3', 'foo3'],
		['2012-03-04', '-4', 'bar1'],
		['2012-03-18', '-5', 'bar2'],
		['2012-04-01', '6', 'baz']
	], 'm'),
	{
		'2012-02': [
			['2012-02-15', '1', 'foo1'],
			['2012-02-18', '2', 'foo2'],
			['2012-02-28', '3', 'foo3']
		],
		'2012-03': [
			['2012-03-04', '-4', 'bar1'],
			['2012-03-18', '-5', 'bar2']
		],
		'2012-04': [
			['2012-04-01', '6', 'baz']
		],
		'keys': ['2012-02', '2012-03', '2012-04']
	}
);
zz++; checkObject(
	groupByPeriod([  // input sorted
		['2012-02-15', '1', 'foo1'],
		['2012-02-18', '2', 'foo2'],
		['2012-02-28', '3', 'foo3'],
		['2013-03-04', '-4', 'bar1'],
		['2013-03-18', '-5', 'bar2'],
		['2014-04-01', '6', 'baz']
	], 'y'),
	{
		'2012': [
			['2012-02-15', '1', 'foo1'],
			['2012-02-18', '2', 'foo2'],
			['2012-02-28', '3', 'foo3']
		],
		'2013': [
			['2013-03-04', '-4', 'bar1'],
			['2013-03-18', '-5', 'bar2']
		],
		'2014': [
			['2014-04-01', '6', 'baz']
		],
		'keys': ['2012', '2013', '2014']
	}
);
zz++; checkObject(
	groupByPeriod([  // input unsorted
		['2012-02-15', '1', 'foo1'],
		['2014-04-01', '6', 'baz'],
		['2013-03-04', '-4', 'bar1'],
		['2012-02-18', '2', 'foo2'],
		['2013-03-18', '-5', 'bar2'],
		['2012-02-28', '3', 'foo3']
	], 'y'),
	{
		'2012': [
			['2012-02-15', '1', 'foo1'],
			['2012-02-18', '2', 'foo2'],
			['2012-02-28', '3', 'foo3']
		],
		'2013': [
			['2013-03-04', '-4', 'bar1'],
			['2013-03-18', '-5', 'bar2']
		],
		'2014': [
			['2014-04-01', '6', 'baz']
		],
		'keys': ['2012', '2013', '2014']
	}
);
///////////////////////////////////////////////////////////////////// ^ Test 26



console.log('-------------- MoneyLog Tests END');
