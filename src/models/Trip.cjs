const { query, run } = require('../config/db.cjs');

class Trip {
  constructor(data) {
    this.id = data.id;
    this.vehicleId = data.vehicle_id;
    this.driverId = data.driver_id;
    this.studentId = data.student_id;
    this.startLocation = data.start_location;
    this.endLocation = data.end_location;
    this.startTime = data.start_time;
    this.endTime = data.end_time;
    this.status = data.status || 'pending';
    this.rating = data.rating;
    this.feedback = data.feedback_comment;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async find() {
    const sql = `
      SELECT t.*, 
             v.vehicle_number, 
             d.name as driver_name, 
             s.name as student_name
      FROM Trips t
      LEFT JOIN Vehicles v ON t.vehicle_id = v.id
      LEFT JOIN Users d ON t.driver_id = d.id
      LEFT JOIN Users s ON t.student_id = s.id
      ORDER BY t.created_at DESC
    `;
    const rows = await query(sql);
    return rows.map(row => new Trip(row));
  }

  static async create(data) {
    const { vehicleId, driverId, studentId, startLocation, endLocation } = data;
    const sql = `
      INSERT INTO Trips (vehicle_id, driver_id, student_id, start_location, end_location)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await run(sql, [vehicleId, driverId, studentId, startLocation, endLocation]);
    return result.lastID;
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM Trips WHERE id = ?', [id]);
    return rows[0] ? new Trip(rows[0]) : null;
  }

  static async updateStatus(id, status, endTime) {
    const sql = `
      UPDATE Trips 
      SET status = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await run(sql, [status, endTime, id]);
    return await this.findById(id);
  }

  static async addFeedback(id, rating, feedback) {
    const sql = `
      UPDATE Trips 
      SET rating = ?, feedback_comment = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await run(sql, [rating, feedback, id]);
    return await this.findById(id);
  }
}

module.exports = Trip;