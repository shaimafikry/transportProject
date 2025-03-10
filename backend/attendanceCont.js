const { Op } = require("sequelize");
const { Attendance } = require("./config");

// Get number of days in a month
const getMonthDays = (year, month) => new Date(year, month, 0).getDate();

// Get attendance for a specific day
const getDayLog = async (date) => {
  const logs = await Attendance.findAll({
    where: {
      timestamp: {
        [Op.gte]: new Date(date + "T00:00:00Z"),
        [Op.lt]: new Date(date + "T23:59:59Z"),
      },
    },
    order: [["timestamp", "ASC"]],
    raw: true,
  });

  let dayLog = {};
  logs.forEach(({ userId, name, timestamp, type }) => {
    if (!dayLog[userId]) {
      dayLog[userId] = { name, signIn: null, signOut: null };
    }
    if (type === "in" && !dayLog[userId].signIn) {
      dayLog[userId].signIn = timestamp;
    }
    if (type === "out") {
      dayLog[userId].signOut = timestamp;
    }
  });

  return Object.values(dayLog).map(({ name, signIn, signOut }) => ({
    name,
    signIn,
    signOut,
    totalHours: signIn && signOut ? ((new Date(signOut) - new Date(signIn)) / (1000 * 60 * 60)).toFixed(2) : "0.00",
  }));
};

// Get attendance for a month
const getMonthLog = async (year, month) => {
  const logs = await Attendance.findAll({
    where: {
      timestamp: {
        [Op.gte]: new Date(Date.UTC(year, month - 1, 1)),
        [Op.lt]: new Date(Date.UTC(year, month, 1)),
      },
    },
    raw: true,
  });

  let monthLog = {};
  logs.forEach(({ userId, name, timestamp }) => {
    let date = timestamp.toISOString().split("T")[0];
    if (!monthLog[userId]) {
      monthLog[userId] = { name, attendedDays: new Set() };
    }
    monthLog[userId].attendedDays.add(date);
  });

  const monthDays = getMonthDays(year, month);

  return Object.values(monthLog).map(({ name, attendedDays }) => ({
    name,
    totalDays: attendedDays.size,
    absenceDays: monthDays - attendedDays.size,
  }));
};

const attendanceLog = async (req, res) => {
  try {
    let { date, month, year } = req.query;

    if (date) {
      const dayData = await getDayLog(date);
      return res.status(200).json(dayData);
    }
    if (month && year) {
      const monthData = await getMonthLog(parseInt(year), parseInt(month));
      return res.status(200).json(monthData);
    }

    return res.status(400).json({ error: "Invalid request. Provide either date or month/year." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { attendanceLog };
