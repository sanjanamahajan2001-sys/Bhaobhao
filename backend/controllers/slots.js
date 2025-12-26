import { eq, and, sql, gte, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import { slots as SlotsModel } from "../db/schema/slots.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";
import { groomers as GroomersModel } from "../db/schema/groomers.js";

class SlotsController {
  static async get_slots_with_booking_status(req, res) {
    try {
      const { date } = req.query; // Expected format: 'YYYY-MM-DD'

      if (!date) {
        return res.status(400).json({ message: "Date is required (YYYY-MM-DD)." });
      }

      // Step 1: Count total active groomers
      const totalGroomersResult = await db
        .select({ total: sql`count(*)` })
        .from(GroomersModel)
        .where(
          and(
            eq(GroomersModel.status, 'Active'),
            eq(GroomersModel.delete, false),
          )
        );

      const totalGroomers = parseInt(totalGroomersResult[0]?.total || 0, 10);

      if (totalGroomers === 0) {
        return res.status(400).json({ message: "No active groomers available." });
      }

      // Step 2: Get all time slots
      const slotsList = await db.select().from(SlotsModel);

      // Step 3: For each slot, check how many bookings already exist
      const results = await Promise.all(
        slotsList.map(async (slot) => {
          const [startTime, endTime] = slot.slot.split(" - "); // e.g., ['09:00', '10:00']

          const bookingsCountResult = await db
            .select({ total: sql`count(*)` })
            .from(BookingsModel)
            .where(and(
              eq(BookingsModel.delete, false),
              eq(sql`DATE(${BookingsModel.appointment_time_slot} AT TIME ZONE 'Asia/Kolkata')`, date),
              sql`(${BookingsModel.appointment_time_slot} AT TIME ZONE 'Asia/Kolkata')::time >= ${startTime}::time AND (${BookingsModel.appointment_time_slot} AT TIME ZONE 'Asia/Kolkata')::time < ${endTime}::time`
            ));

          const totalBookings = parseInt(bookingsCountResult[0]?.total || 0, 10);

          return {
            id: slot.id,
            slot: slot.slot,
            is_booked: totalBookings >= totalGroomers,
            // total_groomers: totalGroomers,
            // total_bookings: totalBookings,
          };
        })
      );

      return res.status(200).json({
        message: "Slots with booking status retrieved successfully.",
        data: results,
      });
    } catch (error) {
      console.error("❌ Failed to get slots:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
}

export default SlotsController;
