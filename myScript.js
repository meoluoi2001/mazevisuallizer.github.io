// Hoang Nguyen
// MAT 385

var maze;
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var curPath = [];

var source = 0; // We will start at the top left, feel free to change
var goal;

var halt = 1;

//This is the main script that controll everything on screen
function randomMaze() {
  curPath = [];
  halt = 1; // We will stop any current algorithm running

  // Get the size and density
  var mazeSize = document.getElementById("mazeSize").value;
  var mazeDensity = document.getElementById("mazeDensity").value;

  // Some content controlling here
  if (mazeSize == "" || parseInt(mazeSize) < 4 || parseInt(mazeSize) > 300) {
    alert("Size is null or unsuportted. Please enter from 4 to 300");
    return;
  }

  if (mazeDensity == "" || parseFloat(mazeDensity) > 1 || parseFloat(mazeDensity < 0)) {
    alert("Density is null or unsuportted. Please enter from 0 to 1");
    return;
    }
  goal = mazeSize * mazeSize - 1; // We will set the bottom right corner as goal

  // We create a maze then draw it
  maze = new Maze(parseInt(mazeSize), parseFloat(mazeDensity));
  maze.generateRandomMaze();
  drawMaze();
}

// This will sovle the maze based on the algorithm chosen
function solveMaze() {
  if (halt == 0) {
    alert("Program is running, wait until finished");
    return;
  }
  halt = 0; // Stop the halt, allow the while loop to run
  var al = document.getElementById("algorithm").value;
  if (maze == null) {
    // Maze is null, user hadn't generate yet
    alert("Maze is not initialized.");
    return;
  }
  if (al == "dj") {
    dijkstraAlgorithm();
  }
  if (al == "as") {
    aStar();
  }
  if (al == "custom") {
    customAlgorithm();
  }
}


// This function will run all the algorithm, compare the runtime
//  We will use the function with while loop, not the interval one
function testing() {
  var p = document.getElementById("testResult");
  p.innerHTML = "";
  if (maze == null) {
    // Maze is null, user hadn't generate yet
    alert("Maze is not initialized.");
    return;
  }

  if (document.getElementById("random").checked == false) {
    alert("The maze is created by A Star, the result is biased. Please check random for total unbiased result.");
  }

  curPath = [];
  var time = Date.now();
  dijkstraAlgorithmW();
  var timeCost = Date.now() - time;
  // Add the result to P
  p.innerHTML = p.innerHTML.concat('Dijkstra Algorithm take ' + timeCost + ' ms.');
  curPath = [];
  var time = Date.now();
  aStarW();
  var timeCost = Date.now() - time;
  // Add the result to P
  p.innerHTML = p.innerHTML.concat('\nA Star Algorithm take ' + timeCost + ' ms.');

  curPath = [];
  var time = Date.now();
  customAlgorithmW();
  var timeCost = Date.now() - time;
  // Add the result to P
  p.innerHTML = p.innerHTML.concat("\nCustom Algorithm take " + timeCost + " ms.\n");
}

// This function is customizable, after sovling the maze
//  copy the path to curPath and call drawMaze() to draw
// We will also have 2 function for this, one for animation, one for time-test
function customAlgorithm() {
  return;
}

function customAlgorithmW() {
  return;
}

// A Star is just Dijkstra's Algorithm but instead of the smallest dist[]
//  it will evaluate based on dist[i] + h(i)
//  where h is an educated guess how close are we to the goal

// For simplicity, I use the geometric distance between the current point and goal
//  Which mean, at any point of time, the maze's Solver will try to get as close to goal
//  as posible.

