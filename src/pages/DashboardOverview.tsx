import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Kurse, Anmeldungen } from '@/types/app';
import {
  BookOpen, Users, GraduationCap, DoorOpen, ClipboardList,
  TrendingUp, CalendarDays, CheckCircle2, Clock, ArrowRight
} from 'lucide-react';
import { format, parseISO, isBefore, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Stats {
  dozenten: number;
  teilnehmer: number;
  raeume: number;
  kurse: number;
  anmeldungen: number;
  bezahlt: number;
  unbezahlt: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    dozenten: 0, teilnehmer: 0, raeume: 0, kurse: 0, anmeldungen: 0, bezahlt: 0, unbezahlt: 0,
  });
  const [upcomingKurse, setUpcomingKurse] = useState<Kurse[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();

  useEffect(() => {
    async function loadStats() {
      try {
        const [dozentenData, teilnehmerData, raeumeData, kurseData, anmeldungenData] = await Promise.all([
          LivingAppsService.getDozenten(),
          LivingAppsService.getTeilnehmer(),
          LivingAppsService.getRaeume(),
          LivingAppsService.getKurse(),
          LivingAppsService.getAnmeldungen(),
        ]);
        const bezahlt = anmeldungenData.filter((a: Anmeldungen) => a.fields.bezahlt).length;
        setStats({
          dozenten: dozentenData.length,
          teilnehmer: teilnehmerData.length,
          raeume: raeumeData.length,
          kurse: kurseData.length,
          anmeldungen: anmeldungenData.length,
          bezahlt,
          unbezahlt: anmeldungenData.length - bezahlt,
        });
        const upcoming = kurseData
          .filter((k: Kurse) => k.fields.startdatum && !isBefore(parseISO(k.fields.startdatum), today))
          .sort((a: Kurse, b: Kurse) =>
            (a.fields.startdatum || '').localeCompare(b.fields.startdatum || '')
          )
          .slice(0, 5);
        setUpcomingKurse(upcoming);
      } catch (e) {
        console.error('Failed to load stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const chartData = [
    { name: 'Dozenten', value: stats.dozenten, color: '#f59e0b' },
    { name: 'Teilnehmer', value: stats.teilnehmer, color: '#0ea5e9' },
    { name: 'Räume', value: stats.raeume, color: '#ef4444' },
    { name: 'Kurse', value: stats.kurse, color: '#6366f1' },
    { name: 'Anmeldungen', value: stats.anmeldungen, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Banner */}
      <div className="hero-banner rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">Akademie Management</p>
            <h1 className="text-4xl font-800 tracking-tight mb-3">
              Willkommen zurück
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              Verwalten Sie Kurse, Dozenten, Teilnehmer und Räume an einem zentralen Ort.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-4 text-center border border-white/20">
              <p className="text-3xl font-bold">{loading ? '—' : stats.kurse}</p>
              <p className="text-white/70 text-xs mt-1 font-medium">Kurse</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-4 text-center border border-white/20">
              <p className="text-3xl font-bold">{loading ? '—' : stats.anmeldungen}</p>
              <p className="text-white/70 text-xs mt-1 font-medium">Anmeldungen</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-4 text-center border border-white/20">
              <p className="text-3xl font-bold">{loading ? '—' : stats.bezahlt}</p>
              <p className="text-white/70 text-xs mt-1 font-medium">Bezahlt</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/kurse" className="group rounded-xl border border-border p-5 stat-card-kurs hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl icon-orb-blue flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <ArrowRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-2xl font-bold">{loading ? '—' : stats.kurse}</p>
          <p className="text-sm font-medium mt-0.5">Kurse</p>
          <p className="text-xs text-muted-foreground mt-0.5">Verfügbare Kurse</p>
        </Link>

        <Link to="/teilnehmer" className="group rounded-xl border border-border p-5 stat-card-teilnehmer hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl icon-orb-teal flex items-center justify-center">
              <Users size={18} />
            </div>
            <ArrowRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-2xl font-bold">{loading ? '—' : stats.teilnehmer}</p>
          <p className="text-sm font-medium mt-0.5">Teilnehmer</p>
          <p className="text-xs text-muted-foreground mt-0.5">Registrierte Personen</p>
        </Link>

        <Link to="/dozenten" className="group rounded-xl border border-border p-5 stat-card-dozent hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl icon-orb-amber flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <ArrowRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-2xl font-bold">{loading ? '—' : stats.dozenten}</p>
          <p className="text-sm font-medium mt-0.5">Dozenten</p>
          <p className="text-xs text-muted-foreground mt-0.5">Aktive Lehrkräfte</p>
        </Link>

        <Link to="/raeume" className="group rounded-xl border border-border p-5 stat-card-raum hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl icon-orb-red flex items-center justify-center">
              <DoorOpen size={18} />
            </div>
            <ArrowRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-2xl font-bold">{loading ? '—' : stats.raeume}</p>
          <p className="text-sm font-medium mt-0.5">Räume</p>
          <p className="text-xs text-muted-foreground mt-0.5">Verfügbare Räume</p>
        </Link>

        <Link to="/anmeldungen" className="group rounded-xl border border-border p-5 stat-card-anmeldung hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl icon-orb-purple flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <ArrowRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-2xl font-bold">{loading ? '—' : stats.anmeldungen}</p>
          <p className="text-sm font-medium mt-0.5">Anmeldungen</p>
          <p className="text-xs text-muted-foreground mt-0.5">Gesamt erfasst</p>
        </Link>
      </div>

      {/* Charts + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg icon-orb-blue flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Systemübersicht</h2>
              <p className="text-xs text-muted-foreground">Datensätze pro Bereich</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={36}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                cursor={{ fill: 'oklch(0.48 0.18 255 / 0.05)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg icon-orb-teal flex items-center justify-center">
              <CheckCircle2 size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Zahlungsstatus</h2>
              <p className="text-xs text-muted-foreground">Anmeldungen</p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : stats.anmeldungen === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ClipboardList size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Noch keine Anmeldungen</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="badge-paid rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span className="font-semibold text-sm">Bezahlt</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.bezahlt}</span>
                </div>
                {stats.anmeldungen > 0 && (
                  <div className="mt-2 h-1.5 rounded-full bg-current/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-current/60"
                      style={{ width: `${(stats.bezahlt / stats.anmeldungen) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="badge-unpaid rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span className="font-semibold text-sm">Ausstehend</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.unbezahlt}</span>
                </div>
                {stats.anmeldungen > 0 && (
                  <div className="mt-2 h-1.5 rounded-full bg-current/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-current/60"
                      style={{ width: `${(stats.unbezahlt / stats.anmeldungen) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming courses */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg icon-orb-purple flex items-center justify-center">
              <CalendarDays size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Nächste Kurse</h2>
              <p className="text-xs text-muted-foreground">Bevorstehende Veranstaltungen</p>
            </div>
          </div>
          <Link to="/kurse" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            Alle anzeigen <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : upcomingKurse.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-muted-foreground">
            <CalendarDays size={28} className="mb-2 opacity-40" />
            <p className="text-sm">Keine bevorstehenden Kurse</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {upcomingKurse.map((kurs) => {
              const startDate = kurs.fields.startdatum ? parseISO(kurs.fields.startdatum) : null;
              const isStartingToday = startDate && isToday(startDate);
              return (
                <div key={kurs.record_id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isStartingToday ? 'bg-green-500' : 'icon-orb-blue'}`}
                      style={{ backgroundColor: isStartingToday ? undefined : 'oklch(0.48 0.18 255)' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{kurs.fields.titel || '—'}</p>
                      {kurs.fields.beschreibung && (
                        <p className="text-xs text-muted-foreground truncate">{kurs.fields.beschreibung}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {kurs.fields.preis != null && (
                      <span className="text-xs font-semibold text-muted-foreground">
                        {kurs.fields.preis.toFixed(2)} €
                      </span>
                    )}
                    <div className="text-right">
                      {startDate && (
                        <p className={`text-xs font-semibold ${isStartingToday ? 'text-green-600' : 'text-primary'}`}>
                          {isStartingToday ? 'Heute' : format(startDate, 'dd. MMM yyyy', { locale: de })}
                        </p>
                      )}
                      {kurs.fields.enddatum && (
                        <p className="text-xs text-muted-foreground">
                          bis {format(parseISO(kurs.fields.enddatum), 'dd. MMM', { locale: de })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
