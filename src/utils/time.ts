export function formatTime(seconds: number): string {
  // Проверяем, что входное значение является числом и больше или равно 0
  if (typeof seconds !== "number" || seconds < 0) {
    throw new Error("Input must be a non-negative number");
  }

  if (seconds === Infinity) {
    return "Infinity";
  }

  seconds = Math.floor(seconds);

  const hours = Math.floor(seconds / 3600); // Количество полных часов
  const minutes = Math.floor((seconds % 3600) / 60); // Количество полных минут
  const remainingSeconds = seconds % 60; // Оставшиеся секунды

  let result = "";

  if (hours > 0) {
    result += `${hours}h `;
  }

  if (minutes > 0) {
    result +=
      hours > 0 ? `${String(minutes).padStart(2, "0")}m ` : `${minutes}m `;
  }

  // Добавляем секунды (всегда)
  result +=
    minutes > 0
      ? `${String(remainingSeconds).padStart(2, "0")}s`
      : `${remainingSeconds}s`;

  return result.trim();
}