// This also use Interval for animation, a different version for time testing is below
function aStar() {
  var dist = [];    // Shortest distance from goal to node i as we know
  var prev = [];    // prev[n] is the cheapest previous path to get to n
  var fScore = [];  // This is an educated guess which node is closer to goal

  var Q = [source]; // We will evaluate from the starting node

  // Then we initialize the dist, prev and fScore table
  for (let i = 0; i < maze.mazeArray.length; i++) {
    dist[i] = Infinity;
    prev[i] = null;
    fScore[i] = Infinity;
  }

  dist[source] = 0;
  fScore[source] = heuristic(source);

  // This is the while loop, breaked to interval
  var outer = setInterval(function() {
    if (Q.length == 0 || halt == 1) {
      // Halt is to make sure the program stop when there is an interupt
      halt = 1;
      clearInterval(outer);

    }
    else {

      // We will find the node with the smallest fSore
      var current = -1;
      var min = Infinity;

      // The only different between A* and bruteforce is it take the min of fSCore
      for (let i = 0; i < Q.length; i++) {
        if (min > fScore[Q[i]]) {
          min = fScore[Q[i]];
          current = Q[i];
        }
      }
      // We will draw the path from Source to the current node that we are looking at
      pathBuilding(prev, current);
      drawMaze();

      // Current == goal -> we have found the path to goal (not the smallest)
      if (current == goal) {
        halt = 1;
        clearInterval(outer);
      }

      // Pop the current node out of Q
      Q.splice(Q.indexOf(current), 1);

      // We get all the neighbor of current
      v = maze.getNeighborIndex(current);

      // Then we check for any change in the dist and fScore
      for (let i = 0; i < v.length; i++) {
        var alt = dist[current] + 1; // Lenth between all node is always 1 in maze
        var curItem = v[i];
        if (alt < dist[curItem]) {
          // alt < dis[curItem] -> we have found a more optimal way to get to curItem
          dist[curItem] = alt;
          prev[curItem] = current;
          fScore[curItem] = dist[curItem] + heuristic(curItem);

          // the item that need to be evaluate again is not in Q -> push it in
          if (Q.indexOf(curItem) == -1) {
            Q.push(curItem);
          }
        }
      }
    }
  }, parseInt(document.getElementById("interval").value));
}

// A Star using while loop, no more time between interval -> used for time test
function aStarW() {
  var dist = [];
  var prev = [];
  var fScore = [];

  var Q = [source];

  for (let i = 0; i < maze.mazeArray.length; i++) {
    dist[i] = Infinity;
    prev[i] = null;
    fScore[i] = Infinity;
  }

  dist[source] = 0;
  fScore[source] = heuristic(0);

  while (Q.length != 0) {
    var current = -1;
    var min = Infinity;

    for (let i = 0; i < Q.length; i++) {
      if (min > fScore[Q[i]]) {
        min = fScore[Q[i]];
        current = Q[i];
      }
    }
    if (current == goal) {
      pathBuilding(prev, current);
    }

    Q.splice(Q.indexOf(current), 1);
    v = maze.getNeighborIndex(current);
    for (let i = 0; i < v.length; i++) {
      var alt = dist[current] + 1;
      var curItem = v[i];
      if (alt < dist[curItem]) {
        dist[curItem] = alt;
        prev[curItem] = current;
        fScore[curItem] = dist[curItem] + heuristic(curItem);
        if (Q.indexOf(curItem) == -1) {
          Q.push(curItem)
        }
      }
    }
  }
}

// This funtion estimate the cost from n to goal
//   Here we just use the geomatric distance between goal and n
function heuristic(n) {
  return distance(n, goal);
}

// This will calculate the distance between two grid of index x and y
function distance(x, y) {
  posN = maze.mazeIndex(x); // Pos from index
  posG = maze.mazeIndex(y);

  return Math.sqrt(Math.pow(posN[0] - posG[0], 2) + Math.pow(posN[1] - posG[1], 2));
}

// This function will draw the path between source and target using prev from main algorithm
function pathBuilding(prev, target) {
  curPath = [];   // We need to clear the current path
  var u = target;

  // Enter loop if the target has a prev Node that lead to it
  if (prev[u] != null && u == target) {
    // Loop until we reached the source, which has prev == null
    while (prev[u] != null) {
      curPath.unshift(u); // Move u to the begining of the path
      u = prev[u];        // Then we continue at the next Node, which is the prev
    }
  }

  // The while loop terminate at u = source, thus source has not been added to path yet
  curPath.unshift(source);
}

// This is Dijkstra's Algorithm, which is just bruteforcing the way to goal
//   Here instead of using the while loop, I have to use interval
//   Since browser will only draw the canvas once a loop has done, so it only draw when while loop has ended
//   We want some animations, so we will need to break each while loop into interval
//   after each while loop, it will redraw the current lines
//   so this animation does not show how fast an Algorithm is, just how fast it could
//   draw on canvas

