import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const { role } = req.query
  const users = await prisma.user.findMany({
    where: role ? { role: role as any } : {},
    include: {
      studentProfile: true,
      driverProfile: true
    }
  })

  // Map to a consistent frontend structure
  const mapped = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    studentId: u.studentProfile?.studentNo,
    department: u.studentProfile?.department,
    hostel: u.studentProfile?.hostel,
    licenseNo: u.driverProfile?.licenseNo,
    rating: u.driverProfile?.ratingAvg,
    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
  }))

  return res.json(mapped)
})

export default router
