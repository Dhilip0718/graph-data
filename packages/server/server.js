const neo4j = require('neo4j-driver');
const express = require('express');

const cors = require('cors');

const app = express();

app.use(cors());
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678')); // Replace '12345678' with your Neo4j password

// Helper function to build the hierarchy (Corrected syntax errors)

function buildHierarchy(data) {
  const nodes = {};
  const tree = []; // Initialize tree as an empty array

  // Create nodes
  data.forEach((item) => {
    nodes[item.name] = { ...item, children: [] }; // Initialize children as an empty array
  });

  // Build parent-child relationships
  data.forEach((item) => {
    if (item.parent) {
      nodes[item.parent].children.push(nodes[item.name]);
    } else {
      tree.push(nodes[item.name]);
    }
  });

  return tree;
}

app.get('/api/data', async (req, res) => {
  try {
    const session = driver.session();
    const result = await session.run(
      'MATCH (n) RETURN n.name AS name, n.description AS description, n.parent AS parent',
    );
    const data = result.records.map((record) => ({
      name: record.get('name'),
      description: record.get('description'),
      parent: record.get('parent'),
    }));
    await session.close();

    // Transform data into hierarchical structure
    const hierarchicalData = buildHierarchy(data);

    res.json(hierarchicalData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(3001, () => console.log('Server started on port 3000'));
