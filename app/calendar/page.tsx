'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { useLanguage } from '@/context/language-context'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

export default function CalendarPage() {
  const { t } = useLanguage()
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch('/api/calendar')
      const data = await response.json()
      setEvents(data)
    }

    fetchEvents()
  }, [])

  return (
    <Layout title={t('calendar')}>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events}
        />
      </div>
    </Layout>
  )
}
