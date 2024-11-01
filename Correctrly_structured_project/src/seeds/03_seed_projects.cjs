const knex = require('knex');
const dbConfig = require('../knexfile.cjs');

const db = knex(dbConfig.development);

// Project types with durations in hours and a short description
const projectTypes = [
  { type: 'Oil Change', duration: 1, description: 'Oil Change' },
  { type: 'Paint Job', duration: 120, description: 'Paint Job' }, // 5 days = 120 hours
  { type: 'Overall Checkup and Tuning', duration: 4, description: 'Overall Checkup and Tuning' },
  { type: 'Custom Parts Installation', duration: 4, description: 'Custom Parts Installation' },
  { type: 'Project Discussion', duration: 1, description: 'Project Discussion' },
];

// Example cars
const cars = ['BMW M3', 'Audi A4', 'Ford Focus', 'Tesla Model S', 'Honda Civic', 'Toyota Camry', 'Subaru Impreza'];

// Helper to get a random project type
function getRandomProject() {
  return projectTypes[Math.floor(Math.random() * projectTypes.length)];
}

// Helper to get a random car
function getRandomCar() {
  return cars[Math.floor(Math.random() * cars.length)];
}

// Helper to calculate end time based on start time and duration
function addHours(start, hours) {
  return new Date(start.getTime() + hours * 60 * 60 * 1000);
}

exports.seed = async function () {
  await db('projects').del();

  // Starting work at 7 AM (UTC) for the first day
  const startDate = new Date('2024-11-01T07:00:00Z'); // Adjusted to start at 7 AM
  const endOfDayHour = 16; // 4 PM in 24-hour format
  let projects = [];

  for (let i = 0; i < 300; i++) {
    const project = getRandomProject();
    const car = getRandomCar();

    // Calculate end date based on the start date and project duration
    let endDate = addHours(startDate, project.duration);

    // Check if the project fits within the workday
    while (endDate.getUTCHours() > endOfDayHour || endDate.getUTCDay() === 0 || endDate.getUTCDay() === 6) {
      // Move to the next day at 11 AM if it exceeds the workday or falls on a weekend
      startDate.setUTCDate(startDate.getUTCDate() + 1);
      startDate.setUTCHours(7, 0, 0, 0); // Reset to 7 AM
      endDate = addHours(startDate, project.duration); // Recalculate end date
    }

    projects.push({
      idUser: Math.ceil(Math.random() * 150), // Randomly assign one of 10 users
      StartDate: startDate.toISOString(),
      EndDateProjection: endDate.toISOString(),
      Delayed: Math.random() < 0.2 ? 1 : 0, // Randomly delay 20% of projects
      ProjectInfo: `${project.description} for ${car}`,
    });

    // Prepare for the next project with a break of at least 1 hour
    startDate.setUTCHours(startDate.getUTCHours() + project.duration + 1);

    // If the new start time exceeds the end of the day, move to the next day at 7 AM
    if (startDate.getUTCHours() >= endOfDayHour) {
      startDate.setUTCDate(startDate.getUTCDate() + 1);
      startDate.setUTCHours(7, 0, 0, 0); // Reset to 7 AM
    }
  }

  await db('projects').insert(projects);
  console.log(`Inserted 25 projects with various types and schedules.`);

  await db.destroy(); // Close the database connection
};
