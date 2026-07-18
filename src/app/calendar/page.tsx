import { getCalendarContracts } from "@/modules/contracts/queries";
import CalendarView from "@/components/calendar/CalendarView";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const contracts = await getCalendarContracts();

  return <CalendarView contracts={contracts} />;
}
