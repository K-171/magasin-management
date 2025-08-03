'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { useLanguage } from '@/context/language-context'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

import { useIsMobile } from '@/hooks/use-mobile';

export default function CalendarPage() {
  const { t } = useLanguage()
  const [events, setEvents] = useState([])
  const isMobile = useIsMobile();

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
          initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
          headerToolbar={{
            left: isMobile ? 'prev,next' : 'prev,next today',
            center: 'title',
            right: isMobile ? 'listWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events}
          eventContent={(arg) => {
            const status = arg.event.extendedProps.status;
            let backgroundColor = '#3788d8'; // Default blue
            if (status === 'Retourné') {
              backgroundColor = '#34d399'; // Green
            } else if (status === 'En Retard') {
              backgroundColor = '#ef4444'; // Red
            }

            if (arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay') {
              return (
                <div style={{ backgroundColor, borderColor: backgroundColor, color: 'white', height: '100%', width: '100%'}} className="p-1">
                  <b>{arg.timeText}</b>
                  <span className="pl-1">{arg.event.title}</span>
                </div>
              )
            }

            return (
              <div style={{ backgroundColor, borderColor: backgroundColor }} className="fc-event-main p-1 rounded-md text-white">
                <b>{arg.timeText}</b>
                <span className="pl-1">{arg.event.title}</span>
              </div>
            )
          }}
        />
      </div>
    </Layout>
  )
}
