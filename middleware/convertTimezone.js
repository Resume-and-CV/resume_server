// timezoneConversion.js
const moment = require('moment-timezone')

const convertTimezone = (req, res, next) => {
  if (res.locals.results) {
    res.locals.results.forEach((row) => {
      row.session_start = moment(row.session_start)
        .tz('Europe/Helsinki')
        .toISOString()
      if (row.session_end) {
        row.session_end = moment(row.session_end)
          .tz('Europe/Helsinki')
          .toISOString()
      }
      row.expiration_time = moment(row.expiration_time)
        .tz('Europe/Helsinki')
        .toISOString()
    })
  }
  res.json(res.locals.results)
}
module.exports = convertTimezone
