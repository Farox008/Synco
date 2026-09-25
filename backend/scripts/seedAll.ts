import prisma from '../src/utils/prisma';

async function main() {
  console.log('Starting seed...');

  console.log('Seeding Machines...');
  const machines = [
    { id: 'MCH-01', name: 'CNC Router 1', type: 'CNC Milling', status: 'idle', efficiency: 95, runtimeHours: 1200 },
    { id: 'MCH-02', name: 'Laser Cutter A', type: 'Cutting', status: 'running', efficiency: 88, runtimeHours: 450 }
  ];
  for (const m of machines) {
    await prisma.machine.upsert({
      where: { id: m.id },
      update: {},
      create: m
    });
  }

  console.log('Seeding Work Orders and Jobs...');
  const wo = await prisma.workOrder.upsert({
    where: { id: 'WO-1001' },
    update: {},
    create: {
      id: 'WO-1001',
      customer: 'Acme Corp',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      metadata: {
        create: [
          { metaKey: 'Project', metaValue: 'Alpha' }
        ]
      },
      jobs: {
        create: [
          {
            id: 'JOB-1001-A',
            name: 'Widget Component',
            qty: 100,
            material: 'Aluminum',
            catalogSize: '10x10',
            dimensions: '10x10x5 mm',
            supplier: 'MetalCo',
            status: 'Pending',
            progress: 0,
            processes: {
              create: [
                { department: 'Milling', estimatedHours: 5, actualHours: 0, status: 'N/A' },
                { department: 'Assembly', estimatedHours: 2, actualHours: 0, status: 'N/A' }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seed completed successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
