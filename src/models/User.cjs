const bcrypt = require('bcryptjs');

const { query, run } = require('../config/db.cjs');

// User model for SQLite
class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password_hash; // Map from DB column
    this.role = data.role || 'student';
    this.studentId = data.student_id; // Map from DB column
    this.department = data.department;
    this.year = data.year;
    this.isActive = data.is_active === 1; // SQLite boolean
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Hash password
  static async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  // Verify password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Create user in database
  static async create(userData) {
    const { name, email, phone, password, role, studentId, department, year } = userData;
    const hashedPassword = await this.hashPassword(password);

    const sql = `
      INSERT INTO Users (name, email, phone, password_hash, role, student_id, department, year) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await run(sql, [
      name,
      email,
      phone,
      hashedPassword,
      role || 'student',
      studentId,
      department,
      year
    ]);

    return result.lastID;
  }

  // Find user by email
  static async findByEmail(email) {
    const rows = await query('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0] ? new User(rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const rows = await query('SELECT * FROM Users WHERE id = ?', [id]);
    return rows[0] ? new User(rows[0]) : null;
  }

  // Convert to plain object for API response
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      studentId: this.studentId,
      department: this.department,
      year: this.year,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
