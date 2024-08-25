const TREE_ANGLE_VARIANCE = 10;
const TREE_ANGLE_RATE = 0.01;
const TREE_CHROMA_VARIANCE = 25;
const TREE_CHROMA_RATE = 0.01;
const FOREST_TREE_COUNT = 100;
const FOREST_TILT = 20;
const FOREST_TILT_RATE = 0.01;
const FOREST_TILT_VARIANCE = 10;
const FOREST_TILT_VARIANCE_RATE = 0.005;
const FOREST_MAX_START_GENERATION = 3;
const FOREST_MAX_GENERATION = 6;
const TREE_SPAWN_OFFSET = 500;
const TERRAIN_CHROMA_VARIANCE = 10;
const TERRAIN_CHROMA_RATE = 0.01;
const TERRAIN_DISTANCE = 200;
const TERRAIN_SKEWX = 0.5;
const TERRAIN_SKEWY = 0.1;
const MIC_TRESHOLD = 0.1;
const MIC_MULTIPLIER = 4;
const MIC_COOLDOWN = 1;

class Utils {	
	static randomInt (...args) {
		let min = 0, max;
		if (args.length === 1) {
			[max] = args;
		} else {
			[min, max] = args;
		}
		return Math.floor(Math.random() * (max - min)) + min;
	}
	
	static randomNoise(...args) {
		let min = 0, max = 1, scale = 0.005;
		if (args.length === 1) {
			[max] = args;
		} else if (args.length === 2) {
			[min, max] = args;
		} else {
			[min, max, scale] = args;
		}
		
		let origin = p.createVector(p.random(-100000, 100000), p.random(-100000, 100000), p.random(-100000, 100000));

		return (...coords) => {
			let safeCoords = [...coords];
			safeCoords[safeCoords.length - 1] *= scale;
			let noiseCoords = p.createVector(...safeCoords).add(origin);
			return p.map(p.noise(noiseCoords.x, noiseCoords.y, noiseCoords.z), 0, 1, min, max);
		}
	}
}

class LSystem {
	static selectRule(rules) {
		return Array.isArray(rules) ? rules[Utils.randomInt(rules.length)] : rules;
	}
	
	static generate({axiom, rules}) {
    let result = '';
    for (let t of axiom) result += t in rules ? LSystem.selectRule(rules[t]) : t;
    return result;
	}
	
	static generateN(n, {axiom, rules}) {
		let result = axiom;
		for (let i = 0; i < n; i++) result = LSystem.generate({axiom: result, rules});
		return result;
	}
}

class Tree {
	constructor({axiom, rules, x, y, distance = 10, angle = 20, bushyness = 0, rate = 0.01, ttl = 3600, g = 1}) {
		this.axiom = axiom;
		this.rules = rules;
		this.n = 1; // generation
		this.g = g; // metageneration
		this.distance = distance; // draw unit
		this.angle = angle; // angle unit
		this.bushyness = p.map(bushyness, 0, 100, 100, 10); // bushyness
		this.rate = rate; // growth rate
		this.x = x;
		this.y = y;
		this.ttl = ttl;
		this._angleVariance = Utils.randomNoise(-TREE_ANGLE_VARIANCE/2, TREE_ANGLE_VARIANCE/2, TREE_ANGLE_RATE); // angle variance
		this._chromaVariance = Utils.randomNoise(0, TREE_CHROMA_VARIANCE, TREE_CHROMA_RATE); // chromatic variance
		this._cache = undefined; // render cache
	}
	
	generateNext() {
		this.axiom = LSystem.generate(this);
		this.n++;
	}
	
	generateNextN(n) {
		this.axiom = LSystem.generateN(n, this);
		this.n += n;
	}
	
	grow() {
		this.ttl--;
		if (this.n < FOREST_MAX_GENERATION && p.random() < this.rate) this.generateNext();
	}
	
	static RLE(axiom) {
		let result = '';
		for (let i = 0; i < axiom.length; i++) {
			if (axiom[i] === 'F') {
				let c = 1;
				while (axiom[i + c] === 'F') c++;
				result += String.fromCodePoint('~'.codePointAt(0) + c - 1);
				
				i += c - 1;
			} else if (axiom[i] === 'X') {
				result += '~';
			} else {
				result += axiom[i];
			}
		}
		return result;
	}
	
