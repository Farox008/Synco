import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/utils/prisma';

async function main() {
  const saltRounds = 10;
  
  const users = [
    { name: 'Admin Root', username: 'A001', password: 'Dev@Admin123!', role: 'Super Admin', dept: 'Administration', empId: 'ADM-001' },
    { name: 'Sarah Connor', username: 'A002', password: 'Dev@HR123!', role: 'HR', dept: 'Administration', empId: 'ADM-002' },
    { name: 'John Carter', username: 'D001', password: 'Dev@Des123!', role: 'Design Manager', dept: 'Design', empId: 'DES-001' },
    { name: 'Emily Chen', username: 'D002', password: 'Dev@Cad123!', role: 'Designer', dept: 'Design', empId: 'DES-002' },
    { name: 'Robert King', username: 'P001', password: 'Dev@Buy123!', role: 'Purchase Manager', dept: 'Purchase', empId: 'PUR-001' },
    { name: 'Lisa Wong', username: 'PL001', password: 'Dev@Plan123!', role: 'Planning Manager', dept: 'Planning', empId: 'PLN-001' },
    { name: 'Mike Davis', username: 'S001', password: 'Dev@Str123!', role: 'Store Keeper', dept: 'Inventory', empId: 'INV-001' },
    { name: 'David Smith', username: 'PR001', password: 'Dev@Prd123!', role: 'Production Manager', dept: 'Production', empId: 'PRD-001' },
    { name: 'Tom Wilson', username: 'PR012', password: 'Dev@Cnc123!', role: 'CNC Milling Operator', dept: 'Milling', empId: 'PRD-012' },
    { name: 'Anna Taylor', username: 'Q001', password: 'Dev@Qa123!', role: 'QI Manager', dept: 'Quality', empId: 'QUA-001' },
    { name: 'Mark Jones', username: 'DI001', password: 'Dev@Ship123!', role: 'Dispatch Executive', dept: 'Dispatch', empId: 'DIS-001' }
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, saltRounds);
    const [firstName, ...lastNames] = u.name.split(' ');
    
    await prisma.employee.upsert({
      where: { id: u.empId },
      update: {
        username: u.username,
        passwordHash,
        role: u.role,
        designation: u.role,
        accountStatus: 'active'
      },
      create: {
        id: u.empId,
        username: u.username,
        firstName,
        lastName: lastNames.join(' ') || '',
        email: `${u.username}@synco.app`,
        passwordHash,
        role: u.role,
        designation: u.role,
        accountStatus: 'active'
      }
    });
    console.log(`Created/Updated user: ${u.username} (${u.role})`);
  }
  
  console.log('RBAC Seed completed.');
}

main()
  .catch((e) => {
    console.error('Error seeding RBAC users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
