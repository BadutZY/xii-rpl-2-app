import { useCallback, useEffect, useState } from 'react';
import {
  lessonSchedule as staticLessonSchedule,
  scheduleDetails as staticScheduleDetails,
  piketSchedule as staticPiketSchedule,
  type ScheduleItem,
  type ScheduleDetail,
  type PiketItem,
} from '../data/schedule';
import { fetchSchedule, type LessonRow, type DetailRow, type PiketRow } from '../lib/scheduleApi';

export interface UseScheduleResult {
  lessonSchedule: Record<string, (ScheduleItem & { id?: number })[]>;
  scheduleDetails: Record<string, (ScheduleDetail & { id?: number })[]>;
  piketSchedule: Record<string, (PiketItem & { id?: number })[]>;
  loading: boolean;
  refetch: () => void;
}

/**
 * Semua data jadwal sekarang hidup di Supabase (bisa diedit admin), tapi kita
 * tetap render data statis dari data/schedule.ts secara instan supaya layar
 * tidak kosong menunggu network, lalu diam-diam ganti begitu data Supabase
 * datang. Kalau Supabase gagal diakses, layar tetap jalan dengan data statis
 * sebagai fallback. Sama persis logikanya dengan web/src/hooks/useSchedule.ts.
 */
export function useSchedule(): UseScheduleResult {
  const [lessons, setLessons] =
    useState<Record<string, (ScheduleItem & { id?: number })[]>>(staticLessonSchedule);
  const [details, setDetails] =
    useState<Record<string, (ScheduleDetail & { id?: number })[]>>(staticScheduleDetails);
  const [piket, setPiket] = useState<Record<string, (PiketItem & { id?: number })[]>>(staticPiketSchedule);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const bundle = await fetchSchedule();

    const hasLessons = Object.values(bundle.lessons).some((v: LessonRow[]) => v.length > 0);
    const hasDetails = Object.values(bundle.details).some((v: DetailRow[]) => v.length > 0);
    const hasPiket = Object.values(bundle.piket).some((v: PiketRow[]) => v.length > 0);

    if (hasLessons) setLessons(bundle.lessons);
    if (hasDetails) setDetails(bundle.details);
    if (hasPiket) setPiket(bundle.piket);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, version]);

  return {
    lessonSchedule: lessons,
    scheduleDetails: details,
    piketSchedule: piket,
    loading,
    refetch: () => setVersion((v) => v + 1),
  };
}
