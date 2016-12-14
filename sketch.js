// Seed for consistant randoms
Math.seedrandom();

// Number of pixels wide per cell
var s = 10;

// Number of worms to create the maze
var worms = 2;

// Number of total moves to be made per frame
var cpf = 1000;

// Infinite loop maze
var infinite = false;

// Generation method where branches are creating in a circle pattern
var circleBranch = false;



function setup() {
	frameRate(100);
	pixelDensity(4);
	createCanvas(windowWidth, windowHeight);

	initialize();
}

function draw() {

	noStroke();
	fill(0, 0, 0);
	rect(0, 0, cols * s + 1, rows * s + 1);

	for (var i = 0; i < visited.length; i++) {
		visit(grid[visited[i]]);
	}

	for (var n = 0; n < canGoTo.length; n++) {
		for(var i = 0; i < canGoTo[n].length; i++) {
			goTo(grid[canGoTo[n][i]]);
		}
	}

	for (var x = 0; x < cpf / stacks; x++) {
		for (var n = 0; n < current.length; n++) {
			if (current[n] != undefined) {

				current[n].group = n;
				current[n].visited = true;
				highlight(current[n]);

				if (!visited.includes(index(current[n].i, current[n].j))) {
					visited.push(index(current[n].i, current[n].j));
				}

				if (!canGoTo[n].includes(index(current[n].i, current[n].j))) {
					canGoTo[n].push(index(current[n].i, current[n].j));
				}

				var next = checkNeighbours(current[n]);

				if (next != undefined) {

					stack[n].push(current[n]);
					next.visited = true;
				
					if (next.group === -1) {
						next.group = n;
					}

					if (!visited.includes(index(next.i, next.j))) {
						visited.push(index(next.i, next.j));
					}

					if (!canGoTo[n].includes(index(next.i, next.j))) {
						canGoTo[n].push(index(next.i, next.j));
					}

					removeWalls(current[n], next);
					current[n] = next;

				} else {

					var indexOf = canGoTo[n].indexOf(index(current[n].i, current[n].j));

					if (indexOf > -1) {
						canGoTo[n].splice(indexOf, 1);
					}

					current[n] = stack[n].pop();

				}

				if (circleBranch) current[n] = grid[canGoTo[n][Math.floor(Math.random() * canGoTo[n].length)]];

			} else {
				cont[n] = false;
			}
		}
	}

	for (var i = 0; i < grid.length; i++) {
		show(grid[i]);
	}

	if (!cont.includes(true)) {

		link();

		clear();

		noStroke();

		fill(0, 0, 0);
		rect(0, 0, cols * s + 1, rows * s + 1);

		for (var i = 0; i < visited.length; i++) {
			visit(grid[visited[i]]);
		}

		for (var i = 0; i < grid.length; i++) {
			show(grid[i]);
		}

		noLoop();

		findSolution(grid[0], grid[grid.length - 1]);

	}

}

function initialize() {

	cols = floor((width - 1) / s);
	rows = floor((height - 1) /  s);

	grid = [];
	visited = [];
	canGoTo = [];

	for (var j = 0; j < rows; j++) {
		for (var i = 0; i < cols; i++) {
			var cell = new Cell(i, j);
			grid.push(cell);
		}
	}

	stacks = Math.min(floor(cols * rows / 9), worms);
	current = [];
	stack = [];

	friends = [];

	cont = [];

	for (var n = 0; n < stacks; n++) {

		canGoTo[n] = [];
		cont[n] = true;

		do {

			room = false;

			var col = floor(Math.random() * cols);
			var row = floor(Math.random() * rows);

			for (i = col - 1; i <= col + 1; i++) {
				for (j = row - 1; j <= row + 1; j++) {
					if (current.includes(grid[index(i, j)])) {
						room = true;
					}
				}
			}

		} while (room);

		current[n] = grid[index(col, row)];

		stack[n] = [];
	}

}

function create() {

	initialize();

	loop();

}

function index(i, j) {
	if (infinite) {
		i = ((i % cols) + cols) % cols;
		j = ((j % rows) + rows) % rows;
	}
	if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
		return -1
	} else {
		return i + j * cols;
	}
}

function removeWalls(a, b) {
	var x = a.i - b.i;
	if (x === 1 || x === -cols + 1) {
		a.walls[3] = false;
		b.walls[1] = false;
	} else if (x === -1 || x === cols - 1) {
		a.walls[1] = false;
		b.walls[3] = false;
	}
	var y = a.j - b.j;
	if (y === 1 || y === -rows + 1) {
		a.walls[0] = false;
		b.walls[2] = false;
	} else if (y === -1 || y === rows - 1) {
		a.walls[2] = false;
		b.walls[0] = false;
	}
}

// function drawSolutionLine(a, b) {
// 	var x = a.i - b.i;
// 	if (x === 1 || x === -cols + 1) {
		
// 	} else if (x === -1 || x === cols - 1) {
		
