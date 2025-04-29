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

const STATUS = {
  PENDING: 1,
  IN_PROGRESS: 2,
  NO_ARRIVAL: 3,
  CANCELLED: 4,
  COMPLETED: 5,
};

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

  for (let i = 0; i < 24; i++) {
    const projectType = getRandomItem(projectTypes);
    const carBrand = getRandomItem(carBrands);
    const carModel = getRandomItem(carModels);
    const carYear = 2010 + Math.floor(Math.random() * 15);

    let projectStart = new Date(startDate);
    let projectEnd = addHours(projectStart, projectType.duration);
    let statusId;

    const rand = Math.random();

    while (
      projectEnd.getUTCHours() > endOfDayHour ||
      projectStart.getUTCDay() === 0 ||
      projectStart.getUTCDay() === 6
    ) {
      projectStart.setUTCDate(projectStart.getUTCDate() + 1);
      projectStart.setUTCHours(7, 0, 0, 0);
      projectEnd = addHours(projectStart, projectType.duration);
    }

    if (rand < 0.2) {
      statusId = STATUS.CANCELLED;
    } else if (rand < 0.3) {
      statusId = STATUS.NO_ARRIVAL;
    } else {
      const now = new Date();
      if (projectEnd < now) {
        statusId = STATUS.COMPLETED;
      } else {
        statusId = Math.random() < 0.5 ? STATUS.PENDING : STATUS.IN_PROGRESS;
      }
    }

    const projectInfo = `Car Info:\n` +
      `      Car Brand- ${carBrand}\n` +
      `      Car Model- ${carModel}\n` +
      `      Car Year- ${carYear}\n` +
      `\nAdditional Info: \n${projectType.description}`;

    projects.push({
      idUser: Math.ceil(Math.random() * 30),
      StartDate: projectStart.toISOString(),
      EndDateProjection: projectEnd.toISOString(),
      Delayed: 0,
      idStatus: statusId,
      ProjectInfo: projectInfo,
    });

    if (statusId !== STATUS.CANCELLED && statusId !== STATUS.NO_ARRIVAL) {
      startDate.setUTCHours(startDate.getUTCHours() + projectType.duration + 1);
      if (startDate.getUTCHours() >= endOfDayHour) {
        startDate.setUTCDate(startDate.getUTCDate() + 1);
        startDate.setUTCHours(7, 0, 0, 0);
      }
    }
  }

  // Add delayed project
  const delayedProjectType = getRandomItem(projectTypes);
  const delayedStart = new Date();
  delayedStart.setUTCDate(delayedStart.getUTCDate() - 2);
  delayedStart.setUTCHours(9, 0, 0, 0);
  const delayedEnd = addHours(delayedStart, delayedProjectType.duration);
  const delayedCarBrand = getRandomItem(carBrands);
  const delayedCarModel = getRandomItem(carModels);
  const delayedCarYear = 2010 + Math.floor(Math.random() * 15);

  const delayedProjectInfo = `Car Info:\n` +
    `      Car Brand- ${delayedCarBrand}\n` +
    `      Car Model- ${delayedCarModel}\n` +
    `      Car Year- ${delayedCarYear}\n` +
    `\nAdditional Info: \n${delayedProjectType.description}`;

  projects.push({
    idUser: Math.ceil(Math.random() * 100),
    StartDate: delayedStart.toISOString(),
    EndDateProjection: delayedEnd.toISOString(),
    Delayed: 1,
    idStatus: STATUS.IN_PROGRESS,
    ProjectInfo: delayedProjectInfo,
  });

  // Add some future projects: pending and cancelled
  const futureBase = new Date();
  futureBase.setUTCDate(futureBase.getUTCDate() + 7);

  for (let i = 0; i < 5; i++) {
    const futureType = getRandomItem(projectTypes);
    const futureStart = new Date(futureBase);
    futureStart.setUTCDate(futureStart.getUTCDate() + i);
    futureStart.setUTCHours(9, 0, 0, 0);
    const futureEnd = addHours(futureStart, futureType.duration);

    const futureProjectInfo = `Car Info:\n` +
      `      Car Brand- ${getRandomItem(carBrands)}\n` +
      `      Car Model- ${getRandomItem(carModels)}\n` +
      `      Car Year- ${2010 + Math.floor(Math.random() * 15)}\n` +
      `\nAdditional Info: \n${futureType.description}`;

    projects.push({
      idUser: Math.ceil(Math.random() * 30),
      StartDate: futureStart.toISOString(),
      EndDateProjection: futureEnd.toISOString(),
      Delayed: 0,
      idStatus: i % 2 === 0 ? STATUS.PENDING : STATUS.CANCELLED,
      ProjectInfo: futureProjectInfo,
    });
  }

  await knex('projects').insert(projects);
  console.log(`✅ Inserted ${projects.length} formatted and status-correct projects, including future pending/cancelled ones.`);
};
