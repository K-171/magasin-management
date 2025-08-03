'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { useLanguage } from '@/context/language-context'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CalendarPage() {
  const { t } = useLanguage()
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch('/api/calendar')
      const data = await response.json()
      setEvents(data)
      setFilteredEvents(data)
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter(event => event.extendedProps.status === statusFilter))
    }
  }, [statusFilter, events])

  return (
    <Layout title={t('calendar')}>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-end mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="En Prêt">{t('onLoan')}</SelectItem>
              <SelectItem value="En Retard">{t('overdue')}</SelectItem>
              <SelectItem value="Retourné">{t('returned')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
          headerToolbar={{
            left: isMobile ? 'prev,next' : 'prev,next today',
            center: 'title',
            right: isMobile ? 'listWeek,dayGridMonth' : 'dayGridMonth,listWeek'
          }}
          events={filteredEvents}
          eventContent={(arg) => {
            const status = arg.event.extendedProps.status;
            let backgroundColor = '#3788d8'; // Default blue
            if (status === 'Retourné') {
              backgroundColor = '#34d399'; // Green
            } else if (status === 'En Retard') {
              backgroundColor = '#ef4444'; // Red
            }

            return (
              <div style={{ backgroundColor, borderColor: backgroundColor, color: 'white'}} className="p-1 rounded-md overflow-hidden whitespace-normal">
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
