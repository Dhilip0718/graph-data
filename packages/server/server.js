const cors = require('cors');
const neo4j = require('neo4j-driver');
const express = require('express');

require('dotenv').config();

const app = express();
app.use(cors());

/**
 * The Config details for connecting to the Neo4j database.
 *
 * This value is retrieved from the environment variable `NEO4J_PASSWORD`.
 * If the environment variable is not set, a default password is used.
 *
 */
const NEO4J_URI = process.env.NEO4J_URI || 'neo4j+s://c67feb71.databases.neo4j.io';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'ACCK6rHcPcDSgSJxGHBz9AL45B6FE1NuZw_Ekmlex5g';
const PORT = process.env.PORT || 3000;

function log(message, type = 'log') {
  if (type === 'error') {
    console.error(message);
  } else {
    console.log(message);
  }
}

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

/**
 * Transforms the result records into an array of objects with specific properties.
 *
 */

(async () => {
  let driver;

  try {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
    const serverInfo = await driver.getServerInfo();

    log('Connection established to server DB');
    log(`Server address: ${serverInfo.address}`);

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

        const hierarchicalData = buildHierarchy(data);

        res.json(hierarchicalData);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    });

    if (!PORT) {
      log('PORT environment variable is not set!', 'error');
      process.exit(1);
    }
    log(`PORT environment variable: ${PORT}`);

    app.listen(PORT, () => {
      log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    log(`Connection error\n${err}\nCause: ${err.cause}`, 'error');
  }
})();
