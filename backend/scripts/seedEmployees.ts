import prisma from '../src/utils/prisma';
import { mockEmployees, mockDepartments, mockProductionLines, mockEmploymentTypes, mockShifts } from '../../frontend/src/modules/user-management/data/mockData';

async function main() {
  console.log('Starting seed...');

  // 1. Departments
  for (const dept of mockDepartments) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: {},
      create: {
        id: dept.id,
        name: dept.name,
        description: dept.description,
        employeeCount: dept.employeeCount,
        status: dept.status,
      },
    });
  }
  console.log('Departments seeded.');

  // 2. Production Lines
  for (const line of mockProductionLines) {
    await prisma.productionLine.upsert({
      where: { id: line.id },
      update: {},
      create: {
        id: line.id,
        name: line.name,
        parentId: line.parentId,
        description: line.description,
        employeeCount: line.employeeCount,
        status: line.status,
      },
    });
  }
  console.log('Production Lines seeded.');

  // 3. Employment Types
  for (const type of mockEmploymentTypes) {
    await prisma.employmentType.upsert({
      where: { id: type.id },
      update: {},
      create: {
        id: type.id,
        name: type.name,
        description: type.description,
        status: type.status,
      },
    });
  }
  console.log('Employment Types seeded.');

  // 4. Shifts
  for (const shift of mockShifts) {
    await prisma.shift.upsert({
      where: { id: shift.id },
      update: {},
      create: {
        id: shift.id,
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakDuration: shift.breakDuration,
        status: shift.status,
      },
    });
  }
  console.log('Shifts seeded.');

  // 5. Employees
  for (const emp of mockEmployees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {},
      create: {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        preferredName: emp.preferredName,
        gender: emp.gender,
        dateOfBirth: emp.dateOfBirth,
        nationality: emp.nationality,
        profilePicture: emp.profilePicture,
        departmentId: emp.departmentId,
        productionLineId: emp.productionLineId,
        designation: emp.designation,
        employmentTypeId: emp.employmentTypeId,
        joiningDate: emp.joiningDate,
        shiftId: emp.shiftId,
        employmentStatus: emp.employmentStatus,
        email: emp.email,
        phoneNumber: emp.phoneNumber,
        address: emp.address,
        emergencyContactName: emp.emergencyContactName,
        emergencyContactPhone: emp.emergencyContactPhone,
        skills: emp.skills ? JSON.stringify(emp.skills) : null,
      },
    });
  }
  console.log('Employees seeded.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seeding complete.');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
