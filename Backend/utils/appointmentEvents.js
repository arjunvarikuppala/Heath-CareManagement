const clients =
  new Set();

export const addAppointmentEventClient =
  (res) => {

    clients.add(res);

    res.write(
      `event: connected\ndata: ${JSON.stringify({
        connected: true
      })}\n\n`
    );

    return () => {
      clients.delete(res);
    };

  };

export const notifyAppointmentsChanged =
  (payload = {}) => {

    const eventPayload =
      JSON.stringify({
        changedAt:
          new Date().toISOString(),
        ...payload
      });

    clients.forEach((client) => {
      client.write(
        `event: appointments-changed\ndata: ${eventPayload}\n\n`
      );
    });

  };
