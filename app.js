let treeData = {
    name: "Root Family",
    children: []
};
let editingNode = null;
const svg = d3.select("#tree-container").append("svg");
const width = 1200;
const height = 600;
let zoom = d3.zoom().on("zoom", handleZoom);

svg.attr("width", width).attr("height", height).call(zoom);

// Sample data
function initTree() {
    treeData.children = [{
        name: "John Doe",
        birth: "1950-01-01",
        death: "",
        gender: "M",
        children: [{
            name: "Jane Doe",
            birth: "1980-05-15",
            death: "",
            gender: "F",
            children: []
        }]
    }];
    updateTree();
}

function addPerson() {
    const person = {
        name: document.getElementById('name').value || "New Person",
        birth: document.getElementById('birth').value,
        death: document.getElementById('death').value,
        gender: document.getElementById('gender').value,
        children: []
    };
    
    // Add to last leaf node
    addToLastLeaf(treeData, person);
    updateTree();
    document.getElementById('name').value = '';
}

function addToLastLeaf(node, person) {
    if (node.children && node.children.length > 0) {
        addToLastLeaf(node.children[node.children.length - 1], person);
    } else {
        node.children = node.children || [];
        node.children.push(person);
    }
}

function updateTree() {
    svg.selectAll("*").remove();
    
    const treeLayout = d3.tree().size([height - 100, width - 200]);
    const root = d3.hierarchy(treeData);
    const treeDataLayout = treeLayout(root);
    
    const linkGenerator = d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x);
    
    // Links
    svg.append("g")
        .selectAll("path")
        .data(treeDataLayout.links())
        .join("path")
        .attr("class", "link")
        .attr("d", linkGenerator);
    
    // Nodes
    const nodes = svg.append("g")
        .selectAll("g")
        .data(treeDataLayout.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .on("click", (event, d) => editNode(d.data));
    
    nodes.append("circle")
        .attr("class", "node")
        .attr("r", 8)
        .attr("fill", d => d.data.gender === "M" ? "#3498db" : "#e74c3c");
    
    nodes.append("text")
        .attr("dy", 4)
        .attr("x", 12)
        .text(d => d.data.name)
        .style("font-size", "12px")
        .style("font-weight", "bold");
    
    nodes.append("text")
        .attr("dy", 16)
        .attr("x", 12)
        .attr("font-size", "10px")
        .text(d => `${d.data.birth || '?'} - ${d.data.death || 'Living'}`);
}

function editNode(data) {
    editingNode = data;
    document.getElementById('editName').value = data.name;
    document.getElementById('editBirth').value = data.birth || '';
    document.getElementById('editDeath').value = data.death || '';
    document.getElementById('editGender').value = data.gender || 'M';
    document.getElementById('editModal').style.display = 'block';
}

function saveEdit() {
    if (editingNode) {
        editingNode.name = document.getElementById('editName').value;
        editingNode.birth = document.getElementById('editBirth').value;
        editingNode.death = document.getElementById('editDeath').value;
        editingNode.gender = document.getElementById('editGender').value;
        updateTree();
    }
    closeModal();
}

function deletePerson() {
    if (editingNode && editingNode.parent) {
        const index = editingNode.parent.children.findIndex(child => child === editingNode);
        editingNode.parent.children.splice(index, 1);
        updateTree();
    }
    closeModal();
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    editingNode = null;
}

function exportTree() {
    const dataStr = JSON.stringify(treeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'familytree.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function clearTree() {
    treeData.children = [];
    updateTree();
}

function handleZoom(event) {
    d3.select("g").attr("transform", event.transform);
}

initTree();
document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) closeModal();
});