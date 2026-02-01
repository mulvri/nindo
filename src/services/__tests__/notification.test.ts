/**
 * Tests unitaires pour la logique de planification des notifications
 */

// Simulation simplifiée pour tester la logique de répartition
function calculateNotificationTimes(count: number, startTime: string, endTime: string) {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  
  const startTimeInMinutes = startH * 60 + startM;
  const endTimeInMinutes = endH * 60 + endM;
  const totalMinutes = endTimeInMinutes - startTimeInMinutes;
  
  if (totalMinutes <= 0) return [];

  const times = [];
  const interval = totalMinutes / count;

  for (let i = 0; i < count; i++) {
    const timeOffset = Math.floor(i * interval);
    const targetTotalMinutes = startTimeInMinutes + timeOffset;
    const hour = Math.floor(targetTotalMinutes / 60);
    const minute = targetTotalMinutes % 60;
    times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  }
  return times;
}

describe("Notification Scheduling Logic", () => {
  test("should spread 3 notifications correctly between 09:00 and 21:00", () => {
    const times = calculateNotificationTimes(3, "09:00", "21:00");
    expect(times).toHaveLength(3);
    expect(times[0]).toBe("09:00");
    expect(times[1]).toBe("13:00");
    expect(times[2]).toBe("17:00");
  });

  test("should spread 10 notifications (Ninja Way) correctly between 10:00 and 20:00", () => {
    const times = calculateNotificationTimes(10, "10:00", "20:00");
    expect(times).toHaveLength(10);
    expect(times[0]).toBe("10:00");
    expect(times[9]).toBe("19:00");
  });

  test("should handle identical start and end times", () => {
    const times = calculateNotificationTimes(5, "12:00", "12:00");
    expect(times).toHaveLength(0);
  });
});

// Mocking jest globals for the environment if not present
declare var describe: any;
declare var test: any;
declare var expect: any;