	static makeLines({axiom, n, distance, angle, bushyness}) {
    let rat = {x: 0, y: 0, angle: -90};
    let lines = [];
    let stack = [];
		
		axiom = Tree.RLE(axiom);
    for (let t of axiom) {
			let nx, ny, c;
			switch (t) {
				case '-':
					rat.angle -= angle * 1.5 * Math.exp(stack.length/8);
					break;
				case '+':
					rat.angle += angle * 1.5 * Math.exp(stack.length/8);
					break;
				case '[':
					stack.push({...rat});
					break;
				case ']':
					Object.assign(rat, stack.pop());
					break;
				case 'X':
				case 'F':
					nx = rat.x + distance * Math.cos(rat.angle/180*Math.PI);
					ny = rat.y + distance * Math.sin(rat.angle/180*Math.PI);
					lines.push([rat.x, rat.y, nx, ny]);
					rat.x = nx;
					rat.y = ny;
					break;
				default:
					c = t.codePointAt(0) - '~'.codePointAt(0) + 1;
					nx = rat.x + distance * c * Math.exp(-c/bushyness) * Math.cos(rat.angle/180*Math.PI);
					ny = rat.y + distance * c * Math.exp(-c/bushyness) * Math.sin(rat.angle/180*Math.PI);
					lines.push([rat.x, rat.y, nx, ny]);
					rat.x = nx;
					rat.y = ny;
					break;
			}
    }
    return lines;
	}
	
	// Maybe use ttl to stylize the tree?
	// Maybe use g to stylize the tree?
	render() {
    let chromaOffset = this._chromaVariance(p.frameCount);
		let angle = this.angle + this._angleVariance(p.frameCount);
		
		let n, lines;
		if (this._cache) {
			[n, lines] = this._cache;
		}
		if (this.n !== n) {
			lines = Tree.makeLines({...this, angle});
			this._cache = [this.n, lines];
		}
		
		p.strokeWeight(10);

		// Right now we cannot change the channels to full RGB, otherwise artifacts will appear due to ADD.
		// The solution would be to render each channel to a Graphic in BLEND mode, then render the Graphic itself in ADD mode.
		// Also... right now the chroma offset is on the X axis. We could make this be a different vector that's also moving around...
		p.blendMode(p.ADD);
		p.push();
		p.stroke(255, 0, 0);
		for (let l of lines) {
      p.line(...l);
		}
		p.pop();
		p.push();
		p.translate(chromaOffset, 0);
		p.stroke(0, 255, 0);
		for (let l of lines) {
      p.line(...l);
		}
		p.pop();
		p.push();
		p.translate(2 * chromaOffset, 0);
		p.stroke(0, 0, 255);
		for (let l of lines) {
      p.line(...l);
		}
		p.pop();		
	}
	
	static makeTree(args = {}) {
		return new Tree({
			axiom: 'X',
			rules: {
				'X': ['F[+X]F[-X]+X', 'F[+F]F[-X]+X', 'F[+X]F[-F]+X', 'F[+X]F[-X]+F', 'F[-X]F[+X]-X', 'F[-F]F[+X]-X', 'F[-X]F[+F]-X', 'F[-X]F[+X]-F'],
				'F': 'FF'
			},
			x: p.random(-2*TREE_SPAWN_OFFSET, clientWidth), y: p.random(-TREE_SPAWN_OFFSET, clientHeight), // This distribution should not be uniform, we might want more trees in the background than foregraound
			angle: p.random(18, 22),
			rate: p.random(0.001, 0.002),
			ttl: Utils.randomInt(1800, 3600), // I might want this to scale as the tree is further into the background
			bushyness: p.random(1, 100),
			...args
		});
	}
}

