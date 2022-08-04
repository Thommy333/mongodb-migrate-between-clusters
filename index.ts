/**
 * Copyright 2022 The Catenating Company (Auto-Pilot)
 * @author Thom Trentelman
 */

import {sourceConnection, targetConnection} from "./config/mongodb";

import type {IndexDefinition} from "mongoose";

type key = {[key: string]: string | number};
type IndexDescription = IndexDefinition & {key: key};

// Use counter variable for logging
let connectionsOpen = 0;

const {databases} = await sourceConnection.db.admin().listDatabases();

await Promise.all(
  databases.map(async ({name: databaseName}) => {
    // These databases should never be copied
    if (["admin", "local"].includes(databaseName)) return;

    const sourceDb = sourceConnection.useDb(databaseName);
    const targetDb = targetConnection.useDb(databaseName);

    const collections = await sourceDb.db.listCollections().toArray();

    await Promise.all(
      collections.map(async ({name: collectionName}) => {
        return new Promise<void>(async (resolve, reject) => {
          // Log progress
          ++connectionsOpen;
          console.clear();
          console.log(`Connections open`, connectionsOpen);

          // Create collection in target cluster
          const targetCollection = targetDb.db.collection(collectionName);

          // Copy source indexes to target cluster (note: createIndexes() overwrites existing indexes)
          const indexes = await sourceDb.collection(collectionName).indexes();
          indexes.splice(0, 1); // remove the standard _id_ index
          if (indexes.length > 0) {
            await targetDb.collection(collectionName).createIndexes(indexes as IndexDescription[]);
          }

          // Use data streaming for all documents
          const stream = sourceDb.collection(collectionName).find().stream();

          // Insert every document into the target collection
          stream.on("data", async (document) => {
            targetCollection.insertOne(document).catch(() => {}); // Let the insertion fail, assuming any errors are due to a duplicate already in place not satifying the indexes (like when you've ran multiple migrations)
          });

          stream.on("error", (error) => {
            console.error(`Streaming to collection ${collectionName} in db ${databaseName} returned `, error.message);
            reject(error);
          });

          stream.on("end", () => {
            --connectionsOpen;
            console.clear();
            console.log(`Connections open`, connectionsOpen);
            resolve();
          });
        });
      })
    );
  })
);

console.log("Operation complete!");
process.exit(0);
