import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.query
    
    // Validate role parameter if provided
    let where: any = {}
    if (role) {
      const validRoles = ['admin', 'driver', 'student']
      const roleValue = Array.isArray(role) ? role[0] : role
      if (typeof roleValue === 'string' && validRoles.includes(roleValue)) {
        where.role = roleValue as any
      } else if (roleValue) {
        return res.status(400).json({ error: 'Invalid role parameter' })
      }
    }

    const users = await prisma.user.findMany({
      where,
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
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent((u.name ?? '').trim())}&background=random`
    }))

    return res.json(mapped)
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ error: 'Failed to fetch users' })
  }
})

export default router
