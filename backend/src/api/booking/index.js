module.exports = (app) => {
  app.post(`/booking`, require('./bookingCreate'));
  app.put(`/booking/:id`, require('./bookingUpdate'));
  app.post(`/booking/import`, require('./bookingImport'));
  app.delete(`/booking`, require('./bookingDestroy'));
  app.get(
    `/booking/autocomplete`,
    require('./bookingAutocomplete'),
  );
  app.get(`/booking`, require('./bookingList'));
  app.get(`/booking/:id`, require('./bookingFind'));
};
