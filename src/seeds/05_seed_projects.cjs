/**
 * @param {import('knex')} knex
 */

const projectTypes = [
  { type: 'Oil Change', duration: 1, description: 'Oil Change' },
  { type: 'Paint Job', duration: 120, description: 'Paint Job' },
  { type: 'Overall Checkup and Tuning', duration: 4, description: 'Overall Checkup and Tuning' },
  { type: 'Custom Parts Installation', duration: 4, description: 'Custom Parts Installation' },
  { type: 'Project Discussion', duration: 1, description: 'Project Discussion' },
];

const carBrands = ['CHEVROLET', 'BMW', 'AUDI', 'TESLA', 'HONDA', 'TOYOTA', 'FORD', 'SUBARU'];
const carModels = [
  'Caprice Police Vehicle', 'M3', 'A4', 'Model S', 'Civic', 'Camry', 'Focus', 'Impreza'
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function addHours(start, hours) {
  return new Date(start.getTime() + hours * 60 * 60 * 1000);
}

exports.seed = async function (knex) {
  await knex('projects').del();

  const startDate = new Date('2024-11-01T07:00:00Z');
  const endOfDayHour = 16;
  const projects = [];

  for (let i = 0; i < 300; i++) {
    const project = getRandomItem(projectTypes);
    const carBrand = getRandomItem(carBrands);
    const carModel = getRandomItem(carModels);
    const carYear = 2010 + Math.floor(Math.random() * 15);

    let endDate = addHours(startDate, project.duration);

    while (endDate.getUTCHours() > endOfDayHour || endDate.getUTCDay() === 0 || endDate.getUTCDay() === 6) {
      startDate.setUTCDate(startDate.getUTCDate() + 1);
      startDate.setUTCHours(7, 0, 0, 0);
      endDate = addHours(startDate, project.duration);
    }

    const projectInfo = `Car info:\n` +
                        `    Car Brand- ${carBrand}\n` +
                        `    Car Model- ${carModel}\n` +
                        `    Car Year- ${carYear}\n` +
                        `    Additional Info- ${project.description}`;

    projects.push({
      idUser: Math.ceil(Math.random() * 25),
      StartDate: startDate.toISOString(),
      EndDateProjection: endDate.toISOString(),
      Delayed: Math.random() < 0.2 ? 1 : 0,
      idStatus: 1,
      ProjectInfo: projectInfo,
    });

    startDate.setUTCHours(startDate.getUTCHours() + project.duration + 1);
    if (startDate.getUTCHours() >= endOfDayHour) {
      startDate.setUTCDate(startDate.getUTCDate() + 1);
      startDate.setUTCHours(7, 0, 0, 0);
    }
  }

  await knex('projects').insert(projects);
  console.log(`✅ Inserted ${projects.length} formatted projects.`);
};