// 	}
// 	var y = a.j - b.j;
// 	if (y === 1 || y === -rows + 1) {
		
// 	} else if (y === -1 || y === rows - 1) {
		
// 	}
// }

function checkNeighbours(cell) {

	var neighbours = [];

	i = cell.i;
	j = cell.j;

	var top = grid[index(i, j - 1)];
	var right = grid[index(i + 1, j)];
	var bottom = grid[index(i, j + 1)];
	var left = grid[index(i - 1, j)];

	if (top && !top.visited) {
		neighbours.push(top);
	}

	if (right && !right.visited) {
		neighbours.push(right);
	}

	if (bottom && !bottom.visited) {
		neighbours.push(bottom);
	}

	if (left && !left.visited) {
		neighbours.push(left);
	}

	if (neighbours.length > 0) {
		var r = floor(Math.random() * neighbours.length);
		return neighbours[r];
	} else {
		return undefined;
	}
}

function randomPathNeighbour(cell) {

	var neighbours = [];

	i = cell.i;
	j = cell.j;

	var top = grid[index(i, j - 1)];
	var right = grid[index(i + 1, j)];
	var bottom = grid[index(i, j + 1)];
	var left = grid[index(i - 1, j)];

	if (top && !top.visited && !cell.walls[0] && !top.walls[2]) {
		neighbours.push(top);
	}

	if (right && !right.visited && !cell.walls[1] && !right.walls[3]) {
		neighbours.push(right);
	}

	if (bottom && !bottom.visited && !cell.walls[2] && !bottom.walls[0]) {
		neighbours.push(bottom);
	}

	if (left && !left.visited && !cell.walls[3] && !left.walls[1]) {
		neighbours.push(left);
	}

	if (neighbours.length > 0) {
		var r = floor(Math.random() * neighbours.length);
		return neighbours[r];
	} else {
		return undefined;
	}

}

function show(cell) {

	i = cell.i;
	j = cell.j;
	walls = cell.walls;

	var x = i * s;
	var y =j * s;

	stroke(255);
	strokeWeight(1);

	if (walls[0]) {
		line(x, y, x + s, y);
	}

	if (walls[1]) {
		line(x + s, y, x + s, y + s);
	}

	if (walls[2]) {
		line(x + s, y + s, x, y + s);
	}

	if (walls[3]) {
		line(x, y + s, x, y);
	}

	noStroke();
}

function link() {

	var neighbours = [];

	var linked = [0];

	for (var n = 0; n < grid.length; n++) {

		var cell = grid[n];

		i = cell.i;
		j = cell.j;

		var top = grid[index(i, j - 1)];
		var right = grid[index(i + 1, j)];
		var bottom = grid[index(i, j + 1)];
		var left = grid[index(i - 1, j)];

		if (top && top.group !== cell.group) {
			neighbours.push([cell, top]);
		}

		if (right && right.group !== cell.gorup) {
			neighbours.push([cell, right]);
		}

		if (bottom && bottom.group !== cell.group) {
			neighbours.push([cell, bottom]);
		}

		if (left && left.group !== cell.group) {
			neighbours.push([cell, left]);
		}

	}

	while (linked.length < stacks) {

		do {

			var pair = neighbours[floor(Math.random() * neighbours.length)];

		} while (!linked.includes(pair[0].group) || linked.includes(pair[1].group));

		linked.push(pair[1].group);

		removeWalls(pair[0], pair[1]);
	}
}

function highlight(cell) {
	fill(255, 0, 255);
	rect(cell.i * s, cell.j * s, s, s);
}

function visit(cell) {
	fill(127, 0, 127);
	rect(cell.i * s, cell.j * s, s, s);
}

function goTo(cell) {
	fill(0, 127, 127);
	rect(cell.i * s, cell.j * s, s, s);
}

function possible(cell) {
	fill(0, 127, 255);
	rect(cell.i * s, cell.j * s, s, s);
}

function solution(cell) {
	fill(0, 127, 0);
	rect(cell.i * s, cell.j * s, s, s);
}

function findSolution(a, b) {

	stack = [];
	visited = [];

	current = a;

	for (var i = 0; i < grid.length; i++) {
		grid[i].visited = false;
	}

	console.log(current != b);

	while (current != b && current !== undefined) {

		current.visited = true;

		if (!visited.includes(index(current.i, current.j))) {
			visited.push(index(current.i, current.j));
		}

		var next = randomPathNeighbour(current);

		if (next != undefined) {

			stack.push(current);
			stack.push(next);
			next.visited = true;

			if (!visited.includes(index(next.i, next.j))) {
				visited.push(index(next.i, next.j));
			}

			current = next;

		} else {

			current = stack.pop();

		}

	}

	for (var i = 0; i < visited.length; i++) {
		possible(visited[i]);
	}

	for (var i = 0; i < stack.length; i++) {
		solution(stack[i]);
	}

	for (var i = 0; i < grid.length; i++) {
		show(grid[i]);
	}

}