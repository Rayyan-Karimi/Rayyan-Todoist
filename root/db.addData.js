import { performance } from 'perf_hooks';
import { db } from '../db/dbConfig.js';
import generateProjects from '../db/projects.config.js';
import generateTasks from '../db/tasks.config.js';
const BATCH_SIZE = 1000;

// Helper function to insert data in batches
const insertBatch = (tableName, columns, data) => {
    const placeholders = `(${columns.map(() => '?').join(", ")})`;
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${data.map(() => placeholders).join(', ')}`;
    const flattenedData = data.flat(); 

    return new Promise((resolve, reject) => {
        db.run(query, flattenedData, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Insert tasks
let tasksTime = 0
const insertTasks = async (numberOfTasks, maxProjects) => {
    console.log('Inserting tasks...')
    const start = performance.now()
    for (let i = 0; i < numberOfTasks; i += BATCH_SIZE) {
        const batch = generateTasks(Math.min(BATCH_SIZE, numberOfTasks - i), maxProjects) // don’t generate more records than needed in the last batch.
        const data = batch.map(task => [
            task.content,
            task.description,
            task.due_date,
            task.is_completed,
            task.project_id
        ]);
        try {
            await insertBatch('tasks', ['content', 'description', 'due_date', 'is_completed', 'project_id'], data);
            console.log(`Inserted ${i + BATCH_SIZE} tasks...`)
        } catch (err) {
            console.error(`Error inserting tasks in batch ${i} to ${i + BATCH_SIZE}: ${err}`);
        }
    }
    const end = performance.now()
    tasksTime = (end - start) / 1000;
}

let projectsTime = 0
// Insert projects into DB
const insertProjects = async (numberOfProjects) => {
    console.log("Inserting projects...")
    const start = performance.now();
    for (let i = 0; i < numberOfProjects; i += BATCH_SIZE) {
        const batch = generateProjects(Math.min(BATCH_SIZE, numberOfProjects - i)); // don’t generate more records than needed in the last batch.
        const data = batch.map(project => [
            project.name, project.color, project.is_favorite
        ]);
        try {
            await insertBatch('projects', ['name', 'color', 'is_favorite'], data);
            console.log(`Inserted ${i + BATCH_SIZE} projects...`)
        } catch (err) {
            console.error(`Error inserting projects: ${err}`)
        }
    }
    const end = performance.now()
    projectsTime = (end - start) / 1000
}

// Main function to generate and insert data
const main = async () => {
    const numberOfProjects = 1000 // 1000000
    const numberOfTasks = 10000 // 10000000

    try {
        await insertProjects(numberOfProjects)
        await insertTasks(numberOfTasks, numberOfProjects)
        console.log(`Projects insertion time: ${projectsTime} seconds`);
        console.log(`Tasks insertion time: ${tasksTime} seconds`);
    } catch (err) {
        console.error("Error in data insertion:", err);
    }
}

main();