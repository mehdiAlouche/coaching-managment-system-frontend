import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { apiClient } from "../lib/api-client"
import endpoints from "../lib/api-endpoints"
import type { Session } from "../types"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.sessions.list)
      return response.data.data
    },
  })

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  const getSessionsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]

    return sessions.filter((session) => session.startTime.startsWith(dateStr))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Calendar View</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition">
                    ← Prev
                  </button>
                  <button onClick={nextMonth} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition">
                    Next →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const daysSessions = day ? getSessionsForDate(day) : []
                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg border-2 p-2 overflow-hidden ${
                        day === null
                          ? "bg-gray-50 border-gray-100"
                          : daysSessions.length > 0
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {day && (
                        <div className="h-full flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 mb-1">{day}</span>
                          {daysSessions.length > 0 && (
                            <div className="flex-1 space-y-1">
                              {daysSessions.slice(0, 2).map((session) => (
                                <Link
                                  key={session.id}
                                  to="/sessions/$id"
                                  params={{ id: session.id }}
                                  className="block text-xs bg-blue-500 text-white px-1 py-0.5 rounded truncate hover:bg-blue-600"
                                  title={session.title}
                                >
                                  {session.title}
                                </Link>
                              ))}
                              {daysSessions.length > 2 && (
                                <div className="text-xs text-gray-600">+{daysSessions.length - 2} more</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Sessions Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Sessions</h3>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sessions
                .filter((s) => new Date(s.startTime) > new Date())
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 10)
                .map((session) => (
                  <Link
                    key={session.id}
                    to="/sessions/$id"
                    params={{ id: session.id }}
                    className="block p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition border-l-2 border-blue-500"
                  >
                    <p className="font-semibold text-gray-900 text-sm">{session.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{new Date(session.startTime).toLocaleString()}</p>
                  </Link>
                ))}

              {sessions.filter((s) => new Date(s.startTime) > new Date()).length === 0 && (
                <p className="text-center text-gray-600 py-8">No upcoming sessions</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