// The version for time testing is below.
function dijkstraAlgorithm() {
  var dist = []; // Shortest distance from goal to node i as we know
  var prev = []; // prev[n] is the cheapest previous path to get to n

  var Q = [];    // We will evaluate every posible nodes

  // Initialize the tables
  for (let i = 0; i < maze.mazeArray.length; i++) {
    dist[i] = Infinity;
    prev[i] = null;
    Q.push(i);
  }

  dist[source] = 0;

  // The While loop
  var outer = setInterval(function() {
    if (Q.length == 0 || halt == 1) {
      halt = 1;
      // Halt is to make sure the program stop when there is an interupt
      clearInterval(outer);
    }
    else {
      // We will find the node in Q the smallest dist[]
      var minIndex = -1;
      var min = Infinity;

      for (let i = 0; i < Q.length; i++) {
        if (min > dist[Q[i]]) {
          min = dist[Q[i]];
          minIndex = Q[i];
        }
      }

      // Pop that out of Q
      Q.splice(Q.indexOf(minIndex), 1);

      // Get neighbor
      v = maze.getNeighborIndex(minIndex);
      // Check if any neighbors has a more optimal dist
      for (let i = 0; i < v.length; i++) {
        var alt = dist[minIndex] + 1; // Lenth between all node is always 1 in maze
        var curItem = v[i];
        if (alt < dist[curItem]) {
          dist[curItem] = alt;
          prev[curItem] = minIndex;
        }
      }
      // Draw things out for animation
      pathBuilding(prev, minIndex);
      drawMaze()
      if (minIndex == goal) {
        halt = 1;
        clearInterval(outer);
      }

    }
  }, parseInt(document.getElementById("interval").value));
}

// dijkstraAlgorithm using while loop, no more time between interval -> used for time test
function dijkstraAlgorithmW() {
  var dist = []; // Shortest distance from goal to node i as we know
  var prev = []; // prev[n] is the cheapest previous path to get to n

  var Q = [];    // We will evaluate every posible nodes

  // Initialize the tables
  for (let i = 0; i < maze.mazeArray.length; i++) {
    dist[i] = Infinity;
    prev[i] = null;
    Q.push(i);
  }

  dist[source] = 0;

  // The While loop
  while (Q.length != 0) {
    // We will find the node in Q the smallest dist[]
    var minIndex = -1;
    var min = Infinity;

    for (let i = 0; i < Q.length; i++) {
      if (min > dist[Q[i]]) {
        min = dist[Q[i]];
        minIndex = Q[i];
      }
    }

    // Pop that out of Q
    Q.splice(Q.indexOf(minIndex), 1);

    // Get neighbor
    v = maze.getNeighborIndex(minIndex);
    // Check if any neighbors has a more optimal dist
    for (let i = 0; i < v.length; i++) {
      var alt = dist[minIndex] + 1; // Lenth between all node is always 1 in maze
      var curItem = v[i];
      if (alt < dist[curItem]) {
        dist[curItem] = alt;
        prev[curItem] = minIndex;
      }
    }
    if (minIndex == goal) {
      break;
      }
    }
}

// This function will generate a random number from 0 to upperLimit
function rand(upperLimit) {
  return Math.floor(Math.random() * upperLimit);
}

// This function will draw the Maze and the path in curPath
function drawMaze() {
  // Draw the maze
  var height = c.height;
  var rectHeight = height / maze.size;

  // We first clean the canvas
  ctx.clearRect(0, 0, height, height);
  for (let x = 0; x < maze.size; x ++) {
    for (let y = 0; y < maze.size; y ++) {
      var index = maze.maze(x, y);
    //  ctx.font = '14px serif';
    //  ctx.fillText(index,x * rectHeight + 10 , y * rectHeight + 10);
      // If the current is blocked, paint it black
      if (maze.mazeArray[index] == 1){
        ctx.fillStyle = "#000000"; // Fill the goal and source with whatever color that is
        ctx.fillRect(x * rectHeight , y * rectHeight, rectHeight, rectHeight);
      }
      if (index == source || index == goal) {
        ctx.fillStyle = "#ff0000"; // Fill the goal and source with whatever color that is
        ctx.fillRect(x * rectHeight , y * rectHeight, rectHeight, rectHeight);
      }
    }
  }
  // Then draw the current path
  var offset = rectHeight / 2;
  ctx.beginPath();

  for (let i = 0; i < curPath.length; i++) {
    var curItem = curPath[i];
    var pos = maze.mazeIndex(curItem);
    ctx.lineTo(pos[0] * rectHeight + offset, pos[1] * rectHeight + offset);
  }
    ctx.lineWidth = rectHeight / 4;
    ctx.strokeStyle = '#ff0000';
    ctx.lineCap = "round";
    ctx.stroke();

}

