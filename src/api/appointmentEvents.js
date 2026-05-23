const BASE_URL =
  import.meta.env.VITE_API_URL;

export const subscribeAppointmentEvents =
  (onChange) => {

    if (!BASE_URL || typeof EventSource === "undefined") {
      return () => {};
    }

    const source =
      new EventSource(
        `${BASE_URL}/common-api/appointments/stream`,
        {
          withCredentials: true
        }
      );

    source.addEventListener(
      "appointments-changed",
      (event) => {
        try {
          onChange(
            JSON.parse(event.data)
          );
        } catch {
          onChange();
        }
      }
    );

    source.onerror =
      () => {};

    return () => {
      source.close();
    };

  };