class Terrain {
	constructor({distance = 200, x = 0, y = 0, skewX = 0.5, skewY = 0.1, variance = 0.2}) {
		this.distance = distance;
		this.x = x;
		this.y = y;
		this.skewX = skewX;
		this.skewY = skewY;
		this._theta = p.atan2((1 - skewY), skewX);
		this._distanceX = distance;
		this._distanceY = distance * this._theta / 90;
		this._nx = Math.ceil(clientWidth / this._distanceX);
		this._ny = Math.ceil(clientHeight / this._distanceY);
		this._x = x;
		this._y = y;
		
		let varianceRange = distance * variance;
		this._xVariance = Utils.randomNoise(-varianceRange, varianceRange, 0.005);
		this._yVariance = Utils.randomNoise(-varianceRange, varianceRange, 0.005);
		this._chromaVariance = Utils.randomNoise(0, TERRAIN_CHROMA_VARIANCE, TERRAIN_CHROMA_RATE);
	}
	
	render() {
		let chromaOffset = this._chromaVariance(p.frameCount);
		
		p.strokeWeight(1);
		p.noFill();
		p.blendMode(p.ADD);
		
		p.push();
		p.stroke(255, 0, 0);
		for (let j = -Math.ceil(this._ny / 2); j < Math.ceil(this._ny * 1.5); j++) {
			p.beginShape(p.QUAD_STRIP);
			for (let i = -Math.ceil(this._nx / 2); i < Math.ceil(this._nx * 1.5); i++) {
				let x1 = i * this._distanceX - this.skewX * this._distanceX * j + this.x;
				let y1 = j * this._distanceY + this.skewY * this._distanceY * i + this.y;
				p.vertex(x1 + this._xVariance((x1 - this._x) * 0.005, (y1 - this._y) * 0.005), y1 + this._yVariance((x1 - this._x) * 0.005, (y1 - this._y) * 0.005));
				let x2 = i * this._distanceX - this.skewX * this._distanceX * (j + 1) + this.x;
				let y2 = (j + 1) * this._distanceY + this.skewY * this._distanceY * i + this.y;
				p.vertex(x2 + this._xVariance((x2 - this._x) * 0.005, (y2 - this._y) * 0.005), y2 + this._yVariance((x2 - this._x) * 0.005, (y2 - this._y) * 0.005));
			}
			p.endShape();
		}
    p.pop();
		p.push();
		p.stroke(0, 255, 0);
		p.translate(chromaOffset, 0);
		for (let j = -Math.ceil(this._ny / 2); j < Math.ceil(this._ny * 1.5); j++) {
			p.beginShape(p.QUAD_STRIP);
			for (let i = -Math.ceil(this._nx / 2); i < Math.ceil(this._nx * 1.5); i++) {
				let x1 = i * this._distanceX - this.skewX * this._distanceX * j + this.x;
				let y1 = j * this._distanceY + this.skewY * this._distanceY * i + this.y;
				p.vertex(x1 + this._xVariance((x1 - this._x) * 0.005, (y1 - this._y) * 0.005), y1 + this._yVariance((x1 - this._x) * 0.005, (y1 - this._y) * 0.005));
				let x2 = i * this._distanceX - this.skewX * this._distanceX * (j + 1) + this.x;
				let y2 = (j + 1) * this._distanceY + this.skewY * this._distanceY * i + this.y;
				p.vertex(x2 + this._xVariance((x2 - this._x) * 0.005, (y2 - this._y) * 0.005), y2 + this._yVariance((x2 - this._x) * 0.005, (y2 - this._y) * 0.005));
			}
			p.endShape();
		}
    p.pop();
		p.push();
		p.stroke(0, 0, 255);
		p.translate(2 * chromaOffset, 0);
		for (let j = -Math.ceil(this._ny / 2); j < Math.ceil(this._ny * 1.5); j++) {
			p.beginShape(p.QUAD_STRIP);
			for (let i = -Math.ceil(this._nx / 2); i < Math.ceil(this._nx * 1.5); i++) {
				let x1 = i * this._distanceX - this.skewX * this._distanceX * j + this.x;
				let y1 = j * this._distanceY + this.skewY * this._distanceY * i + this.y;
				p.vertex(x1 + this._xVariance((x1 - this._x) * 0.005, (y1 - this._y) * 0.005), y1 + this._yVariance((x1 - this._x) * 0.005, (y1 - this._y) * 0.005));
				let x2 = i * this._distanceX - this.skewX * this._distanceX * (j + 1) + this.x;
				let y2 = (j + 1) * this._distanceY + this.skewY * this._distanceY * i + this.y;
				p.vertex(x2 + this._xVariance((x2 - this._x) * 0.005, (y2 - this._y) * 0.005), y2 + this._yVariance((x2 - this._x) * 0.005, (y2 - this._y) * 0.005));
			}
			p.endShape();
		}
    p.pop();
		
		if (this.x > this._distanceX) {
			this.x -= this._distanceX;
			this.y -= this.skewY * this._distanceY;
		}
		if (this.x < -this._distanceX) {
			this.x += this._distanceX;
			this.y += this.skewY * this._distanceY;
		}
		if (this.y > this._distanceY) {
			this.y -= this._distanceY;
			this.x += this.skewX * this._distanceX;
		}
		if (this.y < -this._distanceY) {
			this.y += this._distanceY;
			this.x -= this.skewX * this._distanceX;
		}
	}
	
