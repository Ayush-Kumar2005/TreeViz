let highlightedNodes = [];

class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  updateHeight(node) {
    node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  rotateRight(y) {
    highlightedNodes = [y.value, y.left.value];
    setStatus("Performing Right Rotation...");
    const x = y.left;
    const t2 = x.right;
    x.right = y;
    y.left = t2;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  rotateLeft(x) {
    highlightedNodes = [x.value, x.right.value];
    setStatus("Performing Left Rotation...");
    const y = x.right;
    const t2 = y.left;
    y.left = x;
    x.right = t2;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  insert(value) {
    this.root = this._insert(this.root, value);
  }

  _insert(node, value) {
    if (!node) return new AVLNode(value);
    if (value < node.value) node.left = this._insert(node.left, value);
    else if (value > node.value) node.right = this._insert(node.right, value);
    else return node;

    this.updateHeight(node);
    const balance = this.getBalance(node);

    if (balance > 1 && value < node.left.value) return this.rotateRight(node);
    if (balance < -1 && value > node.right.value) return this.rotateLeft(node);
    if (balance > 1 && value > node.left.value) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    if (balance < -1 && value < node.right.value) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  minValueNode(node) {
    let current = node;
    while (current.left) current = current.left;
    return current;
  }

  delete(value) {
    this.root = this._delete(this.root, value);
  }

  _delete(node, value) {
    if (!node) return node;

    if (value < node.value) node.left = this._delete(node.left, value);
    else if (value > node.value) node.right = this._delete(node.right, value);
    else {
      if (!node.left || !node.right) {
        node = node.left || node.right;
      } else {
        const temp = this.minValueNode(node.right);
        node.value = temp.value;
        node.right = this._delete(node.right, temp.value);
      }
    }

    if (!node) return node;
    this.updateHeight(node);
    const balance = this.getBalance(node);

    if (balance > 1 && this.getBalance(node.left) >= 0) return this.rotateRight(node);
    if (balance > 1 && this.getBalance(node.left) < 0) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    if (balance < -1 && this.getBalance(node.right) <= 0) return this.rotateLeft(node);
    if (balance < -1 && this.getBalance(node.right) > 0) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  traverse(type) {
    const result = [];
    const walk = (node) => {
      if (!node) return;
      if (type === "pre") result.push(node.value);
      walk(node.left);
      if (type === "in") result.push(node.value);
      walk(node.right);
      if (type === "post") result.push(node.value);
    };
    if (type === "level") {
      if (!this.root) return result;
      const queue = [this.root];
      while (queue.length) {
        const n = queue.shift();
        result.push(n.value);
        if (n.left) queue.push(n.left);
        if (n.right) queue.push(n.right);
      }
      return result;
    }
    walk(this.root);
    return result;
  }
}

const tree = new AVLTree();

const valueInput = document.getElementById("valueInput");
const statusText = document.getElementById("statusText");
const traversalText = document.getElementById("traversalText");
const svg = document.getElementById("treeSvg");

function setStatus(text) {
  statusText.textContent = text;
}

function clearHighlight() {
    setTimeout(() => {
        highlightedNodes = [];
        drawTree();
    }, 1000);
}

function drawTree() {
  svg.innerHTML = "";
  const root = tree.root;
  if (!root) return;

  const width = 1200;
  const levelGap = 90;
  const radius = 23;
  const nodes = [];
  const edges = [];

  function layout(node, depth, minX, maxX, parent = null) {
    if (!node) return;

    const x = (minX + maxX) / 2;
    const y = 55 + depth * levelGap;

    nodes.push({ node, x, y, parent });

    if (parent) {
      edges.push({
        from: parent,
        to: { x, y }
      });
    }

    layout(node.left, depth + 1, minX, x, { x, y });
    layout(node.right, depth + 1, x, maxX, { x, y });
  }

  layout(root, 0, 20, width - 20);

  edges.forEach(edge => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", "edge");
    line.setAttribute("x1", edge.from.x);
    line.setAttribute("y1", edge.from.y);
    line.setAttribute("x2", edge.to.x);
    line.setAttribute("y2", edge.to.y);
    svg.appendChild(line);
  });

  nodes.forEach(({ node, x, y }) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute(
      "class",
      highlightedNodes.includes(node.value) ? "node highlight" : "node"
    );

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", radius);
    group.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.textContent = node.value;
    group.appendChild(text);

    svg.appendChild(group);
  });
}

function getInputValue() {
  const value = Number(valueInput.value);

  if (Number.isNaN(value)) return null;

  return value;
}

function runTraversal(type, label) {
  const output = tree.traverse(type);

  traversalText.textContent =
    output.length ? output.join(" → ") : "-";

  setStatus(`${label} traversal completed.`);
}

document.getElementById("insertBtn").addEventListener("click", () => {
  const value = getInputValue();

  if (value === null) {
    setStatus("Please enter a valid number.");
    return;
  }

  tree.insert(value);
  drawTree();

  if (highlightedNodes.length > 0) {
      clearHighlight();
  } else {
      setStatus(`Inserted ${value}.`);
  }
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  const value = getInputValue();

  if (value === null) {
    setStatus("Please enter a valid number.");
    return;
  }

  tree.delete(value);
  drawTree();

  if (highlightedNodes.length > 0) {
      clearHighlight();
  } else {
      setStatus(`Deleted ${value}.`);
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  tree.root = null;
  drawTree();
  traversalText.textContent = "-";
  setStatus("Tree cleared.");
});

document.getElementById("randomBtn").addEventListener("click", () => {
  const randomValue = Math.floor(Math.random() * 100);

  tree.insert(randomValue);
  drawTree();

  if (highlightedNodes.length > 0) {
      clearHighlight();
  } else {
      setStatus(`Inserted random value ${randomValue}.`);
  }
});

document.getElementById("inorderBtn").addEventListener("click", () =>
  runTraversal("in", "Inorder")
);

document.getElementById("preorderBtn").addEventListener("click", () =>
  runTraversal("pre", "Preorder")
);

document.getElementById("postorderBtn").addEventListener("click", () =>
  runTraversal("post", "Postorder")
);

document.getElementById("levelorderBtn").addEventListener("click", () =>
  runTraversal("level", "Level Order")
);

drawTree();