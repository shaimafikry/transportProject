import React, { useState, useEffect } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { ar } from "date-fns/locale";
import { fetchData } from "../api";

const Attendance = () => {
  const [view, setView] = useState("");
  const [dayLog, setDayLog] = useState([]);
  const [monthLog, setMonthLog] = useState([]);
  const [message, setMessage] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const formattedDate = format(today, "EEEE d/M/yyyy", { locale: ar });
  const formattedMonth = format(currentMonth, "MMMM yyyy", { locale: ar });

  const monthYear = {
    month: currentMonth.getMonth() + 1,
    year: currentMonth.getFullYear(),
  };

  // ✅ Format time function
  const formatTime = (timestamp) => {
    return timestamp ? format(new Date(timestamp), "HH:mm") : "--"; // Show "--" if null
  };

  // ✅ Fetch daily log
  const fetchDayLog = async () => {
    try {
      const date = format(today, "yyyy-MM-dd");
      const response = await fetchData(`dashboard/attendance?date=${date}`);
      setDayLog(response);
      setMessage(response.length === 0 ? "لا يوجد سجل لهذا اليوم" : "");
    } catch (error) {
      console.error("Error fetching day log:", error);
      setMessage("خطأ في جلب البيانات");
    }
  };

  // ✅ Fetch monthly log
  const fetchMonthLog = async () => {
    try {
      const response = await fetchData(`dashboard/attendance?month=${monthYear.month}&year=${monthYear.year}`);
      setMonthLog(response);
      setMessage(response.length === 0 ? "لا يوجد سجل لهذا الشهر" : "");
    } catch (error) {
      console.error("Error fetching month log:", error);
      setMessage("خطأ في جلب البيانات");
    }
  };

  // ✅ Fetch month log whenever currentMonth changes
  useEffect(() => {
    if (view === "month") fetchMonthLog();
  }, [currentMonth]); // 👈 Triggers when currentMonth changes

  return (
    <>
      <div className="trip-options">
        <button onClick={() => { fetchDayLog(); setView("day"); }}>سجل الحضور اليومي</button>
        <button onClick={() => { fetchMonthLog(); setView("month"); }}> سجل الحضور الشهري </button>
      </div>

			{view === "day" && (
    <div className="table-container">
      <h2 className="text-xl font-semibold text-center mb-4">سجل اليوم: {formattedDate}</h2>
      {dayLog.length > 0 ? (
        <table className="agent-table">
          <thead>
            <tr>
              <th>الموظف</th>
              <th>وقت الدخول</th>
              <th>وقت الخروج</th>
              <th>إجمالي الساعات</th>
            </tr>
          </thead>
          <tbody>
            {dayLog.map(({ name, signIn, signOut, totalHours }) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{formatTime(signIn)}</td> {/* ✅ Formatted time */}
                <td>{formatTime(signOut)}</td> {/* ✅ Formatted time */}
                <td>{totalHours} ساعة</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h2>{message}</h2>
      )}
    </div>
  )}

  {view === "month" && (
    <div className="table-container">
      <div className="month-btn">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}> ➡ الشهر السابق</button>
        <h2 className="text-xl font-semibold">{formattedMonth}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>الشهر التالي ⬅</button>
      </div>
      {monthLog.length > 0 ? (
        <table className="agent-table">
          <thead>
            <tr>
              <th>الموظف</th>
              <th>أيام الحضور</th>
              <th>أيام الغياب</th>
            </tr>
          </thead>
          <tbody>
            {monthLog.map(({ name, totalDays, absenceDays }) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{totalDays}</td>
                <td>{absenceDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
				<h2 className="record">{message}</h2>
      )}
    </div>
  )}
    </>
  );
};

export default Attendance;