	static makeTerrain(args = {}) {
		return new Terrain({
			...args
		});
	}
}

let terrain;
let forest = [];
let mic;
let micCooldown = 0;
let _wind;
let _windVariance;

p.setup = () => {
	p.createCanvas(clientWidth, clientHeight);
	p.setFrameRate(60);
	p.colorMode(p.RGB);
	p.angleMode(p.DEGREES);
	p.background(0);
	
	mic = new p5.AudioIn();
  mic.start();
	
	for (let i = 0; i < FOREST_TREE_COUNT; i++) {
		let tree = Tree.makeTree();
		tree.generateNextN(Utils.randomInt(1, FOREST_MAX_START_GENERATION));
		forest.push(tree);
	}
	
	_wind = Utils.randomNoise(-FOREST_TILT, FOREST_TILT, FOREST_TILT_RATE); // fake wind
	_windVariance = Utils.randomNoise(-FOREST_TILT_VARIANCE/2, FOREST_TILT_VARIANCE/2, FOREST_TILT_VARIANCE_RATE); // individual variance
	
	terrain = Terrain.makeTerrain({distance: TERRAIN_DISTANCE, skewX: TERRAIN_SKEWX, skewY: TERRAIN_SKEWY});
}

p.draw = () => {
	// This ratio is related to the skew ratio
	let vx = 1, vy = 0.5;
	p.blendMode(p.BLEND);
	p.background(0, 0, 0, 40);
	
	terrain.render();
	terrain.x += vx;
	terrain.y += vy;
	// This is lazyness on my part, I should be able to compute and update these and let the user change x and y freely, keeping them untouched
	terrain._x += vx;
	terrain._y += vy;
	
	let wind = _wind(p.frameCount);
	for (let i = 0; i < FOREST_TREE_COUNT; i++) {
		let tree = forest[i];
		
		p.push();
		p.translate(tree.x, tree.y);
		p.rotate(wind + _windVariance(tree.x * 0.01, tree.y * 0.01, p.frameCount)); // Could consider scaling this based on the tree generation, so that larger trees move less
		tree.render();
		p.pop();
		
		tree.grow();
		tree.x += vx;
		tree.y += vy
		
		if (tree.ttl < 0) {
			forest[i] = Tree.makeTree({g: tree.g + 1, rate: random(0.002, 0.002)});
		} else if (tree.x > clientWidth + TREE_SPAWN_OFFSET) {
			forest[i] = Tree.makeTree({age: tree.age, x: -TREE_SPAWN_OFFSET});
			forest[i].y -= TREE_SPAWN_OFFSET/2;
			forest[i].generateNextN(tree.n - 1);
		} else if (tree.y > clientHeight + TREE_SPAWN_OFFSET) {
			forest[i] = Tree.makeTree({age: tree.age, y: 0});
			forest[i].x -= TREE_SPAWN_OFFSET;
			forest[i].generateNextN(tree.n - 1);
		}
	}

	let level = mic.getLevel();
	if (level > MIC_TRESHOLD && micCooldown === 0) {
		for (let tree of forest) {
			if (tree.n < FOREST_MAX_GENERATION) {
				if (p.random() * MIC_MULTIPLIER < level) tree.generateNext();
			} else {
				if (p.random() * MIC_MULTIPLIER < level) tree.ttl = 0;
			}
		}
		micCooldown = MIC_COOLDOWN;
	}
	if (micCooldown > 0) micCooldown--;
}