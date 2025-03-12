const neo4j = require('neo4j-driver');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Retrieve connection details from environment variables
const NEO4J_URI = process.env.NEO4J_URI || 'neo4j+s://c67feb71.databases.neo4j.io';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'ACCK6rHcPcDSgSJxGHBz9AL45B6FE1NuZw_Ekmlex5g';

function buildHierarchy(data) {
  const nodes = {};
  const tree = [];

  data.forEach((item) => {
    nodes[item.name] = { ...item, children: [] };
  });

  data.forEach((item) => {
    if (item.parent) {
      if (nodes[item.parent]) {
        nodes[item.parent].children.push(nodes[item.name]);
      }
    } else {
      tree.push(nodes[item.name]);
    }
  });

  return tree;
}
(async () => {
  let driver;

  try {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
    const serverInfo = await driver.getServerInfo();
    console.log('Connection established');
    console.log(serverInfo);

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

        console.log('The data is fetched from the DB', data);
        await session.close();

        const hierarchicalData = buildHierarchy(data);
        console.log('The data is fetched from the DB', hierarchicalData);
        res.json(hierarchicalData);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    });

    app.listen(3000, () => console.log('Server started on port 3000'));
  } catch (err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
  }
})();
