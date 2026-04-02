import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.refreshToken.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.tripEvent.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.vehicleLocation.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.driverProfile.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hashPassword('password123')

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sau.ac.in',
      name: 'Admin User',
      passwordHash,
      role: 'admin',
      status: 'active'
    }
  })

  // Create Student
  const student = await prisma.user.create({
    data: {
      email: 'student@sau.ac.in',
      name: 'Student User',
      passwordHash,
      role: 'student',
      status: 'active',
      studentProfile: {
        create: {
          studentNo: 'S12345',
          department: 'Computer Science',
          hostel: 'A-Block'
        }
      }
    }
  })

  // Create Driver
  const driver = await prisma.user.create({
    data: {
      email: 'driver@sau.ac.in',
      name: 'Driver User',
      passwordHash,
      role: 'driver',
      status: 'active',
      driverProfile: {
        create: {
          licenseNo: 'DL-123456789'
        }
      }
    }
  })

  // Create Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      vehicleNumber: 'SAU-001',
      capacity: 4,
      status: 'waiting',
      assignedDriverId: driver.id
    }
  })

  const vehicle2 = await prisma.vehicle.create({
    data: {
      vehicleNumber: 'SAU-002',
      capacity: 4,
      status: 'offline'
    }
  })

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