// This is the Maze part
//  Maze is presented as a fake 2D array, where 1 is passable block, 0 is not
//  TODO: There will be a matrix for connection between each block
class Maze {
  constructor(size, density) {
    this.size = size;
    this.density = density;
    // Initialize the maze
    //  Create an array size = this.size ** 2

    // Initialize all block as 0
    this.mazeArray = new Array(this.size * this.size).fill(0);
    }
  // This funtion will generate a random maze size X by X
  generateRandomMaze() {

    // True Path is a random path created for maze generate to make sure there is a solution
    // Visited is all the node that true path has reached, used to make sure when
    //  backtracking, it won't head to the deadlock forever
    var truePath = [source];
    var visited = [source];

    // If random is checked, then Completly randomize the maze, skipping the path creating process
    if (document.getElementById("random").checked == false) {
      // We specify the longest length of the True path here
      //  I use the avg of the longest path possible (n^2) and the smallest (n * 2)
      var sizePath = this.size * this.size / 2 + this.size;

      // While truePath had not reached goal
      while (truePath.indexOf(goal) == -1) {
        // we take the last Node and find all neighbor
        var current = truePath[truePath.length - 1];
        var v = maze.getNeighborIndex(current);

        // Then we will add all node with higher index than average to the neighbor
        //   list, thus making the path more likely to head toward the goal

        // v.reduce((a,b) => a + b)) return the sum of array v
        v = v.concat(v.filter(x => x > v.reduce((a,b) => a + b) / v.length));

        // I.E if node 10 has neighbor list of (0, 9, 11, 20), then 11 and 20 will be
        //  duplicated since they are closer to goal which is bottom right edge in this example

        // We reached a deadlock here, since all node possible had been traveled to
        //  we will take a step backward, and not adding the last node to path every again
        if (v.every(val => visited.includes(val))) {
          truePath.pop();
        }
        else {
          // We will chose a random element from array of neighbor
          //  since we duplicate the node nearer to the end, it will more likely to be picked
          var  rando = v[Math.floor(Math.random() * v.length)];

          // We will chose until we find a node not in truePath
          while (truePath.indexOf(rando) >= 0) {
            rando = v[Math.floor(Math.random() * v.length)];
          }

          // Add to visited and truePath
          truePath.push(rando);
          visited.push(rando);
        }

        // The length of truePath had exceeded the limit, we will clean the truePath
        if (truePath.length > sizePath) {
          var truePath = [source];
          var visited = [source];
        }
      }


      if (this.density >= 0.3) {
        // Since the path we created will be very messy,
        //  and is very noticable at high density
        //  we will need to
        //  create a new path from the messed path
        // We will fill the maze with blocked node, leaving only the truePath
        //  as passable maze
        for (let x = 0; x < this.size; x++) {
          for (let y = 0; y < this.size; y++) {
            if (Math.random() < this.density) {
              var index = this.maze(x, y);
              if (truePath.indexOf(index) >= 0) {
                continue;
              }
            this.mazeArray[index] = 1;
            }
          }
        }
        aStarW();
        this.mazeArray = new Array(this.size * this.size).fill(0); // We will reset the array
        truePath = curPath.slice();         // Then coppy the path from the aStar to true path
        curPath = []; // Reset the path
      }
    }

    // Then we generate the maze again
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (Math.random() < this.density) {
          var index = this.maze(x, y);
          if (truePath.indexOf(index) >= 0) {
            continue;
          }
          this.mazeArray[index] = 1;
        }
      }
    }
    return;
  }

  // Return the index of the item in the maze from x and y
  maze(x, y) {
    return this.size *  x +  y;
  }

  // Return x and y from the index of item in array
  mazeIndex(index) {
    return [parseInt((index - index % this.size) / this.size) , index % this.size];
  }

  getNeighborIndex(index) {
    var neighborIndex = [];
    for (let x = -1; x < 2; x ++) {
      // for x in -1, 0, 1
      for (let y = -1; y < 2; y ++) {
        // for y in -1, 0, 1
        if ((x == 0 && y != 0) || (x != 0 && y == 0)) {
          if (index % this.size == 0 && y == -1) {
            continue;
          }
          if ((index + 1) % this.size == 0 && y == 1) {
            continue;
          }
          // We can't move diagonally,
          //  so we only check pair of x, y which has only one of them being 0
          var curIndex = index + x * this. size + y;
          if (curIndex < 0 || curIndex >= this.mazeArray.length) {
            continue;
          }
          if (this.mazeArray[curIndex] == 0) {
            neighborIndex.push(curIndex);
          }
        }
      }
    }
    return neighborIndex;
  }

  getNeighbor(x, y) {
    var index = this.maze(x, y);
    var neighborIndex = this.getNeighborIndex(index);
    var neighborPos = [];
    for (let i = 0; i < neighborIndex.length; i ++) {
      neighborPos.push(this.mazeIndex(neighborIndex[i]));
    }
    return neighborPos;
  }
}
